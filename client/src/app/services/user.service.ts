import {Injectable} from '@angular/core';
import {DiscordService} from "./discord.service";
import {map, merge, Observable, shareReplay} from "rxjs";
import {AuthService} from "./auth.service";
import {DiscordUser} from "../../../../shared/types";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly user$: Observable<DiscordUser | undefined> = merge(
    this.discordService.getUser().pipe(
      shareReplay(1)
    ),
    this.authService.logout$.pipe(map(() => undefined))
  );

  readonly avatar$ = this.user$.pipe(
    map(user => user ? this.discordService.getUserAvatar(user.id, user.avatar || user.discriminator) : undefined),
    shareReplay(1),
  );

  constructor(private discordService: DiscordService, private authService: AuthService) {
  }
}
