import dotenv from 'dotenv';

dotenv.config()

export default {
    port: process.env.PORT,
    mongodbUri: process.env.MONGODB_URI,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD
}