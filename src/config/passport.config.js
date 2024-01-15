import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import UserService from "../services/users.service.js";
import CartsService from "../services/carts.service.js";
import { createHash, isValidPassword, JWT_SECRET, generateToken } from "../utils.js";
import config from './config.js';


const cookieExtractor = (req) => {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies['access_token'];
    }
    return token;
}

export const init = () => {

    const jwtOptions = {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor])
    };

    passport.use('jwt', new JWTStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await UserService.getById(payload.id);
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }

            if (!user.cart) {
                const newCart = await CartsService.create({ products: [] });
                user.cart = newCart;
                await user.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    const registerOptions = {
        usernameField: 'email',
        passReqToCallback: true,
    };

    passport.use('admin', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        if (email === config.adminEmail && password === config.adminPassword) {
            const adminUser = {
                email: config.adminEmail,
                role: 'admin'
            };
            return done(null, adminUser);
        } else {
            return done(null, false, { message: 'Credenciales no validas' });
        }
    }));

    passport.use('register', new LocalStrategy(registerOptions, async (req, email, password, done) => {
        const {
            body: {
                first_name,
                last_name,
                age
            } } = req;

        if (!first_name ||
            !last_name
        ) {
            return done(new Error('Complete los campos requeridos'))
        }
        let user = await UserModel.findOne({ email })
        if (user) {
            return done(new Error(`El usuario ${email} ya existe`))
        }
        user = await UserModel.create({
            first_name,
            last_name,
            email,
            password: createHash(password),
            age,
        });
        done(null, user);
    }));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {

        if (!email || !password) {
            return done(new Error('Todos los campos requeridos'));
        }
        let user;
        if (email === config.adminEmail && password === config.adminPassword) {
            user = {
                email: config.adminEmail,
                role: 'admin'
            };
        } else {
            const result = await UserService.getAll({ email });
            user = result[0]
    
            if (!user) {
                return done(new Error('Correo o contraseña invalidos'));
            }
    
            const isNotValidPass = !isValidPassword(password, user);
            if (isNotValidPass) {
                console.log('Contraseña inválida');
                return done(new Error('Correo o contraseña invalidos'));
            }
        }
    
        const token = generateToken(user);
        done(null, { user, token });
    }
    ));

    passport.use('recovery-password', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Correo o contraseña invalidos' });
        }
        user.password = createHash(password);
        await UserModel.updateOne({ email }, user);
        return done(null, user);
    }));

    const githuboptions = {
        clientID: "Iv1.d5887673356faf2c",
        clientSecret: "cf72ca5ebaf30c6339cfe24631e7c545a64b481f",
        callbackURL: "http://localhost:8080/api/auth/github/callback"
    }
    passport.use('github', new GithubStrategy(githuboptions, async (accessToken, refreshToken, profile, done) => {
        const email = profile._json.email;
        let user = await UserModel.findOne({ email });
        if (user) {
            return done(null, user)
        }
        user = {
            first_name: profile._json.name,
            last_name: '',
            email,
            password: '',
            age: 32
        };
        const newUser = await UserModel.create(user);
        done(null, newUser);
    }))
}