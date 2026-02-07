import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
} from "colyseus";
import express from "express";
import cors from "cors";

import { Lobby } from "./rooms/lobby.js";
import { cardsRouter, cardsApiEndpoints } from "./cards/cards.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { summonerRouter, summonerApiEndpoints } from "./summoner/summoner.routes.js";

const server = defineServer({
    rooms: {
        my_room: defineRoom(Lobby)
    },

    routes: createRouter({
        api_hello: createEndpoint("/api/hello", { method: "GET", }, async (ctx) => {
            return { message: "Hello World" }
        }),
        ...cardsApiEndpoints,
        ...authApiEndpoints,
        ...summonerApiEndpoints,
    }),

    express: (app) => {
        app.use(cors({
            origin: [
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ],
            credentials: true,
        }));
        app.use(express.json());
        app.use("/auth", authRouter);
        app.use("/inventory", cardsRouter);
        app.use("/summoner", summonerRouter);
        app.get("/hi", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.use("/monitor", monitor());

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }

});

export default server;
