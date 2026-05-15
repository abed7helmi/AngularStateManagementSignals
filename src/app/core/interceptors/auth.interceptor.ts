import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Injecte le Bearer token JWT dans toutes les requêtes sortantes.
 * Intercepteur fonctionnel Angular 17+ — pas de classe, pas de module.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
