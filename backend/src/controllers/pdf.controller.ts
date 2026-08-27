import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { validate, pdfUploadSchema, pdfListQuerySchema, updatePdfMetadataSchema } from '../utils/validation';
import fs from 'fs';
import { extractPdfText } from '../pdf/extraction/pdf-extraction.service';
import path from 'path';

const pdfService = new PdfService();

export const uploadPdf = [
  validate(pdfUploadSchema),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const file = req.file as Express.Multer.File;

      // Validation
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return sendError(res, 'Only PDF files are allowed', 400);
      }

      const metadata = {
        classId: req.body.classId,
        subjectId: req.body.subjectId,
        chapterId: req.body.chapterId,
        topicId: req.body.topicId,
        documentType: req.body.documentType,
      };

      const result = await pdfService.uploadPdf(file, metadata);
      return sendSuccess(res, result.message, { data: result.doc });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const getPdfList = [
  validate(pdfListQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const filters = {
        classId: req.query.classId as string,
        subjectId: req.query.subjectId as string,
        chapterId: req.query.chapterId as string,
        topicId: req.query.topicId as string,
        documentType: req.query.documentType as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await pdfService.getAllDocuments(filters);
      return sendSuccess(res, 'Documents retrieved', { data: result });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const getPdfById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await pdfService.getDocById(id);
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }
    return sendSuccess(res, 'Document retrieved', { data: doc });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const downloadPdf = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await pdfService.getDocFilePath(id);
    
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    // Verify physical file exists
    if (!fs.existsSync(doc.filePath)) {
      return sendError(res, 'File not found on disk', 404);
    }

    // Set headers for file download/view
    res.setHeader('Content-Type', doc.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(doc.filePath);
    fileStream.pipe(res);
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const updatePdf = [
  validate(updatePdfMetadataSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const metadata = {
        title: req.body.title,
        documentType: req.body.documentType,
        classId: req.body.classId,
        subjectId: req.body.subjectId,
        chapterId: req.body.chapterId,
        topicId: req.body.topicId,
      };
      const updated = await pdfService.updateDocMetadata(id, metadata);
      return sendSuccess(res, 'Document updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deletePdf = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await pdfService.deleteDoc(id);
    return sendSuccess(res, 'Document deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const getPdfContent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await pdfService.getDocContent(id);
    
    if (!doc) {
      return sendError(res, 'Document not found', 404);
    }

    return sendSuccess(res, 'Document content retrieved', {
      data: {
        documentId: doc.id,
        extractionStatus: doc.extractionStatus,
        pageCount: doc.pageCount,
        characterCount: doc.characterCount,
        extractedAt: doc.extractedAt,
        text: doc.extractedText,
        extractionError: doc.extractionError,
      },
    });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const testExtraction = async (req: Request, res: Response) => {
  try {
    const storageBaseDir = path.join(process.cwd(), 'storage', 'pdfs');
    const filePath = '/Users/priyansh/kes_ai_tutor/krishan-school-ai/backend/storage/pdfs/d489ea82-d1b2-46b2-a884-66f9992bf0ee.pdf';
    
    console.log('[Test] Calling extractPdfText directly');
    const result = await extractPdfText(filePath, storageBaseDir);
    console.log('[Test] Result:', JSON.stringify(result, null, 2));
    
    return sendSuccess(res, 'Extraction test completed', { data: result });
  } catch (error) {
    console.error('[Test] Error:', error);
    return sendError(res, 'Test failed', 500);
  }
};
