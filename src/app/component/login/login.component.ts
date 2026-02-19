import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService) {}

  submit(): void {
    this.errorMessage = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.password = '';
        this.loginSuccess.emit();
      },
      error: (error: HttpErrorResponse) => {
        const detail = typeof error.error === 'object' && error.error
          ? (error.error as Record<string, unknown>)['detail']
          : null;
        this.errorMessage = typeof detail === 'string' && detail.trim()
          ? `Error de login: ${detail}`
          : 'Error de login: usuario o contraseña invalidos.';
      }
    });
  }
}
