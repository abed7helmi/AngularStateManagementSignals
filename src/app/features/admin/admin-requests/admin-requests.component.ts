import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestStore } from '../../../core/stores/request.store';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { UserStore } from '../../../core/stores/user.store';
import { NotificationStore } from '../../../core/stores/notification.store';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { EquipmentRequest, RequestStatus } from '../../../core/models/request.model';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

type FilterTab = RequestStatus | 'all';

@Component({
  selector: 'app-admin-requests',
  imports: [FormsModule, BadgeComponent],
  templateUrl: './admin-requests.component.html',
  styleUrl: './admin-requests.component.css',
})
export class AdminRequestsComponent {
  readonly req = inject(RequestStore);
  readonly eq = inject(EquipmentStore);
  readonly notif = inject(NotificationStore);
  private readonly userStore = inject(UserStore);

  readonly filterTab = signal<FilterTab>('pending');

  readonly showApproveModal = signal(false);
  readonly showRejectModal = signal(false);
  readonly targetRequest = signal<EquipmentRequest | null>(null);

  approveEquipmentId = '';
  approveNote = '';
  rejectNote = '';

  readonly tabs = [
    { value: 'all' as FilterTab,      label: 'Toutes',     count: computed(() => this.req.requests().length) },
    { value: 'pending' as FilterTab,  label: 'En attente', count: this.req.pendingCount },
    { value: 'approved' as FilterTab, label: 'Approuvées', count: computed(() => this.req.approved().length) },
    { value: 'rejected' as FilterTab, label: 'Refusées',   count: computed(() => this.req.rejected().length) },
  ];

  readonly filteredRequests = computed(() => {
    const tab = this.filterTab();
    const list = this.req.requests();
    return tab === 'all' ? list : list.filter((r) => r.status === tab);
  });

  readonly compatibleEquipments = computed(() => {
    const target = this.targetRequest();
    if (!target) return [];
    return this.eq.available().filter((e) => e.category === target.category);
  });

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📦'; }
  employeeName(id: string): string { return this.userStore.getName(id); }
  employeeDept(id: string): string { return this.userStore.getDepartment(id); }
  statusLabel(s: string): string {
    return { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[s] ?? s;
  }

  openApproveModal(r: EquipmentRequest): void {
    this.targetRequest.set(r);
    this.approveEquipmentId = '';
    this.approveNote = '';
    this.showApproveModal.set(true);
  }

  openRejectModal(r: EquipmentRequest): void {
    this.targetRequest.set(r);
    this.rejectNote = '';
    this.showRejectModal.set(true);
  }

  closeModal(): void {
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);
    this.targetRequest.set(null);
  }

  confirmApprove(): void {
    const r = this.targetRequest();
    if (!r || !this.approveEquipmentId) return;
    const eqName = this.eq.getById(this.approveEquipmentId)?.name ?? '';
    this.req.approve(r.id, this.approveEquipmentId, this.approveNote || `Approuvé — ${eqName} assigné`);
    this.notif.success(`Demande de ${this.employeeName(r.employeeId)} approuvée`);
    this.closeModal();
  }

  confirmReject(): void {
    const r = this.targetRequest();
    if (!r || !this.rejectNote.trim()) return;
    this.req.reject(r.id, this.rejectNote);
    this.notif.success(`Demande refusée`);
    this.closeModal();
  }
}
