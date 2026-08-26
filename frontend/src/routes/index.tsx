import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import {
  DashboardPage,
  AITutorPage,
  StudyMaterialPage,
  DocumentViewerPage,
  ClassesPage,
  ClassDetailPage,
  SubjectsPage,
  SubjectDetailPage,
  ChapterDetailPage,
  TopicDetailPage,
  QuizzesPage,
  ProgressPage,
  ProfilePage,
  SettingsPage,
  NotFoundPage,
} from '@/pages'

const routes = [
  {
    path: 'dashboard',
    element: <DashboardPage />,
  },
  {
    path: 'ai-tutor',
    element: <AITutorPage />,
  },
  {
    path: 'study-material',
    element: <StudyMaterialPage />,
  },
  {
    path: 'study-material/:id',
    element: <DocumentViewerPage />,
  },
  {
    path: 'classes',
    element: <ClassesPage />,
  },
  {
    path: 'classes/:id',
    element: <ClassDetailPage />,
  },
  {
    path: 'subjects',
    element: <SubjectsPage />,
  },
  {
    path: 'subjects/:id',
    element: <SubjectDetailPage />,
  },
  {
    path: 'subjects/:subjectId/chapters/:chapterId',
    element: <ChapterDetailPage />,
  },
  {
    path: 'subjects/:subjectId/chapters/:chapterId/topics',
    element: <TopicDetailPage />,
  },
  {
    path: 'quizzes',
    element: <QuizzesPage />,
  },
  {
    path: 'progress',
    element: <ProgressPage />,
  },
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'settings',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [{ index: true, element: <Navigate to="dashboard" replace /> }, ...routes],
  },
])
