import { Component } from '@angular/core';
import { PersonaListComponent } from '../persona-list/persona-list.component';
import { MotivoListComponent } from '../motivo-list/motivo-list.component';
import { HistorialListComponent } from '../historial-list/historial-list.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

// Importaciones corregidas para evitar errores de tipos

@Component({
  selector: 'app-abm',
  standalone: true,
  imports: [NavbarComponent, PersonaListComponent, CommonModule, MotivoListComponent, HistorialListComponent],
  templateUrl: './abm.component.html',
  styleUrl: './abm.component.css'
})


export class AbmComponent {
  motivoList = false;
  historialList = false;
  personaList = false;
 

  showPersonaList() {
    this.personaList = true;
    this.motivoList = false;
    this.historialList = false;
  }

  showHistorialList() {
    this.historialList = true;
    this.personaList = false;
    this.motivoList = false;
  }

  showMotivoList() {
    this.motivoList = true;
    this.historialList = false;
    this.personaList = false;
  }
}
