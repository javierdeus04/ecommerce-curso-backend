import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.render('home', {title: 'E-Commerce'});
})

export default router;