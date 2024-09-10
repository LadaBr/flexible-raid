import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from '@angular/core';
import {
  AttendanceItem,
  CalendarConfig,
  DiscordUser,
  RaidHelperEventDetailed,
  RaidHelperEvents
} from "../../../../../shared/types";
import {getClassImage, getClassSpecImage, SpecSelectorComponent} from "../spec-selector/spec-selector.component";
import {CalendarService} from "../../services/calendar.service";
import {map, tap} from "rxjs";



@Component({
  selector: 'app-calendar-item',
  templateUrl: './calendar-item.component.html',
  styleUrls: ['./calendar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarItemComponent implements OnInit {
  @Input() day!: number;
  @Input() hour!: number;
  @Input() user?: DiscordUser | null;
  @Input() events: RaidHelperEventDetailed[] | null = [];
  @Input() showRole?: boolean | null;
  @Input() config!: CalendarConfig;
  @HostBinding('class.locked') @Input() locked?: boolean | null;
  @Input() attendance?: Map<string, AttendanceItem> | null;



  get roles(): Map<string, AttendanceItem[]> {
    const acc = new Map([
      ['tank', []],
      ['healer', []],
      ['dmg', []],
    ]) as Map<string, AttendanceItem[]>;
    return this.attendance ? [...this.attendance.values()].reduce((acc, v) => {
      const role = acc.get(v.role);
      if (role) {
        role.push(v);
      }
      return acc;
    }, acc) : acc;
  }

  get userInfo() {
    return this.user ? this.attendance?.get(this.user.id) : undefined;
  }

  get classImage() {
    return this.userInfo ? getClassImage(this.userInfo.classSlug) : undefined;
  }

  get specImage() {
    return this.userInfo ? getClassSpecImage(this.userInfo.classSlug, this.userInfo.specSlug) : undefined;
  }

  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
  }

}
