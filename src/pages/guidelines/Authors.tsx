
import React from 'react';
import { PenTool, CheckCircle, FileText, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Authors: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <section className="relative bg-brand-blue py-20 px-4 overflow-hidden">
                <div className="relative max-w-5xl mx-auto text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Diretrizes para Autores</h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
                        Como partilhar o seu conhecimento com o mundo através do Sussurros do Saber.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 max-w-4xl mx-auto">
                <div className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <PenTool className="text-brand-blue" /> Processo de Submissão
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            Aceitamos artigos originais que explorem temas de ciência, tecnologia, cultura e educação. O seu manuscrito deve ser fundamentado e escrito de forma acessível mas rigorosa.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Originalidade: O conteúdo deve ser original e não publicado noutros locais.</li>
                            <li>Estrutura: Título cativante, resumo, introdução, desenvolvimento e conclusões.</li>
                            <li>Referências: Cite as suas fontes de forma clara.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" /> Requisitos de Estilo
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold mb-2">Tom</h4>
                                <p className="text-sm text-slate-500">Informativo, profissional e inspirador.</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2">Formatação</h4>
                                <p className="text-sm text-slate-500">Markdown é o nosso formato preferido.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Authors;
