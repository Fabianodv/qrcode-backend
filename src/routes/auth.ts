import { Router } from "express";

export const authRouter = Router();

// Login básico (apenas esqueleto; sem banco ainda)
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

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

