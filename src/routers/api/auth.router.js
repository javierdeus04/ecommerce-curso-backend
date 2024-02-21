import { Router } from 'express';
import UserModel from '../../dao/models/user.model.js';
import passport from 'passport';

import { logger } from '../../config/logger.js';
import { verifyToken } from '../../../utils/utils.js';


const router = Router();

router.post('/auth/register', passport.authenticate('register', { session: false, failureRedirect: '/register' }), async (req, res) => {
    logger.info(`User created successfully: ${req.user.email}`)
    res.status(201).json(req.user)
});

router.post('/auth/login', passport.authenticate('login', { session: false, failureRedirect: '/login' }), async (req, res) => {
    const { user, token } = req.user;
    
    if (!token) {
        logger.warn('Token no proporcionado');
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

router.post('/auth/logout', (req, res) => {
    logger.info(`The session has been closed successfully`)
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Cierre de sesión exitoso' })
})

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    const { user } = req.user;
    console.log(user);
    logger.info(`Session started successfully. User: ${user.email} - Role: ${user.role}`)
    res.redirect('/products');
})


export default router;