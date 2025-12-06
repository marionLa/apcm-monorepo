import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {instance} from '../App.jsx';
const AdminDashboard = () => {
    const [content, setContent] = useState({
        title:'',
        subtitle:'',
        logo: '',
        banner: '',
        description: '',
        whatsappLink: '',
        facebookLink: '',
        helloAssoLink: '',
        contactEmail: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const logoUrl = content.logo ? `${import.meta.env.VITE_BACKEND_URL}${content.logo}` : '';
    const bannerUrl = content.banner ? `${import.meta.env.VITE_BACKEND_URL}${content.banner}` : '';

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await instance.get('/api/content');
            setContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching content:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await instance.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setContent(prev => ({ ...prev, [field]: response.data.url }));
        } catch (error) {
            console.error('Error uploading file:', error);
            setMessage('Erreur lors de l\'upload');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await instance.post('/api/content', content);
            setMessage('Modifications enregistrées avec succès !');
        } catch (error) {
            console.error('Error saving content:', error);
            setMessage('Erreur lors de l\'enregistrement');
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-8">Tableau de bord administrateur</h1>

                {message && (
                    <div className={`p - 4 mb - 6 rounded ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Logo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                        <div className="flex items-center space-x-4">
                            {content.logo && <img src={logoUrl} alt="Logo preview" className="h-16 w-auto object-contain bg-gray-50 border rounded" />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'logo')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bannière (Image de fond)</label>
                        <div className="flex items-center space-x-4">
                            {content.banner && <img src={bannerUrl} alt="Banner preview" className="h-24 w-40 object-cover border rounded" />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'banner')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description de l'association</label>
                        <ReactQuill
                            theme="snow"
                            value={content.description}
                            onChange={(value) => setContent(prev => ({ ...prev, description: value }))}
                            className="bg-white"
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['link'],
                                    ['clean']
                                ]
                            }}
                        />
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lien WhatsApp</label>
                            <input
                                type="text"
                                name="title"
                                value={content.title}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lien WhatsApp</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={content.subtitle}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lien WhatsApp</label>
                            <input
                                type="text"
                                name="whatsappLink"
                                value={content.whatsappLink}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lien Facebook</label>
                            <input
                                type="text"
                                name="facebookLink"
                                value={content.facebookLink}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lien HelloAsso</label>
                            <input
                                type="text"
                                name="helloAssoLink"
                                value={content.helloAssoLink}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={content.contactEmail}
                                onChange={handleChange}
                                placeholder="contact@association.fr"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
