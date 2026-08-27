# KES

> An AI-powered student learning and academic resource generation platform by Krishna Software Solution.

---

## Overview

**KES** is an educational platform designed for schools, teachers, and students. It combines curriculum management with AI capabilities to assist in interactive learning, document extraction, worksheet generation, and formal examination paper preparation.

The platform provides:
- **Interactive AI Tutor**: AI-assisted explanations, problem solving, and contextual study assistance for students.
- **Study Material & PDF Library**: Centralized document management with automatic background text extraction and metadata categorization.
- **Academic Hierarchy Management**: Structured management of School Classes, Subjects, Chapters, and Topics with dependent selectors.
- **AI Worksheet Generator**: Automated creation of age-appropriate printable worksheets with traditional school formatting, live preview, teacher editing, and PDF/DOCX downloads.
- **AI Question Paper Generator**: Automated creation of balanced examination papers from selected worksheets and syllabus units with marks distribution, live preview, and PDF/DOCX downloads.
- **Quiz System**: Creation and management of multiple-choice quizzes linked to subjects and chapters.
- **Dashboard & Progress**: Navigation center and progress tracking views.

---

## Core Features

### 1. AI Tutor
- **Natural Language Learning**: Answers student questions across subjects and standards.
- **Multi-Provider Architecture**: Primary inference through NVIDIA NIM API with automatic resilient fallback to Groq API.
- **Quick Prompts**: One-click prompt suggestions (*"Explain Simply"*, *"Give Example"*, *"Quiz Me"*, *"Summarize"*, *"Help Solve"*).
- **Markdown & Code Rendering**: Rich text formatting, bullet lists, math representations, and copy-to-clipboard support.

### 2. Study Material / PDF Library
- **Upload & Storage**: Multipart PDF uploads stored securely on local disk (`backend/storage/pdfs/`).
- **Academic Tagging**: Documents can be linked to Class, Subject, Chapter, and Topic.
- **Document Classification**: Supports document types:
  - `CHAPTER_MATERIAL`
  - `WORKSHEET`
  - `QUESTION_PAPER`
  - `ANSWER_KEY`
  - `STUDY_MATERIAL`
- **Asynchronous Text Extraction**: Automatically extracts text using `pdf-parse` in the background with extraction status tracking (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `NO_TEXT`), page counts, and character counts.
- **In-Browser Viewer & Binary Download**: View document text in-browser or stream/download original binary PDFs.

### 3. AI Worksheet Generator
- **Content-Grounded Generation**: Analyzes uploaded PDFs or existing library materials to extract subjects, standards, chapters, topics, vocabulary, and key concepts.
- **Traditional School Format**: Follows authentic school document layouts with school header, student info lines (`Name: _____`, `Sub.: _____`, `Std: _____`), and balanced question spacing.
- **Supported Question Types**:
  - Missing Letters (`A ___ C ___ E`)
  - What comes before, after, and between
  - Match the following (Column A & Column B)
  - Count and write
  - Circle / Tick the correct answer
  - Picture identification & naming
  - Fill in the blanks
  - Odd-one-out
  - Short answer questions
- **Interactive Live Preview**: In-place Teacher Edit mode for questions, instructions, and marks before exporting.
- **Dual Export Options**:
  - **Download PDF**: Printable A4 PDF generated server-side via `pdf-lib`.
  - **Download DOCX**: Editable Microsoft Word `.docx` generated server-side via `docx`.
- **Worksheet History**: Save generated worksheets to the database for future reference and exam assembly.

### 4. AI Question Paper Generator
- **Multi-Worksheet Syllabus Synthesis**: Select one or multiple saved worksheets plus optional study material to create comprehensive examination papers.
- **Exam Configuration**: Custom exam names (e.g., *FA 1 EXAMINATION*), academic year (e.g., *2026-27*), class, subject, total marks, duration, question count, and difficulty.
- **Balanced Assessment**: Generates structured question papers with individual question marks, instructions, and time allocations.
- **Interactive Preview & Teacher Editing**: Edit questions and point allocations live on the page.
- **Exports**: Instant A4 PDF and editable Microsoft Word `.docx` downloads.
- **Exam History**: Full database persistence with preview and deletion support.

