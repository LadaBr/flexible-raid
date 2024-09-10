import Fastify from 'fastify';
import cors from '@fastify/cors'
import Routes from './app/routes';
import mongoose from "mongoose";
import {mongodb} from './assets/config.json';
import DiscordBot from "./discord";
import Websocket from '@fastify/websocket';

const fastify = Fastify({
    logger: true
});

fastify.register(cors, {
    origin: '*'
});
fastify.register(Websocket, {
    options: {
        maxPayload: 1048576
    }
});

fastify.register(Routes);


// Run the server!
fastify.listen({port: 3000}, (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`Server is now listening on ${address}`);
    mongoose.connect(mongodb.connectionString).then(() => {
        console.log("MongoDB connection established.")
    });
    DiscordBot.login().then(() => {
        console.log("Discord bot logged in.");
    })
});