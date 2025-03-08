import { Router }  from 'express';
import { check  } from 'express-validator';
import { addProduct, updateProduct, deleteProduct, listProducts, searchProductById } from './product.controller.js';
import { existeProductById } from '../helpers/db-validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { validarJWT } from '../middlewares/validar-jwt.js';

const router = Router();

router.post(
    '/addPrduct',
    validarJWT,
    validarCampos,
    addProduct
);

router.put(
    '/:id',
    [
        validarJWT,
        check('id', 'Invalid ID').isMongoId(),
        check('id').custom(existeProductById),
        validarCampos
    ],
    updateProduct
);

router.delete(
    '/:id',
    [
        validarJWT,
        check('id', 'Invalid ID').isMongoId(),
        check('id').custom(existeProductById),
        validarCampos
    ],
    deleteProduct
);

router.get(
    '/',
    listProducts
);

router.get(
    '/:id',
    [
        check('id', 'Invalid ID').isMongoId(),
        check('id').custom(existeProductById),
        validarCampos
    ],
    searchProductById
)
export default router;