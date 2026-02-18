import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PersonaService } from '../../service/persona.service';
import { PersonaFormComponent } from '../persona-form/persona-form.component';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../service/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { HistorialFormComponent } from "../historial-form/historial-form.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PersonaFormComponent, ReactiveFormsModule, LoginComponent, NavbarComponent, HistorialFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  showHistorial = false;
  isLoginModalOpen = false;
  showPersonaForm = false;

  dni!: number;
  personaEncontrada: any = null;
  errorDni!: string | number;

  personaForm!: FormGroup;
  modoEdicion = false;
  

  constructor(
    private personaService: PersonaService,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get username(): string {
    return this.auth.getUsername() ?? 'usuario';
  }

  onLogout(): void {
    this.auth.logout().subscribe(() => {
      this.closeLoginModal();
      this.router.navigate(['/inicio']);
    });
  }

  openLoginModal(): void {
    this.isLoginModalOpen = true;
  }

  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }

  onLoginSuccess(): void {
    this.closeLoginModal();
    this.auth.ensureUsername().subscribe();
  }


  irAlInicio() {
    location.reload();
  }


  ngOnInit() {
    this.personaForm = this.fb.group({
      id: [''],
      dni: [{ value: '', disabled: true }],
      firstName: [''],
      lastName: [''],
      cellphone: [''],
      email: [''],
      adress: ['']
    });

    this.auth.ensureUsername().subscribe();
  }

  openPersonaForm(){
    this.showPersonaForm = true;       
  }

  closePersonaForm(){
    this.showPersonaForm = false;       
  }

  onDniChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dni = Number(input.value);

    if(this.dni.toString().length >= 5){
      this.buscarPersona();
    }
  }

  buscarPersona() {
    this.personaService.buscarPorDni(this.dni.toString()).subscribe({
      next: (persona) => { 
        this.personaEncontrada = persona;
        this.errorDni = 0;

        // Cargar datos en el form
        this.personaForm.patchValue(persona);

        // Bloquear campos
        this.personaForm.disable();
        this.personaForm.get('dni')?.disable();

        this.modoEdicion = false;
        this.closePersonaForm();
      },
      error: () => {
        this.personaEncontrada = null;
        this.errorDni = 'Persona no encontrada';
      }
    });
  }

 activarEdicion() {
  console.log("MODO EDICION ACTIVADO"); // 👈 agregá esto
  this.modoEdicion = true;
  this.personaForm.enable();
  this.personaForm.get('dni');
}

  guardarCambios() {
    const personaActualizada = this.personaForm.getRawValue();

    this.personaService.actualizarPersona(personaActualizada.id, personaActualizada)
      .subscribe(() => {
        alert('Datos actualizados correctamente ✅');
        this.modoEdicion = false;
        this.personaForm.disable();
      });
  }
submitUser(){}

abrirHistorial() {
  if (!this.personaEncontrada) {
    return;
  }

  this.showHistorial = true;
  this.showPersonaForm = false;
  this.personaForm.disable();
}

cerrarHistorial() {
  this.showHistorial = false;
}

cancelarHistorial() {
  this.showHistorial = false;
  this.showPersonaForm = false;
  this.personaEncontrada = null;
  this.errorDni = '';
  this.modoEdicion = false;

  this.personaForm.reset({
    id: '',
    dni: { value: '', disabled: true },
    firstName: '',
    lastName: '',
    cellphone: '',
    email: '',
    adress: ''
  });

  this.router.navigate(['/inicio']);
}
}