### 5. Academic Management
- **Classes**: Manage school standards and grade levels.
- **Subjects**: Associate subjects with specific classes.
- **Chapters**: Organize curriculum chapters under subjects.
- **Topics**: Subdivide chapters into granular topics for precise document tagging and study planning.

### 6. Quiz System
- **Quiz Creation**: Define quizzes linked to subjects and chapters.
- **Question Management**: Multiple-choice questions with 4 options (A, B, C, D), correct option flags, and answer explanations.

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          KES UI                             │
│       React 19 + TypeScript + Tailwind CSS + Vite           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Axios HTTP Client (/api)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       KES Backend                           │
│              Express.js 4 + TypeScript                      │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │ Academic Routes │ │ Document Routes │ │  Quiz Routes  │  │
│  └────────┬────────┘ └────────┬────────┘ └───────┬───────┘  │
│  ┌────────┴────────┐ ┌────────┴────────┐ ┌───────┴───────┐  │
│  │ Worksheet Svc   │ │ QuestionPaper   │ │   AI Service  │  │
│  │ (pdf-lib, docx) │ │ (pdf-lib, docx) │ │(NVIDIA / Groq)│  │
│  └────────┬────────┘ └────────┬────────┘ └───────┬───────┘  │
└───────────┼───────────────────┼──────────────────┼──────────┘
            ▼                   ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Prisma ORM    │  │  Local Storage   │  │   AI Providers  │
│   SQLite Database│  │ (storage/pdfs/)  │  │ (NVIDIA / Groq) │
│     (dev.db)     │  │                  │  │                 │
└──────────────────┘  └──────────────────┘  └─────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Language**: TypeScript (`~6.0.2` / `verbatimModuleSyntax`)
- **Build Tool**: Vite 8 (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `clsx`, `tailwind-merge`)
- **Routing**: React Router v7 (`react-router-dom`, `createBrowserRouter`)
- **Data Fetching & Cache**: TanStack Query v5 (`@tanstack/react-query`)
- **HTTP Client**: Axios (`axios`)
- **Icons**: Lucide React (`lucide-react`)
- **UI & Animations**: Radix UI Primitives (`@radix-ui/*`), Framer Motion (`framer-motion`)
- **Markdown**: React Markdown (`react-markdown`, `remark-gfm`)
- **Forms**: React Hook Form (`react-hook-form`, `zod`, `@hookform/resolvers`)

### Backend
- **Framework**: Express.js 4 (`express`)
- **Language**: TypeScript (`typescript`, `tsx`)
- **Database & ORM**: SQLite with Prisma ORM 5 (`@prisma/client`, `prisma`)
- **AI Integration**: Custom multi-provider service (NVIDIA NIM API, Groq Cloud API)
- **Document Processing**: `pdf-parse` (text extraction)
- **PDF Generation**: `pdf-lib` (binary A4 generation)
- **Word Generation**: `docx` (native `.docx` file generation)
- **File Uploads**: `multer` (disk storage)
- **Validation**: `zod`
- **Security**: `helmet`, `cors`, `dotenv`

---

## Directory Structure

