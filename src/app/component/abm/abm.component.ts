import { Component, OnInit } from '@angular/core';
import { PersonaListComponent } from '../persona-list/persona-list.component';
import { MotivoListComponent } from '../motivo-list/motivo-list.component';
import { HistorialListComponent } from '../historial-list/historial-list.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../service/auth.service';
import { AdminAccessService } from '../../service/admin-access.service';
import { catchError, map, of } from 'rxjs';

// Importaciones corregidas para evitar errores de tipos

@Component({
  selector: 'app-abm',
  standalone: true,
  imports: [NavbarComponent, PersonaListComponent, CommonModule, MotivoListComponent, HistorialListComponent],
  templateUrl: './abm.component.html',
  styleUrl: './abm.component.css'
})
export class AbmComponent implements OnInit {
  motivoList = false;
  historialList = false;
  personaList = false;
  loadingAccess = false;
  hasPanelAccess = true;

  constructor(
    private auth: AuthService,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    this.validatePanelVisitasAccess();
  }

  private validatePanelVisitasAccess(): void {
    this.loadingAccess = true;
    const userId = this.auth.getUserId();
    if (userId === null) {
      this.hasPanelAccess = false;
      this.loadingAccess = false;
      return;
    }

    this.adminAccessService.getUserById(userId).pipe(
      map((response) => this.hasPanelVisitasAccess(response)),
      catchError(() => of(false))
    ).subscribe((hasAccess) => {
      this.hasPanelAccess = hasAccess;
      this.loadingAccess = false;

      if (!hasAccess) {
        this.personaList = false;
        this.motivoList = false;
        this.historialList = false;
      }
    });
  }

  private hasPanelVisitasAccess(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const payload = response as Record<string, unknown>;
    const user = payload['user'];
    if (!user || typeof user !== 'object') {
      return false;
    }

    const userRecord = user as Record<string, unknown>;
    const rawSuperuser = userRecord['is_superuser'] ?? userRecord['isSuperuser'];
    if (this.toBoolean(rawSuperuser)) {
      return true;
    }

    const permissions = [
      ...(this.toArray(userRecord['direct_permissions'])),
      ...(this.toArray(userRecord['group_permissions'])),
      ...(this.toArray(userRecord['permissions']))
    ];

    const hasCodenamePermission = permissions.some((permission) => {
      if (!permission || typeof permission !== 'object') {
        return false;
      }
      const record = permission as Record<string, unknown>;
      const code = record['codename'] ?? record['code'];
      return typeof code === 'string' && code.trim().toLowerCase() === 'ver_visitas';
    });
    if (hasCodenamePermission) {
      return true;
    }

    const roles = this.toArray(userRecord['roles']);
    return roles.some((role) => {
      if (!role || typeof role !== 'object') {
        return false;
      }
      const name = (role as Record<string, unknown>)['name'];
      if (typeof name !== 'string') {
        return false;
      }
      const normalized = name.trim().toLowerCase().replace(/\s+/g, '_');
      return normalized === 'ver_panel_visitas';
    });
  }

  private toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1';
    }
    return false;
  }

  showPersonaList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.personaList = true;
    this.motivoList = false;
    this.historialList = false;
  }

  showHistorialList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.historialList = true;
    this.personaList = false;
    this.motivoList = false;
  }

  showMotivoList() {
    if (!this.hasPanelAccess) {
      return;
    }
    this.motivoList = true;
    this.historialList = false;
    this.personaList = false;
  }
}
