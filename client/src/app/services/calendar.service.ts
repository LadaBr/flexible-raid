import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest, EMPTY, filter, forkJoin, interval,
  lastValueFrom,
  map,
  merge, mergeAll,
  Observable,
  of, scan,
  shareReplay, startWith, Subject,
  switchMap,
  take,
  tap, withLatestFrom
} from "rxjs";
import {ApiGuildsResponseItem, DiscordService} from "./discord.service";
import {ApiAttendancePayload, ApiService} from "./api.service";
import {
  AttendanceItem,
  CalendarConfig,
  Class,
  DiscordGuildMember,
  DiscordUser, RaidHelperEvent, RaidHelperEventDetailed, Requirements,
  Specialization
} from "../../../../shared/types";
import {GuildService} from "./guild.service";
import {UserService} from "./user.service";
import {WebsocketService} from "./websocket.service";


export interface CalendarServiceConfig extends CalendarConfig {
  lockedDays: boolean[];
}

export interface GuildWithConfig extends ApiGuildsResponseItem {
  config?: CalendarServiceConfig;
}

export interface ClassWithSlug extends Class {
  specs: SpecializationWithSlug[];
  slug: string;
}

export interface SpecializationWithSlug extends Specialization {
  slug: string;
}

export type AttendancesMapType = Map<number, Map<string, AttendanceItem>>;
export type Attendances = Map<number, AttendancesMapType>;

export interface PossibleEvent {
  roles: {
    tank: AttendanceItem[];
    healer: AttendanceItem[];
    dmg: AttendanceItem[];
  };
  day: number;
  hour: number;
  date: Date;
  totalPlayers: number;
  me?: AttendanceItem;
  id: string;
  existingEvents: RaidHelperEventDetailed[];
  previous?: PossibleEvent;
  next?: PossibleEvent;
}

export interface RequirementsWithEvents extends Requirements {
  validEvents: PossibleEvent[];
}

