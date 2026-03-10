import { Router } from "express";
import { randomUUID } from "crypto";
import QRCodeLib from "qrcode";

export type QRCode = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

// Armazenamento em memória APENAS para teste do esqueleto.
// Depois, isso deve ser substituído por acesso ao banco (PostgreSQL).
export const qrcodes: QRCode[] = [];

export const qrcodesRouter = Router();

// Criar QR Code
qrcodesRouter.post("/", (req, res) => {
  const { name, description, targetUrl, slug, active } = req.body as Partial<QRCode> & {
    targetUrl?: string;
    name?: string;
  };

  if (!name || !targetUrl) {
    return res.status(400).json({ message: "name e targetUrl são obrigatórios." });
  }

  const now = new Date().toISOString();
  const newItem: QRCode = {
    id: randomUUID(),
    slug,
    name,
    description,
    targetUrl,
    active: active ?? true,
    createdAt: now,
    updatedAt: now
  };

  qrcodes.push(newItem);
  return res.status(201).json(newItem);
});

// Listar QR Codes com filtros simples
qrcodesRouter.get("/", (req, res) => {
  const { status, search } = req.query as { status?: string; search?: string };

  let result = [...qrcodes];

  if (status === "active") {
    result = result.filter((q) => q.active);
  } else if (status === "inactive") {
    result = result.filter((q) => !q.active);
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (q) =>
        q.name.toLowerCase().includes(term) ||
        (q.description && q.description.toLowerCase().includes(term))
    );
  }

  return res.json(result);
});

// Detalhes de um QR Code
qrcodesRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  const item = qrcodes.find((q) => q.id === id);
  if (!item) {
    return res.status(404).json({ message: "QR Code não encontrado." });
  }
  return res.json(item);
});

// Atualizar QR Code (nome, descrição, targetUrl, active)
qrcodesRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, targetUrl, active, slug } = req.body as Partial<QRCode>;

  const index = qrcodes.findIndex((q) => q.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "QR Code não encontrado." });
  }

  const existing = qrcodes[index];
  const updated: QRCode = {
    ...existing,
    name: name ?? existing.name,
    description: description ?? existing.description,
    targetUrl: targetUrl ?? existing.targetUrl,
    active: typeof active === "boolean" ? active : existing.active,
    slug: slug ?? existing.slug,
    updatedAt: new Date().toISOString()
  };

  qrcodes[index] = updated;
  return res.json(updated);
});

// Ativar / Desativar
qrcodesRouter.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { active } = req.body as { active?: boolean };

  if (typeof active !== "boolean") {
    return res.status(400).json({ message: "Campo 'active' é obrigatório e deve ser boolean." });
  }

  const item = qrcodes.find((q) => q.id === id);
  if (!item) {
    return res.status(404).json({ message: "QR Code não encontrado." });
  }

  item.active = active;
  item.updatedAt = new Date().toISOString();

  return res.json(item);
});

// Geração de imagem do QR Code (PNG) a partir da URL pública /r/:idOuSlug
qrcodesRouter.get("/:id/image", async (req, res) => {
  const { id } = req.params;
  const item = qrcodes.find((q) => q.id === id);

  if (!item) {
    return res.status(404).json({ message: "QR Code não encontrado." });
  }
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined) || req.protocol || "http";
  const host =
    req.headers["x-forwarded-host"]?.toString() ||
    req.headers.host ||
    `localhost:${req.socket.localPort ?? 3000}`;

  const baseFromEnv = process.env.PUBLIC_BASE_URL; // ex.: http://meu-dominio.com ou http://192.168.0.10:3000
  const baseUrl = baseFromEnv && baseFromEnv.trim().length > 0 ? baseFromEnv : `${protocol}://${host}`;

  const publicUrl = `${baseUrl}/r/${item.slug ?? item.id}`;

  res.setHeader("Content-Type", "image/png");

  try {
    await QRCodeLib.toFileStream(res, publicUrl, {
      type: "png",
      margin: 1,
      width: 300
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Erro ao gerar imagem do QR Code." });
    }
  }
});


