
export interface Player {
    name: string;
    class: string;
    spec: string;
    role: string;
}

export interface RolesRequirements {
    tanks?: number | null;
    healers?: number | null;
    damageDealers?: number | null;
}

export interface Requirements {
    name: string;
    minPlayers?: number | null;
    roles?: RolesRequirements;
    discordRoles?: string[];
    _id: string;
    image?: string;
    template: number;
    color?: string;
    channelId: string;
}

export interface CalendarItemConfig {
    enabled: boolean;
}

export type CalendarConfig = {
    requirements: Requirements[];
    serverId: string;
    calendar: Array<CalendarItemConfig[]>;
    lockedDaysBefore: number;
    managerRole?: string;
    disabledHours: Array<number>;
    disabledDays: Array<number>;
    attendRoles: string[];
};


export interface CalendarItemData {
    players: Player[];
}


export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: string;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
}

export interface Class {
    name: string;
    specs: Specialization[];
    id: number;
    color: string;
}

export interface Specialization {
    name: string;
    id: number;
}

export interface DiscordGuildMember {
    user: DiscordUser;
    nick?: string;
    avatar?: string;
    joined_at: number;
    roles: string[];
}

export interface AttendanceItem {
    serverId: string;
    userId: string;
    classSlug: string;
    className: string;
    specSlug: string;
    specName: string;
    role: string;
    day: number;
    hour: number;
    nickname: string;
}

export interface RaidHelperEventCreatePayload {
    serverid: string;
    channelid: string;
    leaderid: string;
    title: string;
    description: string;
    date: string;
    time: string;
    template: number;
    color?: string;
    image?: string;
    duration?: number;
    create_discordevent?: boolean;
}


export interface RaidHelperEventUser {
    notify: boolean;
    name: string;
    class: string;
    spec: string;
}

export interface RaidHelperEventEditPayload {
    serverid: string;
    eventid: string;
    edit: {
        addusers: RaidHelperEventUser[];
    }
}
export interface ApiCreateEventRequestPayload {
    eventId: string;
    serverId: string;
    date: Date;
    duration?: number;
}


export interface RaidHelperEvents {
    servername: string;
    servericon: string;
    events: RaidHelperEvent[];
}

export interface RaidHelperEvent {
    template: string;
    date: string;
    unixtime: number;
    leader: string;
    image: string;
    color: string;
    description: string;
    title: string;
    serverId: string;
    raidId: string;
    emote: string;
    channelName: string;
    time: string;
    channelId: string;
    advanced?: {
        duration: number;
    }
}

export interface RaidHelperSignUp {
    role: string;
    name: string;
    spec_emote: string;
    signuptime: number;
    position: number;
    class_emote: string;
    role_emote: string;
    class: string;
    spec: string;
    timestamp: string;
    status: string;
    userid: string;
    classSlug?: string;
    specSlug?: string;
    attendanceState?: string;
}

export interface RaidHelperEventDetailed extends Omit<RaidHelperEvent, 'leader' | 'channelId' | 'raidId'> {
    signups: RaidHelperSignUp[];
    leadername: string;
    channelid: string;
    raidid: string
}