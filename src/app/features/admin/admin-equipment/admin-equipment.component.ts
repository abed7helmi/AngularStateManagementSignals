import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { UserStore } from '../../../core/stores/user.store';
import { NotificationStore } from '../../../core/stores/notification.store';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { Equipment, EquipmentCategory, EquipmentStatus, CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

type FilterStatus = EquipmentStatus | 'all';

@Component({
  selector: 'app-admin-equipment',
  imports: [FormsModule, BadgeComponent],
  templateUrl: './admin-equipment.component.html',
  styleUrl: './admin-equipment.component.css',
})
export class AdminEquipmentComponent {
  readonly eq = inject(EquipmentStore);
  readonly notif = inject(NotificationStore);
  private readonly userStore = inject(UserStore);

  readonly employees = this.userStore.employees;

  readonly searchTerm = signal('');
  readonly filterStatus = signal<FilterStatus>('all');
  readonly showFormModal = signal(false);
  readonly showAssignModal = signal(false);
  readonly editingItem = signal<Equipment | null>(null);
  readonly assignTarget = signal<Equipment | null>(null);
  readonly assignEmployeeId = signal('');
  readonly form = signal<Partial<Equipment>>(this.emptyForm());

  readonly statusFilters = [
    { value: 'all' as FilterStatus,         label: 'Tous',        count: this.eq.totalCount },
    { value: 'available' as FilterStatus,   label: 'Disponibles', count: this.eq.availableCount },
    { value: 'assigned' as FilterStatus,    label: 'Assignés',    count: this.eq.assignedCount },
    { value: 'maintenance' as FilterStatus, label: 'Maintenance', count: this.eq.maintenanceCount },
  ];

  readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as EquipmentCategory,
    label,
  }));

  readonly filteredItems = computed(() => {
    let list = this.eq.items();
    const s = this.filterStatus();
    if (s !== 'all') list = list.filter((e) => e.status === s);
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.brand.toLowerCase().includes(term) ||
          e.serialNumber.toLowerCase().includes(term)
      );
    }
    return list;
  });

  readonly formValid = computed(() => {
    const f = this.form();
    return !!(f.name?.trim() && f.brand?.trim() && f.serialNumber?.trim() && f.purchaseDate);
  });

  updateForm(key: keyof Equipment, value: unknown): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as EquipmentCategory] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as EquipmentCategory] ?? '📦'; }
  employeeName(id: string): string { return this.userStore.getName(id); }
  statusLabel(s: EquipmentStatus): string {
    return { available: 'Disponible', assigned: 'Assigné', maintenance: 'Maintenance', retired: 'Retraité' }[s];
  }

  emptyForm(): Partial<Equipment> {
    return { name: '', brand: '', category: 'laptop', serialNumber: '', purchaseDate: '', status: 'available', notes: '' };
  }

  openAddModal(): void {
    this.editingItem.set(null);
    this.form.set(this.emptyForm());
    this.showFormModal.set(true);
  }

  openEditModal(item: Equipment): void {
    this.editingItem.set(item);
    this.form.set({ ...item });
    this.showFormModal.set(true);
  }

  openAssignModal(item: Equipment): void {
    this.assignTarget.set(item);
    this.assignEmployeeId.set('');
    this.showAssignModal.set(true);
  }

  closeModal(): void {
    this.showFormModal.set(false);
    this.showAssignModal.set(false);
    this.editingItem.set(null);
    this.assignTarget.set(null);
  }

  saveForm(): void {
    const editing = this.editingItem();
    const f = this.form();
    if (editing) {
      this.eq.update(editing.id, f);
      this.notif.success('Équipement mis à jour');
    } else {
      this.eq.add(f as Omit<Equipment, 'id'>);
      this.notif.success('Équipement ajouté');
    }
    this.closeModal();
  }

  remove(id: string): void {
    this.eq.remove(id);
    this.notif.success('Équipement supprimé');
  }

  unassign(item: Equipment): void {
    this.eq.unassign(item.id);
    this.notif.success(`${item.name} désassigné`);
  }

  confirmAssign(): void {
    const target = this.assignTarget();
    const empId = this.assignEmployeeId();
    if (!target || !empId) return;
    this.eq.assignTo(target.id, empId);
    this.notif.success(`${target.name} assigné à ${this.employeeName(empId)}`);
    this.closeModal();
  }
}
