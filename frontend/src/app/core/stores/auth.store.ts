import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { AuthApiService } from '../services/auth-api.service';
import { AuthResponse } from '../models/auth.model';

const TOKEN_KEY = 'jwt_token';
const USER_KEY  = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApiService);

  private readonly _currentUser = signal<User | null>(null);
  private readonly _loading     = signal(false);
  private readonly _error       = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly loading     = this._loading.asReadonly();
  readonly error       = this._error.asReadonly();

  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin    = computed(() => this._currentUser()?.role === 'admin');
  readonly isEmployee = computed(() => this._currentUser()?.role === 'employee');

  constructor() {
    this.restoreSession();
  }

  // ── Appelé au démarrage ──────────────────────────────────────────────────

  private restoreSession(): void {
    const token   = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (!token || !userRaw) return;

    if (this.isTokenExpired(token)) {
      this.clearStorage();
      return;
    }

    try {
      this._currentUser.set(JSON.parse(userRaw) as User);
    } catch {
      this.clearStorage();
    }
  }

  // ── Actions publiques ────────────────────────────────────────────────────

  login(email: string, password: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.login({ email, password }).subscribe({
      next: (res: AuthResponse) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user: User = {
          id: res.id, name: res.name, email: res.email,
          role: res.role, department: res.department, position: res.position,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._currentUser.set(user);
        this._loading.set(false);
      },
      error: (err) => {
        this._loading.set(false);
        this._error.set(
          err.status === 401
            ? 'Email ou mot de passe incorrect'
            : 'Erreur serveur — réessayez plus tard',
        );
      },
    });
  }

  logout(): void {
    this.clearStorage();
    this._currentUser.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  // ── Utilitaires privés ───────────────────────────────────────────────────

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      // Décodage du payload JWT (base64url) — pas de vérification de signature côté client
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload['exp'] * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
