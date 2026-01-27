import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MotivoService } from '../../service/motivo.service';
import { PersonaService } from '../../service/persona.service';
import { HistorialService } from '../../service/historial.service';
import { Motivo } from '../../motivo';
import { Persona } from '../../Persona';
import { Historial } from '../../historial';
import { ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-historial-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, RouterLink, RouterLink],
  templateUrl: './historial-form.component.html',
  styleUrl: './historial-form.component.css'
})
export class HistorialFormComponent implements OnInit{

historialForm!: FormGroup;
motivos: Motivo[] = [];
personas: Persona[] = [];

constructor(
  private fb: FormBuilder,
  private motivoService: MotivoService,
  private personaService: PersonaService,
  private historialService: HistorialService,
  private router: Router 
){}
ngOnInit(): void {
  this.historialForm = this.fb.group({
    personaId: [null, Validators.required],
    motivoId: [null, Validators.required],
    notes: ['']
  });
  this.loadMotivos();
  this.loadPersonas();

}

loadMotivos(){
  this.motivoService.getMotivoList().subscribe((data)=>{
  this.motivos=data;
  })
}

loadPersonas(){
  this.personaService.getPersonaList().subscribe((data)=>{
    this.personas=data;
  })
}

submit(): void {
  if (this.historialForm.valid) {

    const newHistorial: Historial = {
      notes: this.historialForm.value.notes,
      persona: this.personas.find(
        p => p.id === this.historialForm.value.personaId
      ) ?? null,
      motivo: this.motivos.find(
        m => m.motivoId === this.historialForm.value.motivoId
      ) ?? null
    };

    this.historialService.createHistorial(newHistorial).subscribe({
      next: () => {
      alert('Historial guardado con éxito');
      this.router.navigate(['/historial']);
    },
    error: () => {
      alert('Error al guardar el historial');
    }
  });
    } else{
          alert('por favor, complete todos los campos');
       }
    }
  }   
