import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Motivo } from '../motivo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MotivoService {
  private readonly middlewareApi = `${environment.api}/api/motivos`;
  private readonly compatApi = `${environment.api}/motivos`;
  private readonly springApi = `${environment.api}/spring/api/motivos`;

  constructor(private http: HttpClient) {}

  getMotivoList(): Observable<Motivo[]> {
    return this.http.get<unknown>(this.middlewareApi).pipe(
      map((response) => this.normalizeMotivos(response)),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(`${this.middlewareApi}/`).pipe(map((response) => this.normalizeMotivos(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(this.compatApi).pipe(map((response) => this.normalizeMotivos(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(`${this.compatApi}/`).pipe(map((response) => this.normalizeMotivos(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(this.springApi).pipe(map((response) => this.normalizeMotivos(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(`${this.springApi}/`).pipe(map((response) => this.normalizeMotivos(response)))
        )
      )
    );
  }

  createMotivo(motivo: Motivo): Observable<Motivo> {
    return this.http.post<Motivo>(this.springApi, motivo);
  }

  private normalizeMotivos(payload: unknown): Motivo[] {
    const rawItems = this.extractArray(payload);
    return rawItems
      .map((item) => this.toMotivo(item))
      .filter((item): item is Motivo => item !== null);
  }

  private extractArray(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const possibleKeys = ['results', 'data', 'items', 'motivos'];
      for (const key of possibleKeys) {
        if (Array.isArray(record[key])) {
          return record[key] as unknown[];
        }
      }
    }

    return [];
  }

  private toMotivo(raw: unknown): Motivo | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const record = raw as Record<string, unknown>;
    const rawId = record['motivoId'] ?? record['id'] ?? record['pk'] ?? record['motivo_id'];
    const rawText = record['motivo'] ?? record['name'] ?? record['nombre'] ?? record['descripcion'];

    const motivo = typeof rawText === 'string' ? rawText : '';
    if (!motivo) {
      return null;
    }

    let motivoId: number | undefined;
    if (typeof rawId === 'number' && Number.isFinite(rawId)) {
      motivoId = rawId;
    } else if (typeof rawId === 'string' && rawId.trim()) {
      const parsed = Number(rawId);
      if (Number.isFinite(parsed)) {
        motivoId = parsed;
      }
    }

    return { motivoId, motivo };
  }

  private fallbackIfRecoverable<T>(error: unknown, fallback: () => Observable<T>): Observable<T> {
    const status = this.getStatusCode(error);
    if (status === 0 || status === 401 || status === 403 || status === 404) {
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
}
