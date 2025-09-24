import "./register-alias";
import { appConfig } from "@/config/env";
import { buildServer } from "@/app";

const start = async (): Promise<void> => {
  const app = buildServer();

  try {
    await app.listen({ port: appConfig.server.port, host: appConfig.server.host });
    app.log.info(`Server listening on port ${appConfig.server.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();