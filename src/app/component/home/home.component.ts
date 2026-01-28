import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  dni: string = '';

  onDniChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dni = input.value;

    console.log('DNI ingresado:', this.dni);
  }

}
