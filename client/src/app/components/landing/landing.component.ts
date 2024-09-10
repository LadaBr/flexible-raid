import { Component, OnInit } from '@angular/core';
import {environment} from "../../../environments/environment";
import {DiscordService} from "../../services/discord.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

}
