import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../../shared/sidebar.component';
import { NotificationToastComponent } from '../../shared/notification-toast.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent, NotificationToastComponent],
  template: `
    <div class="layout">
      <app-sidebar [navItems]="navItems()" />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
    <app-notification-toast />
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: #f1f5f9; }
    .main-content { flex: 1; overflow-y: auto; min-width: 0; }
  `],
})
export class AdminLayoutComponent {
  readonly navItems = signal<NavItem[]>([
    { path: '/admin/dashboard',  label: 'Tableau de bord', icon: '📊' },
    { path: '/admin/equipment',  label: 'Équipements',     icon: '💻' },
    { path: '/admin/employees',  label: 'Employés',        icon: '👥' },
    { path: '/admin/requests',   label: 'Demandes',        icon: '📋' },
  ]);
}
