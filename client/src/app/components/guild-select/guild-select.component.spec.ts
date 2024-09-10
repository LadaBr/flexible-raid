import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuildSelectComponent } from './guild-select.component';

describe('GuildSelectComponent', () => {
  let component: GuildSelectComponent;
  let fixture: ComponentFixture<GuildSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuildSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuildSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
