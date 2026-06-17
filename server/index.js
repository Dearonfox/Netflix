const http = require("http");
const { mkdir, readFile, writeFile } = require("fs/promises");
const path = require("path");

const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = path.join(__dirname, "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

async function readNotes() {
  try {
    const raw = await readFile(NOTES_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeNotes(notes) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf8");
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function noteKey(user, movieId) {
  return `${encodeURIComponent(user)}:${movieId}`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return send(res, 204, {});
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, service: "netflix-clone-api" });
    }

    const match = url.pathname.match(/^\/api\/movies\/(\d+)\/note$/);
    if (!match) {
      return send(res, 404, { error: "Not found" });
    }

    const movieId = match[1];
    const user = (url.searchParams.get("user") || "").trim();
    if (!user) {
      return send(res, 400, { error: "user query parameter is required" });
    }

    const notes = await readNotes();
    const key = noteKey(user, movieId);

    if (req.method === "GET") {
      return send(res, 200, { movieId: Number(movieId), user, note: notes[key]?.note || "" });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const note = String(body.note || "").slice(0, 500);
      notes[key] = { movieId: Number(movieId), user, note, updatedAt: new Date().toISOString() };
      await writeNotes(notes);
      return send(res, 200, notes[key]);
    }

    if (req.method === "DELETE") {
      delete notes[key];
      await writeNotes(notes);
      return send(res, 200, { movieId: Number(movieId), user, note: "" });
    }

    return send(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return send(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Netflix clone API running on http://localhost:${PORT}`);
});
