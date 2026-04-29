import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  if (auth.isEmployee()) return router.createUrlTree(['/employee/dashboard']);
  return router.createUrlTree(['/login']);
};

export const employeeGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isEmployee()) return true;
  if (auth.isAdmin()) return router.createUrlTree(['/admin/dashboard']);
  return router.createUrlTree(['/login']);
};
