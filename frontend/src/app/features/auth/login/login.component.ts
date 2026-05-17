import { Component, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
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
  private readonly liveAnnouncer = inject(LiveAnnouncer);

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

    effect(() => {
      const error = this.auth.error();
      if (error) {
        this.liveAnnouncer.announce(error, 'assertive');
      }
    });
  }

  onFieldBlur(field: 'email' | 'password'): void {
    const ctrl = this.form.get(field)!;
    if (!ctrl.invalid) return;

    if (field === 'email') {
      const msg = ctrl.errors?.['required']
        ? "L'adresse email est requise."
        : 'Veuillez saisir une adresse email valide.';
      this.liveAnnouncer.announce(msg, 'polite');
    } else {
      this.liveAnnouncer.announce('Le mot de passe est requis.', 'polite');
    }
  }

  fillDemo(account: DemoAccount): void {
    this.form.patchValue({ email: account.email, password: 'password123' });
    this.auth.clearError();
    this.liveAnnouncer.announce(`Formulaire rempli avec le compte ${account.name}.`, 'polite');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.liveAnnouncer.announce(
        'Le formulaire contient des erreurs. Veuillez corriger les champs incorrects.',
        'assertive'
      );
      return;
    }
    const { email, password } = this.form.value;
    this.auth.login(email!.trim(), password!);
  }
}
