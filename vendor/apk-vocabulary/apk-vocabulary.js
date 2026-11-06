// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* apk-vocabulary.js — THE ONE CONNECTOR AND SIGNAL-FORMAT VOCABULARY. window.APKVocabulary.

   GENERATED — do not edit. Made from the CAD's connector catalogue
   (contracts/ifc/signal-formats.json + EDITORS.CAD.Like.audio/src/connectors (ConnectorLookup.ts, panelConnectors.ts, multipin.ts, cutoutClasses.ts, cutoutGeometry.ts, adapterRules.ts))
   by  python3 .apk.scripts/gen_vocabulary.py   and held to it by
       python3 .apk.scripts/gen_vocabulary.py --check   (check.sh lane: vocabulary).

   307 connectors (abbreviation, description, group, channels, cutout class,
   and a datasheet footprint in mm where the CAD has one), 170 signal formats
   (the CAD's flows: networked audio, ST 2110, NMOS, MXL, streams, codecs, media),
   15 signal classes (the CAD's EssenceCategory), legacy spellings.

   LOAD: a plain script, a module side-effect import, or a require — all three
   set globalThis.APKVocabulary:
     <script src="./vendor/apk-vocabulary/apk-vocabulary.js"></script>
     import './vendor/apk-vocabulary/apk-vocabulary.js';
   An app's own extras (names the CAD does not catalogue, its legacy
   spellings, the subset it offers) are data in its config/vocabulary.json:
     const V = await APKVocabulary.forApp(new URL('../config/vocabulary.json', import.meta.url));
     V.connectorNames, V.formatNames, V.connectorFor(value), V.problems
   vendor/ copies are made, and held to this file, by
     python3 .apk.scripts/vendor_shared_web.py <app>/vendor/apk-vocabulary   (lane: webshared). */
(function (g) {
  'use strict';
  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.keys(o).forEach(function (k) { deepFreeze(o[k]); }); }
    return o;
  }
  var DATA = deepFreeze({
  "source": "contracts/ifc/signal-formats.json + EDITORS.CAD.Like.audio/src/connectors (ConnectorLookup.ts, panelConnectors.ts, multipin.ts, cutoutClasses.ts, cutoutGeometry.ts, adapterRules.ts)",
  "signalClasses": ["video","audio","ancillary","container","image","logic_bool","numeric","text","universal","control","transport_ip","physical_audio","physical_video","physical_network","physical_power"],
  "cutouts": {"D":"D hole (standard)","keyed":"Keyed D hole","oversize-D":"Oversize D hole","square":"Square hole"},
  "spellings": {"AES72-Type 1E":"AES72 Type 1E","AES72-Type 1O":"AES72 Type 1O","AES72-Type 1M":"AES72 Type 1M","AES72-Type 2O":"AES72 Type 2O","AES72-Type 3E":"AES72 Type 3E","AES72-Type 3M":"AES72 Type 3M","AES72-Type 4E":"AES72 Type 4E","AES72-Type 5E":"AES72 Type 5E","AES72-Type 6E":"AES72 Type 6E","8P8C":"RJ45","USBA":"USB-A","USBC":"USB-C","AC-Power":"Power-AC","RS232":"RS-232","DB9":"DB-9","IEC C13":"C13","VIRTUAL":"NONE"},
  "groups": [
    {"name":"Blank","description":"Blanking plates — cover an unused panel position so it stays a sealed face.","kind":"connector"},
    {"name":"Keystone","description":"Keystone snap-in jacks — square modules that fit a square keystone panel cutout. Carry HDMI, network, fiber, coax, audio, and more.","kind":"connector"},
    {"name":"Power-AC","description":"AC mains power connectors — NEMA, IEC, Neutrik PowerCon — used for equipment power distribution in racks and field positions.","kind":"connector"},
    {"name":"Audio-XLR","description":"XLR circular connectors — 3 to 8 pin variants, Neutrik and Switchcraft — for balanced mic, line, intercom, and DMX. 3- and 5-pin polarity and gender per AES14-1992 (r2014): pin 2 positive, male on outputs.","kind":"connector"},
    {"name":"Audio-Multipin","description":"Multi-conductor audio connectors — Amphenol, EDAC/Elco, MASS, DT12, Centronics, terminal blocks, SpeakON — for large channel-count and speaker distribution.","kind":"connector"},
    {"name":"Audio-Bloc","description":"Euroblock / Phoenix style pluggable terminal blocks for audio — compact screw-terminal connectors common on DSPs, amplifiers, and AV processors.","kind":"connector"},
    {"name":"Audio-Speaker","description":"Speaker-level connectors — SpeakON twist-lock for amplifier-to-loudspeaker links.","kind":"connector"},
    {"name":"Audio","description":"Analog and digital audio connectors — TRS, RCA, banana, TOSLINK — for line-level, headphone, and consumer audio signals.","kind":"connector"},
    {"name":"Patchbay","description":"Patchbay jacks — high-density patch points for studio and broadcast routing. TT (Tiny Telephone / Bantam) for balanced audio; MV (Micro Video) for 75-ohm video.","kind":"connector"},
    {"name":"Power-DC","description":"DC power connectors — circular barrel and multi-pole — for low-voltage device power.","kind":"connector"},
    {"name":"D-Sub","description":"D-Subminiature connectors — standard density and high density — for data, control, and legacy video.","kind":"connector"},
    {"name":"FC-Fiber","description":"FC (Ferrule Connector) fiber optic — threaded coupling, high precision.","kind":"connector"},
    {"name":"LC-Fiber","description":"LC (Lucent Connector) fiber optic — small form factor, push-pull — most common fiber connector in AV and IT.","kind":"connector"},
    {"name":"MP-Fiber","description":"MPO/MTP multi-fiber push-on — high-density trunk cabling.","kind":"connector"},
    {"name":"Multipin","description":"Multi-pin circular and DIN connectors — for control, data, and specialty signals.","kind":"connector"},
    {"name":"OC-Fiber","description":"Neutrik OpticalCon rugged fiber connectors — XLR-shell mounted for touring and broadcast.","kind":"connector"},
    {"name":"Punchdown","description":"Punchdown termination — 66-block, 110-block, Krone, QCP — for telco and structured cabling.","kind":"connector"},
    {"name":"RF","description":"Radio frequency coaxial connectors — BNC, F, N, SMA, SMB, TNC, MCX.","kind":"connector"},
    {"name":"RJ-Modular","description":"RJ-style modular data connectors — for Ethernet, telephony, and control networks.","kind":"connector"},
    {"name":"SC-Fiber","description":"SC (Subscriber Connector) fiber optic — push-pull square body.","kind":"connector"},
    {"name":"SFP","description":"Small Form-factor Pluggable transceivers — data center networking modules.","kind":"connector"},
    {"name":"SMPTE","description":"SMPTE broadcast camera connectors — hybrid electrical/fiber optic.","kind":"connector"},
    {"name":"ST-Fiber","description":"ST (Straight Tip) fiber optic — bayonet twist-lock — legacy infrastructure.","kind":"connector"},
    {"name":"TRIAX","description":"Triaxial broadcast connectors — three-conductor coax — for broadcast camera control.","kind":"connector"},
    {"name":"USB","description":"Universal Serial Bus connectors — Type-A, Type-B, Type-C, Mini, Micro.","kind":"connector"},
    {"name":"Video","description":"Video signal connectors — BNC, HD-BNC, DIN 1.0/2.3, HDMI, DisplayPort, DVI — for SDI and HDMI distribution.","kind":"connector"},
    {"name":"Robo","description":"Robo rugged multipin connectors — heavy-duty circular multipin for robotic-camera, motor, and field-power tails. Require an oversize-D panel cutout (§5).","kind":"connector"},
    {"name":"WireTerminal","description":"Wire termination points — terminal blocks with screw or push terminals.","kind":"connector"},
    {"name":"Audio-Networked","description":"Networked audio — Dante, DDM Manager, Q-LAN, AES67 and other audio-over-IP flows; transmitters generate flows (multicast, or unicast for Q-LAN), receivers subscribe.","kind":"format"},
    {"name":"ST-2110","description":"SMPTE ST 2110 professional media over managed IP — essence flows carried on a network interface (not physical connectors)","kind":"format"},
    {"name":"NMOS","description":"AMWA NMOS — discovery, registration and connection management for ST 2110 / IP media nodes","kind":"format"},
    {"name":"IP-Streaming","description":"IP streaming protocols — real-time RTP/RTSP, web streaming (HLS, DASH, CMAF, WebRTC) and broadcast / IPTV transport (multicast, MPEG-TS, SRT, RIST, Zixi).","kind":"format"},
    {"name":"AV-over-IP","description":"AV-over-IP systems — NDI, SDVoE and vendor encoder / decoder platforms carrying video and audio on a LAN. Dante, Dante AV, AES67 and ST 2110 are in their own families.","kind":"format"},
    {"name":"VoIP","description":"VoIP / unified communications signalling — the call set-up protocols; the voice itself is RTP (IP-Streaming) coded with G.711, G.722 or Opus (Codecs-Audio). WebRTC is in IP-Streaming.","kind":"format"},
    {"name":"MXL","description":"EBU DMF Media eXchange Layer — zero-copy media exchange between software media functions (containers) through shared-memory flows, or across hosts over a fabric. Flows are described by NMOS IS-04 Flow JSON and identified by UUID.","kind":"format"},
    {"name":"SMPTE-Audio","description":"SMPTE audio carriage — audio embedded in HD-SDI, non-PCM bitstreams (AC-3, E-AC-3, AAC) inside AES3, and the standard track and channel layouts. Signal formats, not physical connectors.","kind":"format"},
    {"name":"Codecs-Audio","description":"Audio codecs — how audio is coded: uncompressed PCM, lossless (FLAC, ALAC) and lossy (MP3, AAC, Opus, the G.7xx voice codecs). VoIP uses G.711 / G.722 / Opus; streaming AAC / MP3 / Opus.","kind":"format"},
    {"name":"Codecs-Video","description":"Video codecs — legacy (MPEG-1/-2, MPEG-4 Part 2), current (H.264, H.265, AV1 …) and professional / broadcast (JPEG 2000, ProRes, DNx, XAVC …). JPEG XS is ST 2110-22.","kind":"format"},
    {"name":"Codecs-Container","description":"Audio / video containers — the wrappers that hold coded audio, video, subtitles and metadata. MPEG-TS is the container; MPEG-TS-UDP (IP-Streaming) is the transport.","kind":"format"},
    {"name":"Media-Images","description":"Image & Still Graphic Formats — raster, vector, HDR, and RAW photographic media essences.","kind":"format"},
    {"name":"Media-3D-Doc","description":"3D scene models, documents, and data exchange structures.","kind":"format"}
  ],
  "connectors": [
    {"abbreviation":"BLANK","description":"Blank / blanking plate — covers an unused position","group":"Blank","channels":null,"cutout":"D"},
    {"abbreviation":"NONE","description":"No connector — a virtual or logical port with nothing to plug (was VIRTUAL)","group":"Blank","channels":null,"cutout":"D"},
    {"abbreviation":"KEY-HDMI","description":"Keystone HDMI pass-through jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-Cat6","description":"Keystone Cat6 RJ45 jack","group":"Keystone","channels":null,"cutout":"square","footprint":{"unit":"mm","extent":{"w":14.79,"h":19.31},"features":[{"kind":"rect","dx":0,"dy":0,"w":14.79,"h":19.31}],"source":{"maker":"CommScope","partNumber":"2291216-2 (KJ610 JACK-BLK)","document":"Product specifications \"KJ Series Keystone Modular Jack, 8-position, category 6, unshielded\" — \"Panel Cutout, recommended\"","url":"https://yursat.com.tr/Documents/Datenblatt%202291216-2-1.pdf","retrieved":"2026-11-04","view":"unstated"},"note":"CommScope sheet hosted by a distributor (yursat.com.tr); commscope.com returned 404 for the same document. The sheet prints \"14.79 x 19.31 mm\" without naming the axes; the first figure is taken as the width."}},
    {"abbreviation":"KEY-Cat6A","description":"Keystone Cat6A RJ45 jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-LC fiber","description":"Keystone LC fiber adapter","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-SC fiber","description":"Keystone SC fiber adapter","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-SC simplex","description":"Keystone SC simplex fiber adapter","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-ST","description":"Keystone ST simplex fiber adapter","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-BNC","description":"Keystone BNC coax jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-3.5mm","description":"Keystone 3.5mm TRS jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-Coaxial","description":"Keystone F-type coaxial jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-Banana","description":"Keystone banana binding-post jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-RCA","description":"Keystone RCA jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-RJ11","description":"Keystone RJ11/6P4C jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-MDIN4","description":"Keystone Mini DIN 4-pin jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-MDIN6","description":"Keystone Mini DIN 6-pin jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-USB-A","description":"Keystone USB-A jack","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"KEY-GEN","description":"Keystone generic / configurable","group":"Keystone","channels":null,"cutout":"square"},
    {"abbreviation":"5-20","description":"NEMA 5-20 Non-locking 20A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"5-15P","description":"PLUG : NEMA 5-15 Non-locking 15A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"5-15S","description":"SOCKET : NEMA 5-15 Non-locking 15A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"5-20S","description":"SOCKET : NEMA 5-20 Non-locking 20A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C1","description":"IEC C1 Power PLUG 2 pin non polarised (Electric Shaver)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C2","description":"IEC C2 Power SOCKET 2 pin non polarised (Electric Shaver)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C5","description":"IEC C5 Power PLUG 3 pin (Mickey Mouse)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C6","description":"IEC C6 Power SOCKET 3 pin (Mickey Mouse)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C7","description":"IEC C7 Power PLUG 2 pin (Figure of 8)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C8","description":"IEC C8 Power SOCKET 2 pin (Figure of 8)","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C13","description":"IEC C13 Power PLUG 3 pin. Standard equipment","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C14","description":"IEC C14 Power SOCKET 3 pin. Standard equipment","group":"Power-AC","channels":null,"cutout":"square","footprint":{"unit":"mm","extent":{"w":43.5,"h":20},"features":[{"kind":"rect","dx":0,"dy":0,"w":28,"h":20},{"kind":"screw","dx":-20,"dy":0,"d":3.5},{"kind":"screw","dx":20,"dy":0,"d":3.5}],"source":{"maker":"SCHURTER AG","partNumber":"6100-3","document":"Data sheet 6100-3 \"IEC Appliance Inlet C14, Screw-on Mounting, Front or Rear Side\", Dimensions [mm], 1) mounting from front-side","url":"https://www.schurter.com/var/schurter/storage/ilcatalogue/files/document/datasheet/en/pdf/typ_6100-3.pdf","retrieved":"2026-11-04","view":"front"},"note":"Front-side mounting cutout. Corners are \"max. R3\" (not modelled as a feature). Rear-side mounting uses 28.5 × 21 instead."}},
    {"abbreviation":"C15","description":"IEC C15 Power PLUG 3 pin. Some Cisco switches","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C16","description":"IEC C16 Power SOCKET 3 pin. Some Cisco switches","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C19","description":"IEC C19 Power PLUG 3 pin. Server rack PDUs","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"C20","description":"IEC C20 Power SOCKET 3 pin. Server rack PDUs","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-15P","description":"PLUG : NEMA L5-15 Twist-lock 15A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-15R","description":"RECEPTACLE : NEMA L5-15 Twist-lock 15A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-20P","description":"PLUG : NEMA L5-20 Twist-lock 20A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-20R","description":"RECEPTACLE : NEMA L5-20 Twist-lock 20A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-30P","description":"PLUG : NEMA L5-30 Twist-lock 30A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L5-30R","description":"RECEPTACLE : NEMA L5-30 Twist-lock 30A - 125V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L6-20P","description":"PLUG : NEMA L6-20 Twist-lock 20A - 250V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L6-20R","description":"RECEPTACLE : NEMA L6-20 Twist-lock 20A - 250V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L6-30P","description":"PLUG : NEMA L6-30 Twist-lock 30A - 250V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"L6-30R","description":"RECEPTACLE : NEMA L6-30 Twist-lock 30A - 250V","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC1P","description":"PLUG : Neutrik PowerCon TRUE1 IP65 rated","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC1S","description":"SOCKET : Neutrik PowerCon TRUE1 IP65 rated","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC20BP","description":"PLUG : Neutrik PowerCon 20A Blue","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC20BS","description":"SOCKET : Neutrik PowerCon 20A Blue","group":"Power-AC","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.8,"h":27.2},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.8},{"kind":"screw","dx":-9.5,"dy":12,"d":3.2},{"kind":"screw","dx":9.5,"dy":-12,"d":3.2}],"source":{"maker":"Neutrik AG","partNumber":"NAC3MPA-1","document":"Drawing ST-NAC3MPA-1, \"Panel cut out (rear side)\"","url":"https://www.neutrik.com/media/8959/download/nac3mpa-1-2.pdf?v=1","retrieved":"2026-11-04","view":"rear"}}},
    {"abbreviation":"PC20GP","description":"PLUG : Neutrik PowerCon 20A Grey","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC20GS","description":"SOCKET : Neutrik PowerCon 20A Grey","group":"Power-AC","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.8,"h":27.2},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.8},{"kind":"screw","dx":-9.5,"dy":12,"d":3.2},{"kind":"screw","dx":9.5,"dy":-12,"d":3.2}],"source":{"maker":"Neutrik AG","partNumber":"NAC3MPB-1","document":"Drawing 20001218, \"Panel cut out (rear side)\"","url":"https://www.neutrik.com/media/8964/download/20001218.pdf?v=2","retrieved":"2026-11-04","view":"rear"}}},
    {"abbreviation":"PC32P","description":"PLUG : Neutrik PowerCon 32A","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"PC32S","description":"SOCKET : Neutrik PowerCon 32A","group":"Power-AC","channels":null,"cutout":"D"},
    {"abbreviation":"X3P","description":"PLUG : 3-pin XLR — AES14: male = equipment output; pin 1 screen, 2 positive, 3 return (phantom: + supply on 2 & 3, − on 1). Also AES3 (AES/EBU) 110 ohm digital audio","group":"Audio-XLR","class":"physical_audio","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.6,"h":27.1},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.6},{"kind":"screw","dx":-9.5,"dy":12,"d":3.1},{"kind":"screw","dx":9.5,"dy":-12,"d":3.1}],"source":{"maker":"Neutrik AG","partNumber":"NC3MD-L-1","document":"Drawing NC3MDL-1, \"Panel cut out (rear side)\"","url":"https://www.neutrik.com/media/8395/download/nc3md-l-1-3.pdf?v=1","retrieved":"2026-11-04","view":"rear"}}},
    {"abbreviation":"X3S","description":"SOCKET : 3-pin XLR — AES14: female = equipment input; pin 1 screen, 2 positive, 3 return (phantom: + supply on 2 & 3, − on 1). Also AES3 (AES/EBU) 110 ohm digital audio","group":"Audio-XLR","class":"physical_audio","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.6,"h":27.1},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.6},{"kind":"screw","dx":-9.5,"dy":12,"d":3.1},{"kind":"screw","dx":9.5,"dy":-12,"d":3.1}],"source":{"maker":"Neutrik AG","partNumber":"NC3FD-L-1","document":"Drawing NC3FDL-1 (3102 St 10 10), \"Panel cut out (rear side)\"","url":"https://www.neutrik.com/media/8392/download/nc3fd-l-1-3.pdf?v=1","retrieved":"2026-11-04","view":"rear"}}},
    {"abbreviation":"X4P","description":"PLUG : 4-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X4S","description":"SOCKET : 4-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X5P","description":"PLUG : 5-pin XLR — AES14: male = equipment output; two-channel pin 1 screen, 2 L+, 3 L return, 4 R+, 5 R return","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X5S","description":"SOCKET : 5-pin XLR — AES14: female = equipment input; two-channel pin 1 screen, 2 L+, 3 L return, 4 R+, 5 R return","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X6P","description":"PLUG : 6-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X6S","description":"SOCKET : 6-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X7P","description":"PLUG : 7-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X7S","description":"SOCKET : 7-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X8P","description":"PLUG : 8-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"X8S","description":"SOCKET : 8-pin XLR","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS3P","description":"PLUG : 3-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS3S","description":"SOCKET : 3-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS4P","description":"PLUG : 4-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS4S","description":"SOCKET : 4-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS5P","description":"PLUG : 5-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS5S","description":"SOCKET : 5-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS7P","description":"PLUG : 7-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XS7S","description":"SOCKET : 7-pin XLR Switchcraft","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"XBEZ","description":"XLR bezel / color ring","group":"Audio-XLR","channels":null,"cutout":"D"},
    {"abbreviation":"A59P","description":"PLUG : DB25 AES59 (TASCAM) 8-channel balanced audio multipin — AES59: cables are always male. Ch1 24/12/25, Ch2 10/23/11, Ch3 21/9/22, Ch4 7/20/8, Ch5 18/6/19, Ch6 4/17/5, Ch7 15/3/16, Ch8 1/14/2 (+/return/shield); pin 13 not used. 4/40 UNC jackscrews. Not Yamaha-wired","group":"Audio-Multipin","channels":8,"cutout":"D"},
    {"abbreviation":"A59S","description":"SOCKET : DB25 AES59 (TASCAM) 8-channel balanced audio multipin — AES59: equipment is always female. Ch1 24/12/25, Ch2 10/23/11, Ch3 21/9/22, Ch4 7/20/8, Ch5 18/6/19, Ch6 4/17/5, Ch7 15/3/16, Ch8 1/14/2 (+/return/shield); pin 13 not used. 4/40 UNC jackscrews. Not Yamaha-wired","group":"Audio-Multipin","channels":8,"cutout":"D"},
    {"abbreviation":"AES72 Type 1E","description":"RJ45 (8P8C) AES72 Type 1E — 4-channel analog audio on quad twisted pair. Pins 1-8: 1- 1+ 2- 3+ 3- 2+ 4- 4+ (Even = +). T568A pairs: L1 green, L2 orange, L3 blue, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 1O","description":"RJ45 (8P8C) AES72 Type 1O — 4-channel analog audio on quad twisted pair. Pins 1-8: 1+ 1- 2+ 3- 3+ 2- 4+ 4- (Odd = +). T568A pairs: L1 green, L2 orange, L3 blue, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 1M","description":"RJ45 (8P8C) AES72 Type 1M — 4-channel analog audio on quad twisted pair. Pins 1-8: 1+ 1- 2+ 3+ 3- 2- 4+ 4- (Mixed). T568A pairs: L1 green, L2 orange, L3 blue, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 2O","description":"RJ45 (8P8C) AES72 Type 2O — 4-channel analog audio on quad twisted pair. Pins 1-8: 2+ 2- 3+ 1- 1+ 3- 4+ 4- (Odd = +). T568A pairs: L1 blue, L2 green, L3 orange, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 3E","description":"RJ45 (8P8C) AES72 Type 3E — 4-channel analog audio on quad twisted pair. Pins 1-8: 3- 3+ 2- 1+ 1- 2+ 4- 4+ (Even = +). T568A pairs: L1 blue, L2 orange, L3 green, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 3M","description":"RJ45 (8P8C) AES72 Type 3M — 4-channel analog audio on quad twisted pair. Pins 1-8: 3+ 3- 2+ 1+ 1- 2- 4+ 4- (Mixed). T568A pairs: L1 blue, L2 orange, L3 green, L4 brown","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 4E","description":"RJ45 (8P8C) AES72 Type 4E — 4-channel analog audio on quad twisted pair. Pins 1-8: 1- 1+ 3- 2+ 2- 3+ 4- 4+ (Even = +). T568A pairs: L1 green, L2 blue, L3 orange, L4 brown; two of these break out one 8-channel AES59 DB25. Phantom power needs shielded jacks + cable (§4.3); label \"AES72 Type 4E\" (\"…, not grounded\" if no ground, §4.4). Mates link-for-link only with other Type 4 kit; AES3 links ignore the letter (§4.5); a crossover cable aligns it with Type 2, all links inverted (Annex C)","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 5E","description":"RJ45 (8P8C) AES72 Type 5E — 4-channel analog audio on quad twisted pair. Pins 1-8: 3- 3+ 4- 1+ 1- 4+ 2- 2+ (Even = +). T568A pairs: L1 blue, L2 brown, L3 green, L4 orange","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AES72 Type 6E","description":"RJ45 (8P8C) AES72 Type 6E — 4-channel analog audio on quad twisted pair. Pins 1-8: 4- 4+ 3- 2+ 2- 3+ 1- 1+ (Even = +). T568A pairs: L1 brown, L2 blue, L3 orange, L4 green","group":"Audio-Multipin","channels":4,"cutout":"D"},
    {"abbreviation":"AMP50P","description":"50-conductor plug (Telco/Centronics/Champ/Amphenol/RJ21)","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"AMP50S","description":"50-conductor socket (Telco/Centronics/Champ/Amphenol/RJ21)","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"CENT24","description":"Centronics 24-pin (Micro Ribbon)","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"CENT36","description":"Centronics 36-pin (Micro Ribbon)","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"CENT50","description":"Centronics 50-pin (Micro Ribbon)","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"CP23-19","description":"CP23-19 circular multipin connector","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"DL96","description":"DL-96 multi-channel connector","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"DT12P","description":"Cannon FK-37, DT12 wiring standard","group":"Audio-Multipin","channels":12,"cutout":"D","footprint":{"unit":"mm","extent":{"w":42.189,"h":42.189},"features":[{"kind":"hole","dx":0,"dy":0,"d":41.275},{"kind":"screw","dx":-19.304,"dy":19.304,"d":3.5813999999999995},{"kind":"screw","dx":19.304,"dy":19.304,"d":3.5813999999999995},{"kind":"screw","dx":-19.304,"dy":-19.304,"d":3.5813999999999995},{"kind":"screw","dx":19.304,"dy":-19.304,"d":3.5813999999999995}],"source":{"maker":"Whirlwind","partNumber":"WDT12CF / WDT12CM","document":"DT12 Cutout (dt12dim.pdf), linked from \"AC Power DT-12 / DT12 Series Broadcast Multipin Connectors\"","url":"https://cdn.prod.website-files.com/613104abac7808ea202ed3bb/693a1f0758c29e79e23ba668_dt12dim.pdf","retrieved":"2026-11-04","view":"unstated"},"note":"The drawing dimensions the 1.520 in spacing across the top pair only; the four holes are drawn as a square pattern (measured on the drawing the vertical pitch agrees with 1.520 to within 1 %), so the same pitch is used vertically."}},
    {"abbreviation":"DT12S","description":"Cannon FK-37, DT12 wiring standard","group":"Audio-Multipin","channels":12,"cutout":"D","footprint":{"unit":"mm","extent":{"w":42.189,"h":42.189},"features":[{"kind":"hole","dx":0,"dy":0,"d":41.275},{"kind":"screw","dx":-19.304,"dy":19.304,"d":3.5813999999999995},{"kind":"screw","dx":19.304,"dy":19.304,"d":3.5813999999999995},{"kind":"screw","dx":-19.304,"dy":-19.304,"d":3.5813999999999995},{"kind":"screw","dx":19.304,"dy":-19.304,"d":3.5813999999999995}],"source":{"maker":"Whirlwind","partNumber":"WDT12CF / WDT12CM","document":"DT12 Cutout (dt12dim.pdf), linked from \"AC Power DT-12 / DT12 Series Broadcast Multipin Connectors\"","url":"https://cdn.prod.website-files.com/613104abac7808ea202ed3bb/693a1f0758c29e79e23ba668_dt12dim.pdf","retrieved":"2026-11-04","view":"unstated"},"note":"The drawing dimensions the 1.520 in spacing across the top pair only; the four holes are drawn as a square pattern (measured on the drawing the vertical pitch agrees with 1.520 to within 1 %), so the same pitch is used vertically."}},
    {"abbreviation":"E8P","description":"PLUG : EDAC/ELCO SAC38-8 — 8-channel audio multipin (38-pin shell)","group":"Audio-Multipin","channels":8,"cutout":"D"},
    {"abbreviation":"E8S","description":"SOCKET : EDAC/ELCO SAC38-8 — 8-channel audio multipin (38-pin shell)","group":"Audio-Multipin","channels":8,"cutout":"D"},
    {"abbreviation":"E12P","description":"PLUG : EDAC/ELCO SAC38-12 — 12-channel audio multipin (38-pin shell)","group":"Audio-Multipin","channels":12,"cutout":"D"},
    {"abbreviation":"E12S","description":"SOCKET : EDAC/ELCO SAC38-12 — 12-channel audio multipin (38-pin shell)","group":"Audio-Multipin","channels":12,"cutout":"D"},
    {"abbreviation":"E16P","description":"PLUG : EDAC/ELCO SAC56 — 16-channel audio multipin (56-pin shell)","group":"Audio-Multipin","channels":16,"cutout":"D"},
    {"abbreviation":"E16S","description":"SOCKET : EDAC/ELCO SAC56 — 16-channel audio multipin (56-pin shell)","group":"Audio-Multipin","channels":16,"cutout":"D"},
    {"abbreviation":"E20P","description":"PLUG : EDAC rectangular 20-position connector","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"E20S","description":"SOCKET : EDAC rectangular 20-position connector","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"E26P","description":"PLUG : EDAC/ELCO SAC90 — 26-channel audio multipin (90-pin shell)","group":"Audio-Multipin","channels":26,"cutout":"D"},
    {"abbreviation":"E26S","description":"SOCKET : EDAC/ELCO SAC90 — 26-channel audio multipin (90-pin shell)","group":"Audio-Multipin","channels":26,"cutout":"D"},
    {"abbreviation":"E32P","description":"PLUG : EDAC/ELCO SAC120 — 32-channel audio multipin (120-pin shell)","group":"Audio-Multipin","channels":32,"cutout":"D"},
    {"abbreviation":"E32S","description":"SOCKET : EDAC/ELCO SAC120 — 32-channel audio multipin (120-pin shell)","group":"Audio-Multipin","channels":32,"cutout":"D"},
    {"abbreviation":"MS###","description":"PLUG : MASS hermaphroditic. ## = number of pins","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"TB##P","description":"PLUG : Terminal Block. ## = number of connections","group":"Audio-Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"E3P","description":"PLUG : Elco3 / Edac3 — single-channel (T/R/S) audio connector","group":"Audio-Bloc","channels":1,"cutout":"D"},
    {"abbreviation":"E3S","description":"SOCKET : Elco3 / Edac3 — single-channel (T/R/S) audio connector","group":"Audio-Bloc","channels":1,"cutout":"D"},
    {"abbreviation":"MPB2","description":"MultiPinBlock 2 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB3","description":"MultiPinBlock 3 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB4","description":"MultiPinBlock 4 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB5","description":"MultiPinBlock 5 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB6","description":"MultiPinBlock 6 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB7","description":"MultiPinBlock 7 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB8","description":"MultiPinBlock 8 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"MPB9","description":"MultiPinBlock 9 Terminal (Euroblock / Phoenix)","group":"Audio-Bloc","channels":null,"cutout":"D"},
    {"abbreviation":"SPK2P","description":"PLUG : 2 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D"},
    {"abbreviation":"SPK2S","description":"SOCKET : 2 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":24,"h":27.2},"features":[{"kind":"hole","dx":0,"dy":0,"d":24},{"kind":"screw","dx":-9.5,"dy":12,"d":3.2},{"kind":"screw","dx":9.5,"dy":-12,"d":3.2}],"source":{"maker":"Neutrik AG","partNumber":"NL2MP","document":"Drawing ST-NL2MP, \"Panel Cutout (rear side)\"","url":"https://www.neutrik.com/media/8487/download/nl2mp-3.pdf?v=1","retrieved":"2026-11-04","view":"rear"}}},
    {"abbreviation":"SPK4P","description":"PLUG : 4 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D"},
    {"abbreviation":"SPK4S","description":"SOCKET : 4 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D"},
    {"abbreviation":"SPK8P","description":"8 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D"},
    {"abbreviation":"SPK8S","description":"SOCKET : 8 pole SpeakON","group":"Audio-Speaker","channels":null,"cutout":"D"},
    {"abbreviation":"BAN1","description":"Banana (Single)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"BAN1-HD","description":"Banana single 5-way heavy duty","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"BAN1-SK","description":"Banana single socket","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"BAN2","description":"Banana (Pair)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"BAN2-HD","description":"Banana dual 5-way heavy duty","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"BAN2-SK","description":"Banana dual socket","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"M-TRRS","description":"Mini Tip Ring Ring Shield (3.5mm Stereo w/ Mic)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"M-TRS","description":"Mini Tip Ring Shield (3.5mm Stereo)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"M-TS","description":"Mini Tip Shield (3.5mm Mono)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"RCA","description":"RCA Phono","group":"Audio","class":"physical_audio","channels":null,"cutout":"D"},
    {"abbreviation":"SPADE","description":"Spade lug","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"SPDIF","description":"Digital RCA Plug","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TOSS","description":"SOCKET : TOSLINK optical","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TRRS","description":"Tip Ring Ring Shield (1/4\" 4-Conductor Balanced/Mic)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TRSP","description":"PLUG : Tip Ring Shield (1/4\" Stereo)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TRSS","description":"SOCKET : Tip Ring Shield (1/4\" Stereo)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TSS","description":"SOCKET : Tip Shield (1/4\" Mono)","group":"Audio","channels":null,"cutout":"D"},
    {"abbreviation":"TT","description":"Tiny Telephone (Bantam) — 4.4mm balanced TRS audio patch jack","group":"Patchbay","channels":null,"cutout":"D"},
    {"abbreviation":"MV","description":"Micro Video — high-density 75 ohm video patch jack (e.g. Bittree DS800-MV)","group":"Patchbay","channels":null,"cutout":"D"},
    {"abbreviation":"CIR1P","description":"PLUG : 1 pole Circular Power","group":"Power-DC","channels":null,"cutout":"D"},
    {"abbreviation":"CIR1S","description":"SOCKET : 1 pole Circular Power","group":"Power-DC","channels":null,"cutout":"D"},
    {"abbreviation":"CIR2P","description":"PLUG : 2 pole Circular Power","group":"Power-DC","channels":null,"cutout":"D"},
    {"abbreviation":"CIR2S","description":"SOCKET : 2 pole Circular Power","group":"Power-DC","channels":null,"cutout":"D"},
    {"abbreviation":"D9P","description":"PLUG : D-Sub 9pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D9S","description":"SOCKET : D-Sub 9pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D15P","description":"PLUG : D-Sub 15pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D15S","description":"SOCKET : D-Sub 15pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D19P","description":"PLUG : D-Sub 19pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D19S","description":"SOCKET : D-Sub 19pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D25P","description":"PLUG : D-Sub 25pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D25S","description":"SOCKET : D-Sub 25pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D37P","description":"PLUG : D-Sub 37pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D37S","description":"SOCKET : D-Sub 37pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D50P","description":"PLUG : D-Sub 50pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"D50S","description":"SOCKET : D-Sub 50pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"DXPP","description":"PLUG : D-Sub non-standard pins","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"DXSS","description":"SOCKET : D-Sub non-standard pins","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD15P","description":"PLUG : HD-Sub 15pin (VGA)","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD15S","description":"SOCKET : HD-Sub 15pin (VGA)","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD26P","description":"PLUG : HD-Sub 26pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD26S","description":"SOCKET : HD-Sub 26pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD44P","description":"PLUG : HD-Sub 44pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD44S","description":"SOCKET : HD-Sub 44pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD62P","description":"PLUG : HD-Sub 62pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD62S","description":"SOCKET : HD-Sub 62pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD78P","description":"PLUG : HD-Sub 78pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD78S","description":"SOCKET : HD-Sub 78pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD100P","description":"PLUG : HD-Sub 100pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"HD100S","description":"SOCKET : HD-Sub 100pin","group":"D-Sub","channels":null,"cutout":"D"},
    {"abbreviation":"FCM1D","description":"OM1 FC multimode DUPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCM1S","description":"OM1 FC multimode SIMPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCM3D","description":"OM3 FC multimode DUPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCM3S","description":"OM3 FC multimode SIMPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCM4D","description":"OM4 FC multimode DUPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCM4S","description":"OM4 FC multimode SIMPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCS-D","description":"FC Singlemode DUPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"FCS-S","description":"FC Singlemode SIMPLEX","group":"FC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"LCA-D","description":"LC APC Singlemode DUPLEX (Angle-polish)","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCA-S","description":"LC APC Singlemode SIMPLEX (Angle-polish)","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM1D","description":"OM1 LC multimode DUPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM1S","description":"OM1 LC multimode SIMPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM3D","description":"OM3 LC multimode DUPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM3S","description":"OM3 LC multimode SIMPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM4D","description":"OM4 LC multimode DUPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCM4S","description":"OM4 LC multimode SIMPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCS-D","description":"LC Singlemode DUPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"LCS-S","description":"LC Singlemode SIMPLEX","group":"LC-Fiber","channels":null,"cutout":"square"},
    {"abbreviation":"MP8","description":"Multi-fiber Push On - 8 strand","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP8P","description":"PLUG : 8 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP8S","description":"SOCKET : 8 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP12","description":"Multi-fiber Push On - 12 strand","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP12P","description":"PLUG : 12 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP12S","description":"SOCKET : 12 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP24","description":"Multi-fiber Push On - 24 strand","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP24P","description":"PLUG : 24 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"MP24S","description":"SOCKET : 24 Strand MTP","group":"MP-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"CIR##P","description":"PLUG : Circular generic. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"CIR##S","description":"SOCKET : Circular generic. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"DIN#P","description":"PLUG : DIN-Style. # = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"DIN#S","description":"SOCKET : DIN-Style. # = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"HR##P","description":"PLUG : Hirose-Style. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"HR##S","description":"SOCKET : Hirose-Style. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"MDIN#P","description":"PLUG : Mini-DIN-Style. # = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"MDIN#S","description":"SOCKET : Mini-DIN-Style. # = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"DIN5S","description":"SOCKET : Mini DIN 5-pin panel mount","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"MPB##","description":"MultiPinBlock. ## = number of connections","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"TJ##P","description":"PLUG : Tajimi-Style. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"TJ##S","description":"SOCKET : Tajimi-Style. ## = number of pins","group":"Multipin","channels":null,"cutout":"D"},
    {"abbreviation":"OC2","description":"OpticalCon Fiber - 2 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OC4","description":"OpticalCon Fiber - 4 strand","group":"OC-Fiber","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.8,"h":27.2},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.8},{"kind":"screw","dx":-9.5,"dy":12,"d":3.2},{"kind":"screw","dx":9.5,"dy":-12,"d":3.2}],"source":{"maker":"Neutrik AG","partNumber":"NO2-4FDW-A","document":"Drawing ID 20000188 (Model ST-NO2-4FDW-A), \"Panel cutout (rear side)\", approved 11.10.2022","url":"https://www.neutrik.com/media/8190/download/Strichzeichnung%20NO2-4FDW-A.pdf?v=2","retrieved":"2026-11-04","view":"rear"},"note":"Keyed to OC4 because ConnectorLookup names this part (divBlock DIV_CON-NO2-4FDW-A) for it. Revision field on the drawing is \"-\"."}},
    {"abbreviation":"OC12","description":"OpticalCon MTP Fiber - 12 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OC24","description":"OpticalCon MTP Fiber - 24 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OCL2","description":"OpticalCon Lite Fiber - 2 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OCL4","description":"OpticalCon Lite Fiber - 4 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OCL12","description":"OpticalCon Lite MTP Fiber - 12 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"OCL24","description":"OpticalCon Lite MTP Fiber - 24 strand","group":"OC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"KRN","description":"Krone Punchdown","group":"Punchdown","channels":null,"cutout":"D"},
    {"abbreviation":"PN","description":"Other Punch connection","group":"Punchdown","channels":null,"cutout":"D"},
    {"abbreviation":"PN66","description":"Punch Block 66 type","group":"Punchdown","channels":null,"cutout":"D"},
    {"abbreviation":"PN110","description":"Punch Block 110 type","group":"Punchdown","channels":null,"cutout":"D"},
    {"abbreviation":"QCP","description":"ADC Quick Connect Punchdown","group":"Punchdown","channels":null,"cutout":"D"},
    {"abbreviation":"BNC50","description":"50 ohm BNC","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"F","description":"F-Type Coaxial Connector","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"MCX","description":"Micro Coax (similar to SMB, 30% smaller)","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"N","description":"50 ohm N connector","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"SMA","description":"PLUG : Sub Miniature A coax (threaded)","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"SMB","description":"PLUG : Sub Miniature B coax (snap on)","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"TNC","description":"PLUG : TNC connector","group":"RF","channels":null,"cutout":"D"},
    {"abbreviation":"4P4C","description":"4-position, 4-contact (RJ9/RJ10)","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"6P2C","description":"6-position, 2-contact (RJ11)","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"6P4C","description":"6-position, 4-contact (RJ14)","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"6P6C","description":"6-position, 6-contact (RJ25)","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"10P10C","description":"10-position, 10-contact (RJ50)","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45","description":"8P8C common name — 1000BASE-T (1GbE) unless a port says otherwise","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45-100M","description":"RJ45 at 100BASE-TX (Fast Ethernet)","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45-1G","description":"RJ45 at 1000BASE-T (1GbE)","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45-2.5G","description":"RJ45 at 2.5GBASE-T","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45-5G","description":"RJ45 at 5GBASE-T","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"RJ45-10G","description":"RJ45 at 10GBASE-T (10GbE)","group":"RJ-Modular","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"S8P8C","description":"Shielded 8P8C","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"SRJ45","description":"Shielded RJ45","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"ECON","description":"Ethercon RJ45 in XLR shell","group":"RJ-Modular","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":24,"h":27.2},"features":[{"kind":"hole","dx":0,"dy":0,"d":24},{"kind":"screw","dx":-9.5,"dy":12,"d":3.2},{"kind":"screw","dx":9.5,"dy":-12,"d":3.2}],"source":{"maker":"Neutrik AG","partNumber":"NE8FDP","document":"Drawing ST-NE8FDP, \"Panel cut out (rear side)\"","url":"https://www.neutrik.com/media/8668/download/ne8fdp-3.pdf?v=1","retrieved":"2026-11-04","view":"rear"},"note":"Bore and fixing holes are minimums (\">=\") on the drawing."}},
    {"abbreviation":"SECON","description":"Shielded Ethercon","group":"RJ-Modular","channels":null,"cutout":"D"},
    {"abbreviation":"SCA-D","description":"SC APC Singlemode DUPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCA-S","description":"SC APC Singlemode SIMPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM1D","description":"OM1 SC multimode DUPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM1S","description":"OM1 SC multimode SIMPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM3D","description":"OM3 SC multimode DUPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM3S","description":"OM3 SC multimode SIMPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM4D","description":"OM4 SC multimode DUPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCM4S","description":"OM4 SC multimode SIMPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCS-D","description":"SC Singlemode DUPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SCS-S","description":"SC Singlemode SIMPLEX","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"PLX-MM","description":"Fiber PLX duplex SC multimode","group":"SC-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"SFP","description":"SFP 1Gbps — legacy connections, management ports","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"SFP+","description":"SFP+ 10Gbps — enterprise aggregation, server uplinks","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"SFP28","description":"SFP28 25Gbps — modern data centers, high-performance computing","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"SFP56","description":"SFP56 50Gbps — high-density data center switching","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"QSFP+","description":"QSFP+ 40Gbps (4x10G) — core networking, high-speed backbones","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"QSFP28","description":"QSFP28 100Gbps (4x25G) — data center leaf-spine architectures","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"QSFP56","description":"QSFP56 200Gbps (4x50G) — high-speed data center/enterprise core","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"QSFP-DD","description":"QSFP-DD 400-800Gbps — AI clusters, hyperscale data centers","group":"SFP","class":"physical_network","channels":null,"cutout":"D"},
    {"abbreviation":"AOC","description":"Active Optical SFP with fiber attached","group":"SFP","channels":null,"cutout":"D"},
    {"abbreviation":"DAC","description":"Direct Attached Copper SFP","group":"SFP","channels":null,"cutout":"D"},
    {"abbreviation":"HFOP","description":"PLUG : SMPTE 311M hybrid fiber optic","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"HFOS","description":"SOCKET : SMPTE 311M hybrid fiber optic","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"SMPTEP","description":"PLUG : SMPTE 304M copper breakout","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"SMPTES","description":"SOCKET : SMPTE 304M copper breakout","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"SMPTEP-TH","description":"PLUG : SMPTE 304M thru-hole","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"SMPTES-TH","description":"SOCKET : SMPTE 304M thru-hole","group":"SMPTE","channels":null,"cutout":"D"},
    {"abbreviation":"STA-D","description":"ST APC Singlemode DUPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STA-S","description":"ST APC Singlemode SIMPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STM1-D","description":"OM1 ST multimode DUPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STM3-D","description":"OM3 ST multimode DUPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STM4-D","description":"OM4 ST multimode DUPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STS-D","description":"ST Singlemode DUPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"STS-S","description":"ST Singlemode SIMPLEX","group":"ST-Fiber","channels":null,"cutout":"D"},
    {"abbreviation":"TRXP","description":"PLUG : Triax thru-hole","group":"TRIAX","channels":null,"cutout":"D"},
    {"abbreviation":"TRXS","description":"SOCKET : Triax thru-hole","group":"TRIAX","channels":null,"cutout":"D"},
    {"abbreviation":"TRXP-FL","description":"PLUG : Triax flange","group":"TRIAX","channels":null,"cutout":"D"},
    {"abbreviation":"TRXS-FL","description":"SOCKET : Triax flange","group":"TRIAX","channels":null,"cutout":"D"},
    {"abbreviation":"USB-A","description":"PLUG : USB-A (USB 1 to 2)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"USBB","description":"PLUG : USB-B (USB 1 to 2)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"USB-C","description":"PLUG : USB-C (USB 2 to 3.0+)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"U3A","description":"PLUG : USB-A (USB 3)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"U3B","description":"PLUG : USB-B (USB 3)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"M-UA","description":"PLUG : Mini USB Type A","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"M-UB","description":"PLUG : Mini USB Type B","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"MI-UA","description":"PLUG : Micro USB Type A","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"MI-UB","description":"PLUG : Micro USB Type B","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"MI-U3B","description":"PLUG : USB Micro-B (USB 3.0+)","group":"USB","channels":null,"cutout":"D"},
    {"abbreviation":"BNC","description":"75 ohm standard BNC for coax — full-size, bayonet quarter-turn lock; also carries AES3-id 75 ohm digital audio","group":"Video","class":"physical_video","channels":null,"cutout":"D","footprint":{"unit":"mm","extent":{"w":23.6,"h":27.4},"features":[{"kind":"hole","dx":0,"dy":0,"d":23.6},{"kind":"screw","dx":-9.5,"dy":12,"d":3.4},{"kind":"screw","dx":9.5,"dy":-12,"d":3.4}],"source":{"maker":"Neutrik AG","partNumber":"NBB75DFI","document":"Drawing ST-NBB75DFI \"Bulkhead feed through isolated D-house\", \"Panel cut out\"","url":"https://www.neutrik.com/media/8620/download/nbb75dfi-3.pdf?v=1","retrieved":"2026-11-04","view":"front"}}},
    {"abbreviation":"BNC12","description":"12G 75 ohm standard BNC for coax — full-size, bayonet quarter-turn lock","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"DIN1","description":"75 ohm DIN 1.0/2.3 for coax — miniature push-pull latch, knurled sleeve; 1.0 mm pin / 2.3 mm outer contact; high-density panels","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"DP","description":"DisplayPort","group":"Video","class":"physical_video","channels":null,"cutout":"D"},
    {"abbreviation":"DVI-D","description":"DVI Digital","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"DVI-I","description":"DVI Digital & Analog","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"HDB12","description":"12G 75 ohm High Density BNC (HD-BNC) for coax — push-pull, no bayonet lugs; does not mate with standard BNC","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"HDBNC","description":"75 ohm High Density BNC (HD-BNC) for coax — push-pull, no bayonet lugs; does not mate with standard BNC","group":"Video","channels":null,"cutout":"D"},
    {"abbreviation":"HDMI","description":"High Definition Multimedia Interface","group":"Video","class":"physical_video","channels":null,"cutout":"D"},
    {"abbreviation":"ROBO","description":"Robo rugged multipin connector (plug)","group":"Robo","channels":null,"cutout":"oversize-D"},
    {"abbreviation":"ROBO-S","description":"Robo rugged multipin connector (socket)","group":"Robo","channels":null,"cutout":"oversize-D"},
    {"abbreviation":"TB##","description":"Terminal Block. ## = number of connections","group":"WireTerminal","channels":null,"cutout":"D"}
  ],
  "formats": [
    {"abbreviation":"DANTE-RX2","description":"Dante receive flow, 2 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-RX8","description":"Dante receive flow, 8 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-RX16","description":"Dante receive flow, 16 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-TX2","description":"Dante transmit flow, 2 channels (generated)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-TX8","description":"Dante transmit flow, 8 channels (generated)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-TX16","description":"Dante transmit flow, 16 channels (generated)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE","description":"Dante flow / channel — Audinate audio-over-IP, unicast or multicast flow","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-MC","description":"Dante multicast flow (generated, one-to-many)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-AES67","description":"Dante flow in AES67 mode (interoperable RTP / PTPv2)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-RX2","description":"DDM Manager receive flow, 2 channels (consumed) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-RX8","description":"DDM Manager receive flow, 8 channels (consumed) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-RX16","description":"DDM Manager receive flow, 16 channels (consumed) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-TX2","description":"DDM Manager transmit flow, 2 channels (generated, multicast) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-TX8","description":"DDM Manager transmit flow, 8 channels (generated, multicast) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-TX16","description":"DDM Manager transmit flow, 16 channels (generated, multicast) — Dante under a Dante Domain Manager domain","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM","description":"DDM Manager flow — a Dante flow whose devices are enrolled in a Dante Domain Manager domain (managed, secured Dante); a Dante receiver in the domain hears it","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DDM-MC","description":"DDM Manager multicast flow (generated, one-to-many) — Dante's 239.255.x.y : 4321 plan","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-RX2","description":"Q-LAN receive stream, 2 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-RX8","description":"Q-LAN receive stream, 8 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-RX16","description":"Q-LAN receive stream, 16 channels (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-TX2","description":"Q-LAN transmit stream, 2 channels (generated, unicast)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-TX8","description":"Q-LAN transmit stream, 8 channels (generated, unicast)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN-TX16","description":"Q-LAN transmit stream, 16 channels (generated, unicast)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"QLAN","description":"Q-LAN stream — QSC Q-SYS audio-over-IP: unicast RTP, 32-bit float, up to 16 channels per stream, PTPv2-clocked","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"AES67-RX","description":"AES67 receive flow (consumed)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"AES67-TX","description":"AES67 transmit flow (generated, multicast) — the same wire format as ST 2110-30 (see the ST-2110 tab)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"RAVENNA-RX","description":"RAVENNA receive stream (consumed; AES67-compatible)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"RAVENNA-TX","description":"RAVENNA transmit stream (generated, multicast; AES67-compatible)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"MILAN","description":"AVB / Milan stream — IEEE 1722 AVTP over TSN (Layer 2: no IP multicast group)","group":"Audio-Networked","class":"audio"},
    {"abbreviation":"DANTE-AV","description":"Dante AV — video (and embedded audio) over Dante","group":"Audio-Networked","class":"video"},
    {"abbreviation":"ST2110-10","description":"System timing & definitions — PTP (IEEE 1588, ST 2059-2 profile), RTP/UDP over IPv4 multicast (IGMPv3) or unicast; UDP ≤ 1460 octets (8960 extended, signalled MAXUDP); one SDP per stream with mediaclk + ts-refclk","group":"ST-2110","class":"control"},
    {"abbreviation":"ST2110-20","description":"Uncompressed active video — RFC 4175-based, 90 kHz clock, video/raw; YCbCr / RGB / ICtCp 4:4:4 / 4:2:2 / 4:2:0 at 8-16 bit; BT.709 / BT.2020 / BT.2100; GPM or BPM packing","group":"ST-2110","class":"video"},
    {"abbreviation":"ST2110-21","description":"Traffic shaping & delivery timing for video senders — TP=2110TPN (narrow, gapped), 2110TPNL (narrow linear) or 2110TPW (wide, software); receivers N / W / A","group":"ST-2110","class":"video"},
    {"abbreviation":"ST2110-22","description":"Constant bit-rate compressed video (e.g. JPEG XS)","group":"ST-2110","class":"video"},
    {"abbreviation":"ST2110-23","description":"Single video essence over multiple -20 streams","group":"ST-2110","class":"video"},
    {"abbreviation":"ST2110-30","description":"PCM digital audio over AES67 (L16 / L24) — 48 kHz mandatory; receiver levels A (1-8 ch @ 1 ms), B (+ 125 µs), C (up to 64 ch @ 125 µs), AX / BX / CX add 96 kHz; channel-order=SMPTE2110.(ST, 51, 71, 222, SGRP …)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-RX2","description":"ST 2110-30 audio receiver, 2 channels (consumed)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-RX8","description":"ST 2110-30 audio receiver, 8 channels (consumed)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-RX16","description":"ST 2110-30 audio receiver, 16 channels (consumed)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-TX2","description":"ST 2110-30 audio sender, 2 channels (generated)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-TX8","description":"ST 2110-30 audio sender, 8 channels (generated)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-30-TX16","description":"ST 2110-30 audio sender, 16 channels (generated)","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-31","description":"AES3 transparent transport","group":"ST-2110","class":"audio"},
    {"abbreviation":"ST2110-40","description":"SMPTE ST 291-1 ancillary data","group":"ST-2110","class":"ancillary"},
    {"abbreviation":"ST2110-41","description":"Fast metadata framework","group":"ST-2110","class":"ancillary"},
    {"abbreviation":"ST2110-43","description":"Timed text markup (TTML)","group":"ST-2110","class":"ancillary"},
    {"abbreviation":"ST2022-7","description":"Seamless protection switching — identical RTP streams on two paths (red / blue), rebuilt packet by packet; receiver skew class A ≤ 10 ms, B ≤ 50 ms, C ≤ 150 / 450 ms; signalled a=group:DUP in 2110","group":"ST-2110","class":"transport_ip"},
    {"abbreviation":"NMOS","description":"NMOS Node — IS-04 discovery & registration / IS-05 connection management API endpoint","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-IS04","description":"AMWA IS-04 discovery & registration","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-IS05","description":"AMWA IS-05 device connection management","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-IS07","description":"AMWA IS-07 event & tally","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-IS08","description":"AMWA IS-08 audio channel mapping","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-IS11","description":"AMWA IS-11 stream compatibility management","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-BCP-003","description":"AMWA BCP-003 security (TLS, authorization)","group":"NMOS","class":"control"},
    {"abbreviation":"NMOS-REG","description":"NMOS Registry / Controller — server application (IS-04 registry, IS-05 controller)","group":"NMOS","class":"control"},
    {"abbreviation":"RTP","description":"Real-time Transport Protocol — timed media packets over UDP (RFC 3550)","group":"IP-Streaming"},
    {"abbreviation":"RTCP","description":"RTP Control Protocol — reception reports and sync for an RTP session","group":"IP-Streaming"},
    {"abbreviation":"RTSP","description":"Real Time Streaming Protocol — play / pause control of an RTP stream (cameras, encoders)","group":"IP-Streaming"},
    {"abbreviation":"SRTP","description":"Secure RTP — encrypted and authenticated RTP media","group":"IP-Streaming"},
    {"abbreviation":"SAP","description":"Session Announcement Protocol — multicast announcement of available streams","group":"IP-Streaming"},
    {"abbreviation":"SDP","description":"Session Description Protocol — the text that describes a stream (address, port, format)","group":"IP-Streaming"},
    {"abbreviation":"HLS","description":"HTTP Live Streaming — segmented adaptive-bitrate delivery over HTTP","group":"IP-Streaming"},
    {"abbreviation":"MPEG-DASH","description":"MPEG-DASH — Dynamic Adaptive Streaming over HTTP","group":"IP-Streaming"},
    {"abbreviation":"CMAF","description":"Common Media Application Format — one fragmented-MP4 package for HLS and DASH","group":"IP-Streaming"},
    {"abbreviation":"WEBRTC","description":"WebRTC — real-time browser audio / video / data (SRTP media, ICE / DTLS)","group":"IP-Streaming"},
    {"abbreviation":"UDP-MC","description":"UDP multicast — one-to-many stream to an IP multicast group","group":"IP-Streaming"},
    {"abbreviation":"RTP-MC","description":"RTP multicast — RTP media sent to an IP multicast group","group":"IP-Streaming"},
    {"abbreviation":"MPEG-TS-UDP","description":"MPEG transport stream over UDP (IPTV, contribution and distribution)","group":"IP-Streaming"},
    {"abbreviation":"SRT","description":"Secure Reliable Transport — ARQ-protected, encrypted contribution over the open internet","group":"IP-Streaming"},
    {"abbreviation":"RIST","description":"Reliable Internet Stream Transport — VSF open-spec ARQ transport for contribution","group":"IP-Streaming"},
    {"abbreviation":"ZIXI","description":"Zixi — proprietary error-corrected live video transport over IP","group":"IP-Streaming"},
    {"abbreviation":"NDI","description":"NDI — NewTek / Vizrt Network Device Interface, full-bandwidth video, audio and tally on a LAN","group":"AV-over-IP"},
    {"abbreviation":"NDI-HX","description":"NDI HX — the compressed (H.264 / H.265) NDI variant for lower-bandwidth links","group":"AV-over-IP"},
    {"abbreviation":"SDVOE","description":"SDVoE — Software Defined Video over Ethernet, uncompressed / light-compressed AV on 10 GbE","group":"AV-over-IP"},
    {"abbreviation":"NVX","description":"Crestron DM NVX — AV-over-IP encoder / decoder stream","group":"AV-over-IP"},
    {"abbreviation":"SVSI","description":"AMX SVSI — AV-over-IP encoder / decoder stream","group":"AV-over-IP"},
    {"abbreviation":"QSYS-AV","description":"Q-SYS AV over IP — QSC NV-series video and audio on the Q-SYS network","group":"AV-over-IP"},
    {"abbreviation":"SIP","description":"SIP — Session Initiation Protocol, call set-up for VoIP phones, trunks and codecs","group":"VoIP","class":"control"},
    {"abbreviation":"H.323","description":"H.323 — ITU-T multimedia conferencing signalling (legacy room systems, gateways)","group":"VoIP","class":"control"},
    {"abbreviation":"MGCP","description":"MGCP — Media Gateway Control Protocol (call agent to gateway)","group":"VoIP"},
    {"abbreviation":"SCCP","description":"SCCP — Cisco Skinny Client Control Protocol (Cisco IP phones)","group":"VoIP"},
    {"abbreviation":"MXL","description":"MXL flow — an EBU DMF Media eXchange Layer flow: a ring buffer in a tmpfs-backed MXL domain that one writer fills and any number of readers map read-only (no packetising, no copy)","group":"MXL"},
    {"abbreviation":"MXL-VIDEO","description":"MXL discrete video flow — V210 video, read and written as timestamped grains","group":"MXL"},
    {"abbreviation":"MXL-AUDIO","description":"MXL continuous audio flow — Float32 samples, de-interleaved per channel","group":"MXL"},
    {"abbreviation":"MXL-ANC","description":"MXL discrete ancillary-data flow — ANC grains (captions, timecode, metadata)","group":"MXL"},
    {"abbreviation":"MXL-FABRIC","description":"MXL Fabric — flows shared between hosts over a fast fabric (RDMA, EFA), the Fabric API in MXL 1.1+","group":"MXL"},
    {"abbreviation":"ST299-1","description":"SMPTE ST 299-1 — 24-bit AES3 audio embedded in HD-SDI (ST 292-1): 4 groups × 4 ch = 16 ch at 48 kHz (8 at 96 kHz), data in C-stream HANC; group data DIDs 2E7h / 1E6h / 1E5h / 2E4h, control 1E3h / 2E2h / 2E1h / 1E0h","group":"SMPTE-Audio","class":"audio"},
    {"abbreviation":"ST337","description":"SMPTE ST 337 — non-PCM audio / data in AES3: bursts led by Pa/Pb sync (16-bit F872h / 4E1Fh), Pc burst_info, Pd length; channel-status non-audio bit set; frame mode (one burst over both subframes, ≤ 7 streams) or subframe mode (≤ 14)","group":"SMPTE-Audio","class":"audio"},
    {"abbreviation":"ST339","description":"SMPTE ST 339 — ST 337 generic data types: 0 null, 2 time stamp (stream 7, LTC + sample count), 3 pause, 26 utility (V-sync marker), 30 user-defined","group":"SMPTE-Audio"},
    {"abbreviation":"ST340-AC3","description":"SMPTE ST 340 — AC-3 (Dolby Digital, ATSC A/52) in AES3 via ST 337: data_type 1, one 1536-sample sync frame per burst (32 ms at 48 kHz); AES3 rate must equal the audio rate","group":"SMPTE-Audio","class":"audio"},
    {"abbreviation":"ST340-EAC3","description":"SMPTE ST 340 — E-AC-3 (Dolby Digital Plus) in AES3 via ST 337: data_type 16, 1536-frame burst period, frame mode only, 3324-frame (69.25 ms) decode latency","group":"SMPTE-Audio","class":"audio"},
    {"abbreviation":"ST2041-2","description":"SMPTE ST 2041-2 — MPEG-2 AAC LC / HE AAC in ADTS over AES3 via ST 337: data_type 7, burst every 1024 frames (2048 with SBR)","group":"SMPTE-Audio"},
    {"abbreviation":"ST2041-3","description":"SMPTE ST 2041-3 — MPEG-4 AAC (data_type 10, 1024 / 960 frames) and HE AAC v1 / v2 (data_type 11, 2048 / 1920) over AES3 via ST 337, in ADTS or LATM / LOAS","group":"SMPTE-Audio"},
    {"abbreviation":"ST2035","description":"SMPTE ST 2035 — audio track cases for recorders and embedded / AES3 I/O: tracks 1/2 = AES pair 1, 3/4 = pair 2 …; e.g. case 11c = 5.1 on T1-6 + stereo T7/8, 11d = 5.1 + Lt/Rt, 11e = 5.1 + ST 337 bitstream on T7/8","group":"SMPTE-Audio"},
    {"abbreviation":"ST2036-2","description":"SMPTE ST 2036-2 — UHDTV 22.2 audio: 24 channels, 48 kHz video-locked (96 kHz optional), 16 / 20 / 24-bit; FL FR / FC LFE1 on AES 1-2 … BtFL BtFR on AES 12; top, middle and bottom layers","group":"SMPTE-Audio"},
    {"abbreviation":"PCM","description":"PCM — uncompressed pulse-code modulation audio","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"LPCM","description":"LPCM — linear PCM (uncompressed, e.g. 24-bit / 48 kHz)","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"AES67-L24","description":"AES67 audio stream payload — L24 / L16 linear PCM over RTP","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"WAV","description":"WAV — RIFF wave audio, a container usually holding PCM","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"FLAC","description":"FLAC — Free Lossless Audio Codec","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"ALAC","description":"ALAC — Apple Lossless Audio Codec","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"WAVPACK","description":"WavPack — lossless (and hybrid) audio compression","group":"Codecs-Audio"},
    {"abbreviation":"APE","description":"Monkey's Audio (APE) — lossless audio compression","group":"Codecs-Audio"},
    {"abbreviation":"MP3","description":"MP3 — MPEG-1 / -2 Audio Layer III","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"AAC","description":"AAC — Advanced Audio Coding (streaming, broadcast, VoD)","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"AAC-LC","description":"AAC-LC — AAC Low Complexity profile","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"HE-AAC","description":"HE-AAC — High-Efficiency AAC (SBR / PS) for low bitrates","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"OPUS","description":"Opus — low-latency speech and music codec (VoIP, WebRTC, streaming)","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"VORBIS","description":"Vorbis — Xiph.org lossy audio codec (usually in Ogg / WebM)","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"WMA","description":"WMA — Windows Media Audio","group":"Codecs-Audio"},
    {"abbreviation":"G.711","description":"G.711 — 64 kb/s PCM µ-law / A-law telephony voice (VoIP)","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"G.722","description":"G.722 — 7 kHz wideband (HD) voice at 48–64 kb/s","group":"Codecs-Audio","class":"audio"},
    {"abbreviation":"G.723","description":"G.723.1 — 5.3 / 6.3 kb/s low-bitrate voice","group":"Codecs-Audio"},
    {"abbreviation":"G.726","description":"G.726 — ADPCM voice at 16–40 kb/s","group":"Codecs-Audio"},
    {"abbreviation":"G.728","description":"G.728 — 16 kb/s LD-CELP low-delay voice","group":"Codecs-Audio"},
    {"abbreviation":"G.729","description":"G.729 — 8 kb/s CS-ACELP voice","group":"Codecs-Audio"},
    {"abbreviation":"EVS-VOICE","description":"EVS — 3GPP Enhanced Voice Services (VoLTE / VoNR voice codec)","group":"Codecs-Audio"},
    {"abbreviation":"AMR-NB","description":"AMR-NB — Adaptive Multi-Rate narrowband voice","group":"Codecs-Audio"},
    {"abbreviation":"AMR-WB","description":"AMR-WB — Adaptive Multi-Rate wideband (G.722.2) voice","group":"Codecs-Audio"},
    {"abbreviation":"MPEG-1","description":"MPEG-1 Video","group":"Codecs-Video"},
    {"abbreviation":"MPEG-2","description":"MPEG-2 Video / H.262 (broadcast and DVD)","group":"Codecs-Video","class":"video"},
    {"abbreviation":"MPEG-4-P2","description":"MPEG-4 Part 2 Visual (ASP)","group":"Codecs-Video"},
    {"abbreviation":"DIVX","description":"DivX — MPEG-4 Part 2 implementation","group":"Codecs-Video"},
    {"abbreviation":"XVID","description":"Xvid — open MPEG-4 Part 2 implementation","group":"Codecs-Video"},
    {"abbreviation":"SORENSON","description":"Sorenson Video / Spark (legacy QuickTime and Flash)","group":"Codecs-Video"},
    {"abbreviation":"H.264","description":"H.264 / AVC — Advanced Video Coding","group":"Codecs-Video","class":"video"},
    {"abbreviation":"H.265","description":"H.265 / HEVC — High Efficiency Video Coding","group":"Codecs-Video","class":"video"},
    {"abbreviation":"H.266","description":"H.266 / VVC — Versatile Video Coding","group":"Codecs-Video","class":"video"},
    {"abbreviation":"VP8","description":"VP8 — Google / WebM video codec","group":"Codecs-Video","class":"video"},
    {"abbreviation":"VP9","description":"VP9 — Google / WebM video codec","group":"Codecs-Video","class":"video"},
    {"abbreviation":"AV1","description":"AV1 — AOMedia Video 1, royalty-free","group":"Codecs-Video","class":"video"},
    {"abbreviation":"JPEG2000","description":"JPEG 2000 — wavelet intra-frame coding (contribution, cinema, J2K over IP)","group":"Codecs-Video","class":"video"},
    {"abbreviation":"PRORES","description":"Apple ProRes — intra-frame post-production codec","group":"Codecs-Video","class":"video"},
    {"abbreviation":"PRORES-RAW","description":"Apple ProRes RAW — camera-sensor RAW in ProRes","group":"Codecs-Video","class":"video"},
    {"abbreviation":"DNXHD","description":"Avid DNxHD — HD intra-frame post codec","group":"Codecs-Video","class":"video"},
    {"abbreviation":"DNXHR","description":"Avid DNxHR — resolution-independent DNx (UHD and beyond)","group":"Codecs-Video","class":"video"},
    {"abbreviation":"CINEFORM","description":"GoPro CineForm — wavelet intermediate codec","group":"Codecs-Video"},
    {"abbreviation":"XAVC","description":"Sony XAVC — H.264-based acquisition format","group":"Codecs-Video"},
    {"abbreviation":"AVC-INTRA","description":"Panasonic AVC-Intra — intra-only H.264 acquisition","group":"Codecs-Video"},
    {"abbreviation":"MP4","description":"MP4 (.mp4) — MPEG-4 Part 14 container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MOV","description":"MOV (.mov) — QuickTime container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MKV","description":"MKV (.mkv) — Matroska container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"AVI","description":"AVI (.avi) — Audio Video Interleave container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MXF","description":"MXF (.mxf) — SMPTE Material Exchange Format, the broadcast file wrapper (operational patterns OP1a, OP-Atom)","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MXF-DV","description":"MXF DV-DIF (SMPTE ST 383) — DV / DVCPRO 25 / 50 / 100 Mb/s DIF streams in the MXF generic container, audio interleaved in the DIF, frame- or clip-wrapped","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MPEG-TS","description":"MPEG-TS (.ts) — MPEG-2 transport stream container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"MPEG-PS","description":"MPEG-PS (.mpg) — MPEG program stream container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"WEBM","description":"WebM (.webm) — Matroska-based web container (VP8 / VP9 / AV1, Opus / Vorbis)","group":"Codecs-Container","class":"container"},
    {"abbreviation":"FLV","description":"FLV (.flv) — Flash Video container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"ASF","description":"ASF (.asf) — Advanced Systems Format (Windows Media)","group":"Codecs-Container"},
    {"abbreviation":"OGG","description":"OGG (.ogg) — Xiph.org Ogg container","group":"Codecs-Container","class":"container"},
    {"abbreviation":"3GP","description":"3GP (.3gp) — 3GPP mobile container","group":"Codecs-Container"},
    {"abbreviation":"M4V","description":"M4V (.m4v) — Apple MPEG-4 video container","group":"Codecs-Container"},
    {"abbreviation":"PNG","description":"PNG (.png) — Portable Network Graphics, lossless compressed raster with alpha channel","group":"Media-Images","class":"image"},
    {"abbreviation":"JPEG","description":"JPEG / JPG (.jpg) — Joint Photographic Experts Group lossy photo image","group":"Media-Images","class":"image"},
    {"abbreviation":"TIFF","description":"TIFF (.tif) — Tagged Image File Format, uncompressed / LZW deep-color master image","group":"Media-Images","class":"image"},
    {"abbreviation":"SVG","description":"SVG (.svg) — Scalable Vector Graphics, XML-based 2D vector asset","group":"Media-Images","class":"image"},
    {"abbreviation":"WEBP","description":"WebP (.webp) — Modern web image format supporting lossy, lossless, and animated imagery","group":"Media-Images","class":"image"},
    {"abbreviation":"EXR","description":"OpenEXR (.exr) — Industrial Light & Magic 16-bit / 32-bit floating point high dynamic range raster","group":"Media-Images","class":"image"},
    {"abbreviation":"HDR","description":"Radiance HDR (.hdr) — RGBE high dynamic range environment and scene map","group":"Media-Images","class":"image"},
    {"abbreviation":"GIF","description":"GIF (.gif) — Graphics Interchange Format, 8-bit indexed palette animated graphic","group":"Media-Images","class":"image"},
    {"abbreviation":"BMP","description":"BMP (.bmp) — Windows bitmap uncompressed raster image","group":"Media-Images","class":"image"},
    {"abbreviation":"PSD","description":"PSD (.psd) — Adobe Photoshop layered raster/vector document format","group":"Media-Images","class":"image"},
    {"abbreviation":"DNG","description":"Adobe DNG (.dng) — Digital Negative open RAW photography specification","group":"Media-Images","class":"image"},
    {"abbreviation":"RAW-IMAGE","description":"RAW Image — Unprocessed camera sensor Bayer / CFA essence","group":"Media-Images","class":"image"},
    {"abbreviation":"PDF","description":"PDF (.pdf) — Adobe Portable Document Format","group":"Media-3D-Doc"},
    {"abbreviation":"GLTF","description":"glTF (.gltf / .glb) — Khronos Group GL Transmission Format 3D scene / model","group":"Media-3D-Doc"},
    {"abbreviation":"USDZ","description":"USDZ (.usdz) — Pixar / Apple Universal Scene Description packaged 3D asset","group":"Media-3D-Doc"},
    {"abbreviation":"JSON-DATA","description":"JSON (.json) — JavaScript Object Notation structured data stream","group":"Media-3D-Doc"},
    {"abbreviation":"XML-DATA","description":"XML (.xml) — Extensible Markup Language essence or schema","group":"Media-3D-Doc"}
  ]
  });

  /* ── helpers (from .apk.scripts/vocabulary/apk-vocabulary.helpers.js) ──────
     Everything below reads DATA (above) and never adds a name to it: an app's
     own extras come from its config/vocabulary.json, through view(). */

  var byConnector = new Map(), foldConnector = new Map();
  DATA.connectors.forEach(function (c) {
    byConnector.set(c.abbreviation, c);
    var k = c.abbreviation.toUpperCase();
    if (!foldConnector.has(k)) foldConnector.set(k, c);
  });
  var byFormat = new Map(), foldFormat = new Map();
  DATA.formats.forEach(function (f) {
    byFormat.set(f.abbreviation, f);
    var k = f.abbreviation.toUpperCase();
    if (!foldFormat.has(k)) foldFormat.set(k, f);
  });
  var renamed = new Map();
  Object.keys(DATA.spellings).forEach(function (old) { renamed.set(old.toUpperCase(), DATA.spellings[old]); });

  function loose(exact, fold, name) {
    var s = String(name == null ? '' : name).trim();
    if (!s) return null;
    if (exact.has(s)) return exact.get(s);
    var r = renamed.get(s.toUpperCase());
    if (r && exact.has(r)) return exact.get(r);
    return fold.get(s.toUpperCase()) || null;
  }

  /** A catalogued connector by abbreviation: exact, a renamed spelling, or any case. */
  function connector(name) { return loose(byConnector, foldConnector, name); }
  /** A catalogued signal format (a flow: Dante, ST 2110, a codec …) the same way. */
  function format(name) { return loose(byFormat, foldFormat, name); }

  function groupNames(kind) {
    return DATA.groups.filter(function (g) { return g.kind === kind; }).map(function (g) { return g.name; });
  }

  /* One side (connectors or formats) of an app's config, resolved. */
  function side(kind, cfg, find, all, problems) {
    cfg = cfg || {};
    var known = groupNames(kind);
    var list;
    if (Array.isArray(cfg.only)) {
      list = [];
      cfg.only.forEach(function (a) {
        var e = find(a);
        if (e) list.push(e); else problems.push(kind + ' "' + a + '" (config only) is not in the catalogue');
      });
    } else if (Array.isArray(cfg.groups)) {
      cfg.groups.forEach(function (g) { if (known.indexOf(g) < 0) problems.push(kind + ' group "' + g + '" (config groups) is not a ' + kind + ' group in the catalogue'); });
      list = all.filter(function (e) { return cfg.groups.indexOf(e.group) >= 0; });
    } else {
      list = all.slice();
    }
    var extras = (Array.isArray(cfg.extra) ? cfg.extra : []).map(function (x) {
      var name = String((x && x.name) || '').trim();
      if (!name) { problems.push(kind + ' extra with no name'); return null; }
      if (find(name)) problems.push(kind + ' extra "' + name + '" is a catalogue name: list it in only/groups instead');
      if (x.class && DATA.signalClasses.indexOf(x.class) < 0) problems.push(kind + ' extra "' + name + '" has class "' + x.class + '", not one of the signal classes');
      var out = { abbreviation: name, description: x.description || '', group: x.group || '', extra: true };
      Object.keys(x).forEach(function (k) { if (!(k in out) && k !== 'name') out[k] = x[k]; });
      return out;
    }).filter(Boolean);
    var aliases = cfg.aliases && typeof cfg.aliases === 'object' ? cfg.aliases : {};
    Object.keys(aliases).forEach(function (a) {
      if (!find(aliases[a])) problems.push(kind + ' alias "' + a + '" -> "' + aliases[a] + '" names nothing in the catalogue');
    });
    var entries = extras.concat(list);   // the app's own names first: they are what it reaches for most
    function resolve(value) {
      var s = String(value == null ? '' : value).trim();
      if (!s) return null;
      for (var i = 0; i < extras.length; i++) if (extras[i].abbreviation === s) return extras[i];
      if (Object.prototype.hasOwnProperty.call(aliases, s)) return find(aliases[s]);
      return find(s);
    }
    return { entries: entries, names: entries.map(function (e) { return e.abbreviation; }), resolve: resolve };
  }

  /**
   * The vocabulary as one app offers it. `config` is that app's
   * config/vocabulary.json (all keys optional):
   *   { "connectors": { "groups": [...] | "only": [...], "aliases": { "app spelling": "ABBR" }, "extra": [ { "name", "description", ... } ] },
   *     "formats":    { the same, and an extra may carry "class": one of signalClasses } }
   * No config: every connector and every format. `problems` lists any name the
   * config gives that the catalogue does not have (an app's test asserts none).
   */
  function view(config) {
    config = config || {};
    var problems = [];
    var c = side('connector', config.connectors, connector, DATA.connectors, problems);
    var f = side('format', config.formats, format, DATA.formats, problems);
    return {
      connectors: c.entries, connectorNames: c.names, connectorFor: c.resolve,
      formats: f.entries, formatNames: f.names, formatFor: f.resolve,
      config: config, problems: problems,
    };
  }

  /* Read an app's config/vocabulary.json. Never throws: no file (or no
     fetch) is the whole catalogue, with the reason in problems. */
  function readConfig(url) {
    var href = String(url);
    if (/^file:/.test(href) && typeof process !== 'undefined' && process.versions && process.versions.node) {
      return import('node:fs/promises').then(function (fs) {
        return fs.readFile(new URL(href), 'utf8');
      }).then(JSON.parse);
    }
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch on this page'));
    var opts = { cache: 'no-store' };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) opts.signal = AbortSignal.timeout(4000);
    return fetch(href, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function forApp(url) {
    return readConfig(url).then(view, function (err) {
      var v = view({});
      v.problems.push('config ' + url + ' unreadable (' + ((err && err.message) || err) + '): the whole catalogue is offered');
      return v;
    });
  }

  var api = {
    source: DATA.source,
    groups: DATA.groups,
    connectors: DATA.connectors,
    formats: DATA.formats,
    signalClasses: DATA.signalClasses,
    cutouts: DATA.cutouts,
    spellings: DATA.spellings,
    connector: connector,
    format: format,
    view: view,
    forApp: forApp,
  };
  if (Object.freeze) Object.freeze(api);

  g.APKVocabulary = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
