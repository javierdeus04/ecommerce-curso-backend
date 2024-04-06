import { Router } from 'express';
import UserModel from '../../dao/models/user.model.js';
import passport from 'passport';
import JWT, { decode } from 'jsonwebtoken'

import { logger } from '../../config/logger.js';
import { JWT_SECRET, uploadProfile, verifyToken, IMAGE_URL_BASE } from '../../../utils/utils.js';
import UserController from '../../controllers/users.controller.js';
import { Logger } from 'winston';


const router = Router();

router.post('/auth/register', uploadProfile.single('profile_picture'), passport.authenticate('register', { session: false, failureRedirect: '/register' }), async (req, res) => {
    const newUser = req.user;

    if (req.file) {
        const profile_picture = {
            name: req.file.originalname,
            reference: `${IMAGE_URL_BASE}/profiles/${req.file.filename}`,
        };
        newUser.profile_picture = profile_picture;
    } else {
        logger.info('Not image uploaded')
    }

    await newUser.save();
    logger.info(`User created successfully: ${req.user.email}`);
    res.status(201).json(req.user);
});

router.post('/auth/login', passport.authenticate('login', { session: false, failureRedirect: '/login' }), async (req, res) => {
    const { user, token } = req.user;

    if (!token) {
        logger.warn('Token not found');
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    const verifiedToken = await verifyToken(token);

    if (!verifiedToken) {
        logger.warn('Access prohibited');
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    if (verifiedToken.type !== 'auth') {
        logger.error('Access prohibited');
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.cookie('access_token', token, { maxAge: 1000 * 60 * 60, httpOnly: true, signed: true });
    logger.info(`Session started successfully. User: ${user.email} - Role: ${user.role}`)
    res.status(200).json({ message: `Sesion iniciada con exito. Usuario: ${user.email} - Rol: ${user.role}` });
});

router.post('/auth/logout', async (req, res) => {
    const token = req.signedCookies.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Token de acceso no proporcionado' });
    }

    try {
        const decoded = JWT.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
            logger.info(`La sesión se ha cerrado correctamente`);
            res.clearCookie('access_token');
            res.status(200).json({ message: 'Cierre de sesión exitoso' });
        } else {
            const userId = decoded.id;
            const user = await UserController.getById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            user.last_connection = Date.now();
            await user.save();

            logger.info(`La sesión se ha cerrado correctamente`);
            res.clearCookie('access_token');
            res.status(200).json({ message: 'Cierre de sesión exitoso' });
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Token de acceso inválido' });
    }
})

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        logger.info(`Session started successfully. User: ${user.email} - Role: ${user.role}`)
        res.redirect('/products');
    } catch (error) {
        logger.error(error.message);
        logger.error('API Router Error. Method: GET. Path: /auth/github/callback')
        res.status(404).json({ message: 'Pagina no encontrada' })
    }
})


export default router;