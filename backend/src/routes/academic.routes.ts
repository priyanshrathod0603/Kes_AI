import { Router } from 'express';
import * as AcademicController from '../controllers/academic.controller';

const router = Router();

// Classes CRUD
router.get('/', AcademicController.getClasses);
router.post('/', AcademicController.createClass);
router.put('/:id', AcademicController.updateClass);
router.delete('/:id', AcademicController.deleteClass);

// Subjects CRUD
router.get('/subjects', AcademicController.getSubjects);
router.post('/subjects', AcademicController.createSubject);
router.put('/subjects/:id', AcademicController.updateSubject);
router.delete('/subjects/:id', AcademicController.deleteSubject);

// Chapters CRUD
router.get('/chapters', AcademicController.getChapters);
router.post('/chapters', AcademicController.createChapter);
router.put('/chapters/:id', AcademicController.updateChapter);
router.delete('/chapters/:id', AcademicController.deleteChapter);

// Topics CRUD
router.get('/topics', AcademicController.getTopics);
router.post('/topics', AcademicController.createTopic);
router.put('/topics/:id', AcademicController.updateTopic);
router.delete('/topics/:id', AcademicController.deleteTopic);

export default router;
