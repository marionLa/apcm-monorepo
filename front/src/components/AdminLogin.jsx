import React from 'react';

const AdminLogin = () => {
    const authUrl = import.meta.env.VITE_BACKEND_URL + '/auth/google';
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h2>
                <div className="flex justify-center">
                    <a
                        href={authUrl}
                        className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded flex items-center hover:bg-gray-50 transition-colors"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"
                             className="w-6 h-6 mr-2"/>
                        Se connecter avec Google
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
