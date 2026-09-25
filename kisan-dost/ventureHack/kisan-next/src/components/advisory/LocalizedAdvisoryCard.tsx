'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Info, Send, CheckCircle2, FlaskConical, ExternalLink } from 'lucide-react';
import { IndicLanguageCode } from '@/lib/tts/ttsConfig';
import { StructuredAdvisoryPayload } from '@/lib/advisory/advisoryNarrative';
import { renderLocalizedAdvisory } from '@/lib/i18n/advisoryRenderer';
import { ListenButton } from './ListenButton';

export interface LocalizedAdvisoryCardProps {
  advisory: StructuredAdvisoryPayload;
  defaultLanguage?: IndicLanguageCode;
  onSendWhatsApp?: (language: IndicLanguageCode) => void;
  className?: string;
}

export function LocalizedAdvisoryCard({
  advisory,
  defaultLanguage = 'hi-IN',
  onSendWhatsApp,
  className = ''
}: LocalizedAdvisoryCardProps) {
  const [selectedLang, setSelectedLang] = useState<IndicLanguageCode>(defaultLanguage);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsappSentNotice, setWhatsappSentNotice] = useState(false);

  // Deterministically localize the advisory narrative
  const localized = renderLocalizedAdvisory(advisory, selectedLang);

  const isHighRisk = advisory.riskLevel === 'HIGH' || advisory.riskLevel === 'CRITICAL';
  const riskBadgeColor = isHighRisk
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  const verifiedBadgeColor = advisory.expertVerified
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  const handleWhatsAppClick = async () => {
    if (onSendWhatsApp) {
      onSendWhatsApp(selectedLang);
      return;
    }

    // Default WhatsApp Web share fallback
    setIsSendingWhatsApp(true);
    try {
      const shareText = encodeURIComponent(localized.whatsappText);
      const url = `https://wa.me/?text=${shareText}`;
      window.open(url, '_blank');
      setWhatsappSentNotice(true);
      setTimeout(() => setWhatsappSentNotice(false), 3500);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-5 shadow-lg space-y-4 ${className}`}>
      {/* Top Header: Risk Level & Verification Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${riskBadgeColor}`}>
            {isHighRisk ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            {localized.riskLevelLocalized}
          </span>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${verifiedBadgeColor}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {localized.verifiedStatusLocalized}
          </span>
        </div>

        {/* Language Switcher Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/30">
          {(['hi-IN', 'gu-IN', 'mr-IN'] as IndicLanguageCode[]).map((lang) => {
            const label = lang === 'hi-IN' ? 'हिन्दी' : lang === 'gu-IN' ? 'ગુજરાતી' : 'मराठी';
            const isActive = selectedLang === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Agronomic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground text-xs block">Crop / फसल:</span>
          <span className="font-semibold text-foreground text-base">{localized.cropLocalized}</span>
        </div>

        <div>
          <span className="text-muted-foreground text-xs block">Threat / रोग:</span>
          <span className="font-semibold text-rose-400 text-base">{localized.threatLocalized}</span>
        </div>
      </div>

      {/* Why Alert Explanation */}
      <div className="bg-muted/20 rounded-lg p-3 border border-border/20 text-xs text-muted-foreground">
        <span className="font-medium text-foreground block mb-0.5">Why Alert / कारण:</span>
        {advisory.whyAlert || 'Environmental humidity and temperature conditions favor pathogen growth.'}
      </div>

      {/* Recommended Actions */}
      <div className="space-y-1.5 text-xs">
        <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Recommended Actions:
        </span>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          {localized.actions.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      </div>

      {/* Chemical Action — Strictly flows from Phase 8 validated rules */}
      {localized.chemicalInstruction && advisory.chemicalAction?.offered && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            Validated Chemical Management (CIB&RC):
          </div>
          <p className="text-emerald-100/90 leading-relaxed">
            {localized.chemicalInstruction}
          </p>
          <span className="text-[10px] text-emerald-400/80 block mt-1">
            {localized.safetyFootnote}
          </span>
        </div>
      )}

      {/* Bottom Action Toolbar: Listen & WhatsApp */}
      <div className="pt-2 border-t border-border/30 flex flex-wrap items-center justify-between gap-3">
        {/* Listen Button Component */}
        <ListenButton
          text={localized.speechText}
          language={selectedLang}
          stylePreset={isHighRisk ? 'URGENT' : 'CALM'}
        />

        {/* WhatsApp Share Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppClick}
            disabled={isSendingWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {whatsappSentNotice && (
            <span className="text-xs text-emerald-400">Shared!</span>
          )}
        </div>
      </div>
    </div>
  );
}
