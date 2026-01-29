import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PersonaService } from '../../service/persona.service';
import { subscribe } from 'diagnostics_channel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  dni: string = '';
  personaEncontrada: any = null;
  errorDni: string = '';
  constructor(private personaService: PersonaService){}

  onDniChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dni = input.value;

    if(this.dni.length >=5){
      this.buscarPersona();
    }
    
    console.log('DNI ingresado:', this.dni);
  }

  buscarPersona() {
  this.personaService.buscarPorDni(this.dni).subscribe({
    next:(persona) => { 
      this.personaEncontrada = persona;
      this.errorDni = '';
      console.log('Persona encontrada:', persona);
    },
    error: () => {
      this.personaEncontrada = null;
      this.errorDni = 'Persona no encontrada';
    }
  });
}
}

