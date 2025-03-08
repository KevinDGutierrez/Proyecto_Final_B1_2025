import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js"
import { addCart } from "./cart.controller.js";

const router = Router();

router.post(
    "/addCart",
    validarJWT,
    addCart
)

export default router;