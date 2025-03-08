import { Router }  from 'express';
import { check  } from 'express-validator';
import { register, login, getUsers, getUserById, updateUser, deleteUser } from './user.controller.js';
import { registerValidator, loginValidator } from '../middlewares/validator.js';
import { deleteFileOnError } from '../middlewares/delete-file-on-error.js';
import { validarJWT } from '../middlewares/validar-jwt.js';
import { existeUserById } from '../helpers/db-validator.js';
import { validarCampos } from '../middlewares/validar-campos.js';

const router = Router();

router.post(
    '/register',
    registerValidator,
    deleteFileOnError,
    validarCampos,
    register
);

router.post(
    '/login',
    loginValidator,
    deleteFileOnError,
    login
);

router.get(
    '/',
    getUsers
);

router.get(
    "/:id",
    [
        check("id", "Invalid ID").not().isEmpty(),
        check("id").custom(existeUserById),
        validarCampos,
    ],
    getUserById
);

router.put(
    '/:id',
    [
        validarJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeUserById),
        validarCampos
    ],
    updateUser
);

router.delete(
    "/:id",
    [
        validarJWT,
        check("id", "Invalid ID").not().isEmpty(),
        check("id").custom(existeUserById),
        validarCampos,
    ],
    deleteUser
);

export default router;