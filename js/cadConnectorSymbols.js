// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Authentic Vector Connector Icons Extracted Directly from EDITORS.CAD.Like.audio

import { VOCABULARY } from './vocabulary.js';

/* The connectors this editor draws: one icon symbol each (below), tied by
   abbreviation to the CAD catalogue (vendor/apk-vocabulary, ROAD-3501), which
   gives the description, group, channels, cutout class and datasheet footprint.
   The list, labels and colours are config data (config/vocabulary.json
   symbols); only a symbol with no catalogue entry carries its own desc there. */
const V = globalThis.APKVocabulary;
export const CAD_CONNECTOR_CATALOG = (VOCABULARY.config.symbols || []).map((s) => {
  const cad = s.abbreviation ? V.connector(s.abbreviation) : null;
  if (s.abbreviation && !cad) console.warn(`[vocabulary] symbol ${s.id}: ${s.abbreviation} is not in the CAD catalogue`);
  return {
    id: s.id,
    label: s.label,
    color: s.color,
    abbreviation: cad ? cad.abbreviation : null,
    desc: cad ? cad.description : (s.desc || s.label),
    category: cad ? cad.group : (s.category || ''),
    channels: cad ? cad.channels : null,
    cutout: cad ? cad.cutout : null,
    ...(cad && cad.footprint ? { footprint: cad.footprint } : {}),
  };
});
const BY_ABBREVIATION = new Map(CAD_CONNECTOR_CATALOG.filter(c => c.abbreviation).map(c => [c.abbreviation, c]));

