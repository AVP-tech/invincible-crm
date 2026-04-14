import { logger } from "@/lib/logger";
import { processDueJobs } from "@/features/jobs/service";

async function main() {
  const processed = await processDueJobs();
  logger.info("Processed background jobs.", {
    processed
  });
}

main()
  .catch((error) => {
    logger.error("Background job worker failed.", error);
    process.exitCode = 1;
  });
