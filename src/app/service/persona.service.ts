import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Persona } from '../Persona';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private api : string = environment.api + '/spring/api/personas';
  
/*'http://10.0.0.155:8000/spring/api/personas'*/ 
/* http://localhost:8080/api/personas */
/*${this.baseUrl}/spring/api/personas/dni/${dni}*/ 

  constructor(private http:HttpClient) { }

  //getPersonaList() conecta a la api y obtiene lista de personas
  //la clase observable es un patron de diseño asincrónico
  getPersonaList():Observable<Persona []>{
    return this.http.get<Persona[]>(this.api);

    
  }
  createPersona(persona: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.api, persona);
  }

  buscarPorDni(dni:string):Observable<any>{
    return this.http.get(`${this.api}/dni/${dni}`);
  }

actualizarPersona(id: number, persona: any) {
  return this.http.put(`${this.api}`, persona);
}
}
