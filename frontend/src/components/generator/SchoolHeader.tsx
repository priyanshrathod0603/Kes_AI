import React from 'react';
import { cn } from '@/lib/utils';

interface SchoolHeaderProps {
  schoolName?: string;
  schoolSubHeader?: string;
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
  schoolSubHeader = 'Pre-Primary-Primary School',
  documentTitle = 'Worksheet FA 1',
  academicYear = '2026-27',
  subjectName = 'ENGLISH',
  className = 'SR.KG',
  timeAllowed,
  totalMarks,
  isQuestionPaper = false,
  classNameCustom,
}) => {
  return (
    <div className={cn('text-center font-sans select-none text-slate-900', classNameCustom)}>
      {/* School Emblem / Logo & Names */}
      <div className="flex flex-col items-center justify-center pb-2">
        {/* Krishna English School Emblem SVG */}
        <div className="mb-1 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-slate-800"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Laurel / Shield border */}
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" />
            
            {/* Open Book in center */}
            <path
              d="M50 64V36C44 32 30 32 24 35V63C30 60 44 60 50 64ZM50 64V36C56 32 70 32 76 35V63C70 60 56 60 50 64Z"
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Quill / Flame on top */}
            <path
              d="M50 22C47 27 47 31 50 34C53 31 53 27 50 22Z"
              fill="currentColor"
            />
            {/* Rays / Stars */}
            <circle cx="34" cy="27" r="1.5" fill="currentColor" />
            <circle cx="66" cy="27" r="1.5" fill="currentColor" />
            <circle cx="50" cy="74" r="2" fill="currentColor" />
            {/* Bottom ribbon banner curve */}
            <path
              d="M26 77C38 73 62 73 74 77"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase font-serif text-slate-950">
          {schoolName}
        </h1>
        <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-700 mt-0.5">
          {schoolSubHeader}
        </p>
        <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 uppercase tracking-tight">
          {documentTitle} {academicYear ? `Year ${academicYear}` : ''}
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
