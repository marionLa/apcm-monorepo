const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration (must be before passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
},
    function (accessToken, refreshToken, profile, cb) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && profile.emails[0].value !== adminEmail) {
            return cb(null, false, { message: 'Unauthorized email' });
        }
        return cb(null, profile);
    }
));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Mock Database (JSON file)
const DB_FILE = 'db.json';
const defaultData = {
    content: {
        logo: '',
        banner: '',
        description: '',
        whatsappLink: '',
        facebookLink: '',
        helloAssoLink: '',
        contactEmail: ''
    }
};

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
}

function getDb() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/content', (req, res) => {
    const db = getDb();
    res.json(db.content);
});

app.post('/api/content', (req, res) => {
    const db = getDb();
    db.content = { ...db.content, ...req.body };
    saveDb(db);
    res.json(db.content);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Auth Routes
app.get('/test', (req, res) => {
    res.send('Server is working');
});

app.get('/auth/google', (req, res, next) => {
    console.log('Attempting to authenticate with Google');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/admin` }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard`);
    });

app.get('/api/current_user', (req, res) => {
    console.log('Current user session:', req.user);
    res.send(req.user);
});

app.get('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(process.env.FRONTEND_URL);
    });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message, captcha } = req.body;

    // Verify reCAPTCHA
    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`;
        const captchaResponse = await fetch(verifyUrl, { method: 'POST' });
        const captchaData = await captchaResponse.json();

        if (!captchaData.success) {
            return res.status(400).json({ error: 'Captcha verification failed' });
        }
    } catch (error) {
        console.error('Captcha verification error:', error);
        return res.status(500).json({ error: 'Captcha verification error' });
    }

    // Get contact email from database
    const db = getDb();
    const contactEmail = db.content.contactEmail;

    if (!contactEmail) {
        return res.status(400).json({ error: 'No contact email configured' });
    }

    // Send email (using nodemailer)
    const nodemailer = require('nodemailer');

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "marionlabbe@posteo.net",
                serviceClient: process.env.MAIL_CLIENT_ID,
                privateKey: process.env.MAIL_CLIENT_SECRET,
/*
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
*/
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: contactEmail,
            replyTo: email,
            subject: `Nouveau message de ${name}`,
            text: message,
            html: `<p><strong>De:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
