import { Component, inject, computed } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';
import { EquipmentStore } from '../../core/stores/equipment.store';
import { BadgeComponent } from '../../shared/badge.component';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';

@Component({
  selector: 'app-employee-my-equipment',
  imports: [BadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Mes équipements</h1>
          <p class="page-sub">{{ myEquipment().length }} équipement(s) assigné(s)</p>
        </div>
      </div>

      @if (myEquipment().length === 0) {
        <div class="empty-card">
          <span class="empty-icon">📦</span>
          <h2>Aucun équipement assigné</h2>
          <p>Vous n'avez pas encore d'équipement informatique assigné.</p>
        </div>
      } @else {
        <div class="eq-grid">
          @for (item of myEquipment(); track item.id) {
            <div class="eq-card">
              <div class="eq-card-header">
                <span class="eq-big-icon">{{ catIcon(item.category) }}</span>
                <app-badge variant="assigned" label="Assigné" />
              </div>
              <h3 class="eq-name">{{ item.name }}</h3>
              <p class="eq-brand">{{ item.brand }}</p>

              <div class="eq-details">
                <div class="detail-row">
                  <span class="detail-label">Catégorie</span>
                  <span class="detail-value">{{ catLabel(item.category) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">N° Série</span>
                  <span class="detail-value mono">{{ item.serialNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Acquis le</span>
                  <span class="detail-value">{{ item.purchaseDate }}</span>
                </div>
                @if (item.notes) {
                  <div class="detail-row full">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value text-muted">{{ item.notes }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 900px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .empty-card { background: #fff; border-radius: 16px; padding: 60px 32px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .empty-card h2 { font-size: 1.2rem; color: #0f172a; margin: 0 0 8px; }
    .empty-card p { color: #64748b; margin: 0; }

    .eq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }

    .eq-card {
      background: #fff;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,.07);
      border: 2px solid #f1f5f9;
      transition: all 0.15s ease;
    }
    .eq-card:hover { border-color: #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.1); }

    .eq-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .eq-big-icon { font-size: 2.5rem; line-height: 1; }

    .eq-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .eq-brand { font-size: 0.82rem; color: #6366f1; font-weight: 600; margin: 0 0 14px; }

    .eq-details { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .detail-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; font-size: 0.82rem; }
    .detail-row.full { flex-direction: column; gap: 2px; }
    .detail-label { color: #64748b; font-weight: 600; flex-shrink: 0; }
    .detail-value { color: #0f172a; text-align: right; }
    .detail-row.full .detail-value { text-align: left; }
    .mono { font-family: monospace; font-size: 0.78rem; }
    .text-muted { color: #64748b; }
  `],
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
