import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {CalendarService, CalendarServiceConfig} from "../../services/calendar.service";

@Component({
  selector: 'app-calendar-hour-item',
  templateUrl: './calendar-hour-item.component.html',
  styleUrls: ['./calendar-hour-item.component.scss', '../calendar/calendar.shared.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarHourItemComponent implements OnInit {
  @Input() hours: number[] = [...Array(24).keys()];
  @Input() config!: CalendarServiceConfig;

  get allowedHours() {
    return this.hours.filter(h => !this.config.disabledHours.includes(h));
  }

  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
  }


}
