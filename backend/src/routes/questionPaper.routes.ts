import { Router, Request, Response } from 'express';
import { questionPaperService } from '../services/questionPaper.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import prisma from '../config/database';
import { extractPdfText } from '../pdf/extraction/pdf-extraction.service';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * POST /api/question-papers/generate
 * Generates structured question paper using AI
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      sourceWorksheetIds = [],
      sourceWorksheetTexts = [],
      sourceDocumentIds = [],
      studyMaterialIds = [],
      studyMaterialId,
      studyMaterialText,
      className,
      subjectName,
      examName,
      academicYear,
      totalMarks,
      duration,
      questionCount,
      difficulty,
      teacherPrompt,
    } = req.body;

    const aggregatedWorksheetTexts: string[] = [...sourceWorksheetTexts];
    const aggregatedStudyTexts: string[] = [];

    // 1. Process Source Worksheets
    if (Array.isArray(sourceWorksheetIds) && sourceWorksheetIds.length > 0) {
      const worksheets = await prisma.worksheet.findMany({
        where: { id: { in: sourceWorksheetIds } },
      });
      for (const w of worksheets) {
        try {
          const parsed = JSON.parse(w.contentJson);
          const qList = parsed.questions
            ?.map((q: any) => `Q.${q.number}: ${q.instruction} ${q.items ? q.items.join('; ') : ''}`)
            .join('\n');
          aggregatedWorksheetTexts.push(
            `Worksheet: ${w.title} (${w.subjectName} - ${w.className})\n${qList}`
          );
        } catch (e) {
          aggregatedWorksheetTexts.push(`Worksheet: ${w.title} (${w.subjectName} - ${w.className})`);
        }
      }
    }

    // 2. Aggregate Document IDs
    const rawDocIds = [
      ...(Array.isArray(sourceDocumentIds) ? sourceDocumentIds : []),
      ...(Array.isArray(studyMaterialIds) ? studyMaterialIds : []),
      ...(studyMaterialId ? [studyMaterialId] : []),
    ].filter(Boolean);

    const docIds = Array.from(new Set(rawDocIds));
    const storageBaseDir = path.join(process.cwd(), 'storage', 'pdfs');

    if (docIds.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: docIds } },
      });

      if (docs.length === 0 && aggregatedWorksheetTexts.length === 0 && !studyMaterialText) {
        return sendError(res, 'Selected study material document could not be found.', 404);
      }

      for (const doc of docs) {
        if (doc.extractedText && doc.extractedText.trim().length > 0) {
          aggregatedStudyTexts.push(`Document (${doc.title}):\n${doc.extractedText}`);
        } else if (doc.filePath && fs.existsSync(doc.filePath)) {
          // On-demand extraction attempt
          try {
            console.log(`[Question Paper API] Running on-demand extraction for document: ${doc.title}`);
            const extractOutcome = await extractPdfText(doc.filePath, storageBaseDir);
            if ('text' in extractOutcome && extractOutcome.text) {
              await prisma.document.update({
                where: { id: doc.id },
                data: {
                  extractedText: extractOutcome.text,
                  extractionStatus: 'COMPLETED',
                  characterCount: extractOutcome.characterCount,
                  pageCount: extractOutcome.pageCount,
                  extractedAt: new Date(),
                },
              });
              aggregatedStudyTexts.push(`Document (${doc.title}):\n${extractOutcome.text}`);
            }
          } catch (extractErr) {
            console.warn(`[Question Paper API] Extraction failed on demand for ${doc.title}:`, extractErr);
          }
        }
      }
    }

    // 3. Include direct text if passed from client (e.g. fresh in-memory upload)
    if (studyMaterialText && studyMaterialText.trim().length > 0) {
      aggregatedStudyTexts.push(studyMaterialText.trim());
    }

    // 4. Source Validation
    if (aggregatedWorksheetTexts.length === 0 && aggregatedStudyTexts.length === 0) {
      if (docIds.length > 0) {
        return sendError(
          res,
          'The selected study material contains no readable text. Please upload a PDF with extractable text or choose another document.',
          400
        );
      }
      return sendError(
        res,
        'No source material selected. Please upload a reference PDF or select at least one study material / worksheet.',
        400
      );
    }

    const combinedStudyText = aggregatedStudyTexts.join('\n\n');

    const qp = await questionPaperService.generateQuestionPaper({
      sourceWorksheetTexts: aggregatedWorksheetTexts,
      studyMaterialText: combinedStudyText,
      className,
      subjectName,
      examName,
      academicYear,
      totalMarks: Number(totalMarks) || 25,
      duration: duration || '1 Hour',
      questionCount: Number(questionCount) || 5,
      difficulty,
      teacherPrompt,
    });

    return sendSuccess(res, 'Question paper generated successfully', { data: qp });
  } catch (error) {
    console.error('[Question Paper API] Generation failed:', error);
    return sendError(res, (error as Error).message || 'Failed to generate question paper');
  }
});

