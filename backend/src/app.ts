import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
} from "colyseus";
import { MyRoom } from "./rooms/MyRoom.js";
import express from 'express';

const server = defineServer({
    rooms: {
        my_room: defineRoom(MyRoom)
    },

    routes: createRouter({
        api_hello: createEndpoint("/api/hello", { method: "GET", }, async (ctx) => {
            return { message: "Hello World" }
        })
    }),

    express: (app) => {
        app.use(express.json());

        app.use("/monitor", monitor());

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }
});

export default server;
