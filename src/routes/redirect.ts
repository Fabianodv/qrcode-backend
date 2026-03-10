import { Router } from "express";
import type { Request, Response } from "express";

// Importa o array em memória do módulo de qrcodes.
// Em uma implementação real, o redirect buscaria direto no banco de dados.
import { qrcodesRouter as _ } from "./qrcodes";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qrcodesModule = require("./qrcodes") as {
  qrcodes?: Array<{
    id: string;
    slug?: string;
    targetUrl: string;
    active: boolean;
  }>;
};

export const redirectRouter = Router();

redirectRouter.get("/:idOrSlug", (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  const qrcodes = qrcodesModule.qrcodes as
    | Array<{ id: string; slug?: string; targetUrl: string; active: boolean }>
    | undefined;

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

