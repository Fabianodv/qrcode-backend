import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth";
import { qrcodesRouter } from "./routes/qrcodes";
import { redirectRouter } from "./routes/redirect";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota simples de health-check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "qrcode-backend" });
});

// Rotas de autenticação (painel)
app.use("/api/auth", authRouter);

// Rotas de CRUD de QR Codes (painel)
app.use("/api/qrcodes", qrcodesRouter);

// Endpoint público de redirecionamento
app.use("/r", redirectRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`QR Code backend rodando na porta ${PORT}`);
});

