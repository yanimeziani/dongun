import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { DeathScene } from "./scenes/DeathScene";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { ShopScene } from "./scenes/ShopScene";
import { UpgradeScene } from "./scenes/UpgradeScene";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#090b10",
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      fixedStep: true,
      fps: 60,
    },
  },
  scene: [BootScene, MainMenuScene, ShopScene, GameScene, UpgradeScene, DeathScene],
};
