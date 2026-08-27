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

export interface WorksheetQuestionItem {
  number: number;
  type: string;
  instruction: string;
  marks?: number;
  items?: string[];
  subQuestions?: Array<{
    label: string;
    prompt: string;
    answerBlank?: string;
  }>;
  matchingPairs?: Array<{
    left: string;
    right: string;
  }>;
  options?: string[];
  blankLinesCount?: number;
  visualContext?: string;
}

export interface WorksheetData {
  schoolName: string;
  schoolSubHeader: string;
  academicYear: string;
  examName: string;
  worksheetNumber?: string;
  className: string;
  subjectName: string;
  chapterName?: string;
  topicName?: string;
  instructions?: string[];
  totalMarks?: number;
  questions: WorksheetQuestionItem[];
}

export interface WorksheetAnalysisResult {
  detectedSubject?: string;
  detectedClass?: string;
  detectedChapter?: string;
  detectedTopic?: string;
  keyConcepts: string[];
  vocabulary: string[];
  suggestedQuestionTypes: string[];
  recommendedDifficulty: string;
  summary: string;
}

export class WorksheetService {
  /**
   * AI Analysis of PDF text content
   */
  async analyzeContent(extractedText: string, fileName?: string): Promise<WorksheetAnalysisResult> {
    const systemPrompt = `You are an expert curriculum analyst for Krishna English School (KES).
Analyze the provided educational study material and extract structured information to assist teachers in generating school worksheets.
Respond ONLY with a valid JSON object without any markdown code fences or conversational text.`;

    const userPrompt = `Analyze this study material text (Source: ${fileName || 'Uploaded PDF'}):

"""
${extractedText.slice(0, 12000)}
"""

Extract and return JSON with these exact keys:
{
  "detectedSubject": "Subject name like English, Maths, EVS, Science, Hindi, Gujarati, Social Science",
  "detectedClass": "Class or standard level like Nursery, JR.KG, SR.KG, Class 1, Class 2, Class 3, Class 4, Class 5, etc.",
  "detectedChapter": "Chapter title if identifiable or empty string",
  "detectedTopic": "Main topic or concept or empty string",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "vocabulary": ["Word 1", "Word 2", "Word 3"],
  "suggestedQuestionTypes": ["missing_letters", "before_after_between", "fill_in_blanks", "match_the_following", "count_and_write", "circle_correct", "tick_correct", "picture_identification", "short_answer", "odd_one_out"],
  "recommendedDifficulty": "Easy" | "Medium" | "Hard" | "Mixed",
  "summary": "Brief 2-3 sentence overview of this material for school worksheet preparation"
}`;

    try {
      const response = await aiService.generateAuto({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
      });

      const cleaned = this.cleanJsonString(response.content);
      const parsed = JSON.parse(cleaned);
      return {
        detectedSubject: parsed.detectedSubject || 'General',
        detectedClass: parsed.detectedClass || 'SR.KG',
        detectedChapter: parsed.detectedChapter || '',
        detectedTopic: parsed.detectedTopic || '',
        keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
        vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
        suggestedQuestionTypes: Array.isArray(parsed.suggestedQuestionTypes) ? parsed.suggestedQuestionTypes : ['fill_in_blanks', 'missing_letters', 'match_the_following'],
        recommendedDifficulty: parsed.recommendedDifficulty || 'Medium',
        summary: parsed.summary || 'Study material successfully analyzed.',
      };
    } catch (error) {
      console.error('[WorksheetService] Analysis error, falling back:', error);
      return {
        detectedSubject: 'English',
        detectedClass: 'SR.KG',
        detectedChapter: '',
        detectedTopic: '',
        keyConcepts: ['Foundational literacy and concepts'],
        vocabulary: [],
        suggestedQuestionTypes: ['missing_letters', 'before_after_between', 'match_the_following', 'fill_in_blanks'],
        recommendedDifficulty: 'Medium',
        summary: 'Study material extracted and ready for worksheet generation.',
      };
    }
  }

