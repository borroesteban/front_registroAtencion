import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AdminAccessService } from '../../service/admin-access.service';

@Component({
  selector: 'app-register-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-request.component.html',
  styleUrl: './register-request.component.css'
})
export class RegisterRequestComponent {
  submitting = false;
  successMessage = '';
  errorMessage = '';

  readonly registerRequestForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    firstName: [''],
    lastName: [''],
  });

  constructor(
    private fb: FormBuilder,
    private adminAccessService: AdminAccessService
  ) {}

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerRequestForm.invalid) {
      this.registerRequestForm.markAllAsTouched();
      this.errorMessage = 'Completa usuario y contraseña (minimo 3 caracteres).';
      return;
    }

    this.submitting = true;

    const raw = this.registerRequestForm.getRawValue();
    this.adminAccessService.submitRegistrationRequest({
      username: (raw.username ?? '').trim(),
      password: raw.password ?? '',
      firstName: (raw.firstName ?? '').trim() || null,
      lastName: (raw.lastName ?? '').trim() || null,
    }).subscribe({
      next: () => {
        this.successMessage = 'Solicitud enviada. El administrador debe aprobarla para habilitar tu login.';
        this.registerRequestForm.reset();
        this.submitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.buildErrorMessage(error);
        this.submitting = false;
      }
    });
  }

  private buildErrorMessage(error: HttpErrorResponse): string {
    const detail = this.extractDetail(error);

    if (error.status === 401 || error.status === 403) {
      return detail
        ? `No se pudo enviar la solicitud (${error.status}): ${detail}`
        : `No se pudo enviar la solicitud (${error.status}). El backend esta pidiendo autenticacion/permisos.`;
    }

    if (error.status === 400) {
      return detail
        ? `No se pudo enviar la solicitud (400): ${detail}`
        : 'No se pudo enviar la solicitud (400). Revisa los datos requeridos por el backend.';
    }

    if (detail) {
      return `No se pudo enviar la solicitud: ${detail}`;
    }

    return 'No se pudo enviar la solicitud. Verifica los datos e intenta nuevamente.';
  }

  private extractDetail(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload.trim();
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const detail = record['detail'];
      if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
      }

      const firstEntry = Object.entries(record)[0];
      if (firstEntry) {
        const [field, value] = firstEntry;
        if (Array.isArray(value) && value.length > 0) {
          return `${field}: ${String(value[0])}`;
        }
        if (typeof value === 'string' && value.trim()) {
          return `${field}: ${value.trim()}`;
        }
      }
    }

    return null;
  }
}
