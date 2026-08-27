import { Router, Request, Response } from 'express';
import { worksheetService } from '../services/worksheet.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import prisma from '../config/database';

const router = Router();

/**
 * POST /api/worksheets/analyze-pdf
 * Analyzes study material text and extracts curriculum insights
 */
router.post('/analyze-pdf', async (req: Request, res: Response) => {
  try {
    const { extractedText, fileName, documentId } = req.body;
    let textToAnalyze = extractedText;

    if (documentId && !textToAnalyze) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
      });
      if (!doc) {
        return sendError(res, 'Study material document not found', 404);
      }
      textToAnalyze = doc.extractedText || '';
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return sendError(res, 'No text available in the selected study material to analyze', 400);
    }

    const analysis = await worksheetService.analyzeContent(textToAnalyze, fileName);
    return sendSuccess(res, 'Study material analyzed successfully', { data: analysis });
  } catch (error) {
    console.error('[Worksheet API] Analysis failed:', error);
    return sendError(res, (error as Error).message || 'Failed to analyze study material');
  }
});

/**
 * POST /api/worksheets/generate
 * Generates structured worksheet using AI
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      sourceContent,
      documentId,
      className,
      subjectName,
      chapterName,
      topicName,
      worksheetNumber,
      examName,
      academicYear,
      questionCount,
      difficulty,
      questionTypes,
    } = req.body;

    let content = sourceContent;
    if (documentId && !content) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
      });
      if (doc && doc.extractedText) {
        content = doc.extractedText;
      }
    }

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Source study material content is required', 400);
    }

    const worksheet = await worksheetService.generateWorksheet({
      sourceContent: content,
      className,
      subjectName,
      chapterName,
      topicName,
      worksheetNumber,
      examName,
      academicYear,
      questionCount: Number(questionCount) || 5,
      difficulty,
      questionTypes,
    });

    return sendSuccess(res, 'Worksheet generated successfully', { data: worksheet });
  } catch (error) {
    console.error('[Worksheet API] Generation failed:', error);
    return sendError(res, (error as Error).message || 'Failed to generate worksheet');
  }
});

/**
 * POST /api/worksheets/export/pdf
 * Generates and downloads real printable PDF
 */
router.post('/export/pdf', async (req: Request, res: Response) => {
  try {
    const { worksheetData } = req.body;
    if (!worksheetData || !worksheetData.questions) {
      return sendError(res, 'Invalid worksheet data', 400);
    }

    const pdfBytes = await worksheetService.generatePdf(worksheetData);
    const filename = `${worksheetData.subjectName || 'Worksheet'}_${worksheetData.className || 'SRKG'}_${worksheetData.examName || 'FA1'}.pdf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('[Worksheet API] PDF Export error:', error);
    return sendError(res, (error as Error).message || 'Failed to export PDF');
  }
});

/**
 * POST /api/worksheets/export/docx
 * Generates and downloads real editable DOCX
 */
router.post('/export/docx', async (req: Request, res: Response) => {
  try {
    const { worksheetData } = req.body;
    if (!worksheetData || !worksheetData.questions) {
      return sendError(res, 'Invalid worksheet data', 400);
    }

    const docxBuffer = await worksheetService.generateDocx(worksheetData);
    const filename = `${worksheetData.subjectName || 'Worksheet'}_${worksheetData.className || 'SRKG'}_${worksheetData.examName || 'FA1'}.docx`.replace(/\s+/g, '_');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);
    return res.send(docxBuffer);
  } catch (error) {
    console.error('[Worksheet API] DOCX Export error:', error);
    return sendError(res, (error as Error).message || 'Failed to export DOCX');
  }
});

/**
 * POST /api/worksheets/save
 * Saves worksheet to database
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { worksheetData, documentId } = req.body;
    if (!worksheetData) {
      return sendError(res, 'Worksheet data is required', 400);
    }

    const saved = await worksheetService.saveWorksheet(worksheetData, documentId);
    return sendSuccess(res, 'Worksheet saved to history', { data: saved });
  } catch (error) {
    console.error('[Worksheet API] Save error:', error);
    return sendError(res, (error as Error).message || 'Failed to save worksheet');
  }
});

/**
 * GET /api/worksheets
 * List saved worksheets
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await worksheetService.getAllWorksheets();
    return sendSuccess(res, 'Worksheets retrieved', { data: list });
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to retrieve worksheets');
  }
});

/**
 * GET /api/worksheets/:id
 * Retrieve saved worksheet by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const worksheet = await worksheetService.getWorksheetById(req.params.id);
    if (!worksheet) {
      return sendError(res, 'Worksheet not found', 404);
    }
    return sendSuccess(res, 'Worksheet retrieved', { data: worksheet });
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to retrieve worksheet');
  }
});

/**
 * DELETE /api/worksheets/:id
 * Delete saved worksheet
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await worksheetService.deleteWorksheet(req.params.id);
    return sendSuccess(res, 'Worksheet deleted');
  } catch (error) {
    return sendError(res, (error as Error).message || 'Failed to delete worksheet');
  }
});

export default router;
