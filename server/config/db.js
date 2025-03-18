import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the data directory exists
const dataDir = join(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || join(dataDir, "analytics.db");

const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === "development" ? console.log : null,
});

// Enable foreign keys and WAL mode for better performance
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    page TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    country TEXT DEFAULT 'Unknown',
    device TEXT CHECK(device IN ('desktop', 'mobile', 'tablet')) DEFAULT 'desktop',
    browser TEXT DEFAULT 'Unknown',
    session_id TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    referrer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pages (
    path TEXT PRIMARY KEY,
    title TEXT,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_on_page INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
  CREATE INDEX IF NOT EXISTS idx_visits_page ON visits(page);
  CREATE INDEX IF NOT EXISTS idx_visits_session ON visits(session_id);
  CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);
  CREATE INDEX IF NOT EXISTS idx_visits_device ON visits(device);
  CREATE INDEX IF NOT EXISTS idx_visits_browser ON visits(browser);
`);

// Create functions for common operations
db.function("now", () => new Date().toISOString());

// Prepare common statements
export const statements = {
  insertVisit: db.prepare(`
    INSERT INTO visits (
      id, timestamp, page, duration, country, device, 
      browser, session_id, user_agent, ip, referrer
    ) VALUES (
      @id, @timestamp, @page, @duration, @country, @device,
      @browser, @session_id, @user_agent, @ip, @referrer
    )
  `),

  updatePageStats: db.prepare(`
    INSERT INTO pages (path, title, views, unique_visitors, avg_time_on_page, bounce_rate)
    VALUES (@path, @title, 1, 1, @duration, 0)
    ON CONFLICT(path) DO UPDATE SET
      views = views + 1,
      unique_visitors = unique_visitors + 
        CASE WHEN (
          SELECT COUNT(*) FROM visits 
          WHERE page = @path AND session_id = @session_id
        ) = 0 THEN 1 ELSE 0 END,
      avg_time_on_page = (
        (avg_time_on_page * views + @duration) / (views + 1)
      ),
      last_updated = CURRENT_TIMESTAMP
  `),

  getVisits: db.prepare(`
    SELECT * FROM visits
    WHERE (@startDate IS NULL OR timestamp >= @startDate)
      AND (@endDate IS NULL OR timestamp <= @endDate)
      AND (@country IS NULL OR country = @country)
      AND (@device IS NULL OR device = @device)
      AND (@browser IS NULL OR browser = @browser)
      AND (@page IS NULL OR page = @page)
    ORDER BY timestamp DESC
    LIMIT @limit OFFSET @offset
  `),

  getPageStats: db.prepare(`
    SELECT * FROM pages
    WHERE (@search IS NULL OR path LIKE '%' || @search || '%')
    ORDER BY 
      CASE @sortBy
        WHEN 'views' THEN views
        WHEN 'unique_visitors' THEN unique_visitors
        WHEN 'avg_time_on_page' THEN avg_time_on_page
        ELSE views
      END DESC
    LIMIT @limit
  `),

  getActiveUsers: db.prepare(`
    SELECT COUNT(DISTINCT session_id) as count
    FROM visits
    WHERE timestamp >= datetime('now', '-5 minutes')
  `),
};

export { db };

export default statements;