/**
 * POST /api/question-papers/export/pdf
 * Generates and downloads real printable examination PDF
 */
router.post('/export/pdf', async (req: Request, res: Response) => {
  try {
    const { questionPaperData } = req.body;
    if (!questionPaperData || !questionPaperData.questions) {
      return sendError(res, 'Invalid question paper data', 400);
    }

    const pdfBytes = await questionPaperService.generatePdf(questionPaperData);
    const filename = `${questionPaperData.subjectName || 'QuestionPaper'}_${questionPaperData.className || 'SRKG'}_${questionPaperData.examName || 'Exam'}.pdf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('[Question Paper API] PDF Export error:', error);
    return sendError(res, (error as Error).message || 'Failed to export PDF');
  }
});

/**
 * POST /api/question-papers/export/docx
 * Generates and downloads real editable DOCX
 */
router.post('/export/docx', async (req: Request, res: Response) => {
  try {
    const { questionPaperData } = req.body;
    if (!questionPaperData || !questionPaperData.questions) {
      return sendError(res, 'Invalid question paper data', 400);
    }

    const docxBuffer = await questionPaperService.generateDocx(questionPaperData);
    const filename = `${questionPaperData.subjectName || 'QuestionPaper'}_${questionPaperData.className || 'SRKG'}_${questionPaperData.examName || 'Exam'}.docx`.replace(/\s+/g, '_');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);
    return res.send(docxBuffer);
  } catch (error) {
    console.error('[Question Paper API] DOCX Export error:', error);
    return sendError(res, (error as Error).message || 'Failed to export DOCX');
  }
});

/**
 * POST /api/question-papers/save
 * Saves question paper to database
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { questionPaperData } = req.body;
    if (!questionPaperData) {
      return sendError(res, 'Question paper data is required', 400);
    }

    const saved = await questionPaperService.saveQuestionPaper(questionPaperData);
    return sendSuccess(res, 'Question paper saved to history', { data: saved });
  } catch (error) {
    console.error('[Question Paper API] Save error:', error);
    return sendError(res, (error as Error).message || 'Failed to save question paper');
  }
});

/**
 * GET /api/question-papers
 * List saved question papers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await questionPaperService.getAllQuestionPapers();
    return sendSuccess(res, 'Question papers retrieved', { data: list });
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to retrieve question papers');
  }
});

/**
 * GET /api/question-papers/:id
 * Retrieve saved question paper by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const qp = await questionPaperService.getQuestionPaperById(req.params.id);
    if (!qp) {
      return sendError(res, 'Question paper not found', 404);
    }
    return sendSuccess(res, 'Question paper retrieved', { data: qp });
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to retrieve question paper');
  }
});

/**
 * DELETE /api/question-papers/:id
 * Delete saved question paper
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await questionPaperService.deleteQuestionPaper(req.params.id);
    return sendSuccess(res, 'Question paper deleted');
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to delete question paper');
  }
});

export default router;
