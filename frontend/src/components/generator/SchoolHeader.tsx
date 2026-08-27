import React from 'react';
import { cn } from '@/lib/utils';

interface SchoolHeaderProps {
  schoolName?: string;
  schoolSubHeader?: string;
  logoUrl?: string;
  documentTitle?: string;
  academicYear?: string;
  studentName?: string;
  subjectName?: string;
  className?: string;
  timeAllowed?: string;
  totalMarks?: number | string;
  isQuestionPaper?: boolean;
  classNameCustom?: string;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  schoolName = 'KRISHNA ENGLISH SCHOOL',
  schoolSubHeader = 'Pre-Primary-Primary-Secondary School',
  logoUrl,
  documentTitle = 'Worksheet FA 1',
  academicYear = '2026-27',
  subjectName = 'ENGLISH',
  className = 'Class 1',
  timeAllowed,
  totalMarks,
  isQuestionPaper = false,
  classNameCustom,
}) => {
  return (
    <div className={cn('text-center font-sans select-none text-slate-900', classNameCustom)}>
      {/* School Emblem / Logo & Names */}
      <div className="flex flex-col items-center justify-center pb-2">
        {logoUrl && (
          <div className="mb-2 flex items-center justify-center">
            <img src={logoUrl} alt={schoolName} className="h-12 w-auto object-contain" />
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase font-serif text-slate-950">
          {schoolName}
        </h1>
        {schoolSubHeader && (
          <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-700 mt-0.5">
            {schoolSubHeader}
          </p>
        )}
        <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 uppercase tracking-tight">
          {documentTitle} {academicYear ? `· Academic Year ${academicYear}` : ''}
        </p>
      </div>

      {/* Header Separator Line */}
      <div className="w-full border-t-2 border-slate-900 my-2"></div>

      {/* Student Details Grid / Lines */}
      {!isQuestionPaper ? (
        // Worksheet Header Format
        <div className="text-left text-xs sm:text-sm font-semibold space-y-2 py-1">
          <div className="flex items-center">
            <span className="font-bold">Name:</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-700 ml-2 h-4"></div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center">
              <span className="font-bold">Sub.:</span>
              <span className="ml-2 uppercase tracking-wide underline font-extrabold">{subjectName}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">Std:</span>
              <span className="ml-2 uppercase tracking-wide underline font-extrabold">{className}</span>
            </div>
          </div>
        </div>
      ) : (
        // Question Paper Header Format
        <div className="text-left text-xs sm:text-sm font-semibold space-y-2 py-1">
          <div className="flex items-center">
            <span className="font-bold">Name:</span>
            <div className="flex-1 border-b-2 border-dotted border-slate-700 ml-2 h-4"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="font-bold">Class:</span>
              <span className="ml-2 uppercase font-extrabold">{className}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">Subject:</span>
              <span className="ml-2 uppercase font-extrabold">{subjectName}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-0.5 border-t border-dotted border-slate-300">
            <div>
              <span className="font-bold">Time:</span>
              <span className="ml-2">{timeAllowed || '1 Hour'}</span>
            </div>
            <div className="text-right">
              <span className="font-bold">Marks:</span>
              <span className="ml-2 font-extrabold">{totalMarks || 25}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lower Separator Line */}
      <div className="w-full border-b border-slate-800 my-2"></div>
    </div>
  );
};
