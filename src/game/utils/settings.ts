const SETTINGS_KEY = "dongun:vibe-survivors:settings";

export type GameSettings = {
  muted: boolean;
};

const DEFAULT_SETTINGS: GameSettings = {
  muted: false,
};

export const Settings = {
  load(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return { ...DEFAULT_SETTINGS };
      }
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  save(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  },

  isMuted(): boolean {
    return Settings.load().muted;
  },

  setMuted(muted: boolean) {
    const settings = Settings.load();
    settings.muted = muted;
    Settings.save(settings);
  },
};
