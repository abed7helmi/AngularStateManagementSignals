import { computed, inject, Injectable, signal } from '@angular/core';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../models/equipment.model';
import { EquipmentApiService } from '../services/equipment-api.service';
import { NotificationStore } from './notification.store';

@Injectable({ providedIn: 'root' })
export class EquipmentStore {
  private readonly api = inject(EquipmentApiService);
  private readonly notif = inject(NotificationStore);
  private readonly _items = signal<Equipment[]>([]);

  readonly items = this._items.asReadonly();

  readonly available = computed(() => this._items().filter((e) => e.status === 'available'));
  readonly assigned = computed(() => this._items().filter((e) => e.status === 'assigned'));
  readonly maintenance = computed(() => this._items().filter((e) => e.status === 'maintenance'));
  readonly retired = computed(() => this._items().filter((e) => e.status === 'retired'));

  readonly totalCount = computed(() => this._items().length);
  readonly availableCount = computed(() => this.available().length);
  readonly assignedCount = computed(() => this.assigned().length);
  readonly maintenanceCount = computed(() => this.maintenance().length);

  readonly countByCategory = computed(() => {
    const map: Partial<Record<EquipmentCategory, number>> = {};
    for (const item of this._items()) {
      map[item.category] = (map[item.category] ?? 0) + 1;
    }
    return map;
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.api.getAll().subscribe((data) => this._items.set(data));
  }

  getByEmployee(employeeId: string): Equipment[] {
    return this._items().filter((e) => e.assignedTo === employeeId);
  }

  getById(id: string): Equipment | undefined {
    return this._items().find((e) => e.id === id);
  }

  add(equipment: Omit<Equipment, 'id'>): void {
    const tempId = `temp_${Date.now()}`;
    this._items.update((items) => [...items, { ...equipment, id: tempId } as Equipment]);

    this.api.create(equipment).subscribe({
      next: (real) =>
        this._items.update((items) => items.map((i) => (i.id === tempId ? real : i))),
      error: () => {
        this._items.update((items) => items.filter((i) => i.id !== tempId));
        this.notif.error("Erreur lors de l'ajout de l'équipement");
      },
    });
  }

  update(id: string, changes: Partial<Equipment>): void {
    const old = this._items().find((i) => i.id === id);
    this._items.update((items) => items.map((i) => (i.id === id ? { ...i, ...changes } : i)));

    this.api.update(id, changes).subscribe({
      error: () => {
        if (old) this._items.update((items) => items.map((i) => (i.id === id ? old : i)));
        this.notif.error("Erreur lors de la mise à jour de l'équipement");
      },
    });
  }

  remove(id: string): void {
    const old = this._items().find((i) => i.id === id);
    this._items.update((items) => items.filter((i) => i.id !== id));

    this.api.delete(id).subscribe({
      error: () => {
        if (old) this._items.update((items) => [...items, old]);
        this.notif.error("Erreur lors de la suppression de l'équipement");
      },
    });
  }

  assignTo(equipmentId: string, employeeId: string): void {
    const old = this._items().find((i) => i.id === equipmentId);
    this._items.update((items) =>
      items.map((i) =>
        i.id === equipmentId
          ? { ...i, status: 'assigned' as EquipmentStatus, assignedTo: employeeId }
          : i
      )
    );

    this.api.assign(equipmentId, employeeId).subscribe({
      error: () => {
        if (old) this._items.update((items) => items.map((i) => (i.id === equipmentId ? old : i)));
        this.notif.error("Erreur lors de l'assignation");
      },
    });
  }

  unassign(equipmentId: string): void {
    const old = this._items().find((i) => i.id === equipmentId);
    this._items.update((items) =>
      items.map((i) =>
        i.id === equipmentId
          ? { ...i, status: 'available' as EquipmentStatus, assignedTo: undefined }
          : i
      )
    );

    this.api.unassign(equipmentId).subscribe({
      error: () => {
        if (old) this._items.update((items) => items.map((i) => (i.id === equipmentId ? old : i)));
        this.notif.error('Erreur lors de la désassignation');
      },
    });
  }

  setStatus(equipmentId: string, status: EquipmentStatus): void {
    const old = this._items().find((i) => i.id === equipmentId);
    this._items.update((items) =>
      items.map((i) => (i.id === equipmentId ? { ...i, status } : i))
    );

    this.api.setStatus(equipmentId, status).subscribe({
      error: () => {
        if (old) this._items.update((items) => items.map((i) => (i.id === equipmentId ? old : i)));
        this.notif.error('Erreur lors du changement de statut');
      },
    });
  }
}
