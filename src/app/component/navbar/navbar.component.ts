import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LoginComponent, CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {

constructor(
  private router: Router,
  private auth: AuthService
){}

  isLoginModalOpen = false;

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }

  openLoginModal(): void {
    this.isLoginModalOpen = true;
  }

  get username(): string {
    return this.auth.getUsername() ?? 'usuario';
  }

  get userId(): number | null {
    return this.auth.getUserId();
  }

  onLogout(): void {
    this.auth.logout().subscribe(() => {
      this.closeLoginModal();
      this.router.navigate(['/inicio']);
    });
  }

  onLoginSuccess(): void {
    this.closeLoginModal();
    this.auth.ensureUsername().subscribe();
  }

}
