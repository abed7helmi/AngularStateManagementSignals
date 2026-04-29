import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">🖥️</div>
          <h1>IT Stock Manager</h1>
          <p>Gestion du parc informatique</p>
        </div>

        <div class="login-body">
          <p class="select-hint">Sélectionnez un utilisateur pour vous connecter</p>

          <div class="user-list">
            @for (user of users(); track user.id) {
              <button
                class="user-btn"
                [class.selected]="selectedId() === user.id"
                [class.admin-btn]="user.role === 'admin'"
                (click)="select(user.id)"
              >
                <div class="user-avatar" [class.admin-avatar]="user.role === 'admin'">
                  {{ user.name[0] }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-meta">{{ user.position }} · {{ user.department }}</span>
                </div>
                <span class="user-role-badge" [class.role-admin]="user.role === 'admin'">
                  {{ user.role === 'admin' ? 'Admin' : 'Employé' }}
                </span>
              </button>
            }
          </div>

          <button
            class="btn-login"
            [disabled]="!selectedId()"
            (click)="login()"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: #fff;
      border-radius: 20px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .login-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #fff;
      padding: 32px;
      text-align: center;
    }
    .logo { font-size: 3rem; margin-bottom: 8px; }
    .login-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 6px; }
    .login-header p  { color: #94a3b8; margin: 0; font-size: 0.9rem; }
    .login-body { padding: 28px 32px 32px; }
    .select-hint { text-align: center; color: #64748b; font-size: 0.875rem; margin: 0 0 16px; }

    .user-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
      width: 100%;
    }
    .user-btn:hover { border-color: #6366f1; background: #eef2ff; }
    .user-btn.selected { border-color: #6366f1; background: #eef2ff; }
    .user-btn.admin-btn.selected { border-color: #7c3aed; background: #f5f3ff; }

    .user-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: #6366f1;
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
      flex-shrink: 0;
    }
    .admin-avatar { background: #7c3aed; }

    .user-info { flex: 1; min-width: 0; }
    .user-name { display: block; font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    .user-meta { display: block; color: #64748b; font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .user-role-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 999px;
      background: #dbeafe;
      color: #1e40af;
      flex-shrink: 0;
    }
    .role-admin { background: #ede9fe; color: #6d28d9; }

    .btn-login {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #7c3aed);
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    .btn-login:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-login:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly users = signal(this.auth.availableUsers);
  readonly selectedId = signal<string | null>(null);

  select(id: string): void {
    this.selectedId.set(id);
  }

  login(): void {
    const id = this.selectedId();
    if (!id) return;
    const success = this.auth.login(id);
    if (success) {
      const isAdmin = this.auth.isAdmin();
      this.router.navigate([isAdmin ? '/admin/dashboard' : '/employee/dashboard']);
    }
  }
}
