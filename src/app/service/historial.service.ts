import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Historial } from '../historial';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private api : string = environment.api + '/spring/api/historial';

  constructor(private http:HttpClient) { }
  getHistorialList():Observable<Historial []>{
    return this.http.get<Historial[]>(this.api);
  }
  createHistorial(historial: Historial):Observable<Historial>{
    return this.http.post<Historial>(`${this.api}`, historial);
  }
}