export const raidHelperClassMap: Record<string, string> = {
  "Death Knight": "DK",
};
export const raidHelperSpecMap: Record<string, Record<string, string>> = {
  "Death Knight": {
    "Frost": "Frost1"
  },
  "Paladin": {
    "Holy": "Holy1",
    "Protection": "Protection1",
  },
  "Shaman": {
    "Restoration": "Restoration1"
  },
  "Druid": {
    "Feral Combat": "Feral"
  },
};

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly selectGuildSubject$ = new BehaviorSubject<ApiGuildsResponseItem | undefined>(undefined);
  private readonly setHourSubject$ = new Subject<[number, number]>();
  private readonly removeHourSubject$ = new Subject<[number, number]>();
  private readonly createEventSubject$ = new Subject<PossibleEvent>();

  private readonly selectedClassSubject$ = new BehaviorSubject<ClassWithSlug | undefined>(this.getCached("class"));
  readonly selectedClass$ = this.selectedClassSubject$.asObservable();
  private readonly selectedRoleSubject$ = new BehaviorSubject<string | undefined>(localStorage.getItem("role") || undefined);
  readonly selectedRole$ = this.selectedRoleSubject$.asObservable();
  private readonly selectedSpecSubject$ = new BehaviorSubject<SpecializationWithSlug | undefined>(this.getCached("spec"));
  readonly selectedSpec$ = combineLatest([this.selectedClass$, this.selectedSpecSubject$]).pipe(
    tap(v => console.log(v)),
    map(([c, spec]) => c && spec && c.specs.find(s => s.id === spec.id) ? spec : undefined),
  );


  readonly calendarGuilds$: Observable<GuildWithConfig[]> = this.guildService.guilds$.pipe(
    switchMap(guilds => this.apiService.getServers(guilds.map(g => g.id)).pipe(
      map(configs => guilds.map(g => ({...g, config: configs.find(c => c.serverId === g.id)}))),
    )),
    map(configs => configs.map(c => ({
      ...c,
      config: c.config ? {
        ...c.config,
        lockedDays: this.dayNames.map((_, i) => this.isLocked(c.config as CalendarConfig, i))
      } : undefined
    }))),
    tap(v => console.log("GUILD", v)),
    shareReplay(1),
  );

  readonly selectedCalendarGuild$: Observable<GuildWithConfig | undefined | null> = combineLatest([this.selectGuildSubject$, this.calendarGuilds$]).pipe(
    tap(v => console.log("GUILD", v)),
    map(([selectedGuild, calendarGuilds]) => selectedGuild ? calendarGuilds.find(g => g.id === selectedGuild.id) : (calendarGuilds.find(g => g.config) || null)),
    shareReplay(1),
  );

  readonly selectedCalendarGuildMember$: Observable<DiscordGuildMember | undefined | null> = this.selectedCalendarGuild$.pipe(
    switchMap(guild => guild ? this.discordService.getGuildMember(guild?.id) : of(undefined)),
    shareReplay(1),
  );

  readonly requirements$ = this.selectedCalendarGuild$.pipe(
    map((guild) => guild?.config ? guild.config.requirements : [])
  );

  readonly hasPermission$ = combineLatest([this.selectedCalendarGuildMember$, this.selectedCalendarGuild$]).pipe(
    map(([member, guild]) => guild?.config ? member?.roles.some(r => guild.config?.attendRoles.includes(r)) : undefined),
    shareReplay(1),
  );

  readonly guildAvatar$ = this.selectedCalendarGuild$.pipe(
    map(guild => guild ? this.discordService.getGuildIcon(guild.id, guild.icon) : undefined)
  );

  readonly classes$: Observable<ClassWithSlug[]> = this.apiService.getClasses().pipe(
    map(classes => classes.map(c => ({
      ...c,
      slug: this.getSlug(c.name),
      specs: c.specs.map(s => ({...s, slug: this.getSlug(s.name)})) as SpecializationWithSlug[]
    }))),
    shareReplay(1),
  );

  readonly attendances$ = merge(
    this.selectedCalendarGuild$.pipe(
      switchMap(guild => guild ? this.apiService.getAttendance(guild.id) : []),
      map(attendance => (acc: Attendances) => {
        acc = attendance.reduce((acc, v) => {
          this.transformAttendanceItem(acc, v);
          return acc;
        }, new Map() as Attendances);
        return acc;
      }),
    ),
    this.setHourSubject$.pipe(
      withLatestFrom(
        this.selectedCalendarGuild$,
        this.userService.user$,
        this.selectedClass$,
        this.selectedSpec$,
        this.selectedRole$,
      ),
      filter(([_, guild, user, selectedClass, selectedSpec, selectedRole]) => !!guild && !!user && !!selectedClass && !!selectedSpec && !!selectedRole),
      map(v => v as [[number, number], GuildWithConfig, DiscordUser, ClassWithSlug, SpecializationWithSlug, string]),
      map(([hour, guild, user, selectedClass, selectedSpec, selectedRole]) => ({
        serverId: guild.id,
        userId: user.id,
        day: hour[0],
        hour: hour[1],
        classSlug: selectedClass.slug,
        className: selectedClass.name,
        specSlug: selectedSpec.slug,
        specName: selectedSpec.name,
        role: selectedRole,
      } as ApiAttendancePayload)),
      switchMap(payload => this.apiService.setHour(payload)),
      map(v => (acc: Attendances) => acc)
    ),
    this.removeHourSubject$.pipe(
      withLatestFrom(this.selectedCalendarGuild$, this.userService.user$),
      filter(([_, guild, user]) => !!guild && !!user),
      map((v) => v as [[number, number], GuildWithConfig, DiscordUser]),
      switchMap(([hour, guild, user]) => this.apiService.removeHour(guild.id, user.id, ...hour)),
      map(v => (acc: Attendances) => acc)
    ),
    this.websocketService.messages$.pipe(
      tap(v => console.log(v)),
      filter(data => data.type === "CALENDAR"),
      map(v => (acc: Attendances) => {
        this.transformAttendanceItem(acc, v.payload, v.action === "REMOVE");
        return new Map(acc);
      }),
    ),
  ).pipe(
    scan((acc, fn ) => fn(acc), new Map() as Attendances),
    shareReplay(1)
  );

  readonly guildEvents$ = merge(
    this.createEventSubject$.pipe(
      withLatestFrom(this.selectedCalendarGuild$),
      switchMap(([event, guild]) => {
        if (guild) {
          const lastChainedEvent = this.getLastChainedEvent(event);
          const duration = (lastChainedEvent.hour + 1 - event.hour) * 60;
          return this.apiService.createEvent(guild.id, this.eventTimeToDate(event.day, event.hour), event.id, duration).pipe(
            switchMap((res) => this.apiService.editEvent(guild.id, res.eventid, {
              addusers: Object.values(event.roles).flat().map(r => ({
                name: r.nickname,
                spec: raidHelperSpecMap[r.className] ? raidHelperSpecMap[r.className][r.specName] || r.specName : r.specName,
                class: raidHelperClassMap[r.className] || r.className,
                notify: true,
              }))
            })),
            switchMap(() => this.getEvents(guild.id))
          )
        } else {
          return EMPTY;
        }
      })
    ),
    this.selectedCalendarGuild$.pipe(
      switchMap(guild => guild ? this.getEvents(guild.id) : EMPTY)
    ),
  ).pipe(
    shareReplay(1),
  );

  possibleEvents$: Observable<RequirementsWithEvents[] | undefined> = combineLatest([this.attendances$, this.guildEvents$]).pipe(
    withLatestFrom(this.selectedCalendarGuild$, this.userService.user$),
    map(([[attendances, events], guild, user]) => {
      if (!guild || !guild.config || !guild.config.requirements) return;
      const requirements = guild.config.requirements;
      return requirements.map(r => {
        const flattenArray: PossibleEvent[] = [];
        for (const [day, hours] of attendances.entries()) {
          for (const [hour, users] of hours.entries()) {
            const usersArr = [...users.values()];
            const tank = usersArr.filter(u => u.role === "tank");
            const healer = usersArr.filter(u => u.role === "healer");
            const dmg = usersArr.filter(u => u.role === "dmg");
            const me = user ? usersArr.find(u => u.userId === user.id) : undefined;
            const totalPlayers = tank.length + healer.length + dmg.length;
            const date = this.eventTimeToDate(day, hour);
            const existingEvents = events.detailedEvents.filter(e => e.title === r.name && e.channelid === r.channelId && e.unixtime === date.getTime() / 1000);
            const item: PossibleEvent = {
              day, hour,
              roles: {
                tank,
                healer,
                dmg,
              },
              me,
              date,
              totalPlayers,
              id: r._id,
              existingEvents,
            };
            let isValid = true;
            if (r.minPlayers && r.minPlayers > totalPlayers) {
              isValid = false;
            } else if (r.roles) {
              if (r.roles.tanks && r.roles.tanks > tank.length) isValid = false;
              else if (r.roles.healers && r.roles.healers > healer.length) isValid = false;
              else if (r.roles.damageDealers && r.roles.damageDealers > dmg.length) isValid = false;
            }
            if (isValid || existingEvents.length) {
              flattenArray.push(item);
            }
          }
        }
        flattenArray.sort((a, b) => a.day - b.day);
        for (const [index, item] of flattenArray.entries()) {
          const day = item.day;
          const hour = item.hour;
          const previous = flattenArray[index - 1];
          const next = flattenArray[index + 1];
          item.previous = previous && ((previous.day === day && previous.hour === hour - 1) || (previous.hour === 23 && hour === 0 && previous.day === day - 1)) ? previous : undefined;
          item.next = next && ((next.day === day && next.hour === hour + 1) || (next.hour === 0 && hour === 23 && next.day === day + 1)) ? next : undefined;
        }

        return {
          validEvents: flattenArray,
          ...r,
        };
      });

    }),
    shareReplay(1),
  );


  calendarDaysHours$ = this.selectedCalendarGuild$.pipe(
    map((guild) => {
      return guild?.config?.calendar.map((day, i) => {
        return day.map((hour, j) => {
          const date = this.eventTimeToDate(i, j);
          return {
            ...hour,
            date
          }
        })
      })
    }),
  );

  calendarDaysHoursWithEvents$ = combineLatest([this.calendarDaysHours$, this.guildEvents$]).pipe(
    map(([calendar, guildEvents]) => {

      return calendar?.map((day, i) => {
        return day.map((hour, j) => {
          const dateTime = hour.date.getTime()
          const events = guildEvents.detailedEvents.filter(v => {

            const date = new Date(v.unixtime * 1000);
            let maxDate;
            if (v.advanced?.duration) {
              maxDate = new Date(v.unixtime * 1000);
              maxDate.setMinutes(maxDate.getMinutes() + v.advanced.duration);
            }

            return v.unixtime * 1000 <= dateTime && ((maxDate && dateTime < maxDate.getTime()) || (!maxDate && v.unixtime * 1000 === dateTime));
          });
          return {
            ...hour,
            events
          }
        })
      })
    }),
    // map(([guild, events]) => v.detailedEvents.map(e => {
    //   return {
    //     ...e,
    //     day: new Date(e.unixtime * 1000).getDay() - 1,
    //     hour: new Date(e.unixtime * 1000).getHours()
    //   }
    // })),
    shareReplay(1),
  );


  readonly isManager$ = combineLatest([this.selectedCalendarGuild$, this.selectedCalendarGuildMember$]).pipe(
    map(([guild, member]) => guild?.config?.managerRole ? !!member?.roles.includes(guild.config.managerRole) : false),
    shareReplay(1),
  );

  get currentDay() {
    let day = new Date().getDay() - 1;
    return day < 0 ? 6 : day;
  }


  get currentHours() {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes()  / 60;
    return hour + minutes;
  }

  currentHour$ = interval(1000).pipe(
    map(() => this.currentHours),
    startWith(this.currentHours),
    shareReplay(1),
  );
  currentDay$ = interval(1000).pipe(
    map(() => this.currentDay),
    startWith(this.currentDay),
    shareReplay(1),
  );
  currentHourWhole$ = this.currentHour$.pipe(
    map((v) => Math.floor(v))
  );


  classColors$ = this.classes$.pipe(
    map(classes => classes.reduce((acc, v) => {
      acc[v.name] = v.color;
      return acc;
    }, {} as Record<string, string>))
  );


  dayNames: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", ];

  constructor(
    private guildService: GuildService,
    private apiService: ApiService,
    private discordService: DiscordService,
    private userService: UserService,
    private websocketService: WebsocketService
  ) {
    this.websocketService.messages$.subscribe(v => console.log(v));
  }

  isLocked(config: CalendarConfig, day: number) {
    const daysLocked = config.lockedDaysBefore + this.currentDay;
    const start = daysLocked - 6;
    if (day <= daysLocked && day >= this.currentDay) {
      return true;
    } else if (day < start) {
      return true
    }

    return false;
  }

  private transformAttendanceItem(acc: Attendances, v: AttendanceItem, remove?: boolean) {
    if (!acc.has(v.day)) acc.set(v.day, new Map());
    if (!acc.get(v.day)?.get(v.hour)) acc.get(v.day)?.set(v.hour, new Map());
    const item = acc.get(v.day)?.get(v.hour);
    if (remove) item?.delete(v.userId)
    else item?.set(v.userId, v);
  }

  getSlug(className: string) {
    return className.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  selectGuild(guild: ApiGuildsResponseItem) {
    this.selectGuildSubject$.next(guild);
  }

  selectClass(_class?: ClassWithSlug) {
    this.selectedClassSubject$.next(_class);
    if (_class?.slug)
      localStorage.setItem("class", JSON.stringify(_class));
    else
      localStorage.removeItem("class")
  }

  selectSpec(spec?: SpecializationWithSlug) {
    this.selectedSpecSubject$.next(spec);
    if (spec?.slug)
      localStorage.setItem("spec", JSON.stringify(spec));
    else
      localStorage.removeItem("spec")
  }

  selectRole(role?: string) {
    this.selectedRoleSubject$.next(role);
    if (role)
      localStorage.setItem("role", role);
    else
      localStorage.removeItem("role")
  }

  getCached(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  }

  getLastChainedEvent(event: PossibleEvent): PossibleEvent {
    return event.next ? this.getLastChainedEvent(event.next) : event;
  }


  async toggleHour(hour: [number, number]) {
    const attendances = await lastValueFrom(this.attendances$.pipe(take(1)));
    const user = await lastValueFrom(this.userService.user$.pipe(take(1)));
    if (!user || !attendances) return;
    console.log(attendances);
    const attendance = attendances.get(hour[0])?.get(hour[1])?.get(user.id);
    let isSame = false;
    if (attendance) {
      const selectedClass = await lastValueFrom(this.selectedClass$.pipe(take(1)));
      const selectedSpec = await lastValueFrom(this.selectedSpec$.pipe(take(1)));
      const selectedRole = await lastValueFrom(this.selectedRole$.pipe(take(1)));
      console.log(attendance, selectedSpec, selectedRole, selectedClass);
      isSame = attendance.role === selectedRole && attendance.classSlug === selectedClass?.slug && attendance.specSlug === selectedSpec?.slug;
    }
    if (isSame) {
      this.removeHour(hour);
    } else {
      this.setHour(hour);
    }

  }

  setHour(hour: [number, number]) {
    this.setHourSubject$.next(hour);
  }

  removeHour(hour: [number, number]) {
    this.removeHourSubject$.next(hour);
  }

  createEvent(event: PossibleEvent) {
    this.createEventSubject$.next(event);
  }

  eventTimeToDate(day: number, hour: number) {
    const date = new Date();
    let diff = day - this.currentDay;
    const dateDay = diff >= 0 ? date.getDate() + diff : date.getDate() + 6 + diff + 1;
    date.setDate(dateDay);
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  getEvents(serverId: string) {
    return this.apiService.getEvents(serverId).pipe(
      switchMap(v => forkJoin(v.events.map(e => this.apiService.getEvent(serverId, e.raidId))).pipe(
        map(r => ({...v, detailedEvents: r}))
      )),
    )
  }
}