```
krishan-school-ai/
├── README.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── api/                      # Central Axios API client modules
│       │   ├── aiApi.ts
│       │   ├── classApi.ts
│       │   ├── client.ts
│       │   ├── documentApi.ts
│       │   ├── generatorApi.ts
│       │   ├── index.ts
│       │   ├── progressApi.ts
│       │   └── quizApi.ts
│       ├── components/
│       │   ├── generator/            # School document previews & headers
│       │   │   ├── QuestionPaperPreview.tsx
│       │   │   ├── SchoolHeader.tsx
│       │   │   └── WorksheetPreview.tsx
│       │   ├── layout/               # AppLayout, Header, Sidebar
│       │   │   ├── AppLayout.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   └── index.ts
│       ├── ui/                       # Reusable UI primitives (Button, Card, Input, etc.)
│       ├── hooks/                    # Custom React hooks (use-toast, etc.)
│       ├── lib/                      # Constants, navigation groups, and page titles
│       │   ├── constants.ts
│       │   ├── page-titles.ts
│       │   └── utils.ts
│       ├── pages/                    # Page route components
│       │   ├── AITutorPage.tsx
│       │   ├── ChapterDetailPage.tsx
│       │   ├── ClassDetailPage.tsx
│       │   ├── ClassesPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── DocumentViewerPage.tsx
│       │   ├── NotFoundPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── ProgressPage.tsx
│       │   ├── QuestionPaperGeneratorPage.tsx
│       │   ├── QuizzesPage.tsx
│       │   ├── RouteErrorPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── StudyMaterialPage.tsx
│       │   ├── SubjectDetailPage.tsx
│       │   ├── SubjectsPage.tsx
│       │   ├── TopicDetailPage.tsx
│       │   ├── WorksheetGeneratorPage.tsx
│       │   └── index.ts
│       ├── routes/                   # React Router route definitions
│       │   └── index.tsx
│       └── types/                    # Shared TypeScript interfaces
│           ├── generator.ts
│           └── index.ts
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   ├── dev.db                    # SQLite Database
    │   └── schema.prisma             # Prisma schema & models
    ├── storage/
    │   └── pdfs/                     # Uploaded PDF files
    └── src/
        ├── app.ts                    # Express app configuration & middleware
        ├── server.ts                 # Server entry point (Port 5001)
        ├── ai/                       # AI provider integration & fallback logic
        │   ├── ai.service.ts
        │   ├── ai.types.ts
        │   └── providers/
        │       ├── groq.provider.ts
        │       └── nvidia.provider.ts
        ├── config/                   # Environment & database configuration
        │   ├── database.ts
        │   └── env.ts
        ├── controllers/              # Request controllers
        │   ├── academic.controller.ts
        │   ├── pdf.controller.ts
        │   └── quiz.controller.ts
        ├── middleware/               # Express middleware (upload, validation, errors)
        │   ├── error.middleware.ts
        │   └── upload.middleware.ts
        ├── pdf/                      # PDF extraction service
        │   └── extraction/
        │       └── pdf-extraction.service.ts
        ├── routes/                   # Express routers
        │   ├── academic.routes.ts
        │   ├── ai.routes.ts
        │   ├── evaluation.routes.ts
        │   ├── index.ts
        │   ├── pdf.routes.ts
        │   ├── questionPaper.routes.ts
        │   ├── quiz.routes.ts
        │   ├── report.routes.ts
        │   ├── student.routes.ts
        │   ├── tutor.routes.ts
        │   └── worksheet.routes.ts
        ├── services/                 # Business logic & export generators
        │   ├── academic.service.ts
        │   ├── pdf.service.ts
        │   ├── questionPaper.service.ts
        │   ├── quiz.service.ts
        │   └── worksheet.service.ts
        └── utils/                    # Shared response and validation helpers
            ├── response.utils.ts
            └── validation.ts
```

---

## API Documentation

All API endpoints are mounted under the `/api` prefix.

### Standard Response Structure

Successful JSON responses follow the standard format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

Error responses return:
```json
{
  "success": false,
  "message": "Error description message"
}
```

---

### 1. Health
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies that the backend server is running |

---

### 2. AI Tutor & Inference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/test` | Generates an AI response using the multi-provider service (NVIDIA primary, Groq fallback) |

**Request Body:**
```json
{
  "systemPrompt": "You are a helpful AI tutor for school students.",
  "prompt": "Explain photosynthesis to a Class 4 student."
}
```

**Response Data:**
```json
{
  "success": true,
  "data": {
    "response": "Photosynthesis is how plants make their own food...",
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "usage": {
      "promptTokens": 32,
      "completionTokens": 140,
      "totalTokens": 172
    }
  }
}
```

---

### 3. Study Material & PDFs (`/api/pdf`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pdf/upload` | Uploads a PDF (`multipart/form-data`) with optional academic metadata |
| `GET` | `/api/pdf` | Lists uploaded documents with pagination and filters (`classId`, `subjectId`, `chapterId`, `topicId`, `documentType`, `page`, `limit`) |
| `GET` | `/api/pdf/:id` | Gets metadata and details for a single document |
| `GET` | `/api/pdf/:id/content` | Gets extracted text content and extraction metrics for a document |
| `GET` | `/api/pdf/:id/file` | Streams the physical PDF binary for in-browser viewing or download |
| `PUT` | `/api/pdf/:id` | Updates document title, classification, or academic tags |
| `DELETE` | `/api/pdf/:id` | Deletes the document record and removes the file from disk |

---

