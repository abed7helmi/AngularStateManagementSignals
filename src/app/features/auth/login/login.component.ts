import { Component, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/stores/auth.store';

interface DemoAccount {
  name: string;
  email: string;
  role: 'admin' | 'employee';
  position: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  readonly demoAccounts: DemoAccount[] = [
    { name: 'Admin Système',   email: 'admin@company.com',   role: 'admin',    position: 'Administrateur Système' },
    { name: 'Alice Martin',    email: 'alice@company.com',   role: 'employee', position: 'Développeuse Frontend'  },
    { name: 'Bob Dupont',      email: 'bob@company.com',     role: 'employee', position: 'Chef de Projet'         },
    { name: 'Charlie Bernard', email: 'charlie@company.com', role: 'employee', position: 'Développeur Backend'    },
    { name: 'Diana Rousseau',  email: 'diana@company.com',   role: 'employee', position: 'Responsable RH'         },
    { name: 'Eve Leclerc',     email: 'eve@company.com',     role: 'employee', position: 'Analyste Financière'    },
  ];

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate([this.auth.isAdmin() ? '/admin/dashboard' : '/employee/dashboard']);
      }
    });
  }

  fillDemo(account: DemoAccount): void {
    this.form.patchValue({ email: account.email, password: 'password123' });
    this.auth.clearError();
  }

  submit(): void {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.auth.login(email!.trim(), password!);
  }
}
