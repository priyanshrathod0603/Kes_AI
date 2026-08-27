import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { validate, createQuizSchema, updateQuizSchema } from '../utils/validation';

const quizService = new QuizService();

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subjectId as string | undefined;
    const chapterId = req.query.chapterId as string | undefined;
    const quizzes = await quizService.getQuizzes({ subjectId, chapterId });
    return sendSuccess(res, 'Quizzes retrieved', { data: quizzes });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const quiz = await quizService.getQuizById(id);
    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }
    return sendSuccess(res, 'Quiz retrieved', { data: quiz });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const createQuiz = [
  validate(createQuizSchema),
  async (req: Request, res: Response) => {
    try {
      const { title, description, subjectId, chapterId, questions } = req.body;
      const newQuiz = await quizService.createQuiz({
        title,
        description,
        subjectId,
        chapterId,
        questions,
      });
      return sendSuccess(res, 'Quiz created', { data: newQuiz });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const updateQuiz = [
  validate(updateQuizSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { title, description, subjectId, chapterId, questions } = req.body;
      const updated = await quizService.updateQuiz(id, {
        title,
        description,
        subjectId,
        chapterId,
        questions,
      });
      return sendSuccess(res, 'Quiz updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await quizService.deleteQuiz(id);
    return sendSuccess(res, 'Quiz deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};
