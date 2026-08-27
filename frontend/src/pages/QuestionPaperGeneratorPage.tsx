import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generatorApi } from '@/api/generatorApi';
import { documentApi } from '@/api/documentApi';
import type { QuestionPaperData, SavedWorksheetRecord } from '@/types/generator';

import { QuestionPaperPreview } from '@/components/generator/QuestionPaperPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  FileQuestion,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Layers,
  RefreshCw,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

export function QuestionPaperGeneratorPage() {
  const { toast } = useToast();

  // Selected source worksheets & study material
  const [selectedWorksheetIds, setSelectedWorksheetIds] = useState<string[]>([]);
  const [selectedStudyMaterialId, setSelectedStudyMaterialId] = useState<string>('');

  // Exam Settings
  const [examName, setExamName] = useState<string>('FA 1 EXAMINATION');
  const [academicYear, setAcademicYear] = useState<string>('2026-27');
  const [className, setClassName] = useState<string>('SR.KG');
  const [subjectName, setSubjectName] = useState<string>('ENGLISH');
  const [totalMarks, setTotalMarks] = useState<number>(25);
  const [duration, setDuration] = useState<string>('1 Hour');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('Medium');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<QuestionPaperData | null>(null);

  // Queries
  const { data: savedWorksheetsData } = useQuery({
    queryKey: ['available-source-worksheets'],
    queryFn: () => generatorApi.getSavedWorksheets(),
  });

  const { data: documentsData } = useQuery({
    queryKey: ['study-materials-library'],
    queryFn: () => documentApi.getDocuments({ limit: 50 }),
  });

  const { data: savedPapersData, refetch: refetchSavedPapers } = useQuery({
    queryKey: ['saved-question-papers-history'],
    queryFn: () => generatorApi.getSavedQuestionPapers(),
  });

  const toggleWorksheetSelect = (id: string) => {
    setSelectedWorksheetIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      // Auto populate subject and class if first one selected
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

  const handleGenerate = async () => {
    if (selectedWorksheetIds.length === 0 && !selectedStudyMaterialId) {
      toast({
        title: 'Source Required',
        description: 'Please select at least one source worksheet or study material.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatorApi.generateQuestionPaper({
        sourceWorksheetIds: selectedWorksheetIds,
        studyMaterialId: selectedStudyMaterialId || undefined,
        className,
        subjectName,
        examName,
        academicYear,
        totalMarks,
        duration,
        questionCount,
        difficulty,
      });

      setGeneratedPaper(result);
      refetchSavedPapers();
      toast({
        title: 'Question Paper Generated',
        description: `${examName} for ${subjectName} (${className}) is ready!`,
      });
    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Failed to generate question paper. Please try again.',
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
          Generate formal school examination papers from worksheets and study material.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Source & Exam Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Worksheets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                  1
                </span>
                Source Worksheets & Syllabus
              </CardTitle>
              <CardDescription>Select worksheets to test in this examination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      You can select a study material document below as context.
                    </p>
                  </div>
                )}
              </div>

              {/* Optional extra study material selection */}
              <div className="pt-2 border-t border-border">
                <label className="font-semibold text-xs block mb-1">
                  Optional: Additional Study Material
                </label>
                <select
                  value={selectedStudyMaterialId}
                  onChange={(e) => setSelectedStudyMaterialId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-surface text-xs"
                >
                  <option value="">None (Use worksheets only)</option>
                  {documentsData?.data?.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>
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
              <CardDescription>Configure marks, duration, and subject details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Class / Standard</label>
                  <Input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. SR.KG"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subject</label>
                  <Input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. ENGLISH"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Total Marks</label>
                  <Input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value) || 25)}
                    placeholder="25"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Time Duration</label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 1 Hour"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

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
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
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

              {/* Generate Button */}
              <Button
                variant="default"
                onClick={handleGenerate}
                disabled={isGenerating || (selectedWorksheetIds.length === 0 && !selectedStudyMaterialId)}
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
                    Select one or more worksheets on the left, define marks and duration, and click
                    Generate to produce a formal Krishna English School examination paper.
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
