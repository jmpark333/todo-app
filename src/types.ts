export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

export type ViewType = 'all' | 'today' | 'scheduled';