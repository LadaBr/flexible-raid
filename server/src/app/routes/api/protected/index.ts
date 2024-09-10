import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {RouteGenericInterface} from "fastify/types/route";
import {
    ApiCreateEventRequestPayload,
    AttendanceItem, DiscordUser,
    RaidHelperEventCreatePayload
} from "../../../../../../shared/types";
import {ConfigController} from "../../../controllers/configController";
import {DiscordApi} from "../../../api/discord.api";
import DiscordBot from "../../../../discord";
import Attendance from "../../../db/schemas/attendanceSchema";
import AdminRoute from "./admin.route";
import {RaidHelperApi} from "../../../api/raid-helper.api";
import EventsRoutes from "./events";
import {RequestWithUser} from "./types";


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


export interface ApiAttendanceRequestSchema extends RouteGenericInterface {
    Body: AttendanceItem;
}


export interface ApiAttendanceDeleteRequestSchema extends RouteGenericInterface {
    Body: {
        serverId: string;
        userId: string;
        day: number;
        hour: number;
    };
}

async function attendanceCheck(request: FastifyRequest<ApiAttendanceDeleteRequestSchema>, reply: FastifyReply) {
    const config = await ConfigController.get(request.body.serverId);
    // @ts-ignore
    const user = request.user;
    if (user.id !== request.body.userId) {
        reply.code(403).send("Invalid user id");
        return;
    }
    if (!config) {
        reply.code(404).send("Invalid server id");
        return;
    }
    if (config.disabledDays.includes(request.body.day) ||
        request.body.day < 0 ||
        request.body.day >= config.calendar.length
    ) {
        reply.code(403).send("Invalid day");
        return;
    }
    return config;
}


async function ApiProtectedRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (request, reply) => {
        const token = request.headers.authorization?.split(" ")[1];

        const user = token ? (await DiscordApi.user(token)).data : false
        if (!user) {
            reply.code(403).send();
            return;
        }
        (request as RequestWithUser).user = user;
    });

    fastify.delete<ApiAttendanceDeleteRequestSchema>("/attendance", async (request, reply) => {
        const config = await attendanceCheck(request, reply);
        if (!config) return;
        const doc = await Attendance.findOneAndRemove({serverId: request.body.serverId, hour: request.body.hour, day: request.body.day, userId: request.body.userId});
        reply.send(doc);
        fastify.websocketServer.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    type: "CALENDAR",
                    action: "REMOVE",
                    payload: doc
                }));
            }
        });
    });

    fastify.post<ApiAttendanceRequestSchema>('/attendance', {schema: AttendanceRequestSchema}, async (request, reply) => {
        const config = await attendanceCheck(request, reply);
        if (!config) return;
        if (config.disabledHours.includes(request.body.hour) ||
            (request.body.hour < 0 || !config.calendar[request.body.day][request.body.hour].enabled)
        ) {
            reply.code(403).send("Invalid hour");
            return;
        }
        const hasRole = await DiscordBot.hasRole(request.body.serverId, request.body.userId, ...config.attendRoles);
        if (!hasRole) {
            reply.code(403).send("Invalid permissions");
            return;
        }
        const member = await DiscordBot.fetchMember(request.body.serverId, request.body.userId);
        const attendance = await Attendance.findOneAndUpdate(
            {serverId: request.body.serverId, hour: request.body.hour, day: request.body.day, userId: request.body.userId},
            {...request.body, nickname: member.nickname},
            {upsert: true, new: true}
        );
        reply.send(attendance);
        fastify.websocketServer.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    type: "CALENDAR",
                    action: "ADD",
                    payload: attendance
                }));
            }
        });
    });

    fastify.register(EventsRoutes, {
        prefix: '/events'
    });
}
export default ApiProtectedRoutes;

