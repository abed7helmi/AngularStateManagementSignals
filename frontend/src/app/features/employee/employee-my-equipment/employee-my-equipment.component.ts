import { Component, inject, computed } from '@angular/core';
import { AuthStore } from '../../../core/stores/auth.store';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-employee-my-equipment',
  imports: [BadgeComponent],
  templateUrl: './employee-my-equipment.component.html',
  styleUrl: './employee-my-equipment.component.css',
})
export class EmployeeMyEquipmentComponent {
  private readonly auth = inject(AuthStore);
  private readonly eq = inject(EquipmentStore);

  readonly myEquipment = computed(() => {
    const id = this.auth.currentUser()?.id;
    if (!id) return [];
    return this.eq.getByEmployee(id);
  });

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📦'; }
}
