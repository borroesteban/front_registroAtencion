import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Motivo } from '../motivo';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MotivoService {

  private api : string = environment.api + '/spring/api/motivos';

  constructor(private http:HttpClient) { }
  //getMotivoList() conecta a la api y obtiene lista de motivos
    //la clase observable es un patron de diseño asincrónico
    getMotivoList():Observable<Motivo []>{
      return this.http.get<Motivo[]>(this.api);
  }
    createMotivo(motivo: Motivo): Observable<Motivo> {
    return this.http.post<Motivo>(this.api, motivo);
    }
}
