import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  username = '';
  password = '';

  constructor(private auth: AuthService) {}

  submit(): void {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.password = '';
        this.loginSuccess.emit();
      },
      error: (err) => console.error('Error de login', err)
    });
  }
}
