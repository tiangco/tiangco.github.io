import Card from "../helpers/card";
import TaskCard from "../helpers/taskCard";
import Zone from "../helpers/zone";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
  }

  init(data) {
    console.log("init parameters", data);
    this.socket = data.socket;
    this.playerUsers = data.playerUsers;
    this.sessionId = data.sessionId;
  }

  preload() {}

  create() {
    this.zone = new Zone(this);
    this.dropZone = this.zone.renderZone();
    this.outline = this.zone.renderOutline(this.dropZone);

    this.playerCards = []; // the cards for this particular player
    this.firstPlayerSessionId = "";

    let self = this;
    console.log("self", self);

    // set individual table positions
    let localPlayerUsers = [...self.playerUsers];
    console.log("this.sessionId", this.sessionId);

    while (localPlayerUsers[0].id !== this.sessionId) {
      localPlayerUsers.push(localPlayerUsers.shift());
    }
    console.log("localPlayerUsers", localPlayerUsers);
    console.log("self.playerUsers", self.playerUsers);

    this.add.grid(0, 0, 2800, 1600, 50, 50, 0x555555, 0, 0x555555, 0.5);

    // draw the static items, names and first player indicator
    let positions = [
      { name: { x: 525, y: 300 }, firstPlayer: { x: 500 + 10, y: 310 } },
      { name: { x: 75, y: 50 }, firstPlayer: { x: 60, y: 60 } },
      { name: { x: 1025, y: 50 }, firstPlayer: { x: 1000 + 10, y: 60 } },
    ];

    function drawName(item, index) {
      console.log(
        "drawName",
        positions[index].name.x,
        positions[index].name.y,
        item.userName
      );
      self.add.text(
        positions[index].name.x,
        positions[index].name.y,
        item.userName,
        {
          color: "white",
          fontSize: "20px ",
        }
      );
    }

    function drawPlayerMat(item, index) {
      drawName(item, index);
    }

    localPlayerUsers.forEach(drawPlayerMat);

    this.isTaskGeneration = true;

    this.addTask = this.add
      .text(400, 25, ["Add Task"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setVisible(true)
      .setInteractive();

    this.addTask.on("pointerdown", function () {
      console.log("generate a task", self.taskCards);
      let task = self.taskCards.pop();
      self.unassignedTasks.push(task);
      console.log("self.unassignedTasks", self.unassignedTasks);

      self.socket.emit("unassignedTask", task, self.unassignedTasks.length);
    });

    this.addTask.on("pointerover", function () {
      self.addTask.setColor("#ff69b4");
    });

    this.addTask.on("pointerout", function () {
      self.addTask.setColor("#00ffff");
    });
    // ---------
    this.beginAssign = this.add
      .text(670, 25, ["Begin Task Assignments"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setVisible(true)
      .setInteractive();

    this.beginAssign.on("pointerdown", function () {
      console.log("begin assign a task");
    });

    this.beginAssign.on("pointerover", function () {
      self.addTask.setColor("#ff69b4");
    });

    this.addTask.on("pointerout", function () {
      self.beginAssign.setColor("#00ffff");
    });

    // =====================
    self.socket.on("initSharedClientData", function (data) {
      console.log("initSharedClientData", data);
      self.taskCards = data.taskCards;
      self.unassignedTasks = [];
      localPlayerUsers.forEach(function (item, index) {
        if (item.id === data.firstPlayerSessionId) {
          self.add.circle(
            positions[index].firstPlayer.x,
            positions[index].firstPlayer.y,
            12,
            0xff0000,
            1
          );
        }
      });
    });

    // called on the initial setup only!
    self.socket.on("initialPlayerCards", function (playerCards) {
      console.log("initialPlayerCards", playerCards);

      self.playerCards = playerCards;
      for (let i = 0; i < playerCards.length; i++) {
        let playerCard = new Card(self);
        playerCard.render(100 + i * 80, 600, playerCards[i].name);
      }
    });

    self.socket.on("unassignedTask", function(task, position) {
      console.log("draw this", task);
      console.log("postion", position);

      let taskCard = new TaskCard(self);
      taskCard.render(300 + position * 75, 150, task.name);
    });



// original demo code
    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragstart", function (pointer, gameObject) {
      gameObject.setTint(0xff69b4);
      //self.children.bringToTop(gameObject);
    });

    this.input.on("dragend", function (pointer, gameObject, dropped) {
      gameObject.setTint();
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });

    this.input.on("drop", function (pointer, gameObject, dropZone) {
      dropZone.data.values.cards++;
      gameObject.x = dropZone.x - 350 + dropZone.data.values.cards * 50;
      gameObject.y = dropZone.y;
      gameObject.disableInteractive();
      self.socket.emit("cardPlayed", gameObject, self.isPlayerA);
    });
  }

  update() {}
}
