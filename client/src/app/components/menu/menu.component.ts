import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {CalendarService, GuildWithConfig} from "../../services/calendar.service";
import {UserService} from "../../services/user.service";
import {faRightToBracket, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {environment} from "../../../environments/environment";
import {DiscordService} from "../../services/discord.service";
import {filter, map, merge, withLatestFrom} from "rxjs";
import {DiscordUser} from "../../../../../shared/types";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  addToServerUrl = `https://discord.com/api/oauth2/authorize?client_id=${environment.discord.clientId}&permissions=526133873728&scope=bot`;
  faRightToBracket = faRightToBracket;
  faRightFromBracket = faRightFromBracket;
  faPlus = faPlus;

  nickname$ = merge(
    this.userService.user$.pipe(map(u => u?.username)),
    this.calendarService.selectedCalendarGuildMember$.pipe(map(m => m?.nick), filter(v => !!v))
  );

  avatar$ = merge(
    this.userService.user$.pipe(map(u => u?.avatar)),
    this.calendarService.selectedCalendarGuildMember$.pipe(
      map(m => m?.avatar),
      withLatestFrom(this.userService.user$, this.calendarService.selectedCalendarGuild$),
      filter(([avatar, _, guild])  => !!avatar && !!guild),
      map((v)  => v as [string, DiscordUser, GuildWithConfig]),
      map(([avatar, user, guild]) => this.discordService.getGuildMemberAvatar(guild.id, user.id, avatar)),
    )
  );

  noGuild$ = this.calendarService.selectedCalendarGuild$.pipe(
    map(v => v === null)
  );

  constructor(
    public authService: AuthService,
    public calendarService: CalendarService,
    public userService: UserService,
    public discordService: DiscordService
  ) {
  }

  ngOnInit(): void {
  }

}
