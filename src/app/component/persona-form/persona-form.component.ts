import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PersonaService } from '../../service/persona.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-persona-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './persona-form.component.html',
  styleUrls: ['./persona-form.component.css']
})
export class PersonaFormComponent {

  personaForm: FormGroup;
  static personaForm: any;

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService,
    private router: Router
  ) {
    // Inicializamos el formGroup
    this.personaForm = this.fb.group({
      dni: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cellphone: [''],
      email: [''],
      adress: ['']
    });
  }

 

  submit() {
    if (this.personaForm.valid) {
      // Aseguramos que personaForm nunca es undefined con !
      this.personaService.createPersona(this.personaForm!.value).subscribe(() => {
        alert('Persona creada con éxito');
        this.router.navigate(['']);
        window.location.reload();
      });
    } else {
      alert('Complete los campos obligatorios');
    }
  }
}
