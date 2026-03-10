"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
exports.authRouter = (0, express_1.Router)();
// Login básico (apenas esqueleto; sem banco ainda)
exports.authRouter.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
    }
    // TODO: validar usuário/senha em banco de dados
    // No esqueleto, simplesmente retorna um token fake
    return res.json({
        token: "fake-token-apenas-para-teste",
        user: {
            username,
            role: "ti"
        }
    });
});
