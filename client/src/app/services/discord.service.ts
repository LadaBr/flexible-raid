import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {TokenService} from "./token.service";
import {shareReplay} from "rxjs";
import {environment} from "../../environments/environment";
import {DiscordGuildMember, DiscordUser} from "../../../../shared/types";

export interface ApiGuildsResponseItem {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

export type ApiGuildsResponse = ApiGuildsResponseItem[];

@Injectable({
  providedIn: 'root'
})
export class DiscordService {

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {
  }

  private static endpoint(endpoint: string) {
    return `${environment.discord.api.baseUrl}v${environment.discord.api.version}/${endpoint}`;
  }

  private static imageUrl(endpoint: string) {
    return `${environment.discord.api.imageBaseUrl}${endpoint}`;
  }

  get authorized() {
    return {
      headers: {
        authorization: `${ this.tokenService.getStoredTokenType()} ${this.tokenService.getStoredToken()}`
      }
    }
  }

  getUser() {
    return this.httpClient.get<DiscordUser>(DiscordService.endpoint("users/@me"), this.authorized);
  }

  getUserAvatar(userId: string, avatarHash: string) {
    return DiscordService.imageUrl(`avatars/${userId}/${avatarHash}.png`);
  }

  getGuildMemberAvatar(guildId: string, userId: string, avatarHash: string) {
    return DiscordService.imageUrl(`guilds/${guildId}/users/${userId}/avatars/${avatarHash}.png`);
  }

  getGuildIcon(guildId: string, avatarHash: string) {
    return DiscordService.imageUrl(`icons/${guildId}/${avatarHash}.png`);
  }

  getGuilds() {
    return this.httpClient.get<ApiGuildsResponse>(DiscordService.endpoint("users/@me/guilds"), this.authorized);
  }

  getGuildMember(guildId: string) {
    return this.httpClient.get<DiscordGuildMember>(DiscordService.endpoint(`users/@me/guilds/${guildId}/member`), this.authorized);
  }
}
