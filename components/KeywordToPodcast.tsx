'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

const templates = ['Explainer', 'News Recap', 'Interview', 'Storytelling'];
const languages = ['English', 'Hindi', 'Gujarati', 'Tamil', 'Telugu'];

export default function KeywordToPodcast({ onUseScript, onUseThumbPrompt }: { onUseScript?: (script: string) => void, onUseThumbPrompt?: (prompt: string) => void }) {
    const [keywords, setKeywords] = useState('');
    const [template, setTemplate] = useState('Explainer');
    const [language, setLanguage] = useState('English');
    const [minutes, setMinutes] = useState<number | ''>('');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const generateScript = useAction(api.openai.generateScriptAction);
    const generateThumbPrompt = useAction(api.openai.generateThumbnailPromptAction);
    const [thumbPrompt, setThumbPrompt] = useState('');

    async function handleGenerate() {
        setLoading(true);
        try {
            const content = await generateScript({ keywords, template, language, minutes: typeof minutes === 'number' ? minutes : undefined });
            setScript(content);
            if (onUseScript) onUseScript(content);
        } finally {
            setLoading(false);
        }
    }

    function handleUseScript() {
        if (onUseScript) onUseScript(script);
    }

    async function handleThumbPrompt() {
        if (!script.trim()) return;
        const p = await generateThumbPrompt({ script, keywords, title: '' });
        setThumbPrompt(p);
        if (onUseThumbPrompt) onUseThumbPrompt(p);
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Script Generator</h3>
                <p className="text-slate-600">Generate intelligent podcast scripts using AI</p>
            </div>

            {/* Configuration Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-3">
                    <Label className="block text-sm font-semibold text-slate-700">Keywords *</Label>
                    <Textarea
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)}
                        placeholder="AI Trends, Mental Health, Technology, Business..."
                        className="form-textarea-white w-full min-h-[100px]"
                    />
                </div>

                <div className="space-y-3">
                    <Label className="block text-sm font-semibold text-slate-700">Template</Label>
                    <select
                        className="form-input-white w-full"
                        value={template}
                        onChange={e => setTemplate(e.target.value)}
                    >
                        {templates.map(t => (
                            <option key={t} value={t} className="text-slate-800 bg-white">{t}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <Label className="block text-sm font-semibold text-slate-700">Language</Label>
                    <select
                        className="form-input-white w-full"
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                    >
                        {languages.map(l => (
                            <option key={l} value={l} className="text-slate-800 bg-white">{l}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <Label className="block text-sm font-semibold text-slate-700">Duration (Minutes)</Label>
                    <input
                        type="number"
                        min={1}
                        max={60}
                        className="form-input-white w-full"
                        value={minutes}
                        onChange={e => setMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="2"
                    />
                </div>
            </div>

            {/* Script Editor */}
            <div className="space-y-3">
                <Label className="block text-sm font-semibold text-slate-700">Generated Script</Label>
                <Textarea
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    rows={12}
                    placeholder="Generated script will appear here... You can edit it before using."
                    className="form-textarea-white w-full"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
                <Button
                    onClick={handleGenerate}
                    variant="gradientAccent"
                    className="px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading || !keywords.trim()}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>✨</span>
                            Generate Script
                        </div>
                    )}
                </Button>

                <Button
                    onClick={handleUseScript}
                    variant="outline"
                    className="px-8 py-3 font-semibold rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                    disabled={!script.trim()}
                >
                    <div className="flex items-center gap-2">
                        <span>📝</span>
                        Use This Script
                    </div>
                </Button>

                <Button
                    onClick={handleThumbPrompt}
                    variant="gradientSecondary"
                    className="px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!script.trim()}
                >
                    <div className="flex items-center gap-2">
                        <span>🖼️</span>
                        Generate Thumbnail
                    </div>
                </Button>
            </div>

            {/* Thumbnail Prompt */}
            {thumbPrompt && (
                <div className="space-y-3 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <Label className="block text-sm font-semibold text-slate-700">Thumbnail Prompt</Label>
                    <Textarea
                        value={thumbPrompt}
                        onChange={e => setThumbPrompt(e.target.value)}
                        rows={4}
                        className="form-textarea-white w-full"
                        placeholder="AI-generated thumbnail description..."
                    />
                </div>
            )}
        </div>
    );
}
