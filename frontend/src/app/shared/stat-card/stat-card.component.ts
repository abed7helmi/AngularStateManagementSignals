import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  icon = input<string>('📦');
  value = input<number | string>(0);
  label = input<string>('');
  color = input<string>('#6366f1');
}
