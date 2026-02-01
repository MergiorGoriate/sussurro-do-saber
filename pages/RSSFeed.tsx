
import React from 'react';
import { Rss } from 'lucide-react';

const RSSFeed: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            <div className="text-center">
                <div className="inline-flex p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full text-orange-500 mb-6">
                    <Rss size={48} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Feed RSS</h1>
                <p className="text-slate-500 dark:text-slate-400">Em breve disponível para subscrição.</p>
                <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-600 dark:text-slate-400">
                    https://sussurrosdosaber.pt/feed.xml
                </div>
            </div>
        </div>
    );
};

export default RSSFeed;
