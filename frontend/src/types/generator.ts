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
  id?: string;
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


export interface PDFAnalysisResult {
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

export interface SavedWorksheetRecord {
  id: string;
  title: string;
  schoolName: string;
  schoolSubHeader: string;
  academicYear: string;
  examName: string;
  worksheetNumber: string;
  className: string;
  subjectName: string;
  chapterName?: string;
  topicName?: string;
  createdAt: string;
  content: WorksheetData;
}

export interface SavedQuestionPaperRecord {
  id: string;
  title: string;
  schoolName: string;
  schoolSubHeader: string;
  academicYear: string;
  examName: string;
  className: string;
  subjectName: string;
  totalMarks: number;
  duration: string;
  createdAt: string;
  content: QuestionPaperData;
}
