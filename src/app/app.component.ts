import { Component } from '@angular/core';
import { PersonaListComponent } from './component/persona-list/persona-list.component';
import { MotivoListComponent } from './component/motivo-list/motivo-list.component';
import { RouterOutlet, RouterLink } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: 
  `



    <hr>

    <router-outlet></router-outlet>
  `
})
export class AppComponent {}

//selector: 'app-root',
//selector: 'app-persona-list'
