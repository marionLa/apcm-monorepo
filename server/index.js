const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error('Supabase init error:', e.message);
}



// --- Modèle Mongoose pour les métadonnées ---
const contentSchema = new mongoose.Schema({
    logo: String,
    banner: String,
    description: String,
    whatsappLink: String,
    facebookLink: String,
    helloAssoLink: String,
    contactEmail: String
}, { collection: 'apcm-data' });

const Content = mongoose.model('Content', contentSchema);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI; // Mets l'URI Atlas dans .env

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Session configuration (must be before passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
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

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connecté à MongoDB Atlas'))
    .catch(err => console.error('Erreur connexion MongoDB', err));


app.get('/api/file/:fileName', async (req, res) => {
    const { fileName } = req.params;

    try {
        const { data, error } = supabase.storage
            .from('apcm-images')
            .createSignedUrl(fileName, 60 * 60); // URL valide 1 heure

        if (error) {
            console.error('URL generation error:', error);
            return res.status(500).json({ error: 'Failed to generate file URL' });
        }

        res.json({ url: data.signedUrl });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- Routes MongoDB ---
app.get('/api/content', async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            // Si aucun document, on en crée un vide
            content = await Content.create({});
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération du contenu' });
    }
});

app.post('/api/content', async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            content = await Content.create(req.body);
        } else {
            Object.assign(content, req.body);
            await content.save();
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du contenu' });
    }
});

app.post('/api/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file uploaded.');
    }

    const file = req.files.file;
    const fileName = Date.now() + '-' + file.name;
    const fileBuffer = file.data;
    const bucket = process.env.SUPABASE_BUCKET;

    try {
        // Upload vers le bucket privé
        const { data, error } = await supabase.storage
            .from(bucket) // Remplace par le nom de ton bucket
            .upload(fileName, fileBuffer, {
                contentType: file.mimetype,
                upsert: false, // Empêche l'écrasement accidentel
            });

        if (error) {
            console.error('Upload error:', error);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        // Génère une URL signée (valide pour une durée limitée)
        const { data: urlData, error: urlError } = supabase.storage
            .from('ton_bucket_prive')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // URL valide 1 an

        if (urlError) {
            console.error('URL generation error:', urlError);
            return res.status(500).json({ error: 'Failed to generate file URL' });
        }

        res.json({ url: urlData.signedUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/ping', async (req, res) => {
    await Content.findOne();
    await supabase.storage.from('apcm-images').list('', { limit: 1 });
    res.json({ ok: true });
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

    // Get contact email from MongoDB
    let content = await Content.findOne();
    const contactEmail = content ? content.contactEmail : null;

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


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
