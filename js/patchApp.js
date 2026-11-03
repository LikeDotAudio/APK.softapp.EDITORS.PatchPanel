// Part of APK.audio - Audio & Video Patch Panel Designer
// Ported from OneThing gui-Interfaces/patch-panels and 190_panels

export class PatchPanelModel {
  constructor(channels = 24) {
    this.channels = channels;
    this.pairs = Array.from({ length: channels }, (_, i) => ({
      channel: i + 1,
      topLabel: `MIC IN ${i + 1}`,
      bottomLabel: `PREAMP ${i + 1}`,
      normalMode: 'half-normal', // 'full-normal' | 'half-normal' | 'isolated'
      signalType: 'Analog Audio Balanced'
    }));
  }

  setNormalling(channel, mode) {
    const p = this.pairs.find(x => x.channel === channel);
    if (p) p.normalMode = mode;
  }

  setLabels(channel, top, bottom) {
    const p = this.pairs.find(x => x.channel === channel);
    if (p) {
      if (top !== undefined) p.topLabel = top;
      if (bottom !== undefined) p.bottomLabel = bottom;
    }
  }
}
