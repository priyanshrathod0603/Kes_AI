import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentApi } from '@/api/documentApi';
import { academicApi } from '@/api/classApi';
import { generatorApi } from '@/api/generatorApi';
import type { WorksheetData, PDFAnalysisResult, SavedWorksheetRecord } from '@/types/generator';

import { WorksheetPreview } from '@/components/generator/WorksheetPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const QUESTION_TYPE_OPTIONS = [
  { id: 'missing_letters', label: 'Missing Letters (A ___ C ___)' },
  { id: 'before_after_between', label: 'What Comes Before / After / Between?' },
  { id: 'match_the_following', label: 'Match the Following (Column A & B)' },
  { id: 'count_and_write', label: 'Count & Write (Visual Objects)' },
  { id: 'circle_correct', label: 'Circle / Tick the Correct Answer' },
  { id: 'picture_identification', label: 'Picture Identification & Name' },
  { id: 'fill_in_blanks', label: 'Fill in the Blanks' },
  { id: 'odd_one_out', label: 'Odd One Out' },
  { id: 'short_answer', label: 'Short Answer Questions' },
];

export function WorksheetGeneratorPage() {
  const { toast } = useToast();

  // Source selection state
  const [sourceMode, setSourceMode] = useState<'upload' | 'library'>('upload');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');

  // Scanning & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PDFAnalysisResult | null>(null);

  // Configuration state
  const [className, setClassName] = useState<string>('SR.KG');
  const [subjectName, setSubjectName] = useState<string>('ENGLISH');
  const [chapterName, setChapterName] = useState<string>('');
  const [topicName, setTopicName] = useState<string>('');
  const [worksheetNumber, setWorksheetNumber] = useState<string>('1');
  const [examName, setExamName] = useState<string>('FA 1');
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'missing_letters',
    'before_after_between',
    'match_the_following',
    'circle_correct',
  ]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<WorksheetData | null>(null);

  // Fetch academic classes and existing library documents
  const { data: classesData } = useQuery({
    queryKey: ['academic-classes'],
    queryFn: () => academicApi.getClasses(),
  });


  const { data: documentsData, refetch: refetchDocs } = useQuery({
    queryKey: ['study-materials-library'],
    queryFn: () => documentApi.getDocuments({ limit: 50 }),
  });

  const { data: savedWorksheetsData, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-worksheets-history'],
    queryFn: () => generatorApi.getSavedWorksheets(),
  });

  // Handle file drop / upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File',
        description: 'Please upload a valid PDF document.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    setSourceFileName(file.name);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Upload PDF to backend to extract text
      const uploadRes = await documentApi.uploadDocument({
        file,
        documentType: 'STUDY_MATERIAL',
      });

      const docId = uploadRes.data?.id;
      if (!docId) throw new Error('Upload succeeded but no document ID returned.');

      // Wait a moment for background extraction or fetch content
      let contentRes = await documentApi.getDocumentContent(docId);
      if (!contentRes?.text) {
        // Retry once after brief delay
        await new Promise((r) => setTimeout(r, 1200));
        contentRes = await documentApi.getDocumentContent(docId);
      }

      const text = contentRes?.text || 'Study material uploaded.';
      setExtractedContent(text);
      setSelectedDocId(docId);

      // Trigger AI Analysis
      const analysisResult = await generatorApi.analyzePdf({
        extractedText: text,
        fileName: file.name,
        documentId: docId,
      });

      setAnalysis(analysisResult);
      if (analysisResult.detectedClass) setClassName(analysisResult.detectedClass);
      if (analysisResult.detectedSubject) setSubjectName(analysisResult.detectedSubject.toUpperCase());
      if (analysisResult.detectedChapter) setChapterName(analysisResult.detectedChapter);
      if (analysisResult.detectedTopic) setTopicName(analysisResult.detectedTopic);
      if (analysisResult.suggestedQuestionTypes?.length) {
        setSelectedTypes(analysisResult.suggestedQuestionTypes.slice(0, 5));
      }

      toast({
        title: 'Analysis Completed',
        description: `Scanned ${file.name} successfully.`,
      });
    } catch (err: any) {
      toast({
        title: 'Analysis Error',
        description: err.message || 'Failed to scan uploaded study material.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle selecting from existing library
  const handleSelectLibraryDoc = async (docId: string) => {
    setSelectedDocId(docId);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const doc = await documentApi.getDocument(docId);
      const contentRes = await documentApi.getDocumentContent(docId);
      const text = contentRes?.text || '';
      setExtractedContent(text);
      setSourceFileName(doc?.title || 'Selected Document');

      const analysisResult = await generatorApi.analyzePdf({
        extractedText: text,
        fileName: doc?.title,
        documentId: docId,
      });

      setAnalysis(analysisResult);
      if (analysisResult.detectedClass) setClassName(analysisResult.detectedClass);
      if (analysisResult.detectedSubject) setSubjectName(analysisResult.detectedSubject.toUpperCase());
      if (analysisResult.detectedChapter) setChapterName(analysisResult.detectedChapter);
      if (analysisResult.detectedTopic) setTopicName(analysisResult.detectedTopic);
      if (analysisResult.suggestedQuestionTypes?.length) {
        setSelectedTypes(analysisResult.suggestedQuestionTypes.slice(0, 5));
      }

      toast({
        title: 'Study Material Loaded',
        description: `Loaded context from ${doc?.title || 'library'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Load Failed',
        description: err.message || 'Could not load selected document content.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Worksheet
  const handleGenerate = async () => {
    if (!extractedContent && !selectedDocId) {
      toast({
        title: 'Source Required',
        description: 'Please upload or select study material before generating.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatorApi.generateWorksheet({
        sourceContent: extractedContent,
        documentId: selectedDocId || undefined,
        className,
        subjectName,
        chapterName,
        topicName,
        worksheetNumber,
        examName,
        academicYear,
        questionCount,
        difficulty,
        questionTypes: selectedTypes,
      });

      setGeneratedWorksheet(result);
      refetchSaved();
      toast({
        title: 'Worksheet Generated',
        description: `${subjectName} worksheet for ${className} is ready!`,
      });
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Failed to generate worksheet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generatorApi.deleteWorksheet(id);
      refetchSaved();
      toast({
        title: 'Deleted',
        description: 'Worksheet removed from history.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Could not delete worksheet.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-primary-600" />
          AI Worksheet Generator
        </h1>
        <p className="text-foreground-muted text-sm sm:text-base">
          Generate school-ready worksheets from your uploaded study material.
        </p>
      </div>

      {/* Main Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Study Material Source */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  1
                </span>
                Select Study Material
              </CardTitle>
              <CardDescription>Upload a chapter PDF or select an existing document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`py-1.5 rounded-md transition-colors ${
                    sourceMode === 'upload'
                      ? 'bg-surface shadow-xs text-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Upload Reference PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('library')}
                  className={`py-1.5 rounded-md transition-colors ${
                    sourceMode === 'library'
                      ? 'bg-surface shadow-xs text-foreground'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  Select from Library
                </button>
              </div>

              {/* Upload UI */}
              {sourceMode === 'upload' ? (
                <div className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    id="worksheet-pdf-upload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="worksheet-pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {uploadedFile ? uploadedFile.name : 'Click or drop PDF here'}
                    </span>
                    <span className="text-[11px] text-foreground-muted">
                      Supports SR.KG chapter books, worksheets, study material (PDF)
                    </span>
                  </label>
                </div>
              ) : (
                /* Library Selector */
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {documentsData?.data && documentsData.data.length > 0 ? (
                    documentsData.data.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => handleSelectLibraryDoc(doc.id)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                          selectedDocId === doc.id
                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                          <span className="truncate font-medium">{doc.title}</span>
                        </div>
                        {selectedDocId === doc.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-foreground-muted">
                      No documents found in library. Please upload a PDF.
                    </div>
                  )}
                </div>
              )}

              {/* Analysis Status / Indicator */}
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-xs text-primary-700 bg-primary-50 dark:bg-primary-950/50 p-2.5 rounded-lg border border-primary-200 dark:border-primary-900">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Analyzing study material and extracting curriculum concepts…</span>
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Scanned: {analysis.detectedSubject} · {analysis.detectedClass}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.keyConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {analysis.keyConcepts.slice(0, 4).map((c, i) => (
                        <span
                          key={i}
                          className="bg-surface px-2 py-0.5 rounded text-[10px] border border-border text-foreground-muted font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Worksheet Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  2
                </span>
                Worksheet Configuration
              </CardTitle>
              <CardDescription>Customize exam info, class level, and question types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Class / Standard</label>
                  <Input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. SR.KG, Class 1"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <Input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. ENGLISH, MATHS"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Exam / Assessment</label>
                  <Input
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. FA 1, Unit Test 1"
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

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Chapter / Topic</label>
                  <Input
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="e.g. Letters A-Z, Myself"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs font-medium"
                  >
                    <option value={3}>3 Questions (Quick)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
              </div>

              {/* Question Types Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-xs block">Allowed Question Formats</label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(opt.id)}
                        onChange={() => toggleQuestionType(opt.id)}
                        className="rounded border-border text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="text-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Action Button */}
              <Button
                variant="default"
                onClick={handleGenerate}
                disabled={isGenerating || isAnalyzing || (!extractedContent && !selectedDocId)}
                className="w-full h-10 font-bold flex items-center justify-center gap-2 mt-2 shadow-sm bg-primary-600 hover:bg-primary-700 text-white"
              >

                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating School Worksheet…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Printable Preview or History */}
        <div className="lg:col-span-7 space-y-6">
          {generatedWorksheet ? (
            <WorksheetPreview
              worksheet={generatedWorksheet}
              onWorksheetChange={setGeneratedWorksheet}
              onRegenerate={handleGenerate}
              isRegenerating={isGenerating}
            />
          ) : (
            /* Empty State / Welcome Guide */
            <Card className="border-dashed">
              <CardContent className="py-16 text-center space-y-4">
                <div className="h-16 w-16 bg-primary-50 dark:bg-primary-950 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-bold text-lg text-foreground">No Worksheet Generated Yet</h3>
                  <p className="text-xs sm:text-sm text-foreground-muted">
                    Upload your chapter PDF or select an existing study material on the left to
                    generate an authentic Krishna English School printable worksheet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Generations History */}
          {savedWorksheetsData && savedWorksheetsData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground-muted" />
                  Recent Generated Worksheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border text-xs">
                  {savedWorksheetsData.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setGeneratedWorksheet(item.content)}
                      className="py-2.5 flex items-center justify-between hover:bg-muted/50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">
                          {item.title} ({item.examName})
                        </p>
                        <p className="text-[11px] text-foreground-muted">
                          {item.subjectName} · {item.className} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedWorksheet(item.content);
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
export default WorksheetGeneratorPage;
