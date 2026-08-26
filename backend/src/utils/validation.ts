import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Class name is required').max(100, 'Class name too long'),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
    classId: z.string().uuid('Invalid class ID format'),
  }),
});

export const createChapterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Chapter name is required').max(100, 'Chapter name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    subjectId: z.string().uuid('Invalid subject ID format'),
  }),
});

export const createTopicSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Topic name is required').max(100, 'Topic name too long'),
    chapterId: z.string().uuid('Invalid chapter ID format'),
  }),
});

export const pdfUploadSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Invalid class ID format').optional(),
    subjectId: z.string().uuid('Invalid subject ID format').optional(),
    chapterId: z.string().uuid('Invalid chapter ID format').optional(),
    topicId: z.string().uuid('Invalid topic ID format').optional(),
    documentType: z.enum(['CHAPTER_MATERIAL', 'WORKSHEET', 'QUESTION_PAPER', 'ANSWER_KEY', 'STUDY_MATERIAL'], {
      errorMap: () => ({ message: 'Invalid document type' }),
    }).optional(),
  }),
});

export const pdfListQuerySchema = z.object({
  query: z.object({
    classId: z.string().uuid('Invalid class ID format').optional(),
    subjectId: z.string().uuid('Invalid subject ID format').optional(),
    chapterId: z.string().uuid('Invalid chapter ID format').optional(),
    topicId: z.string().uuid('Invalid topic ID format').optional(),
    documentType: z.enum(['CHAPTER_MATERIAL', 'WORKSHEET', 'QUESTION_PAPER', 'ANSWER_KEY', 'STUDY_MATERIAL'], {
      errorMap: () => ({ message: 'Invalid document type' }),
    }).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${errors}`,
      });
    }

    next();
  };
};

export type CreateClassInput = z.infer<typeof createClassSchema.shape.body>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema.shape.body>;
export type CreateChapterInput = z.infer<typeof createChapterSchema.shape.body>;
export type CreateTopicInput = z.infer<typeof createTopicSchema.shape.body>;
export type PdfUploadInput = z.infer<typeof pdfUploadSchema.shape.body>;
export type PdfListQueryInput = z.infer<typeof pdfListQuerySchema.shape.query>;