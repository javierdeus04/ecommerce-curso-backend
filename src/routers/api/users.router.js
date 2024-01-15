import { Router } from 'express';
import passport from 'passport';
import UserController from '../../controllers/users.controller.js';
import { isAdmin } from '../../utils.js';


const router = Router();

router.get('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = req.user
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
});

router.delete('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user.id;
    const deletedUser = await UserController.deleteById(userId);
    if (!deletedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log('Usuario eliminado correctamente');
    return res.status(200).redirect('/login');
});

router.put('/users/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.user.id;
    const { first_name, last_name, age } = req.body;
    if (!first_name) {
        return res.status(400).json({ message: 'Complete los campos requeridos' });
    }
    const updatedUser = await UserController.updateById(userId, { first_name, last_name, age }, { new: true });
    if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
});

router.post('/users/recovery-password', passport.authenticate('recovery-password', { session: false, failureRedirect: '/recovery-password', }), async (req, res) => {
    res.status(200).redirect('/login');
});

router.get('/users', passport.authenticate('admin', { session: false }), async (req, res) => {
    try {
        if (req.user && req.user.role === 'admin') {
            const users = await UserController.getAll();
            res.status(200).json(users);
        }
    } catch (error) {
        res.status(403).json({ message: 'Acceso no autorizado' });
    }
});

router.get('/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
        const user = await UserController.getById(uid);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Usuario no encontrado' })
    }
});

router.delete('/users/:uid', isAdmin, async (req, res) => {
    const { uid } = req.params;
    try {
        const user = await UserController.deleteById(uid);
        res.status(200).json('Usuario eliminado con exito');
    } catch (error) {
        res.status(400).json({ message: 'Usuario no encontrado' })
    }
});

export default router;