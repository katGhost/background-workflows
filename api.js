import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client.js";
import { sayHello } from "./src/inngest/functions.js";


// expresss app
export const app = express();

// Express middleware
app.use(express.json());
app.use('/api/inngest', serve({
  client: inngest,
  functions: [ sayHello ],
}));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok' })
})