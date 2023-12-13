import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import UserModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

export const init = () => {
    const registerOptions = {
        usernameField: 'email',
        passReqToCallback: true,
    };
    passport.use('register', new LocalStrategy(registerOptions, async (req, email, password, done) => {
        const {
            body: {
                first_name,
                last_name,
                age,
                role
            } } = req;

        if (!first_name ||
            !last_name
        ) {
            return done(new Error('Complete los campos requeridos'))
        }
        const user = await UserModel.findOne({ email })
        if (user) {
            return done(new Error(`El usuario ${email} ya existe`))
        }
        const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            password: createHash(password),
            age,
            role,
        });
        done(null, newUser);
    }));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return done(new Error('Correo o contraseña invalidos'));
        }
        const isNotValidPass = !isValidPassword(password, user);
        if (isNotValidPass) {
            return done(new Error('Correo o contraseña invalidos'));
        }
        done(null, user)
    }
    ));

    const githuboptions = {
        clientID: "Iv1.d5887673356faf2c",
        clientSecret: "cf72ca5ebaf30c6339cfe24631e7c545a64b481f",
        callbackURL: "http://localhost:8080/api/sessions/github/callback"
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
        done (null, newUser);
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async (uid, done) => {
        const user = await UserModel.findById(uid);
        done(null, user);
    })
}