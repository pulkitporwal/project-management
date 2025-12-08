import { create } from 'zustand';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  dueDate?: string;
  teamIds: string[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  performance: number;
}

interface AppState {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  sidebarOpen: boolean;
  currentView: string;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addProject: (project: Project) => void;
}

// Sample data
const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', avatar: 'AJ', role: 'Product Manager', department: 'Product', status: 'online', performance: 92 },
  { id: '2', name: 'Sarah Chen', email: 'sarah@company.com', avatar: 'SC', role: 'Senior Developer', department: 'Engineering', status: 'online', performance: 88 },
  { id: '3', name: 'Mike Williams', email: 'mike@company.com', avatar: 'MW', role: 'UI/UX Designer', department: 'Design', status: 'away', performance: 85 },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', avatar: 'ED', role: 'Backend Developer', department: 'Engineering', status: 'online', performance: 90 },
  { id: '5', name: 'James Wilson', email: 'james@company.com', avatar: 'JW', role: 'DevOps Engineer', department: 'Engineering', status: 'offline', performance: 87 },
];

const sampleProjects: Project[] = [
  { id: '1', name: 'Website Redesign', description: 'Complete overhaul of the company website', color: '#3B82F6', status: 'active', progress: 65, dueDate: '2024-03-15', teamIds: ['1', '2', '3'], createdAt: '2024-01-01' },
  { id: '2', name: 'Mobile App v2.0', description: 'Major update to the mobile application', color: '#10B981', status: 'active', progress: 40, dueDate: '2024-04-20', teamIds: ['2', '4'], createdAt: '2024-01-15' },
  { id: '3', name: 'API Integration', description: 'Third-party API integrations for new features', color: '#F59E0B', status: 'active', progress: 80, dueDate: '2024-02-28', teamIds: ['4', '5'], createdAt: '2024-01-10' },
  { id: '4', name: 'Dashboard Analytics', description: 'Build comprehensive analytics dashboard', color: '#8B5CF6', status: 'active', progress: 25, dueDate: '2024-05-01', teamIds: ['1', '2', '3'], createdAt: '2024-02-01' },
];

const sampleTasks: Task[] = [
  { id: '1', title: 'Design new landing page', description: 'Create mockups for the new landing page', status: 'in-progress', priority: 'high', projectId: '1', assigneeId: '3', dueDate: '2024-02-15', tags: ['design', 'ui'], createdAt: '2024-01-20', updatedAt: '2024-02-01' },
  { id: '2', title: 'Implement authentication', description: 'Set up OAuth and JWT authentication', status: 'done', priority: 'urgent', projectId: '2', assigneeId: '2', tags: ['backend', 'security'], createdAt: '2024-01-18', updatedAt: '2024-02-05' },
  { id: '3', title: 'API documentation', description: 'Write comprehensive API docs', status: 'review', priority: 'medium', projectId: '3', assigneeId: '4', tags: ['docs'], createdAt: '2024-01-25', updatedAt: '2024-02-03' },
  { id: '4', title: 'Performance optimization', description: 'Optimize database queries', status: 'todo', priority: 'high', projectId: '3', assigneeId: '5', tags: ['backend', 'performance'], createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: '5', title: 'User testing sessions', description: 'Conduct user testing for new features', status: 'backlog', priority: 'medium', projectId: '1', assigneeId: '1', tags: ['research', 'ux'], createdAt: '2024-02-02', updatedAt: '2024-02-02' },
  { id: '6', title: 'Mobile responsive fixes', description: 'Fix responsive issues on mobile devices', status: 'in-progress', priority: 'high', projectId: '1', assigneeId: '3', dueDate: '2024-02-10', tags: ['frontend', 'mobile'], createdAt: '2024-01-28', updatedAt: '2024-02-04' },
  { id: '7', title: 'Setup CI/CD pipeline', description: 'Configure automated deployment', status: 'done', priority: 'urgent', projectId: '2', assigneeId: '5', tags: ['devops'], createdAt: '2024-01-15', updatedAt: '2024-01-30' },
  { id: '8', title: 'Dashboard widgets', description: 'Create reusable chart components', status: 'todo', priority: 'medium', projectId: '4', assigneeId: '2', tags: ['frontend', 'charts'], createdAt: '2024-02-05', updatedAt: '2024-02-05' },
];

export const useAppStore = create<AppState>((set) => ({
  tasks: sampleTasks,
  projects: sampleProjects,
  teamMembers: sampleTeamMembers,
  sidebarOpen: true,
  currentView: 'dashboard',
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentView: (view) => set({ currentView: view }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ),
  })),
  
  moveTask: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
    ),
  })),
  
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
}));
