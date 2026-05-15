import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentStatus } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class EquipmentApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/equipment';

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.BASE);
  }

  create(data: Omit<Equipment, 'id'>): Observable<Equipment> {
    return this.http.post<Equipment>(this.BASE, data);
  }

  update(id: string, data: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.BASE}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  assign(id: string, employeeId: string): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.BASE}/${id}/assign`, { employeeId });
  }

  unassign(id: string): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.BASE}/${id}/unassign`, {});
  }

  setStatus(id: string, status: EquipmentStatus): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.BASE}/${id}/status`, { status });
  }
}
