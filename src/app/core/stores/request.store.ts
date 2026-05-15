import { computed, inject, Injectable, signal } from '@angular/core';
import { EquipmentRequest, RequestStatus } from '../models/request.model';
import { EquipmentCategory } from '../models/equipment.model';
import { RequestApiService } from '../services/request-api.service';
import { EquipmentStore } from './equipment.store';
import { NotificationStore } from './notification.store';

@Injectable({ providedIn: 'root' })
export class RequestStore {
  private readonly api = inject(RequestApiService);
  private readonly equipmentStore = inject(EquipmentStore);
  private readonly notif = inject(NotificationStore);
  private readonly _requests = signal<EquipmentRequest[]>([]);

  readonly requests = this._requests.asReadonly();

  readonly pending = computed(() => this._requests().filter((r) => r.status === 'pending'));
  readonly approved = computed(() => this._requests().filter((r) => r.status === 'approved'));
  readonly rejected = computed(() => this._requests().filter((r) => r.status === 'rejected'));
  readonly pendingCount = computed(() => this.pending().length);

  constructor() {
    this.api.getAll().subscribe((data) => this._requests.set(data));
  }

  getByEmployee(employeeId: string): EquipmentRequest[] {
    return this._requests().filter((r) => r.employeeId === employeeId);
  }

  getPendingCount(): number {
    return this.pending().length;
  }

  submit(
    employeeId: string,
    payload: { category: EquipmentCategory; description: string; justification: string }
  ): void {
    const tempId = `temp_${Date.now()}`;
    const optimistic: EquipmentRequest = {
      id: tempId,
      employeeId,
      ...payload,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };
    this._requests.update((list) => [optimistic, ...list]);

    this.api.submit({ employeeId, ...payload }).subscribe({
      next: (real) =>
        this._requests.update((list) => list.map((r) => (r.id === tempId ? real : r))),
      error: () => {
        this._requests.update((list) => list.filter((r) => r.id !== tempId));
        this.notif.error('Erreur lors de la soumission de la demande');
      },
    });
  }

  approve(requestId: string, equipmentId: string, adminNote?: string): void {
    const old = this._requests().find((r) => r.id === requestId);
    if (!old) return;

    this._requests.update((list) =>
      list.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as RequestStatus,
              responseDate: new Date().toISOString().split('T')[0],
              adminNote: adminNote ?? 'Approuvé',
              assignedEquipmentId: equipmentId,
            }
          : r
      )
    );

    this.api.approve(requestId, { equipmentId, adminNote }).subscribe({
      next: () => this.equipmentStore.reload(),
      error: () => {
        this._requests.update((list) => list.map((r) => (r.id === requestId ? old : r)));
        this.notif.error("Erreur lors de l'approbation");
      },
    });
  }

  reject(requestId: string, adminNote: string): void {
    const old = this._requests().find((r) => r.id === requestId);

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

    this.api.reject(requestId, adminNote).subscribe({
      error: () => {
        if (old) this._requests.update((list) => list.map((r) => (r.id === requestId ? old : r)));
        this.notif.error('Erreur lors du refus');
      },
    });
  }

  cancel(requestId: string): void {
    const old = this._requests().find((r) => r.id === requestId);
    this._requests.update((list) =>
      list.filter((r) => !(r.id === requestId && r.status === 'pending'))
    );

    this.api.cancel(requestId).subscribe({
      error: () => {
        if (old) this._requests.update((list) => [old, ...list]);
        this.notif.error("Erreur lors de l'annulation");
      },
    });
  }
}
