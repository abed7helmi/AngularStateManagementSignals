import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipmentRequest } from '../models/request.model';
import { EquipmentCategory } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class RequestApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/requests';

  getAll(): Observable<EquipmentRequest[]> {
    return this.http.get<EquipmentRequest[]>(this.BASE);
  }

  submit(payload: {
    employeeId: string;
    category: EquipmentCategory;
    description: string;
    justification: string;
  }): Observable<EquipmentRequest> {
    return this.http.post<EquipmentRequest>(this.BASE, payload);
  }

  approve(id: string, payload: { equipmentId: string; adminNote?: string }): Observable<EquipmentRequest> {
    return this.http.put<EquipmentRequest>(`${this.BASE}/${id}/approve`, payload);
  }

  reject(id: string, adminNote: string): Observable<EquipmentRequest> {
    return this.http.put<EquipmentRequest>(`${this.BASE}/${id}/reject`, { adminNote });
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
