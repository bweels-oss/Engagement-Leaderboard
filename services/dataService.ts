import { Team, Task, Submission, TeamMember, TaskStatus } from '../types';
import { MOCK_TEAMS_DATA, MOCK_TASKS_LIST } from '../constants';

// Helper to generate initial state
export const generateInitialData = () => {
  const teams: Team[] = MOCK_TEAMS_DATA.map(t => ({
    ...t,
    members: [],
    points: 0,
    rank: 0,
    percentComplete: 0,
    completedTaskCount: 0,
  }));

  const tasks: Task[] = [];
  
  // Assign tasks to teams
  teams.forEach(team => {
    // Determine a random completion status for demo purposes
    const targetCompletion = Math.random(); // 0 to 1
    
    for (let i = 0; i < team.tasksRequired; i++) {
      const template = MOCK_TASKS_LIST[i % MOCK_TASKS_LIST.length];
      const isComplete = i / team.tasksRequired < targetCompletion;
      
      tasks.push({
        id: `task-${team.id}-${i}`,
        teamId: team.id,
        title: template.title,
        points: template.points,
        status: isComplete ? 'Completed' : 'Pending',
        completedDate: isComplete ? new Date().toISOString() : undefined
      });
    }
  });

  return { teams: recalculateRankings(teams, tasks), tasks, submissions: [] as Submission[] };
};

// Core Logic: Recalculate stats and ranks
export const recalculateRankings = (teams: Team[], tasks: Task[]): Team[] => {
  const computedTeams = teams.map(team => {
    const teamTasks = tasks.filter(t => t.teamId === team.id);
    const completedTasks = teamTasks.filter(t => t.status === 'Completed');
    
    const completedCount = completedTasks.length;
    const requiredCount = team.tasksRequired;
    const percent = requiredCount > 0 ? Math.round((completedCount / requiredCount) * 100) : 0;
    const points = completedTasks.reduce((sum, t) => sum + t.points, 0);

    return {
      ...team,
      percentComplete: percent,
      completedTaskCount: completedCount,
      points: points,
    };
  });

  // Sort by Percent DESC, then Points DESC
  computedTeams.sort((a, b) => {
    if (b.percentComplete !== a.percentComplete) {
      return b.percentComplete - a.percentComplete;
    }
    return b.points - a.points;
  });

  // Assign Rank
  return computedTeams.map((team, index) => ({
    ...team,
    rank: index + 1
  }));
};

// Simulate Form Ingestion
export const ingestSubmission = (
  currentTeams: Team[], 
  currentTasks: Task[], 
  formData: { teamName: string; taskTitle: string; formPlatform: 'Microsoft' | 'Google' }
) => {
  // 1. Find Team
  const team = currentTeams.find(t => t.name.toLowerCase() === formData.teamName.toLowerCase());
  if (!team) throw new Error(`Team "${formData.teamName}" not found.`);

  // 2. Find Task (Simulate matching a task by title or generic assignment)
  // In a real app, the form might pass a Task ID or we fuzzy match title
  let task = currentTasks.find(t => t.teamId === team.id && t.title.toLowerCase().includes(formData.taskTitle.toLowerCase()));
  
  // If task doesn't exist, maybe create it or ignore? For demo, we ignore if not found.
  if (!task) return { teams: currentTeams, tasks: currentTasks, newSubmission: null };

  // 3. Update Task Status
  const updatedTasks = currentTasks.map(t => {
    if (t.id === task!.id) {
      return { ...t, status: 'Completed' as TaskStatus, completedDate: new Date().toISOString() };
    }
    return t;
  });

  // 4. Create Submission Record
  const newSubmission: Submission = {
    id: `sub-${Date.now()}`,
    teamId: team.id,
    formId: formData.formPlatform === 'Microsoft' ? 'ms-forms-hook' : 'g-forms-hook',
    submittedAt: new Date().toISOString(),
    dataBlob: formData
  };

  // 5. Recalc Ranks
  const updatedTeams = recalculateRankings(currentTeams, updatedTasks);

  return { teams: updatedTeams, tasks: updatedTasks, newSubmission };
};