import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../core/stores/auth.store';
import { Router } from '@angular/router';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">🖥️</div>
        <div class="sidebar-brand">
          <span class="brand-name">IT Stock</span>
          <span class="brand-sub">{{ auth.isAdmin() ? 'Administration' : 'Espace Employé' }}</span>
        </div>
      </div>

      <div class="sidebar-user">
        <div class="user-avatar-sm">{{ auth.currentUser()?.name?.[0] }}</div>
        <div class="user-details">
          <span class="user-name-sm">{{ auth.currentUser()?.name }}</span>
          <span class="user-dept">{{ auth.currentUser()?.department }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        @for (item of navItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      min-width: 240px;
      height: 100vh;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      overflow: hidden;
    }
    .sidebar-header {
      padding: 20px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1e293b;
    }
    .sidebar-logo { font-size: 1.6rem; }
    .brand-name { display: block; font-weight: 700; color: #f1f5f9; font-size: 0.95rem; }
    .brand-sub  { display: block; font-size: 0.72rem; color: #6366f1; font-weight: 500; }

    .sidebar-user {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1e293b;
      background: #1e293b;
    }
    .user-avatar-sm {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: #6366f1;
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.875rem;
      flex-shrink: 0;
    }
    .user-name-sm { display: block; color: #f1f5f9; font-size: 0.82rem; font-weight: 600; }
    .user-dept    { display: block; color: #64748b; font-size: 0.72rem; }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-item:hover { background: #1e293b; color: #f1f5f9; }
    .nav-item.active { background: #6366f1; color: #fff; }
    .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid #1e293b;
    }
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #94a3b8;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .logout-btn:hover { background: #7f1d1d; color: #fca5a5; }
  `],
})
export class SidebarComponent {
  readonly auth = inject(AuthStore);
  readonly navItems = input<NavItem[]>([]);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
