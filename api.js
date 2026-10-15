import express from "express";

// expresss app
export const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ok' })
})