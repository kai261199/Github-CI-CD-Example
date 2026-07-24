export type Priority = 'low' | 'medium' | 'high';

export type TodoFilterStatus = 'all' | 'active' | 'completed';

export interface Todo {
    id: string;
    title: string;
    notes: string;
    completed: boolean;
    priority: Priority;
    tags: string[];
    dueDate: string | null; // ISO date string (yyyy-mm-dd) or null
    order: number;
    createdAt: string; // ISO datetime
}

export interface TodoFilters {
    status: TodoFilterStatus;
    priority: Priority | 'all';
    tag: string | 'all';
    search: string;
}

export interface NewTodoInput {
    title: string;
    notes?: string;
    priority?: Priority;
    tags?: string[];
    dueDate?: string | null;
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const PRIORITY_WEIGHT: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};
