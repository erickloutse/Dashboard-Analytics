import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/analytics";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Ces options sont les meilleures pratiques recommandées
      autoIndex: true, // Construire les index
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Garder la tentative initiale de connexion pendant 5 secondes
      socketTimeoutMS: 45000, // Fermer les sockets après 45 secondes d'inactivité
      family: 4, // Utiliser IPv4, ignorer IPv6
    });

    console.log("Connecté à MongoDB avec succès");

    mongoose.connection.on("error", (err) => {
      console.error("Erreur MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Déconnecté de MongoDB");
    });

    // Gérer la fermeture propre
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Erreur de connexion MongoDB:", error);
    process.exit(1);
  }
}

export default connectDB;
