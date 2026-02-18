import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MotivoService } from '../../service/motivo.service';
import { PersonaService } from '../../service/persona.service';
import { HistorialService } from '../../service/historial.service';
import { Motivo } from '../../motivo';
import { Persona } from '../../Persona';
import { Historial } from '../../historial';
import { ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-historial-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf],
  templateUrl: './historial-form.component.html',
  styleUrl: './historial-form.component.css'
})
export class HistorialFormComponent implements OnInit, OnChanges {

@Input() personaPreseleccionada: Persona | null = null;
@Output() guardadoExitoso = new EventEmitter<void>();

historialForm!: FormGroup;
motivos: Motivo[] = [];
personas: Persona[] = [];

constructor(
  private fb: FormBuilder,
  private motivoService: MotivoService,
  private personaService: PersonaService,
  private historialService: HistorialService,
  private router: Router
) {}

ngOnInit(): void {
  this.historialForm = this.fb.group({
    personaId: [null, Validators.required],
    motivoId: [null, Validators.required],
    notes: ['']
  });

  this.preseleccionarPersona();
  this.loadMotivos();
  this.loadPersonas();
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['personaPreseleccionada']) {
    this.preseleccionarPersona();
  }
}

loadMotivos(){
  this.motivoService.getMotivoList().subscribe((data)=>{
  this.motivos=data;
  })
}

loadPersonas(){
  this.personaService.getPersonaList().subscribe((data)=>{
    this.personas=data;
    this.preseleccionarPersona();
  })
}

private preseleccionarPersona(): void {
  const personaId = this.personaPreseleccionada?.id ?? null;
  if (!this.historialForm || personaId === null) {
    return;
  }

  this.historialForm.patchValue({ personaId });
}

submit(): void {
  if (this.historialForm.valid) {
    const personaSeleccionada = this.personas.find(
      p => p.id === this.historialForm.value.personaId
    ) ?? this.personaPreseleccionada ?? null;

    const newHistorial: Historial = {
      notes: this.historialForm.value.notes,
      persona: personaSeleccionada,
      motivo: this.motivos.find(
        m => m.motivoId === this.historialForm.value.motivoId
      ) ?? null
    };

    this.historialService.createHistorial(newHistorial).subscribe({
      next: () => {
      alert('Historial guardado con éxito');
      this.guardadoExitoso.emit();
      this.router.navigate(['/inicio']);
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
