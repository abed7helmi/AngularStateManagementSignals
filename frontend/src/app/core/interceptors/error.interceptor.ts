import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepte les 401 : efface le token et redirige vers /login.
 * Exclut les appels à /api/auth/ pour ne pas boucler sur le login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/api/auth/')) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
