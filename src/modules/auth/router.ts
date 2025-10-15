import { Router } from "express";
import { renderLogin, postLogin, logout } from "./controllers/authController";
import { loginLimiter } from "./middlewares/loginLimiter";
import { loginValidators } from "./validators/expressValidators";

const router = Router();

router.get("/login", renderLogin);
router.post("/login", loginValidators, loginLimiter, postLogin);
router.post("/logout", logout);

export default router;
