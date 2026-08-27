import { api } from './client';
import type {
  WorksheetData,
  QuestionPaperData,
  PDFAnalysisResult,
  SavedWorksheetRecord,
  SavedQuestionPaperRecord,
} from '@/types/generator';


function extractData<T>(response: any): T {
  if (response?.data && typeof response.data === 'object') {
    const raw = response.data;
    if ('data' in raw) {
      const d = raw.data;
      if (d && typeof d === 'object' && 'data' in d) {
        return (d.data ?? d) as T;
      }
      return d as T;
    }
    return raw as T;
  }
  return response?.data as T;
}


export const generatorApi = {
  // --- Worksheet Endpoints ---

  analyzePdf: async (params: {
    extractedText?: string;
    fileName?: string;
    documentId?: string;
  }): Promise<PDFAnalysisResult> => {
    const res = await api.post('/worksheets/analyze-pdf', params);
    return extractData<PDFAnalysisResult>(res);
  },

  generateWorksheet: async (params: {
    sourceContent?: string;
    documentId?: string;
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
  }): Promise<WorksheetData> => {
    const res = await api.post('/worksheets/generate', params);
    return extractData<WorksheetData>(res);
  },

  downloadWorksheetPdf: async (worksheetData: WorksheetData): Promise<Blob> => {
    const res = await api.post('/worksheets/export/pdf', { worksheetData }, {
      responseType: 'blob',
    });
    return res.data;
  },

  downloadWorksheetDocx: async (worksheetData: WorksheetData): Promise<Blob> => {
    const res = await api.post('/worksheets/export/docx', { worksheetData }, {
      responseType: 'blob',
    });
    return res.data;
  },

  saveWorksheet: async (worksheetData: WorksheetData, documentId?: string): Promise<any> => {
    const res = await api.post('/worksheets/save', { worksheetData, documentId });
    return extractData(res);
  },

  getSavedWorksheets: async (): Promise<SavedWorksheetRecord[]> => {
    const res = await api.get('/worksheets');
    return extractData<SavedWorksheetRecord[]>(res) || [];
  },

  getWorksheetById: async (id: string): Promise<SavedWorksheetRecord> => {
    const res = await api.get(`/worksheets/${id}`);
    return extractData<SavedWorksheetRecord>(res);
  },

  deleteWorksheet: async (id: string): Promise<void> => {
    await api.delete(`/worksheets/${id}`);
  },

  // --- Question Paper Endpoints ---

  generateQuestionPaper: async (params: {
    sourceWorksheetIds?: string[];
    sourceWorksheetTexts?: string[];
    studyMaterialId?: string;
    studyMaterialText?: string;
    className: string;
    subjectName: string;
    examName?: string;
    academicYear?: string;
    totalMarks?: number;
    duration?: string;
    questionCount?: number;
    difficulty?: string;
  }): Promise<QuestionPaperData> => {
    const res = await api.post('/question-papers/generate', params);
    return extractData<QuestionPaperData>(res);
  },

  downloadQuestionPaperPdf: async (questionPaperData: QuestionPaperData): Promise<Blob> => {
    const res = await api.post('/question-papers/export/pdf', { questionPaperData }, {
      responseType: 'blob',
    });
    return res.data;
  },

  downloadQuestionPaperDocx: async (questionPaperData: QuestionPaperData): Promise<Blob> => {
    const res = await api.post('/question-papers/export/docx', { questionPaperData }, {
      responseType: 'blob',
    });
    return res.data;
  },

  saveQuestionPaper: async (questionPaperData: QuestionPaperData): Promise<any> => {
    const res = await api.post('/question-papers/save', { questionPaperData });
    return extractData(res);
  },

  getSavedQuestionPapers: async (): Promise<SavedQuestionPaperRecord[]> => {
    const res = await api.get('/question-papers');
    return extractData<SavedQuestionPaperRecord[]>(res) || [];
  },

  getQuestionPaperById: async (id: string): Promise<SavedQuestionPaperRecord> => {
    const res = await api.get(`/question-papers/${id}`);
    return extractData<SavedQuestionPaperRecord>(res);
  },

  deleteQuestionPaper: async (id: string): Promise<void> => {
    await api.delete(`/question-papers/${id}`);
  },
};
