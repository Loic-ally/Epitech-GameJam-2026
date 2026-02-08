import {
    defineServer,
    defineRoom,
    monitor,
    playground,
} from "colyseus";
import { Lobby } from './rooms/Lobby.js';
import express from 'express';
import cors from 'cors';
import { authRouter } from "./modules/auth/auth.routes.js";
import { inventoryRouter } from "./modules/inventory/inventory.routes.js";
import { verifyAccess } from "./middlewares/auth.js";
import { deckRouter } from "./modules/deck/deck.routes.js";
import { cardsRouter } from "./modules/cards/cards.routes.js";
import { gachaRouter } from "./modules/gacha/gacha.routes.js";
import { BattleArena } from "./rooms/BattleArena.js";
import path from "path";
import { fileURLToPath } from "url";

const server = defineServer({
    rooms: {
        lobby: defineRoom(Lobby),
        battle_arena: defineRoom(BattleArena)
    },

    express: (app) => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const publicDir = path.join(__dirname, "../public");

        app.use(express.json());
        app.use(express.static('public'))

        app.use(cors({
            origin: [
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ],
            credentials: true,
        }));

        // legacy paths
        app.use("/auth", authRouter);
        app.use("/inventory", verifyAccess, inventoryRouter);
        app.use("/deck", verifyAccess, deckRouter);
        app.use("/cards", verifyAccess, cardsRouter);
        app.use("/gacha", verifyAccess, gachaRouter);

        // API-prefixed paths for frontend defaults
        app.use("/api/auth", authRouter);
        app.use("/api/inventory", verifyAccess, inventoryRouter);
        app.use("/api/deck", verifyAccess, deckRouter);
        app.use("/api/cards", verifyAccess, cardsRouter);
        app.use("/api/gacha", verifyAccess, gachaRouter);

        app.use("/unit-card", express.static(path.join(publicDir, "unit-card")));
        app.use("/invocator-card", express.static(path.join(publicDir, "invocator-card")));

        app.use("/monitor", monitor());

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }
});

export default server;
