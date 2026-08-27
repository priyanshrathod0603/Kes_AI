import prisma from '../config/database';

export class AcademicService {
  async getClasses() {
    return await prisma.schoolClass.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createClass(name: string) {
    return await prisma.schoolClass.create({
      data: {
        name,
      },
    });
  }

  async updateClass(id: string, name: string) {
    const exists = await prisma.schoolClass.findUnique({ where: { id } });
    if (!exists) throw new Error('Class not found');

    return await prisma.schoolClass.update({
      where: { id },
      data: { name },
    });
  }

  async deleteClass(id: string) {
    const exists = await prisma.schoolClass.findUnique({ where: { id } });
    if (!exists) throw new Error('Class not found');

    return await prisma.$transaction(async (tx) => {
      // Find all subjects
      const subjects = await tx.subject.findMany({ where: { classId: id } });
      const subjectIds = subjects.map((s) => s.id);

      // Find all chapters
      const chapters = await tx.chapter.findMany({ where: { subjectId: { in: subjectIds } } });
      const chapterIds = chapters.map((c) => c.id);

      // Delete topics
      await tx.topic.deleteMany({ where: { chapterId: { in: chapterIds } } });

      // Delete documents linked to class/subjects/chapters
      await tx.document.deleteMany({
        where: {
          OR: [
            { schoolClassId: id },
            { subjectId: { in: subjectIds } },
            { chapterId: { in: chapterIds } },
          ],
        },
      });

      // Delete chapters
      await tx.chapter.deleteMany({ where: { id: { in: chapterIds } } });

      // Delete subjects
      await tx.subject.deleteMany({ where: { id: { in: subjectIds } } });

      // Delete class
      return await tx.schoolClass.delete({ where: { id } });
    });
  }

  async getSubjects(classId?: string) {
    return await prisma.subject.findMany({
      where: classId ? { classId } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createSubject(name: string, classId: string) {
    // Verify class exists
    const classExists = await prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      throw new Error('Class not found');
    }

    return await prisma.subject.create({
      data: {
        name,
        classId,
      },
    });
  }

  async updateSubject(id: string, name: string, classId?: string) {
    const exists = await prisma.subject.findUnique({ where: { id } });
    if (!exists) throw new Error('Subject not found');

    if (classId) {
      const classExists = await prisma.schoolClass.findUnique({ where: { id: classId } });
      if (!classExists) throw new Error('Class not found');
    }

    return await prisma.subject.update({
      where: { id },
      data: {
        name,
        ...(classId ? { classId } : {}),
      },
    });
  }

  async deleteSubject(id: string) {
    const exists = await prisma.subject.findUnique({ where: { id } });
    if (!exists) throw new Error('Subject not found');

    return await prisma.$transaction(async (tx) => {
      const chapters = await tx.chapter.findMany({ where: { subjectId: id } });
      const chapterIds = chapters.map((c) => c.id);

      await tx.topic.deleteMany({ where: { chapterId: { in: chapterIds } } });
      await tx.document.deleteMany({
        where: {
          OR: [
            { subjectId: id },
            { chapterId: { in: chapterIds } },
          ],
        },
      });
      await tx.chapter.deleteMany({ where: { id: { in: chapterIds } } });
      return await tx.subject.delete({ where: { id } });
    });
  }

  async getChapters(subjectId?: string) {
    return await prisma.chapter.findMany({
      where: subjectId ? { subjectId } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createChapter(name: string, description: string | undefined, subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { schoolClass: true },
    });
    if (!subject) {
      throw new Error('Subject not found');
    }

    return await prisma.chapter.create({
      data: {
        name,
        description,
        subjectId,
      },
    });
  }

  async updateChapter(id: string, name: string, description?: string, subjectId?: string) {
    const exists = await prisma.chapter.findUnique({ where: { id } });
    if (!exists) throw new Error('Chapter not found');

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) throw new Error('Subject not found');
    }

    return await prisma.chapter.update({
      where: { id },
      data: {
        name,
        description: description !== undefined ? description : exists.description,
        ...(subjectId ? { subjectId } : {}),
      },
    });
  }

  async deleteChapter(id: string) {
    const exists = await prisma.chapter.findUnique({ where: { id } });
    if (!exists) throw new Error('Chapter not found');

    return await prisma.$transaction(async (tx) => {
      await tx.topic.deleteMany({ where: { chapterId: id } });
      await tx.document.deleteMany({ where: { chapterId: id } });
      return await tx.chapter.delete({ where: { id } });
    });
  }

  async getTopics(chapterId?: string) {
    return await prisma.topic.findMany({
      where: chapterId ? { chapterId } : undefined,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createTopic(name: string, chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    return await prisma.topic.create({
      data: {
        name,
        chapterId,
      },
    });
  }

  async updateTopic(id: string, name: string, chapterId?: string) {
    const exists = await prisma.topic.findUnique({ where: { id } });
    if (!exists) throw new Error('Topic not found');

    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
      if (!chapter) throw new Error('Chapter not found');
    }

    return await prisma.topic.update({
      where: { id },
      data: {
        name,
        ...(chapterId ? { chapterId } : {}),
      },
    });
  }

  async deleteTopic(id: string) {
    const exists = await prisma.topic.findUnique({ where: { id } });
    if (!exists) throw new Error('Topic not found');

    return await prisma.$transaction(async (tx) => {
      await tx.document.deleteMany({ where: { topicId: id } });
      return await tx.topic.delete({ where: { id } });
    });
  }
}
