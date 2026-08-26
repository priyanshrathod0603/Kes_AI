import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import * as PdfController from '../controllers/pdf.controller';

const router = Router();

router.post('/upload', upload.single('file'), PdfController.uploadPdf);
router.get('/', PdfController.getPdfList);
router.get('/:id', PdfController.getPdfById);
router.get('/:id/content', PdfController.getPdfContent);
router.get('/:id/file', PdfController.downloadPdf);
router.delete('/:id', PdfController.deletePdf);
router.get('/test/extraction', PdfController.testExtraction);

export default router;
