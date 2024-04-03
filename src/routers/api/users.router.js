import { Router, urlencoded } from 'express';
import passport from 'passport';
import UserController from '../../controllers/users.controller.js';
import { createHash, generateToken, isAdmin, isValidPassword, verifyToken, uploadDocument, IMAGE_URL_BASE } from '../../../utils/utils.js';
import { createUserDTO } from '../../dao/dto/user.dto.js';
import { logger } from '../../config/logger.js';
import EmailService from '../../services/email.service.js';

const router = Router();

router.get('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserController.getById(userId);
        logger.debug('UserController.getById() finished successfully')
        const userDTO = createUserDTO(user);
        res.status(200).json(userDTO);
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: GET. Path: /users/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id;
        await UserController.deleteById(userId);
        logger.debug('UserController.deleteById() finished successfully')
        logger.info('Successfully deleted user');
        return res.status(200).redirect('/login');
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: DELETE. Path: /users/current')
        res.status(404).json({ message: 'Pagina no encontrada' });
    }
});

router.put('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, age } = req.body;
        if (!first_name && !last_name && !age) {
            logger.warn('Complete the required fields');
            return res.status(400).json({ message: 'Complete los campos requeridos' });
        }
        const updatedUser = await UserController.updateById(userId, { first_name, last_name, age }, { new: true });
        logger.debug('UserController.updateById() finished successfully')
        logger.info(`User successfully updated: ${userId}`)
        res.status(200).json({ message: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: PUT. Path: /users/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/users/send-email-for-password-recovery', async (req, res) => {
    try {
        const { body } = req;
        const userEmail = body.email;
        const userIsRegistered = await UserController.getAll({ userEmail })
        logger.debug('UserController.getAll() finished successfully')
        if (!userIsRegistered) {
            logger.error('User not registered')
            throw new Error('Uuario no registrado')
        }

        const token = generateToken({ email: userEmail }, 'password-recovery')

        const emailService = EmailService.getInstance();
        await emailService.sendEmail(
            userEmail,
            'Link para recuperacion de contraseña',
            `<div>
            <a href='http://localhost:8080/new-password?token=${token}'><h1>Restaurar contraseña</h1></a>
            </div>`
        )
        logger.info(`Email sent to: ${userEmail}`)
        res.status(200).redirect('/recovery-password-mail-confirmation');
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: POST. Path: /users/send-email-for-password-recovery')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.post('/users/recovery-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) {
            logger.warn('Token no proporcionado');
            return res.status(403).json({ message: 'Token no proporcionado' });
        }

        const verifiedToken = await verifyToken(token);

        if (!verifiedToken) {
            logger.warn('Access prohibited');
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const tokenExpirationDate = new Date(verifiedToken.exp * 1000);
        if (new Date() > tokenExpirationDate) {
            logger.warn('El token ha expirado');
            return res.status(401).redirect('/recovery-password');
        }

        if (verifiedToken.type !== 'password-recovery') {
            logger.error('Access prohibited');
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const userEmail = verifiedToken.email;
        const users = await UserController.getAll({ email: userEmail });
        const user = users[0]
        logger.debug('UserController.getAll() finished successfully');

        const isNotValidPassword = !isValidPassword(password, user)


        if (!isNotValidPassword) {
            logger.error('Invalid password')
            throw new Error('Contraseña invalida')
        }

        user.password = createHash(password);
        await UserController.updateById(user._id, user);
        logger.debug('UserController.updateById() finished successfully');

        logger.info(`Password successfully updated`);
        res.status(200).redirect('/login');
    } catch (error) {
        logger.error(error.message);
        logger.error('Router error. Method: POST. Path: /users/recovery-password');
        res.status(500).json({ message: 'Error al intentar restaurar la contraseña' });
    }
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await UserController.getAll();
        logger.debug('UserController.getAll() finished successfully')
        const usersDTO = createUserDTO(users);
        logger.info('Users loaded successfully')
        res.status(200).json(usersDTO);
    } catch (error) {
        logger.error('Router Error. Method: GET. Path: /users')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.get('/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
        const user = await UserController.getById(uid);
        logger.debug('UserController.getById() finished successfully')
        const userDTO = createUserDTO(user);
        logger.info(`Viewing user profile: ${userDTO.email}`)
        res.status(200).json(userDTO);
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: GET. Path: /users/:uid')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/users/current/documents', passport.authenticate('jwt', { session: false }), uploadDocument.array('files', 3), async (req, res) => {
    try {
        const uid = req.user._id;
        const user = await UserController.getById(uid);
        req.files.forEach(file => {
            user.documents.push({
                name: file.originalname,
                reference: `${IMAGE_URL_BASE}/documents/${file.filename}`,
            });
        });
        await user.save();
        res.status(200).json({ message: "Documents laoded successfully" });
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: GET. Path: /users/current/documnets')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.put('/users/admin/approve-documents/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user.role !== 'admin') {
            logger.error('Not allowed')
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }

        const updatedUser = await UserController.approveDocuments(userId);
        logger.info('UserController.approveDocuments() finished successfully')
        res.status(200).json(updatedUser);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
})

router.put('/users/premium/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const uid = req.user._id;
        const user = await UserController.getById(uid);
        logger.info('UserController.getById() finished successfully')

        if (user.role === "user") {
            const allDocumentsApproved = user.documents.every(doc => doc.status === true);
            if (!allDocumentsApproved || user.documents.length < 3) {
                logger.error('Not allowed')
                return res.status(400).json({ message: 'No se ha terminado de procesar la documentacion' });
            } else {
                const userUpdated = await UserController.updateRole(uid);
                logger.debug('UserController.updateRole() finished successfully');
                const userDTO = createUserDTO(userUpdated);
                logger.info('Role updated to ' + userDTO.role)
                res.status(200).json(userDTO);
            }
        } else if (user.role === "premium") {
            const userUpdated = await UserController.updateRole(uid);
            logger.debug('UserController.updateRole() finished successfully');
            const userDTO = createUserDTO(userUpdated);
            logger.info('Role updated to ' + userDTO.role)
            res.status(200).json(userDTO);
        }
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: GET. Path: /users/premium/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.put('/users/premium/:uid', isAdmin, async (req, res) => {
    try {
        const uid = req.params.uid;
        const user = await UserController.getById(uid);
        logger.info('UserController.getById() finished successfully')

        if (user.role === "user") {
            const allDocumentsApproved = user.documents.every(doc => doc.status === true);
            if (!allDocumentsApproved || user.documents.length < 3) {
                logger.error('Not allowed')
                return res.status(400).json({ message: 'No se ha terminado de procesar la documentacion' });
            } else {
                const userUpdated = await UserController.updateRole(uid);
                logger.debug('UserController.updateRole() finished successfully');
                const userDTO = createUserDTO(userUpdated);
                logger.info('Role updated to ' + userDTO.role)
                res.status(200).json(userDTO);
            }
        } else if (user.role === "premium") {
            const userUpdated = await UserController.updateRole(uid);
            logger.debug('UserController.updateRole() finished successfully');
            const userDTO = createUserDTO(userUpdated);
            logger.info('Role updated to ' + userDTO.role)
            res.status(200).json(userDTO);
        }
    } catch (error) {
        logger.error(error.message);
        logger.error('Router Error. Method: GET. Path: /users/premium/current')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})

router.delete('/users', isAdmin, async (req, res) => {
    try {
        const limit = Date.now() - (2 * 24 * 60 * 60 * 1000);
        const inactiveUsers = await UserController.getAll({ last_connection: { $lt: new Date(limit) } });
        for (const user of inactiveUsers) {
            await UserController.deleteById(user._id)
            logger.debug('UserController.deleteById() finished successfully');
            logger.info(`User/s ${user._id} deleted`);
            const emailService = EmailService.getInstance();
            await emailService.sendEmail(
                user.email,
                'MoviEcommerce',
                `<h1>Cuenta eliminada</h1>
                <div>Su cuenta ha esatdo inactiva por mas de dos dias por lo que ha sido eliminada.
                Si asi lo desea puede volver a registrarse en el siguiente link:
                <a href="http://localhost:8080/register">Crear nuevo usuario</a></div>`
            )
        }        
        res.status(200).json(inactiveUsers);
    } catch (error) {
        console.error(error.message);
        console.error('Error en el router DELETE /users');
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.delete('/users/:uid', isAdmin, async (req, res) => {
    try {
        const uid = req.params.uid;
        await UserController.deleteById(uid);
        logger.debug('UserController.deleteById() finished successfully');
        res.status(200).json({ message: "Usuario eliminado correctamente"});
    } catch (error) {
        console.error(error.message);
        console.error('Error en el router DELETE /users/:uid');
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

export default router;