import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import { faLock, faPlus } from '@fortawesome/free-solid-svg-icons';
import {CalendarService, GuildWithConfig, PossibleEvent, raidHelperClassMap, raidHelperSpecMap} from "../../services/calendar.service";
import {getAttendanceImage, getClassImage, getClassSpecImage} from "../spec-selector/spec-selector.component";
import {RaidHelperEventDetailed, RaidHelperSignUp} from "../../../../../shared/types";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
  @Input() guild!: GuildWithConfig;
  @Input() validEvent!: PossibleEvent;
  faLock = faLock;
  faPlus = faPlus;

  raidHelperRoleMap: Record<string, string> = {
    Tanks: "tank",
    Ranged: "dmg",
    Dps: "dmg",
    Melee: "dmg",
    Healers: "healer",
  };
  raidHelperClassMap: Record<string, string> = {
    Tanks: "tank",
    Ranged: "dmg",
    Dps: "dmg",
    Healers: "healer",
  };
  raidHelperAttendanceStateMap: Record<string, string> = {
    Bench: "bench",
    Late: "late",
    Tentative: "tentative",
    Absence: "absence"
  };

  raidHelperSpecClassMap: Record<string, string> = {
    Shadow: "Priest",
    Holy: "Priest",
    Discipline: "Priest",
    Holy1: "Paladin",
    Protection1: "Paladin",
    Retribution: "Paladin",
    Guardian: "Druid",
    Feral: "Druid",
    Restoration: "Druid",
    Marksman: "Hunter",
    Survival: "Hunter",
    Beastmastery: "Hunter",
    Elemental: "Shaman",
    Restoration1: "Shaman",
    Enhancement: "Shaman",
    Fire: "Mage",
    Frost: "Mage",
    Arcane: "Mage",
    Fury: "Warrior",
    Arms: "Warrior",
    Protection: "Warrior",
    Assassination: "Rogue",
    Combat: "Rogue",
    Subtlety: "Rogue",
    Blood: "DK",
    Frost1: "DK",
    Unholy: "DK",
  };



  constructor(public calendarService: CalendarService) { }

  ngOnInit(): void {
  }


  mapExistingEventRoles(event: RaidHelperEventDetailed) {
    return event.signups.reduce((acc, item) => {
      const role = this.raidHelperRoleMap[item.role];
      if (!role) return acc;
      if (!acc[role]) acc[role] = [];
      console.log(item);
      const classFromSpec = this.raidHelperSpecClassMap[item.spec] || item.class;
      const className = this.getKeyByValue(raidHelperClassMap, classFromSpec) || classFromSpec;
      const specName = this.getKeyByValue(raidHelperSpecMap[className] || {}, item.spec) || item.spec;
      item.classSlug = this.calendarService.getSlug(className);
      item.specSlug = this.calendarService.getSlug(specName);
      item.attendanceState = this.raidHelperAttendanceStateMap[item.class];

      acc[role].push(item);
      return acc;
    }, {} as Record<string, RaidHelperSignUp[]>)
  }

  getClassImage(slug: string) {
    return getClassImage(slug);
  }

  getSpecImage(classSlug: string, slug: string) {
    return getClassSpecImage(classSlug, slug);
  }

  getAttendanceImage(attendance: string) {
    return getAttendanceImage(attendance);
  }


  getKeyByValue(object: any, value: any) {
    return Object.keys(object).find(key => object[key] === value);
  }


}
