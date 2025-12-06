import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { instance } from '../App.jsx';
const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            setStatus('Captcha non disponible');
            return;
        }

        try {
            const captchaToken = await executeRecaptcha('contact_form');

            await instance.post('/api/contact', {
                ...formData,
                captcha: captchaToken
            });
            setStatus('Message envoyé avec succès !');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setStatus('Erreur lors de l\'envoi du message');
        }
    };

    return (
        <section id="contact" className="py-20 bg-gray-100 text-gray-800">
            <div className="max-w-lg mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-10">Contactez-nous</h2>
                {status && (
                    <div className={`mb - 4 p - 3 rounded ${status.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `}>
                        {status}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        ></textarea>
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Envoyer
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        Ce site est protégé par reCAPTCHA et les <a href="https://policies.google.com/privacy" className="underline">règles de confidentialité</a> et <a href="https://policies.google.com/terms" className="underline">conditions d'utilisation</a> de Google s'appliquent.
                    </p>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
