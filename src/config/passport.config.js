import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { createHash, isValidPassword, JWT_SECRET, generateToken, admin } from "../../utils/utils.js";
import UserController from "../controllers/users.controller.js";
import { CustomError } from "../../utils/CustomErrors.js";
import { generatorUserError } from "../../utils/CauseMessageError.js";
import EnumsError from "../../utils/EnumsError.js";
import { logger } from "./logger.js";
import CartsController from "../controllers/carts.controller.js";
 
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
            let user;
    
            if (payload.id) {
                user = await UserController.getById(payload.id);
                logger.debug('UserController.getById() finished successfully')
            } else if (payload.email === admin.email) {
                user = admin;
            } else {
                user = { role: 'anonymous' };
            }
    
            if (!user) {
                logger.error("User not found")
                return done(null, false, { message: 'Usuario no encontrado' });
            }
    
            if (user._id && !user.cart) {
                const newCart = await CartsController.create({ products: [] });
                logger.debug('CartsController.create() finished successfully')
                user.cart = newCart;
                await user.save();
            }

            logger.info('User successfully authenticated');    
            return done(null, user);
        } catch (error) {
            logger.error(error.message)
            return done(error);
        }
    }));

    const registerOptions = {
        usernameField: 'email',
        passReqToCallback: true,
    };

    passport.use('register', new LocalStrategy(registerOptions, async (req, email, password, done) => {
        const {
            body: {
                first_name,
                last_name,
                age
            } } = req;

        if (!first_name ||
            !last_name ||
            !email ||
            !password ||
            !age
        ) {
            CustomError.create({
                name: 'Invalid data user',
                cause: generatorUserError({
                    first_name,
                    last_name,
                    email,
                    password,
                    age
                }),
                message: 'Error al crear un nuevo usuario',
                code: EnumsError.BAD_REQUEST_ERROR,
            })
            logger.warn("All fields are required")
        }
        const result = await UserController.getAll({ email })
        logger.debug('UserController.getAll() finished successfully')
        let user = result[0]
        if (user) {
            logger.error(`User already exists: ${user._id}`)
            return done(new Error(`El usuario ${email} ya existe`))
        }
        user = await UserController.create({
            first_name,
            last_name,
            email,
            password: createHash(password),
            age,
        });
        logger.debug('UserController.create() finished successfully')
        done(null, user);
    }));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {

        if (!email || !password) {
            logger.warn("All fields are required")
            return done(new Error('Todos los campos requeridos'));
        }

        let user;

        const result = await UserController.getAll({ email });
        logger.debug('UserController.getAll() finished successfully')

        if(!result || result.length === 0) {
            if(email === admin.email && password === admin.password) {
                user = admin;
            } else {
                logger.error("Invalid email or password")
                return done(new Error('Correo o contraseña invalidos'));
            }
        } else {
            user = result[0]    
            const isNotValidPass = !isValidPassword(password, user);
            if (isNotValidPass) {
                logger.error("Invalid email or password")
                return done(new Error('Correo o contraseña invalidos'));
            }
        } 

        const token = generateToken(user);
        done(null, { user, token });
    }
    ));

    passport.use('recovery-password', new LocalStrategy({ usernameField: 'email' }, async (email, password, _id, done) => {
        const user = await UserController.getAll({ email });
        logger.debug('UserController.getAll() finished successfully')
        if (!user) {
            logger.error("Unregistered user")
            return done(null, false, { message: 'Uusario no registrado' });
        }
        user.password = createHash(password);
        await UserController.updateById(_id, user);
        logger.debug('UserController.updateById() finished successfully')
        return done(null, user);
    }));

    const githuboptions = {
        clientID: "Iv1.d5887673356faf2c",
        clientSecret: "cf72ca5ebaf30c6339cfe24631e7c545a64b481f",
        callbackURL: "http://localhost:8080/api/auth/github/callback"
    }
    passport.use('github', new GithubStrategy(githuboptions, async (accessToken, refreshToken, profile, done) => {
        const email = profile._json.email;
        let user = await UserController.getAll({ email });
        logger.debug('UserController.getAll() finished successfully')
        if (user) {
            return done(null, user._id)
        }
        user = {
            first_name: profile._json.name,
            last_name: '',
            email,
            password: '',
            age: ''
        };
        const newUser = await UserController.create(user);
        logger.debug('UserController.create() finished successfully')
        done(null, newUser._id);
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserController.getById(id);
            logger.debug('UserController.getById() finished successfully')
            done(null, user);
        } catch (error) {
            logger.error(error.message)
            done(error);
        }
    });
}