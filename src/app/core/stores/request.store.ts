import { computed, Injectable, signal } from '@angular/core';
import { EquipmentRequest, RequestStatus } from '../models/request.model';
import { EquipmentCategory } from '../models/equipment.model';
import { MOCK_REQUESTS } from '../mock-data';
import { EquipmentStore } from './equipment.store';

@Injectable({ providedIn: 'root' })
export class RequestStore {
  private readonly _requests = signal<EquipmentRequest[]>(structuredClone(MOCK_REQUESTS));

  // ---- Public readonly state ----
  readonly requests = this._requests.asReadonly();

  // ---- Computed ----
  readonly pending = computed(() =>
    this._requests().filter((r) => r.status === 'pending')
  );
  readonly approved = computed(() =>
    this._requests().filter((r) => r.status === 'approved')
  );
  readonly rejected = computed(() =>
    this._requests().filter((r) => r.status === 'rejected')
  );

  readonly pendingCount = computed(() => this.pending().length);

  constructor(private readonly equipmentStore: EquipmentStore) {}

  // ---- Queries ----
  getByEmployee(employeeId: string): EquipmentRequest[] {
    return this._requests().filter((r) => r.employeeId === employeeId);
  }

  getPendingCount(): number {
    return this.pending().length;
  }

  // ---- Mutations ----
  submit(
    employeeId: string,
    payload: { category: EquipmentCategory; description: string; justification: string }
  ): void {
    const request: EquipmentRequest = {
      id: `r${Date.now()}`,
      employeeId,
      category: payload.category,
      description: payload.description,
      justification: payload.justification,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };
    this._requests.update((list) => [request, ...list]);
  }

  approve(requestId: string, equipmentId: string, adminNote?: string): void {
    this._requests.update((list) =>
      list.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status: 'approved' as RequestStatus,
          responseDate: new Date().toISOString().split('T')[0],
          adminNote: adminNote ?? 'Approuvé',
          assignedEquipmentId: equipmentId,
        };
      })
    );

    // Find the request to get the employee id, then assign equipment
    const request = this._requests().find((r) => r.id === requestId);
    if (request) {
      this.equipmentStore.assignTo(equipmentId, request.employeeId);
    }
  }

  reject(requestId: string, adminNote: string): void {
    this._requests.update((list) =>
      list.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected' as RequestStatus,
              responseDate: new Date().toISOString().split('T')[0],
              adminNote,
            }
          : r
      )
    );
  }

  cancel(requestId: string): void {
    this._requests.update((list) =>
      list.filter((r) => !(r.id === requestId && r.status === 'pending'))
    );
  }
}
