import React, {useState} from 'react';
import {FiMenu, FiX} from 'react-icons/fi';
import facebookIcon from '../assets/facebook.png';
import helloassoIcon from '../assets/helloasso.png';
import whatsappIcon from '../assets/whatsapp.png';
const Navbar = ({content}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const logoUrl = content.logo
    return (
        <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md text-white">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        {content.logo ? (
                            <img src={logoUrl} alt="Logo" className="h-10 w-auto"/>
                        ) : (
                            <span className="text-xl font-bold">Association</span>
                        )}
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6">
                            <a href="#home"
                               className="hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">Accueil</a>
                            <a href="#presentation"
                               className="hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">Présentation</a>
                            <a href="#contact"
                               className="hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">Contact</a>

                            <div className="flex items-center space-x-3 ml-4">
                                {content.whatsappLink && (
                                    <a href={content.whatsappLink} target="_blank" rel="noopener noreferrer"
                                       className="hover:opacity-80 transition-opacity">
                                        <img src={whatsappIcon} alt="WhatsApp" className="h-8 w-8"/>
                                    </a>
                                )}
                                {content.facebookLink && (
                                    <a href={content.facebookLink} target="_blank" rel="noopener noreferrer"
                                       className="hover:opacity-80 transition-opacity">
                                        <img src={facebookIcon} alt="Facebook" className="h-8 w-8"/>
                                    </a>
                                )}
                                {content.helloAssoLink && (
                                    <a href={content.helloAssoLink} target="_blank" rel="noopener noreferrer"
                                       className="hover:opacity-80 transition-opacity">
                                        <img src={helloassoIcon} alt="HelloAsso" className="h-8 w-8"/>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                            {isOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-black/90">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#home" onClick={toggleMenu}
                           className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Accueil</a>
                        <a href="#presentation" onClick={toggleMenu}
                           className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Présentation</a>
                        <a href="#contact" onClick={toggleMenu}
                           className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">Contact</a>

                        <div className="flex items-center space-x-4 px-3 py-2">
                            {content.whatsappLink && (
                                <a href={content.whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <img src={whatsappIcon} alt="WhatsApp" className="h-8 w-8"/>
                                </a>
                            )}
                            {content.facebookLink && (
                                <a href={content.facebookLink} target="_blank" rel="noopener noreferrer">
                                    <img src={facebookIcon} alt="Facebook" className="h-8 w-8"/>
                                </a>
                            )}
                            {content.helloAssoLink && (
                                <a href={content.helloAssoLink} target="_blank" rel="noopener noreferrer">
                                    <img src={helloassoIcon} alt="HelloAsso" className="h-8 w-8"/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
