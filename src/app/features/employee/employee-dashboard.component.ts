import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/stores/auth.store';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { RequestStore } from '../../core/stores/request.store';
import { StatCardComponent } from '../../shared/stat-card.component';
import { BadgeComponent } from '../../shared/badge.component';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';

@Component({
  selector: 'app-employee-dashboard',
  imports: [StatCardComponent, BadgeComponent, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Bonjour, {{ firstName() }} 👋</h1>
          <p class="page-sub">{{ auth.currentUser()?.position }} · {{ auth.currentUser()?.department }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <app-stat-card icon="💻" [value]="myEquipment().length"          label="Mes équipements"        color="#6366f1" />
        <app-stat-card icon="⏳" [value]="myPendingRequests().length"    label="Demandes en attente"    color="#f59e0b" />
        <app-stat-card icon="✅" [value]="myApprovedRequests().length"   label="Demandes approuvées"   color="#22c55e" />
        <app-stat-card icon="❌" [value]="myRejectedRequests().length"   label="Demandes refusées"     color="#ef4444" />
      </div>

      <div class="grid-2">
        <!-- My Equipment -->
        <div class="card">
          <div class="card-header">
            <h2>Mes équipements</h2>
            <a routerLink="/employee/my-equipment" class="link-more">Voir tout →</a>
          </div>
          <div class="card-body">
            @if (myEquipment().length === 0) {
              <p class="empty-state">Aucun équipement assigné.<br>
                <a routerLink="/employee/request" class="link-action">Faire une demande →</a>
              </p>
            } @else {
              <div class="eq-list">
                @for (item of myEquipment().slice(0, 4); track item.id) {
                  <div class="eq-item">
                    <span class="eq-icon">{{ catIcon(item.category) }}</span>
                    <div class="eq-info">
                      <p class="eq-name">{{ item.name }}</p>
                      <p class="eq-serial">{{ item.brand }} · {{ item.serialNumber }}</p>
                    </div>
                    <app-badge variant="assigned" label="Assigné" />
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Recent Requests -->
        <div class="card">
          <div class="card-header">
            <h2>Mes demandes récentes</h2>
            <a routerLink="/employee/request" class="link-more">Nouvelle demande →</a>
          </div>
          <div class="card-body">
            @if (myRequests().length === 0) {
              <p class="empty-state">Aucune demande<br>
                <a routerLink="/employee/request" class="link-action">Faire ma première demande →</a>
              </p>
            } @else {
              <div class="req-list">
                @for (r of myRequests().slice(0, 4); track r.id) {
                  <div class="req-item">
                    <span class="req-cat-icon">{{ catIcon(r.category) }}</span>
                    <div class="req-info">
                      <p class="req-name">{{ catLabel(r.category) }}</p>
                      <p class="req-desc">{{ r.description }}</p>
                    </div>
                    <div class="req-meta">
                      <app-badge [variant]="r.status" [label]="statusLabel(r.status)" />
                      <span class="req-date">{{ r.requestDate }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Pending Request Alert -->
      @if (myPendingRequests().length > 0) {
        <div class="alert-banner">
          <span class="alert-icon">⏳</span>
          <div>
            <strong>{{ myPendingRequests().length }} demande(s) en attente</strong>
            <p>Vos demandes sont en cours d'examen par l'administrateur.</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 1000px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.7rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

    .card { background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; }
    .card-header { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; }
    .card-header h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .link-more { font-size: 0.82rem; color: #6366f1; text-decoration: none; font-weight: 600; }
    .link-more:hover { text-decoration: underline; }
    .card-body { padding: 16px 20px; }
    .empty-state { color: #94a3b8; text-align: center; padding: 20px; font-size: 0.875rem; line-height: 1.6; }
    .link-action { color: #6366f1; font-weight: 600; text-decoration: none; }
    .link-action:hover { text-decoration: underline; }

    .eq-list { display: flex; flex-direction: column; gap: 10px; }
    .eq-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: #f8fafc; }
    .eq-icon { font-size: 1.5rem; }
    .eq-info { flex: 1; min-width: 0; }
    .eq-name { font-weight: 600; color: #0f172a; margin: 0 0 2px; font-size: 0.875rem; }
    .eq-serial { color: #94a3b8; margin: 0; font-size: 0.75rem; font-family: monospace; }

    .req-list { display: flex; flex-direction: column; gap: 10px; }
    .req-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; background: #f8fafc; }
    .req-cat-icon { font-size: 1.3rem; }
    .req-info { flex: 1; min-width: 0; }
    .req-name { font-weight: 600; color: #0f172a; margin: 0 0 2px; font-size: 0.85rem; }
    .req-desc { color: #64748b; margin: 0; font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .req-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .req-date { font-size: 0.72rem; color: #94a3b8; }

    .alert-banner { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #fbbf24; border-radius: 12px; padding: 16px 20px; display: flex; align-items: flex-start; gap: 14px; }
    .alert-icon { font-size: 1.5rem; flex-shrink: 0; }
    .alert-banner strong { display: block; color: #92400e; font-size: 0.9rem; margin-bottom: 2px; }
    .alert-banner p { color: #78350f; font-size: 0.82rem; margin: 0; }
  `],
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
