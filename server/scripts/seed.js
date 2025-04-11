import mongoose from "mongoose";
import dotenv from "dotenv";
import Visit from "../models/Visit.js";
import Page from "../models/Page.js";
import connectDB from "../config/mongodb.js";

dotenv.config();

const pages = [
  { path: "/accueil", title: "Accueil" },
  { path: "/produits", title: "Nos Produits" },
  { path: "/blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
  { path: "/a-propos", title: "À Propos" },
  { path: "/services", title: "Services" },
  { path: "/faq", title: "FAQ" },
  {
    path: "/politique-de-confidentialite",
    title: "Politique de Confidentialité",
  },
];

const countries = [
  "France",
  "États-Unis",
  "Allemagne",
  "Royaume-Uni",
  "Canada",
  "Espagne",
  "Italie",
  "Chine",
  "Japon",
  "Australie",
  "Brésil",
  "Inde",
  "Russe",
  "Indonésie",
  "Mexique",
  "Nigeria",
  "Pakistan",
  "Suisse",
];

const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Other"];
const devices = ["desktop", "mobile", "tablet"];

function generateVisits(count) {
  const visits = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < count; i++) {
    const date = new Date(
      startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
    );
    const sessionId = `session_${Math.floor(Math.random() * 1000)}`;
    const page = pages[Math.floor(Math.random() * pages.length)];
    const duration = Math.floor(Math.random() * 600);

    visits.push({
      timestamp: date,
      page: page.path,
      duration,
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      sessionId,
      userAgent: "Mozilla/5.0 (Example)",
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`,
      referrer: Math.random() > 0.7 ? "https://google.com" : "",
    });
  }

  return visits;
}

async function seed() {
  try {
    console.log("Connexion à MongoDB...");
    await connectDB();

    console.log("Suppression des données existantes...");
    await Promise.all([Visit.deleteMany({}), Page.deleteMany({})]);

    console.log("Génération des données de test...");
    const visits = generateVisits(1000);

    console.log("Insertion des visites...");
    await Visit.insertMany(visits);

    console.log("Mise à jour des statistiques des pages...");
    for (const page of pages) {
      const pageVisits = visits.filter((v) => v.page === page.path);
      const uniqueVisitors = new Set(pageVisits.map((v) => v.sessionId)).size;
      const totalDuration = pageVisits.reduce((sum, v) => sum + v.duration, 0);
      const avgTimeOnPage =
        pageVisits.length > 0 ? totalDuration / pageVisits.length : 0;

      // Calculer le taux de rebond
      const sessions = new Map();
      pageVisits.forEach((visit) => {
        if (!sessions.has(visit.sessionId)) {
          sessions.set(visit.sessionId, []);
        }
        sessions.get(visit.sessionId).push(visit);
      });

      const bounceCount = Array.from(sessions.values()).filter(
        (sessionVisits) =>
          sessionVisits.length === 1 && sessionVisits[0].duration < 30
      ).length;

      const bounceRate =
        sessions.size > 0 ? (bounceCount / sessions.size) * 100 : 0;

      await Page.create({
        path: page.path,
        title: page.title,
        views: pageVisits.length,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate,
        lastUpdated: new Date(),
      });
    }

    console.log("Données de test générées avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la génération des données:", error);
    process.exit(1);
  }
}

// Lancer le script
seed();
