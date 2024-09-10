import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {HttpClient, HttpParams} from "@angular/common/http";
import {
  AttendanceItem,
  CalendarConfig,
  Class,
  RaidHelperEventDetailed, RaidHelperEventEditPayload,
  RaidHelperEvents
} from "../../../../shared/types";
import {TokenService} from "./token.service";

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export type ApiAttendancePayload = Omit<AttendanceItem, 'nickname'>;

const API_URL = environment.api.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  get baseUrl() {
    return API_URL;
  }

  get authorized() {
    return {
      headers: {
        authorization: `${ this.tokenService.getStoredTokenType()} ${this.tokenService.getStoredToken()}`
      }
    }
  }

  constructor(private httpClient: HttpClient, private tokenService: TokenService) { }

  private _apiUrl(endpoint: string) {
    return `${this.baseUrl}/${endpoint}`;
  }

  getEndpoint(url: string, params: Record<string, any> = {}) {
    const httpParams = new HttpParams({fromObject: params}).toString();
    return `${this.baseUrl}/${url}${httpParams.length ? "?" + httpParams : ""}`;
  }


  getProtectedEndpoint(url: string, params: Record<string, any> = {}) {
    return this.getEndpoint(`protected/${url}`, params);
  }

  getServers(serverIds: string[]) {
    return this.httpClient.get<CalendarConfig[]>(this.getEndpoint("configs", {"server_id": serverIds}));
  }

  getAttendance(serverId: string) {
    return this.httpClient.get<AttendanceItem[]>(this.getEndpoint(`attendance/${serverId}`));
  }

  getClasses() {
    return this.httpClient.get<Class[]>(this.getEndpoint("classes"));
  }

  getAuthToken(code: string, redirectUri: string) {
    return this.httpClient.get<DiscordTokenResponse>(this._apiUrl("discord/token"), {params: {code, redirect_uri: redirectUri}});
  }

  getAuthRefreshToken(refreshToken: string) {
    return this.httpClient.get<DiscordTokenResponse>(this._apiUrl("discord/token/refresh"), {params: {refresh_token: refreshToken}});
  }

  setHour(payload: ApiAttendancePayload) {
    return this.httpClient.post<AttendanceItem>(this.getProtectedEndpoint(`attendance`), payload, this.authorized);
  }

  removeHour(serverId: string, userId: string, day: number, hour: number) {
    return this.httpClient.delete<AttendanceItem>(this.getProtectedEndpoint(`attendance`), {
      ...this.authorized,
      body: {
        serverId,
        userId,
        day,
        hour
      }
    });
  }

  createEvent(serverId: string, date: Date, eventId: string, duration?: number) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return this.httpClient.post<{eventid: string; status: string}>(this.getProtectedEndpoint(`events/create`), {
      serverId,
      date,
      eventId,
      duration
    }, this.authorized);
  }

  editEvent(serverId: string, eventId: string, payload: RaidHelperEventEditPayload["edit"]) {
    return this.httpClient.post<AttendanceItem>(this.getProtectedEndpoint(`events/edit`), {
      serverid: serverId,
      eventid: eventId,
      edit: payload,
    }, this.authorized);
  }

  getEvents(serverId: string) {
    return this.httpClient.get<RaidHelperEvents>(this.getEndpoint(`events/${serverId}`));
  }

  getEvent(serverId: string, eventId: string) {
    return this.httpClient.get<RaidHelperEventDetailed>(this.getEndpoint(`events/${serverId}/${eventId}`));
  }
}
