import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface LoginResponse {
  token: string;
  user: { id: number; username: string };
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly usernameKey = 'auth_username';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private get canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.api}/login/`, { username, password })
      .pipe(tap((res) => this.setSession(res.token, res.user?.username ?? username)));
  }

    logout() {

      
      
      
      const token = this.getToken();
      return this.http
      .post(
        `${environment.api}/logout/`, {}, {headers: token ? { Authorization: `Token ${token}`} : {}
      })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => of(null)),
            finalize(() => this.clearSession())
    );
  }

  getToken(): string | null {
    if (!this.canUseStorage) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  ensureUsername() {
    const existingUsername = this.getUsername();
    if (!this.isLoggedIn() || existingUsername) {
      return of(existingUsername);
    }

    return this.http.get<unknown>(`${environment.api}/me`).pipe(
      tap((response) => {
        const username = this.extractUsername(response);
        if (username) {
          this.setUsername(username);
        }
      }),
      catchError(() => of(null))
    );
  }

  getUsername(): string | null {
    if (!this.canUseStorage) {
      return null;
    }
    return localStorage.getItem(this.usernameKey);
  }

  private setSession(token: string, username?: string): void {
    if (!this.canUseStorage) {
      return;
    }
    localStorage.setItem(this.tokenKey, token);
    if (username) {
      this.setUsername(username);
    }
  }

  private setUsername(username: string): void {
    if (!this.canUseStorage) {
      return;
    }
    localStorage.setItem(this.usernameKey, username);
  }

  private extractUsername(response: unknown): string | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const payload = response as Record<string, unknown>;
    const directUsername = payload['username'];
    if (typeof directUsername === 'string' && directUsername.trim()) {
      return directUsername.trim();
    }

    const nestedUser = payload['user'];
    if (nestedUser && typeof nestedUser === 'object') {
      const nestedUsername = (nestedUser as Record<string, unknown>)['username'];
      if (typeof nestedUsername === 'string' && nestedUsername.trim()) {
        return nestedUsername.trim();
      }
    }

    return null;
  }

  private clearSession(): void {
    if (!this.canUseStorage) {
      return;
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
  }
}

