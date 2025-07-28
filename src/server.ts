import config from "config";
import app from "./app";
import logger from "./config/logger";

const startServer = () => {
    const PORT = config.get("server.port") || 4001;
    try {
        app.listen(PORT, () =>
            logger.info(`Listening on port ${Number(PORT)}`),
        );
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

startServer();
