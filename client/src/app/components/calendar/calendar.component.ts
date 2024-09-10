import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {AttendanceItem, CalendarConfig, DiscordUser} from "../../../../../shared/types";
import {Attendances, CalendarService, CalendarServiceConfig, ClassWithSlug} from "../../services/calendar.service";
import {interval, map, shareReplay, startWith, tap} from "rxjs";
import {getLocaleFirstDayOfWeek} from "@angular/common";

export interface CalendarData {

}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss', 'calendar.shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  @Input() dayNames: string[] = [];
  @Input() config!: CalendarServiceConfig;
  @Input() attendances?: Attendances | null;
  @Input() user?: DiscordUser | null;
  @Input() currentDay!: number;
  @Output() selectedHour = new EventEmitter<[number, number]>();




  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
  }

  isAllowed(array: number[], value: number) {
    return !array.includes(value);
  }

  isSameRole(attendance?: AttendanceItem, attendance2?: AttendanceItem) {
    return attendance?.role === attendance2?.role && attendance?.specSlug === attendance2?.specSlug && attendance?.classSlug === attendance2?.classSlug;
  }


  // calenderItemEvents$(day: number, hour: number) {
  //   return this.calendarService.calendarEvents$.pipe(
  //     map(v => v.filter(e => {
  //       return (e.day === day && e.hour === hour) || (e.day === day && e.hour === hour)
  //
  //     })),
  //     tap(v => console.log("AAAAAAA", v)),
  //     shareReplay(1),
  //   )
  // }

}
