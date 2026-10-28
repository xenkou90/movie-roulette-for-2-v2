const NOTES = [523.25, 659.25, 783.99];
const NOTE_SPACING_S = 0.12;
const NOTE_LENGTH_S = 0.5;
const PEAK_VOLUME = 0.15;

let context: AudioContext | null = null;

export function primeAudio(): void {
  if (typeof AudioContext === "undefined") return;

  context ??= new AudioContext();

  if (context.state === "suspended") {
    context.resume().catch(() => {
      // The browser refused to start audio; the chime will simply be skipped.
    });
  }
}

export function playMatchChime(): void {
  const audio = context;
  if (audio === null || audio.state !== "running") return;

  const start = audio.currentTime;

  NOTES.forEach((frequency, index) => {
    const noteStart = start + index * NOTE_SPACING_S;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(PEAK_VOLUME, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + NOTE_LENGTH_S);

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start(noteStart);
    oscillator.stop(noteStart + NOTE_LENGTH_S);
  });
}
