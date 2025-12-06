import React from 'react';
import {motion} from 'framer-motion';

const Hero = ({content}) => {
    return (
        <div id="home" className="relative h-screen w-full overflow-hidden">
            {content.banner ? (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{backgroundImage: `url(${content.banner})`}}
                />
            ) : (
                <div className="absolute inset-0 bg-gray-900"/>
            )}
            <div className="absolute inset-0 bg-black/40"/>
            {/* Overlay */}

            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
                <motion.h1
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                    className="text-4xl md:text-6xl font-bold mb-4"
                >
                    {content.title ? content.title : 'Bienvenue sur notre site'}
                </motion.h1>
                <motion.p
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8, delay: 0.2}}
                    className="text-xl md:text-2xl max-w-xl"
                >
                    {content.subtitle ? content.subtitle : "Site de l'APCM"}
                </motion.p>
            </div>
        </div>
    );
};

export default Hero;
