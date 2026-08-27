const TITLES: Array<[RegExp, string]> = [
  [/^\/dashboard\/?$/, 'Dashboard'],
  [/^\/ai-tutor\/?$/, 'AI Tutor'],
  [/^\/study-material\/?$/, 'Study Material'],
  [/^\/study-material\/[^/]+\/?$/, 'Document'],
  [/^\/worksheet-generator\/?$/, 'AI Worksheet Generator'],
  [/^\/question-paper-generator\/?$/, 'AI Question Paper Generator'],
  [/^\/classes\/?$/, 'Classes'],

  [/^\/classes\/[^/]+\/?$/, 'Class'],
  [/^\/subjects\/?$/, 'Subjects'],
  [/^\/subjects\/[^/]+\/?$/, 'Subject'],
  [/^\/subjects\/[^/]+\/chapters\/?$/, 'Chapters'],
  [/^\/subjects\/[^/]+\/chapters\/[^/]+\/?$/, 'Chapter'],
  [/^\/subjects\/[^/]+\/chapters\/[^/]+\/topics\/?$/, 'Topics'],
  [/^\/quizzes\/?$/, 'Quizzes'],
  [/^\/progress\/?$/, 'Progress'],
  [/^\/settings\/?$/, 'Settings'],
  [/^\/profile\/?$/, 'Profile'],
]

export function getPageTitle(pathname: string): string {
  for (const [pattern, title] of TITLES) {
    if (pattern.test(pathname)) return title
  }
  return 'KES'
}
