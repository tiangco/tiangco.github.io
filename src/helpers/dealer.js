import Card from "./card";

export default class Dealer {
  constructor(scene) {
    this.dealCards = () => {
      console.log("im dealing cards");
      // deal the cards
      let cards = [];
      for (let suit = 1; suit <= 4; suit++) {
        let color =
          suit === 1
            ? "blue"
            : suit === 2
            ? "green"
            : suit === 3
            ? "pink"
            : "yellow";

        for (let value = 1; value <= 9; value++) {
          cards.push({ suit: suit, value: value, name: color + value });
        }
      }
      cards.push({ suit: 5, value: 1, name: "rocket1" });
      cards.push({ suit: 5, value: 2, name: "rocket2" });
      cards.push({ suit: 5, value: 3, name: "rocket3" });
      cards.push({ suit: 5, value: 4, name: "rocket4" });

      // shuffle
      Phaser.Utils.Array.Shuffle(cards);
      console.log("in dealer scene.playerUsers", scene.playerUsers);

      // reset and shuffle task cards
      scene.taskCards = [...cards];
      console.log("in dealer scene.taskCards", scene.taskCards);
      Phaser.Utils.Array.Shuffle(scene.taskCards);
      console.log("in dealer2 scene.taskCards", scene.taskCards);

      // clear all previous cards
      scene.playerUsers.forEach((element) => {
        element.cards = [];
      });

      // distribute the cards & set isFirstPlayer
      let playerCount = scene.playerUsers.length;
      let index = 0;
      cards.forEach((element) => {
        scene.playerUsers[index % playerCount].cards.push(element);
        index++;
      });

      // sort the cards for each player
      scene.playerUsers.forEach((element) => {
        element.cards.sort((a, b) =>
          a.suit > b.suit
            ? 1
            : a.suit < b.suit
            ? -1
            : a.value > b.value
            ? 1
            : a.value < b.value
            ? -1
            : 0
        );
        element.isFirstPlayer =
          element.cards[element.cards.length - 1].suit === 5 &&
          element.cards[element.cards.length - 1].value === 4;
      });
    };
  }
}
