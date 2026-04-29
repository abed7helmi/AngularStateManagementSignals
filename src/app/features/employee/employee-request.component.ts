import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/stores/auth.store';
import { RequestStore } from '../../core/stores/request.store';
import { NotificationStore } from '../../core/stores/notification.store';
import { BadgeComponent } from '../../shared/badge.component';
import { EquipmentCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/models/equipment.model';

@Component({
  selector: 'app-employee-request',
  imports: [FormsModule, BadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Demande d'équipement</h1>
        <p class="page-sub">Soumettez une demande — elle sera examinée par l'administrateur</p>
      </div>

      <div class="page-grid">
        <!-- Request form -->
        <div class="card">
          <div class="card-header">
            <h2>Nouvelle demande</h2>
          </div>
          <div class="card-body">
            @if (submitted()) {
              <div class="success-banner">
                <span>✅</span>
                <div>
                  <strong>Demande soumise avec succès !</strong>
                  <p>Votre demande est en attente de validation par l'administrateur.</p>
                </div>
                <button class="btn btn-ghost btn-sm" (click)="resetForm()">Nouvelle demande</button>
              </div>
            } @else {
              <form (ngSubmit)="submit()" class="req-form">
                <div class="form-group">
                  <label>Type d'équipement *</label>
                  <div class="category-grid">
                    @for (cat of categories; track cat.value) {
                      <button
                        type="button"
                        class="cat-option"
                        [class.selected]="form.category === cat.value"
                        (click)="form.category = cat.value"
                      >
                        <span class="cat-opt-icon">{{ cat.icon }}</span>
                        <span class="cat-opt-label">{{ cat.label }}</span>
                      </button>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label>Description *</label>
                  <input
                    class="form-control"
                    [(ngModel)]="form.description"
                    name="description"
                    placeholder="Ex: Laptop Dell XPS 15 ou similaire"
                    maxlength="200"
                  />
                  <span class="char-count">{{ form.description.length }}/200</span>
                </div>

                <div class="form-group">
                  <label>Justification *</label>
                  <textarea
                    class="form-control"
                    [(ngModel)]="form.justification"
                    name="justification"
                    rows="4"
                    placeholder="Expliquez pourquoi vous avez besoin de cet équipement..."
                    maxlength="500"
                  ></textarea>
                  <span class="char-count">{{ form.justification.length }}/500</span>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-ghost" (click)="resetForm()">Réinitialiser</button>
                  <button type="submit" class="btn btn-primary" [disabled]="!formValid()">
                    Soumettre la demande
                  </button>
                </div>
              </form>
            }
          </div>
        </div>

        <!-- My requests history -->
        <div class="card">
          <div class="card-header">
            <h2>Historique de mes demandes</h2>
            <span class="header-count">{{ myRequests().length }}</span>
          </div>

          @if (myRequests().length === 0) {
            <p class="empty-state">Aucune demande pour l'instant</p>
          } @else {
            <div class="history-list">
              @for (r of myRequests(); track r.id) {
                <div class="history-item" [class]="'history-' + r.status">
                  <div class="history-top">
                    <div class="history-left">
                      <span class="hist-icon">{{ catIcon(r.category) }}</span>
                      <div>
                        <p class="hist-cat">{{ catLabel(r.category) }}</p>
                        <p class="hist-desc">{{ r.description }}</p>
                      </div>
                    </div>
                    <div class="history-right">
                      <app-badge [variant]="r.status" [label]="statusLabel(r.status)" />
                      @if (r.status === 'pending') {
                        <button class="cancel-btn" (click)="cancel(r.id)" title="Annuler">✕</button>
                      }
                    </div>
                  </div>
                  <div class="history-meta">
                    <span>Demandé le {{ r.requestDate }}</span>
                    @if (r.responseDate) {
                      <span>· Répondu le {{ r.responseDate }}</span>
                    }
                  </div>
                  @if (r.adminNote) {
                    <div class="history-note">
                      <span class="note-icon">💬</span>
                      <span>{{ r.adminNote }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px 32px; max-width: 1100px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .page-sub { color: #64748b; margin: 0; font-size: 0.9rem; }

    .page-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .card { background: #fff; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.07); overflow: hidden; height: fit-content; }
    .card-header { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .card-header h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }
    .header-count { background: #e0e7ff; color: #3730a3; border-radius: 999px; padding: 2px 10px; font-size: 0.8rem; font-weight: 700; }
    .card-body { padding: 20px; }

    .success-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 16px;
      font-size: 0.9rem;
    }
    .success-banner span:first-child { font-size: 1.5rem; flex-shrink: 0; }
    .success-banner strong { display: block; color: #166534; margin-bottom: 4px; }
    .success-banner p { color: #15803d; margin: 0; font-size: 0.82rem; }
    .success-banner .btn-ghost { margin-left: auto; flex-shrink: 0; align-self: center; }

    .req-form { display: flex; flex-direction: column; gap: 18px; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-control { padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box; }
    .form-control:focus { border-color: #6366f1; }
    textarea.form-control { resize: vertical; }
    .char-count { font-size: 0.72rem; color: #94a3b8; text-align: right; }

    .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .cat-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.75rem;
    }
    .cat-option:hover { border-color: #6366f1; background: #eef2ff; }
    .cat-option.selected { border-color: #6366f1; background: #eef2ff; color: #4f46e5; }
    .cat-opt-icon { font-size: 1.4rem; }
    .cat-opt-label { font-weight: 600; color: #475569; }
    .cat-option.selected .cat-opt-label { color: #4f46e5; }

    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }

    .btn { padding: 9px 18px; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s ease; }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost { background: #f1f5f9; color: #475569; }
    .btn-ghost:hover { background: #e2e8f0; }

    .empty-state { color: #94a3b8; text-align: center; padding: 40px 20px; font-size: 0.875rem; }

    .history-list { display: flex; flex-direction: column; }
    .history-item { padding: 14px 20px; border-bottom: 1px solid #f8fafc; transition: background 0.1s; }
    .history-item:last-child { border-bottom: none; }
    .history-item:hover { background: #f8fafc; }
    .history-pending  { border-left: 3px solid #fbbf24; }
    .history-approved { border-left: 3px solid #22c55e; }
    .history-rejected { border-left: 3px solid #ef4444; }

    .history-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
    .history-left { display: flex; align-items: flex-start; gap: 10px; }
    .hist-icon { font-size: 1.3rem; flex-shrink: 0; }
    .hist-cat { font-weight: 700; color: #0f172a; margin: 0 0 2px; font-size: 0.875rem; }
    .hist-desc { color: #64748b; margin: 0; font-size: 0.78rem; }
    .history-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .cancel-btn { padding: 3px 8px; border: none; background: #fee2e2; color: #991b1b; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
    .cancel-btn:hover { background: #dc2626; color: #fff; }

    .history-meta { font-size: 0.72rem; color: #94a3b8; margin-bottom: 4px; }

    .history-note { display: flex; align-items: flex-start; gap: 6px; background: #f0f4ff; border-radius: 6px; padding: 6px 10px; font-size: 0.78rem; color: #3730a3; margin-top: 6px; }
    .note-icon { flex-shrink: 0; }
  `],
})
export class EmployeeRequestComponent {
  private readonly auth = inject(AuthStore);
  private readonly req = inject(RequestStore);
  private readonly notif = inject(NotificationStore);

  readonly submitted = signal(false);

  form = {
    category: 'laptop' as EquipmentCategory,
    description: '',
    justification: '',
  };

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
    () => !!this.form.category && this.form.description.trim().length >= 5 && this.form.justification.trim().length >= 10
  );

  catLabel(cat: string): string { return CATEGORY_LABELS[cat as EquipmentCategory] ?? cat; }
  catIcon(cat: string): string  { return CATEGORY_ICONS[cat as EquipmentCategory] ?? '📦'; }
  statusLabel(s: string): string {
    return { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }[s] ?? s;
  }

  submit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId || !this.formValid()) return;
    this.req.submit(userId, {
      category: this.form.category,
      description: this.form.description.trim(),
      justification: this.form.justification.trim(),
    });
    this.submitted.set(true);
    this.notif.success('Demande soumise avec succès !');
  }

  resetForm(): void {
    this.form = { category: 'laptop', description: '', justification: '' };
    this.submitted.set(false);
  }

  cancel(requestId: string): void {
    this.req.cancel(requestId);
    this.notif.success('Demande annulée');
  }
}
