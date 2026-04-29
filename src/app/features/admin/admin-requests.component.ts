import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestStore } from '../../core/stores/request.store';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { NotificationStore } from '../../core/stores/notification.store';
import { BadgeComponent } from '../../shared/badge.component';
import { EquipmentRequest, RequestStatus } from '../../core/models/request.model';
import { MOCK_USERS } from '../../core/mock-data';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';

type FilterTab = RequestStatus | 'all';

@Component({
  selector: 'app-admin-requests',
  imports: [FormsModule, BadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des demandes</h1>
          <p class="page-sub">{{ req.pendingCount() }} demande(s) en attente de validation</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        @for (tab of tabs; track tab.value) {
          <button class="tab-btn" [class.active]="filterTab() === tab.value" (click)="filterTab.set(tab.value)">
            {{ tab.label }}
            <span class="tab-count" [class.tab-count-danger]="tab.value === 'pending'">{{ tab.count() }}</span>
          </button>
        }
      </div>

      <!-- List -->
      <div class="requests-list">
        @for (r of filteredRequests(); track r.id) {
          <div class="request-card" [class.card-pending]="r.status === 'pending'">
            <div class="req-top">
              <div class="req-left">
                <span class="req-cat-icon">{{ catIcon(r.category) }}</span>
                <div>
                  <div class="req-cat">{{ catLabel(r.category) }}</div>
                  <div class="req-emp">
                    <span class="emp-avatar-xs">{{ employeeName(r.employeeId)[0] }}</span>
                    {{ employeeName(r.employeeId) }} · {{ employeeDept(r.employeeId) }}
                  </div>
                </div>
              </div>
              <div class="req-right">
                <app-badge [variant]="r.status" [label]="statusLabel(r.status)" />
                <span class="req-date">{{ r.requestDate }}</span>
              </div>
            </div>

            <div class="req-body">
              <div class="req-field">
                <span class="field-label">Description</span>
                <span>{{ r.description }}</span>
              </div>
              <div class="req-field">
                <span class="field-label">Justification</span>
                <span class="text-muted">{{ r.justification }}</span>
              </div>
              @if (r.adminNote) {
                <div class="req-field">
                  <span class="field-label">Note admin</span>
                  <span class="admin-note">{{ r.adminNote }}</span>
                </div>
              }
            </div>

            @if (r.status === 'pending') {
              <div class="req-actions">
                <button class="btn btn-success" (click)="openApproveModal(r)">✅ Approuver</button>
                <button class="btn btn-danger"  (click)="openRejectModal(r)">❌ Refuser</button>
              </div>
            }
          </div>
        } @empty {
          <div class="empty-state-card">
            <p>Aucune demande dans cette catégorie</p>
          </div>
        }
      </div>
    </div>

    <!-- Approve Modal -->
    @if (showApproveModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Approuver la demande</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="approve-info">
              <p><strong>Employé :</strong> {{ employeeName(targetRequest()?.employeeId ?? '') }}</p>
              <p><strong>Catégorie :</strong> {{ catIcon(targetRequest()?.category ?? '') }} {{ catLabel(targetRequest()?.category ?? '') }}</p>
              <p><strong>Description :</strong> {{ targetRequest()?.description }}</p>
            </div>
            <div class="form-group">
              <label>Assigner un équipement disponible *</label>
              <select class="form-control" [(ngModel)]="approveEquipmentId">
                <option value="">-- Sélectionner --</option>
                @for (item of compatibleEquipments(); track item.id) {
                  <option [value]="item.id">{{ item.name }} ({{ item.serialNumber }})</option>
                }
              </select>
              @if (compatibleEquipments().length === 0) {
                <p class="no-equipment-warn">⚠️ Aucun équipement disponible dans cette catégorie</p>
              }
            </div>
            <div class="form-group">
              <label>Note (optionnel)</label>
              <textarea class="form-control" [(ngModel)]="approveNote" rows="2" placeholder="Note pour l'employé..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Annuler</button>
            <button class="btn btn-success" (click)="confirmApprove()" [disabled]="!approveEquipmentId">Confirmer l'approbation</button>
          </div>
        </div>
      </div>
    }

    <!-- Reject Modal -->
    @if (showRejectModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Refuser la demande</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Motif du refus *</label>
              <textarea class="form-control" [(ngModel)]="rejectNote" rows="3" placeholder="Expliquez le motif du refus..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Annuler</button>
            <button class="btn btn-danger" (click)="confirmReject()" [disabled]="!rejectNote.trim()">Confirmer le refus</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 900px; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 0; }
    .tab-btn { padding: 10px 18px; border: none; background: none; font-size: 0.875rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
    .tab-btn:hover { color: #6366f1; }
    .tab-btn.active { color: #6366f1; border-bottom-color: #6366f1; }
    .tab-count { background: #f1f5f9; color: #64748b; border-radius: 999px; padding: 1px 8px; font-size: 0.75rem; }
    .tab-count-danger { background: #fee2e2; color: #991b1b; }

    .requests-list { display: flex; flex-direction: column; gap: 14px; }

    .request-card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
      overflow: hidden;
      border: 2px solid transparent;
      transition: border-color 0.15s;
    }
    .request-card.card-pending { border-color: #fbbf24; }

    .req-top { padding: 16px 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 1px solid #f8fafc; }
    .req-left { display: flex; align-items: flex-start; gap: 12px; }
    .req-cat-icon { font-size: 2rem; line-height: 1; }
    .req-cat { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .req-emp { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: #64748b; }
    .emp-avatar-xs { width: 20px; height: 20px; border-radius: 50%; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
    .req-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
    .req-date { font-size: 0.75rem; color: #94a3b8; }

    .req-body { padding: 14px 20px; display: flex; flex-direction: column; gap: 8px; }
    .req-field { display: flex; gap: 8px; font-size: 0.875rem; }
    .field-label { font-weight: 600; color: #374151; min-width: 100px; flex-shrink: 0; }
    .text-muted { color: #64748b; }
    .admin-note { color: #6366f1; font-style: italic; }

    .req-actions { padding: 12px 20px; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; background: #f8fafc; }

    .empty-state-card { background: #fff; border-radius: 14px; padding: 48px; text-align: center; color: #94a3b8; font-size: 0.9rem; }

    .btn { padding: 9px 18px; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s ease; }
    .btn-success { background: #16a34a; color: #fff; }
    .btn-success:hover:not(:disabled) { opacity: 0.85; }
    .btn-success:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-danger  { background: #dc2626; color: #fff; }
    .btn-danger:hover:not(:disabled) { opacity: 0.85; }
    .btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost   { background: #f1f5f9; color: #475569; }
    .btn-ghost:hover { background: #e2e8f0; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
    .modal-sm { max-width: 400px; }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; padding: 0; }
    .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; }

    .approve-info { background: #f8fafc; border-radius: 10px; padding: 14px; font-size: 0.875rem; display: flex; flex-direction: column; gap: 6px; }
    .approve-info p { margin: 0; color: #334155; }

    .form-group { display: flex; flex-direction: column; gap: 5px; }
    label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-control { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
    .form-control:focus { border-color: #6366f1; }
    textarea.form-control { resize: vertical; }
    .no-equipment-warn { font-size: 0.82rem; color: #92400e; background: #fef3c7; padding: 8px 12px; border-radius: 8px; margin: 4px 0 0; }
  `],
})
export class AdminRequestsComponent {
  readonly req = inject(RequestStore);
  readonly eq = inject(EquipmentStore);
  readonly notif = inject(NotificationStore);

  readonly filterTab = signal<FilterTab>('pending');

  readonly showApproveModal = signal(false);
  readonly showRejectModal = signal(false);
  readonly targetRequest = signal<EquipmentRequest | null>(null);

  approveEquipmentId = '';
  approveNote = '';
  rejectNote = '';

  readonly tabs = [
    { value: 'all' as FilterTab,      label: 'Toutes',           count: computed(() => this.req.requests().length) },
    { value: 'pending' as FilterTab,  label: 'En attente',       count: this.req.pendingCount },
    { value: 'approved' as FilterTab, label: 'Approuvées',       count: computed(() => this.req.approved().length) },
    { value: 'rejected' as FilterTab, label: 'Refusées',         count: computed(() => this.req.rejected().length) },
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
  employeeName(id: string): string { return MOCK_USERS.find((u) => u.id === id)?.name ?? '—'; }
  employeeDept(id: string): string { return MOCK_USERS.find((u) => u.id === id)?.department ?? '—'; }
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
