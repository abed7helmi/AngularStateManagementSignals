import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../../../shared/sidebar/sidebar.component';
import { NotificationToastComponent } from '../../../shared/notification-toast/notification-toast.component';
import { RequestStore } from '../../../core/stores/request.store';

@Component({
  selector: 'app-employee-layout',
  imports: [RouterOutlet, SidebarComponent, NotificationToastComponent],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css',
})
export class EmployeeLayoutComponent {
  private readonly req = inject(RequestStore);

  readonly navItems = signal<NavItem[]>([
    { path: '/employee/dashboard',    label: 'Mon espace',        icon: '🏠' },
    { path: '/employee/my-equipment', label: 'Mes équipements',   icon: '💻' },
    { path: '/employee/request',      label: 'Faire une demande', icon: '📋' },
  ]);
}
