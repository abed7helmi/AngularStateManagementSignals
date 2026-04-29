import { Component, inject, signal, computed } from '@angular/core';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { RequestStore } from '../../core/stores/request.store';
import { BadgeComponent } from '../../shared/badge.component';
import { MOCK_USERS } from '../../core/mock-data';
import { User } from '../../core/models/user.model';
import { CATEGORY_LABELS, CATEGORY_ICONS, Equipment } from '../../core/models/equipment.model';

@Component({
  selector: 'app-admin-employees',
  imports: [BadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Employés</h1>
          <p class="page-sub">{{ employees.length }} employés — cliquez pour voir le détail</p>
        </div>
      </div>

      <div class="employee-grid">
        @for (emp of employees; track emp.id) {
          <div class="emp-card" (click)="selectEmployee(emp)" [class.selected]="selectedEmployee()?.id === emp.id">
            <div class="emp-card-header">
              <div class="emp-avatar">{{ emp.name[0] }}</div>
              <div>
                <p class="emp-name">{{ emp.name }}</p>
                <p class="emp-meta">{{ emp.position }}</p>
                <p class="emp-dept">{{ emp.department }}</p>
              </div>
            </div>
            <div class="emp-stats">
              <div class="emp-stat">
                <span class="emp-stat-val">{{ equipmentCount(emp.id) }}</span>
                <span class="emp-stat-label">équipements</span>
              </div>
              <div class="emp-stat">
                <span class="emp-stat-val">{{ pendingCount(emp.id) }}</span>
                <span class="emp-stat-label">en attente</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Employee detail panel -->
      @if (selectedEmployee(); as emp) {
        <div class="detail-panel">
          <div class="detail-header">
            <div class="detail-title">
              <div class="detail-avatar">{{ emp.name[0] }}</div>
              <div>
                <h2>{{ emp.name }}</h2>
                <p>{{ emp.email }} · {{ emp.position }} · {{ emp.department }}</p>
              </div>
            </div>
            <button class="close-btn" (click)="selectedEmployee.set(null)">✕ Fermer</button>
          </div>

          <div class="detail-grid">
            <!-- Equipment -->
            <div class="card">
              <div class="card-header">
                <h3>Équipements assignés ({{ employeeEquipment().length }})</h3>
              </div>
              @if (employeeEquipment().length === 0) {
                <p class="empty-state">Aucun équipement assigné</p>
              } @else {
                <div class="table-wrap">
                  <table class="table">
                    <thead>
                      <tr><th>Équipement</th><th>Catégorie</th><th>N° Série</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      @for (item of employeeEquipment(); track item.id) {
                        <tr>
                          <td><strong>{{ item.name }}</strong><br><small class="text-muted">{{ item.brand }}</small></td>
                          <td>{{ catIcon(item.category) }} {{ catLabel(item.category) }}</td>
                          <td class="mono">{{ item.serialNumber }}</td>
                          <td><app-badge variant="assigned" label="Assigné" /></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Requests history -->
            <div class="card">
              <div class="card-header">
                <h3>Historique des demandes ({{ employeeRequests().length }})</h3>
              </div>
              @if (employeeRequests().length === 0) {
                <p class="empty-state">Aucune demande</p>
              } @else {
                <div class="table-wrap">
                  <table class="table">
                    <thead>
                      <tr><th>Catégorie</th><th>Description</th><th>Date</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      @for (r of employeeRequests(); track r.id) {
                        <tr>
                          <td>{{ catIcon(r.category) }} {{ catLabel(r.category) }}</td>
                          <td>{{ r.description }}</td>
                          <td>{{ r.requestDate }}</td>
                          <td><app-badge [variant]="r.status" [label]="statusLabel(r.status)" /></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 1200px; }
    .page-header { margin-bottom: 20px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .employee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }

    .emp-card {
      background: #fff;
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.15s ease;
    }
    .emp-card:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
    .emp-card.selected { border-color: #6366f1; background: #eef2ff; }

    .emp-card-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
    .emp-avatar { width: 44px; height: 44px; border-radius: 50%; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
    .emp-name { font-weight: 700; color: #0f172a; margin: 0 0 2px; font-size: 0.9rem; }
    .emp-meta { color: #475569; margin: 0 0 2px; font-size: 0.78rem; }
    .emp-dept { color: #6366f1; margin: 0; font-size: 0.75rem; font-weight: 600; }

    .emp-stats { display: flex; gap: 16px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
    .emp-stat { text-align: center; flex: 1; }
    .emp-stat-val { display: block; font-size: 1.2rem; font-weight: 700; color: #0f172a; }
    .emp-stat-label { display: block; font-size: 0.72rem; color: #64748b; }

    .detail-panel { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; }
    .detail-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #f8fafc, #eef2ff); }
    .detail-title { display: flex; align-items: center; gap: 14px; }
    .detail-avatar { width: 52px; height: 52px; border-radius: 50%; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.3rem; }
    .detail-title h2 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .detail-title p { color: #64748b; margin: 0; font-size: 0.82rem; }
    .close-btn { padding: 7px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 0.82rem; cursor: pointer; color: #64748b; }
    .close-btn:hover { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .card { border-right: 1px solid #f1f5f9; }
    .card:last-child { border-right: none; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
    .card-header h3 { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin: 0; }

    .empty-state { color: #94a3b8; text-align: center; padding: 30px; font-size: 0.875rem; }
    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .table th { padding: 9px 14px; text-align: left; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
    .table td { padding: 10px 14px; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
    .mono { font-family: monospace; font-size: 0.78rem; color: #475569; }
    .text-muted { color: #94a3b8; font-size: 0.75rem; }
  `],
})
export class AdminEmployeesComponent {
  private readonly eq = inject(EquipmentStore);
  private readonly req = inject(RequestStore);

  readonly employees = MOCK_USERS.filter((u) => u.role === 'employee');
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
