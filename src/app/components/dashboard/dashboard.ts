import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TodoStore } from '../../services/todo-store.service';

@Component({
    selector: 'app-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard.html',
})
export class Dashboard {
    private readonly store = inject(TodoStore);
    readonly stats = this.store.stats;
}
