"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrcodesRouter = exports.qrcodes = void 0;
const express_1 = require("express");
const crypto_1 = require("crypto");
const qrcode_1 = __importDefault(require("qrcode"));
// Armazenamento em memória APENAS para teste do esqueleto.
// Depois, isso deve ser substituído por acesso ao banco (PostgreSQL).
exports.qrcodes = [];
exports.qrcodesRouter = (0, express_1.Router)();
// Criar QR Code
exports.qrcodesRouter.post("/", (req, res) => {
    const { name, description, targetUrl, slug, active } = req.body;
    if (!name || !targetUrl) {
        return res.status(400).json({ message: "name e targetUrl são obrigatórios." });
    }
    const now = new Date().toISOString();
    const newItem = {
        id: (0, crypto_1.randomUUID)(),
        slug,
        name,
        description,
        targetUrl,
        active: active ?? true,
        createdAt: now,
        updatedAt: now
    };
    exports.qrcodes.push(newItem);
    return res.status(201).json(newItem);
});
// Listar QR Codes com filtros simples
exports.qrcodesRouter.get("/", (req, res) => {
    const { status, search } = req.query;
    let result = [...exports.qrcodes];
    if (status === "active") {
        result = result.filter((q) => q.active);
    }
    else if (status === "inactive") {
        result = result.filter((q) => !q.active);
    }
    if (search) {
        const term = search.toLowerCase();
        result = result.filter((q) => q.name.toLowerCase().includes(term) ||
            (q.description && q.description.toLowerCase().includes(term)));
    }
    return res.json(result);
});
// Detalhes de um QR Code
exports.qrcodesRouter.get("/:id", (req, res) => {
    const { id } = req.params;
    const item = exports.qrcodes.find((q) => q.id === id);
    if (!item) {
        return res.status(404).json({ message: "QR Code não encontrado." });
    }
    return res.json(item);
});
// Atualizar QR Code (nome, descrição, targetUrl, active)
exports.qrcodesRouter.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, targetUrl, active, slug } = req.body;
    const index = exports.qrcodes.findIndex((q) => q.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "QR Code não encontrado." });
    }
    const existing = exports.qrcodes[index];
    const updated = {
        ...existing,
        name: name ?? existing.name,
        description: description ?? existing.description,
        targetUrl: targetUrl ?? existing.targetUrl,
        active: typeof active === "boolean" ? active : existing.active,
        slug: slug ?? existing.slug,
        updatedAt: new Date().toISOString()
    };
    exports.qrcodes[index] = updated;
    return res.json(updated);
});
// Ativar / Desativar
exports.qrcodesRouter.patch("/:id/status", (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== "boolean") {
        return res.status(400).json({ message: "Campo 'active' é obrigatório e deve ser boolean." });
    }
    const item = exports.qrcodes.find((q) => q.id === id);
    if (!item) {
        return res.status(404).json({ message: "QR Code não encontrado." });
    }
    item.active = active;
    item.updatedAt = new Date().toISOString();
    return res.json(item);
});
// Geração de imagem do QR Code (PNG) a partir da URL pública /r/:idOuSlug
exports.qrcodesRouter.get("/:id/image", async (req, res) => {
    const { id } = req.params;
    const item = exports.qrcodes.find((q) => q.id === id);
    if (!item) {
        return res.status(404).json({ message: "QR Code não encontrado." });
    }
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"]?.toString() ||
        req.headers.host ||
        `localhost:${req.socket.localPort ?? 3000}`;
    const baseFromEnv = process.env.PUBLIC_BASE_URL; // ex.: http://meu-dominio.com ou http://192.168.0.10:3000
    const baseUrl = baseFromEnv && baseFromEnv.trim().length > 0 ? baseFromEnv : `${protocol}://${host}`;
    const publicUrl = `${baseUrl}/r/${item.slug ?? item.id}`;
    res.setHeader("Content-Type", "image/png");
    try {
        await qrcode_1.default.toFileStream(res, publicUrl, {
            type: "png",
            margin: 1,
            width: 300
        });
    }
    catch (error) {
        console.error("Erro ao gerar QR Code:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Erro ao gerar imagem do QR Code." });
        }
    }
});
