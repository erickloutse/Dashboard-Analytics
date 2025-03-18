import { randomUUID } from "crypto";
import { db, statements } from "../config/db.js";

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
  "Japon",
  "Australie",
  "Brésil",
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
      id: randomUUID(),
      timestamp: date.toISOString(),
      page: page.path,
      duration,
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      session_id: sessionId,
      user_agent: "Mozilla/5.0 (Example)",
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`,
      referrer: Math.random() > 0.7 ? "https://google.com" : "",
    });
  }

  return visits;
}

function seed() {
  try {
    console.log("Starting database seeding...");

    // Begin transaction
    const transaction = db.transaction(() => {
      // Clear existing data
      db.prepare("DELETE FROM visits").run();
      db.prepare("DELETE FROM pages").run();
      console.log("Cleared existing data");

      // Generate and insert visits
      const visits = generateVisits(1000);
      console.log("Generated 1000 sample visits");

      // Insert visits and update page statistics
      for (const visit of visits) {
        statements.insertVisit.run(visit);
        statements.updatePageStats.run({
          path: visit.page,
          title: pages.find((p) => p.path === visit.page)?.title || visit.page,
          duration: visit.duration,
          session_id: visit.session_id,
        });
      }

      // Update bounce rates
      for (const page of pages) {
        const bounceRate = Math.random() * 100;
        db.prepare(
          `
          UPDATE pages 
          SET bounce_rate = ? 
          WHERE path = ?
        `
        ).run(bounceRate, page.path);
      }

      console.log("Inserted visits and updated page statistics");
    });

    // Execute transaction
    transaction();
    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding
seed();
