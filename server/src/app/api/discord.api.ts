import {discord} from '../../assets/config.json';
import axios from "axios";
import FormData from "form-data";
import { request } from 'http';

const API_URL = 'https://discord.com/api/v' + discord.version;
const ENDPOINTS = {
    TOKEN: API_URL + '/oauth2/token',
    AUTHORIZE: API_URL + '/oauth2/authorize',
    USER: API_URL + '/users/@me',
};

export class DiscordApi {
    static loginUrl(redirectUri: string) {
        return ENDPOINTS.AUTHORIZE + '?response_type=code&client_id=' + discord.client_id + '&scope=' + discord.scope + '&redirect_uri=' + redirectUri;
    }

    private static getTokenFormDataBase(grantType: string) {
        const formData = new FormData();
        formData.append('client_id', discord.client_id);
        formData.append('client_secret', discord.client_secret);
        formData.append('grant_type', grantType);
        return formData;
    }

    static token(code: string, redirectUri: string) {
        const formData = DiscordApi.getTokenFormDataBase('authorization_code')
        formData.append('code', code);
        formData.append('redirect_uri', redirectUri);
        return axios.post(ENDPOINTS.TOKEN, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }

    static refreshToken(refreshToken: string) {
        const formData = DiscordApi.getTokenFormDataBase('refresh_token');
        formData.append('refresh_token', refreshToken);
        return axios.post(ENDPOINTS.TOKEN, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }

    static async user(access_token: string) {
        return axios.get(ENDPOINTS.USER, {
            responseType: "json",
            headers: {
                authorization: 'Bearer ' + access_token
            }
        });
    }
}