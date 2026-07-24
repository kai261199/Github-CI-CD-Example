import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'flow.theme';

function initialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
    }
    if (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark';
    }
    return 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly theme = signal<ThemeMode>(initialTheme());

    constructor() {
        effect(() => {
            const mode = this.theme();
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark', mode === 'dark');
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, mode);
            }
        });
    }

    toggle(): void {
        this.theme.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
    }
}
