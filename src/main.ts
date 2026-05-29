import Phaser from "phaser";
import "./style.css";
import { gameConfig } from "./game/config";

const game = new Phaser.Game(gameConfig);

// Fade out the boot splash once Phaser has booted the first scene.
game.events.once(Phaser.Core.Events.READY, () => {
  const loading = document.getElementById("loading");
  if (!loading) {
    return;
  }
  loading.classList.add("hidden");
  window.setTimeout(() => loading.remove(), 600);
});
