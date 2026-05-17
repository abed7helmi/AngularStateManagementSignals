import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', req);
  }

  /** Valide le token stocké et retourne les infos fraîches de l'utilisateur. */
  me(): Observable<Omit<AuthResponse, 'token'>> {
    return this.http.get<Omit<AuthResponse, 'token'>>('/api/auth/me');
  }
}
