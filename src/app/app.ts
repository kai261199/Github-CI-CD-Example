import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Dashboard } from './components/dashboard/dashboard';
import { FilterBar } from './components/filter-bar/filter-bar';
import { TodoForm } from './components/todo-form/todo-form';
import { TodoList } from './components/todo-list/todo-list';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dashboard, FilterBar, TodoForm, TodoList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
