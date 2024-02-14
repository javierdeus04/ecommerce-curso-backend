import { Router, urlencoded } from 'express';
import passport from 'passport';
import UserController from '../../controllers/users.controller.js';
import { isAdmin } from '../../../utils/utils.js';
import { createUserDTO } from '../../dao/dto/user.dto.js';
import { logger } from '../../config/logger.js';

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

router.post('/users/recovery-password', passport.authenticate('recovery-password', { session: false, failureRedirect: '/recovery-password' }), async (req, res) => {
    logger.info(`Password successfully updated`);
    res.status(200).redirect('/login');
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

export default router;