export const CAD_CONNECTOR_SYMBOLS_SVG = `
<symbol id="cad-icon-xlr-f" viewBox="0 0 120 120"><defs>
        <linearGradient id="cad_xlr-f_xlr3S-shell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#eeeeee" />
            <stop offset="50%" stop-color="#c0c0c0" />
            <stop offset="100%" stop-color="#808080" />
        </linearGradient>
        <radialGradient id="cad_xlr-f_xlr3S-pin" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#f5d56e" />
            <stop offset="60%" stop-color="#c9952a" />
            <stop offset="100%" stop-color="#8a6618" />
        </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="54" fill="#2a75d3" />
    <circle cx="60" cy="60" r="50" fill="url(#cad_xlr-f_xlr3S-shell)" />
    <g transform="translate(60,62) scale(1.05) translate(-60,-62)">
    <rect x="44" y="6" width="32" height="10" rx="2" fill="#b0b0b0" stroke="#888" stroke-width="1" />
    <rect x="48" y="2" width="24" height="12" rx="3" fill="#d0d0d0" stroke="#999" stroke-width="1.2" />
    <rect x="53" y="5" width="14" height="5" rx="1.5" fill="#333" />
    <rect x="46" y="14" width="28" height="4" fill="#999" />
    <rect x="56" y="10" width="8" height="5" rx="1" fill="#888" />
    <circle cx="60" cy="62" r="38" fill="#1a1a1a" />
    <text x="60" y="62" text-anchor="middle" dominant-baseline="central" fill="#333" font-weight="bold" font-size="38" font-family="monospace">3</text>
    <circle cx="44.2" cy="52.9" r="7" fill="#0a0a0a" stroke="#444" stroke-width="1" />
    <circle cx="44.2" cy="52.9" r="4.5" fill="none" stroke="#555" stroke-width="0.8" />
    <circle cx="75.8" cy="52.9" r="7" fill="#0a0a0a" stroke="#444" stroke-width="1" />
    <circle cx="75.8" cy="52.9" r="4.5" fill="none" stroke="#555" stroke-width="0.8" />
    <circle cx="60" cy="80.2" r="7" fill="#0a0a0a" stroke="#444" stroke-width="1" />
    <circle cx="60" cy="80.2" r="4.5" fill="none" stroke="#555" stroke-width="0.8" />
    </g>
</symbol>
<symbol id="cad-icon-xlr-m" viewBox="0 0 120 120"><defs>
        <linearGradient id="cad_xlr-m_xlr3P-shell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#eeeeee" />
            <stop offset="50%" stop-color="#c0c0c0" />
            <stop offset="100%" stop-color="#808080" />
        </linearGradient>
        <radialGradient id="cad_xlr-m_xlr3P-pin" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#f5d56e" />
            <stop offset="60%" stop-color="#c9952a" />
            <stop offset="100%" stop-color="#8a6618" />
        </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="54" fill="#2a75d3" />
    <circle cx="60" cy="60" r="50" fill="url(#cad_xlr-m_xlr3P-shell)" />
    <g transform="translate(60,62) scale(1.05) translate(-60,-62)">
    <rect x="56" y="10" width="8" height="5" rx="1" fill="#aaa" />
    <circle cx="60" cy="62" r="38" fill="#1a1a1a" />
    <text x="60" y="62" text-anchor="middle" dominant-baseline="central" fill="#333" font-weight="bold" font-size="38" font-family="monospace">3</text>
    <circle cx="44.2" cy="52.9" r="7" fill="url(#cad_xlr-m_xlr3P-pin)" stroke="#8a6618" stroke-width="0.8" />
    <circle cx="42.8" cy="51.5" r="1.75" fill="#ffe89a" fill-opacity="0.6" />
    <circle cx="75.8" cy="52.9" r="7" fill="url(#cad_xlr-m_xlr3P-pin)" stroke="#8a6618" stroke-width="0.8" />
    <circle cx="74.4" cy="51.5" r="1.75" fill="#ffe89a" fill-opacity="0.6" />
    <circle cx="60" cy="80.2" r="7" fill="url(#cad_xlr-m_xlr3P-pin)" stroke="#8a6618" stroke-width="0.8" />
    <circle cx="58.6" cy="78.8" r="1.75" fill="#ffe89a" fill-opacity="0.6" />
    </g>
</symbol>
<symbol id="cad-icon-bnc" viewBox="0 0 120 120"><defs>
            <linearGradient id="cad_bnc_bnc-metalOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#eeeeee" />
                <stop offset="50%" stop-color="#c0c0c0" />
                <stop offset="100%" stop-color="#808080" />
            </linearGradient>
            <linearGradient id="cad_bnc_bnc-metalInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#dddddd" />
                <stop offset="100%" stop-color="#888888" />
            </linearGradient>
            <radialGradient id="cad_bnc_bnc-dielectric" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#dddddd" />
            </radialGradient>
            <radialGradient id="cad_bnc_bnc-goldPin" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ffe680" />
                <stop offset="100%" stop-color="#b8860b" />
            </radialGradient>
        </defs>
        
        <circle cx="60" cy="60" r="54" fill="#2a75d3" />
        
        <circle cx="60" cy="60" r="50" fill="url(#cad_bnc_bnc-metalOuter)" />
        
        <rect x="8" y="56" width="16" height="8" rx="2" fill="#666" />
        <rect x="96" y="56" width="16" height="8" rx="2" fill="#666" />
        
        <circle cx="14" cy="60" r="3" fill="#999" />
        <circle cx="106" cy="60" r="3" fill="#999" />
        
        <circle cx="60" cy="60" r="36" fill="#1a1a1a" />
        
        <circle cx="60" cy="60" r="30" fill="url(#cad_bnc_bnc-metalInner)" />
        <circle cx="60" cy="60" r="26" fill="#111" />
        
        <circle cx="60" cy="60" r="16" fill="url(#cad_bnc_bnc-dielectric)" />
        
        <circle cx="60" cy="60" r="6" fill="url(#cad_bnc_bnc-goldPin)" />
    </symbol>
<symbol id="cad-icon-ethercon" viewBox="0 0 120 120"><defs>
      <radialGradient id="cad_ethercon_econ_bodyGrad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#c0c0c0" />
        <stop offset="60%" stop-color="#909090" />
        <stop offset="100%" stop-color="#707070" />
      </radialGradient>
      <linearGradient id="cad_ethercon_econ_latchGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bbb" />
        <stop offset="100%" stop-color="#888" />
      </linearGradient>
    </defs>
    
    <circle cx="60" cy="60" r="54" fill="#2a75d3" />
    
    <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
    
    <circle cx="60" cy="60" r="44" fill="url(#cad_ethercon_econ_bodyGrad)" stroke="#888" stroke-width="1.2" />
    
    <rect x="46" y="12" width="28" height="10" rx="2" fill="url(#cad_ethercon_econ_latchGrad)" stroke="#777" stroke-width="0.8" />
    <rect x="50" y="14" width="20" height="6" rx="1" fill="#aaa" />
    
    <rect x="56" y="15" width="8" height="4" rx="0.5" fill="#999" stroke="#777" stroke-width="0.5" />
    
    <circle cx="60" cy="62" r="32" fill="#333" />
    
    <rect x="40" y="46" width="40" height="30" rx="2" fill="#1a1a1a" stroke="#555" stroke-width="1" />
    
    <rect x="43" y="49" width="34" height="24" rx="1" fill="#111" stroke="#444" stroke-width="0.5" />
    
    <rect x="50" y="70" width="20" height="5" rx="1" fill="#222" stroke="#444" stroke-width="0.5" />
    
    <rect x="45" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="49" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="53" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="57" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="61" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="65" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="69" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
    <rect x="73" y="50" width="2" height="10" rx="0.3" fill="#d4af37" />
  </symbol>
<symbol id="cad-icon-rj45" viewBox="0 0 120 120"><defs>
            <linearGradient id="cad_rj45_rj45-metalOuter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#eeeeee" />
                <stop offset="50%" stop-color="#cccccc" />
                <stop offset="100%" stop-color="#999999" />
            </linearGradient>
            <linearGradient id="cad_rj45_rj45-goldPin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffe670" />
                <stop offset="60%" stop-color="#d4af37" />
                <stop offset="100%" stop-color="#997a00" />
            </linearGradient>
        </defs>
        
        <circle cx="60" cy="60" r="54" fill="#2a75d3" />
        
        <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
        
        <path d="M 22 30 L 98 30 C 100.2 30 102 31.8 102 34 L 102 74 C 102 76.2 100.2 78 98 78 L 82 78 L 82 88 C 82 90.2 80.2 92 78 92 L 42 92 C 39.8 92 38 90.2 38 88 L 38 78 L 22 78 C 19.8 78 18 76.2 18 74 L 18 34 C 18 31.8 19.8 30 22 30 Z" fill="url(#cad_rj45_rj45-metalOuter)" stroke="#555555" stroke-width="1.5" />
        
        <path d="M 26 34 L 94 34 C 95.1 34 96 34.9 96 36 L 96 72 C 96 73.1 95.1 74 94 74 L 76 74 L 76 86 C 76 87.1 75.1 88 74 88 L 46 88 C 44.9 88 44 87.1 44 86 L 44 74 L 26 74 C 24.9 74 24 73.1 24 72 L 24 36 C 24 34.9 24.9 34 26 34 Z" fill="#111111" />
        
        <path d="M 30 34 L 90 34 L 90 48 L 30 48 Z" fill="#222222" />
        
        <g fill="url(#cad_rj45_rj45-goldPin)">
            <rect x="37.5" y="34" width="3" height="14" rx="1" />
            <rect x="43.5" y="34" width="3" height="14" rx="1" />
            <rect x="49.5" y="34" width="3" height="14" rx="1" />
            <rect x="55.5" y="34" width="3" height="14" rx="1" />
            <rect x="61.5" y="34" width="3" height="14" rx="1" />
            <rect x="67.5" y="34" width="3" height="14" rx="1" />
            <rect x="73.5" y="34" width="3" height="14" rx="1" />
            <rect x="79.5" y="34" width="3" height="14" rx="1" />
        </g>
        
        <rect x="24" y="56" width="4" height="10" fill="#050505" />
        <rect x="92" y="56" width="4" height="10" fill="#050505" />
        
        <rect x="48" y="74" width="24" height="6" fill="#050505" />
    </symbol>
<symbol id="cad-icon-opticalcon" viewBox="0 0 120 120"><defs>
      <radialGradient id="cad_opticalcon_ocon_bodyGrad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#c0c0c0" />
        <stop offset="60%" stop-color="#909090" />
        <stop offset="100%" stop-color="#707070" />
      </radialGradient>
      <linearGradient id="cad_opticalcon_ocon_latchGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bbb" />
        <stop offset="100%" stop-color="#888" />
      </linearGradient>
      <radialGradient id="cad_opticalcon_ocon_ferruleGrad" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e0e0e0" />
      </radialGradient>
    </defs>
    
    <circle cx="60" cy="60" r="54" fill="#2a75d3" />
    
    <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
    
    <circle cx="60" cy="60" r="44" fill="url(#cad_opticalcon_ocon_bodyGrad)" stroke="#888" stroke-width="1.2" />
    
    <rect x="46" y="12" width="28" height="10" rx="2" fill="url(#cad_opticalcon_ocon_latchGrad)" stroke="#777" stroke-width="0.8" />
    <rect x="50" y="14" width="20" height="6" rx="1" fill="#aaa" />
    
    <rect x="56" y="15" width="8" height="4" rx="0.5" fill="#999" stroke="#777" stroke-width="0.5" />
    
    <circle cx="60" cy="62" r="32" fill="#333" />
    
    <rect x="34" y="44" width="52" height="34" rx="3" fill="#2a2a2a" stroke="#555" stroke-width="0.8" />
    
    <rect x="38" y="50" width="18" height="22" rx="2" fill="#1a1a1a" stroke="#444" stroke-width="0.6" />
    
    <circle cx="47" cy="61" r="6" fill="url(#cad_opticalcon_ocon_ferruleGrad)" stroke="#ccc" stroke-width="0.6" />
    <circle cx="47" cy="61" r="2.5" fill="#111" />
    
    <rect x="64" y="50" width="18" height="22" rx="2" fill="#1a1a1a" stroke="#444" stroke-width="0.6" />
    
    <circle cx="73" cy="61" r="6" fill="url(#cad_opticalcon_ocon_ferruleGrad)" stroke="#ccc" stroke-width="0.6" />
    <circle cx="73" cy="61" r="2.5" fill="#111" />
    
    <rect x="55" y="36" width="10" height="6" rx="1" fill="#555" stroke="#444" stroke-width="0.5" />
  </symbol>
<symbol id="cad-icon-speakon" viewBox="0 0 120 120"><defs>
    <linearGradient id="cad_speakon_spk4-plasticOuter" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#444" /><stop offset="50%" stop-color="#2a2a2a" /><stop offset="100%" stop-color="#111" /></linearGradient>
    <linearGradient id="cad_speakon_spk4-metalLatch" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fff" /><stop offset="50%" stop-color="#ccc" /><stop offset="100%" stop-color="#888" /></linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" fill="#2a75d3" />
  <circle cx="60" cy="60" r="50" fill="url(#cad_speakon_spk4-plasticOuter)" />
  <circle cx="60" cy="60" r="46" fill="#1a1a1a" />
  <rect x="46" y="6" width="28" height="14" rx="3" fill="url(#cad_speakon_spk4-metalLatch)" />
  <line x1="50" y1="10" x2="70" y2="10" stroke="#666" stroke-width="1.5" stroke-linecap="round" />
  <line x1="50" y1="14" x2="70" y2="14" stroke="#666" stroke-width="1.5" stroke-linecap="round" />
  <circle cx="60" cy="60" r="36" fill="#050505" />
  <rect x="54" y="22.5" width="12" height="7" fill="#050505" />
  <rect x="55" y="23.5" width="10" height="5" rx="1" fill="#eee" />
  <rect x="54" y="89.5" width="12" height="7" fill="#050505" />
  <rect x="55" y="90.5" width="10" height="5" rx="1" fill="#eee" />
  <rect x="22.5" y="54" width="7" height="12" fill="#050505" />
  <rect x="23.5" y="55" width="5" height="10" rx="1" fill="#eee" />
  <rect x="89.5" y="54" width="7" height="12" fill="#050505" />
  <rect x="90.5" y="55" width="5" height="10" rx="1" fill="#eee" />
  <circle cx="60" cy="60" r="22" fill="url(#cad_speakon_spk4-plasticOuter)" />
  <circle cx="60" cy="60" r="18" fill="#111" />
  <circle cx="60" cy="60" r="6" fill="#000" />
</symbol>
<symbol id="cad-icon-trs" viewBox="0 0 120 120"><defs>
            <radialGradient id="cad_trs_trs_outerMetal" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stop-color="#c0c0c0" />
                <stop offset="100%" stop-color="#808080" />
            </radialGradient>
            <radialGradient id="cad_trs_trs_ringMetal" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stop-color="#f5d56e" />
                <stop offset="100%" stop-color="#c9952a" />
            </radialGradient>
            <radialGradient id="cad_trs_trs_tipMetal" cx="45%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#ffe89a" />
                <stop offset="100%" stop-color="#d4a832" />
            </radialGradient>
        </defs>
        
        <circle cx="60" cy="60" r="54" fill="#2a75d3" />
        
        <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
        
        <circle cx="60" cy="60" r="40" fill="url(#cad_trs_trs_outerMetal)" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#666" stroke-width="1" />
        
        <path d="M30 45 A40 40 0 0 1 90 45" fill="none" stroke="#ddd" stroke-width="1" stroke-opacity="0.4" />
        
        <circle cx="60" cy="60" r="32" fill="#1a1a1a" />
        
        <circle cx="60" cy="60" r="28" fill="url(#cad_trs_trs_ringMetal)" />
        <circle cx="60" cy="60" r="28" fill="none" stroke="#8a6618" stroke-width="0.8" />
        
        <circle cx="60" cy="60" r="20" fill="#1a1a1a" />
        
        <circle cx="60" cy="60" r="14" fill="url(#cad_trs_trs_tipMetal)" />
        <circle cx="60" cy="60" r="14" fill="none" stroke="#8a6618" stroke-width="0.8" />
        
        <circle cx="60" cy="60" r="4" fill="#c9952a" />
        <circle cx="58" cy="58" r="1.5" fill="#ffe89a" fill-opacity="0.5" />
    </symbol>
<symbol id="cad-icon-hdmi" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#2a75d3" /><circle cx="60" cy="60" r="50" fill="#f8f9fa" />
  <path d="M 20 44 L 100 44 C 102.2 44 104 45.8 104 48 L 104 56 L 90 74 L 30 74 L 16 56 L 16 48 C 16 45.8 17.8 44 20 44 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
  <path d="M 23 47 L 97 47 L 99 55 L 87 71 L 33 71 L 21 55 Z" fill="#0f172a" />
  <path d="M 25 54 L 95 54 L 95 56 L 85 68 L 35 68 L 25 56 Z" fill="#334155" />
  <rect x="33" y="50" width="34" height="4" fill="transparent" stroke="#eab308" stroke-dasharray="2 2" stroke-width="4" />
  <rect x="53" y="50" width="34" height="4" fill="transparent" stroke="#eab308" stroke-dasharray="2 2" stroke-width="4" />
</symbol>
<symbol id="cad-icon-usbc" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#2a75d3" /><circle cx="60" cy="60" r="50" fill="#f8f9fa" />
  <rect x="25" y="48" width="70" height="24" rx="12" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
  <rect x="28" y="51" width="64" height="18" rx="9" fill="#0f172a" />
  <rect x="33" y="58" width="54" height="4" rx="1" fill="#1e293b" />
  <rect x="35" y="57" width="50" height="1.5" fill="transparent" stroke="#eab308" stroke-dasharray="2 2.1" stroke-width="1.5" />
  <rect x="35" y="61.5" width="50" height="1.5" fill="transparent" stroke="#eab308" stroke-dasharray="2 2.1" stroke-width="1.5" />
</symbol>
<symbol id="cad-icon-powercon" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#2a75d3" />
        <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
        
        <circle cx="60" cy="60" r="42" fill="#0055a4" />
        <circle cx="60" cy="60" r="32" fill="#003d7a" />
        <circle cx="60" cy="60" r="28" fill="#1e293b" />
        
        <rect x="52" y="16" width="16" height="8" fill="#cbd5e1" rx="2" />
        
        <rect x="56" y="32" width="8" height="6" fill="#0f172a" />
        <rect x="42" y="70" width="6" height="6" fill="#0f172a" />
        
        <path d="M 56 46 L 64 46 L 62 54 L 58 54 Z" fill="#cbd5e1" />
        <path d="M 44 64 L 50 68 L 46 74 L 40 70 Z" fill="#cbd5e1" />
        <path d="M 76 64 L 70 68 L 74 74 L 80 70 Z" fill="#cbd5e1" />
    </symbol>
<symbol id="cad-icon-dsub25" viewBox="0 0 120 120"><defs>
            <linearGradient id="cad_dsub25_db25-shell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e0e0e0" />
                <stop offset="40%" stop-color="#c0c0c0" />
                <stop offset="100%" stop-color="#808080" />
            </linearGradient>
            <linearGradient id="cad_dsub25_db25-shellEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#d0d0d0" />
                <stop offset="100%" stop-color="#707070" />
            </linearGradient>
            <radialGradient id="cad_dsub25_db25-pin" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#ffe680" />
                <stop offset="100%" stop-color="#b8860b" />
            </radialGradient>
            <radialGradient id="cad_dsub25_db25-screw" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#cccccc" />
                <stop offset="100%" stop-color="#666666" />
            </radialGradient>
        </defs>
        
        <circle cx="60" cy="60" r="54" fill="#2a75d3" />
        
        <circle cx="60" cy="60" r="50" fill="#f8f9fa" />
        
        <path
            d="M 10 40 L 110 40 L 100 80 L 20 80 Z"
            fill="url(#cad_dsub25_db25-shell)"
            stroke="url(#cad_dsub25_db25-shellEdge)"
            stroke-width="1.5"
            stroke-linejoin="round"
        />
        
        <path
            d="M 15 44 L 105 44 L 96 76 L 24 76 Z"
            fill="none"
            stroke="#aaa"
            stroke-width="0.5"
        />
        
        <path
            d="M 20 46 L 100 46 L 93 74 L 27 74 Z"
            fill="#1a1a2e"
            stroke="#333"
            stroke-width="0.5"
        />
        
        <circle cx="25.0" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="30.4" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="35.8" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="41.2" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="46.6" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="52.0" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="57.4" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="62.8" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="68.2" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="73.6" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="79.0" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="84.4" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="89.8" cy="54" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>

        <circle cx="27.7" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="33.1" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="38.5" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="43.9" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="49.3" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="54.7" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="60.1" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="65.5" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="70.9" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="76.3" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="81.7" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        <circle cx="87.1" cy="64" r="1.8" fill="url(#cad_dsub25_db25-pin)"/>
        
        <circle cx="15" cy="60" r="5.5" fill="url(#cad_dsub25_db25-screw)" />
        <circle cx="15" cy="60" r="3" fill="#888" />
        <line x1="13" y1="60" x2="17" y2="60" stroke="#555" stroke-width="1" />
        <line x1="15" y1="58" x2="15" y2="62" stroke="#555" stroke-width="1" />
        
        <circle cx="105" cy="60" r="5.5" fill="url(#cad_dsub25_db25-screw)" />
        <circle cx="105" cy="60" r="3" fill="#888" />
        <line x1="103" y1="60" x2="107" y2="60" stroke="#555" stroke-width="1" />
        <line x1="105" y1="58" x2="105" y2="62" stroke="#555" stroke-width="1" />
    </symbol>
<symbol id="cad-icon-bantam-tt" viewBox="0 0 120 120">
    <defs>
        <radialGradient id="cad_tt_bezel" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="60%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
        </radialGradient>
        <radialGradient id="cad_tt_collar" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#f4f4f5"/>
            <stop offset="70%" stop-color="#71717a"/>
            <stop offset="100%" stop-color="#27272a"/>
        </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="54" fill="url(#cad_tt_collar)" stroke="#18181b" stroke-width="2"/>
    <circle cx="60" cy="60" r="46" fill="#18181b"/>
    <circle cx="60" cy="60" r="42" fill="url(#cad_tt_bezel)" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="60" cy="60" r="30" fill="#09090b" stroke="#18181b" stroke-width="2"/>
    <circle cx="60" cy="60" r="20" fill="#030304"/>
    <path d="M 46 60 A 14 14 0 0 1 74 60" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="6" fill="#fbbf24"/>
</symbol>
<symbol id="cad-icon-blank" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="#1c1c20" stroke="#3f3f46" stroke-width="1.5"/>
<circle cx="24" cy="24" r="5" fill="#111" stroke="#52525b" stroke-width="1"/>
<circle cx="96" cy="96" r="5" fill="#111" stroke="#52525b" stroke-width="1"/>
<text x="60" y="64" text-anchor="middle" dominant-baseline="central" fill="#52525b" font-size="14" font-family="monospace" font-weight="bold">BLANK</text></symbol>
`;

