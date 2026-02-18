import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DeleteUserResponse,
  NewPermissionPayload,
  NewRolePayload,
  PermissionItem,
  RegistrationRequest,
  RegistrationRequestPayload,
  RoleItem,
  UserDetailResponse,
  UserItem
} from '../admin-access.models';

@Injectable({
  providedIn: 'root'
})
export class AdminAccessService {
  private readonly middlewareApi = `${environment.api}/api`;
  private readonly gatewayApi = `${environment.api}/spring/api`;
  private readonly publicRegisterApi = `${environment.api}/register/`;
  private readonly middlewareRegisterRequest = `${this.middlewareApi}/register-request`;
  private readonly middlewareRegisterRequests = `${this.middlewareApi}/register-requests`;
  private readonly middlewareSolicitudes = `${this.middlewareApi}/solicitudes`;
  private readonly compatSolicitudes = `${environment.api}/solicitudes`;
  private readonly middlewareUsers = `${this.middlewareApi}/users`;
  private readonly middlewareRoles = `${this.middlewareApi}/roles`;
  private readonly middlewarePermissions = `${this.middlewareApi}/permissions`;
  private readonly gatewayRegisterRequest = `${this.gatewayApi}/register-request`;
  private readonly gatewayRegisterRequests = `${this.gatewayApi}/register-requests`;
  private readonly gatewayUsers = `${this.gatewayApi}/users`;
  private readonly gatewayRoles = `${this.gatewayApi}/roles`;
  private readonly gatewayPermissions = `${this.gatewayApi}/permissions`;

  constructor(private http: HttpClient) {}

