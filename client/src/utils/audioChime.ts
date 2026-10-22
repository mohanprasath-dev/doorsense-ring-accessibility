/**
 * Client-side Web Audio API Ding-Dong synthesizer.
 * Runs completely locally with zero external audio assets.
 */
export function playRingChime(volumePercent: number = 80): void {
	try {
		const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContextClass) return;

		const ctx = new AudioContextClass();
		const gainNode = ctx.createGain();
		const masterVolume = Math.max(0, Math.min(volumePercent / 100, 1)) * 0.3;
		gainNode.gain.setValueAtTime(masterVolume, ctx.currentTime);
		gainNode.connect(ctx.destination);

		const now = ctx.currentTime;

		// First tone (Ding: ~659 Hz / E5)
		const osc1 = ctx.createOscillator();
		const toneGain1 = ctx.createGain();
		osc1.type = 'sine';
		osc1.frequency.setValueAtTime(659.25, now);
		toneGain1.gain.setValueAtTime(1.0, now);
		toneGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

		osc1.connect(toneGain1);
		toneGain1.connect(gainNode);
		osc1.start(now);
		osc1.stop(now + 0.9);

		// Second tone (Dong: ~523 Hz / C5)
		const osc2 = ctx.createOscillator();
		const toneGain2 = ctx.createGain();
		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(523.25, now + 0.32);
		toneGain2.gain.setValueAtTime(0.0, now);
		toneGain2.gain.setValueAtTime(0.9, now + 0.32);
		toneGain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

		osc2.connect(toneGain2);
		toneGain2.connect(gainNode);
		osc2.start(now + 0.32);
		osc2.stop(now + 1.45);
	} catch (e) {
		console.warn('AudioContext playback prevented by browser policy:', e);
	}
}
