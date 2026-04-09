import { processDueJobs } from "@/features/jobs/service";

async function main() {
  const processed = await processDueJobs();
  console.log(`Processed ${processed} background job(s)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
