import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./guards/auth.guard";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {LandingComponent} from './components/landing/landing.component';
import {AuthRedirectGuard} from './guards/auth-redirect.guard';
import {RedirectComponent} from './components/redirect/redirect.component';

const routes: Routes = [
  {path: 'auth', canActivate: [AuthRedirectGuard], component: RedirectComponent},
  {
    path: '', component: LandingComponent, children: [
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
