import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Persona } from '../Persona';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private readonly middlewareApi = `${environment.api}/api/personas`;
  private readonly springApi = `${environment.api}/spring/api/personas`;

  constructor(private http: HttpClient) {}

  getPersonaList(): Observable<Persona[]> {
    return this.http.get<unknown>(this.middlewareApi).pipe(
      map((response) => this.normalizePersonaArray(response)),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http
            .get<unknown>(`${this.middlewareApi}/`)
            .pipe(map((response) => this.normalizePersonaArray(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(this.springApi).pipe(map((response) => this.normalizePersonaArray(response)))
        )
      ),
      catchError((error) =>
        this.fallbackIfRecoverable(error, () =>
          this.http.get<unknown>(`${this.springApi}/`).pipe(map((response) => this.normalizePersonaArray(response)))
        )
      )
    );
  }

  createPersona(persona: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.springApi, persona);
  }

  buscarPorDni(dni: string): Observable<any> {
    return this.http.get(`${this.springApi}/dni/${dni}`).pipe(
      catchError((error) =>
        this.fallbackIfRecoverable(error, () => this.http.get(`${this.middlewareApi}/dni/${dni}`))
      )
    );
  }

  actualizarPersona(id: number, persona: Persona): Observable<unknown> {
    return this.http.put(`${this.springApi}`, persona).pipe(
      catchError((error) =>
        this.fallbackIfRecoverable(error, () => this.http.put(`${this.middlewareApi}/${id}`, persona))
      )
    );
  }

  private normalizePersonaArray(payload: unknown): Persona[] {
    if (Array.isArray(payload)) {
      return payload as Persona[];
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const possibleKeys = ['results', 'data', 'items', 'personas'];
      for (const key of possibleKeys) {
        if (Array.isArray(record[key])) {
          return record[key] as Persona[];
        }
      }
    }

    return [];
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
