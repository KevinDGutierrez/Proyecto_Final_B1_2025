import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js"
import { existeBillById } from "../helpers/db-validator.js";
import { createBill, viewMyBill, getBill, getBillById, updateBill } from "./bill.controller.js";

const router = Router();

router.post(
    "/createBill",
    validarJWT,
    createBill
);

router.post(
    "/viewMyBill",
    validarJWT,
    viewMyBill
);

router.get(
    '/',
    validarJWT,
    getBill
);

router.get(
    '/:id',
    validarJWT,
    getBillById
);

router.put(
    "/:id",
    validarJWT,
    updateBill
)

export default router;