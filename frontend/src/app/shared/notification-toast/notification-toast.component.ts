import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationStore } from '../../core/stores/notification.store';

@Component({
  selector: 'app-notification-toast',
  imports: [NgClass],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.css',
})
export class NotificationToastComponent {
  readonly notif = inject(NotificationStore);

  iconFor(type: string): string {
    return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] ?? 'ℹ️';
  }
}
