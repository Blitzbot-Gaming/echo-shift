export class Soundscape {
    context = null;
    enabled = true;
    play(name) {
        if (!this.enabled)
            return;
        try {
            this.context ??= new AudioContext();
            if (this.context.state === 'suspended')
                void this.context.resume();
            const sequences = {
                step: [280], blocked: [125, 95], rewind: [740, 620, 510, 350], win: [440, 555, 660, 880], select: [660], switch: [390, 585],
            };
            const volume = name === 'step' ? 0.018 : 0.05;
            sequences[name].forEach((pitch, index) => {
                const start = this.context.currentTime + index * (name === 'win' ? 0.12 : 0.055);
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                osc.type = name === 'blocked' ? 'sawtooth' : 'sine';
                osc.frequency.setValueAtTime(pitch, start);
                osc.frequency.exponentialRampToValueAtTime(Math.max(60, pitch * 0.78), start + 0.12);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
                osc.connect(gain).connect(this.context.destination);
                osc.start(start);
                osc.stop(start + 0.17);
            });
        }
        catch { /* sound is a progressive enhancement */ }
    }
}
//# sourceMappingURL=audio.js.map