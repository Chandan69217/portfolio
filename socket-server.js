const { Server } = require("socket.io");
const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const http = require("http");

const prisma = new PrismaClient();

// HTTP server for health checks (prevents Render free tier spin-down)
const httpServer = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

httpServer.listen(process.env.PORT || 3001, () => {
  console.log(`Socket.IO server running on port ${process.env.PORT || 3001}`);
  console.log(`Health check: ${process.env.NEXT_PUBLIC_WS_URL}/health`);
});

let users = new Map();

io.on("connection", (socket) => {
  let sessionId = socket.handshake.auth.sessionId || randomUUID();
  let username = socket.handshake.auth.username || "Guest " + Math.floor(Math.random() * 1000);
  let avatar = socket.handshake.auth.avatar || "default";
  let color = socket.handshake.auth.color || "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  socket.emit("session", { sessionId });

  const user = {
    id: sessionId,
    socketId: socket.id,
    name: username,
    avatar: avatar,
    color: color,
    isOnline: true,
    location: "Earth",
    flag: "🌍",
    posX: 0,
    posY: 0,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  users.set(socket.id, user);

  // Send initial data to the new connection
  prisma.message.findMany({
    take: 100,
    orderBy: { createdAt: 'asc' }
  }).then(msgs => {
    socket.emit("msgs-receive-init", msgs);
  }).catch(err => console.error("Prisma fetch error:", err));

  io.emit("users-updated", Array.from(users.values()));

  socket.on("msg-send", async (data) => {
    const u = users.get(socket.id);
    if (!u) return;

    try {
      const newMsg = await prisma.message.create({
        data: {
          sessionId: u.id,
          username: u.name,
          avatar: u.avatar,
          color: u.color,
          content: data.content,
          flag: u.flag || "🌍",
          country: "Global",
        }
      });
      io.emit("msg-receive", newMsg);
    } catch (e) {
      console.error("Failed to save msg:", e);
    }
  });

  socket.on("update-user", (data) => {
    const u = users.get(socket.id);
    if (u) {
      if (data.username) u.name = data.username;
      if (data.avatar) u.avatar = data.avatar;
      if (data.color) u.color = data.color;
      users.set(socket.id, u);
      io.emit("users-updated", Array.from(users.values()));
    }
  });

  socket.on("typing:start", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("typing:start", { sessionId: user.id, username: user.name });
    }
  });

  socket.on("typing:stop", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("typing:stop", { sessionId: user.id });
    }
  });

  // Remote cursors specific implementation
  socket.on("cursor-change", (data) => {
    const u = users.get(socket.id);
    if (u) {
      u.posX = data.pos.x;
      u.posY = data.pos.y;
      u.location = data.location || u.location;
      u.flag = data.flag || u.flag;
      users.set(socket.id, u);
      // broadcast the change to other users
      socket.broadcast.emit("cursor-changed", {
        socketId: socket.id,
        pos: data.pos,
        ...u
      });
    }
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("users-updated", Array.from(users.values()));
  });
});

console.log("Socket.IO backend server running on port 3001");
