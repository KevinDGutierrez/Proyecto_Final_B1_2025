import { Router }  from 'express';
import { check  } from 'express-validator';
import { addCategory, updateCategory, deleteCategory, getCategories, getCategoryById } from './category.controller.js'
import { validarJWT } from '../middlewares/validar-jwt.js'
import { validarCampos } from '../middlewares/validar-campos.js'
import { existeCategoryById } from '../helpers/db-validator.js'

const router = Router();

router.post(
    '/addCategory',
    [
        validarJWT,
        check('name', 'El nombre de la categoría es obligatorio').not().isEmpty(),
        validarCampos

    ],
    addCategory
);

router.put(
    '/:id',
    [
        validarJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategoryById),
        validarCampos
    ],
    updateCategory
);

router.delete(
    '/:id',
    [
        validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeCategoryById),
    ],
    deleteCategory
);

router.get(
    '/',
    validarJWT,
    getCategories
);

router.get(
    '/:id',
    [
        validarJWT,
        check('id', 'Invalid ID').isMongoId(),
        check('id').custom(existeCategoryById),
        validarCampos
    ],
    getCategoryById
);

export default router;