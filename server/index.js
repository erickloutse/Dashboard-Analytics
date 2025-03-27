import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/mongodb.js";

// Routes
import visitsRoutes from "./routes/visits.js";
import pagesRoutes from "./routes/pages.js";
import statsRoutes from "./routes/stats.js";

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
await connectDB();

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/visits", visitsRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/stats", statsRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connecté:", socket.id);

  // Send initial data to the client
  socket.emit("welcome", { message: "Connecté au serveur Analytics" });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// Export io instance for use in other files
export { io };
