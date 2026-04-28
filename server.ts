import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

interface Guest {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

// In-memory guest store (Note: cleared on server restart)
let guests: Guest[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get all guests
  app.get("/api/guests", (req, res) => {
    res.json(guests);
  });

  // Add a new guest
  app.post("/api/guests", (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Missing name or phone" });
    
    const newGuest: Guest = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      phone,
      status: 'pending',
      timestamp: Date.now()
    };
    
    guests = [newGuest, ...guests];
    res.status(201).json(newGuest);
  });

  // Update guest status (Automated RSVP)
  app.post("/api/rsvp", (req, res) => {
    const { name, status } = req.body;
    const guest = guests.find(g => g.name === name);
    
    if (guest) {
      guest.status = status;
      return res.json({ success: true, guest });
    }
    
    res.status(404).json({ error: "Guest not found" });
  });

  // Delete guest
  app.delete("/api/guests/:id", (req, res) => {
    guests = guests.filter(g => g.id !== req.params.id);
    res.json({ success: true });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
