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

const GENERAL_QUESTION_TYPES = [
  { id: 'mcq', label: 'Multiple Choice Questions (MCQs)', level: 'All Grades' },
  { id: 'fill_in_blanks', label: 'Fill in the Blanks', level: 'All Grades' },
  { id: 'match_the_following', label: 'Match the Following (Columns A & B)', level: 'All Grades' },
  { id: 'true_false', label: 'True or False Statements', level: 'Primary & Up' },
  { id: 'short_answer', label: 'Short Answer Questions', level: 'Primary & Up' },
  { id: 'long_answer', label: 'Long Answer / Descriptive', level: 'Middle & Higher' },
  { id: 'comprehension', label: 'Reading Comprehension & Passage', level: 'All Grades' },
  { id: 'numerical', label: 'Word Problems & Numerical Calculations', level: 'Primary & Up' },
  { id: 'missing_letters', label: 'Missing Letters / Sequence Completion', level: 'Pre-Primary / Early' },
  { id: 'before_after_between', label: 'What Comes Before / After / Between?', level: 'Pre-Primary / Early' },
  { id: 'picture_identification', label: 'Picture / Symbol Identification', level: 'Pre-Primary / Early' },
  { id: 'count_and_write', label: 'Count & Write Visual Objects', level: 'Pre-Primary / Early' },
  { id: 'odd_one_out', label: 'Odd One Out', level: 'Pre-Primary & Primary' },
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
  const [className, setClassName] = useState<string>('Class 1');
  const [customClass, setCustomClass] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('ENGLISH');
  const [chapterName, setChapterName] = useState<string>('');
  const [topicName, setTopicName] = useState<string>('');
  const [worksheetNumber, setWorksheetNumber] = useState<string>('1');
  const [examName, setExamName] = useState<string>('FA 1');
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [teacherPrompt, setTeacherPrompt] = useState<string>('');
  const [useAutoTypes, setUseAutoTypes] = useState<boolean>(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

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
      const uploadRes = await documentApi.uploadDocument({
        file,
        documentType: 'STUDY_MATERIAL',
      });

      const docId = uploadRes.data?.id;
      if (!docId) throw new Error('Upload succeeded but no document ID returned.');

      let contentRes = await documentApi.getDocumentContent(docId);
      if (!contentRes?.text) {
        await new Promise((r) => setTimeout(r, 1200));
        contentRes = await documentApi.getDocumentContent(docId);
      }

      const text = contentRes?.text || 'Study material uploaded.';
      setExtractedContent(text);
      setSelectedDocId(docId);

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
        description: `Scanned ${file.name} for ${analysisResult.detectedClass || 'curriculum'}!`,
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
      const result = await generatorApi.generateWorksheet({
        sourceContent: extractedContent,
        documentId: selectedDocId || undefined,
        className: effectiveClass,
        subjectName,
        chapterName,
        topicName,
        worksheetNumber,
        examName,
        academicYear,
        questionCount,
        difficulty,
        questionTypes: useAutoTypes ? undefined : selectedTypes,
        teacherPrompt: teacherPrompt.trim() || undefined,
      });

      setGeneratedWorksheet(result);
      refetchSaved();
      toast({
        title: 'Worksheet Generated',
        description: `${subjectName} worksheet for ${effectiveClass} is ready!`,
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
    setUseAutoTypes(false);
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
              <CardDescription>Multi-class grade level, subject, and customized teacher prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Class & Subject Pickers */}
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
                      placeholder="e.g. Grade 10 - Science"
                      className="h-7 text-xs mt-1.5"
                    />
                  )}
                </div>

                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <Input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. ENGLISH, MATHS, SCIENCE"
                    className="h-8 text-xs"
                    list="subject-presets-list"
                  />
                  <datalist id="subject-presets-list">
                    {SUBJECT_PRESETS.map((sub) => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Assessment Name & Academic Year */}
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

              {/* Chapter & Question Count */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Chapter / Topic</label>
                  <Input
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="e.g. Plant Life, Fractions"
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
                    <option value={3}>3 Questions (Quick Practice)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={8}>8 Questions (Comprehensive)</option>
                    <option value={10}>10 Questions (Full Assessment)</option>
                    <option value={15}>15 Questions (Mastery)</option>
                  </select>
                </div>
              </div>

              {/* Teacher Special Instructions */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold block text-foreground flex items-center justify-between">
                  <span>Teacher Special Prompt / Instructions</span>
                  <span className="text-[10px] text-foreground-muted font-normal">Optional</span>
                </label>
                <textarea
                  value={teacherPrompt}
                  onChange={(e) => setTeacherPrompt(e.target.value)}
                  placeholder="e.g. Focus on word problems, include 1 reading comprehension passage, and create a 5-mark short answer question on photosynthesis..."
                  rows={2}
                  className="w-full p-2 text-xs rounded-md border border-input bg-surface focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
                />
              </div>

              {/* Advanced Question Formats Accordion */}
              <div className="border border-border rounded-lg p-2.5 bg-muted/30 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center justify-between w-full font-semibold text-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary-600" />
                    Question Formats: {useAutoTypes ? 'AI Smart Selection (Recommended)' : `${selectedTypes.length} Selected`}
                  </span>
                  <span className="text-[11px] text-primary-600 underline">
                    {showAdvancedOptions ? 'Hide Formats' : 'Customize'}
                  </span>
                </button>

                {showAdvancedOptions && (
                  <div className="mt-3 pt-2.5 border-t border-border space-y-2">
                    <div className="flex items-center justify-between pb-1 text-[11px]">
                      <span className="text-foreground-muted">Choose specific question styles:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUseAutoTypes(true);
                          setSelectedTypes([]);
                        }}
                        className="text-primary-600 font-semibold hover:underline"
                      >
                        Reset to Auto
                      </button>
                    </div>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {GENERAL_QUESTION_TYPES.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!useAutoTypes && selectedTypes.includes(opt.id)}
                              onChange={() => toggleQuestionType(opt.id)}
                              className="rounded border-border text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                            />
                            <span className="text-foreground">{opt.label}</span>
                          </div>
                          <span className="text-[10px] text-foreground-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                            {opt.level}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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
