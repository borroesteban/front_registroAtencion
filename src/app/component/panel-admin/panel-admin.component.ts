import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PermissionItem,
  RegistrationRequest,
  RoleItem,
  UserItem
} from '../../admin-access.models';
import { AdminAccessService } from '../../service/admin-access.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css'
})
export class PanelAdminComponent implements OnInit {
  requests: RegistrationRequest[] = [];
  users: UserItem[] = [];
  roles: RoleItem[] = [];
  permissions: PermissionItem[] = [];

  loading = false;
  hasAdminPermission = true;
  feedbackMessage = '';
  feedbackKind: 'success' | 'error' | '' = '';

  readonly assignUserRoleForm = this.fb.group({
    userId: [null as number | null, Validators.required],
    roleId: [null as number | null, Validators.required]
  });

  readonly assignUserPermissionForm = this.fb.group({
    userId: [null as number | null, Validators.required],
    permissionId: [null as number | null, Validators.required]
  });

  readonly createRoleForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  readonly assignRolePermissionForm = this.fb.group({
    roleId: [null as number | null, Validators.required],
    permissionId: [null as number | null, Validators.required]
  });

  readonly createPermissionForm = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    appLabel: [''],
    description: ['']
  });

  constructor(
    private fb: FormBuilder,
    private adminAccessService: AdminAccessService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  get pendingRequests(): RegistrationRequest[] {
    return this.requests.filter((request) => request.status === 'pending');
  }

  refreshData(): void {
    this.loading = true;
    this.hasAdminPermission = true;
    const loadErrors: string[] = [];
    const totalSections = 4;
    let deniedSections = 0;
    forkJoin({
      requests: this.adminAccessService.getRegistrationRequests().pipe(
        catchError((error) => {
          if (this.isAccessDenied(error)) {
            deniedSections += 1;
          }
          loadErrors.push(this.describeLoadError('solicitudes', error));
          return of([] as RegistrationRequest[]);
        })
      ),
      users: this.adminAccessService.getUsers().pipe(
        catchError((error) => {
          if (this.isAccessDenied(error)) {
            deniedSections += 1;
          }
          loadErrors.push(this.describeLoadError('usuarios', error));
          return of([] as UserItem[]);
        })
      ),
      roles: this.adminAccessService.getRoles().pipe(
        catchError((error) => {
          if (this.isAccessDenied(error)) {
            deniedSections += 1;
          }
          loadErrors.push(this.describeLoadError('roles', error));
          return of([] as RoleItem[]);
        })
      ),
      permissions: this.adminAccessService.getPermissions().pipe(
        catchError((error) => {
          if (this.isAccessDenied(error)) {
            deniedSections += 1;
          }
          loadErrors.push(this.describeLoadError('permisos', error));
          return of([] as PermissionItem[]);
        })
      )
    }).subscribe({
      next: ({ requests, users, roles, permissions }) => {
        const normalizedRequests = Array.isArray(requests) ? requests : [];
        const normalizedUsers = Array.isArray(users) ? users : [];
        const normalizedRoles = Array.isArray(roles) ? roles : [];
        const normalizedPermissions = Array.isArray(permissions) ? permissions : [];

        this.requests = normalizedRequests;
        this.users = normalizedUsers.filter((user) => !this.isSuperuser(user));
        this.roles = normalizedRoles;
        this.permissions = normalizedPermissions;
        this.loading = false;
        this.hasAdminPermission = deniedSections < totalSections;

        if (!this.hasAdminPermission) {
          this.feedbackKind = '';
          this.feedbackMessage = '';
          return;
        }

        if (loadErrors.length >= totalSections) {
          this.setFeedback(
            'error',
            `No se pudo cargar la informacion del panel admin: ${loadErrors.join(' | ')}`
          );
          return;
        }

        if (loadErrors.length > 0) {
          // Carga parcial: dejamos el panel usable sin mostrar error global.
          console.warn('Panel admin con carga parcial:', loadErrors.join(' | '));
        }

        this.feedbackKind = '';
        this.feedbackMessage = '';
      }
    });
  }

  approveRequest(requestId: number): void {
    this.adminAccessService.approveRegistrationRequest(requestId).subscribe({
      next: () => {
        this.setFeedback('success', 'Solicitud aprobada. El usuario ya puede iniciar sesion.');
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo aprobar la solicitud.')
    });
  }

  rejectRequest(requestId: number): void {
    this.adminAccessService.rejectRegistrationRequest(requestId).subscribe({
      next: () => {
        this.setFeedback('success', 'Solicitud rechazada.');
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo rechazar la solicitud.')
    });
  }

  assignRoleToUser(): void {
    if (this.assignUserRoleForm.invalid) {
      this.assignUserRoleForm.markAllAsTouched();
      return;
    }

    const userId = this.assignUserRoleForm.controls.userId.value;
    const roleId = this.assignUserRoleForm.controls.roleId.value;
    if (userId === null || roleId === null) {
      return;
    }

    this.adminAccessService.assignRoleToUser(userId, roleId).subscribe({
      next: () => {
        this.setFeedback('success', 'Rol asignado al usuario.');
        this.assignUserRoleForm.reset();
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo asignar el rol.')
    });
  }

  removeRoleFromUser(userId: number, roleId: number): void {
    this.adminAccessService.removeRoleFromUser(userId, roleId).subscribe({
      next: () => {
        this.setFeedback('success', 'Rol eliminado del usuario.');
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo eliminar el rol del usuario.')
    });
  }

  assignPermissionToUser(): void {
    if (this.assignUserPermissionForm.invalid) {
      this.assignUserPermissionForm.markAllAsTouched();
      return;
    }

    const userId = this.assignUserPermissionForm.controls.userId.value;
    const permissionId = this.assignUserPermissionForm.controls.permissionId.value;
    if (userId === null || permissionId === null) {
      return;
    }

    this.adminAccessService.assignPermissionToUser(userId, permissionId).subscribe({
      next: () => {
        this.setFeedback('success', 'Permiso asignado al usuario.');
        this.assignUserPermissionForm.reset();
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo asignar el permiso al usuario.')
    });
  }

  removePermissionFromUser(userId: number, permissionId: number): void {
    this.adminAccessService.removePermissionFromUser(userId, permissionId).subscribe({
      next: () => {
        this.setFeedback('success', 'Permiso eliminado del usuario.');
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo eliminar el permiso del usuario.')
    });
  }

  createRole(): void {
    if (this.createRoleForm.invalid) {
      this.createRoleForm.markAllAsTouched();
      return;
    }

    const name = (this.createRoleForm.controls.name.value ?? '').trim();
    if (!name) {
      return;
    }

    this.adminAccessService.createRole({
      name,
      description: (this.createRoleForm.controls.description.value ?? '').trim() || null
    }).subscribe({
      next: () => {
        this.setFeedback('success', 'Rol creado correctamente.');
        this.createRoleForm.reset();
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo crear el rol.')
    });
  }

  assignPermissionToRole(): void {
    if (this.assignRolePermissionForm.invalid) {
      this.assignRolePermissionForm.markAllAsTouched();
      return;
    }

    const roleId = this.assignRolePermissionForm.controls.roleId.value;
    const permissionId = this.assignRolePermissionForm.controls.permissionId.value;
    if (roleId === null || permissionId === null) {
      return;
    }

    this.adminAccessService.assignPermissionToRole(roleId, permissionId).subscribe({
      next: () => {
        this.setFeedback('success', 'Permiso agregado al rol.');
        this.assignRolePermissionForm.reset();
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo agregar el permiso al rol.')
    });
  }

  removePermissionFromRole(roleId: number, permissionId: number): void {
    this.adminAccessService.removePermissionFromRole(roleId, permissionId).subscribe({
      next: () => {
        this.setFeedback('success', 'Permiso eliminado del rol.');
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo eliminar el permiso del rol.')
    });
  }

  deleteUser(userId: number): void {
    const confirmed = window.confirm('Seguro que queres eliminar este usuario?');
    if (!confirmed) {
      return;
    }

    this.adminAccessService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.setFeedback('success', 'Usuario eliminado correctamente.');
      },
      error: (error) => {
        const actionError = this.getActionErrorMessage(error);
        this.setFeedback('error', actionError ?? 'No se pudo eliminar el usuario');
      }
    });
  }

  createPermission(): void {
    if (this.createPermissionForm.invalid) {
      this.createPermissionForm.markAllAsTouched();
      return;
    }

    const code = (this.createPermissionForm.controls.code.value ?? '').trim();
    const name = (this.createPermissionForm.controls.name.value ?? '').trim();
    if (!code || !name) {
      return;
    }

    this.adminAccessService.createPermission({
      code,
      name,
      appLabel: (this.createPermissionForm.controls.appLabel.value ?? '').trim() || null,
      description: (this.createPermissionForm.controls.description.value ?? '').trim() || null
    }).subscribe({
      next: () => {
        this.setFeedback('success', 'Permiso creado correctamente.');
        this.createPermissionForm.reset();
        this.refreshData();
      },
      error: () => this.setFeedback('error', 'No se pudo crear el permiso.')
    });
  }

  getResolvedUserRoles(user: UserItem): RoleItem[] {
    const userRecord = user as unknown as Record<string, unknown>;
    const rolesFromUser = userRecord['roles'];
    if (Array.isArray(rolesFromUser) && rolesFromUser.length > 0) {
      if (typeof rolesFromUser[0] === 'object') {
        return rolesFromUser as RoleItem[];
      }
      const roleIds = this.toNumberArray(rolesFromUser);
      return this.roles.filter((role) => roleIds.includes(role.id));
    }

    const roleIds = this.mergeNumberArrays(
      this.toNumberArray(userRecord['roleIds']),
      this.toNumberArray(userRecord['role_ids'])
    );
    return this.roles.filter((role) => roleIds.includes(role.id));
  }

  getResolvedUserPermissions(user: UserItem): PermissionItem[] {
    const userRecord = user as unknown as Record<string, unknown>;
    const permissionsFromUser = userRecord['permissions'];
    if (Array.isArray(permissionsFromUser) && permissionsFromUser.length > 0) {
      if (typeof permissionsFromUser[0] === 'object') {
        return permissionsFromUser as PermissionItem[];
      }
      const permissionIds = this.toNumberArray(permissionsFromUser);
      return this.permissions.filter((permission) => permissionIds.includes(permission.id));
    }

    const permissionIds = this.mergeNumberArrays(
      this.toNumberArray(userRecord['permissionIds']),
      this.toNumberArray(userRecord['permission_ids']),
      this.toNumberArray(userRecord['user_permissions'])
    );
    return this.permissions.filter((permission) => permissionIds.includes(permission.id));
  }

  getResolvedRolePermissions(role: RoleItem): PermissionItem[] {
    const roleRecord = role as unknown as Record<string, unknown>;
    const permissionsFromRole = roleRecord['permissions'];
    if (Array.isArray(permissionsFromRole) && permissionsFromRole.length > 0) {
      if (typeof permissionsFromRole[0] === 'object') {
        return permissionsFromRole as PermissionItem[];
      }
      const permissionIds = this.toNumberArray(permissionsFromRole);
      return this.permissions.filter((permission) => permissionIds.includes(permission.id));
    }

    const permissionIds = this.mergeNumberArrays(
      this.toNumberArray(roleRecord['permissionIds']),
      this.toNumberArray(roleRecord['permission_ids'])
    );
    return this.permissions.filter((permission) => permissionIds.includes(permission.id));
  }

  getPermissionCode(permission: PermissionItem): string {
    const record = permission as unknown as Record<string, unknown>;
    const code = record['code'] ?? record['codename'];
    return typeof code === 'string' ? code : '';
  }

  getPermissionAppLabel(permission: PermissionItem): string {
    const record = permission as unknown as Record<string, unknown>;
    const appLabel = record['appLabel'] ?? record['app_label'];
    return typeof appLabel === 'string' ? appLabel : '';
  }

  getPermissionNameEs(permission: PermissionItem): string {
    const record = permission as unknown as Record<string, unknown>;
    const name = typeof record['name'] === 'string' ? (record['name'] as string) : '';
    const code = this.getPermissionCode(permission);

    const translatedFromName = this.translateEnglishPermissionName(name);
    if (translatedFromName) {
      return translatedFromName;
    }

    const translatedFromCode = this.translateCodenameToSpanish(code);
    if (translatedFromCode) {
      return translatedFromCode;
    }

    return name || code || 'Permiso';
  }

  private isSuperuser(user: UserItem): boolean {
    const record = user as unknown as Record<string, unknown>;
    const rawFlag = record['isSuperuser'] ?? record['is_superuser'];

    if (typeof rawFlag === 'boolean') {
      return rawFlag;
    }
    if (typeof rawFlag === 'number') {
      return rawFlag === 1;
    }
    if (typeof rawFlag === 'string') {
      const normalized = rawFlag.trim().toLowerCase();
      return normalized === 'true' || normalized === '1';
    }

    return false;
  }

  private toNumberArray(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === 'number' ? item : Number(item)))
      .filter((item) => Number.isFinite(item));
  }

  private mergeNumberArrays(...arrays: number[][]): number[] {
    return Array.from(new Set(arrays.flat()));
  }

  private describeLoadError(scope: string, error: unknown): string {
    const status = this.getStatusCode(error);
    const detail = this.getErrorDetail(error);
    if (status === 401 || status === 403) {
      return detail ? `${scope}: sin permisos (${status}) - ${detail}` : `${scope}: sin permisos (${status})`;
    }
    if (status === 404) {
      return detail ? `${scope}: endpoint no encontrado (404) - ${detail}` : `${scope}: endpoint no encontrado (404)`;
    }
    if (status !== null) {
      return detail ? `${scope}: error ${status} - ${detail}` : `${scope}: error ${status}`;
    }
    return `${scope}: error de conexion`;
  }

  private getStatusCode(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }
    const maybeError = error as Record<string, unknown>;
    const status = maybeError['status'];
    return typeof status === 'number' ? status : null;
  }

  private getErrorDetail(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const maybeError = error as Record<string, unknown>;
    const payload = maybeError['error'];
    if (typeof payload === 'string' && payload.trim()) {
      if (payload.toLowerCase().includes('<!doctype html')) {
        return 'respuesta HTML (ruta no disponible)';
      }
      return payload.trim();
    }

    if (payload && typeof payload === 'object') {
      const detail = (payload as Record<string, unknown>)['detail'];
      if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
      }
    }

    return null;
  }

  private getActionErrorMessage(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const maybeError = error as Record<string, unknown>;
    const payload = maybeError['error'];
    if (payload && typeof payload === 'object') {
      const payloadRecord = payload as Record<string, unknown>;
      const actionError = payloadRecord['error'];
      if (typeof actionError === 'string' && actionError.trim()) {
        return actionError.trim();
      }
      const message = payloadRecord['message'];
      if (typeof message === 'string' && message.trim()) {
        return message.trim();
      }
      const detail = payloadRecord['detail'];
      if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
      }
    }

    return null;
  }

  private isAccessDenied(error: unknown): boolean {
    const status = this.getStatusCode(error);
    return status === 401 || status === 403;
  }

  private setFeedback(kind: 'success' | 'error', message: string): void {
    this.feedbackKind = kind;
    this.feedbackMessage = message;
  }

  private translateEnglishPermissionName(name: string): string | null {
    const match = name.match(/^Can\s+(add|change|delete|view)\s+(.+)$/i);
    if (!match) {
      return null;
    }

    const actionMap: Record<string, string> = {
      add: 'Agregar',
      change: 'Editar',
      delete: 'Eliminar',
      view: 'Ver'
    };

    const action = actionMap[match[1].toLowerCase()];
    const subject = this.translatePermissionSubject(match[2]);
    return action ? `${action} ${subject}` : null;
  }

  private translateCodenameToSpanish(codename: string): string | null {
    if (!codename) {
      return null;
    }

    const parts = codename.split('_').filter((part) => part.length > 0);
    if (parts.length < 2) {
      return codename.replace(/_/g, ' ');
    }

    const actionMap: Record<string, string> = {
      add: 'Agregar',
      change: 'Editar',
      delete: 'Eliminar',
      view: 'Ver'
    };

    const action = actionMap[parts[0].toLowerCase()];
    const subjectRaw = parts.slice(1).join(' ');
    const subject = this.translatePermissionSubject(subjectRaw);
    return action ? `${action} ${subject}` : codename.replace(/_/g, ' ');
  }

  private translatePermissionSubject(rawSubject: string): string {
    const subject = rawSubject.trim().toLowerCase();
    const dictionary: Record<string, string> = {
      'log entry': 'registro de log',
      logentry: 'registro de log',
      user: 'usuario',
      users: 'usuarios',
      group: 'grupo',
      groups: 'grupos',
      permission: 'permiso',
      permissions: 'permisos',
      session: 'sesion',
      sessions: 'sesiones',
      'content type': 'tipo de contenido',
      contenttype: 'tipo de contenido'
    };

    return dictionary[subject] ?? subject;
  }
}

