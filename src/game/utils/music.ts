import Phaser from "phaser";

const REGISTRY_KEY = "musicTrack";
const ANALYSER_KEY = "musicAnalyser";

type MusicSound = Phaser.Sound.BaseSound & {
  key: string;
  isPlaying: boolean;
  stop: () => void;
  destroy: () => void;
};

type WebAudioBits = {
  context: AudioContext;
  volumeNode?: AudioNode;
  masterVolumeNode?: AudioNode;
};

export type MusicAnalyser = {
  node: AnalyserNode;
  buffer: Uint8Array<ArrayBuffer>;
  binCount: number;
};

export function playMusic(scene: Phaser.Scene, key: string, volume = 0.5) {
  const current = scene.registry.get(REGISTRY_KEY) as MusicSound | undefined;
  if (current && current.key === key && current.isPlaying) {
    return;
  }
  if (current) {
    current.stop();
    current.destroy();
  }
  if (!scene.cache.audio.exists(key)) {
    return;
  }
  const next = scene.sound.add(key, { loop: true, volume }) as MusicSound;
  next.play();
  scene.registry.set(REGISTRY_KEY, next);
  attachAnalyser(scene, next);
}

export function stopMusic(scene: Phaser.Scene) {
  const current = scene.registry.get(REGISTRY_KEY) as MusicSound | undefined;
  if (!current) {
    return;
  }
  current.stop();
  current.destroy();
  scene.registry.remove(REGISTRY_KEY);
  scene.registry.remove(ANALYSER_KEY);
}

export function getMusicAnalyser(scene: Phaser.Scene): MusicAnalyser | undefined {
  return scene.registry.get(ANALYSER_KEY) as MusicAnalyser | undefined;
}

function attachAnalyser(scene: Phaser.Scene, sound: MusicSound) {
  const manager = scene.sound as unknown as WebAudioBits;
  const ctx = manager.context;
  const tap = (sound as unknown as { volumeNode?: AudioNode }).volumeNode ?? manager.masterVolumeNode;
  if (!ctx || !tap) {
    return;
  }
  const existing = scene.registry.get(ANALYSER_KEY) as MusicAnalyser | undefined;
  if (existing) {
    try {
      existing.node.disconnect();
    } catch {
      // ignore
    }
  }
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;
  try {
    tap.connect(analyser);
  } catch {
    return;
  }
  const buffer = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
  scene.registry.set(ANALYSER_KEY, {
    node: analyser,
    buffer,
    binCount: analyser.frequencyBinCount,
  });
}
