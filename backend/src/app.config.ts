import {
    defineServer,
    defineRoom,
    monitor,
    playground,
    createRouter,
    createEndpoint,
} from "colyseus";
import express from "express";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";
import { cardsRouter, cardsApiEndpoints } from "./cards/cards.routes.js";
import { authRouter, authApiEndpoints } from "./auth/auth.routes.js";
import { summonerRouter, summonerApiEndpoints } from "./summoner/summoner.routes.js";

const server = defineServer({
    /**
     * Define your room handlers:
     */
    rooms: {
        my_room: defineRoom(MyRoom)
    },

    /**
     * Experimental: Define API routes. Built-in integration with the "playground" and SDK.
     * 
     * Usage from SDK: 
     *   client.http.get("/api/hello").then((response) => {})
     * 
     */
    routes: createRouter({
        api_hello: createEndpoint("/api/hello", { method: "GET", }, async (ctx) => {
            return { message: "Hello World" }
        }),
        ...cardsApiEndpoints,
        ...authApiEndpoints,
        ...summonerApiEndpoints,
    }),

    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    express: (app) => {
        app.use(express.json());
        app.use("/auth", authRouter);
        app.use("/inventory", cardsRouter);
        app.use("/summoner", summonerRouter);
        app.get("/hi", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        // Inventory routes (Express)
        // (moved to cardsRouter)

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitoring/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    }

});

export default server;