  /**
   * Generate structured worksheet using AI
   */
  async generateWorksheet(params: {
    sourceContent: string;
    className: string;
    subjectName: string;
    chapterName?: string;
    topicName?: string;
    worksheetNumber?: string;
    examName?: string;
    academicYear?: string;
    questionCount?: number;
    difficulty?: string;
    questionTypes?: string[];
  }): Promise<WorksheetData> {
    const questionCount = params.questionCount || 5;
    const difficulty = params.difficulty || 'Medium';
    const schoolName = 'KRISHNA ENGLISH SCHOOL';
    const schoolSubHeader = 'Pre-Primary-Primary School';
    const academicYear = params.academicYear || '2026-27';
    const examName = params.examName || 'Worksheet FA 1';
    const worksheetNumber = params.worksheetNumber || '1';
    const className = params.className || 'SR.KG';
    const subjectName = params.subjectName || 'ENGLISH';
    const typesToUse = params.questionTypes && params.questionTypes.length > 0
      ? params.questionTypes.join(', ')
      : 'missing_letters, what comes before/after/between, match the following, circle/tick the correct answer, count and write, fill in the blanks, picture identification, short answer';

    const systemPrompt = `You are the master worksheet creator for Krishna English School.
Your task is to generate an authentic school-ready printable worksheet grounded strictly in the provided study material.
Follow the traditional Krishna English School worksheet format:
- School: ${schoolName}
- Sub-header: ${schoolSubHeader}
- Header info: Worksheet ${examName} Year ${academicYear}
- Student fields: Name: __________, Sub.: ${subjectName}, Std: ${className}
- Questions should be strictly age/class-appropriate (e.g., Nursery/JR.KG/SR.KG should have missing letters, before/after/between, matching, picture recognition, count and write; higher classes should have structured exercises).
- Generate exactly ${questionCount} diverse, pedagogical questions.
- Respond ONLY with valid JSON. Do not include markdown code block backticks (\`\`\`json).`;

    const userPrompt = `Study Material Content:
"""
${params.sourceContent.slice(0, 15000)}
"""

Target Parameters:
- Class/Standard: ${className}
- Subject: ${subjectName}
- Chapter: ${params.chapterName || 'General'}
- Topic: ${params.topicName || 'General'}
- Difficulty: ${difficulty}
- Target Question Count: ${questionCount}
- Allowed / Preferred Question Types: ${typesToUse}

Return a valid JSON object matching this schema:
{
  "schoolName": "${schoolName}",
  "schoolSubHeader": "${schoolSubHeader}",
  "academicYear": "${academicYear}",
  "examName": "${examName}",
  "worksheetNumber": "${worksheetNumber}",
  "className": "${className}",
  "subjectName": "${subjectName}",
  "chapterName": "${params.chapterName || ''}",
  "topicName": "${params.topicName || ''}",
  "instructions": ["Read each question carefully and write neatly."],
  "totalMarks": 25,
  "questions": [
    {
      "number": 1,
      "type": "missing_letters",
      "instruction": "Write the missing letters.",
      "marks": 5,
      "items": ["A ___ C ___ E ___ G", "M ___ O ___ Q ___ S"]
    },
    {
      "number": 2,
      "type": "before_after_between",
      "instruction": "What comes after?",
      "marks": 5,
      "subQuestions": [
        {"label": "a)", "prompt": "What comes after B?", "answerBlank": "B ___"},
        {"label": "b)", "prompt": "What comes after G?", "answerBlank": "G ___"}
      ]
    },
    {
      "number": 3,
      "type": "match_the_following",
      "instruction": "Match Column A with Column B.",
      "marks": 5,
      "matchingPairs": [
        {"left": "Apple", "right": "Fruit"},
        {"left": "Cat", "right": "Animal"}
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
    let parsed: WorksheetData;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('[WorksheetService] Failed to parse generated JSON:', response.content);
      throw new Error('AI generated invalid worksheet format. Please try again.');
    }

    // Ensure fallback defaults
    parsed.schoolName = parsed.schoolName || schoolName;
    parsed.schoolSubHeader = parsed.schoolSubHeader || schoolSubHeader;
    parsed.academicYear = parsed.academicYear || academicYear;
    parsed.examName = parsed.examName || examName;
    parsed.worksheetNumber = parsed.worksheetNumber || worksheetNumber;
    parsed.className = parsed.className || className;
    parsed.subjectName = parsed.subjectName || subjectName;

    return parsed;
  }

  /**
   * Helper to clean JSON string from LLM responses
   */
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

  /**
   * Helper to sanitize text for WinAnsi PDF encoding
   */
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
  async generatePdf(data: WorksheetData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (width x height)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const pageWidth = 595.28;
    let y = 800;

    const checkPageBreak = (neededHeight: number) => {
      if (y - neededHeight < 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 800;
        // Repeat minimal header on continuation
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

    // Draw School Header
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

    const examTitle = this.sanitizeForPdf(`Worksheet ${data.examName} Year ${data.academicYear}`);
    page.drawText(examTitle, {
      x: (pageWidth - fontBold.widthOfTextAtSize(examTitle, 11)) / 2,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 14;

    // Header separator line
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 18;

    // Student Details
    const nameText = 'Name: __________________________________________________';
    page.drawText(nameText, {
      x: margin,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    const subStdText = this.sanitizeForPdf(`Sub.: ${data.subjectName.toUpperCase()}                     Std: ${data.className.toUpperCase()}`);
    page.drawText(subStdText, {
      x: margin,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 12;

    // Second separator line
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.75,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 22;

    // Render Questions
    for (const q of data.questions) {
      checkPageBreak(80);

      // Question Title / Instruction
      const qHead = this.sanitizeForPdf(`Q.${q.number}  ${q.instruction}${q.marks ? `  [${q.marks} Marks]` : ''}`);
      page.drawText(qHead, {
        x: margin,
        y,
        size: 10.5,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 18;

      // Visual context if present
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

      // 1. Missing letters or standard items
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

      // 2. Sub-questions (e.g. before/after, short questions)
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

      // 3. Match the following
      if (q.matchingPairs && q.matchingPairs.length > 0) {
        checkPageBreak(q.matchingPairs.length * 22 + 20);
        // Header for columns
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

      // 4. Options (for MCQ, circle/tick)
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

      // 5. Blank answer lines if needed
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

      y -= 14; // Space between questions
    }

    return await pdfDoc.save();
  }


  /**
   * Generate real editable DOCX using docx package
   */
  async generateDocx(data: WorksheetData): Promise<Buffer> {
    const docChildren: (Paragraph | Table)[] = [];

    // Header School Name
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: data.schoolName.toUpperCase(),
            bold: true,
            size: 30, // 15pt
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
            size: 20, // 10pt
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 140 },
        children: [
          new TextRun({
            text: `Worksheet ${data.examName} Year ${data.academicYear}`,
            bold: true,
            size: 22, // 11pt
            font: 'Helvetica',
          }),
        ],
      })
    );

    // Student info block
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
        spacing: { before: 40, after: 160 },
        children: [
          new TextRun({
            text: `Sub.: ${data.subjectName.toUpperCase()}                                                   Std: ${data.className.toUpperCase()}`,
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
                top: 720, // 0.5 in
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
   * Save worksheet to database
   */
  async saveWorksheet(data: WorksheetData, documentId?: string) {
    return await prisma.worksheet.create({
      data: {
        title: `${data.subjectName} Worksheet - ${data.className}`,
        schoolName: data.schoolName,
        schoolSubHeader: data.schoolSubHeader,
        academicYear: data.academicYear,
        examName: data.examName,
        worksheetNumber: data.worksheetNumber || '1',
        className: data.className,
        subjectName: data.subjectName,
        chapterName: data.chapterName,
        topicName: data.topicName,
        contentJson: JSON.stringify(data),
        documentId: documentId || null,
      },
    });
  }

  /**
   * Get all saved worksheets
   */
  async getAllWorksheets(limit = 20) {
    const list = await prisma.worksheet.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return list.map((w) => ({
      ...w,
      content: JSON.parse(w.contentJson) as WorksheetData,
    }));
  }

  /**
   * Get worksheet by ID
   */
  async getWorksheetById(id: string) {
    const w = await prisma.worksheet.findUnique({
      where: { id },
    });
    if (!w) return null;
    return {
      ...w,
      content: JSON.parse(w.contentJson) as WorksheetData,
    };
  }

  /**
   * Delete worksheet by ID
   */
  async deleteWorksheet(id: string) {
    return await prisma.worksheet.delete({
      where: { id },
    });
  }
}

export const worksheetService = new WorksheetService();
