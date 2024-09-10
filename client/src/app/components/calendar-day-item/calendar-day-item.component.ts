import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CalendarService, CalendarServiceConfig} from "../../services/calendar.service";

@Component({
  selector: 'app-calendar-day-item',
  templateUrl: './calendar-day-item.component.html',
  styleUrls: ['./calendar-day-item.component.scss', '../calendar/calendar.shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarDayItemComponent implements OnInit {
  @Input() config!: CalendarServiceConfig;
  @Input() dayNames: string[] = [];
  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
  }

}
