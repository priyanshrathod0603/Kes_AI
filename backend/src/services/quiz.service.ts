import prisma from '../config/database';

export class QuizService {
  async getQuizzes(params?: { subjectId?: string; chapterId?: string }) {
    return await prisma.quiz.findMany({
      where: {
        ...(params?.subjectId ? { subjectId: params.subjectId } : {}),
        ...(params?.chapterId ? { chapterId: params.chapterId } : {}),
      },
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getQuizById(id: string) {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  }

  async createQuiz(data: {
    title: string;
    description?: string | null;
    subjectId?: string | null;
    chapterId?: string | null;
    questions?: Array<{
      questionText: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      explanation?: string | null;
    }>;
  }) {
    return await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        subjectId: data.subjectId,
        chapterId: data.chapterId,
        questions: data.questions
          ? {
              create: data.questions.map((q) => ({
                questionText: q.questionText,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                explanation: q.explanation,
              })),
            }
          : undefined,
      },
      include: {
        questions: true,
      },
    });
  }

  async updateQuiz(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      subjectId?: string | null;
      chapterId?: string | null;
      questions?: Array<{
        id?: string;
        questionText: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctOption: string;
        explanation?: string | null;
      }>;
    }
  ) {
    const exists = await prisma.quiz.findUnique({ where: { id } });
    if (!exists) throw new Error('Quiz not found');

    return await prisma.$transaction(async (tx) => {
      // If questions are provided, replace them
      if (data.questions !== undefined) {
        await tx.quizQuestion.deleteMany({ where: { quizId: id } });
        if (data.questions && data.questions.length > 0) {
          await tx.quizQuestion.createMany({
            data: data.questions.map((q) => ({
              quizId: id,
              questionText: q.questionText,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctOption: q.correctOption,
              explanation: q.explanation,
            })),
          });
        }
      }

      return await tx.quiz.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.subjectId !== undefined ? { subjectId: data.subjectId } : {}),
          ...(data.chapterId !== undefined ? { chapterId: data.chapterId } : {}),
        },
        include: {
          questions: true,
        },
      });
    });
  }

  async deleteQuiz(id: string) {
    const exists = await prisma.quiz.findUnique({ where: { id } });
    if (!exists) throw new Error('Quiz not found');

    return await prisma.quiz.delete({
      where: { id },
    });
  }
}
