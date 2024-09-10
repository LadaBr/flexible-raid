import { Injectable } from '@angular/core';
import {ApiService, DiscordTokenResponse} from "./api.service";
import {catchError, EMPTY, of, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  static readonly LOCAL_STORAGE_TOKEN_KEY = 'discord_token';
  static readonly LOCAL_STORAGE_REFRESH_TOKEN_KEY = 'discord_refresh_token';
  static readonly LOCAL_STORAGE_EXPIRES_IN = 'discord_expires_in';
  static readonly LOCAL_STORAGE_TOKEN_TYPE = 'discord_token_type';

  constructor() { }

  getStoredToken() {
    return localStorage.getItem(TokenService.LOCAL_STORAGE_TOKEN_KEY);
  }

  getStoredTokenType() {
    return localStorage.getItem(TokenService.LOCAL_STORAGE_TOKEN_TYPE);
  }

  setToken(response: DiscordTokenResponse) {
    console.log("SET TOKEN", response);
    localStorage.setItem(TokenService.LOCAL_STORAGE_TOKEN_KEY, response.access_token);
    localStorage.setItem(TokenService.LOCAL_STORAGE_REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(TokenService.LOCAL_STORAGE_TOKEN_TYPE, response.token_type);
    localStorage.setItem(TokenService.LOCAL_STORAGE_EXPIRES_IN, (new Date().getTime() + (response.expires_in * 1000)).toString());
  }

  getStoredRefreshToken() {
    return localStorage.getItem(TokenService.LOCAL_STORAGE_REFRESH_TOKEN_KEY) as string;
  }

  isExpired(): boolean {
    const date = parseInt(localStorage.getItem(TokenService.LOCAL_STORAGE_EXPIRES_IN) as string);
    return !date || date < new Date().getTime();
  }

  removeToken() {
    localStorage.removeItem(TokenService.LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(TokenService.LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(TokenService.LOCAL_STORAGE_EXPIRES_IN);
    localStorage.removeItem(TokenService.LOCAL_STORAGE_TOKEN_TYPE);
  }
}
