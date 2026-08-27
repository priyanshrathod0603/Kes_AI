import React, { useState } from 'react';
import type { QuestionPaperData, WorksheetQuestionItem } from '@/types/generator';
import { SchoolHeader } from './SchoolHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  FileText,
  FileCode,
  Edit3,
  Check,
  RefreshCw,
  Printer,
  BookmarkPlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { generatorApi } from '@/api/generatorApi';
import { useToast } from '@/hooks/use-toast';

interface QuestionPaperPreviewProps {
  questionPaper: QuestionPaperData;
  onQuestionPaperChange: (updated: QuestionPaperData) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  sourceContext?: string;
  teacherPrompt?: string;
}

export const QuestionPaperPreview: React.FC<QuestionPaperPreviewProps> = ({
  questionPaper,
  onQuestionPaperChange,
  onRegenerate,
  isRegenerating = false,
  sourceContext,
  teacherPrompt,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Dynamic Total Marks Calculation
  const currentTotalMarks = questionPaper.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const isMarksBalanced = currentTotalMarks === questionPaper.totalMarks;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const blob = await generatorApi.downloadQuestionPaperPdf(questionPaper);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${questionPaper.subjectName || 'Exam'}_${questionPaper.className || 'Class'}_${questionPaper.examName || 'Paper'}.pdf`.replace(/\s+/g, '_');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'PDF Downloaded',
        description: 'School examination question paper PDF downloaded successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'PDF Download Failed',
        description: err.message || 'Unable to download PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsDownloadingDocx(true);
      const blob = await generatorApi.downloadQuestionPaperDocx(questionPaper);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${questionPaper.subjectName || 'Exam'}_${questionPaper.className || 'Class'}_${questionPaper.examName || 'Paper'}.docx`.replace(/\s+/g, '_');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'DOCX Downloaded',
        description: 'Editable Microsoft Word examination paper downloaded successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'DOCX Download Failed',
        description: err.message || 'Unable to download DOCX. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleSaveToHistory = async () => {
    try {
      setIsSaving(true);
      await generatorApi.saveQuestionPaper(questionPaper);
      toast({
        title: 'Question Paper Saved',
        description: 'Saved to examination papers history.',
      });
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not save question paper.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestion = (index: number, updatedQ: WorksheetQuestionItem) => {
    const nextQuestions = [...questionPaper.questions];
    nextQuestions[index] = updatedQ;
    const newTotal = nextQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);
    onQuestionPaperChange({
      ...questionPaper,
      questions: nextQuestions,
      totalMarks: newTotal,
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (questionPaper.questions.length <= 1) {
      toast({
        title: 'Cannot Delete',
        description: 'An examination paper must have at least one question.',
        variant: 'destructive',
      });
      return;
    }
    const filtered = questionPaper.questions
      .filter((_, idx) => idx !== index)
      .map((q, idx) => ({ ...q, number: idx + 1 }));
    const newTotal = filtered.reduce((acc, q) => acc + (q.marks || 0), 0);
    onQuestionPaperChange({
      ...questionPaper,
      questions: filtered,
      totalMarks: newTotal,
    });
    toast({
      title: 'Question Deleted',
      description: `Removed question. Total marks updated to ${newTotal}.`,
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questionPaper.questions.length) return;

    const next = [...questionPaper.questions];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);

    const renumbered = next.map((q, idx) => ({ ...q, number: idx + 1 }));
    onQuestionPaperChange({ ...questionPaper, questions: renumbered });
  };

  const handleAddQuestion = () => {
    const newQNumber = questionPaper.questions.length + 1;
    const newQuestion: WorksheetQuestionItem = {
      number: newQNumber,
      section: questionPaper.questions[questionPaper.questions.length - 1]?.section || 'SECTION A',
      type: 'short_answer',
      instruction: 'Answer the following question in 2-3 sentences:',
      marks: 5,
      blankLinesCount: 2,
    };
    const nextQuestions = [...questionPaper.questions, newQuestion];
    const newTotal = nextQuestions.reduce((acc, q) => acc + (q.marks || 0), 0);
    onQuestionPaperChange({
      ...questionPaper,
      questions: nextQuestions,
      totalMarks: newTotal,
    });
    toast({
      title: 'Question Added',
      description: `Added Q.${newQNumber}. Total marks updated to ${newTotal}.`,
    });
  };

  const handleRegenerateSingleQuestion = async (index: number) => {
    const currentQ = questionPaper.questions[index];
    setRegeneratingIndex(index);
    try {
      const regenerated = await generatorApi.regenerateSingleQuestion({
        questionIndex: index,
        currentQuestion: currentQ,
        allQuestions: questionPaper.questions,
        className: questionPaper.className,
        subjectName: questionPaper.subjectName,
        totalMarks: questionPaper.totalMarks,
        targetMarks: currentQ.marks || 5,
        sourceContext,
        teacherPrompt,
      });

      if (regenerated) {
        updateQuestion(index, regenerated);
        toast({
          title: 'Question Regenerated',
          description: `Successfully regenerated Q.${currentQ.number} with fresh content!`,
        });
      }
    } catch (err: any) {
      console.error('[Single Regenerate Error]', err);
      toast({
        title: 'Regeneration Failed',
        description: err.message || 'Could not regenerate question.',
        variant: 'destructive',
      });
    } finally {
      setRegeneratingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Finish Editing' : 'Edit Exam Paper'}
          </Button>

          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 border-dashed border-primary-400 text-primary-700 dark:text-primary-300"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating || regeneratingIndex !== null}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToHistory}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save
          </Button>
        </div>

        {/* Live Marks Counter Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              isMarksBalanced
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isMarksBalanced ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span>
              Total: {currentTotalMarks} / {questionPaper.totalMarks} Marks
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDocx}
            disabled={isDownloadingDocx}
            className="flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
          >
            <FileCode className="w-4 h-4" />
            {isDownloadingDocx ? 'Exporting...' : 'Download DOCX'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 bg-primary-600 text-white hover:bg-primary-700"
          >
            <FileText className="w-4 h-4" />
            {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Editable Header Meta (when in edit mode) */}
      {isEditing && (
        <div className="bg-surface p-4 rounded-xl border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Exam Name</label>
            <Input
              value={questionPaper.examName}
              onChange={(e) =>
                onQuestionPaperChange({ ...questionPaper, examName: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Subject</label>
            <Input
              value={questionPaper.subjectName}
              onChange={(e) =>
                onQuestionPaperChange({ ...questionPaper, subjectName: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Class / Standard</label>
            <Input
              value={questionPaper.className}
              onChange={(e) =>
                onQuestionPaperChange({ ...questionPaper, className: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Duration</label>
            <Input
              value={questionPaper.duration}
              onChange={(e) =>
                onQuestionPaperChange({ ...questionPaper, duration: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Printable School Question Paper Container */}
      <div
        id="printable-question-paper"
        className="max-w-[760px] mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-lg border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* School Header for Question Paper */}
        <SchoolHeader
          schoolName={questionPaper.schoolName}
          schoolSubHeader={questionPaper.schoolSubHeader}
          documentTitle={questionPaper.examName}
          academicYear={questionPaper.academicYear}
          subjectName={questionPaper.subjectName}
          className={questionPaper.className}
          timeAllowed={questionPaper.duration}
          totalMarks={questionPaper.totalMarks}
          isQuestionPaper={true}
        />

        {/* General Instructions */}
        {questionPaper.instructions && questionPaper.instructions.length > 0 && (
          <div className="text-xs text-slate-700 py-1 border-b border-dotted border-slate-300 mb-4">
            <span className="font-bold">General Instructions:</span>
            <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
              {questionPaper.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions Section */}
        <div className="space-y-6 pt-2">
          {questionPaper.questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className={`space-y-2.5 pb-3 transition-all ${
                isEditing ? 'p-3 rounded-lg border border-dashed border-primary-200 bg-slate-50/40' : ''
              }`}
            >
              {/* Section Header if present */}
              {q.section && (qIndex === 0 || questionPaper.questions[qIndex - 1].section !== q.section) && (
                <div className="text-center my-3 border-y border-slate-300 py-1.5 bg-slate-50/80 font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-800">
                  {isEditing ? (
                    <Input
                      value={q.section}
                      onChange={(e) =>
                        updateQuestion(qIndex, { ...q, section: e.target.value })
                      }
                      className="h-7 text-xs font-bold text-center"
                      placeholder="e.g. SECTION A: OBJECTIVE TYPE"
                    />
                  ) : (
                    <span>{q.section}</span>
                  )}
                </div>
              )}

              {/* Question Action Bar in Edit Mode */}
              {isEditing && (
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200 text-xs">
                  <div className="flex items-center gap-1 text-slate-500 font-semibold">
                    <span>Question {q.number}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono uppercase">
                      {q.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title="Move Up"
                      disabled={qIndex === 0}
                      onClick={() => handleMoveQuestion(qIndex, 'up')}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title="Move Down"
                      disabled={qIndex === questionPaper.questions.length - 1}
                      onClick={() => handleMoveQuestion(qIndex, 'down')}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px] flex items-center gap-1 text-primary-700 dark:text-primary-300"
                      disabled={regeneratingIndex === qIndex}
                      onClick={() => handleRegenerateSingleQuestion(qIndex)}
                    >
                      <Sparkles
                        className={`w-3 h-3 ${regeneratingIndex === qIndex ? 'animate-spin' : ''}`}
                      />
                      Regenerate
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      title="Delete Question"
                      onClick={() => handleDeleteQuestion(qIndex)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Question Instruction & Marks */}
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-sm sm:text-base flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 font-bold">Q.{q.number}</span>
                      <Input
                        value={q.instruction}
                        onChange={(e) =>
                          updateQuestion(qIndex, { ...q, instruction: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  ) : (
                    <span>
                      Q.{q.number}&nbsp;&nbsp;{q.instruction}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-extrabold shrink-0 text-slate-900 border border-slate-800 rounded px-2 py-0.5">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-normal text-slate-500">Marks:</span>
                      <Input
                        type="number"
                        value={q.marks || 5}
                        min={1}
                        onChange={(e) =>
                          updateQuestion(qIndex, { ...q, marks: Number(e.target.value) || 1 })
                        }
                        className="h-6 w-14 text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <span>[{q.marks || 5} Marks]</span>
                  )}
                </div>
              </div>

              {/* Reading Passage / Case Study */}
              {q.passage && (
                <div className="ml-4 pl-3 border-l-2 border-primary-500 bg-slate-50/80 p-3 rounded-r text-xs leading-relaxed text-slate-800">
                  {isEditing ? (
                    <Input
                      value={q.passage}
                      onChange={(e) =>
                        updateQuestion(qIndex, { ...q, passage: e.target.value })
                      }
                      placeholder="Reading passage or case study..."
                      className="text-xs"
                    />
                  ) : (
                    <p className="italic">{q.passage}</p>
                  )}
                </div>
              )}

              {/* Visual Context */}
              {q.visualContext && (
                <div className="pl-6 text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                  {isEditing ? (
                    <Input
                      value={q.visualContext}
                      onChange={(e) =>
                        updateQuestion(qIndex, { ...q, visualContext: e.target.value })
                      }
                      placeholder="Visual clue or contextual hint..."
                      className="text-xs"
                    />
                  ) : (
                    <span>Context: {q.visualContext}</span>
                  )}
                </div>
              )}

              {/* Items / Missing Letters */}
              {q.items && q.items.length > 0 && (
                <div className="pl-6 space-y-2">
                  {q.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="font-medium text-sm tracking-widest text-slate-900">
                      {isEditing ? (
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newItems = [...(q.items || [])];
                            newItems[itemIdx] = e.target.value;
                            updateQuestion(qIndex, { ...q, items: newItems });
                          }}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <div className="py-1 px-3 bg-slate-50/50 rounded border border-dashed border-slate-300 font-mono">
                          {item}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Questions */}
              {q.subQuestions && q.subQuestions.length > 0 && (
                <div className="pl-6 space-y-2">
                  {q.subQuestions.map((sq, sqIdx) => (
                    <div key={sqIdx} className="space-y-1 text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <span className="w-8 font-bold text-slate-700">{sq.label}</span>
                        {isEditing ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={sq.prompt}
                              onChange={(e) => {
                                const newSq = [...(q.subQuestions || [])];
                                newSq[sqIdx] = { ...sq, prompt: e.target.value };
                                updateQuestion(qIndex, { ...q, subQuestions: newSq });
                              }}
                              className="h-7 text-xs"
                            />
                            <Input
                              value={sq.answerBlank || ''}
                              placeholder="Blank template"
                              onChange={(e) => {
                                const newSq = [...(q.subQuestions || [])];
                                newSq[sqIdx] = { ...sq, answerBlank: e.target.value };
                                updateQuestion(qIndex, { ...q, subQuestions: newSq });
                              }}
                              className="h-7 text-xs w-28"
                            />
                            <Input
                              type="number"
                              value={sq.marks || 1}
                              min={1}
                              onChange={(e) => {
                                const newSq = [...(q.subQuestions || [])];
                                newSq[sqIdx] = { ...sq, marks: Number(e.target.value) || 1 };
                                updateQuestion(qIndex, { ...q, subQuestions: newSq });
                              }}
                              className="h-7 text-xs w-16"
                              placeholder="M"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between border-b border-dotted border-slate-400 pb-1">
                            <span>{sq.prompt}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold tracking-wider">
                                {sq.answerBlank || '________'}
                              </span>
                              {sq.marks && (
                                <span className="text-xs text-slate-500 font-bold">[{sq.marks}M]</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {sq.options && sq.options.length > 0 && (
                        <div className="pl-8 flex flex-wrap gap-3 pt-0.5 text-xs text-slate-700">
                          {sq.options.map((sOpt, sOptIdx) => (
                            <span key={sOptIdx} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              ({String.fromCharCode(97 + sOptIdx)}) {sOpt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Match the Following 2-Column Table */}
              {q.matchingPairs && q.matchingPairs.length > 0 && (
                <div className="pl-6 pt-1">
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="grid grid-cols-2 bg-slate-100 font-bold text-xs p-2 border-b border-slate-300">
                      <div>Column A</div>
                      <div>Column B</div>
                    </div>
                    {q.matchingPairs.map((pair, pIdx) => (
                      <div
                        key={pIdx}
                        className="grid grid-cols-2 p-2 text-xs sm:text-sm border-b border-slate-200 last:border-b-0 items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600">{pIdx + 1}.</span>
                          {isEditing ? (
                            <Input
                              value={pair.left}
                              onChange={(e) => {
                                const newPairs = [...(q.matchingPairs || [])];
                                newPairs[pIdx] = { ...pair, left: e.target.value };
                                updateQuestion(qIndex, { ...q, matchingPairs: newPairs });
                              }}
                              className="h-7 text-xs"
                            />
                          ) : (
                            <span>{pair.left}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                          <span className="font-mono text-slate-500 font-bold">( &nbsp; )</span>
                          <span className="font-bold text-slate-600">
                            {String.fromCharCode(65 + pIdx)}.
                          </span>
                          {isEditing ? (
                            <Input
                              value={pair.right}
                              onChange={(e) => {
                                const newPairs = [...(q.matchingPairs || [])];
                                newPairs[pIdx] = { ...pair, right: e.target.value };
                                updateQuestion(qIndex, { ...q, matchingPairs: newPairs });
                              }}
                              className="h-7 text-xs"
                            />
                          ) : (
                            <span>{pair.right}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options Format */}
              {q.options && q.options.length > 0 && (
                <div className="pl-6 flex flex-wrap gap-4 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium border border-slate-200 rounded px-3 py-1.5 bg-slate-50/50"
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(97 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Written Answer Lines */}
              {((q.blankLinesCount && q.blankLinesCount > 0) ||
                q.type === 'short_answer' ||
                q.type === 'long_answer') && (
                <div className="pl-6 space-y-3 pt-2">
                  {Array.from({
                    length: q.blankLinesCount || (q.type === 'long_answer' ? 4 : 2),
                  }).map((_, lIdx) => (
                    <div
                      key={lIdx}
                      className="w-full border-b border-dashed border-slate-300 h-5"
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
