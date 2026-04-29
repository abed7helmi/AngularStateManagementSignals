import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../../shared/sidebar.component';
import { NotificationToastComponent } from '../../shared/notification-toast.component';
import { RequestStore } from '../../core/stores/request.store';

@Component({
  selector: 'app-employee-layout',
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
export class EmployeeLayoutComponent {
  private readonly req = inject(RequestStore);

  readonly navItems = signal<NavItem[]>([
    { path: '/employee/dashboard',    label: 'Mon espace',        icon: '🏠' },
    { path: '/employee/my-equipment', label: 'Mes équipements',   icon: '💻' },
    { path: '/employee/request',      label: 'Faire une demande', icon: '📋' },
  ]);
}
