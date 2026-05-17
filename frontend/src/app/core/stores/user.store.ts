import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly api = inject(UserApiService);
  private readonly _users = signal<User[]>([]);

  readonly users = this._users.asReadonly();
  readonly employees = computed(() => this._users().filter((u) => u.role === 'employee'));

  constructor() {
    this.api.getAll().subscribe((users) => this._users.set(users));
  }

  getName(id: string): string {
    return this._users().find((u) => u.id === id)?.name ?? '—';
  }

  getDepartment(id: string): string {
    return this._users().find((u) => u.id === id)?.department ?? '—';
  }
}
