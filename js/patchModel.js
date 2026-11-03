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
      this.pairs.push({
        ch: i,
        topLabel: `PREAMP ${i}`,
        topEndpoint: `MIC-PRE-01 / OUT-${i}`,
        topSignal: 'MIC/LINE',
        bottomLabel: `DAW IN ${i}`,
        bottomEndpoint: `INTERFACE / IN-${i}`,
        bottomSignal: 'LINE',
        normalling: i <= 16 ? 'half' : 'full',
      });
    }
  }
}
