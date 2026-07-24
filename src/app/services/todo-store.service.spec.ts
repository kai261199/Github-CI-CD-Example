import { TestBed } from '@angular/core/testing';
import { TodoStore } from './todo-store.service';

describe('TodoStore', () => {
    let store: TodoStore;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        store = TestBed.inject(TodoStore);
    });

    it('starts empty', () => {
        expect(store.todos().length).toBe(0);
        expect(store.stats().total).toBe(0);
    });

    it('adds a todo with defaults', () => {
        store.add({ title: 'Write tests' });
        const todos = store.todos();
        expect(todos.length).toBe(1);
        expect(todos[0].title).toBe('Write tests');
        expect(todos[0].completed).toBeFalse();
        expect(todos[0].priority).toBe('medium');
    });

    it('ignores blank titles', () => {
        store.add({ title: '   ' });
        expect(store.todos().length).toBe(0);
    });

    it('normalizes and de-duplicates tags', () => {
        store.add({ title: 'Task', tags: ['Work', 'work', ' Urgent '] });
        expect(store.todos()[0].tags).toEqual(['work', 'urgent']);
    });

    it('toggles completion and updates stats', () => {
        store.add({ title: 'A' });
        const id = store.todos()[0].id;
        store.toggle(id);
        expect(store.todos()[0].completed).toBeTrue();
        expect(store.stats().completed).toBe(1);
        expect(store.stats().percentComplete).toBe(100);
    });

    it('removes a todo', () => {
        store.add({ title: 'A' });
        const id = store.todos()[0].id;
        store.remove(id);
        expect(store.todos().length).toBe(0);
    });

    it('clears completed todos only', () => {
        store.add({ title: 'A' });
        store.add({ title: 'B' });
        const first = store.todos()[0].id;
        store.toggle(first);
        store.clearCompleted();
        expect(store.todos().length).toBe(1);
        expect(store.todos()[0].completed).toBeFalse();
    });

    it('filters by search term', () => {
        store.add({ title: 'Buy milk' });
        store.add({ title: 'Read book' });
        store.setFilter({ search: 'milk' });
        const filtered = store.filteredTodos();
        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toBe('Buy milk');
    });

    it('filters by status and priority', () => {
        store.add({ title: 'High task', priority: 'high' });
        store.add({ title: 'Low task', priority: 'low' });
        store.setFilter({ priority: 'high' });
        expect(store.filteredTodos().length).toBe(1);
        expect(store.filteredTodos()[0].title).toBe('High task');
    });

    it('counts overdue active todos', () => {
        store.add({ title: 'Old', dueDate: '2000-01-01' });
        expect(store.stats().overdue).toBe(1);
        const id = store.todos()[0].id;
        store.toggle(id);
        expect(store.stats().overdue).toBe(0);
    });

    it('persists to localStorage', () => {
        store.add({ title: 'Persisted' });
        TestBed.tick();
        const raw = localStorage.getItem('flow.todos.v1');
        expect(raw).toContain('Persisted');
    });

    it('reorders within the displayed list', () => {
        store.add({ title: 'A' });
        store.add({ title: 'B' });
        store.add({ title: 'C' });
        const before = store.todos().map((t) => t.title);
        store.reorder(store.todos(), 0, 2);
        const after = store.todos().map((t) => t.title);
        expect(after).not.toEqual(before);
        expect(after[2]).toBe(before[0]);
    });
});
