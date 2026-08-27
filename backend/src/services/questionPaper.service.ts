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
  id?: string;
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
   * Helper to categorize class/grade level for examination structure
   */
  private categorizeClassLevel(className: string): 'pre_primary' | 'primary' | 'middle' | 'secondary' {
    const norm = (className || '').toLowerCase().trim();
    if (
      norm.includes('nursery') ||
      norm.includes('jr') ||
      norm.includes('sr') ||
      norm.includes('kg') ||
      norm.includes('kindergarten') ||
      norm.includes('lkg') ||
      norm.includes('ukg') ||
      norm.includes('pre')
    ) {
      return 'pre_primary';
    }
    if (
      norm.includes('1') ||
      norm.includes('2') ||
      norm.includes('3') ||
      norm.includes('4') ||
      norm.includes('5') ||
      norm.includes('i') ||
      norm.includes('ii') ||
      norm.includes('iii') ||
      norm.includes('iv') ||
      norm.includes('v')
    ) {
      return 'primary';
    }
    if (
      norm.includes('6') ||
      norm.includes('7') ||
      norm.includes('8') ||
      norm.includes('vi') ||
      norm.includes('vii') ||
      norm.includes('viii')
    ) {
      return 'middle';
    }
    return 'secondary';
  }

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
    teacherPrompt?: string;
  }): Promise<QuestionPaperData> {
    const schoolName = 'KRISHNA ENGLISH SCHOOL';
    const schoolSubHeader = 'Pre-Primary-Primary-Secondary School';
    const academicYear = params.academicYear || '2026-27';
    const examName = params.examName || 'FA 1 EXAMINATION';
    const className = params.className || 'Class 1';
    const subjectName = params.subjectName || 'ENGLISH';
    const totalMarks = Number(params.totalMarks) || 25;
    const duration = params.duration || '1 Hour';
    const questionCount = Number(params.questionCount) || 5;
    const difficulty = params.difficulty || 'Medium';
    const levelCategory = this.categorizeClassLevel(className);

    const aggregatedContext = [
      ...params.sourceWorksheetTexts.map((text, i) => `=== WORKSHEET ${i + 1} SOURCE ===\n${text}`),
      params.studyMaterialText ? `=== STUDY MATERIAL REFERENCE ===\n${params.studyMaterialText}` : '',
    ].filter(Boolean).join('\n\n');

    // Section and examination blueprints by academic tier
    let examBlueprint = '';
    if (levelCategory === 'pre_primary') {
      examBlueprint = `
EXAM BLUEPRINT: Pre-Primary / Kindergarten (${className})
- Design interactive, visual, foundational evaluation questions.
- Question formats: Missing letters/numbers in sequence, What comes before/after/between, Picture/Symbol recognition with clues, Matching items, Count and write, Circle/Tick correct options.
- Divide marks evenly across questions so the sum equals exactly ${totalMarks} Marks.`;
    } else if (levelCategory === 'primary') {
      examBlueprint = `
EXAM BLUEPRINT: Primary School Classes 1 to 5 (${className})
- Structure into organized sections:
  * Section A: Objective & Vocabulary (MCQs / Fill in blanks / Match pairs)
  * Section B: Short Questions & Application (Grammar / Math problems / Short answers)
- Total marks allocated to all questions MUST sum to exactly ${totalMarks} Marks.`;
    } else if (levelCategory === 'middle') {
      examBlueprint = `
EXAM BLUEPRINT: Middle School Classes 6 to 8 (${className})
- Formal exam blueprint with section dividers:
  * Section A: Objective / Multiple Choice (1 Mark each)
  * Section B: Short Answer Questions / Conceptual (2-3 Marks each)
  * Section C: Long Answer / Analytical / Problem Solving (4-5 Marks each)
- Total marks allocated across all questions MUST sum to exactly ${totalMarks} Marks.`;
    } else {
      examBlueprint = `
EXAM BLUEPRINT: Secondary & Higher Classes 9 to 12 (${className})
- Formal board-style examination paper with structured sections:
  * Section A: Multiple Choice Questions (MCQs) & Assertion-Reason (1 Mark each)
  * Section B: Short Answer Type I (2 Marks each)
  * Section C: Short Answer Type II (3 Marks each)
  * Section D: Long Answer / Case Studies / Numerical Derivations (5 Marks each)
- Total marks allocated across all questions MUST sum to exactly ${totalMarks} Marks.`;
    }

    const teacherDirective = params.teacherPrompt
      ? `\nTEACHER SPECIAL BLUEPRINT INSTRUCTIONS (Highest Priority!):\n"""\n${params.teacherPrompt}\n"""\n`
      : '';

    const systemPrompt = `You are the master examination controller and paper setter for Krishna English School.
Create a formal, balanced, syllabus-aligned examination question paper based on the curriculum content taught in the provided worksheets and study material.
Follow the traditional Krishna English School examination format:
- School: ${schoolName}
- Sub-header: ${schoolSubHeader}
- Exam: ${examName} (${academicYear})
- Header fields: Name: __________, Class: ${className}, Subject: ${subjectName}, Time: ${duration}, Max Marks: ${totalMarks}

${examBlueprint}
${teacherDirective}

STRICT RULES:
1. Synthesize fresh examination questions testing the underlying concepts rather than copying verbatim.
2. Generate approximately ${questionCount} structured questions.
3. MATHEMATICAL VALIDATION: Every question MUST have an explicit "marks" integer, and the SUM of marks for all questions MUST equal exactly ${totalMarks}.
4. Difficulty Level: ${difficulty}.
5. Respond ONLY with valid JSON. Do not include markdown code block formatting.`;

    const userPrompt = `Curriculum & Syllabus Content (Source Materials):
"""
${aggregatedContext.slice(0, 16000)}
"""

Target Examination Specifications:
- School: ${schoolName}
- Class / Standard: ${className}
- Subject: ${subjectName}
- Examination: ${examName}
- Academic Year: ${academicYear}
- Total Marks: ${totalMarks}
- Time / Duration: ${duration}
- Target Questions Count: ${questionCount}
- Difficulty Level: ${difficulty}

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
    "Read each question carefully before answering.",
    "Write neatly and clearly in the space provided."
  ],
  "questions": [
    {
      "number": 1,
      "section": "SECTION A: OBJECTIVE TYPE",
      "type": "mcq | fill_in_blanks | match_the_following | true_false | short_answer | long_answer | numerical | comprehension",
      "instruction": "Instruction string",
      "marks": 5,
      "passage": "Optional reading passage or case study",
      "visualContext": "Optional visual clue description",
      "items": ["Item or sentence 1"],
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "subQuestions": [
        {"label": "a)", "prompt": "Sub-question prompt", "marks": 1, "answerBlank": "Optional blank"}
      ],
      "matchingPairs": [
        {"left": "Item 1", "right": "Matching item 1"}
      ],
      "blankLinesCount": 2,
      "answerKey": "Answer summary / marking criteria"
    }
  ]
}`;

    const response = await aiService.generateAuto({
      systemPrompt,
      userPrompt,
      temperature: 0.25,
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

    // Mathematical Marks Validation & Graceful Normalization
    if (parsed.questions && parsed.questions.length > 0) {
      let currentSum = 0;
      for (const q of parsed.questions) {
        if (!q.marks || q.marks < 1) q.marks = 1;
        currentSum += q.marks;
      }

      if (currentSum !== totalMarks) {
        const diff = totalMarks - currentSum;
        const lastQ = parsed.questions[parsed.questions.length - 1];
        lastQ.marks = Math.max(1, (lastQ.marks || 1) + diff);
      }
    }

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

  private wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Generate real printable PDF using pdf-lib
   */
  async generatePdf(data: QuestionPaperData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const margin = 40;
    const pageWidth = 595.28;
    const contentWidth = pageWidth - margin * 2;
    let y = 800;
    let currentPageIndex = 1;

    const checkPageBreak = (neededHeight: number) => {
      if (y - neededHeight < 55) {
        // Footer on previous page
        const footerText = `Page ${currentPageIndex}`;
        page.drawText(footerText, {
          x: (pageWidth - fontRegular.widthOfTextAtSize(footerText, 8)) / 2,
          y: 30,
          size: 8,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        // Add next page
        page = pdfDoc.addPage([595.28, 841.89]);
        currentPageIndex++;
        y = 800;

        // Running Header on page 2+
        const headerText = this.sanitizeForPdf(
          `${data.schoolName} · ${data.examName} · Class: ${data.className} ${data.subjectName}`
        );
        page.drawText(headerText, {
          x: margin,
          y,
          size: 8.5,
          font: fontBold,
          color: rgb(0.3, 0.3, 0.3),
        });
        page.drawLine({
          start: { x: margin, y: y - 5 },
          end: { x: pageWidth - margin, y: y - 5 },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
        y -= 25;
      }
    };

    // School Name
    const schoolNameText = this.sanitizeForPdf(data.schoolName.toUpperCase());
    page.drawText(schoolNameText, {
      x: (pageWidth - fontBold.widthOfTextAtSize(schoolNameText, 14.5)) / 2,
      y,
      size: 14.5,
      font: fontBold,
      color: rgb(0.08, 0.08, 0.08),
    });
    y -= 15;

    const subHeaderText = this.sanitizeForPdf(data.schoolSubHeader);
    page.drawText(subHeaderText, {
      x: (pageWidth - fontRegular.widthOfTextAtSize(subHeaderText, 9.5)) / 2,
      y,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
    y -= 15;

    const examTitle = this.sanitizeForPdf(
      `${data.examName.toUpperCase()} · ACADEMIC YEAR ${data.academicYear}`
    );
    page.drawText(examTitle, {
      x: (pageWidth - fontBold.widthOfTextAtSize(examTitle, 10.5)) / 2,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 12;

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1.2,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 16;

    // Student fields
    const nameLine = 'Name: __________________________________________________  Roll No: __________';
    page.drawText(nameLine, {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    const row1 = this.sanitizeForPdf(
      `Class / Std: ${data.className.toUpperCase()}            Subject: ${data.subjectName.toUpperCase()}`
    );
    page.drawText(row1, {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    const row2 = this.sanitizeForPdf(
      `Time Duration: ${data.duration}                                          Maximum Marks: ${data.totalMarks}`
    );
    page.drawText(row2, {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 10;

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.75,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 16;

    // General Instructions
    if (data.instructions && data.instructions.length > 0) {
      page.drawText('General Instructions:', {
        x: margin,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 12;

      for (const ins of data.instructions) {
        const insLines = this.wrapText(this.sanitizeForPdf(`• ${ins}`), contentWidth - 20, fontRegular, 8.5);
        for (const iLine of insLines) {
          checkPageBreak(12);
          page.drawText(iLine, {
            x: margin + 10,
            y,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= 12;
        }
      }
      y -= 8;
    }

    let currentSection = '';

    // Render questions
    for (const q of data.questions) {
      if (q.section && q.section !== currentSection) {
        currentSection = q.section;
        checkPageBreak(40);
        y -= 6;
        const secText = this.sanitizeForPdf(q.section.toUpperCase());
        page.drawText(secText, {
          x: (pageWidth - fontBold.widthOfTextAtSize(secText, 10.5)) / 2,
          y,
          size: 10.5,
          font: fontBold,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 14;
      }

      checkPageBreak(50);

      // Question Title & Marks
      const qHeadPrefix = this.sanitizeForPdf(`Q.${q.number}  `);
      const instructionText = this.sanitizeForPdf(q.instruction);
      const marksText = q.marks ? this.sanitizeForPdf(`  [${q.marks} Marks]`) : '';

      const wrappedInstruction = this.wrapText(
        instructionText + marksText,
        contentWidth - 30,
        fontBold,
        10
      );

      for (let i = 0; i < wrappedInstruction.length; i++) {
        checkPageBreak(16);
        const prefix = i === 0 ? qHeadPrefix : '     ';
        page.drawText(prefix + wrappedInstruction[i], {
          x: margin,
          y,
          size: 10,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      }

      // Reading Passage or Case Study
      if (q.passage) {
        checkPageBreak(40);
        y -= 4;
        const wrappedPassage = this.wrapText(
          this.sanitizeForPdf(q.passage),
          contentWidth - 40,
          fontOblique,
          9
        );
        for (const pLine of wrappedPassage) {
          checkPageBreak(14);
          page.drawText(pLine, {
            x: margin + 20,
            y,
            size: 9,
            font: fontOblique,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 13;
        }
        y -= 4;
      }

      // Visual context / Word bank
      if (q.visualContext) {
        checkPageBreak(20);
        const ctxWrapped = this.wrapText(
          this.sanitizeForPdf(`[ ${q.visualContext} ]`),
          contentWidth - 40,
          fontRegular,
          9
        );
        for (const cLine of ctxWrapped) {
          page.drawText(cLine, {
            x: margin + 20,
            y,
            size: 9,
            font: fontRegular,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= 14;
        }
      }

      // 1. Items
      if (q.items && q.items.length > 0) {
        for (const item of q.items) {
          const itemLines = this.wrapText(this.sanitizeForPdf(item), contentWidth - 40, fontRegular, 10);
          for (const iLine of itemLines) {
            checkPageBreak(18);
            page.drawText(iLine, {
              x: margin + 20,
              y,
              size: 10,
              font: fontRegular,
              color: rgb(0, 0, 0),
            });
            y -= 16;
          }
          y -= 4;
        }
      }

      // 2. Sub-questions
      if (q.subQuestions && q.subQuestions.length > 0) {
        for (const sq of q.subQuestions) {
          const sqPrompt = this.sanitizeForPdf(
            `${sq.label}  ${sq.prompt}${sq.marks ? ` [${sq.marks}M]` : ''} ${sq.answerBlank || ''}`
          );
          const sqLines = this.wrapText(sqPrompt, contentWidth - 40, fontRegular, 9.5);
          for (const sLine of sqLines) {
            checkPageBreak(16);
            page.drawText(sLine, {
              x: margin + 20,
              y,
              size: 9.5,
              font: fontRegular,
              color: rgb(0, 0, 0),
            });
            y -= 15;
          }

          if (sq.options && sq.options.length > 0) {
            checkPageBreak(16);
            const optLine = this.sanitizeForPdf(
              sq.options.map((opt, oIdx) => `(${String.fromCharCode(97 + oIdx)}) ${opt}`).join('    ')
            );
            page.drawText(optLine, {
              x: margin + 35,
              y,
              size: 9,
              font: fontRegular,
              color: rgb(0.15, 0.15, 0.15),
            });
            y -= 14;
          }
        }
      }

      // 3. Match the Following
      if (q.matchingPairs && q.matchingPairs.length > 0) {
        checkPageBreak(q.matchingPairs.length * 20 + 30);
        page.drawText('Column A', {
          x: margin + 25,
          y,
          size: 9.5,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        page.drawText('Column B', {
          x: margin + 270,
          y,
          size: 9.5,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 15;

        for (let i = 0; i < q.matchingPairs.length; i++) {
          const pair = q.matchingPairs[i];
          const leftText = this.sanitizeForPdf(`${i + 1}.  ${pair.left}`);
          const rightText = this.sanitizeForPdf(`(    )  ${String.fromCharCode(65 + i)}.  ${pair.right}`);

          page.drawText(leftText, {
            x: margin + 25,
            y,
            size: 9.5,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          page.drawText(rightText, {
            x: margin + 250,
            y,
            size: 9.5,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 18;
        }
      }

      // 4. Options
      if (q.options && q.options.length > 0) {
        checkPageBreak(25);
        const optLine = this.sanitizeForPdf(
          q.options.map((opt, idx) => `(${String.fromCharCode(97 + idx)}) ${opt}`).join('      ')
        );
        const optLines = this.wrapText(optLine, contentWidth - 40, fontRegular, 9.5);
        for (const oLine of optLines) {
          page.drawText(oLine, {
            x: margin + 20,
            y,
            size: 9.5,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
          y -= 16;
        }
      }

      // 5. Blank Answer Lines
      const lines = q.blankLinesCount || (q.type === 'short_answer' || q.type === 'long_answer' ? 2 : 0);
      for (let l = 0; l < lines; l++) {
        checkPageBreak(18);
        page.drawLine({
          start: { x: margin + 20, y },
          end: { x: pageWidth - margin - 20, y },
          thickness: 0.5,
          color: rgb(0.65, 0.65, 0.65),
        });
        y -= 18;
      }

      y -= 10;
    }

    // Footer on final page
    const finalFooter = `Page ${currentPageIndex}`;
    page.drawText(finalFooter, {
      x: (pageWidth - fontRegular.widthOfTextAtSize(finalFooter, 8)) / 2,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

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
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({
            text: data.schoolName.toUpperCase(),
            bold: true,
            size: 28,
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: data.schoolSubHeader,
            size: 19,
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `${data.examName.toUpperCase()} · ACADEMIC YEAR ${data.academicYear}`,
            bold: true,
            size: 21,
            font: 'Helvetica',
          }),
        ],
      })
    );

    // Student fields
    docChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: 'Name: ____________________________________________________  Roll No: __________',
            bold: true,
            size: 19,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: `Class / Std: ${data.className.toUpperCase()}            Subject: ${data.subjectName.toUpperCase()}`,
            bold: true,
            size: 19,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20, after: 120 },
        children: [
          new TextRun({
            text: `Time Duration: ${data.duration}                                          Maximum Marks: ${data.totalMarks}`,
            bold: true,
            size: 19,
          }),
        ],
      })
    );

    // Instructions
    if (data.instructions && data.instructions.length > 0) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 20 },
          children: [new TextRun({ text: 'General Instructions:', bold: true, size: 18 })],
        }),
        ...data.instructions.map(
          (ins) =>
            new Paragraph({
              indent: { left: 200 },
              spacing: { before: 10, after: 10 },
              children: [new TextRun({ text: `• ${ins}`, size: 17, color: '444444' })],
            })
        )
      );
    }

    let currentSection = '';

    // Questions
    for (const q of data.questions) {
      if (q.section && q.section !== currentSection) {
        currentSection = q.section;
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: q.section.toUpperCase(),
                bold: true,
                size: 21,
                font: 'Helvetica',
              }),
            ],
          })
        );
      }

      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: `Q.${q.number}  ${q.instruction}`,
              bold: true,
              size: 20,
            }),
            ...(q.marks
              ? [
                  new TextRun({
                    text: `   [${q.marks} Marks]`,
                    bold: true,
                    size: 18,
                  }),
                ]
              : []),
          ],
        })
      );

      if (q.passage) {
        docChildren.push(
          new Paragraph({
            indent: { left: 300, right: 300 },
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: q.passage,
                italics: true,
                size: 18,
              }),
            ],
          })
        );
      }

      if (q.visualContext) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 30, after: 40 },
            children: [
              new TextRun({
                text: `[ ${q.visualContext} ]`,
                italics: true,
                size: 18,
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
              spacing: { before: 30, after: 40 },
              children: [
                new TextRun({
                  text: item,
                  size: 20,
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
              spacing: { before: 30, after: 40 },
              children: [
                new TextRun({
                  text: `${sq.label}  ${sq.prompt}${sq.marks ? ` [${sq.marks}M]` : ''} ${
                    sq.answerBlank || ''
                  }`,
                  size: 19,
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
                    children: [new TextRun({ text: 'Column A', bold: true, size: 19 })],
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
                    children: [new TextRun({ text: 'Column B', bold: true, size: 19 })],
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
                        spacing: { before: 30, after: 30 },
                        children: [new TextRun({ text: `${idx + 1}.  ${pair.left}`, size: 19 })],
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
                        spacing: { before: 30, after: 30 },
                        children: [
                          new TextRun({
                            text: `(    )  ${String.fromCharCode(65 + idx)}.  ${pair.right}`,
                            size: 19,
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
            spacing: { before: 30, after: 40 },
            children: [
              new TextRun({
                text: q.options.map((opt, i) => `(${String.fromCharCode(97 + i)}) ${opt}`).join('      '),
                size: 19,
              }),
            ],
          })
        );
      }

      const lines = q.blankLinesCount || (q.type === 'short_answer' || q.type === 'long_answer' ? 2 : 0);
      for (let l = 0; l < lines; l++) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({
                text: '_________________________________________________________________________________',
                color: '888888',
                size: 15,
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

