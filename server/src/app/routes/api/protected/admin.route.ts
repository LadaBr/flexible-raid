import {FastifyInstance} from "fastify";

async function AdminRoute(fastify: FastifyInstance) {
    fastify.get('/', function (request, reply) {
        reply.send({ hello: 'world' })
    });
}
export default AdminRoute;