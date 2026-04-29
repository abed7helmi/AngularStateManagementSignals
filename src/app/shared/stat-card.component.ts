import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <div class="stat-card" [style.border-top-color]="color()">
      <div class="stat-icon">{{ icon() }}</div>
      <div class="stat-body">
        <div class="stat-value">{{ value() }}</div>
        <div class="stat-label">{{ label() }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: #fff;
      border-radius: 12px;
      border-top: 4px solid #6366f1;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,.1);
    }
    .stat-icon { font-size: 2rem; line-height: 1; }
    .stat-body { flex: 1; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1; }
    .stat-label { font-size: 0.85rem; color: #64748b; margin-top: 4px; font-weight: 500; }
  `],
})
export class StatCardComponent {
  icon = input<string>('📦');
  value = input<number | string>(0);
  label = input<string>('');
  color = input<string>('#6366f1');
}
