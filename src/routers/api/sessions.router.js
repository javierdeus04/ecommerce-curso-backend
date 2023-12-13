import { Router } from 'express';
import UserModel from '../../dao/models/user.model.js';
import { createHash, isValidPassword } from '../../utils.js'
import passport from 'passport';


const router = Router();

router.post('/sessions/register', passport.authenticate('register', { failureRedirect: '/register' }), async (req, res) => {
    res.status(201).json(req.user)
});

router.post('/sessions/login', passport.authenticate('login', { failureRedirect: '/login' }), async (req, res) => {
    res.status(200).json({ message: 'Sesion iniciada correctamente'})
});

router.get('/sessions/me', (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ message: 'Autentificate por favor' });
    }
    res.status(200).json(req.session.user);
})

router.get('/sessions/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.redirect('/login');
    })
})

router.post('/sessions/recovery-password', async (req, res) => {
    const { body: { email, password } } = req;
    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos requeridos'});
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Correo o contraseña invalidos'})
    }
    user.password = createHash(password);
    await UserModel.updateOne({ email }, user);
    res.redirect('/login')
});

router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email']}));

router.get('/sessions/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    console.log(req.user);
    res.redirect('/products');
})

export default router;