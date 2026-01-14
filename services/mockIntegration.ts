import { MOCK_TEAMS_DATA, MOCK_TASKS_LIST } from '../constants';
import { MicrosoftForm } from '../types';

export const AVAILABLE_FORMS: MicrosoftForm[] = [
  { id: 'form-safety-2025', title: 'Daily Safety Check-in', url: 'https://forms.office.com/e/safety-check' },
  { id: 'form-engagement-q1', title: 'Q1 Engagement Challenge Log', url: 'https://forms.office.com/e/engage-q1' },
  { id: 'form-innovation', title: 'Innovation Ideas Submission', url: 'https://forms.office.com/e/innovate' },
];

// Simulates checking the Microsoft Graph API for new responses
// Returns a random valid submission payload occasionally
export const checkForNewMockResponses = (connectedFormId: string) => {
  // 30% chance to find a "new" submission on every poll
  const shouldFindNew = Math.random() < 0.3;
  
  if (!shouldFindNew) return null;

  // Generate a valid submission that matches our mock data
  const randomTeam = MOCK_TEAMS_DATA[Math.floor(Math.random() * MOCK_TEAMS_DATA.length)];
  const randomTask = MOCK_TASKS_LIST[Math.floor(Math.random() * MOCK_TASKS_LIST.length)];

  return {
    teamName: randomTeam.name,
    taskTitle: randomTask.title,
    formPlatform: 'Microsoft' as const,
    meta: {
      sourceFormId: connectedFormId,
      timestamp: new Date().toISOString()
    }
  };
};

export const mockMicrosoftLogin = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 1500); // Simulate network delay
  });
};