import prisma from '../config/database';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { extractPdfText, ExtractionStatus, EXTRACTION_STATUS } from '../pdf/extraction/pdf-extraction.service';

export class PdfService {
  private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'pdfs');

  async uploadPdf(
    file: Express.Multer.File,
    metadata: {
      classId?: string;
      subjectId?: string;
      chapterId?: string;
      topicId?: string;
      documentType?: string;
    }
  ) {
    // Validate academic hierarchy if provided
    if (metadata.classId) {
      const classExists = await prisma.schoolClass.findUnique({ where: { id: metadata.classId } });
      if (!classExists) throw new Error('Class not found');
    }

    if (metadata.subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: metadata.subjectId } });
      if (!subject) throw new Error('Subject not found');
      if (metadata.classId && subject.classId !== metadata.classId) {
        throw new Error('Subject does not belong to the specified class');
      }
    }

    if (metadata.chapterId) {
      const chapter = await prisma.chapter.findUnique({ where: { id: metadata.chapterId }, include: { subject: true } });
      if (!chapter) throw new Error('Chapter not found');
      if (metadata.subjectId && chapter.subjectId !== metadata.subjectId) {
        throw new Error('Chapter does not belong to the specified subject');
      }
      if (metadata.classId && chapter.subject.classId !== metadata.classId) {
        throw new Error('Chapter does not belong to the specified class');
      }
    }

    if (metadata.topicId) {
      const topic = await prisma.topic.findUnique({ where: { id: metadata.topicId }, include: { chapter: { include: { subject: true } } } });
      if (!topic) throw new Error('Topic not found');
      if (metadata.chapterId && topic.chapterId !== metadata.chapterId) {
        throw new Error('Topic does not belong to the specified chapter');
      }
      if (metadata.subjectId && topic.chapter.subjectId !== metadata.subjectId) {
        throw new Error('Topic does not belong to the specified subject');
      }
      if (metadata.classId && topic.chapter.subject.classId !== metadata.classId) {
        throw new Error('Topic does not belong to the specified class');
      }
    }

    let doc;
    try {
      doc = await prisma.document.create({
        data: {
          title: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
          documentType: metadata.documentType as any || 'STUDY_MATERIAL',
          schoolClassId: metadata.classId,
          subjectId: metadata.subjectId,
          chapterId: metadata.chapterId,
          topicId: metadata.topicId,
          // Initialize extraction status
          extractionStatus: EXTRACTION_STATUS.PENDING,
        },
      });
    } catch (error) {
      // Clean up uploaded file if database insertion fails
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }

    // Start extraction asynchronously (non-blocking)
    // We don't await this to keep upload fast
    this.extractTextAsync(doc.id, file.path).catch(err => {
      console.error('[PDF Service] Uncaught extraction error:', err);
    });

    return {
      success: true,
      message: 'File uploaded successfully. Text extraction started.',
      doc: {
        ...doc,
        extractionStatus: EXTRACTION_STATUS.PROCESSING, // Indicate processing will start
      },
    };
  }

  /** 
   * Asynchronously extract text from PDF and update database.
   * This runs in the background without blocking the upload response.
   */
  private async extractTextAsync(documentId: string, filePath: string): Promise<void> {
    console.log('[PDF Service] Starting extraction for document:', documentId, 'file:', filePath);
    // Update status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { extractionStatus: EXTRACTION_STATUS.PROCESSING },
    });

    try {
      console.log('[PDF Service] Calling extractPdfText with filePath:', filePath, 'storageBaseDir:', this.storageBaseDir);
      const result = await extractPdfText(filePath, this.storageBaseDir);

      console.log('[PDF Service] Extraction result:', JSON.stringify(result, null, 2));

      if ('success' in result && result.success === false) {
        // Extraction failed - update status with error
        await prisma.document.update({
          where: { id: documentId },
          data: {
            extractionStatus: result.code === 'NO_TEXT' ? EXTRACTION_STATUS.NO_TEXT : EXTRACTION_STATUS.FAILED,
            extractionError: result.error,
            extractedAt: new Date(),
          },
        });
        return;
      }

      // Success - update with extracted content
      const extractionResult = result as Awaited<ReturnType<typeof extractPdfText>> & { success: true };
      
      // For very large texts, we might want to truncate stored text
      // But for now, store the full text (SQLite TEXT can handle large content)
      const maxTextLength = 100000; // 100KB limit for stored text
      const storedText = extractionResult.text.length > maxTextLength
        ? extractionResult.text.slice(0, maxTextLength) + '\n... [truncated]'
        : extractionResult.text;

      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: EXTRACTION_STATUS.COMPLETED,
          extractedText: storedText,
          pageCount: extractionResult.pageCount,
          characterCount: extractionResult.characterCount,
          extractedAt: new Date(),
          extractionError: null,
        },
      });
    } catch (error) {
      // Unexpected error during extraction
      console.error('[PDF Service] Unexpected extraction error:', error);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: EXTRACTION_STATUS.FAILED,
          extractionError: `Unexpected extraction error: ${(error as Error).message}`,
          extractedAt: new Date(),
        },
      });
    }
  }

  async getAllDocuments(filters: {
    classId?: string;
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
    documentType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {};

    if (filters.classId) where.schoolClassId = filters.classId;
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.chapterId) where.chapterId = filters.chapterId;
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.documentType) where.documentType = filters.documentType as any;

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          documentType: true,
          processed: true,
          createdAt: true,
          updatedAt: true,
          schoolClassId: true,
          subjectId: true,
          chapterId: true,
          topicId: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocById(id: string) {
    return await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileName: true,
        filePath: true,
        fileType: true,
        fileSize: true,
        documentType: true,
        processed: true,
        extractedText: true,
        createdAt: true,
        updatedAt: true,
        schoolClassId: true,
        subjectId: true,
        chapterId: true,
        topicId: true,
      },
    });
  }

  async getDocFilePath(id: string) {
    const doc = await prisma.document.findUnique({
      where: { id },
      select: { filePath: true, fileName: true, fileType: true },
    });
    return doc;
  }

  async updateDocMetadata(
    id: string,
    metadata: {
      title?: string;
      documentType?: string;
      classId?: string | null;
      subjectId?: string | null;
      chapterId?: string | null;
      topicId?: string | null;
    }
  ) {
    const exists = await prisma.document.findUnique({ where: { id } });
    if (!exists) throw new Error('Document not found');

    return await prisma.document.update({
      where: { id },
      data: {
        ...(metadata.title !== undefined ? { title: metadata.title } : {}),
        ...(metadata.documentType !== undefined ? { documentType: metadata.documentType } : {}),
        ...(metadata.classId !== undefined ? { schoolClassId: metadata.classId } : {}),
        ...(metadata.subjectId !== undefined ? { subjectId: metadata.subjectId } : {}),
        ...(metadata.chapterId !== undefined ? { chapterId: metadata.chapterId } : {}),
        ...(metadata.topicId !== undefined ? { topicId: metadata.topicId } : {}),
      },
    });
  }

  async deleteDoc(id: string) {
    // Get document first to delete the physical file
    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (doc && fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await prisma.document.delete({
      where: { id },
    });
  }

  async getDocContent(id: string) {
    return await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        documentType: true,
        processed: true,
        extractedText: true,
        extractionStatus: true,
        extractionError: true,
        extractedAt: true,
        pageCount: true,
        characterCount: true,
        createdAt: true,
        updatedAt: true,
        schoolClassId: true,
        subjectId: true,
        chapterId: true,
        topicId: true,
      },
    });
  }
}
