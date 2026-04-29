import { computed, Injectable, signal } from '@angular/core';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../models/equipment.model';
import { MOCK_EQUIPMENTS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class EquipmentStore {
  private readonly _items = signal<Equipment[]>(structuredClone(MOCK_EQUIPMENTS));

  // ---- Public readonly state ----
  readonly items = this._items.asReadonly();

  // ---- Computed (derived state — no duplication) ----
  readonly available = computed(() =>
    this._items().filter((e) => e.status === 'available')
  );
  readonly assigned = computed(() =>
    this._items().filter((e) => e.status === 'assigned')
  );
  readonly maintenance = computed(() =>
    this._items().filter((e) => e.status === 'maintenance')
  );
  readonly retired = computed(() =>
    this._items().filter((e) => e.status === 'retired')
  );

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

  // ---- Queries ----
  getByEmployee(employeeId: string): Equipment[] {
    return this._items().filter((e) => e.assignedTo === employeeId);
  }

  getById(id: string): Equipment | undefined {
    return this._items().find((e) => e.id === id);
  }

  // ---- Mutations ----
  add(equipment: Omit<Equipment, 'id'>): Equipment {
    const newItem: Equipment = {
      ...equipment,
      id: `e${Date.now()}`,
    };
    this._items.update((items) => [...items, newItem]);
    return newItem;
  }

  update(id: string, changes: Partial<Equipment>): void {
    this._items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  }

  remove(id: string): void {
    this._items.update((items) => items.filter((item) => item.id !== id));
  }

  assignTo(equipmentId: string, employeeId: string): void {
    this._items.update((items) =>
      items.map((item) =>
        item.id === equipmentId
          ? { ...item, status: 'assigned' as EquipmentStatus, assignedTo: employeeId }
          : item
      )
    );
  }

  unassign(equipmentId: string): void {
    this._items.update((items) =>
      items.map((item) =>
        item.id === equipmentId
          ? { ...item, status: 'available' as EquipmentStatus, assignedTo: undefined }
          : item
      )
    );
  }

  setStatus(equipmentId: string, status: EquipmentStatus): void {
    this._items.update((items) =>
      items.map((item) =>
        item.id === equipmentId ? { ...item, status } : item
      )
    );
  }
}
