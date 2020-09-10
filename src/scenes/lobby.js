import io from "socket.io-client";
import Dealer from "../helpers/dealer";

export default class Lobby extends Phaser.Scene {
  constructor() {
    super("lobby");
  }

  preload() {
    this.load.html("nameform", "src/assets/text/nameform.html");

    this.load.image("back", "src/assets/Back.png");
    this.load.image("blue1", "src/assets/Blue1.png");
    this.load.image("blue2", "src/assets/Blue2.png");
    this.load.image("blue3", "src/assets/Blue3.png");
    this.load.image("blue4", "src/assets/Blue4.png");
    this.load.image("blue5", "src/assets/Blue5.png");
    this.load.image("blue6", "src/assets/Blue6.png");
    this.load.image("blue7", "src/assets/Blue7.png");
    this.load.image("blue8", "src/assets/Blue8.png");
    this.load.image("blue9", "src/assets/Blue9.png");
    this.load.image("green1", "src/assets/Green1.png");
    this.load.image("green2", "src/assets/Green2.png");
    this.load.image("green3", "src/assets/Green3.png");
    this.load.image("green4", "src/assets/Green4.png");
    this.load.image("green5", "src/assets/Green5.png");
    this.load.image("green6", "src/assets/Green6.png");
    this.load.image("green7", "src/assets/Green7.png");
    this.load.image("green8", "src/assets/Green8.png");
    this.load.image("green9", "src/assets/Green9.png");
    this.load.image("pink1", "src/assets/Pink1.png");
    this.load.image("pink2", "src/assets/Pink2.png");
    this.load.image("pink3", "src/assets/Pink3.png");
    this.load.image("pink4", "src/assets/Pink4.png");
    this.load.image("pink5", "src/assets/Pink5.png");
    this.load.image("pink6", "src/assets/Pink6.png");
    this.load.image("pink7", "src/assets/Pink7.png");
    this.load.image("pink8", "src/assets/Pink8.png");
    this.load.image("pink9", "src/assets/Pink9.png");
    this.load.image("yellow1", "src/assets/Yellow1.png");
    this.load.image("yellow2", "src/assets/Yellow2.png");
    this.load.image("yellow3", "src/assets/Yellow3.png");
    this.load.image("yellow4", "src/assets/Yellow4.png");
    this.load.image("yellow5", "src/assets/Yellow5.png");
    this.load.image("yellow6", "src/assets/Yellow6.png");
    this.load.image("yellow7", "src/assets/Yellow7.png");
    this.load.image("yellow8", "src/assets/Yellow8.png");
    this.load.image("yellow9", "src/assets/Yellow9.png");
    this.load.image("rocket1", "src/assets/Rocket1.png");
    this.load.image("rocket2", "src/assets/Rocket2.png");
    this.load.image("rocket3", "src/assets/Rocket3.png");
    this.load.image("rocket4", "src/assets/Rocket4.png");
  }

  create() {
    this.playerUsers = [];
    //this.player = {};
    this.sessionId = "";
    this.taskCards = [];    // shared list of task cards
    this.unassignedTasks = [];
    
    let self = this;
    self.socket = {};

    var welcome = this.add.text(300, 10, "Please enter your name", {
      color: "white",
      fontSize: "20px ",
    });
    var element = this.add.dom(600, -20).createFromCache("nameform");
    this.tweens.add({
      targets: element,
      y: 60,
      duration: 3000,
      ease: "Power3",
    });

    var playerList = this.add.text(300, 30, "", {
      color: "white",
      fontSize: "20px ",
    });

    element.addListener("click");
    element.on("click", function (event) {
      if (event.target.name === "playButton") {
        var inputText = this.getChildByName("nameField");

        //  Have they entered anything?
        if (!inputText.value) {
          //  Flash the prompt
          this.scene.tweens.add({
            targets: welcome,
            alpha: 0.2,
            duration: 100,
            ease: "Power3",
            yoyo: true,
          });
        } else {
          //  Turn off the click events
          this.removeListener("click");

          //  Hide the login element
          this.setVisible(false);

          //  Populate the text with whatever they typed in
          welcome.setText("Welcome " + inputText.value + "!");

          //self.socket = io("http://localhost:3000");
          self.socket = io("https://ntt-socket.herokuapp.com");

          self.socket.on("connect", function () {
            console.log("Connected!");
            console.log("self.socket.id", self.socket.id);
            self.sessionId = self.socket.id;

            self.socket.emit("addUser", inputText.value);
            console.log("self.socket.id after adUser", self.socket.id);
          });

          self.socket.on("playerUsers", function (playerUsers) {
            playerList.setText(
              "dormers: " +
                playerUsers.map(({ userName }) => userName).join(", ")
            );
            playerList.setVisible(true);

            self.playerUsers = playerUsers;
            console.log("playerUsers", playerUsers);

            // self.player = playerUsers.filter((obj) => {
            //   return obj.id === self.sessionId;
            // })[0];
            // console.log("self.player", self.player);

            self.dealText.visible = playerUsers.length >= 3;
          });

          self.socket.on("startGame", function () {
            // starts the Game Scene for each player screen
            self.scene.start("Game", {
              socket: self.socket,
              sessionId: self.sessionId,
              playerUsers: self.playerUsers,
            });
          });
        }
      }
    });

    this.dealText = this.add
      .text(75, 30, ["Start schoolyear"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setVisible(false)
      .setInteractive();

    this.dealText.on("pointerdown", function () {

      // starts the actual game (data), cards are inside the playerUser object
      this.dealer = new Dealer(self);
      this.dealer.dealCards();

      self.socket.emit("startGame");    // call this first before the "updatePlayerUsers"
      // tell socket about playercards, now includes the shuffled cards & task cards
      self.socket.emit("initSharedData", {playerUsers: self.playerUsers, taskCards: self.taskCards});
    });

    this.dealText.on("pointerover", function () {
      self.dealText.setColor("#ff69b4");
    });

    this.dealText.on("pointerout", function () {
      self.dealText.setColor("#00ffff");
    });
  }
}
