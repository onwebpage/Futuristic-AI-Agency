import app from "./app";
import { logger } from "./lib/logger";
import { validateEnvironment, logValidationResults } from "./lib/validate-env";

// Validate environment variables before starting server
const validationResult = validateEnvironment();
logValidationResults(validationResult);

if (!validationResult.valid) {
  console.error("\n❌ Server startup aborted due to configuration errors.\n");
  process.exit(1);
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
