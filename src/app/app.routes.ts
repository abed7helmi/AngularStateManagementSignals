import { Routes } from '@angular/router';
import { authGuard, adminGuard, employeeGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'equipment',
        loadComponent: () =>
          import('./features/admin/admin-equipment.component').then((m) => m.AdminEquipmentComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/admin/admin-employees.component').then((m) => m.AdminEmployeesComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/admin/admin-requests.component').then((m) => m.AdminRequestsComponent),
      },
    ],
  },
  {
    path: 'employee',
    loadComponent: () =>
      import('./features/employee/employee-layout.component').then((m) => m.EmployeeLayoutComponent),
    canActivate: [authGuard, employeeGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/employee/employee-dashboard.component').then((m) => m.EmployeeDashboardComponent),
      },
      {
        path: 'my-equipment',
        loadComponent: () =>
          import('./features/employee/employee-my-equipment.component').then((m) => m.EmployeeMyEquipmentComponent),
      },
      {
        path: 'request',
        loadComponent: () =>
          import('./features/employee/employee-request.component').then((m) => m.EmployeeRequestComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
