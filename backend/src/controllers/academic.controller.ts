import { Request, Response } from 'express';
import { AcademicService } from '../services/academic.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { validate, createClassSchema, createSubjectSchema, createChapterSchema, createTopicSchema } from '../utils/validation';

const academicService = new AcademicService();

export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await academicService.getClasses();
    return sendSuccess(res, 'Classes retrieved', { data: classes });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const createClass = [
  validate(createClassSchema),
  async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const newClass = await academicService.createClass(name);
      return sendSuccess(res, 'Class created', { data: newClass });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await academicService.getSubjects();
    return sendSuccess(res, 'Subjects retrieved', { data: subjects });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const createSubject = [
  validate(createSubjectSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, classId } = req.body;
      const newSubject = await academicService.createSubject(name, classId);
      return sendSuccess(res, 'Subject created', { data: newSubject });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const getChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await academicService.getChapters();
    return sendSuccess(res, 'Chapters retrieved', { data: chapters });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const createChapter = [
  validate(createChapterSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, description, subjectId } = req.body;
      const newChapter = await academicService.createChapter(name, description, subjectId);
      return sendSuccess(res, 'Chapter created', { data: newChapter });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const getTopics = async (req: Request, res: Response) => {
  try {
    const topics = await academicService.getTopics();
    return sendSuccess(res, 'Topics retrieved', { data: topics });
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const createTopic = [
  validate(createTopicSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, chapterId } = req.body;
      const newTopic = await academicService.createTopic(name, chapterId);
      return sendSuccess(res, 'Topic created', { data: newTopic });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];
