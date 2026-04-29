import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { RequestStore } from '../../core/stores/request.store';
import { AuthStore } from '../../core/stores/auth.store';
import { StatCardComponent } from '../../shared/stat-card.component';
import { BadgeComponent } from '../../shared/badge.component';
import { MOCK_USERS } from '../../core/mock-data';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [StatCardComponent, BadgeComponent, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="page-sub">Bonjour, {{ auth.currentUser()?.name }} — Vue d'ensemble du parc informatique</p>
        </div>
        <span class="date-badge">{{ today }}</span>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <app-stat-card icon="📦" [value]="eq.totalCount()"      label="Total équipements"  color="#6366f1" />
        <app-stat-card icon="✅" [value]="eq.availableCount()"  label="Disponibles"        color="#22c55e" />
        <app-stat-card icon="📌" [value]="eq.assignedCount()"   label="Assignés"           color="#3b82f6" />
        <app-stat-card icon="🔧" [value]="eq.maintenanceCount()" label="En maintenance"    color="#f59e0b" />
        <app-stat-card icon="📋" [value]="req.pendingCount()"   label="Demandes en attente" color="#ef4444" />
        <app-stat-card icon="👥" [value]="employeeCount()"      label="Employés"           color="#8b5cf6" />
      </div>

      <div class="grid-2">
        <!-- Pending requests -->
        <div class="card">
          <div class="card-header">
            <h2>Demandes en attente</h2>
            <a routerLink="/admin/requests" class="link-more">Voir tout →</a>
          </div>
          <div class="card-body">
            @if (req.pending().length === 0) {
              <p class="empty-state">Aucune demande en attente</p>
            } @else {
              <div class="request-list">
                @for (r of req.pending().slice(0, 4); track r.id) {
                  <div class="request-item">
                    <div class="req-info">
                      <span class="req-icon">{{ categoryIcon(r.category) }}</span>
                      <div>
                        <p class="req-name">{{ employeeName(r.employeeId) }}</p>
                        <p class="req-desc">{{ categoryLabel(r.category) }} — {{ r.description }}</p>
                      </div>
                    </div>
                    <div class="req-meta">
                      <app-badge variant="pending" label="En attente" />
                      <span class="req-date">{{ r.requestDate }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Equipment by category -->
        <div class="card">
          <div class="card-header">
            <h2>Parc par catégorie</h2>
            <a routerLink="/admin/equipment" class="link-more">Gérer →</a>
          </div>
          <div class="card-body">
            <div class="category-list">
              @for (entry of categoryEntries(); track entry.cat) {
                <div class="category-row">
                  <span class="cat-icon">{{ categoryIcon(entry.cat) }}</span>
                  <span class="cat-name">{{ categoryLabel(entry.cat) }}</span>
                  <div class="cat-bar-wrap">
                    <div class="cat-bar" [style.width.%]="(entry.count / eq.totalCount()) * 100"></div>
                  </div>
                  <span class="cat-count">{{ entry.count }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent assigned -->
      <div class="card">
        <div class="card-header">
          <h2>Équipements assignés récemment</h2>
          <a routerLink="/admin/employees" class="link-more">Voir employés →</a>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>Catégorie</th>
                <th>N° Série</th>
                <th>Assigné à</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (item of eq.assigned().slice(0, 6); track item.id) {
                <tr>
                  <td><strong>{{ item.name }}</strong></td>
                  <td>{{ categoryIcon(item.category) }} {{ categoryLabel(item.category) }}</td>
                  <td class="mono">{{ item.serialNumber }}</td>
                  <td>{{ employeeName(item.assignedTo!) }}</td>
                  <td><app-badge variant="assigned" label="Assigné" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 1200px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }
    .date-badge { background: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

    .card { background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; margin-bottom: 20px; }
    .card-header { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; }
    .card-header h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .link-more { font-size: 0.82rem; color: #6366f1; text-decoration: none; font-weight: 600; }
    .link-more:hover { text-decoration: underline; }
    .card-body { padding: 16px 20px; }

    .empty-state { color: #94a3b8; text-align: center; padding: 20px; font-size: 0.875rem; }

    .request-list { display: flex; flex-direction: column; gap: 10px; }
    .request-item { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-radius: 8px; background: #f8fafc; gap: 12px; }
    .req-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .req-icon { font-size: 1.3rem; }
    .req-name { font-weight: 600; color: #0f172a; font-size: 0.85rem; margin: 0 0 2px; }
    .req-desc { color: #64748b; font-size: 0.78rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
    .req-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .req-date { font-size: 0.72rem; color: #94a3b8; }

    .category-list { display: flex; flex-direction: column; gap: 10px; }
    .category-row { display: flex; align-items: center; gap: 8px; }
    .cat-icon { font-size: 1rem; width: 24px; text-align: center; }
    .cat-name { font-size: 0.82rem; color: #334155; width: 80px; font-weight: 500; }
    .cat-bar-wrap { flex: 1; background: #f1f5f9; border-radius: 999px; height: 8px; overflow: hidden; }
    .cat-bar { height: 100%; background: #6366f1; border-radius: 999px; transition: width 0.4s ease; min-width: 4px; }
    .cat-count { font-size: 0.82rem; font-weight: 700; color: #0f172a; width: 24px; text-align: right; }

    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .table th { padding: 10px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
    .table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; color: #334155; }
    .table tbody tr:hover { background: #f8fafc; }
    .mono { font-family: monospace; font-size: 0.82rem; color: #475569; }
  `],
})
export class AdminDashboardComponent {
  readonly eq = inject(EquipmentStore);
  readonly req = inject(RequestStore);
  readonly auth = inject(AuthStore);

  readonly today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly employeeCount = computed(() =>
    MOCK_USERS.filter((u) => u.role === 'employee').length
  );

  readonly categoryEntries = computed(() => {
    const map = this.eq.countByCategory();
    return Object.entries(map).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);
  });

  categoryLabel(cat: string): string {
    return CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat;
  }
  categoryIcon(cat: string): string {
    return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] ?? '📦';
  }
  employeeName(id: string): string {
    return MOCK_USERS.find((u) => u.id === id)?.name ?? '—';
  }
}
