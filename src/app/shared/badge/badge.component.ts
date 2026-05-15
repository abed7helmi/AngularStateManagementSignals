import { Component, input } from '@angular/core';
import { EquipmentStatus } from '../../core/models/equipment.model';
import { RequestStatus } from '../../core/models/request.model';

type BadgeVariant = EquipmentStatus | RequestStatus | 'default';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  label = input<string>('');
}
