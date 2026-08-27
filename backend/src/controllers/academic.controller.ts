import { Request, Response } from 'express';
import { AcademicService } from '../services/academic.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import {
  validate,
  createClassSchema,
  updateClassSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createChapterSchema,
  updateChapterSchema,
  createTopicSchema,
  updateTopicSchema,
} from '../utils/validation';

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

export const updateClass = [
  validate(updateClassSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name } = req.body;
      const updated = await academicService.updateClass(id, name);
      return sendSuccess(res, 'Class updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await academicService.deleteClass(id);
    return sendSuccess(res, 'Class deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const classId = req.query.classId as string | undefined;
    const subjects = await academicService.getSubjects(classId);
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

export const updateSubject = [
  validate(updateSubjectSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name, classId } = req.body;
      const updated = await academicService.updateSubject(id, name, classId);
      return sendSuccess(res, 'Subject updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await academicService.deleteSubject(id);
    return sendSuccess(res, 'Subject deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const getChapters = async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subjectId as string | undefined;
    const chapters = await academicService.getChapters(subjectId);
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

export const updateChapter = [
  validate(updateChapterSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name, description, subjectId } = req.body;
      const updated = await academicService.updateChapter(id, name, description, subjectId);
      return sendSuccess(res, 'Chapter updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await academicService.deleteChapter(id);
    return sendSuccess(res, 'Chapter deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};

export const getTopics = async (req: Request, res: Response) => {
  try {
    const chapterId = req.query.chapterId as string | undefined;
    const topics = await academicService.getTopics(chapterId);
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

export const updateTopic = [
  validate(updateTopicSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { name, chapterId } = req.body;
      const updated = await academicService.updateTopic(id, name, chapterId);
      return sendSuccess(res, 'Topic updated', { data: updated });
    } catch (error) {
      return sendError(res, (error as Error).message);
    }
  },
];

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await academicService.deleteTopic(id);
    return sendSuccess(res, 'Topic deleted');
  } catch (error) {
    return sendError(res, (error as Error).message);
  }
};
