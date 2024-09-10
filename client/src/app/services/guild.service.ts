import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, map, merge, Observable, shareReplay, switchMap, tap} from "rxjs";
import {ApiGuildsResponseItem, DiscordService} from "./discord.service";
import {ApiService} from "./api.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class GuildService {
  readonly guilds$: Observable<ApiGuildsResponseItem[]> = merge(
    this.discordService.getGuilds().pipe(
      shareReplay(1),
    ),
    this.authService.logout$.pipe(map(() => [])),
  );

  constructor(private discordService: DiscordService, private authService: AuthService) {
  }

}
