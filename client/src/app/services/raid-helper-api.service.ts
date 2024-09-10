import { Injectable } from '@angular/core';
import {
  RaidHelperEventCreatePayload, RaidHelperEventDetailed,
  RaidHelperEventEditPayload,
  RaidHelperEvents,
  Requirements
} from "../../../../shared/types";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

const API_URL = 'https://raid-helper.dev/api';
const ENDPOINTS = {
  EDIT: API_URL + '/edit',
  CREATE: API_URL + '/create',
  EVENTS: API_URL + '/events',
  EVENT: API_URL + '/event/',
};

@Injectable({
  providedIn: 'root'
})
export class RaidHelperApiService {

  constructor(private httpClient: HttpClient) { }

  _protectedPayload(payload: any) {
    return {...payload, accessToken: environment.raidHelper.token}
  }

  createEvent(serverId: string, event: Requirements, date: Date, userId: string) {
    const dateISO = date.toISOString();
    let time = dateISO.match(/\d\d:\d\d/) as RegExpMatchArray;
    const payload: RaidHelperEventCreatePayload = {
      template: event.template,
      color: event.color,
      image: event.image,
      serverid: serverId,
      leaderid: userId,
      date: dateISO.slice(0, 10),
      time: time[0],
      channelid: event.channelId,
      title: event.name,
      description: ""
    }
    return this.httpClient.post<{eventid: string; status: string}>(ENDPOINTS.CREATE, this._protectedPayload(payload))
  }

  editEvent(serverId: string, eventId: string, edit: RaidHelperEventEditPayload["edit"]) {
    return this.httpClient.post<{eventid: string; status: string}>(ENDPOINTS.CREATE, this._protectedPayload({
      edit
    }))
  }

  getEvents(serverId: string) {
    return this.httpClient.post<RaidHelperEvents>(ENDPOINTS.EVENTS, this._protectedPayload({serverid: serverId}), {headers: {
      "Access-Control-Allow-Origin": "*"
      }});
  }

  getEvent(serverId: string, eventId: string) {
    return this.httpClient.post<RaidHelperEventDetailed>(ENDPOINTS.EVENT + "/" + eventId, this._protectedPayload({}));
  }

}
