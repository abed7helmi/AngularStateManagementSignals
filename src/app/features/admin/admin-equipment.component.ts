import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { NotificationStore } from '../../core/stores/notification.store';
import { BadgeComponent } from '../../shared/badge.component';
import { Equipment, EquipmentCategory, EquipmentStatus, CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';
import { MOCK_USERS } from '../../core/mock-data';

type FilterStatus = EquipmentStatus | 'all';

@Component({
  selector: 'app-admin-equipment',
  imports: [FormsModule, BadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des équipements</h1>
          <p class="page-sub">{{ eq.totalCount() }} équipements dans le parc</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">+ Ajouter équipement</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        @for (f of statusFilters; track f.value) {
          <button class="filter-btn" [class.active]="filterStatus() === f.value" (click)="filterStatus.set(f.value)">
            {{ f.label }} <span class="filter-count">{{ f.count() }}</span>
          </button>
        }
        <div class="search-wrap">
          <input class="search-input" placeholder="🔍  Rechercher..." [(ngModel)]="searchTerm" />
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>Catégorie</th>
                <th>Marque</th>
                <th>N° Série</th>
                <th>Assigné à</th>
                <th>Date achat</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredItems(); track item.id) {
                <tr>
                  <td>
                    <strong>{{ item.name }}</strong>
                    @if (item.notes) {
                      <p class="item-notes">{{ item.notes }}</p>
                    }
                  </td>
                  <td>{{ catIcon(item.category) }} {{ catLabel(item.category) }}</td>
                  <td>{{ item.brand }}</td>
                  <td class="mono">{{ item.serialNumber }}</td>
                  <td>{{ item.assignedTo ? employeeName(item.assignedTo) : '—' }}</td>
                  <td>{{ item.purchaseDate }}</td>
                  <td><app-badge [variant]="item.status" [label]="statusLabel(item.status)" /></td>
                  <td>
                    <div class="actions">
                      @if (item.status === 'assigned') {
                        <button class="act-btn act-warn" (click)="unassign(item)" title="Désassigner">↩</button>
                      }
                      @if (item.status === 'available') {
                        <button class="act-btn act-info" (click)="openAssignModal(item)" title="Assigner">👤</button>
                      }
                      <button class="act-btn act-edit" (click)="openEditModal(item)" title="Modifier">✏️</button>
                      <button class="act-btn act-del" (click)="remove(item.id)" title="Supprimer">🗑</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-row">Aucun équipement trouvé</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showFormModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingItem() ? 'Modifier' : 'Ajouter' }} un équipement</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>Nom *</label>
                <input class="form-control" [(ngModel)]="form.name" placeholder="Ex: Dell XPS 15" />
              </div>
              <div class="form-group">
                <label>Marque *</label>
                <input class="form-control" [(ngModel)]="form.brand" placeholder="Ex: Dell" />
              </div>
              <div class="form-group">
                <label>Catégorie *</label>
                <select class="form-control" [(ngModel)]="form.category">
                  @for (c of categories; track c.value) {
                    <option [value]="c.value">{{ c.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Numéro de série *</label>
                <input class="form-control" [(ngModel)]="form.serialNumber" placeholder="Ex: DLL-001-2024" />
              </div>
              <div class="form-group">
                <label>Date d'achat *</label>
                <input type="date" class="form-control" [(ngModel)]="form.purchaseDate" />
              </div>
              <div class="form-group">
                <label>Statut</label>
                <select class="form-control" [(ngModel)]="form.status">
                  <option value="available">Disponible</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retraité</option>
                </select>
              </div>
              <div class="form-group full-span">
                <label>Notes</label>
                <textarea class="form-control" [(ngModel)]="form.notes" rows="2" placeholder="Notes optionnelles..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="saveForm()" [disabled]="!formValid()">
              {{ editingItem() ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Assign Modal -->
    @if (showAssignModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Assigner {{ assignTarget()?.name }}</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Employé *</label>
              <select class="form-control" [(ngModel)]="assignEmployeeId">
                <option value="">-- Sélectionner un employé --</option>
                @for (u of employees; track u.id) {
                  <option [value]="u.id">{{ u.name }} ({{ u.department }})</option>
                }
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="closeModal()">Annuler</button>
            <button class="btn btn-primary" (click)="confirmAssign()" [disabled]="!assignEmployeeId">Assigner</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 1200px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
    .filter-btn { padding: 7px 14px; border: 2px solid #e2e8f0; border-radius: 999px; background: #fff; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: #475569; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
    .filter-btn:hover { border-color: #6366f1; color: #6366f1; }
    .filter-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
    .filter-count { background: rgba(255,255,255,0.25); border-radius: 999px; padding: 0 6px; font-size: 0.75rem; }
    .filter-btn:not(.active) .filter-count { background: #f1f5f9; color: #64748b; }
    .search-wrap { margin-left: auto; }
    .search-input { padding: 7px 14px; border: 2px solid #e2e8f0; border-radius: 999px; font-size: 0.875rem; outline: none; min-width: 220px; }
    .search-input:focus { border-color: #6366f1; }

    .card { background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; }
    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .table th { padding: 10px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; background: #f8fafc; white-space: nowrap; }
    .table td { padding: 11px 14px; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
    .table tbody tr:hover { background: #f8fafc; }
    .item-notes { font-size: 0.75rem; color: #94a3b8; margin: 2px 0 0; }
    .mono { font-family: monospace; font-size: 0.82rem; color: #475569; }
    .empty-row { text-align: center; padding: 40px; color: #94a3b8; }

    .actions { display: flex; gap: 6px; }
    .act-btn { padding: 5px 9px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: opacity 0.15s; }
    .act-btn:hover { opacity: 0.8; }
    .act-warn { background: #fef3c7; }
    .act-info { background: #dbeafe; }
    .act-edit { background: #f1f5f9; }
    .act-del  { background: #fee2e2; }

    .btn { padding: 9px 18px; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s ease; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost { background: #f1f5f9; color: #475569; }
    .btn-ghost:hover { background: #e2e8f0; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 580px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
    .modal-sm { max-width: 400px; }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .modal-header h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8; padding: 0; }
    .modal-body { padding: 20px 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 10px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group.full-span { grid-column: 1 / -1; }
    label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-control { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
    .form-control:focus { border-color: #6366f1; }
    textarea.form-control { resize: vertical; }
  `],
})
export class AdminEquipmentComponent {
  readonly eq = inject(EquipmentStore);
  readonly notif = inject(NotificationStore);

  searchTerm = '';
  readonly filterStatus = signal<FilterStatus>('all');

  readonly showFormModal = signal(false);
  readonly showAssignModal = signal(false);
  readonly editingItem = signal<Equipment | null>(null);
  readonly assignTarget = signal<Equipment | null>(null);
  assignEmployeeId = '';

  readonly employees = MOCK_USERS.filter((u) => u.role === 'employee');

  form: Partial<Equipment> = this.emptyForm();

  readonly statusFilters = [
    { value: 'all' as FilterStatus,         label: 'Tous',         count: this.eq.totalCount },
    { value: 'available' as FilterStatus,   label: 'Disponibles',  count: this.eq.availableCount },
    { value: 'assigned' as FilterStatus,    label: 'Assignés',     count: this.eq.assignedCount },
    { value: 'maintenance' as FilterStatus, label: 'Maintenance',  count: this.eq.maintenanceCount },
  ];

  readonly categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as EquipmentCategory,
    label,
  }));

  readonly filteredItems = computed(() => {
    let list = this.eq.items();
    const s = this.filterStatus();
    if (s !== 'all') list = list.filter((e) => e.status === s);
    const term = this.searchTerm.toLowerCase();
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

  readonly formValid = computed(() =>
    !!(this.form.name?.trim() && this.form.brand?.trim() && this.form.serialNumber?.trim() && this.form.purchaseDate)
  );

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as EquipmentCategory] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as EquipmentCategory] ?? '📦'; }
  employeeName(id: string): string { return MOCK_USERS.find((u) => u.id === id)?.name ?? '—'; }
  statusLabel(s: EquipmentStatus): string {
    return { available: 'Disponible', assigned: 'Assigné', maintenance: 'Maintenance', retired: 'Retraité' }[s];
  }

  emptyForm(): Partial<Equipment> {
    return { name: '', brand: '', category: 'laptop', serialNumber: '', purchaseDate: '', status: 'available', notes: '' };
  }

  openAddModal(): void {
    this.editingItem.set(null);
    this.form = this.emptyForm();
    this.showFormModal.set(true);
  }

  openEditModal(item: Equipment): void {
    this.editingItem.set(item);
    this.form = { ...item };
    this.showFormModal.set(true);
  }

  openAssignModal(item: Equipment): void {
    this.assignTarget.set(item);
    this.assignEmployeeId = '';
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
    if (editing) {
      this.eq.update(editing.id, this.form as Partial<Equipment>);
      this.notif.success('Équipement mis à jour');
    } else {
      this.eq.add(this.form as Omit<Equipment, 'id'>);
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
    if (!target || !this.assignEmployeeId) return;
    this.eq.assignTo(target.id, this.assignEmployeeId);
    this.notif.success(`${target.name} assigné à ${this.employeeName(this.assignEmployeeId)}`);
    this.closeModal();
  }
}
