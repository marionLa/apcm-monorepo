import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {GoogleReCaptchaProvider} from 'react-google-recaptcha-v3';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import ContactForm from './components/ContactForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';



export const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});


const PublicPage = ({content}) => (
    <div className="min-h-screen bg-white">
        <Navbar content={content}/>
        <Hero content={content}/>
        <ContentSection content={content}/>
        <ContactForm/>
    </div>
);

const ProtectedRoute = ({isAuthenticated, isLoading, children}) => {
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/admin" replace/>;
    }
    return children;
};


function App() {
    const [content, setContent] = useState({
        title:'',
        subtitle:'',
        logo: '',
        banner: '',
        description: '',
        whatsappLink: '',
        helloAssoLink: '',
        facebookLink: '',
        contactEmail: ''
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await instance.get(`/api/content`);
                setContent({
                    ...response.data,
                    logo: import.meta.env.VITE_BACKEND_URL + response.data.logo,
                    banner: import.meta.env.VITE_BACKEND_URL + response.data.banner
                })
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };

        const checkAuth = async () => {
            try {
                const response = await instance.get(`/api/current_user`);
                if (response.data && response.data.id) {
                    setIsAuthenticated(true);
                } else {
                    console.log('User is not authenticated');
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
        checkAuth();
    }, []);

    return (
        <GoogleReCaptchaProvider reCaptchaKey="6LdxVxssAAAAALI8BluQbdMtkgGpRvaIUPzjeBr3">
            <Router>
                <Routes>
                    <Route path="/" element={<PublicPage content={content}/>}/>
                    <Route path="/admin" element={<AdminLogin setIsAuthenticated={setIsAuthenticated}/>}/>
                    <Route path="/auth/google/callback" element={<Navigate to="/admin/dashboard" replace/>}/>
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                                <AdminDashboard/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </GoogleReCaptchaProvider>
    );
}

export default App;
