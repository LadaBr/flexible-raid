import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {faLock, faPeopleGroup, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Class, RaidHelperEventDetailed, RaidHelperSignUp, RolesRequirements} from "../../../../../shared/types";
import {
  CalendarService,
  GuildWithConfig, PossibleEvent, raidHelperClassMap,
  raidHelperSpecMap,
  RequirementsWithEvents
} from "../../services/calendar.service";
import {getClassImage, getClassSpecImage} from "../spec-selector/spec-selector.component";
import {map} from "rxjs";

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit {
  @Input() guild!: GuildWithConfig;
  @Input() possibleEvents: RequirementsWithEvents[] = [];

  roleMap: Record<string, string> = {
    tanks: "tank",
    healers: "healer",
    damageDealers: "dmg",
  };
  faPeopleGroup = faPeopleGroup;


  constructor(public calendarService: CalendarService) {
  }

  ngOnInit(): void {
  }


  getRoleName(role: string) {
    return this.roleMap[role];
  }

  asRolesRequirements(value: any) {
    return value as Record<number, RolesRequirements>;
  }


  getClassImage(slug: string) {
    return getClassImage(slug);
  }

  getSpecImage(classSlug: string, slug: string) {
    return getClassSpecImage(classSlug, slug);
  }

}
