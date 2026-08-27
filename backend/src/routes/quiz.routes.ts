import { Router } from 'express';
import * as QuizController from '../controllers/quiz.controller';

const router = Router();

router.get('/', QuizController.getQuizzes);
router.post('/', QuizController.createQuiz);
router.get('/:id', QuizController.getQuizById);
router.put('/:id', QuizController.updateQuiz);
router.delete('/:id', QuizController.deleteQuiz);

export default router;
