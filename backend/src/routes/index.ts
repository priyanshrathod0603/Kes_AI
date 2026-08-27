import { Router } from 'express';
import pdfRoutes from './pdf.routes';
import academicRoutes from './academic.routes';
import worksheetRoutes from './worksheet.routes';
import questionPaperRoutes from './questionPaper.routes';
import tutorRoutes from './tutor.routes';
import evaluationRoutes from './evaluation.routes';
import studentRoutes from './student.routes';
import reportRoutes from './report.routes';
import aiRoutes from './ai.routes';
import quizRoutes from './quiz.routes';

const router = Router();

router.use('/pdf', pdfRoutes);
router.use('/academic', academicRoutes);
router.use('/quizzes', quizRoutes);
router.use('/worksheets', worksheetRoutes);
router.use('/question-papers', questionPaperRoutes);
router.use('/tutor', tutorRoutes);
router.use('/evaluation', evaluationRoutes);
router.use('/students', studentRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);

export default router;
