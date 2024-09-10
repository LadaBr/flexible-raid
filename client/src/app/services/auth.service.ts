import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, Subject, tap} from "rxjs";
import {Router} from "@angular/router";
import {TokenService} from "./token.service";
import { ApiService } from './api.service';

export interface ApiUserLoginResponse {
  id: number;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
  permissions: string[];
}

export interface ApiUserLoginPayload {
  username: string,
  password: string
}

export const REDIRECT_URL = "REDIRECT_URL";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly logoutSubject$ = new Subject<void>();
  readonly logout$ = this.logoutSubject$.asObservable();

  redirectUrl: string = "/";

  get isAuthorized(): boolean {
    return !!this.tokenService.getStoredToken();
  }

  constructor(
    private tokenService: TokenService,
    private apiService: ApiService,
    private router: Router,
  ) {
  }

  get oauth_redirect(): string {
    const parsedUrl = new URL(window.location.href);
    return parsedUrl.origin + "/auth";
  }

  login() {
    location.href = this.apiService.getEndpoint("discord/auth", {redirect_uri: this.oauth_redirect})
  }
  getToken(code: string): Observable<any> {
    return this.apiService.getAuthToken(code, this.oauth_redirect);
  }

  logout(): void {
    this.tokenService.removeToken();
    this.logoutSubject$.next();
    this.router.navigate(['/']);
  }


  refreshToken() {
    return this.apiService.getAuthRefreshToken(this.tokenService.getStoredRefreshToken()).pipe(
      tap(v => this.tokenService.setToken(v)),
    );
  }

}
