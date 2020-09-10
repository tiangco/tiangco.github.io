import Phaser from "phaser";
import Game from "./scenes/game";
import Lobby from "./scenes/lobby";

const config = {
  type: Phaser.AUTO,
  parent: "dorm-mates",
  width: 1250,
  height: 700,
  dom: {
    createContainer: true,
  },

  scene: [Lobby,Game],
};

const game = new Phaser.Game(config);
