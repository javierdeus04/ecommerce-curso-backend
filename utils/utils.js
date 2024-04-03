import path from 'path';
import url from 'url';
import multer from 'multer';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken'
import { faker } from '@faker-js/faker';
import passport from 'passport';

import { logger } from '../src/config/logger.js';
import { createUserDTO } from '../src/dao/dto/user.dto.js';

export const JWT_SECRET = 'u^f.Tl6o78a5bkGXF8~y!KTe2l1:XEcE'

export const generateToken = (user, type = 'auth') => {
    const payload = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        type
    }
    return JWT.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        JWT.verify(token, JWT_SECRET, (error, payload) => {
            if (error) {
                logger.error('Token does not match')
                return reject(error);
            }
            resolve(payload);
        })
    })
}

const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);

export const URL_BASE = 'http://localhost:8080/api'

export const VIEWS_URL_BASE = 'http://localhost:8080'

export const IMAGE_URL_BASE = 'http://localhost:8080/img'

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/img/profiles');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname;
        const filename = uniqueSuffix + '-' + originalName;
        cb(null, filename);
    },
})

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/img/documents');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname;
        const filename = uniqueSuffix + '-' + originalName;
        cb(null, filename);
    },
})

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/img/products');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = file.originalname;
        const filename = uniqueSuffix + '-' + originalName;
        cb(null, filename);
    },
})

export const uploadProfile = multer({ storage: profileStorage });
export const uploadProduct = multer({ storage: productStorage });
export const uploadDocument = multer({ storage: documentStorage });

export const buildProductsResponsePaginated = (data, baseUrl = URL_BASE) => {
    return {
        status: 'success',
        payload: data.docs.map((doc) => doc.toJSON()),
        totalPages: data.totalPages,
        prevPage: data.prevPage,
        nextPage: data.nextPage,
        page: data.page,
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        prevLink: data.hasPrevPage ? `${baseUrl}/products?limit=${data.limit}&page=${data.prevPage}${data.sort ? `&sort=${data.sort}` : ''}${data.search ? `&search=${data.search}` : ''}` : null,
        nextLink: data.hasNextPage ? `${baseUrl}/products?limit=${data.limit}&page=${data.nextPage}${data.sort ? `&sort=${data.sort}` : ''}${data.search ? `&search=${data.search}` : ''}` : null
    }
}

export const buildUsersResponsePaginated = (data, baseUrl = URL_BASE) => {
    return {
        status: 'success',
        payload: data.docs.map((doc) => createUserDTO(doc)),
        totalPages: data.totalPages,
        prevPage: data.prevPage,
        nextPage: data.nextPage,
        page: data.page,
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        prevLink: data.hasPrevPage ? `${baseUrl}/users?limit=${data.limit}&page=${data.prevPage}${data.sort ? `&sort=${data.sort}` : ''}${data.search ? `&search=${data.search}` : ''}` : null,
        nextLink: data.hasNextPage ? `${baseUrl}/users?limit=${data.limit}&page=${data.nextPage}${data.sort ? `&sort=${data.sort}` : ''}${data.search ? `&search=${data.search}` : ''}` : null
    }
}

export const admin = {
    first_name: 'Administrador',
    last_name: 'Coderhouse',
    email: 'adminCoder@coder.com',
    password: 'adminCod3r123',
    role: 'admin',
    age: ''
}

export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (user) {
            req.user = user;
        } else {
            logger.warn('User not verified')
        }
        next();
    })(req, res, next);
};

export const isAdmin = (req, res, next) => {passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            logger.error('Error at isAdmin middleware')
            return next(err);
        }

        if (!user) {
            logger.error('Forbidenn access. Unauthorized user')
            return res.status(401).json({ message: 'Acceso prohibido. Usuario no autorizado.' });
        }

        if (user.role === 'admin') {
            logger.info('Access granted. Authorized admin user')
            return next();
        } else {
            logger.error('Forbidenn access. Unauthorized user')
            return res.status(403).json({ message: 'Acceso prohibido. Usuario no autorizado.' });
        }
    })(req, res, next);
};

export const isPremium = (req, res, next) => {passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) {
        logger.error('Error at isPremium middleware')
        return next(error);
    }

    if (!user) {
        logger.error('Forbidenn access. Unauthorized user')
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (user.role === 'premium') {
        logger.info('Access granted. Authorized premium user')
        return next();
    } else {
        logger.error('Forbidenn access. Unauthorized user')
        return res.status(403).json({ message: 'Acceso prohibido. Usuario no autorizado.' });
    }
})(req, res, next);
};

export const isAdminOrPremium = (req, res, next) => {passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) {
        logger.error('Error at isPremium middleware')
        return next(error);
    }

    if (!user) {
        logger.error('Forbidenn access. Unauthorized user')
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (user.role === 'premium' || user.role === 'admin') {
        logger.info('Access granted. Authorized premium user')
        return next();
    } else {
        logger.error('Forbidenn access. Unauthorized user')
        return res.status(403).json({ message: 'Acceso prohibido. Usuario no autorizado.' });
    }
})(req, res, next);
};



export const generateProduct = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        category: faker.commerce.department(),
        description: faker.lorem.paragraph(),
        price: faker.commerce.price(),
        thumbnail: faker.image.url(),
        code: faker.string.alphanumeric({ length: 10 }),
        stock: faker.number.int({ min: 10, max: 999 }),
        status: faker.datatype.boolean(),
    }
}

export async function authenticateUser(requester, email, password) {
    const { headers } = await requester.post('/auth/login').send({ email, password });
    const [key, value] = headers['set-cookie'][0].split('=');
    const cookie = { key, value };
    return cookie;
}


