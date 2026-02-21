
import React from 'react';
import { Library, BookMarked, Share2, Search } from 'lucide-react';

const Librarians: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <section className="relative bg-amber-600 py-20 px-4 overflow-hidden text-white">
                <div className="relative max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Diretrizes para Bibliotecários</h1>
                    <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto font-light leading-relaxed">
                        Preservando e organizando o património intelectual para as gerações futuras.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 max-w-4xl mx-auto">
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/3">
                            <div className="aspect-square bg-amber-50 dark:bg-amber-950/20 rounded-[40px] flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
                                <Library size={120} className="text-amber-600" />
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-2xl font-bold mb-6">Organização e Metadados</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                A nossa biblioteca digital depende de uma categorização precisa. Os bibliotecários são responsáveis por validar DOI, garantir metadados corretos e otimizar a descoberta de conteúdos.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <span className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-100 dark:border-slate-800">Indexação DOI</span>
                                <span className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-100 dark:border-slate-800">Taxonomia Digital</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Librarians;
