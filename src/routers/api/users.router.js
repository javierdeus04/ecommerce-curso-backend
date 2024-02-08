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
        const userDTO = createUserDTO(user);
        logger.info(`Current user: ${user.email}`)
        res.status(200).json(userDTO);
    } catch (error) {
        logger.error('Error 404: Page not found')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user.id;
        const deletedUser = await UserController.deleteById(userId);
        if (!deletedUser) {
            logger.error('User not found')
            return res.status(404).json({ message: 'Userio no encontrado' });
        }
        logger.info('Successfully deleted user');
        return res.status(200).redirect('/login');
    } catch (error) {
        logger.error('Error 404: Page not found');
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
        if (!updatedUser) {
            logger.error('Error updatig user')
            return res.status(404).json({ message: 'Error al actualizar el usuario' });
        }
        logger.info('User updated successfully')
        res.status(200).json({ message: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
        logger.error('Error 404: Page not found');
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.post('/users/recovery-password', passport.authenticate('recovery-password', { session: false, failureRedirect: '/recovery-password' }), async (req, res) => {
    res.status(200).redirect('/login');
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await UserController.getAll();
        const usersDTO = createUserDTO(users);
        logger.info('Users loaded successfully')
        res.status(200).json(usersDTO);
    } catch (error) {
        logger.error('Error 404: Page not found');
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.get('/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
        const user = await UserController.getById(uid);
        const userDTO = createUserDTO(user);
        logger.info(`Viewing user profile: ${userDTO.email}`)
        res.status(200).json(userDTO);
    } catch (error) {
        logger.error('Error 404: Page not found');
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

export default router;