import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Priority, TodoFilterStatus } from '../../models/todo.model';
import { TodoStore } from '../../services/todo-store.service';

@Component({
    selector: 'app-filter-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    templateUrl: './filter-bar.html',
})
export class FilterBar {
    private readonly store = inject(TodoStore);
    readonly filters = this.store.filters;
    readonly allTags = this.store.allTags;

    readonly statuses: { value: TodoFilterStatus; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
    ];

    setStatus(status: TodoFilterStatus): void {
        this.store.setFilter({ status });
    }

    setSearch(search: string): void {
        this.store.setFilter({ search });
    }

    setPriority(priority: Priority | 'all'): void {
        this.store.setFilter({ priority });
    }

    setTag(tag: string): void {
        this.store.setFilter({ tag });
    }

    reset(): void {
        this.store.resetFilters();
    }

    sortByPriority(): void {
        this.store.sortByPriority();
    }
}
