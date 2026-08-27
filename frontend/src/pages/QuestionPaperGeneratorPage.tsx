import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generatorApi } from '@/api/generatorApi';
import { documentApi } from '@/api/documentApi';
import type { QuestionPaperData, PDFAnalysisResult } from '@/types/generator';

import { QuestionPaperPreview } from '@/components/generator/QuestionPaperPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileQuestion,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  X,
  BookOpen,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const CLASS_PRESETS = [
  { group: 'Pre-Primary', items: ['Nursery', 'JR.KG', 'SR.KG'] },
  { group: 'Primary School', items: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  { group: 'Middle School', items: ['Class 6', 'Class 7', 'Class 8'] },
  { group: 'Secondary & Higher', items: ['Class 9', 'Class 10', 'Class 11', 'Class 12'] },
];

const SUBJECT_PRESETS = [
  'ENGLISH',
  'MATHEMATICS',
  'EVS / SCIENCE',
  'SOCIAL SCIENCE',
  'HINDI',
  'GUJARATI',
  'PHYSICS',
  'CHEMISTRY',
  'BIOLOGY',
  'COMPUTER SCIENCE',
];

export function QuestionPaperGeneratorPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Source selection tabs & state
  const [sourceTab, setSourceTab] = useState<'upload' | 'library' | 'worksheets'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<string[]>([]);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Scanning & Analysis state
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysisResult | null>(null);

  // Exam Settings
  const [examName, setExamName] = useState<string>('FA 1 EXAMINATION');
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [className, setClassName] = useState<string>('Class 1');
  const [customClass, setCustomClass] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('ENGLISH');
  const [totalMarks, setTotalMarks] = useState<number>(25);
  const [duration, setDuration] = useState<string>('1 Hour');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [teacherPrompt, setTeacherPrompt] = useState<string>('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<QuestionPaperData | null>(null);

  // Queries
  const { data: savedWorksheetsData } = useQuery({
    queryKey: ['available-source-worksheets'],
    queryFn: () => generatorApi.getSavedWorksheets(),
  });

  const { data: documentsData, refetch: refetchDocs } = useQuery({
    queryKey: ['study-materials-library'],
    queryFn: () => documentApi.getDocuments({ limit: 50 }),
  });

  const { data: savedPapersData, refetch: refetchSavedPapers } = useQuery({
    queryKey: ['saved-question-papers-history'],
    queryFn: () => generatorApi.getSavedQuestionPapers(),
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processUploadedFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid PDF document.',
        variant: 'destructive',
      });
      return;
    }

    setUploadError(null);
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(formatFileSize(file.size));
    setIsScanning(true);
    setUploadProgress(20);
    setAnalysis(null);

    try {
      setUploadProgress(40);
      const uploadRes = await documentApi.uploadDocument({
        file,
        documentType: 'STUDY_MATERIAL',
      });

      const docId = uploadRes.data?.id;
      if (!docId) throw new Error('Upload succeeded but no document ID returned.');

      setUploadedDocId(docId);
      refetchDocs();
      setUploadProgress(70);

      let contentRes = await documentApi.getDocumentContent(docId);
      if (!contentRes?.text) {
        await new Promise((r) => setTimeout(r, 1000));
        contentRes = await documentApi.getDocumentContent(docId);
      }

      const text = contentRes?.text || 'Study material uploaded.';
      setExtractedContent(text);
      setUploadProgress(85);

      const analysisResult = await generatorApi.analyzePdf({
        extractedText: text,
        fileName: file.name,
        documentId: docId,
      });

      setAnalysis(analysisResult);
      if (analysisResult.detectedClass) setClassName(analysisResult.detectedClass);
      if (analysisResult.detectedSubject) setSubjectName(analysisResult.detectedSubject.toUpperCase());

      setUploadProgress(100);
      toast({
        title: 'PDF Uploaded & Scanned',
        description: `Successfully analyzed ${file.name} for ${analysisResult.detectedClass || 'curriculum'}!`,
      });
    } catch (err: any) {
      console.error('[Upload Error]', err);
      setUploadError(err.message || 'Failed to scan uploaded reference PDF.');
      toast({
        title: 'Upload/Analysis Error',
        description: err.message || 'Failed to scan uploaded reference PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setUploadProgress(null), 800);
    }
  };

  // Handle Direct PDF Upload via input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadedDocId('');
    setExtractedContent('');
    setAnalysis(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle Library Document Selection
  const toggleDocSelect = async (docId: string) => {
    setSelectedDocIds((prev) => {
      const next = prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId];
      return next;
    });

    // If first selection, load and analyze context
    if (!selectedDocIds.includes(docId) && selectedDocIds.length === 0) {
      try {
        const doc = await documentApi.getDocument(docId);
        const contentRes = await documentApi.getDocumentContent(docId);
        const text = contentRes?.text || '';
        if (text) {
          setExtractedContent(text);
          const analysisResult = await generatorApi.analyzePdf({
            extractedText: text,
            fileName: doc?.title,
            documentId: docId,
          });
          setAnalysis(analysisResult);
          if (analysisResult.detectedClass) setClassName(analysisResult.detectedClass);
          if (analysisResult.detectedSubject) setSubjectName(analysisResult.detectedSubject.toUpperCase());
        }
      } catch (e) {
        console.warn('Could not auto-analyze selected library doc:', e);
      }
    }
  };

  // Toggle Worksheet Selection
  const toggleWorksheetSelect = (id: string) => {
    setSelectedWorksheetIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (next.length === 1 && savedWorksheetsData) {
        const found = savedWorksheetsData.find((w) => w.id === next[0]);
        if (found) {
          if (found.className) setClassName(found.className);
          if (found.subjectName) setSubjectName(found.subjectName.toUpperCase());
        }
      }
      return next;
    });
  };

  // Total active sources count
  const allDocIds = Array.from(new Set([...selectedDocIds, ...(uploadedDocId ? [uploadedDocId] : [])]));
  const hasAnySource = allDocIds.length > 0 || selectedWorksheetIds.length > 0 || !!extractedContent;

  const handleGenerate = async () => {
    if (!hasAnySource) {
      toast({
        title: 'Source Required',
        description: 'Please upload a PDF, select a study material document, or select at least one worksheet.',
        variant: 'destructive',
      });
      return;
    }

    const effectiveClass = className === 'custom' ? customClass : className;
    if (!effectiveClass) {
      toast({
        title: 'Class Required',
        description: 'Please specify the target class/standard.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatorApi.generateQuestionPaper({
        sourceDocumentIds: allDocIds,
        studyMaterialId: allDocIds[0] || undefined,
        studyMaterialText: extractedContent || undefined,
        sourceWorksheetIds: selectedWorksheetIds,
        className: effectiveClass,
        subjectName,
        examName,
        academicYear,
        totalMarks,
        duration,
        questionCount,
        difficulty,
        teacherPrompt: teacherPrompt.trim() || undefined,
      });

      setGeneratedPaper(result);
      refetchSavedPapers();
      toast({
        title: 'Question Paper Generated',
        description: `${examName} for ${subjectName} (${effectiveClass}) is ready!`,
      });
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Failed to generate question paper. Please check source materials.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generatorApi.deleteQuestionPaper(id);
      refetchSavedPapers();
      toast({
        title: 'Deleted',
        description: 'Question paper removed from history.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Could not delete question paper.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <FileQuestion className="w-7 h-7 text-primary-600" />
          AI Question Paper Generator
        </h1>
        <p className="text-foreground-muted text-sm sm:text-base">
          Generate formal school examination papers from reference PDFs, study materials, and worksheets.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Source & Exam Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Worksheets & Study Materials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  1
                </span>
                Source Worksheets & Syllabus
              </CardTitle>
              <CardDescription>
                Choose the material from which the AI should prepare the examination paper.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceTab('upload')}
                  className={`py-1.5 rounded-md transition-colors text-center ${
                    sourceTab === 'upload'
                      ? 'bg-surface shadow-xs text-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab('library')}
                  className={`py-1.5 rounded-md transition-colors text-center ${
                    sourceTab === 'library'
                      ? 'bg-surface shadow-xs text-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  From Library ({documentsData?.data?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab('worksheets')}
                  className={`py-1.5 rounded-md transition-colors text-center ${
                    sourceTab === 'worksheets'
                      ? 'bg-surface shadow-xs text-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Worksheets ({savedWorksheetsData?.length || 0})
                </button>
              </div>

              {/* Tab 1: Upload Reference PDF */}
              {sourceTab === 'upload' && (
                <div className="space-y-3">
                  {!uploadedFileName ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40'
                          : 'border-border hover:border-primary-400 bg-surface'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        id="qp-pdf-upload"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Upload PDF / Drop PDF Here
                          </p>
                          <p className="text-xs text-foreground-muted mt-1">
                            Chapter book, curriculum notes, or question bank PDF
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Uploaded PDF State Card */
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                                {uploadedFileName}
                              </p>
                              {uploadedFileSize && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                  {uploadedFileSize}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change PDF
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="application/pdf"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              title="Remove PDF"
                              onClick={handleRemoveUploadedFile}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Pipeline Status Checkmarks */}
                        <div className="pt-1.5 border-t border-emerald-200/80 dark:border-emerald-800/80 space-y-1 text-xs text-emerald-800 dark:text-emerald-300">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PDF uploaded securely</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Content extracted & processed</span>
                          </div>
                          {analysis && (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>AI curriculum analysis completed</span>
                            </div>
                          )}
                        </div>

                        {/* AI Detection Summary */}
                        {analysis && (
                          <div className="mt-2 p-2.5 rounded-lg bg-surface border border-emerald-100 dark:border-emerald-900 text-xs space-y-1 text-foreground">
                            <p className="font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                              <Sparkles className="w-3 h-3" />
                              Detected from Document
                            </p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] pt-1">
                              <div>
                                <span className="text-foreground-muted font-semibold">Class: </span>
                                <span className="font-bold">{analysis.detectedClass || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-foreground-muted font-semibold">Subject: </span>
                                <span className="font-bold">{analysis.detectedSubject || 'N/A'}</span>
                              </div>
                              {analysis.detectedChapter && (
                                <div className="col-span-2 truncate">
                                  <span className="text-foreground-muted font-semibold">Chapter: </span>
                                  <span>{analysis.detectedChapter}</span>
                                </div>
                              )}
                              {analysis.keyConcepts && analysis.keyConcepts.length > 0 && (
                                <div className="col-span-2 truncate">
                                  <span className="text-foreground-muted font-semibold">Topics: </span>
                                  <span>{analysis.keyConcepts.slice(0, 3).join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Error Display */}
                  {uploadError && (
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Study Material Library */}
              {sourceTab === 'library' && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {documentsData?.data && documentsData.data.length > 0 ? (
                    documentsData.data.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => toggleDocSelect(doc.id)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 font-medium'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                            <span className="truncate">{doc.title}</span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-foreground-muted">
                      No documents found in library. Please use Upload PDF.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Saved Worksheets */}
              {sourceTab === 'worksheets' && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedWorksheetsData && savedWorksheetsData.length > 0 ? (
                    savedWorksheetsData.map((w) => {
                      const isChecked = selectedWorksheetIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleWorksheetSelect(w.id)}
                            className="rounded border-border text-primary-600 focus:ring-primary-500 w-4 h-4 mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">{w.title}</p>
                            <p className="text-[11px] text-foreground-muted">
                              {w.subjectName} · {w.className} · {w.examName}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-foreground-muted bg-muted/40 rounded-lg p-3">
                      <p className="font-medium">No saved worksheets found.</p>
                      <p className="text-[11px] mt-1">
                        Upload a reference PDF or choose from Library to generate your exam paper.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Scanning Indicator */}
              {isScanning && (
                <div className="flex items-center gap-2 text-xs text-primary-700 bg-primary-50 dark:bg-primary-950/50 p-2.5 rounded-lg border border-primary-200 dark:border-primary-900">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Scanning study material and extracting syllabus concepts…</span>
                </div>
              )}

              {/* Active Selection Summary */}
              {hasAnySource && !isScanning && (
                <div className="pt-2 border-t border-border text-xs space-y-1.5">
                  <p className="font-semibold text-foreground flex items-center justify-between">
                    <span>Active Sources:</span>
                    <span className="text-[11px] text-primary-600 font-bold">
                      {allDocIds.length + selectedWorksheetIds.length} source(s) selected
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {uploadedFileName && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[11px] font-medium">
                        📄 {uploadedFileName}
                      </span>
                    )}
                    {selectedDocIds.map((id) => {
                      const doc = documentsData?.data?.find((d) => d.id === id);
                      return doc ? (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 bg-surface border border-border text-foreground px-2 py-0.5 rounded text-[11px]"
                        >
                          📚 {doc.title}
                        </span>
                      ) : null;
                    })}
                    {selectedWorksheetIds.map((id) => {
                      const w = savedWorksheetsData?.find((item) => item.id === id);
                      return w ? (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 bg-surface border border-border text-foreground px-2 py-0.5 rounded text-[11px]"
                        >
                          📝 {w.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Exam Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  2
                </span>
                Examination Settings
              </CardTitle>
              <CardDescription>Configure grade level, marks distribution, and blueprint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class & Subject */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Class / Standard</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    {CLASS_PRESETS.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.items.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">-- Custom Standard --</option>
                  </select>
                  {className === 'custom' && (
                    <Input
                      value={customClass}
                      onChange={(e) => setCustomClass(e.target.value)}
                      placeholder="e.g. Grade 10 - Physics"
                      className="h-7 text-xs mt-1.5"
                    />
                  )}
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <Input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. ENGLISH"
                    className="h-8 text-xs"
                    list="qp-subject-presets-list"
                  />
                  <datalist id="qp-subject-presets-list">
                    {SUBJECT_PRESETS.map((sub) => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Exam Name & Academic Year */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Exam Name</label>
                  <Input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. FA 1 EXAMINATION"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Academic Year</label>
                  <Input
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2026-27"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Total Marks & Duration */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Total Marks</label>
                  <select
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    <option value={20}>20 Marks (Unit Test)</option>
                    <option value={25}>25 Marks (Standard FA)</option>
                    <option value={40}>40 Marks (Mid-Term)</option>
                    <option value={50}>50 Marks (Terminal)</option>
                    <option value={80}>80 Marks (Annual Exam)</option>
                    <option value={100}>100 Marks (Comprehensive)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Time Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    <option value="45 Minutes">45 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="1.5 Hours">1.5 Hours</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="2.5 Hours">2.5 Hours</option>
                    <option value="3 Hours">3 Hours</option>
                  </select>
                </div>
              </div>

              {/* Question Count & Difficulty */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    <option value={4}>4 Questions</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={6}>6 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium (Recommended)</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed Balance</option>
                  </select>
                </div>
              </div>

              {/* Teacher Special Instructions */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold block text-foreground flex items-center justify-between">
                  <span>Teacher Blueprint / Custom Instructions</span>
                  <span className="text-[10px] text-foreground-muted font-normal">Optional</span>
                </label>
                <textarea
                  value={teacherPrompt}
                  onChange={(e) => setTeacherPrompt(e.target.value)}
                  placeholder="e.g. Create a 25-mark FA-1 paper. Include MCQs, fill in the blanks, short answer questions and one long answer. Focus mainly on photosynthesis and plant parts."
                  rows={2}
                  className="w-full p-2 text-xs rounded-md border border-input bg-surface focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
                />
              </div>

              {/* Generate Button */}
              <Button
                variant="default"
                onClick={handleGenerate}
                disabled={isGenerating || isScanning || !hasAnySource}
                className="w-full h-10 font-bold flex items-center justify-center gap-2 mt-2 shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Question Paper…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Question Paper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Printable Preview or History */}
        <div className="lg:col-span-7 space-y-6">
          {generatedPaper ? (
            <QuestionPaperPreview
              questionPaper={generatedPaper}
              onQuestionPaperChange={setGeneratedPaper}
              onRegenerate={handleGenerate}
              isRegenerating={isGenerating}
              sourceContext={extractedContent}
              teacherPrompt={teacherPrompt}
            />
          ) : (
            /* Empty State */
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-4">
                <div className="h-16 w-16 bg-primary-50 dark:bg-primary-950 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <FileQuestion className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-bold text-lg text-foreground">No Question Paper Generated Yet</h3>
                  <p className="text-xs sm:text-sm text-foreground-muted">
                    Upload a reference PDF or select existing study materials/worksheets on the left, define
                    marks and duration, and click Generate to produce a formal Krishna English School examination paper.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Generations History */}
          {savedPapersData && savedPapersData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground-muted" />
                  Recent Question Papers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border text-xs">
                  {savedPapersData.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setGeneratedPaper(item.content)}
                      className="py-2.5 flex items-center justify-between hover:bg-muted/50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">
                          {item.title} ({item.examName})
                        </p>
                        <p className="text-[11px] text-foreground-muted">
                          {item.subjectName} · {item.className} · {item.totalMarks} Marks ·{' '}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedPaper(item.content);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={(e) => handleDeleteSaved(item.id, e)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
export default QuestionPaperGeneratorPage;

