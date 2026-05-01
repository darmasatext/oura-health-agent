"use client";

import { useState, useRef, useEffect } from "react";

// Mini markdown renderer (no external deps)
function MarkdownContent({ content }: { content: string }) {
  const renderMarkdown = (text: string): string => {
    const inlineFormat = (s: string) =>
      s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
       .replace(/\*(.*?)\*/g, '<em>$1</em>')
       .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>');

    const lines = text.split('\n');
    const result: string[] = [];
    let inTable = false;
    let tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length < 2) {
        result.push(...tableBuffer.map(l => `<p>${inlineFormat(l)}</p>`));
        tableBuffer = [];
        inTable = false;
        return;
      }
      const headers = tableBuffer[0].split('|').filter(c => c.trim()).map(c => `<th class="px-2 py-1 text-left text-xs font-semibold border-b border-gray-200">${inlineFormat(c.trim())}</th>`);
      const rows = tableBuffer.slice(2).map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td class="px-2 py-1 text-xs border-b border-gray-100">${inlineFormat(c.trim())}</td>`);
        return `<tr class="hover:bg-gray-50">${cells.join('')}</tr>`;
      });
      result.push(`<div class="overflow-x-auto my-2"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50">${headers.join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`);
      tableBuffer = [];
      inTable = false;
    };

    for (const line of lines) {
      if (line.startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      }
      if (inTable) flushTable();

      if (line.startsWith('### ')) {
        result.push(`<p class="font-semibold text-gray-700 mt-2 mb-1">${line.slice(4)}</p>`);
      } else if (line.startsWith('## ')) {
        result.push(`<p class="font-bold text-gray-800 mt-2 mb-1">${line.slice(3)}</p>`);
      } else if (line.startsWith('# ')) {
        result.push(`<p class="font-bold text-gray-900 mt-2 mb-1">${line.slice(2)}</p>`);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        result.push(`<div class="flex gap-1 my-0.5"><span class="text-blue-400 mt-0.5">•</span><span>${inlineFormat(line.slice(2))}</span></div>`);
      } else if (line.match(/^\d+\. /)) {
        result.push(`<div class="my-0.5">${inlineFormat(line.replace(/^\d+\. /, ''))}</div>`);
      } else if (line.trim() === '') {
        result.push('<div class="h-1"></div>');
      } else {
        result.push(`<p>${inlineFormat(line)}</p>`);
      }
    }
    if (inTable) flushTable();
    return result.join('');
  };

  return (
    <div
      className="text-sm leading-relaxed space-y-0.5"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de salud. Puedo contarte sobre los datos de Amparo o Fer. ¿En qué te ayudo?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No pude procesar tu pregunta. Intenta de nuevo.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ocurrió un error al conectarme. Intenta de nuevo.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: "linear-gradient(135deg, #C0392B, #E74C3C, #922B21)" }}
        aria-label="Abrir chat de salud"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Gemini icon SVG */
          <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2C14 2 14 10 6 14C14 18 14 26 14 26C14 26 14 18 22 14C14 10 14 2 14 2Z" fill="white"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ background: "linear-gradient(135deg, #C0392B, #E74C3C)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none">
                <path d="M14 2C14 2 14 10 6 14C14 18 14 26 14 26C14 26 14 18 22 14C14 10 14 2 14 2Z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Asistente de Salud</p>
              <p className="text-white/70 text-xs">Powered by Claude Sonnet</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center mt-1"
                    style={{ background: "linear-gradient(135deg, #C0392B, #E74C3C)" }}>
                    <svg className="w-3 h-3" viewBox="0 0 28 28" fill="none">
                      <path d="M14 2C14 2 14 10 6 14C14 18 14 26 14 26C14 26 14 18 22 14C14 10 14 2 14 2Z" fill="white"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm rounded-tl-sm"
                }`}>
                  <MarkdownContent content={msg.content} />
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                    {msg.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C0392B, #E74C3C)" }}>
                  <svg className="w-3 h-3" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2C14 2 14 10 6 14C14 18 14 26 14 26C14 26 14 18 22 14C14 10 14 2 14 2Z" fill="white"/>
                  </svg>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900">
              {["¿Cómo durmió Amparo?", "HRV de Fer esta semana", "¿Quién está más activo?"].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-2 py-1 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre la salud de Amparo o Fer..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 max-h-20"
              style={{ minHeight: "36px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #C0392B, #E74C3C)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
