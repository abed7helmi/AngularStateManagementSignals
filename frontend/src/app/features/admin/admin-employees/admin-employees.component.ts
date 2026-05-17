import { Component, inject, signal, computed } from '@angular/core';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { RequestStore } from '../../../core/stores/request.store';
import { UserStore } from '../../../core/stores/user.store';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { User } from '../../../core/models/user.model';
import { CATEGORY_LABELS, CATEGORY_ICONS, Equipment } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-admin-employees',
  imports: [BadgeComponent],
  templateUrl: './admin-employees.component.html',
  styleUrl: './admin-employees.component.css',
})
export class AdminEmployeesComponent {
  private readonly eq = inject(EquipmentStore);
  private readonly req = inject(RequestStore);
  private readonly userStore = inject(UserStore);

  readonly employees = this.userStore.employees;
  readonly selectedEmployee = signal<User | null>(null);

  readonly employeeEquipment = computed<Equipment[]>(() => {
    const emp = this.selectedEmployee();
    if (!emp) return [];
    return this.eq.getByEmployee(emp.id);
  });

  readonly employeeRequests = computed(() => {
    const emp = this.selectedEmployee();
    if (!emp) return [];
    return this.req.getByEmployee(emp.id);
  });

  equipmentCount(id: string): number { return this.eq.getByEmployee(id).length; }
  pendingCount(id: string): number { return this.req.getByEmployee(id).filter((r) => r.status === 'pending').length; }

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📦'; }
  statusLabel(s: string): string {
    return { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[s] ?? s;
  }

  selectEmployee(emp: User): void {
    this.selectedEmployee.set(this.selectedEmployee()?.id === emp.id ? null : emp);
  }
}
