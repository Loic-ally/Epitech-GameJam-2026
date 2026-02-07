import { listen } from "@colyseus/tools";
import app from "./app.js";

const start = async () => {
    listen(app);
};

start()
