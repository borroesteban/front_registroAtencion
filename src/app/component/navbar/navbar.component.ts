import { Component, inject} from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HomeComponent } from '../home/home.component';
import { RouterLink, Router} from '@angular/router';
// Agrega 'inject' aquí:


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {

constructor(
  private router: Router,
  private auth: AuthService
){}

private authService = inject(AuthService); 

  isLoginModalOpen = false;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }
  openLoginModal(): void {
    this.isLoginModalOpen = true;
  }
  get username(): string {
    return this.authService.getUsername() ?? 'usuario';
  }
    onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.closeLoginModal();
      this.router.navigate(['/inicio']);
    });
  }
}
