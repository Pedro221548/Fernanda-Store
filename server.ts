import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Mock Data for Fernanda Store
const MOCK_DATA = {
  settings: {
    store_name: "Fernanda Store",
    store_logo: "https://i.imgur.com/W0Q46wl.jpeg",
    contact_whatsapp: "5527998200474",
    contact_email: "contato@fernandastore.com.br",
    theme_color: "#db2777"
  },
  products: [
    {
      id: 1,
      name: "Vestido Midi Floral",
      description: "Vestido elegante para ocasiões especiais.",
      price: 259.90,
      offer_price: 199.90,
      is_offer: 1,
      category: "Vestidos",
      active: 1,
      images: [{ image_data: "https://picsum.photos/seed/vestido1/600/800" }]
    },
    {
      id: 2,
      name: "Blusa de Seda",
      description: "Conforto e sofisticação para o dia a dia.",
      price: 149.90,
      category: "Blusas",
      active: 1,
      images: [{ image_data: "https://picsum.photos/seed/blusa1/600/800" }]
    }
  ],
  banners: [
    {
      id: 1,
      title: "Nova Coleção Outono",
      subtitle: "Confira as tendências",
      image_url: "https://picsum.photos/seed/banner1/1920/1080",
      active: 1
    }
  ]
};

// Auth
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  // Hardcoded credentials as requested
  if (username === "adm" && password === "123456") {
    const token = jwt.sign({ id: 1, username: "adm" }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Public Data
app.get("/api/public/data", (_req, res) => {
  res.json({ 
    products: MOCK_DATA.products, 
    settings: MOCK_DATA.settings, 
    banners: MOCK_DATA.banners 
  });
});

app.get("/api/public/products/:id", (req, res) => {
  const product = MOCK_DATA.products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Produto não encontrado" });
  }
});

// Admin routes (Mocked)
app.get("/api/admin/products", authenticateToken, (_req, res) => {
  res.json(MOCK_DATA.products);
});

app.post("/api/admin/products", authenticateToken, (req, res) => {
  res.json({ id: Date.now(), ...req.body });
});

app.put("/api/admin/products/:id", authenticateToken, (_req, res) => {
  res.json({ success: true });
});

app.delete("/api/admin/products/:id", authenticateToken, (_req, res) => {
  res.json({ success: true });
});

app.get("/api/admin/settings", authenticateToken, (_req, res) => {
  const settingsArray = Object.entries(MOCK_DATA.settings).map(([key, value]) => ({ key, value }));
  res.json(settingsArray);
});

app.post("/api/admin/settings", authenticateToken, (_req, res) => {
  res.json({ success: true });
});

app.get("/api/admin/banners", authenticateToken, (_req, res) => {
  res.json(MOCK_DATA.banners);
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
