import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client.js";
import { sayHello, makeReport, heartbeat } from "./src/inngest/functions.js";
import { v4 as uuid4 } from "uuid";


// In-memory storage -> array of objects
export const inMemDB = [];

// expresss app
export const app = express();

// Express middleware
app.use(express.json());
app.use('/api/inngest', serve({
  client: inngest,
  functions: [sayHello, makeReport, heartbeat],
}));


// Endpoints -> temporal
app.post('/reports', async (req, res, next) => {
  const { topic } = req.body;

  // Validate input
  if (!topic) {
    return res.status(400).json({ error: 'topic is required' });
  }

  const id = uuid4();

  // Save immediately -> before anything async
  inMemDB.push({ id, topic, status: 'pending' });

  // Fire the event
  await inngest.send({
    name: 'report/requested',
    data: { id, topic },
  }).catch(err => next(err));

  // Return 202 instantly
  res.status(202).json({ id, status: 'pending' });
});

// reports status endpoint
app.get('/reports/:id', async (req, res, next) => {
  const { id } = req.params;

  // Find the report in the in-memory DB
  const report = inMemDB.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Validate id
  if (!report.id || report.id !== id) {
    return res.status(404).json({ error: `Report for ${id} not found` });
  }

  return res.status(200).json(report);

})


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok' });
})