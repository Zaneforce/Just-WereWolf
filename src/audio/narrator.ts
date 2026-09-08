import * as Speech from 'expo-speech';

let voiceEnabled = true;
let voiceRate = 1.0;
let idVoiceAvailable: boolean | null = null;

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
  try {
    const voices = await Speech.getAvailableVoicesAsync();
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

  try {
    await Speech.stop();
  } catch {
    // ignore
  }

  const hasId = await checkIdVoice();

  return new Promise<void>((resolve) => {
    try {
      Speech.speak(text, {
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
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
