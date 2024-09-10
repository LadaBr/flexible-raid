import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {faLock, faPeopleGroup, faPlus } from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs';
import {CalendarService} from "../../services/calendar.service";
import {UserService} from "../../services/user.service";
import {getClassImage, getClassSpecImage} from "../spec-selector/spec-selector.component";
import {RaidHelperEventDetailed, RaidHelperSignUp} from "../../../../../shared/types";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {




  constructor(public calendarService: CalendarService, public user: UserService) {
  }

  ngOnInit(): void {
  }


}
