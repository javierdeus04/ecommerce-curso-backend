import dotenv from 'dotenv';

dotenv.config()

export default {
    port: process.env.PORT,
    mongodbUri: process.env.MONGODB_URI,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    mail: {
        emailService: process.env.EMAIL_SERVICE || 'gmail',
        emailPort: process.env.EMAIL_PORT || 587,
        emailUser: process.env.EMAIL_USER,
        emailPassword: process.env.EMAIL_PASSWORD,
    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_ACCOUNT_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
}