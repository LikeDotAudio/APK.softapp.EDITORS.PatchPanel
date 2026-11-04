// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

export const NORMAL_TYPES = [
  { id: 'full', name: 'Full Normal', desc: 'Plug in top or bottom breaks connection between them' },
  { id: 'half', name: 'Half Normal', desc: 'Plug in top monitors signal without breaking normal; plug in bottom breaks' },
  { id: 'isolated', name: 'Non-Normal (Isolated)', desc: 'Top and bottom are completely separate circuits' },
  { id: 'parallel', name: 'Parallel (Mult)', desc: 'Top and bottom jacks hardwired together' },
];

export class PatchPanelModel {
  constructor(pairCount = 24) {
    this.id = 'pb_01';
    this.name = 'AUDIO-PB01';
    this.room = 'STUDIO-A';
    this.pairCount = pairCount;
    this.pairs = [];
    this.generatePairs(pairCount);
  }

  generatePairs(count) {
    this.pairs = [];
    for (let i = 1; i <= count; i++) {
      const mode = i <= 16 ? 'half-normal' : 'full-normal';
      this.pairs.push({
        ch: i,
        channel: i,
        topLabel: `PREAMP ${i}`,
        topEndpoint: `MIC-PRE-01 / OUT-${i}`,
        topSignal: 'MIC/LINE',
        bottomLabel: `DAW IN ${i}`,
        bottomEndpoint: `INTERFACE / IN-${i}`,
        bottomSignal: 'LINE',
        normalling: i <= 16 ? 'half' : 'full',
        normalMode: mode,
      });
    }
  }

  setNormalling(channelNumber, mode) {
    const pair = this.pairs.find(p => p.ch === channelNumber || p.channel === channelNumber);
    if (pair) {
      pair.normalMode = mode;
      pair.normalling = mode.includes('full') ? 'full' : (mode.includes('half') ? 'half' : mode);
    }
  }

  setLabels(channelNumber, topLabel, bottomLabel) {
    const pair = this.pairs.find(p => p.ch === channelNumber || p.channel === channelNumber);
    if (pair) {
      if (topLabel !== undefined) pair.topLabel = topLabel;
      if (bottomLabel !== undefined) pair.bottomLabel = bottomLabel;
    }
  }
}
