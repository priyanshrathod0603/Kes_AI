import prisma from '../config/database';
import { aiService } from '../ai/ai.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { WorksheetQuestionItem } from './worksheet.service';

export interface QuestionPaperData {
  schoolName: string;
  schoolSubHeader: string;
  academicYear: string;
  examName: string;
  className: string;
  subjectName: string;
  duration: string;
  totalMarks: number;
  instructions?: string[];
  questions: WorksheetQuestionItem[];
}

export class QuestionPaperService {
  /**
   * Generate structured Question Paper using AI
   */
  async generateQuestionPaper(params: {
    sourceWorksheetTexts: string[];
    studyMaterialText?: string;
    className: string;
    subjectName: string;
    examName?: string;
    academicYear?: string;
    totalMarks?: number;
    duration?: string;
    questionCount?: number;
    difficulty?: string;
  }): Promise<QuestionPaperData> {
    const schoolName = 'KRISHNA ENGLISH SCHOOL';
    const schoolSubHeader = 'Pre-Primary-Primary School';
    const academicYear = params.academicYear || '2026-27';
    const examName = params.examName || 'FA 1 EXAMINATION';
    const className = params.className || 'SR.KG';
    const subjectName = params.subjectName || 'ENGLISH';
    const totalMarks = params.totalMarks || 25;
    const duration = params.duration || '1 Hour';
    const questionCount = params.questionCount || 5;
    const difficulty = params.difficulty || 'Medium';

    const aggregatedContext = [
      ...params.sourceWorksheetTexts.map((text, i) => `=== WORKSHEET ${i + 1} ===\n${text}`),
      params.studyMaterialText ? `=== ADDITIONAL STUDY MATERIAL ===\n${params.studyMaterialText}` : '',
    ].join('\n\n');

    const systemPrompt = `You are the master examination paper setter for Krishna English School.
Create a formal, balanced examination question paper based on the curriculum and concepts taught in the provided worksheets and study material.
Follow the traditional Krishna English School examination format:
- School: ${schoolName}
- Sub-header: ${schoolSubHeader}
- Exam: ${examName}
- Academic Year: ${academicYear}
- Header fields: Name: __________, Class: ${className}, Subject: ${subjectName}, Time: ${duration}, Marks: ${totalMarks}
- Allocate marks for each question such that the sum equals exactly ${totalMarks} marks.
- Do NOT simply copy-paste the exact same worksheet questions; synthesize a proper examination paper testing the learned concepts.
- Age-appropriate questions (e.g. For Kindergarten/SR.KG: missing letters, before/after/between, matching, picture recognition, counting; For primary classes: definitions, fill blanks, short answers, structured problems).
- Respond ONLY with valid JSON without any markdown code fences.`;

    const userPrompt = `Curriculum & Syllabus Content (Source Worksheets & Materials):
"""
${aggregatedContext.slice(0, 15000)}
"""

Exam Specifications:
- Class/Standard: ${className}
- Subject: ${subjectName}
- Examination: ${examName}
- Academic Year: ${academicYear}
- Total Marks: ${totalMarks}
- Time/Duration: ${duration}
- Target Question Count: ${questionCount}
- Difficulty: ${difficulty}

Return a valid JSON object matching this schema:
{
  "schoolName": "${schoolName}",
  "schoolSubHeader": "${schoolSubHeader}",
  "academicYear": "${academicYear}",
  "examName": "${examName}",
  "className": "${className}",
  "subjectName": "${subjectName}",
  "duration": "${duration}",
  "totalMarks": ${totalMarks},
  "instructions": [
    "All questions are compulsory.",
    "Write answers in neat and clean handwriting."
  ],
  "questions": [
    {
      "number": 1,
      "type": "missing_letters",
      "instruction": "Fill in the missing letters.",
      "marks": 5,
      "items": ["A ___ C ___ E ___ G"]
    },
    {
      "number": 2,
      "type": "before_after_between",
      "instruction": "What comes after?",
      "marks": 5,
      "subQuestions": [
        {"label": "a)", "prompt": "What comes after B?", "answerBlank": "B ___"},
        {"label": "b)", "prompt": "What comes after M?", "answerBlank": "M ___"}
      ]
    },
    {
      "number": 3,
      "type": "match_the_following",
      "instruction": "Match the following.",
      "marks": 5,
      "matchingPairs": [
        {"left": "Sun", "right": "Day"},
        {"left": "Moon", "right": "Night"}
      ]
    }
  ]
}`;

    const response = await aiService.generateAuto({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 4000,
    });


    const cleaned = this.cleanJsonString(response.content);
    let parsed: QuestionPaperData;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('[QuestionPaperService] Failed to parse JSON:', response.content);
      throw new Error('AI generated invalid question paper format. Please try again.');
    }

    parsed.schoolName = parsed.schoolName || schoolName;
    parsed.schoolSubHeader = parsed.schoolSubHeader || schoolSubHeader;
    parsed.academicYear = parsed.academicYear || academicYear;
    parsed.examName = parsed.examName || examName;
    parsed.className = parsed.className || className;
    parsed.subjectName = parsed.subjectName || subjectName;
    parsed.duration = parsed.duration || duration;
    parsed.totalMarks = parsed.totalMarks || totalMarks;

