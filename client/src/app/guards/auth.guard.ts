import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {AuthService, REDIRECT_URL} from "../services/auth.service";
import {TokenService} from "../services/token.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router, private tokenService: TokenService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.auth.isAuthorized) {
      localStorage.setItem(REDIRECT_URL, state.url);
      this.auth.login();
      return false;
    }
    if (this.tokenService.isExpired()) {
      return this.auth.refreshToken().pipe(
        map(() => true),
        catchError(() => of(false).pipe(tap(() => this.auth.logout()))),
      );
    }
    return true;
  }

}
