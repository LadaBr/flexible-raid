import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CalendarItemComponent } from './components/calendar-item/calendar-item.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { RedirectComponent } from './components/redirect/redirect.component';
import {HttpClientModule} from "@angular/common/http";
import { MenuComponent } from './components/menu/menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GuildSelectComponent } from './components/guild-select/guild-select.component';
import { SpecSelectorComponent } from './components/spec-selector/spec-selector.component';
import { RoleSelectorComponent } from './components/role-selector/role-selector.component';
import { EventsComponent } from './components/events/events.component';
import { EventComponent } from './components/event/event.component';
import { CalendarDayItemComponent } from './components/calendar-day-item/calendar-day-item.component';
import { CalendarHourItemComponent } from './components/calendar-hour-item/calendar-hour-item.component';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    CalendarItemComponent,
    DashboardComponent,
    LandingComponent,
    RedirectComponent,
    MenuComponent,
    GuildSelectComponent,
    SpecSelectorComponent,
    RoleSelectorComponent,
    EventsComponent,
    EventComponent,
    CalendarDayItemComponent,
    CalendarHourItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
