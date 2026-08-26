import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import {
  DashboardPage,
  AITutorPage,
  StudyMaterialPage,
  ClassesPage,
  SubjectsPage,
  QuizzesPage,
  ProgressPage,
  ProfilePage,
  SettingsPage,
} from '@/pages'

const appRoutes = [
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
    path: 'classes',
    element: <ClassesPage />,
  },
  {
    path: 'subjects',
    element: <SubjectsPage />,
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
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <div>Error</div>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      ...appRoutes,
    ],
  },
])