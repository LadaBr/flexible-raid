import mongoose from 'mongoose';
import {CalendarConfig} from "../../../../../shared/types";

const { Schema } = mongoose;

const CALENDAR_DAYS = 7;
const CALENDAR_HOURS = 24;
const LOCKED_DAYS_BEFORE = 2;
const calendarHours = [...Array(CALENDAR_HOURS).keys()].map(() => ({enabled: true}));
const calendarDays = [...Array(CALENDAR_DAYS).keys()].map(() => calendarHours);

const configSchema = new Schema<CalendarConfig>({
    serverId: String,
    calendar: {
        type: [[
            {
                enabled: Boolean,
            }
        ]],
        default: calendarDays,
    },
    lockedDaysBefore: {
        type: Number,
        default: LOCKED_DAYS_BEFORE
    },
    requirements: {
        type: [
            {
                name: String,
                minPlayers: Number,
                roles: {
                    tanks: Number,
                    healers: Number,
                    damageDealers: Number,
                },
                discordRoles: [String],
                image: String,
                color: String,
                template: Number,
                channelId: String,
            }
        ],
        default: [],
    },
    disabledHours: {
        type: [Number],
        default: []
    },
    disabledDays: {
        type: [Number],
        default: [],
    },
    managerRole: String,
    attendRoles: [String],
});

const Config = mongoose.model('Config', configSchema);
export default Config;