
import React from 'react';
import { Layout, GitMerge, Zap, Settings } from 'lucide-react';

const Editors: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <section className="relative bg-slate-800 py-20 px-4 overflow-hidden text-white">
                <div className="relative max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Diretrizes para Editores</h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
                        Orquestrando o fluxo de conhecimento e garantindo a harmonia editorial da plataforma.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full -mr-16 -mt-16 opacity-50"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                            <Settings className="text-slate-400" /> Gestão do Fluxo de Trabalho
                        </h2>

                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Curadoria Ágil</h4>
                                    <p className="text-slate-500 text-sm">Identificação de temas atuais e necessidade de novas publicações.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300">
                                    <GitMerge size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Harmonização</h4>
                                    <p className="text-slate-500 text-sm">Garantir que os artigos mantêm uma linguagem coesa com os valores do Sussurros.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Editors;
