import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import {AuthGuardService} from './services/auth-guard.service'

export const appRoutes: Routes = [
    {path:'', component: HomeComponent, canActivate:[AuthGuardService]},
    {path:'register', component: RegisterComponent},
    {path:'login', component: LoginComponent},
];