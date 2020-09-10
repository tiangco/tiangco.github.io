export default class TaskCard {
  constructor(scene) {
      this.render = (x, y, sprite) => {
          let card = scene.add.image(x, y, sprite).setScale(0.25).setInteractive();
          scene.input.setDraggable(card);
          return card;
      }
  }
}