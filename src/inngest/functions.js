import { inngest } from "./client.js";
import { inMemDB } from "../../api.js";

export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");
    return { message: "Hello from the background!" };
  },
);

export const makeReport = inngest.createFunction(
  { id: "make-report", triggers: [{ event: "report/requested" }], retries: 2 },

  async ({ event, step }) => {
    await step.sleep("do-the-slow-work", "8s");

    // fail step
    if (event.data.topic === "fail") {
      throw new Error("The report oven is broken!");
    }

    const result = await step.run("build-report", () => {

      //  Find existing record first -> then update that record's status/data
      let existingReport = inMemDB.find(r => r.id === event.data.id);
      if (existingReport) {
        existingReport.status = 'done';
        return existingReport;
      }

      // otherwise, create a new report object and push it to the in-memory DB
      const report = { ...event.data, status: 'done' };
      inMemDB.push(report);
      return report;
    });
    return result;
  },
);

// heartbeat function
export const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async () => {
    const done = inMemDB.filter((r) => r.status === "done").length;
    const pending = inMemDB.filter((r) => r.status === "pending").length;
    const failed = inMemDB.filter((r) => r.status === "failed").length;

    console.log(`done: ${done}, pending: ${pending}, failed: ${failed}`);
  },
);