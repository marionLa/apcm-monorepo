import React from 'react';

const ContentSection = ({ content }) => {
    return (
        <section id="presentation" className="py-20 bg-white text-gray-800">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-10">À propos</h2>
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.description }}
                />
            </div>
        </section>
    );
};

export default ContentSection;
