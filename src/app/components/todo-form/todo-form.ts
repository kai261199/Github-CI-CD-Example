import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITIES, Priority } from '../../models/todo.model';
import { TodoStore } from '../../services/todo-store.service';

@Component({
    selector: 'app-todo-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    templateUrl: './todo-form.html',
})
export class TodoForm {
    private readonly store = inject(TodoStore);
    readonly priorities = PRIORITIES;

    readonly title = signal('');
    readonly priority = signal<Priority>('medium');
    readonly dueDate = signal<string>('');
    readonly tags = signal<string>('');
    readonly notes = signal<string>('');
    readonly expanded = signal(false);

    submit(): void {
        const title = this.title().trim();
        if (!title) {
            return;
        }
        this.store.add({
            title,
            priority: this.priority(),
            dueDate: this.dueDate() || null,
            tags: this.tags()
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            notes: this.notes(),
        });
        this.reset();
    }

    private reset(): void {
        this.title.set('');
        this.priority.set('medium');
        this.dueDate.set('');
        this.tags.set('');
        this.notes.set('');
        this.expanded.set(false);
    }
}
