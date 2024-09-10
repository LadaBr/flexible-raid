import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecSelectorComponent } from './spec-selector.component';

describe('SpecSelectorComponent', () => {
  let component: SpecSelectorComponent;
  let fixture: ComponentFixture<SpecSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
