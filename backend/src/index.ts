import { listen } from "@colyseus/tools";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";


const start = async () => {
    await connectToDatabase();
    listen(app);
};

start()
