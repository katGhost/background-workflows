import { inngest } from "./client.js";

export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "5s");
    return { message: "Hello from the background!" };
  },
);