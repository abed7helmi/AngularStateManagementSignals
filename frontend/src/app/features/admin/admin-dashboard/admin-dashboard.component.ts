import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquipmentStore } from '../../../core/stores/equipment.store';
import { RequestStore } from '../../../core/stores/request.store';
import { AuthStore } from '../../../core/stores/auth.store';
import { UserStore } from '../../../core/stores/user.store';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [StatCardComponent, BadgeComponent, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  readonly eq = inject(EquipmentStore);
  readonly req = inject(RequestStore);
  readonly auth = inject(AuthStore);
  private readonly userStore = inject(UserStore);

  readonly today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly employeeCount = computed(() => this.userStore.employees().length);

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
    return this.userStore.getName(id);
  }
}
