import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.BASE);
  }
}
