import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHourItemComponent } from './calendar-hour-item.component';

describe('CalendarHourItemComponent', () => {
  let component: CalendarHourItemComponent;
  let fixture: ComponentFixture<CalendarHourItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarHourItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarHourItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
