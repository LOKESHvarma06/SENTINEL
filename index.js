import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * SENTINEL ELITE: Semantic Camouflage Auditor
 * Pure JavaScript Version
 */

const SYSTEM_PROMPT = `You are a Public Safety Analyst specializing in the Indian socio-political context. 
Detect "Semantic Camouflage" — neutral words used as coded triggers for potential violence.

1. Translate regional/Hinglish to English.
2. Identify "Dog-Whistles" (e.g., "Guests" for agitators, "Cleaning" for clearing areas).
3. Identify "Historical Triggers" (1984, 1992, 2002, 2020).
4. Assign a Harm Score (1-10).

Output strictly JSON:
{
  "score": number,
  "risk_level": "Low" | "Medium" | "High" | "Critical",
  "identified_codes": string[],
  "explanation": "One sentence reasoning",
  "translated_text": "Precise English translation"
}`;

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("History corruption:", e);
      }
    }
  }, []);

  const runAudit = async () => {
    if (!input.trim()) return;

    if (!process.env.API_KEY) {
      alert("Configuration Error: Intelligence Grid API Key missing. Ensure process.env.API_KEY is defined.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              risk_level: { type: Type.STRING },
              identified_codes: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING },
              translated_text: { type: Type.STRING }
            },
            required: ["score", "risk_level", "identified_codes", "explanation", "translated_text"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setResult(data);
      
      const newEntry = { ...data, input, id: Date.now(), timestamp: new Date().toISOString() };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('sentinel_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("Audit Failure:", err);
      alert("Terminal Link Error: Could not connect to the intelligence grid.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskTheme = (level) => {
    switch (level) {
      case 'Critical': return 'border-red-600 bg-red-950/20 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.2)]';
      case 'High': return 'border-orange-600 bg-orange-950/20 text-orange-400 shadow-[0_0_15px_rgba(234,88,12,0.1)]';
      case 'Medium': return 'border-yellow-600 bg-yellow-950/20 text-yellow-400';
      default: return 'border-emerald-600 bg-emerald-950/20 text-emerald-400';
    }
  };

  return React.createElement('div', { className: "min-h-screen bg-slate-950 text-slate-300 font-mono selection:bg-red-500/30 p-4 md:p-8" },
    React.createElement('header', { className: "max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 mb-10 gap-4" },
      React.createElement('div', null,
        React.createElement('h1', { className: "text-3xl font-black text-white italic tracking-tighter flex items-center gap-2" },
          React.createElement('span', { className: "w-3 h-3 bg-red-600 animate-pulse rounded-full" }),
          "SENTINEL_ELITE"
        ),
        React.createElement('p', { className: "text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1" },
          "Semantic Intelligence & Risk Auditor"
        )
      ),
      React.createElement('div', { className: "text-[10px] text-slate-600 font-bold bg-slate-900 px-3 py-1 rounded border border-slate-800" },
        `U_STATUS: ENCRYPTED // T_LOG: ${new Date().toLocaleTimeString()}`
      )
    ),
    React.createElement('main', { className: "max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8" },
      React.createElement('div', { className: "lg:col-span-7 space-y-6" },
        React.createElement('div', { className: "bg-slate-900 border border-slate-800 p-5 rounded-lg shadow-2xl relative overflow-hidden" },
          React.createElement('div', { className: "absolute top-0 right-0 p-2 text-[8px] text-slate-700 font-bold uppercase tracking-widest" }, "Input_Buffer"),
          React.createElement('textarea', {
            className: "w-full h-40 bg-slate-950 border border-slate-800 rounded p-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-red-900 transition-all resize-none text-sm",
            placeholder: "Paste regional text stream or Hinglish intercept here...",
            value: input,
            onChange: (e) => setInput(e.target.value),
            disabled: loading
          }),
          React.createElement('button', {
            onClick: runAudit,
            disabled: loading || !input.trim(),
            className: "w-full mt-4 bg-red-700 hover:bg-red-600 disabled:bg-slate-800 text-white font-black py-3 rounded text-xs tracking-[0.3em] uppercase transition-all"
          }, loading ? "ANALYZING..." : "EXECUTE SEMANTIC SCAN")
        ),
        result && React.createElement('div', { className: `p-6 border rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ${getRiskTheme(result.risk_level)}` },
          React.createElement('div', { className: "flex justify-between items-center mb-6 border-b border-current/20 pb-4" },
            React.createElement('div', null,
              React.createElement('h2', { className: "text-[10px] uppercase font-black opacity-60 mb-1" }, "Threat Level"),
              React.createElement('p', { className: "text-4xl font-black italic uppercase tracking-tighter leading-none" }, result.risk_level)
            ),
            React.createElement('div', { className: "text-right" },
              React.createElement('h2', { className: "text-[10px] uppercase font-black opacity-60 mb-1" }, "Actionability"),
              React.createElement('p', { className: "text-4xl font-black italic leading-none" }, `${result.score}/10`)
            )
          ),
          React.createElement('div', { className: "space-y-5 text-sm" },
            React.createElement('section', null,
              React.createElement('h3', { className: "text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1" }, "Decoded Translation"),
              React.createElement('p', { className: "italic text-slate-100 font-serif leading-relaxed" }, `"${result.translated_text}"`)
            ),
            React.createElement('section', null,
              React.createElement('h3', { className: "text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1" }, "Analyst Reasoning"),
              React.createElement('p', { className: "font-bold text-slate-200 leading-snug" }, result.explanation)
            ),
            result.identified_codes?.length > 0 && React.createElement('section', null,
              React.createElement('h3', { className: "text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2" }, "Dog-Whistles Flagged"),
              React.createElement('div', { className: "flex flex-wrap gap-2" },
                result.identified_codes.map((code, idx) =>
                  React.createElement('span', { key: idx, className: "bg-black/30 border border-current/20 px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded" }, code)
                )
              )
            )
          )
        )
      ),
      React.createElement('div', { className: "lg:col-span-5 space-y-6" },
        React.createElement('section', { className: "bg-slate-900/50 border border-slate-800 p-5 rounded-lg" },
          React.createElement('div', { className: "flex justify-between items-center mb-4" },
            React.createElement('h3', { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest" }, "Recent Audit Logs"),
            React.createElement('button', {
              onClick: () => { setHistory([]); localStorage.removeItem('sentinel_history'); },
              className: "text-[8px] text-slate-700 hover:text-red-500 uppercase font-bold"
            }, "Clear_All")
          ),
          React.createElement('div', { className: "space-y-3" },
            history.length > 0 ? history.map((h) =>
              React.createElement('div', { key: h.id, className: "group cursor-pointer bg-slate-950/40 hover:bg-slate-950 p-3 rounded border border-slate-800 transition-all", onClick: () => setResult(h) },
                React.createElement('p', { className: "text-[10px] text-slate-500 italic truncate" }, `"${h.input}"`),
                React.createElement('div', { className: "flex justify-between items-center mt-2" },
                  React.createElement('span', { className: "text-[8px] text-slate-800 font-bold" }, new Date(h.timestamp).toLocaleTimeString()),
                  React.createElement('span', { className: `text-[9px] font-black ${h.risk_level === 'Critical' ? 'text-red-600' : 'text-slate-400'}` }, h.risk_level)
                )
              )
            ) : React.createElement('div', { className: "py-10 text-center border border-dashed border-slate-800 rounded" },
              React.createElement('p', { className: "text-[10px] text-slate-700 font-bold uppercase tracking-widest" }, "No Intelligence Logged")
            )
          )
        )
      )
    ),
    React.createElement('footer', { className: "max-w-4xl mx-auto mt-20 pt-6 border-t border-slate-900 text-center" },
      React.createElement('p', { className: "text-[9px] text-slate-800 font-bold tracking-widest uppercase" },
        "Internal Use Only // Department of Socio-Political Stability // 2025"
      )
    )
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(App));