  submitRegistrationRequest(payload: RegistrationRequestPayload): Observable<RegistrationRequest> {
    return this.http
      .post<RegistrationRequest>(this.publicRegisterApi, payload)
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.postWithOptionalSlash<RegistrationRequest>(this.middlewareRegisterRequest, payload)
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash<RegistrationRequest>(this.middlewareRegisterRequests, payload)
      )))
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.postWithOptionalSlash<RegistrationRequest>(this.gatewayRegisterRequest, payload)
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash<RegistrationRequest>(this.gatewayRegisterRequests, payload)
      )));
  }

  getRegistrationRequests(): Observable<RegistrationRequest[]> {
    return this.getArrayWithOptionalSlash<RegistrationRequest>(this.middlewareRegisterRequest, [
      'results',
      'data',
      'items',
      'requests',
      'solicitudes'
    ])
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(`${this.middlewareRegisterRequest}/`, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(this.middlewareRegisterRequests, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(`${this.middlewareRegisterRequests}/`, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(this.middlewareSolicitudes, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(this.compatSolicitudes, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(this.gatewayRegisterRequest, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.getArrayWithOptionalSlash<RegistrationRequest>(this.gatewayRegisterRequests, [
          'results',
          'data',
          'items',
          'requests',
          'solicitudes'
        ])
      )));
  }

  approveRegistrationRequest(requestId: number): Observable<unknown> {
    return this.postWithOptionalSlash(`${this.middlewareRegisterRequest}/${requestId}/approve`, {})
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.middlewareRegisterRequests}/${requestId}/approve`, {})
      )))
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.gatewayRegisterRequest}/${requestId}/approve`, {})
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.gatewayRegisterRequests}/${requestId}/approve`, {})
      )));
  }

  rejectRegistrationRequest(requestId: number): Observable<unknown> {
    return this.postWithOptionalSlash(`${this.middlewareRegisterRequest}/${requestId}/reject`, {})
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.middlewareRegisterRequests}/${requestId}/reject`, {})
      )))
      .pipe(catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.gatewayRegisterRequest}/${requestId}/reject`, {})
      )))
      .pipe(catchError((error) => this.fallbackToPluralIfNotFound(error, () =>
        this.postWithOptionalSlash(`${this.gatewayRegisterRequests}/${requestId}/reject`, {})
      )));
  }

  getUsers(): Observable<UserItem[]> {
    return this.getArrayWithOptionalSlash<UserItem>(this.middlewareUsers, ['results', 'data', 'items', 'users']).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(error, () =>
          this.getArrayWithOptionalSlash<UserItem>(this.gatewayUsers, ['results', 'data', 'items', 'users'])
        )
      )
    );
  }

  getRoles(): Observable<RoleItem[]> {
    return this.getArrayWithOptionalSlash<RoleItem>(this.middlewareRoles, ['results', 'data', 'items', 'roles']).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(error, () =>
          this.getArrayWithOptionalSlash<RoleItem>(this.gatewayRoles, ['results', 'data', 'items', 'roles'])
        )
      )
    );
  }

  createRole(payload: NewRolePayload): Observable<RoleItem> {
    return this.postWithOptionalSlash<RoleItem>(this.middlewareRoles, payload).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(error, () => this.postWithOptionalSlash<RoleItem>(this.gatewayRoles, payload))
      )
    );
  }

  getPermissions(): Observable<PermissionItem[]> {
    return this.getArrayWithOptionalSlash<PermissionItem>(this.middlewarePermissions, [
      'results',
      'data',
      'items',
      'permissions',
      'permisos'
    ]).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () =>
            this.getArrayWithOptionalSlash<PermissionItem>(this.gatewayPermissions, [
              'results',
              'data',
              'items',
              'permissions',
              'permisos'
            ])
        )
      )
    );
  }

  createPermission(payload: NewPermissionPayload): Observable<PermissionItem> {
    return this.postWithOptionalSlash<PermissionItem>(this.middlewarePermissions, payload).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.postWithOptionalSlash<PermissionItem>(this.gatewayPermissions, payload)
        )
      )
    );
  }

  assignRoleToUser(userId: number, roleId: number): Observable<unknown> {
    return this.postWithOptionalSlash(`${this.middlewareUsers}/${userId}/roles`, { roleId }).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.postWithOptionalSlash(`${this.gatewayUsers}/${userId}/roles`, { roleId })
        )
      )
    );
  }

  removeRoleFromUser(userId: number, roleId: number): Observable<unknown> {
    return this.deleteWithOptionalSlash(`${this.middlewareUsers}/${userId}/roles/${roleId}`).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.deleteWithOptionalSlash(`${this.gatewayUsers}/${userId}/roles/${roleId}`)
        )
      )
    );
  }

  assignPermissionToUser(userId: number, permissionId: number): Observable<unknown> {
    return this.postWithOptionalSlash(`${this.middlewareUsers}/${userId}/permissions`, { permissionId }).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.postWithOptionalSlash(`${this.gatewayUsers}/${userId}/permissions`, { permissionId })
        )
      )
    );
  }

  removePermissionFromUser(userId: number, permissionId: number): Observable<unknown> {
    return this.deleteWithOptionalSlash(`${this.middlewareUsers}/${userId}/permissions/${permissionId}`).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.deleteWithOptionalSlash(`${this.gatewayUsers}/${userId}/permissions/${permissionId}`)
        )
      )
    );
  }

  assignPermissionToRole(roleId: number, permissionId: number): Observable<unknown> {
    return this.postWithOptionalSlash(`${this.middlewareRoles}/${roleId}/permissions`, { permissionId }).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.postWithOptionalSlash(`${this.gatewayRoles}/${roleId}/permissions`, { permissionId })
        )
      )
    );
  }

  removePermissionFromRole(roleId: number, permissionId: number): Observable<unknown> {
    return this.deleteWithOptionalSlash(`${this.middlewareRoles}/${roleId}/permissions/${permissionId}`).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.deleteWithOptionalSlash(`${this.gatewayRoles}/${roleId}/permissions/${permissionId}`)
        )
      )
    );
  }

  getUserById(userId: number): Observable<UserDetailResponse> {
    return this.getWithOptionalSlash<UserDetailResponse>(`${this.middlewareUsers}/${userId}`).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.getWithOptionalSlash<UserDetailResponse>(`${this.gatewayUsers}/${userId}`)
        )
      )
    );
  }

  deleteUser(userId: number): Observable<DeleteUserResponse> {
    return this.deleteWithOptionalSlash<DeleteUserResponse>(`${this.middlewareUsers}/${userId}`).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(
          error,
          () => this.deleteWithOptionalSlash<DeleteUserResponse>(`${this.gatewayUsers}/${userId}`)
        )
      )
    );
  }

  private getWithOptionalSlash<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(endpoint).pipe(
      catchError((error) => this.fallbackToSingularIfNotFound(error, () => this.http.get<T>(`${endpoint}/`)))
    );
  }

  private getArrayWithOptionalSlash<T>(endpoint: string, arrayKeys: string[]): Observable<T[]> {
    return this.http.get<unknown>(endpoint).pipe(
      map<unknown, T[]>((response) => this.extractArrayOrThrow<T>(response, arrayKeys, endpoint)),
      catchError((error) => this.fallbackToSingularIfNotFound(error, () =>
        this.http.get<unknown>(`${endpoint}/`).pipe(
          map<unknown, T[]>((response) => this.extractArrayOrThrow<T>(response, arrayKeys, `${endpoint}/`))
        )
      ))
    );
  }

  private postWithOptionalSlash<T>(endpoint: string, payload: unknown): Observable<T> {
    return this.http.post<T>(endpoint, payload).pipe(
      catchError((error) =>
        this.fallbackToSingularIfNotFound(error, () => this.http.post<T>(`${endpoint}/`, payload))
      )
    );
  }

  private deleteWithOptionalSlash<T = unknown>(endpoint: string): Observable<T> {
    return this.http.delete<T>(endpoint).pipe(
      catchError((error) => this.fallbackToSingularIfNotFound(error, () => this.http.delete<T>(`${endpoint}/`)))
    );
  }

  private fallbackToPluralIfNotFound<T>(error: unknown, fallback: () => Observable<T>): Observable<T> {
    if (this.getStatusCode(error) === 404) {
      return fallback();
    }
    return throwError(() => error);
  }

  private fallbackToSingularIfNotFound<T>(error: unknown, fallback: () => Observable<T>): Observable<T> {
    if (this.getStatusCode(error) === 404) {
      return fallback();
    }
    return throwError(() => error);
  }

  private getStatusCode(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }
    const maybeError = error as Record<string, unknown>;
    const status = maybeError['status'];
    return typeof status === 'number' ? status : null;
  }

  private extractArrayOrThrow<T>(payload: unknown, arrayKeys: string[], endpoint: string): T[] {
    if (Array.isArray(payload)) {
      return payload as T[];
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      for (const key of arrayKeys) {
        if (Array.isArray(record[key])) {
          return record[key] as T[];
        }
      }
    }

    if (typeof payload === 'string' && payload.toLowerCase().includes('<!doctype html')) {
      throw { status: 404, error: `Respuesta HTML en ${endpoint}` };
    }

    throw { status: 422, error: `Formato de respuesta invalido en ${endpoint}` };
  }
}
