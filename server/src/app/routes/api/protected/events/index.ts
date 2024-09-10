import {FastifyInstance} from "fastify";
import { ConfigController } from "../../../../controllers/configController";
import {
    ApiCreateEventRequestPayload,
    RaidHelperEventCreatePayload,
    RaidHelperEventEditPayload
} from "../../../../../../../shared/types";
import {RaidHelperApi} from "../../../../api/raid-helper.api";
import {RequestWithUser} from "../types";
import {RouteGenericInterface} from "fastify/types/route";

export interface ApiCreateEventRequestSchema extends RouteGenericInterface {
    Body: ApiCreateEventRequestPayload;
}

export interface ApiEditEventRequestSchema extends RouteGenericInterface {
    Body: RaidHelperEventEditPayload;
}



async function EventsRoutes(fastify: FastifyInstance) {
    fastify.post<ApiCreateEventRequestSchema>('/create',async (request, reply) => {
        const config = await ConfigController.get(request.body.serverId);
        if (!config) return;
        const event = config.requirements.find(r => r._id?.toString() === request.body.eventId);
        if (!event) {
            reply.code(403).send("Invalid event");
            return;
        }
        const user = (request as RequestWithUser).user;
        const dateISO = new Date(request.body.date).toISOString();
        let time = dateISO.match(/\d\d:\d\d/) as RegExpMatchArray;
        const payload: RaidHelperEventCreatePayload = {
            template: event.template,
            color: event.color,
            image: event.image,
            serverid: config.serverId,
            leaderid: user.id,
            date: dateISO.slice(0, 10),
            time: time[0],
            channelid: event.channelId,
            title: event.name,
            description: "",
            duration: request.body.duration,
            create_discordevent: true,
        }
        const res = await RaidHelperApi.createEvent(payload);
        reply.send(res.data);
    });
    fastify.post<ApiEditEventRequestSchema>('/edit',async (request, reply) => {
        console.log(request.body);
        const res = await RaidHelperApi.editEvent(request.body);
        reply.send(res.data);
    });
}
export default EventsRoutes;

