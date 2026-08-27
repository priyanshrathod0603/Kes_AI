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
  categorizeClassLevel(className: string): 'pre_primary' | 'primary' | 'middle' | 'secondary' {
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
    // Check Secondary (9 to 12) first so '10' doesn't match '1'
    if (
      /\b(9|10|11|12|ix|x|xi|xii)\b/.test(norm) ||
      norm.includes('secondary') ||
      norm.includes('higher') ||
      norm.includes('class 9') ||
      norm.includes('class 10') ||
      norm.includes('class 11') ||
      norm.includes('class 12') ||
      norm.includes('std 9') ||
      norm.includes('std 10') ||
      norm.includes('std 11') ||
      norm.includes('std 12') ||
      norm.includes('grade 9') ||
      norm.includes('grade 10') ||
      norm.includes('grade 11') ||
      norm.includes('grade 12')
    ) {
      return 'secondary';
    }
    // Check Middle (6 to 8)
    if (
      /\b(6|7|8|vi|vii|viii)\b/.test(norm) ||
      norm.includes('middle') ||
      norm.includes('class 6') ||
      norm.includes('class 7') ||
      norm.includes('class 8') ||
      norm.includes('std 6') ||
      norm.includes('std 7') ||
      norm.includes('std 8') ||
      norm.includes('grade 6') ||
      norm.includes('grade 7') ||
      norm.includes('grade 8')
    ) {
      return 'middle';
    }
    // Primary (1 to 5)
    if (
      /\b(1|2|3|4|5|i|ii|iii|iv|v)\b/.test(norm) ||
      norm.includes('primary') ||
      norm.includes('class 1') ||
      norm.includes('class 2') ||
      norm.includes('class 3') ||
      norm.includes('class 4') ||
      norm.includes('class 5')
    ) {
      return 'primary';
    }
    return 'primary';
  }

  /**
   * Intelligently compact and slice large context to respect context limits
   */
  private prepareContext(sourceWorksheetTexts: string[], studyMaterialText?: string): string {
    const parts: string[] = [];

    if (sourceWorksheetTexts && sourceWorksheetTexts.length > 0) {
      sourceWorksheetTexts.forEach((text, i) => {
        if (text && text.trim()) {
          parts.push(`=== SOURCE WORKSHEET ${i + 1} ===\n${text.trim()}`);
        }
      });
    }

    if (studyMaterialText && studyMaterialText.trim()) {
      const trimmed = studyMaterialText.trim();
      if (trimmed.length > 14000) {
        const head = trimmed.slice(0, 7000);
        const tail = trimmed.slice(trimmed.length - 6000);
        parts.push(`=== STUDY MATERIAL / CHAPTER REFERENCE (Sampled for Context) ===\n${head}\n\n[...]\n\n${tail}`);
      } else {
        parts.push(`=== STUDY MATERIAL / CHAPTER REFERENCE ===\n${trimmed}`);
      }
    }

    return parts.join('\n\n');
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
    schoolName?: string;
    schoolSubHeader?: string;
  }): Promise<QuestionPaperData> {
    const schoolName = params.schoolName || 'KRISHNA ENGLISH SCHOOL';
    const schoolSubHeader = params.schoolSubHeader || 'Pre-Primary-Primary-Secondary School';
    const academicYear = params.academicYear || '2026-27';
    const examName = params.examName || 'FA 1 EXAMINATION';
    const className = params.className || 'Class 1';
    const subjectName = params.subjectName || 'ENGLISH';
    const totalMarks = Number(params.totalMarks) || 25;
    const duration = params.duration || '1 Hour';
    const questionCount = Number(params.questionCount) || 5;
    const difficulty = params.difficulty || 'Medium';
    const levelCategory = this.categorizeClassLevel(className);

    const aggregatedContext = this.prepareContext(params.sourceWorksheetTexts, params.studyMaterialText);

    // Section and examination blueprints strictly tailored by academic tier
    let examBlueprint = '';
    if (levelCategory === 'pre_primary') {
      examBlueprint = `
EXAM BLUEPRINT: Pre-Primary / Kindergarten (${className})
- Design interactive, visual, foundational evaluation questions suitable for early learners.
- Permitted Question Formats:
  1. Missing letters / sequence completion
  2. What comes before / after / between
  3. Picture / Symbol recognition with text clues (use visualContext)
  4. Matching items (Column A to Column B)
  5. Count and write / Circle the correct number or item
  6. Simple Multiple Choice / Tick the correct answer
- Do NOT use heavy essay, long answer, or complex secondary questions.
- Distribute marks evenly across questions so the sum equals exactly ${totalMarks} Marks.`;
    } else if (levelCategory === 'primary') {
      examBlueprint = `
EXAM BLUEPRINT: Primary School Classes 1 to 5 (${className})
- Structure into organized, age-appropriate examination sections:
  * SECTION A: OBJECTIVE & VOCABULARY (MCQs, Fill in the blanks, True/False, Match the following) [1 Mark each]
  * SECTION B: SHORT QUESTIONS & CONCEPT APPLICATION (Grammar exercises, Math problems, Short 1-2 sentence answers) [2-3 Marks each]
- Ensure language and question difficulty match Class 1-5 standards. Do NOT use kindergarten missing letter formats unless specifically requested.
- Total marks allocated across all questions MUST sum to exactly ${totalMarks} Marks.`;
    } else if (levelCategory === 'middle') {
      examBlueprint = `
EXAM BLUEPRINT: Middle School Classes 6 to 8 (${className})
- Formal exam blueprint with section hierarchy:
  * SECTION A: OBJECTIVE & CONCEPTUAL (MCQs, One-word/One-sentence answers) [1 Mark each]
  * SECTION B: SHORT ANSWER & DIFFERENTIATION (Short explanations, Definitions, Problem solving, Differentiate between) [2-3 Marks each]
  * SECTION C: LONG ANSWER & ANALYTICAL (Descriptive answers, Diagram-based questions, Step-by-step problem solving) [4-5 Marks each]
- Ground all questions strictly in the source concepts. Total marks MUST sum to exactly ${totalMarks} Marks.`;
    } else {
      examBlueprint = `
EXAM BLUEPRINT: Secondary & Higher Classes 9 to 12 (${className})
- Formal board-style examination paper with structured sections:
  * SECTION A: OBJECTIVE TYPE & ASSERTION-REASON (MCQs, Assertion-Reasoning, 1-Mark short facts) [1 Mark each]
  * SECTION B: SHORT ANSWER TYPE I (Conceptual definitions, 2-mark calculations/formulas) [2 Marks each]
  * SECTION C: SHORT ANSWER TYPE II (3-mark derivations, experimental setups, chemical equations, mathematical proofs) [3 Marks each]
  * SECTION D: LONG ANSWER & CASE STUDY (5-mark comprehensive problem solving, case study passage with sub-questions, detailed derivations) [4-5 Marks each]
- Maintain rigorous secondary school standards. Total marks across all questions MUST sum to exactly ${totalMarks} Marks.`;
    }

    const teacherDirective = params.teacherPrompt
      ? `\nTEACHER SPECIAL BLUEPRINT INSTRUCTIONS (Highest Priority - Override defaults if specified):\n"""\n${params.teacherPrompt}\n"""\n`
      : '';

    const systemPrompt = `You are the master examination controller and paper setter for Krishna English School.
Create a formal, balanced, syllabus-aligned examination question paper based on the curriculum content taught in the provided worksheets and study material.
Follow the formal examination format:
- School: ${schoolName}
- Sub-header: ${schoolSubHeader}
- Exam: ${examName} (${academicYear})
- Header fields: Name: __________, Class: ${className}, Subject: ${subjectName}, Time: ${duration}, Max Marks: ${totalMarks}

${examBlueprint}
${teacherDirective}

STRICT RULES:
1. Synthesize fresh examination questions testing the underlying concepts grounded directly in the uploaded source content.
2. Generate approximately ${questionCount} structured questions.
3. MATHEMATICAL VALIDATION: Every question MUST have an explicit "marks" integer, and the SUM of marks for all questions MUST equal exactly ${totalMarks}.
4. Sub-questions: If a question has "subQuestions", their individual marks MUST sum up to the question's total "marks".
5. Difficulty Level: ${difficulty}.
6. Keep instructions, questions, and answerKeys concise (1-2 lines each) so the entire JSON is compact, complete, and fits within limits.
7. Respond ONLY with valid JSON. Do not include markdown code block formatting or commentary.`;

    const userPrompt = `Curriculum & Syllabus Content (Source Materials):
"""
${aggregatedContext}
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
} focus on conciseness so the entire output JSON is complete.`;

    const response = await aiService.generateAuto({
      systemPrompt,
      userPrompt,
      temperature: 0.25,
      maxTokens: 5000,
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

    // Mathematical Marks Validation & Exact Normalization
    this.normalizeMarks(parsed, totalMarks);

    return parsed;
  }

  /**
   * Regenerates a single question inside an existing question paper
   */
  async regenerateSingleQuestion(params: {
    questionIndex: number;
    currentQuestion: WorksheetQuestionItem;
    allQuestions: WorksheetQuestionItem[];
    className: string;
    subjectName: string;
    totalMarks: number;
    targetMarks?: number;
    sourceContext?: string;
    teacherPrompt?: string;
  }): Promise<WorksheetQuestionItem> {
    const className = params.className || 'Class 1';
    const subjectName = params.subjectName || 'ENGLISH';
    const targetMarks = params.targetMarks || params.currentQuestion.marks || 5;
    const levelCategory = this.categorizeClassLevel(className);

    const existingInstructions = params.allQuestions
      .filter((_, idx) => idx !== params.questionIndex)
      .map((q) => `Q.${q.number}: ${q.instruction}`)
      .join('\n');

    const systemPrompt = `You are the master examination controller for Krishna English School.
Regenerate a single, high-quality examination question for Class: ${className}, Subject: ${subjectName}.
Target Question Marks: ${targetMarks}.
Class Level Category: ${levelCategory}.

STRICT REQUIREMENTS:
1. Generate a NEW, syllabus-aligned question grounded in the source curriculum.
2. Do NOT duplicate any of the other existing questions on the paper.
3. The question marks MUST equal exactly ${targetMarks}.
4. If sub-questions are included, their marks MUST sum up to exactly ${targetMarks}.
5. Respond ONLY with a valid JSON object matching the single question schema.`;

    const userPrompt = `Source Curriculum Context:
"""
${(params.sourceContext || '').slice(0, 8000)}
"""

Existing Questions on Paper (Do not duplicate!):
${existingInstructions || 'None'}

Current Question being replaced:
Type: ${params.currentQuestion.type}
Instruction: ${params.currentQuestion.instruction}
Target Marks: ${targetMarks}
Section: ${params.currentQuestion.section || 'SECTION A'}
${params.teacherPrompt ? `Teacher Instructions: ${params.teacherPrompt}` : ''}

Return a valid JSON object for this single question:
{
  "number": ${params.currentQuestion.number || params.questionIndex + 1},
  "section": "${params.currentQuestion.section || 'SECTION A'}",
  "type": "${params.currentQuestion.type || 'short_answer'}",
  "instruction": "Fresh question instruction",
  "marks": ${targetMarks},
  "passage": "Optional passage or case study",
  "visualContext": "Optional visual clue",
  "items": ["Optional item list"],
  "options": ["Optional option A", "Optional option B", "Optional option C", "Optional option D"],
  "subQuestions": [
    {"label": "a)", "prompt": "Sub-question prompt", "marks": 1, "answerBlank": "Optional blank"}
  ],
  "matchingPairs": [
    {"left": "Item 1", "right": "Matching item 1"}
  ],
  "blankLinesCount": 2,
  "answerKey": "Summary of answers"
}`;

    const response = await aiService.generateAuto({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1500,
    });

    const cleaned = this.cleanJsonString(response.content);
    let regeneratedQ: WorksheetQuestionItem;
    try {
      regeneratedQ = JSON.parse(cleaned);
    } catch (e) {
      console.error('[QuestionPaperService] Failed to parse regenerated question JSON:', response.content);
      throw new Error('AI generated invalid question structure for single question regeneration.');
    }

    regeneratedQ.number = params.currentQuestion.number || params.questionIndex + 1;
    regeneratedQ.marks = targetMarks;

    return regeneratedQ;
  }

  /**
   * Mathematically validates and normalizes questions marks to equal totalMarks exactly
   */
  normalizeMarks(parsed: QuestionPaperData, targetTotal: number) {
    if (!parsed.questions || parsed.questions.length === 0) return;

    let currentSum = 0;
    for (const q of parsed.questions) {
      if (!q.marks || q.marks < 1) q.marks = 1;
      currentSum += q.marks;
    }

    if (currentSum !== targetTotal) {
      const diff = targetTotal - currentSum;
      const lastQ = parsed.questions[parsed.questions.length - 1];
      lastQ.marks = Math.max(1, (lastQ.marks || 1) + diff);
    }

    // Re-verify sub-questions
    for (const q of parsed.questions) {
      if (q.subQuestions && q.subQuestions.length > 0) {
        let subSum = q.subQuestions.reduce((acc, sq) => acc + (sq.marks || 1), 0);
        if (subSum !== q.marks) {
          const subDiff = (q.marks || 1) - subSum;
          const lastSq = q.subQuestions[q.subQuestions.length - 1];
          lastSq.marks = Math.max(1, (lastSq.marks || 1) + subDiff);
        }
      }
    }
  }

  private cleanJsonString(str: string): string {
    if (!str) return '{}';
    let s = str.trim();
    if (s.startsWith('```json')) {
      s = s.slice(7);
    } else if (s.startsWith('```')) {
      s = s.slice(3);
    }
    if (s.endsWith('```')) {
      s = s.slice(0, -3);
    }
    s = s.trim();

    // Find bounding braces
    const firstBrace = s.indexOf('{');
    const lastBrace = s.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      s = s.substring(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1) {
      s = s.substring(firstBrace);
      // Attempt simple closure if truncated
      let openBraces = 0;
      let openBrackets = 0;
      let inString = false;
      let escaped = false;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (c === '\\') {
          escaped = true;
          continue;
        }
        if (c === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (c === '{') openBraces++;
          else if (c === '}') openBraces--;
          else if (c === '[') openBrackets++;
          else if (c === ']') openBrackets--;
        }
      }
      if (inString) s += '"';
      while (openBrackets > 0) {
        s += ']';
        openBrackets--;
      }
      while (openBraces > 0) {
        s += '}';
        openBraces--;
      }
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

