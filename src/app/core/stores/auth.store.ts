import { computed, effect, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../mock-data';

const STORAGE_KEY = 'it_stock_user_id';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _currentUser = signal<User | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isEmployee = computed(() => this._currentUser()?.role === 'employee');
  readonly availableUsers = MOCK_USERS;

  constructor() {
    // Persist session to localStorage via effect
    effect(() => {
      const user = this._currentUser();
      if (user) {
        localStorage.setItem(STORAGE_KEY, user.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  private loadFromStorage(): User | null {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return null;
    return MOCK_USERS.find((u) => u.id === savedId) ?? null;
  }

  login(userId: string): boolean {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      this._currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