    return parsed;
  }

  private cleanJsonString(str: string): string {
    let s = str.trim();
    if (s.startsWith('```json')) {
      s = s.slice(7);
    } else if (s.startsWith('```')) {
      s = s.slice(3);
    }
    if (s.endsWith('```')) {
      s = s.slice(0, -3);
    }
    return s.trim();
  }

  private sanitizeForPdf(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u00A0]/g, ' ')
      .replace(/[^\x00-\x7F]/g, '');
  }

  /**
   * Generate real printable PDF using pdf-lib
   */
  async generatePdf(data: QuestionPaperData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 (595 x 842 pt)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const pageWidth = 595.28;
    let y = 800;

    const checkPageBreak = (neededHeight: number) => {
      if (y - neededHeight < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
        page.drawText(this.sanitizeForPdf(`${data.schoolName} - ${data.examName} (${data.className})`), {
          x: margin,
          y,
          size: 9,
          font: fontRegular,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 25;
      }
    };

    // Header
    const schoolNameText = this.sanitizeForPdf(data.schoolName.toUpperCase());
    page.drawText(schoolNameText, {
      x: (pageWidth - fontBold.widthOfTextAtSize(schoolNameText, 15)) / 2,
      y,
      size: 15,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;

    const subHeaderText = this.sanitizeForPdf(data.schoolSubHeader);
    page.drawText(subHeaderText, {
      x: (pageWidth - fontRegular.widthOfTextAtSize(subHeaderText, 10)) / 2,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 16;

    const examTitle = this.sanitizeForPdf(`${data.examName.toUpperCase()} - ${data.academicYear}`);
    page.drawText(examTitle, {
      x: (pageWidth - fontBold.widthOfTextAtSize(examTitle, 11)) / 2,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 14;

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 18;

    // Student fields
    const nameLine = 'Name: __________________________________________________';
    page.drawText(nameLine, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const row1 = this.sanitizeForPdf(`Class: ${data.className.toUpperCase()}                               Subject: ${data.subjectName.toUpperCase()}`);
    page.drawText(row1, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const row2 = this.sanitizeForPdf(`Time: ${data.duration}                                    Marks: ${data.totalMarks}`);
    page.drawText(row2, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 12;

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.75,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;

    // Render questions
    for (const q of data.questions) {
      checkPageBreak(80);

      const qHead = this.sanitizeForPdf(`Q.${q.number}  ${q.instruction}`);
      page.drawText(qHead, {
        x: margin,
        y,
        size: 10.5,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      if (q.marks) {
        const marksText = `[${q.marks}]`;
        const marksWidth = fontBold.widthOfTextAtSize(marksText, 10);
        page.drawText(marksText, {
          x: pageWidth - margin - marksWidth,
          y,
          size: 10,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      }
      y -= 18;

      if (q.visualContext) {
        checkPageBreak(25);
        page.drawText(this.sanitizeForPdf(`[ ${q.visualContext} ]`), {
          x: margin + 20,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 18;
      }

      if (q.items && q.items.length > 0) {
        for (const item of q.items) {
          checkPageBreak(25);
          page.drawText(this.sanitizeForPdf(item), {
            x: margin + 20,
            y,
            size: 11,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 22;
        }
      }

      if (q.subQuestions && q.subQuestions.length > 0) {
        for (const sq of q.subQuestions) {
          checkPageBreak(25);
          const sqText = this.sanitizeForPdf(`${sq.label}  ${sq.answerBlank || sq.prompt}`);
          page.drawText(sqText, {
            x: margin + 20,
            y,
            size: 10,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 20;
        }
      }

      if (q.matchingPairs && q.matchingPairs.length > 0) {
        checkPageBreak(q.matchingPairs.length * 22 + 20);
        page.drawText('Column A', {
          x: margin + 30,
          y,
          size: 9.5,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        page.drawText('Column B', {
          x: margin + 260,
          y,
          size: 9.5,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 16;

        for (let i = 0; i < q.matchingPairs.length; i++) {
          const pair = q.matchingPairs[i];
          page.drawText(this.sanitizeForPdf(`${i + 1}.  ${pair.left}`), {
            x: margin + 30,
            y,
            size: 10,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          page.drawText(this.sanitizeForPdf(`(    )   ${String.fromCharCode(65 + i)}.  ${pair.right}`), {
            x: margin + 240,
            y,
            size: 10,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 20;
        }
      }

      if (q.options && q.options.length > 0) {
        checkPageBreak(25);
        const optLine = this.sanitizeForPdf(
          q.options.map((opt, idx) => `( ${String.fromCharCode(97 + idx)} ) ${opt}`).join('    ')
        );
        page.drawText(optLine, {
          x: margin + 20,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        y -= 22;
      }

      const lines = q.blankLinesCount || (q.type === 'short_answer' ? 2 : 0);
      for (let l = 0; l < lines; l++) {
        checkPageBreak(20);
        page.drawLine({
          start: { x: margin + 20, y },
          end: { x: pageWidth - margin - 20, y },
          thickness: 0.5,
          color: rgb(0.6, 0.6, 0.6),
        });
        y -= 20;
      }

      y -= 14;
    }

    return await pdfDoc.save();
  }


  /**
   * Generate real editable DOCX using docx package
   */
  async generateDocx(data: QuestionPaperData): Promise<Buffer> {
    const docChildren: (Paragraph | Table)[] = [];

    // Header
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: data.schoolName.toUpperCase(),
            bold: true,
            size: 30,
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: data.schoolSubHeader,
            size: 20,
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        children: [
          new TextRun({
            text: `${data.examName.toUpperCase()} - ${data.academicYear}`,
            bold: true,
            size: 22,
            font: 'Helvetica',
          }),
        ],
      })
    );

    // Student fields
    docChildren.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({
            text: 'Name: ____________________________________________________________________',
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: `Class: ${data.className.toUpperCase()}                                                   Subject: ${data.subjectName.toUpperCase()}`,
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 40, after: 160 },
        children: [
          new TextRun({
            text: `Time: ${data.duration}                                                      Marks: ${data.totalMarks}`,
            bold: true,
            size: 20,
          }),
        ],
      })
    );

    // Questions
    for (const q of data.questions) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 60 },
          children: [
            new TextRun({
              text: `Q.${q.number}  ${q.instruction}`,
              bold: true,
              size: 21,
            }),
            ...(q.marks
              ? [
                  new TextRun({
                    text: `   [${q.marks} Marks]`,
                    bold: true,
                    size: 19,
                  }),
                ]
              : []),
          ],
        })
      );

      if (q.visualContext) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: `[ ${q.visualContext} ]`,
                italics: true,
                size: 20,
              }),
            ],
          })
        );
      }

      if (q.items && q.items.length > 0) {
        for (const item of q.items) {
          docChildren.push(
            new Paragraph({
              indent: { left: 400 },
              spacing: { before: 40, after: 60 },
              children: [
                new TextRun({
                  text: item,
                  size: 22,
                }),
              ],
            })
          );
        }
      }

      if (q.subQuestions && q.subQuestions.length > 0) {
        for (const sq of q.subQuestions) {
          docChildren.push(
            new Paragraph({
              indent: { left: 400 },
              spacing: { before: 40, after: 60 },
              children: [
                new TextRun({
                  text: `${sq.label}  ${sq.answerBlank || sq.prompt}`,
                  size: 20,
                }),
              ],
            })
          );
        }
      }

      if (q.matchingPairs && q.matchingPairs.length > 0) {
        const tableRows = [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Column A', bold: true, size: 20 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'Column B', bold: true, size: 20 })],
                  }),
                ],
              }),
            ],
          }),
          ...q.matchingPairs.map(
            (pair, idx) =>
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [new TextRun({ text: `${idx + 1}.  ${pair.left}`, size: 20 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({
                            text: `(    )  ${String.fromCharCode(65 + idx)}.  ${pair.right}`,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
          ),
        ];

        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          })
        );
      }

      if (q.options && q.options.length > 0) {
        docChildren.push(
          new Paragraph({
            indent: { left: 400 },
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: q.options.map((opt, i) => `( ${String.fromCharCode(97 + i)} ) ${opt}`).join('      '),
                size: 20,
              }),
            ],
          })
        );
      }

      const lines = q.blankLinesCount || (q.type === 'short_answer' ? 2 : 0);
      for (let l = 0; l < lines; l++) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: '_________________________________________________________________________________',
                color: '888888',
                size: 16,
              }),
            ],
          })
        );
      }
    }

    const doc = new DocxDocument({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Save question paper to database
   */
  async saveQuestionPaper(data: QuestionPaperData) {
    return await prisma.questionPaper.create({
      data: {
        title: `${data.subjectName} Exam - ${data.className}`,
        schoolName: data.schoolName,
        schoolSubHeader: data.schoolSubHeader,
        academicYear: data.academicYear,
        examName: data.examName,
        className: data.className,
        subjectName: data.subjectName,
        totalMarks: data.totalMarks,
        duration: data.duration,
        contentJson: JSON.stringify(data),
      },
    });
  }

  /**
   * Get all saved question papers
   */
  async getAllQuestionPapers(limit = 20) {
    const list = await prisma.questionPaper.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return list.map((qp) => ({
      ...qp,
      content: JSON.parse(qp.contentJson) as QuestionPaperData,
    }));
  }

  /**
   * Get question paper by ID
   */
  async getQuestionPaperById(id: string) {
    const qp = await prisma.questionPaper.findUnique({
      where: { id },
    });
    if (!qp) return null;
    return {
      ...qp,
      content: JSON.parse(qp.contentJson) as QuestionPaperData,
    };
  }

  /**
   * Delete question paper by ID
   */
  async deleteQuestionPaper(id: string) {
    return await prisma.questionPaper.delete({
      where: { id },
    });
  }
}

export const questionPaperService = new QuestionPaperService();
