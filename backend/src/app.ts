import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
} from "colyseus";
import { Lobby } from './rooms/lobby.js';
import express from 'express';
import cors from 'cors';
import { authRouter } from "./modules/auth/auth.routes.js";
import { inventoryRouter } from "./modules/inventory/inventory.routes.js";
import { verifyAccess } from "./middlewares/auth.js";
import { deckRouter } from "./modules/deck/deck.routes.js";

const server = defineServer({
    rooms: {
        lobby: defineRoom(Lobby)
    },

    express: (app) => {
        app.use(express.json());

        app.use(cors({
            origin: [
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ],
            credentials: true,
        }));

        app.use("/auth", authRouter);
        app.use("/inventory", verifyAccess, inventoryRouter);
        app.use("/deck", verifyAccess, deckRouter);

        app.use("/monitor", monitor());

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }
});

export default server;
