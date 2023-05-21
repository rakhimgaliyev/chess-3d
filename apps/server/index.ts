import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})

const port  = process.env.PORT

app.get('/', async (req: Request, res: Response) => {
  const text = await new Promise((resolve) => {
    setTimeout(() => resolve('hui'), 2000)
  })
  res.send(text);
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
