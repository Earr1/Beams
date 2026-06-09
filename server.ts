import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Local file store held in memory for direct peer downloads
interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 payload
}

const fileStore = new Map<string, StoredFile>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Let express capture high size payloads for images/videos
  app.use(express.json({ limit: "80mb" }));
  app.use(express.urlencoded({ limit: "80mb", extended: true }));

  // API Route: Check sharing node status
  app.get("/api/status", (req, res) => {
    res.json({
      status: "active",
      engine: "SwiftBeam Core P2P Express Router",
      filesSharedCount: fileStore.size,
      uptime: process.uptime(),
    });
  });

  // API Route: Upload file from sharing sender
  app.post("/api/upload", (req, res) => {
    try {
      const { id, name, type, size, data } = req.body;
      
      if (!id || !name || !data) {
        return res.status(400).json({ error: "Missing file details or payload data" });
      }

      fileStore.set(id, { id, name, type, size, data });
      console.log(`[SwiftBeam Server] File shared successfully: ${name} (${size} bytes)`);

      res.json({
        success: true,
        fileId: id,
        downloadUrl: `/api/download/${id}`,
      });
    } catch (err: any) {
      console.error("[SwiftBeam Server] File share upload failure:", err);
      res.status(500).json({ error: "Failed to load/share file into local storage" });
    }
  });

  // API Route: Download file to receiver (direct local network stream)
  app.get("/api/download/:fileId", (req, res) => {
    try {
      const { fileId } = req.params;
      const file = fileStore.get(fileId);

      if (!file) {
        return res.status(404).send(`
          <html>
            <body style="font-family: sans-serif; background-color: #0f172a; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
              <h2 style="color: #ef4444;">File Not Found or Expired</h2>
              <p>The shared peer connection session has closed or the file is no longer hosted on the active sender node.</p>
              <a href="/" style="background-color: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Return to SwiftBeam</a>
            </body>
          </html>
        `);
      }

      // Convert Base64 back to raw binary Buffer
      const base64Data = file.data.includes(";base64,")
        ? file.data.split(";base64,")[1]
        : file.data;

      const fileBuffer = Buffer.from(base64Data, "base64");

      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader("Content-Type", file.type || "application/octet-stream");
      res.setHeader("Content-Length", fileBuffer.length);

      res.send(fileBuffer);
    } catch (err: any) {
      console.error("[SwiftBeam Server] Download stream error:", err);
      res.status(500).send("Error downloading file stream");
    }
  });

  // API Route: Delete shared file
  app.delete("/api/file/:fileId", (req, res) => {
    const { fileId } = req.params;
    if (fileStore.has(fileId)) {
      fileStore.delete(fileId);
      res.json({ success: true, message: "File unshared" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // API Route: Clear all shared files
  app.delete("/api/clear", (req, res) => {
    fileStore.clear();
    res.json({ success: true, message: "Cleaned all in-memory hosted files" });
  });

  // Vite development vs production assets routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SwiftBeam Router] Live connection initialized on port ${PORT}`);
  });
}

startServer();
