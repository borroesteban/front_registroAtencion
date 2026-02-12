import { Routes } from '@angular/router';
import { PersonaListComponent } from './component/persona-list/persona-list.component';
import { MotivoListComponent } from './component/motivo-list/motivo-list.component';
import { HistorialListComponent } from './component/historial-list/historial-list.component';
import { HistorialFormComponent } from './component/historial-form/historial-form.component';
import { PersonaFormComponent } from './component/persona-form/persona-form.component';
import { MotivoFormComponent } from './component/motivo-form/motivo-form.component';
import { HomeComponent } from './component/home/home.component';
import { AbmComponent } from './component/abm/abm.component';


export const routes: Routes = [
{path:'inicio', component: HomeComponent},
{path : 'personas', component: PersonaListComponent},
{path : 'motivos', component: MotivoListComponent},
{path: 'historial', component: HistorialListComponent},
{path: 'nuevo-historial', component: HistorialFormComponent},
{path: 'nueva-persona', component: PersonaFormComponent },
{path: 'nuevo-motivo', component: MotivoFormComponent },
{path: 'abm',component: AbmComponent},
{path : '', redirectTo: 'inicio', pathMatch: 'full'}
];