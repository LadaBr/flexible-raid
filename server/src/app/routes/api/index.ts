import AdminRoute from './protected/admin.route';
import {FastifyInstance} from "fastify";
import DiscordRoute from './discord.route';
import {ConfigController} from "../../controllers/configController";
import {RouteGenericInterface} from "fastify/types/route";
import Classes from "../../../../../shared/classes.json";
import Attendance from "../../db/schemas/attendanceSchema";
import ApiProtectedRoutes from "./protected";
import {RaidHelperApi} from "../../api/raid-helper.api";

export interface ApiConfigRequestSchema extends RouteGenericInterface {
    Params: {
        serverId: string;
    }
}

export interface ApiConfigsRequestSchema extends RouteGenericInterface {
    Querystring: {
        server_id: string[];
    }
}


const ConfigsRequestSchema = {
    querystring: {
        server_id: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
    },
}

const AttendanceRequestSchema = {
    body: {
        server_id: {
            type: 'string'
        },
        userId: {
            type: 'string'
        },
        classSlug: {
            type: 'string'
        },
        specSlug: {
            type: 'string'
        },
        role: {
            type: 'string'
        },
        day: {
            type: 'number'
        },
        hour: {
            type: 'number'
        },
    },
}


async function ApiRoutes(fastify: FastifyInstance) {
    fastify.get<ApiConfigRequestSchema>('/config/:serverId', async (request, reply) => {
        const config = await ConfigController.get(request.params.serverId);
        reply.send(config);
    });
    fastify.get<ApiConfigsRequestSchema>('/configs', {schema: ConfigsRequestSchema}, async (request, reply) => {
        const config = await ConfigController.getAll(request.query.server_id);
        reply.send(config);
    });
    fastify.get<ApiConfigRequestSchema>('/attendance/:serverId', async (request, reply) => {
        const attendance = await Attendance.find({serverId: request.params.serverId});
        reply.send(attendance);
    });

    fastify.get('/classes', async (request, reply) => {
        reply.send(Classes);
    });
    fastify.register(ApiProtectedRoutes, {
        prefix: '/protected'
    });
    fastify.register(DiscordRoute, {
        prefix: '/discord'
    });

    fastify.get<{Params: {serverId: string}}>('/events/:serverId',async (request, reply) => {
        const res = await RaidHelperApi.getEvents(request.params.serverId);
        reply.send(res.data);
    });

    fastify.get<{Params: {serverId: string; eventId: string}}>('/events/:serverId/:eventId',async (request, reply) => {
        const res = await RaidHelperApi.getEvent(request.params.serverId, request.params.eventId);
        reply.send(res.data);
    });

    fastify.register(async function (fastify) {
        fastify.get('/ws', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on('message', message => {
                if (message.toString() === "ping") {
                    connection.socket.send('pong');
                }
            })
        })
    });

}

export default ApiRoutes;