export const CAD_SYMBOLS_SVG_SHEET = CAD_CONNECTOR_SYMBOLS_SVG;

/* What a saved port's connector is: the symbol's label, the word every other
   reader of the panel takes (the linear table's select, the IFC port words, the
   CSV). PatchPanel saved a dropped symbol's id until ROAD-3783, so a value that is
   exactly a symbol id reads back as that symbol's label; any other word (a label,
   an alias like XLR-F, a BIM part's own word) is kept as it was. */
export function savedConnector(value) {
  const sym = CAD_CONNECTOR_CATALOG.find(c => c.id === value);
  return sym ? sym.label : value;
}

export function getConnectorMeta(id) {
  // A symbol's own id or label, then any spelling the catalogue (or this app's aliases) knows.
  const own = CAD_CONNECTOR_CATALOG.find(c => c.id === id || c.label === id);
  if (own) return own;
  const cad = VOCABULARY.connectorFor(id);
  if (cad && BY_ABBREVIATION.has(cad.abbreviation)) return BY_ABBREVIATION.get(cad.abbreviation);
  const clean = String(id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("xlrf") || clean === "xlrs" || clean === "xlr3s") return CAD_CONNECTOR_CATALOG.find(c => c.id === "xlr-f");
  if (clean.includes("xlrm") || clean === "xlrp" || clean === "xlr3p") return CAD_CONNECTOR_CATALOG.find(c => c.id === "xlr-m");
  if (clean.includes("bnc")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "bnc");
  if (clean.includes("ethercon") || clean.includes("ether")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "ethercon");
  if (clean.includes("rj45")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "rj45");
  if (clean.includes("opticalcon") || clean.includes("optic")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "opticalcon");
  if (clean.includes("speakon") || clean.includes("speak")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "speakon");
  if (clean.includes("bantam") || clean.includes("tt")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "bantam-tt");
  if (clean.includes("trs") || clean.includes("phone") || clean.includes("jack")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "trs");
  if (clean.includes("hdmi")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "hdmi");
  if (clean.includes("usb")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "usbc");
  if (clean.includes("powercon") || clean.includes("pwr")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "powercon");
  if (clean.includes("dsub") || clean.includes("db25")) return CAD_CONNECTOR_CATALOG.find(c => c.id === "dsub25");
  return CAD_CONNECTOR_CATALOG.find(c => c.id === "blank") || CAD_CONNECTOR_CATALOG[0];
}
