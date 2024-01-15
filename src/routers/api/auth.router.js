import { Router } from 'express';
import UserModel from '../../dao/models/user.model.js';
import { createHash, isValidPassword, generateToken, verifyToken } from '../../utils.js';
import passport from 'passport';
import { isAdmin } from '../../utils.js';


const router = Router();

router.post('/auth/register', passport.authenticate('register', { session: false, failureRedirect: '/register' }), async (req, res) => {
    res.status(201).json(req.user)
});

router.post('/auth/login', passport.authenticate('login', { session: false, failureRedirect: '/login' }), async (req, res) => {
    const { user, token, role } = req.user;
    res.cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true });
    res.status(200).json({ message: 'Sesion iniciada con exito' });
});

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    console.log(req.user);
    res.redirect('/products');
})

export default router;