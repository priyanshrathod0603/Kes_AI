import { Router } from 'express';
import * as AcademicController from '../controllers/academic.controller';

const router = Router();

router.get('/', AcademicController.getClasses);
router.post('/', AcademicController.createClass);
router.get('/subjects', AcademicController.getSubjects);
router.post('/subjects', AcademicController.createSubject);
router.get('/chapters', AcademicController.getChapters);
router.post('/chapters', AcademicController.createChapter);
router.get('/topics', AcademicController.getTopics);
router.post('/topics', AcademicController.createTopic);

export default router;
