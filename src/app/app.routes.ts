import { Routes } from '@angular/router';
import { PersonaListComponent } from './component/persona-list/persona-list.component';
import { MotivoListComponent } from './component/motivo-list/motivo-list.component';
import { HistorialListComponent } from './component/historial-list/historial-list.component';
import { HistorialFormComponent } from './component/historial-form/historial-form.component';
import { PersonaFormComponent } from './component/persona-form/persona-form.component';
import { MotivoFormComponent } from './component/motivo-form/motivo-form.component';
import { HomeComponent } from './component/home/home.component';
import { AbmComponent } from './component/abm/abm.component';
import { PanelAdminComponent } from './component/panel-admin/panel-admin.component';
import { RegisterRequestComponent } from './component/register-request/register-request.component';
import { authGuard } from './auth.guard';


export const routes: Routes = [
{path:'inicio', component: HomeComponent},
{path : 'personas', component: PersonaListComponent, canActivate: [authGuard]},
{path : 'motivos', component: MotivoListComponent, canActivate: [authGuard]},
{path: 'historial', component: HistorialListComponent, canActivate: [authGuard]},
{path: 'nuevo-historial', component: HistorialFormComponent, canActivate: [authGuard]},
{path: 'nueva-persona', component: PersonaFormComponent, canActivate: [authGuard]},
{path: 'nuevo-motivo', component: MotivoFormComponent, canActivate: [authGuard]},
{path: 'registro-usuario', component: RegisterRequestComponent},
{path: 'abm', component: PanelAdminComponent, canActivate: [authGuard]},
{path: 'abm-legacy', component: AbmComponent, canActivate: [authGuard]},
{path: 'panel-visitas', component: AbmComponent, canActivate: [authGuard]},
{path: 'panel-admin', component: PanelAdminComponent, canActivate: [authGuard]},
{path : '', redirectTo: 'inicio', pathMatch: 'full'}
];
