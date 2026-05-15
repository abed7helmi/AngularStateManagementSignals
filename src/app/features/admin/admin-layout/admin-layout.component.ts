import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../../../shared/sidebar/sidebar.component';
import { NotificationToastComponent } from '../../../shared/notification-toast/notification-toast.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SidebarComponent, NotificationToastComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  readonly navItems = signal<NavItem[]>([
    { path: '/admin/dashboard',  label: 'Tableau de bord', icon: '📊' },
    { path: '/admin/equipment',  label: 'Équipements',     icon: '💻' },
    { path: '/admin/employees',  label: 'Employés',        icon: '👥' },
    { path: '/admin/requests',   label: 'Demandes',        icon: '📋' },
  ]);
}
