import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {catchError, map, Observable, of, switchMap, tap} from 'rxjs';
import {AuthService, REDIRECT_URL} from "../services/auth.service";
import {TokenService} from "../services/token.service";

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router, private tokenService: TokenService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const code = route.queryParamMap.get('code');
    if (!code) {
      this.router.navigate(['/']);
      return false;
    }
    return this.auth.getToken(code).pipe(
      tap(v => this.tokenService.setToken(v)),
      tap(() => this.router.navigate([localStorage.getItem(REDIRECT_URL) || "/"])),
      map(() => true),
      catchError(() => of(false))
    );
  }

}