### 4. AI Worksheet Generator (`/api/worksheets`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/worksheets/analyze-pdf` | Scans text from a document or raw string and returns curriculum metadata, concepts, vocabulary, and suggested questions |
| `POST` | `/api/worksheets/generate` | Generates a structured worksheet JSON based on source content and parameters |
| `POST` | `/api/worksheets/export/pdf` | Accepts worksheet JSON and streams a generated A4 printable PDF (`application/pdf`) |
| `POST` | `/api/worksheets/export/docx` | Accepts worksheet JSON and streams an editable Microsoft Word document (`.docx`) |
| `POST` | `/api/worksheets/save` | Persists a generated/edited worksheet to database history |
| `GET` | `/api/worksheets` | Retrieves all saved worksheets ordered by creation date |
| `GET` | `/api/worksheets/:id` | Retrieves a specific saved worksheet by ID |
| `DELETE` | `/api/worksheets/:id` | Deletes a saved worksheet from history |

---

### 5. AI Question Paper Generator (`/api/question-papers`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/question-papers/generate` | Generates a formal examination paper synthesized from selected worksheets and study material |
| `POST` | `/api/question-papers/export/pdf` | Generates and streams a formal examination A4 PDF (`application/pdf`) |
| `POST` | `/api/question-papers/export/docx` | Generates and streams an editable examination Microsoft Word document (`.docx`) |
| `POST` | `/api/question-papers/save` | Persists an examination paper to database history |
| `GET` | `/api/question-papers` | Retrieves all saved question papers ordered by creation date |
| `GET` | `/api/question-papers/:id` | Retrieves a specific saved question paper by ID |
| `DELETE` | `/api/question-papers/:id` | Deletes a saved question paper from history |

---

### 6. Academic Hierarchy (`/api/academic`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/academic` | Lists all classes |
| `POST` | `/api/academic` | Creates a new class (`name`) |
| `PUT` | `/api/academic/:id` | Updates a class name |
| `DELETE` | `/api/academic/:id` | Deletes a class |
| `GET` | `/api/academic/subjects` | Lists subjects (optional query `?classId=`) |
| `POST` | `/api/academic/subjects` | Creates a subject (`name`, `classId`) |
| `PUT` | `/api/academic/subjects/:id` | Updates a subject |
| `DELETE` | `/api/academic/subjects/:id` | Deletes a subject |
| `GET` | `/api/academic/chapters` | Lists chapters (optional query `?subjectId=`) |
| `POST` | `/api/academic/chapters` | Creates a chapter (`name`, `description`, `subjectId`) |
| `PUT` | `/api/academic/chapters/:id` | Updates a chapter |
| `DELETE` | `/api/academic/chapters/:id` | Deletes a chapter |
| `GET` | `/api/academic/topics` | Lists topics (optional query `?chapterId=`) |
| `POST` | `/api/academic/topics` | Creates a topic (`name`, `chapterId`) |
| `PUT` | `/api/academic/topics/:id` | Updates a topic |
| `DELETE` | `/api/academic/topics/:id` | Deletes a topic |

---

### 7. Quizzes (`/api/quizzes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/quizzes` | Lists quizzes (optional filters `?subjectId=&chapterId=`) |
| `POST` | `/api/quizzes` | Creates a quiz with multiple choice questions |
| `GET` | `/api/quizzes/:id` | Retrieves a single quiz with its questions |
| `PUT` | `/api/quizzes/:id` | Updates a quiz and its questions |
| `DELETE` | `/api/quizzes/:id` | Deletes a quiz |

---

## Database Models (Prisma / SQLite)

The database schema is defined in `backend/prisma/schema.prisma` and backed by SQLite (`backend/prisma/dev.db`):

