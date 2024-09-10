import config from "../../assets/config.json";
import axios from "axios";
import {RaidHelperEventCreatePayload, RaidHelperEventEditPayload} from "../../../../shared/types";

const API_URL = 'https://raid-helper.dev/api';
const ENDPOINTS = {
    EDIT: API_URL + '/edit/',
    CREATE: API_URL + '/create/',
    EVENTS: API_URL + '/events/',
    EVENT: API_URL + '/event/',
};

export class RaidHelperApi {
    static cache: {
        getEvents?: any;
        getEvent?: any;
    } = {
        getEvent: {}
    };
    static clearCache() {
        delete RaidHelperApi.cache.getEvents;
    }
    static clearCachedEvent(id: string) {
        delete RaidHelperApi.cache.getEvent[id];
        delete RaidHelperApi.cache.getEvents;
    }
    static _protectedPayload(payload: any) {
        return {...payload, accessToken: config["raid-helper"].token}
    }
    static createEvent(payload: RaidHelperEventCreatePayload) {
        RaidHelperApi.clearCache();
        return axios.post(ENDPOINTS.CREATE, RaidHelperApi._protectedPayload(payload));
    }
    static editEvent(payload: RaidHelperEventEditPayload) {
        RaidHelperApi.clearCachedEvent(`${payload.serverid}-${payload.eventid}`);
        return axios.post(ENDPOINTS.EDIT, RaidHelperApi._protectedPayload(payload));
    }
    static async getEvents(serverId: string) {
        const res = RaidHelperApi.cache.getEvents || await axios.post(ENDPOINTS.EVENTS, RaidHelperApi._protectedPayload({serverid: serverId}));
        RaidHelperApi.cache.getEvents = res;
        return res;
    }
    static async getEvent(serverId: string, eventId: string) {
        const res = RaidHelperApi.cache.getEvent[`${serverId}-${eventId}`] || await axios.post(ENDPOINTS.EVENT + "/" + eventId, RaidHelperApi._protectedPayload({}));
        RaidHelperApi.cache.getEvent[`${serverId}-${eventId}`] = res;
        return res;
    }
}