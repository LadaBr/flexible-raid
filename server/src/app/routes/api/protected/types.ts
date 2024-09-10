import {DiscordUser} from "../../../../../../shared/types";
import {FastifyRequest} from "fastify";

export interface RequestWithUser extends FastifyRequest {
    user: DiscordUser;
}