- **`SchoolClass`**: Grade level / standard entity (`id`, `name`, timestamps). Has many `Subject` and `Document` records.
- **`Subject`**: Subject entity (`id`, `name`, `classId`). Relates to `SchoolClass`, has many `Chapter` and `Document` records.
- **`Chapter`**: Chapter entity (`id`, `name`, `description`, `subjectId`). Relates to `Subject`, has many `Topic` and `Document` records.
- **`Topic`**: Topic entity (`id`, `name`, `chapterId`). Relates to `Chapter`, has many `Document` records.
- **`Document`**: Uploaded file metadata (`id`, `title`, `fileName`, `filePath`, `fileType`, `fileSize`, `documentType`, `processed`, `extractedText`, `extractionStatus`, `extractionError`, `pageCount`, `characterCount`, timestamps). Links to optional `SchoolClass`, `Subject`, `Chapter`, and `Topic`.
- **`Worksheet`**: Saved worksheet records (`id`, `title`, `schoolName`, `schoolSubHeader`, `academicYear`, `examName`, `worksheetNumber`, `className`, `subjectName`, `chapterName`, `topicName`, `difficulty`, `contentJson`, `documentId`, timestamps).
- **`QuestionPaper`**: Saved question paper records (`id`, `title`, `schoolName`, `schoolSubHeader`, `academicYear`, `examName`, `className`, `subjectName`, `totalMarks`, `duration`, `difficulty`, `contentJson`, timestamps).
- **`Quiz`**: Quiz header (`id`, `title`, `description`, `subjectId`, `chapterId`, timestamps). Has many `QuizQuestion` records.
- **`QuizQuestion`**: Individual question item (`id`, `quizId`, `questionText`, `optionA`, `optionB`, `optionC`, `optionD`, `correctOption`, `explanation`, timestamps).

---

## Environment Variables

### Backend Configuration (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
# Server Port (Default is 5001)
PORT=5001

# SQLite Database Connection URL
DATABASE_URL="file:./dev.db"

# AI Provider Keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_MODEL=meta/llama-3.1-70b-instruct

# AI Orchestration Options
AI_REQUEST_TIMEOUT_MS=60000
AI_FALLBACK_ENABLED=true
```

> **Note on AI Keys:** At least one valid API key (`GROQ_API_KEY` or `NVIDIA_API_KEY`) is required to use the AI Tutor, Worksheet Generator, and Question Paper Generator.

### Frontend Configuration (`frontend/.env`)

Optional. By default, the Vite dev server proxies `/api` requests to `http://localhost:5001`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Initialize and push Prisma schema to SQLite database
npx prisma db push
npx prisma generate

# Create .env file with your API key
cp .env.example .env

# Start backend in watch mode (Runs on http://localhost:5001)
npm run dev
```

---

### 3. Frontend Setup

In a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

### 4. Accessing the Application

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## Build & Verification Commands

### Backend
```bash
# Typecheck and build TypeScript to dist/
npm run build --prefix backend

# Start production build
npm run start --prefix backend

# Inspect SQLite Database visually via Prisma Studio
npm run prisma:studio --prefix backend
```

### Frontend
```bash
# Typecheck and build optimized static assets to dist/
npm run build --prefix frontend

# Preview production build locally
npm run preview --prefix frontend

# Lint frontend codebase
npm run lint --prefix frontend
```

---

## Troubleshooting

### 1. Port 5001 Already in Use (`EADDRINUSE`)
The backend is configured to run on port `5001`. If another process is using this port:
```bash
# Find the PID occupying port 5001
lsof -i :5001

# Terminate the occupying process
kill -9 <PID>
```
*Do not change the backend port, as the frontend proxy and routing depend on port 5001.*

### 2. AI Generation Errors (`PROVIDER_UNAVAILABLE` or `AUTHENTICATION_ERROR`)
- Ensure either `GROQ_API_KEY` or `NVIDIA_API_KEY` is set in `backend/.env`.
- Ensure your API key is valid and has remaining quota.
- When `AI_FALLBACK_ENABLED=true`, if the primary NVIDIA provider encounters a network or timeout error, the system will automatically fall back to Groq.

### 3. PDF Extraction Shows `NO_TEXT` or `FAILED`
- Scanned PDF images without an embedded OCR text layer will return a `NO_TEXT` status. Use digital text PDFs or worksheets with machine-readable text.

### 4. Database Out of Sync
If the SQLite database schema requires a refresh:
```bash
cd backend
npx prisma db push
npx prisma generate
```

---

## Security & Best Practices

- **Never commit `.env` files**: All sensitive credentials and API keys must stay in local `.env` files.
- **Upload File Validation**: The backend checks MIME types on file uploads and only accepts `application/pdf`.
- **Input Sanitization**: All endpoint inputs are validated against strict Zod schemas.
- **PDF Character Sanitization**: Standard fonts in generated PDFs are sanitized to WinAnsi/ASCII boundaries to prevent glyph rendering exceptions.
