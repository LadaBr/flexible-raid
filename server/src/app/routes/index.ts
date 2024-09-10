import ApiRoutes from './api';
import {FastifyInstance} from "fastify";

async function Routes(fastify: FastifyInstance) {
    fastify.register(ApiRoutes, {
        prefix: "/api"
    });

}
export default Routes;
