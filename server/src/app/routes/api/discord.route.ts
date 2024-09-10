import {FastifyInstance} from "fastify";
import {RouteGenericInterface} from "fastify/types/route";
import {DiscordApi} from "../../api/discord.api";
import {DiscordGuildMember} from "../../../../../shared/types";
import DiscordBot from "../../../discord";

export interface DiscordAuthRequest extends RouteGenericInterface {
    Querystring: {
        redirect_uri: string;
    }
}

export interface DiscordTokenRequest extends RouteGenericInterface {
    Querystring: {
        code: string;
        redirect_uri: string;
    }
}

export interface DiscordGuildMemberRequest extends RouteGenericInterface {
    Params: {
        serverId: string;
        userId: string;
    }
}

export interface DiscordTokenRefreshRequestSchema extends RouteGenericInterface {
    Querystring: {
        refresh_token: string;
    }
}

const DiscordAuthRequestSchema = {
    querystring: {
        redirect_uri: {type: 'string'}
    },
}

const DiscordTokenRequestSchema = {
    querystring: {
        redirect_uri: {type: 'string'},
        code: {type: 'string'},
    },
}

const DiscordTokenRefreshRequestSchema = {
    querystring: {
        refresh_token: {type: 'string'},
    },
}

async function DiscordRoute(fastify: FastifyInstance) {
    fastify.get<DiscordAuthRequest>('/auth', {schema: DiscordAuthRequestSchema}, (request, reply) => {
        reply.redirect(DiscordApi.loginUrl(request.query.redirect_uri));
    });

    fastify.get<DiscordGuildMemberRequest>('/member/:serverId/:userId',async (request, reply) => {
        const res = await DiscordBot.fetchMember(request.params.serverId, request.params.userId);
        reply.send(res);
    });

    fastify.get<DiscordTokenRequest>('/token', {schema: DiscordTokenRequestSchema}, (request, reply) => {
        DiscordApi.token(request.query.code, request.query.redirect_uri).then(res => {
            reply.send(res.data);
        }).catch(err => {
            reply.code(400).send(err.response.data);
        });
    });

    fastify.get<DiscordTokenRefreshRequestSchema>('/token/refresh', {schema: DiscordTokenRefreshRequestSchema}, (request, reply) => {
        DiscordApi.refreshToken(request.query.refresh_token).then(res => {
            reply.send(res.data);
        }).catch(err => {
            reply.code(400).send(err.response.data);
        });
    });
}

export default DiscordRoute;