import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CalendarService, ClassWithSlug, SpecializationWithSlug} from "../../services/calendar.service";

export function getClassImage(className: string) {
  return `assets/images/classes/${className}.jpg`;
}

export function getClassSpecImage(className: string, spec: string) {
  return `assets/images/specs/${className}/${spec}.jpg`;
}
export function getAttendanceImage(attendance: string) {
  return `assets/images/attendance/${attendance}.png`;
}

@Component({
  selector: 'app-spec-selector',
  templateUrl: './spec-selector.component.html',
  styleUrls: ['./spec-selector.component.scss']
})
export class SpecSelectorComponent implements OnInit {
  @Input() selectedClass?: ClassWithSlug | null;
  @Input() selectedSpec?: SpecializationWithSlug | null;
  @Output() selectClass = new EventEmitter<ClassWithSlug>();
  @Output() selectSpec = new EventEmitter<SpecializationWithSlug>();
  expanded = false;

  classes$ = this.calendarService.classes$.pipe(

  );

  constructor(public calendarService: CalendarService) {
  }

  ngOnInit(): void {
  }


  isValidSpec(_class: ClassWithSlug, spec: SpecializationWithSlug) {
    return _class.specs.find(s => s.id === spec.id)
  }

  getClassImage(slug: string) {
    return getClassImage(slug);
  }

  getClassSpecImage(className: string, slug: string) {
    return getClassSpecImage(className, slug);
  }
}
