
import React from 'react';
import { UserCheck, ShieldCheck, Scale, MessageSquare } from 'lucide-react';

const Reviewers: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <section className="relative bg-emerald-600 py-20 px-4 overflow-hidden text-white">
                <div className="relative max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Diretrizes para Críticos</h1>
                    <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto font-light leading-relaxed">
                        Mantendo o rigor e a qualidade através de uma revisão científica e cultural cuidadosa.
                    </p>
                </div>
            </section>

            <section className="py-16 px-4 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <ShieldCheck className="w-10 h-10 text-emerald-500 mb-6" />
                        <h3 className="text-xl font-bold mb-4">Ética na Revisão</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Os revisores devem garantir a imparcialidade e confidencialidade durante todo o processo de avaliação.
                        </p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <Scale className="w-10 h-10 text-emerald-500 mb-6" />
                        <h3 className="text-xl font-bold mb-4">Critérios de Avaliação</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Foco na veracidade dos factos, clareza da exposição e relevância pedagógica.
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="text-emerald-500" /> Como fornecer Feedback
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        O feedback deve ser construtivo, apontando áreas de melhoria e ajudando o autor a elevar a qualidade do seu trabalho.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Reviewers;
