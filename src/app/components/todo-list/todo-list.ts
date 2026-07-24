import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoStore } from '../../services/todo-store.service';
import { TodoItem } from '../todo-item/todo-item';

@Component({
    selector: 'app-todo-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DragDropModule, TodoItem],
    templateUrl: './todo-list.html',
})
export class TodoList {
    private readonly store = inject(TodoStore);
    readonly todos = this.store.filteredTodos;
    readonly totalCount = this.store.stats;

    drop(event: CdkDragDrop<Todo[]>): void {
        this.store.reorder(this.todos(), event.previousIndex, event.currentIndex);
    }

    clearCompleted(): void {
        this.store.clearCompleted();
    }

    trackById(_index: number, todo: Todo): string {
        return todo.id;
    }
}
