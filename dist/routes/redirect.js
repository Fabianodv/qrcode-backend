"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectRouter = void 0;
const express_1 = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qrcodesModule = require("./qrcodes");
exports.redirectRouter = (0, express_1.Router)();
exports.redirectRouter.get("/:idOrSlug", (req, res) => {
    const { idOrSlug } = req.params;
    const qrcodes = qrcodesModule.qrcodes;
    if (!qrcodes) {
        return res.status(500).send("Configuração de QR Codes não encontrada.");
    }
    const item = qrcodes.find((q) => q.id === idOrSlug || q.slug === idOrSlug);
    if (!item) {
        return res.status(404).send("QR Code não encontrado.");
    }
    if (!item.active) {
        return res.status(410).send("Este QR Code está inativo.");
    }
    // Redireciona para a URL de destino atual
    return res.redirect(302, item.targetUrl);
});
