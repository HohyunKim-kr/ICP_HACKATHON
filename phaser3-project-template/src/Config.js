import LoadingScene from "./scenes/LoadingScene";
import MainScene from "./scenes/MainScene";
import PlayingScene from "./scenes/PlayingScene";
import GameOverScene from "./scenes/GameOverScene";
import GameClearScene from "./scenes/GameClearScene";
import HarvestADScene from "./scenes/HarvestADScene";

const Config = {
  width: 1400,
  height: 1000,
  backgroundColor: 0x000000,
  scene: [
    LoadingScene,
    MainScene,
    PlayingScene,
    GameOverScene,
    GameClearScene,
    // HarvestADScene,
  ],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: process.env.DEBUG === "true",
    },
  },
};

export default Config;
