"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, Sprout, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CONTACT_NUMBER } from "@/lib/chat/knowledgeBase";

interface Message {
  role: "user" | "bot";
  text: string;
  isComplex?: boolean;
}

export function ChatWidget() {
  const t = useTranslations("ChatWidget");
  const locale = useLocale();

  const QUICK_REPLIES = [
    { label: t("quickReplies.disease"), msg: "crop disease yellow leaves" },
    { label: t("quickReplies.fertilizer"), msg: "fertilizer npk dose" },
    { label: t("quickReplies.weather"), msg: "weather rain farming tips" },
    { label: t("quickReplies.profit"), msg: "profit yield prediction" },
    { label: t("quickReplies.schemes"), msg: "government schemes pm kisan" },
    { label: t("quickReplies.contact"), msg: "contact expert help" },
  ];

  const GREETING: Message = {
    role: "bot",
    text: t("greeting"),
  };

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "bot", text: t("greeting") }]);
  }, [locale]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, locale }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.reply, isComplex: data.isComplex },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again or call us at " + CONTACT_NUMBER },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:block">KisanDost AI</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[360px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-80px)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white shrink-0">
            <div className="p-1.5 bg-white/20 rounded-full">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{t("headerTitle")}</p>
              <p className="text-xs text-white/70">{t("headerSub")}</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-muted/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                    <Sprout className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-card border border-border rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  {msg.isComplex && (
                    <a
                      href={`tel:${CONTACT_NUMBER.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 mt-2 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {t("callExpert")} {CONTACT_NUMBER}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sprout className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-border bg-background shrink-0">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => sendMessage(qr.msg)}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 disabled:opacity-50"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-background shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("placeholder")}
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
