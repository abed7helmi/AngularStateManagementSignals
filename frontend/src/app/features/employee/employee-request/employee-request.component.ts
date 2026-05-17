import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/stores/auth.store';
import { RequestStore } from '../../../core/stores/request.store';
import { NotificationStore } from '../../../core/stores/notification.store';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { EquipmentCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-employee-request',
  imports: [FormsModule, BadgeComponent],
  templateUrl: './employee-request.component.html',
  styleUrl: './employee-request.component.css',
})
export class EmployeeRequestComponent {
  private readonly auth = inject(AuthStore);
  private readonly req = inject(RequestStore);
  private readonly notif = inject(NotificationStore);

  readonly submitted = signal(false);

  readonly formCategory = signal<EquipmentCategory>('laptop');
  readonly formDescription = signal('');
  readonly formJustification = signal('');

  readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as EquipmentCategory,
    label,
    icon: CATEGORY_ICONS[value as EquipmentCategory],
  }));

  readonly myRequests = computed(() => {
    const id = this.auth.currentUser()?.id;
    if (!id) return [];
    return this.req.getByEmployee(id);
  });

  readonly formValid = computed(
    () =>
      !!this.formCategory() &&
      this.formDescription().trim().length >= 5 &&
      this.formJustification().trim().length >= 10
  );

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as EquipmentCategory] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as EquipmentCategory] ?? '📦'; }
  statusLabel(s: string): string {
    return { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[s] ?? s;
  }

  submit(): void {
    debugger;
    const userId = this.auth.currentUser()?.id;
    if (!userId || !this.formValid()) return;
    this.req.submit(userId, {
      category: this.formCategory(),
      description: this.formDescription().trim(),
      justification: this.formJustification().trim(),
    });
    this.submitted.set(true);
    this.notif.success('Demande soumise avec succès !');
  }

  resetForm(): void {
    this.formCategory.set('laptop');
    this.formDescription.set('');
    this.formJustification.set('');
    this.submitted.set(false);
  }

  cancel(requestId: string): void {
    this.req.cancel(requestId);
    this.notif.success('Demande annulée');
  }
}
