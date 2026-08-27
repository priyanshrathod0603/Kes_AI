import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Class name is required').max(100, 'Class name too long'),
  }),
});

export const updateClassSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Class ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Class name is required').max(100, 'Class name too long'),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
    classId: z.string().min(1, 'Invalid class ID'),
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Subject ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
    classId: z.string().min(1, 'Invalid class ID').optional(),
  }),
});

export const createChapterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Chapter name is required').max(100, 'Chapter name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    subjectId: z.string().min(1, 'Invalid subject ID'),
  }),
});

export const updateChapterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Chapter ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Chapter name is required').max(100, 'Chapter name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    subjectId: z.string().min(1, 'Invalid subject ID').optional(),
  }),
});

export const createTopicSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Topic name is required').max(100, 'Topic name too long'),
    chapterId: z.string().min(1, 'Invalid chapter ID'),
  }),
});

export const updateTopicSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Topic ID is required'),
  }),
  body: z.object({
    name: z.string().min(1, 'Topic name is required').max(100, 'Topic name too long'),
    chapterId: z.string().min(1, 'Invalid chapter ID').optional(),
  }),
});

export const updatePdfMetadataSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Document ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
    classId: z.string().optional().nullable(),
    subjectId: z.string().optional().nullable(),
    chapterId: z.string().optional().nullable(),
    topicId: z.string().optional().nullable(),
    documentType: z.enum(['CHAPTER_MATERIAL', 'WORKSHEET', 'QUESTION_PAPER', 'ANSWER_KEY', 'STUDY_MATERIAL']).optional(),
  }),
});

export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Quiz title is required').max(200, 'Title too long'),
    description: z.string().max(1000).optional().nullable(),
    subjectId: z.string().optional().nullable(),
    chapterId: z.string().optional().nullable(),
    questions: z.array(
      z.object({
        questionText: z.string().min(1, 'Question text is required'),
        optionA: z.string().min(1, 'Option A is required'),
        optionB: z.string().min(1, 'Option B is required'),
        optionC: z.string().min(1, 'Option C is required'),
        optionD: z.string().min(1, 'Option D is required'),
        correctOption: z.enum(['A', 'B', 'C', 'D']),
        explanation: z.string().optional().nullable(),
      })
    ).optional(),
  }),
});

export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Quiz ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Quiz title is required').max(200, 'Title too long').optional(),
    description: z.string().max(1000).optional().nullable(),
    subjectId: z.string().optional().nullable(),
    chapterId: z.string().optional().nullable(),
    questions: z.array(
      z.object({
        id: z.string().optional(),
        questionText: z.string().min(1, 'Question text is required'),
        optionA: z.string().min(1, 'Option A is required'),
        optionB: z.string().min(1, 'Option B is required'),
        optionC: z.string().min(1, 'Option C is required'),
        optionD: z.string().min(1, 'Option D is required'),
        correctOption: z.enum(['A', 'B', 'C', 'D']),
        explanation: z.string().optional().nullable(),
      })
    ).optional(),
  }),
});

export const pdfUploadSchema = z.object({
  body: z.object({
    classId: z.string().optional(),
    subjectId: z.string().optional(),
    chapterId: z.string().optional(),
    topicId: z.string().optional(),
    documentType: z.enum(['CHAPTER_MATERIAL', 'WORKSHEET', 'QUESTION_PAPER', 'ANSWER_KEY', 'STUDY_MATERIAL'], {
      errorMap: () => ({ message: 'Invalid document type' }),
    }).optional(),
  }),
});

export const pdfListQuerySchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    subjectId: z.string().optional(),
    chapterId: z.string().optional(),
    topicId: z.string().optional(),
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