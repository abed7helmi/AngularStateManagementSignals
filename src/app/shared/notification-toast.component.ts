import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationStore } from '../core/stores/notification.store';

@Component({
  selector: 'app-notification-toast',
  imports: [NgClass],
  template: `
    <div class="toast-container">
      @for (n of notif.notifications(); track n.id) {
        <div class="toast" [ngClass]="'toast-' + n.type" (click)="notif.dismiss(n.id)">
          <span class="toast-icon">{{ iconFor(n.type) }}</span>
          <span>{{ n.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      animation: slideIn 0.25s ease;
      min-width: 280px;
      max-width: 380px;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-success { background: #166534; color: #fff; }
    .toast-error   { background: #991b1b; color: #fff; }
    .toast-warning { background: #92400e; color: #fff; }
    .toast-info    { background: #1e40af; color: #fff; }
    .toast-icon    { font-size: 1.1rem; }
  `],
})
export class NotificationToastComponent {
  readonly notif = inject(NotificationStore);

  iconFor(type: string): string {
    return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] ?? 'ℹ️';
  }
}
