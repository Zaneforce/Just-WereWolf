let Speech: typeof import('expo-speech') | null = null;

let voiceEnabled = true;
let voiceRate = 1.0;
let idVoiceAvailable: boolean | null = null;
let speechLoaded = false;

async function loadSpeech() {
  if (speechLoaded) return Speech;
  speechLoaded = true;
  try {
    Speech = await import('expo-speech');
    return Speech;
  } catch {
    Speech = null;
    return null;
  }
}

export function setVoiceEnabled(enabled: boolean) {
  voiceEnabled = enabled;
  if (!enabled) stop();
}

export function setVoiceRate(rate: number) {
  voiceRate = Math.max(0.5, Math.min(2.0, rate));
}

export function getVoiceEnabled(): boolean {
  return voiceEnabled;
}

export function getVoiceRate(): number {
  return voiceRate;
}

async function checkIdVoice(): Promise<boolean> {
  if (idVoiceAvailable !== null) return idVoiceAvailable;
  const S = await loadSpeech();
  if (!S) { idVoiceAvailable = false; return false; }
  try {
    const voices = await S.getAvailableVoicesAsync();
    idVoiceAvailable = voices.some(
      (v) => v.language.startsWith('id') || v.language.startsWith('in'),
    );
  } catch {
    idVoiceAvailable = false;
  }
  return idVoiceAvailable;
}

export async function speak(text: string): Promise<void> {
  if (!voiceEnabled) return;
  const S = await loadSpeech();
  if (!S) return;

  try {
    await S.stop();
  } catch {
    // ignore
  }

  const hasId = await checkIdVoice();

  return new Promise<void>((resolve) => {
    try {
      S.speak(text, {
        language: hasId ? 'id-ID' : undefined,
        rate: voiceRate,
        onDone: () => resolve(),
        onError: () => resolve(),
        onStopped: () => resolve(),
      });
    } catch {
      resolve();
    }
  });
}

export function stop() {
  if (!Speech) return;
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
