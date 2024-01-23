import path from 'path';
import url from 'url';
import multer from 'multer';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken'

import config from './config/config.js';

export const JWT_SECRET = 'u^f.Tl6o78a5bkGXF8~y!KTe2l1:XEcE'

export const generateToken = (user) => {
    const payload = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
    }
    return JWT.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export const verifyToken = (token) => {
    return new Promise((resolve) => {
        JWT.verify(token, JWT_SECRET, (error, payload) => {
            if (error) {
                return resolve(false)
            }
            resolve(payload);
        })
    })

}

export const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.email === config.adminEmail && user.password === config.adminPassword) {
        return next();
    } else {
        return res.status(403).json({ message: 'Acceso no autorizado' });
    }
};

const __filename = url.fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);

export const URL_BASE = 'http://localhost:8080/api'

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, __dirname + '/public/img');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
})

export const uploader = multer({ storage });

export const buildResponsePaginated = (data, baseUrl = URL_BASE) => {
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

export const admin = {
    email: 'adminCoder@coder.com',
    password: 'adminCod3r123',
    role: 'admin'
}


