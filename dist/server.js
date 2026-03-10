"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const qrcodes_1 = require("./routes/qrcodes");
const redirect_1 = require("./routes/redirect");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rota simples de health-check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "qrcode-backend" });
});
// Rotas de autenticação (painel)
app.use("/api/auth", auth_1.authRouter);
// Rotas de CRUD de QR Codes (painel)
app.use("/api/qrcodes", qrcodes_1.qrcodesRouter);
// Endpoint público de redirecionamento
app.use("/r", redirect_1.redirectRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`QR Code backend rodando na porta ${PORT}`);
});
