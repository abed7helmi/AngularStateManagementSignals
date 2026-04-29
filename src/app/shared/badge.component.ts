import { Component, input } from '@angular/core';
import { EquipmentStatus } from '../core/models/equipment.model';
import { RequestStatus } from '../core/models/request.model';

type BadgeVariant = EquipmentStatus | RequestStatus | 'default';

@Component({
  selector: 'app-badge',
  template: `<span [class]="'badge badge-' + variant()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-available  { background: #dcfce7; color: #166534; }
    .badge-assigned   { background: #dbeafe; color: #1e40af; }
    .badge-maintenance{ background: #fef9c3; color: #854d0e; }
    .badge-retired    { background: #f1f5f9; color: #64748b; }
    .badge-pending    { background: #fef3c7; color: #92400e; }
    .badge-approved   { background: #dcfce7; color: #166534; }
    .badge-rejected   { background: #fee2e2; color: #991b1b; }
    .badge-default    { background: #f1f5f9; color: #334155; }
  `],
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  label = input<string>('');
}
