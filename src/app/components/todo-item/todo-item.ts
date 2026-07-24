import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITIES, Priority, Todo } from '../../models/todo.model';
import { TodoStore } from '../../services/todo-store.service';

@Component({
    selector: 'app-todo-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    templateUrl: './todo-item.html',
})
export class TodoItem {
    private readonly store = inject(TodoStore);
    readonly todo = input.required<Todo>();
    readonly priorities = PRIORITIES;

    readonly editing = signal(false);

    // Draft fields used while editing.
    readonly draftTitle = signal('');
    readonly draftPriority = signal<Priority>('medium');
    readonly draftDueDate = signal<string>('');
    readonly draftTags = signal<string>('');
    readonly draftNotes = signal<string>('');

    readonly isOverdue = computed(() => {
        const t = this.todo();
        if (t.completed || !t.dueDate) {
            return false;
        }
        return t.dueDate < new Date().toISOString().slice(0, 10);
    });

    readonly priorityClasses = computed(() => {
        switch (this.todo().priority) {
            case 'high':
                return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
            case 'medium':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
            default:
                return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300';
        }
    });

    readonly accentClass = computed(() => {
        switch (this.todo().priority) {
            case 'high':
                return 'bg-rose-400';
            case 'medium':
                return 'bg-amber-400';
            default:
                return 'bg-sky-400';
        }
    });

    toggle(): void {
        this.store.toggle(this.todo().id);
    }

    remove(): void {
        this.store.remove(this.todo().id);
    }

    startEdit(): void {
        const t = this.todo();
        this.draftTitle.set(t.title);
        this.draftPriority.set(t.priority);
        this.draftDueDate.set(t.dueDate ?? '');
        this.draftTags.set(t.tags.join(', '));
        this.draftNotes.set(t.notes);
        this.editing.set(true);
    }

    cancelEdit(): void {
        this.editing.set(false);
    }

    saveEdit(): void {
        const title = this.draftTitle().trim();
        if (!title) {
            return;
        }
        this.store.update(this.todo().id, {
            title,
            priority: this.draftPriority(),
            dueDate: this.draftDueDate() || null,
            tags: this.draftTags()
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            notes: this.draftNotes(),
        });
        this.editing.set(false);
    }

    formatDate(iso: string): string {
        const date = new Date(`${iso}T00:00:00`);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    }
}
