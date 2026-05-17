import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { RequestStore } from '../../../core/stores/request.store';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-employee-dashboard',
  imports: [StatCardComponent, BadgeComponent, RouterLink],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css',
})
export class EmployeeDashboardComponent {
  readonly auth = inject(AuthStore);
  private readonly eq = inject(EquipmentStore);
  private readonly req = inject(RequestStore);

  readonly myEquipment = computed(() => {
    const id = this.auth.currentUser()?.id;
    if (!id) return [];
    return this.eq.getByEmployee(id);
  });

  readonly myRequests = computed(() => {
    const id = this.auth.currentUser()?.id;
    if (!id) return [];
    return this.req.getByEmployee(id);
  });

  readonly myPendingRequests = computed(() => this.myRequests().filter((r) => r.status === 'pending'));
  readonly myApprovedRequests = computed(() => this.myRequests().filter((r) => r.status === 'approved'));
  readonly myRejectedRequests = computed(() => this.myRequests().filter((r) => r.status === 'rejected'));
  readonly firstName = computed(() => this.auth.currentUser()?.name?.split(' ')[0] ?? '');

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📦'; }
  statusLabel(s: string): string {
    return { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[s] ?? s;
  }
}
