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

  async getSubjects() {
    return await prisma.subject.findMany({
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

  async getChapters() {
    return await prisma.chapter.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createChapter(name: string, description: string | undefined, subjectId: string) {
    // Verify subject exists and get its class
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

  async getTopics() {
    return await prisma.topic.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createTopic(name: string, chapterId: string) {
    // Verify chapter exists and get its subject
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
}
