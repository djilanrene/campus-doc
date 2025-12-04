'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Credit, Search } from '../components/Icons'; // Adjust path if necessary

const Home: React.FC = () => {
    const router = useRouter();

    const setView = (path: string) => {
        router.push(path);
    };

    return (
        <div className="fade-in min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center p-6 bg-gradient-to-b from-white to-slate-100">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Trouver. Réussir. <span className="text-brand-600">Contribuer.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
                La plateforme centrale de la FASEG pour échanger vos annales d'examens et TDs.
                Fini le chaos des groupes WhatsApp. Accédez à des documents vérifiés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button onClick={() => setView('/inscription')} className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-1">
                    Commencer maintenant
                </button>
                <button onClick={() => setView('/connexion')} className="bg-white hover:bg-gray-50 text-slate-700 border border-slate-200 px-8 py-3 rounded-lg font-bold text-lg transition-all">
                    J'ai déjà un compte
                </button>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Check /></div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">100% Vérifié</h3>
                    <p className="text-slate-600 text-sm">Chaque sujet est modéré par un Gardien avant d'être publié. Pas de spam, pas de flou.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4"><Credit /></div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Système de Crédits</h3>
                    <p className="text-slate-600 text-sm">Téléchargez grâce à vos crédits. Gagnez 5 crédits pour chaque document accepté.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4"><Search /></div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Organisation FASEG</h3>
                    <p className="text-slate-600 text-sm">Classé par Filière (Eco/Gestion), Matière et Année. Trouvez votre sujet en 10 secondes.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
