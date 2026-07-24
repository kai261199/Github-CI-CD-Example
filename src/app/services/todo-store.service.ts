import { Injectable, computed, effect, signal } from '@angular/core';
import {
    NewTodoInput,
    PRIORITY_WEIGHT,
    Priority,
    Todo,
    TodoFilters,
} from '../models/todo.model';

const STORAGE_KEY = 'flow.todos.v1';

function createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadTodos(): Todo[] {
    if (typeof localStorage === 'undefined') {
        return [];
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw) as Todo[];
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed;
    } catch {
        return [];
    }
}

const DEFAULT_FILTERS: TodoFilters = {
    status: 'all',
    priority: 'all',
    tag: 'all',
    search: '',
};

@Injectable({ providedIn: 'root' })
export class TodoStore {
    private readonly _todos = signal<Todo[]>(loadTodos());
    readonly filters = signal<TodoFilters>({ ...DEFAULT_FILTERS });

    /** All todos sorted by their manual order. */
    readonly todos = computed(() =>
        [...this._todos()].sort((a, b) => a.order - b.order),
    );

    /** Distinct tags across all todos, alphabetically sorted. */
    readonly allTags = computed(() => {
        const set = new Set<string>();
        for (const todo of this._todos()) {
            for (const tag of todo.tags) {
                set.add(tag);
            }
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    });

    /** Todos after applying the active filters. */
    readonly filteredTodos = computed(() => {
        const { status, priority, tag, search } = this.filters();
        const term = search.trim().toLowerCase();

        return this.todos().filter((todo) => {
            if (status === 'active' && todo.completed) {
                return false;
            }
            if (status === 'completed' && !todo.completed) {
                return false;
            }
            if (priority !== 'all' && todo.priority !== priority) {
                return false;
            }
            if (tag !== 'all' && !todo.tags.includes(tag)) {
                return false;
            }
            if (term) {
                const haystack = `${todo.title} ${todo.notes} ${todo.tags.join(' ')}`.toLowerCase();
                if (!haystack.includes(term)) {
                    return false;
                }
            }
            return true;
        });
    });

    /** Aggregate statistics for the dashboard. */
    readonly stats = computed(() => {
        const todos = this._todos();
        const total = todos.length;
        const completed = todos.filter((t) => t.completed).length;
        const active = total - completed;
        const today = new Date().toISOString().slice(0, 10);
        const overdue = todos.filter(
            (t) => !t.completed && t.dueDate !== null && t.dueDate < today,
        ).length;
        const byPriority: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
        for (const t of todos) {
            if (!t.completed) {
                byPriority[t.priority]++;
            }
        }
        const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { total, completed, active, overdue, byPriority, percentComplete };
    });

    constructor() {
        // Persist to localStorage whenever the list changes.
        effect(() => {
            const todos = this._todos();
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
            }
        });
    }

    add(input: NewTodoInput): void {
        const title = input.title.trim();
        if (!title) {
            return;
        }
        const nextOrder =
            this._todos().reduce((min, t) => Math.min(min, t.order), 0) - 1;
        const todo: Todo = {
            id: createId(),
            title,
            notes: input.notes?.trim() ?? '',
            completed: false,
            priority: input.priority ?? 'medium',
            tags: this.normalizeTags(input.tags ?? []),
            dueDate: input.dueDate ?? null,
            order: nextOrder,
            createdAt: new Date().toISOString(),
        };
        this._todos.update((list) => [todo, ...list]);
    }

    update(id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
        this._todos.update((list) =>
            list.map((t) =>
                t.id === id
                    ? {
                        ...t,
                        ...changes,
                        title: changes.title !== undefined ? changes.title.trim() : t.title,
                        tags:
                            changes.tags !== undefined
                                ? this.normalizeTags(changes.tags)
                                : t.tags,
                    }
                    : t,
            ),
        );
    }

    toggle(id: string): void {
        this._todos.update((list) =>
            list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        );
    }

    remove(id: string): void {
        this._todos.update((list) => list.filter((t) => t.id !== id));
    }

    clearCompleted(): void {
        this._todos.update((list) => list.filter((t) => !t.completed));
    }

    setFilter(patch: Partial<TodoFilters>): void {
        this.filters.update((f) => ({ ...f, ...patch }));
    }

    resetFilters(): void {
        this.filters.set({ ...DEFAULT_FILTERS });
    }

    /** Sort todos by priority (high first), keeping completed at the bottom. */
    sortByPriority(): void {
        const sorted = [...this._todos()].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        });
        this._todos.update((list) => {
            const orderById = new Map(sorted.map((t, index) => [t.id, index]));
            return list.map((t) => ({ ...t, order: orderById.get(t.id) ?? t.order }));
        });
    }

    private normalizeTags(tags: string[]): string[] {
        const cleaned = tags
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
        return [...new Set(cleaned)];
    }
}
