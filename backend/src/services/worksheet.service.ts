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
  section?: string;
  type: string;
  instruction: string;
  marks?: number;
  passage?: string;
  items?: string[];
  subQuestions?: Array<{
    label: string;
    prompt: string;
    marks?: number;
    answerBlank?: string;
    options?: string[];
  }>;
  matchingPairs?: Array<{
    left: string;
    right: string;
  }>;
  options?: string[];
  blankLinesCount?: number;
  visualContext?: string;
  answerKey?: string;
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
   * Helper to categorize class/grade level for pedagogical tuning
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
   * AI Analysis of PDF text content across all academic levels
   */
  async analyzeContent(extractedText: string, fileName?: string): Promise<WorksheetAnalysisResult> {
    const systemPrompt = `You are an expert curriculum and educational assessment specialist for Krishna English School (KES).
Analyze the provided educational study material across any school level (from Kindergarten/Pre-Primary, Primary Classes 1-5, Middle School 6-8, to High School 9-12).
Extract accurate, syllabus-aligned pedagogical metadata.
Respond ONLY with a valid JSON object without markdown code blocks or conversational text.`;

    const userPrompt = `Analyze this educational material (Source: ${fileName || 'Uploaded Study Material'}):

"""
${extractedText.slice(0, 14000)}
"""

Extract and return a JSON object with these exact keys:
{
  "detectedSubject": "Subject (e.g., English, Mathematics, Environmental Studies, Science, Social Science, Physics, Chemistry, Biology, Hindi, Gujarati, Computer Science)",
  "detectedClass": "Target standard or level (e.g., Nursery, JR.KG, SR.KG, Class 1, Class 2, Class 3, Class 4, Class 5, Class 6, Class 7, Class 8, Class 9, Class 10, Class 11, Class 12)",
  "detectedChapter": "Identified chapter title or theme",
  "detectedTopic": "Main topic / core concept",
  "keyConcepts": ["Specific concept 1", "Specific concept 2", "Specific concept 3"],
  "vocabulary": ["Key term 1", "Key term 2", "Key term 3", "Key term 4"],
  "suggestedQuestionTypes": [
    "List 4-6 appropriate question format IDs suited for this class level from: mcq, fill_in_blanks, match_the_following, true_false, short_answer, long_answer, comprehension, numerical, diagram_label, missing_letters, before_after_between, picture_identification, count_and_write, odd_one_out, assertion_reason, distinction_table"
  ],
  "recommendedDifficulty": "Easy" | "Medium" | "Hard" | "Mixed",
  "summary": "2-3 sentence academic overview explaining the educational concepts taught in this text"
}`;

    try {
      const response = await aiService.generateAuto({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 1500,
      });

      const cleaned = this.cleanJsonString(response.content);
      const parsed = JSON.parse(cleaned);
      return {
        detectedSubject: parsed.detectedSubject || 'General Studies',
        detectedClass: parsed.detectedClass || 'Class 1',
        detectedChapter: parsed.detectedChapter || '',
        detectedTopic: parsed.detectedTopic || '',
        keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
        vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
        suggestedQuestionTypes: Array.isArray(parsed.suggestedQuestionTypes)
          ? parsed.suggestedQuestionTypes
          : ['fill_in_blanks', 'mcq', 'short_answer'],
        recommendedDifficulty: parsed.recommendedDifficulty || 'Medium',
        summary: parsed.summary || 'Study material successfully analyzed.',
      };
    } catch (error) {
      console.error('[WorksheetService] Analysis error:', error);
      return {
        detectedSubject: 'General Studies',
        detectedClass: 'Class 1',
        detectedChapter: '',
        detectedTopic: '',
        keyConcepts: ['Core curriculum concepts'],
        vocabulary: [],
        suggestedQuestionTypes: ['fill_in_blanks', 'mcq', 'short_answer'],
        recommendedDifficulty: 'Medium',
        summary: 'Study material extracted and ready for worksheet generation.',
      };
    }
  }

  /**
   * Generate structured worksheet using AI adapted to target class level
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
    teacherPrompt?: string;
  }): Promise<WorksheetData> {
    const questionCount = params.questionCount || 5;
    const difficulty = params.difficulty || 'Medium';
    const schoolName = 'KRISHNA ENGLISH SCHOOL';
    const schoolSubHeader = 'Pre-Primary-Primary-Secondary School';
    const academicYear = params.academicYear || '2026-27';
    const examName = params.examName || 'Worksheet FA 1';
    const worksheetNumber = params.worksheetNumber || '1';
    const className = params.className || 'Class 1';
    const subjectName = params.subjectName || 'ENGLISH';
    const levelCategory = this.categorizeClassLevel(className);

    // Pedagogical instructions tailored by grade tier
    let levelPedagogy = '';
    if (levelCategory === 'pre_primary') {
      levelPedagogy = `
TARGET LEVEL: Pre-Primary / Kindergarten (${className})
- Use fun, visual, foundational early-childhood activities.
- Suitable formats: Missing letters/numbers (e.g. A _ C _ E), What comes before/after/between, Picture identification (use text symbols/emojis like [🍎 🍎 🍎] in visualContext), Match the following (simple everyday objects/words), Count and write, Circle/Tick the correct answer, Odd one out.
- Keep instructions extremely short and simple (e.g., "Count and write the number in the box.", "Circle the odd one.").`;
    } else if (levelCategory === 'primary') {
      levelPedagogy = `
TARGET LEVEL: Primary School Classes 1 to 5 (${className})
- Focus on foundational grammar, vocabulary, sentence construction, basic arithmetic / word problems, science observations, and simple reading comprehension.
- Suitable formats: Fill in the blanks (with word bank provided in visualContext), Multiple Choice Questions (MCQs with 4 options), True or False with simple reason, Match definitions/terms, Short 1-2 sentence questions, Reading passage with 2-3 sub-questions, Simple word problems.`;
    } else if (levelCategory === 'middle') {
      levelPedagogy = `
TARGET LEVEL: Middle School Classes 6 to 8 (${className})
- Focus on conceptual clarity, scientific definitions, mathematical calculations, historical/geographical facts, grammar rules, and reading comprehension.
- Suitable formats: Section-based exercises, Multiple Choice Questions (MCQs), Fill in the blanks, Match Column A with Column B, Short Answer questions (2-3 marks), Distinguish between terms / comparison, Diagram labelling descriptions, Step-by-step problem solving.`;
    } else {
      levelPedagogy = `
TARGET LEVEL: Secondary & Higher Classes 9 to 12 (${className})
- Focus on rigorous academic assessment, critical thinking, problem-solving, analytical comprehension, and structured examination questions.
- Suitable formats: Structured Sections (Section A: Objective/MCQs/Assertion-Reason, Section B: Short Answer Type, Section C: Long Answer / Analytical / Derivations / Case Studies / Numerical problems).
- Include comprehensive question stems, proper marks allocation per question, and clear answer prompts.`;
    }

    const typeConstraints = params.questionTypes && params.questionTypes.length > 0
      ? `Teacher preferred question formats to incorporate: ${params.questionTypes.join(', ')}`
      : `Automatically select the most pedagogically sound mix of question formats for ${className} ${subjectName}.`;

    const teacherDirective = params.teacherPrompt
      ? `\nSPECIAL TEACHER INSTRUCTIONS (Highest Priority!):\n"""\n${params.teacherPrompt}\n"""\n`
      : '';

    const systemPrompt = `You are the master curriculum author for Krishna English School.
Your task is to generate an authentic, class-appropriate printable school worksheet grounded strictly in the provided study material.
Follow the traditional Krishna English School worksheet format:
- School: ${schoolName}
- Sub-header: ${schoolSubHeader}
- Document: Worksheet ${examName} (${academicYear})
- Student details: Name: __________, Sub.: ${subjectName}, Std: ${className}

${levelPedagogy}
${teacherDirective}
${typeConstraints}

RULES:
1. Generate exactly ${questionCount} meaningful, diverse questions strictly based on the extracted study material.
2. Ensure high academic quality: grammatically correct, factual, age-appropriate difficulty (${difficulty}).
3. For multiple-choice questions, provide exactly 4 clear options (a, b, c, d).
4. For matching questions, provide matchingPairs with left and right columns.
5. For sub-questions (e.g. before/after, series, comprehension sub-parts), provide subQuestions array with labels (a, b, c).
6. Total marks must be distributed reasonably across questions (typically 20 to 25 marks total).
7. Respond ONLY with valid JSON. Do not include markdown code block formatting.`;

    const userPrompt = `Source Study Material Content:
"""
${params.sourceContent.slice(0, 16000)}
"""

Target Worksheet Specifications:
- Class / Standard: ${className}
- Subject: ${subjectName}
- Chapter: ${params.chapterName || 'Curriculum Topics'}
- Topic: ${params.topicName || 'Key Concepts'}
- Target Questions Count: ${questionCount}
- Difficulty Level: ${difficulty}

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
  "instructions": ["Read each question carefully and write your answers neatly in the space provided."],
  "totalMarks": 25,
  "questions": [
    {
      "number": 1,
      "section": "Section A",
      "type": "mcq | fill_in_blanks | match_the_following | true_false | short_answer | long_answer | numerical | comprehension | missing_letters | before_after_between | picture_identification | count_and_write",
      "instruction": "Question instruction string",
      "marks": 5,
      "passage": "Optional reading passage or case study text",
      "visualContext": "Optional visual clue description or symbols",
      "items": ["Item or sentence 1", "Item or sentence 2"],
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "subQuestions": [
        {"label": "a)", "prompt": "Sub-question prompt", "answerBlank": "Optional blank format"}
      ],
      "matchingPairs": [
        {"left": "Item 1", "right": "Matching definition 1"}
      ],
      "blankLinesCount": 2,
      "answerKey": "Correct answer / brief explanation"
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
   * Word wrap helper for PDF text drawing
   */
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
   * Generate real printable PDF using pdf-lib with dynamic multi-page wrapping
   */
  async generatePdf(data: WorksheetData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (width x height)
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
        // Draw page footer on old page
        const footerText = `Page ${currentPageIndex}`;
        page.drawText(footerText, {
          x: (pageWidth - fontRegular.widthOfTextAtSize(footerText, 8)) / 2,
          y: 30,
          size: 8,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
        });

        // Add new page
        page = pdfDoc.addPage([595.28, 841.89]);
        currentPageIndex++;
        y = 800;

        // Repeat minimal header on continuation page
        const headerText = this.sanitizeForPdf(
          `${data.schoolName} - ${data.examName} (${data.className} ${data.subjectName})`
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

    // Draw Primary School Header (Page 1)
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
      `Worksheet ${data.examName} · Academic Year ${data.academicYear}`
    );
    page.drawText(examTitle, {
      x: (pageWidth - fontBold.widthOfTextAtSize(examTitle, 10.5)) / 2,
      y,
      size: 10.5,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 12;

    // Header divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1.2,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 16;

    // Student Details
    const nameText = 'Name: _______________________________________________________________';
    page.drawText(nameText, {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const subStdText = this.sanitizeForPdf(
      `Std / Class: ${data.className.toUpperCase()}            Subject: ${data.subjectName.toUpperCase()}${
        data.totalMarks ? `            Max Marks: ${data.totalMarks}` : ''
      }`
    );
    page.drawText(subStdText, {
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
    y -= 18;

    let currentSection = '';

    // Render Questions
    for (const q of data.questions) {
      // Check for section header change
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

      // Reading Passage or Case Study if present
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

      // 1. Items or missing letters
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

          // Options within sub-question if any
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

      // 4. Options for MCQs
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

      y -= 10; // Space between questions
    }

    // Final page footer
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
  async generateDocx(data: WorksheetData): Promise<Buffer> {
    const docChildren: (Paragraph | Table)[] = [];

    // Header School Name
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 40 },
        children: [
          new TextRun({
            text: data.schoolName.toUpperCase(),
            bold: true,
            size: 28, // 14pt
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
            size: 19, // 9.5pt
            font: 'Helvetica',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `Worksheet ${data.examName} · Academic Year ${data.academicYear}`,
            bold: true,
            size: 21,
            font: 'Helvetica',
          }),
        ],
      })
    );

    // Student info block
    docChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text: 'Name: ____________________________________________________________________',
            bold: true,
            size: 19,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 20, after: 140 },
        children: [
          new TextRun({
            text: `Std / Class: ${data.className.toUpperCase()}            Subject: ${data.subjectName.toUpperCase()}${
              data.totalMarks ? `            Max Marks: ${data.totalMarks}` : ''
            }`,
            bold: true,
            size: 19,
          }),
        ],
      })
    );

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
