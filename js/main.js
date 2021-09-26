var gameOverSound = document.getElementById("game-over-sound");

function start() {
  $("#start").hide();
  $("#background-game").append("<div id='player' class='animation-1'/>");
  $("#background-game").append(
    "<div id='enemy-helicopter' class='animation-2'/>"
  );
  $("#background-game").append("<div id='enemy-truck'/>");
  $("#background-game").append("<div id='friend' class='animation-3'/>");
  $("#background-game").append("<div id='game-score'/>");
  $("#background-game").append("<div id='energy'/>");

  var game = {};
  game.pressed = [];
  var endGame = false;

  const MAIN_KEYS = {
    UP: 38,
    DOWN: 40,
    SHOT: 32,
  };

  var velocity = 5;
  var positionY = parseInt(Math.random() * 334);
  var canShot = true;

  var points = 0;
  var saved = 0;
  var lost = 0;
  var currentEnergy = 3;

  var shotSound = document.getElementById("shot-sound");
  var explosionSound = document.getElementById("explosion-sound");
  var music = document.getElementById("music");
  var lostSound = document.getElementById("lost-sound");
  var rescueSound = document.getElementById("rescue-sound");

  game.timer = setInterval(loop, 30);
  function loop() {
    moveBackground();
    movePlayer();
    moveHelicopter();
    moveTruck();
    moveFriend();
    collision();
    score();
    energy();
    music.addEventListener(
      "ended",
      function () {
        music.currentTime = 0;
        music.play();
      },
      false
    );
    music.play();
  }

  $(document).keydown(function (e) {
    game.pressed[e.which] = true;
  });

  $(document).keyup(function (e) {
    game.pressed[e.which] = false;
  });

  function moveBackground() {
    left = parseInt($("#background-game").css("background-position"));
    $("#background-game").css("background-position", left - 1);
  }

  function movePlayer() {
    if (game.pressed[MAIN_KEYS.UP]) {
      var top = parseInt($("#player").css("top"));
      if (top - 10 <= 0) {
        return;
      }
      $("#player").css("top", top - 10);
    }
    if (game.pressed[MAIN_KEYS.DOWN]) {
      var top = parseInt($("#player").css("top"));
      if (top + 10 >= 434) {
        return;
      }
      $("#player").css("top", top + 10);
    }
    if (game.pressed[MAIN_KEYS.SHOT]) {
      shot();
      shotSound.play();
    }
  }

  function moveHelicopter() {
    positionX = parseInt($("#enemy-helicopter").css("left"));
    $("#enemy-helicopter").css("left", positionX - velocity);
    $("#enemy-helicopter").css("top", positionY);

    if (positionX <= 0) {
      positionY = parseInt(Math.random() * 334);
      $("#enemy-helicopter").css("left", 694);
      $("#enemy-helicopter").css("top", positionY);
    }
  }

  function moveTruck() {
    positionX = parseInt($("#enemy-truck").css("left"));
    $("#enemy-truck").css("left", positionX - 3);
    if (positionX <= 0) {
      $("#enemy-truck").css("left", 775);
    }
  }

  function moveFriend() {
    positionX = parseInt($("#friend").css("left"));
    $("#friend").css("left", positionX + 1);
    if (positionX > 906) {
      $("#friend").css("left", 0);
    }
  }

  function shot() {
    if (canShot == true) {
      canShot = false;
      topPlayer = parseInt($("#player").css("top"));
      positionX = parseInt($("#player").css("left"));
      shotX = positionX + 190;
      shotY = topPlayer + 37;
      $("#background-game").append("<div id='shot'></div>");
      $("#shot").css("top", shotY);
      $("#shot").css("left", shotX);
      var shotTime = window.setInterval(shotExec, 30);
    }

    function shotExec() {
      positionX = parseInt($("#shot").css("left"));
      $("#shot").css("left", positionX + 15);
      if (positionX > 900) {
        window.clearInterval(shotTime);
        shotTime = null;
        $("#shot").remove();
        canShot = true;
      }
    }
  }

  function collision() {
    var collisionHelicopter = $("#player").collision($("#enemy-helicopter"));
    var colisionPlayerTruck = $("#player").collision($("#enemy-truck"));
    var colisionShotHelicopter = $("#shot").collision($("#enemy-helicopter"));
    var colisionShotTruck = $("#shot").collision($("#enemy-truck"));
    var colisionPlayerFriend = $("#player").collision($("#friend"));
    var colisionTruckFriend = $("#enemy-truck").collision($("#friend"));

    if (collisionHelicopter.length > 0) {
      enemyHelicopterX = parseInt($("#enemy-helicopter").css("left"));
      enemyHelicopterY = parseInt($("#enemy-helicopter").css("top"));
      explosionHelicopter(enemyHelicopterX, enemyHelicopterY);
      positionY = parseInt(Math.random() * 334);
      $("#enemy-helicopter").css("left", 694);
      $("#enemy-helicopter").css("top", positionY);
      currentEnergy--;
    }

    if (colisionPlayerTruck.length > 0) {
      enemyTruckX = parseInt($("#enemy-truck").css("left"));
      enemyTruckY = parseInt($("#enemy-truck").css("top"));
      explosionTruck(enemyTruckX, enemyTruckY);
      $("#enemy-truck").remove();
      resetTruckPosition();
      currentEnergy--;
    }

    if (colisionShotHelicopter.length > 0) {
      enemyHelicopterX = parseInt($("#enemy-helicopter").css("left"));
      enemyHelicopterY = parseInt($("#enemy-helicopter").css("top"));
      explosionHelicopter(enemyHelicopterX, enemyHelicopterY);
      $("#shot").css("left", 950);
      positionY = parseInt(Math.random() * 334);
      $("#enemy-helicopter").css("left", 694);
      $("#enemy-helicopter").css("top", positionY);
      points += 100;
      velocity = velocity + 0.3;
    }

    if (colisionShotTruck.length > 0) {
      enemyTruckX = parseInt($("#enemy-truck").css("left"));
      enemyTruckY = parseInt($("#enemy-truck").css("top"));
      explosionTruck(enemyTruckX, enemyTruckY);
      $("#enemy-truck").remove();
      $("#shot").css("left", 950);
      resetTruckPosition();
      points += 50;
    }

    if (colisionPlayerFriend.length > 0) {
      resetFriendPosition();
      $("#friend").remove();
      saved++;
      rescueSound.play();
    }

    if (colisionTruckFriend.length > 0) {
      friendX = parseInt($("#friend").css("left"));
      friendY = parseInt($("#friend").css("top"));
      explosionFriend(friendX, friendY);
      $("#friend").remove();
      resetFriendPosition();
      lost++;
      lostSound.play();
    }
  }

  function explosionHelicopter(enemyHelicopterX, enemyHelicopterY) {
    $("#background-game").append("<div id='explosion-helicopter'></div>");
    $("#explosion-helicopter").css(
      "background-image",
      "url(imgs/explosion.png)"
    );
    var div = $("#explosion-helicopter");
    div.css("top", enemyHelicopterY);
    div.css("left", enemyHelicopterX);
    div.animate({ width: 200, opacity: 0 }, "slow");
    var explosionTime = window.setInterval(removeExplosion, 1000);
    function removeExplosion() {
      div.remove();
      window.clearInterval(explosionTime);
      explosionTime = null;
    }
    explosionSound.play();
  }

  function explosionTruck(enemyTruckX, enemyTruckY) {
    $("#background-game").append("<div id='explosion-truck'/>");
    $("#explosion-truck").css("background-image", "url(imgs/explosion.png)");
    var div2 = $("#explosion-truck");
    div2.css("top", enemyTruckY);
    div2.css("left", enemyTruckX);
    div2.animate({ width: 200, opacity: 0 }, "slow");
    var explosionTime = window.setInterval(removeExplosion, 1000);
    function removeExplosion() {
      div2.remove();
      window.clearInterval(explosionTime);
      explosionTime = null;
    }
    explosionSound.play();
  }

  function explosionFriend(friendX, friendY) {
    $("#background-game").append(
      "<div id='explosion-friend' class='animation-4'/>"
    );
    $("#explosion-friend").css("top", friendY);
    $("#explosion-friend").css("left", friendX);
    var timeExplosion = window.setInterval(resetInterval, 1000);
    function resetInterval() {
      $("#explosion-friend").remove();
      window.clearInterval(timeExplosion);
      timeExplosion = null;
    }
  }

  function resetTruckPosition() {
    var colisionTime = window.setInterval(resetInterval, 5000);
    function resetInterval() {
      window.clearInterval(colisionTime);
      colisionTime = null;
      if (endGame == false) {
        $("#background-game").append("<div id=enemy-truck/>");
      }
    }
  }

  function resetFriendPosition() {
    var friendTime = window.setInterval(resetInterval, 6000);
    function resetInterval() {
      window.clearInterval(friendTime);
      friendTime = null;
      if (endGame == false) {
        $("#background-game").append("<div id='friend' class='animation-3'/>");
      }
    }
  }

  function score() {
    $("#game-score").html(
      "<h2> Points: " +
        points +
        " Rescued: " +
        saved +
        " Lost: " +
        lost +
        "</h2>"
    );
  }

  function energy() {
    if (currentEnergy == 3) {
      $("#energy").css("background-image", "url(imgs/energy-3.png)");
    }

    if (currentEnergy == 2) {
      $("#energy").css("background-image", "url(imgs/energy-2.png)");
    }

    if (currentEnergy == 1) {
      $("#energy").css("background-image", "url(imgs/energy-1.png)");
    }

    if (currentEnergy == 0) {
      $("#energy").css("background-image", "url(imgs/energy-0.png)");
      gameOver();
    }
  }

  function gameOver() {
    endGame = true;
    music.pause();
    gameOverSound.play();

    window.clearInterval(game.timer);
    game.timer = null;

    $("#player").remove();
    $("#enemy-helicopter").remove();
    $("#enemy-truck").remove();
    $("#friend").remove();

    $("#background-game").append("<div id='end'/>");

    $("#end").html(
      "<h1> Game Over </h1><p>Your score is: " +
        points +
        "</p>" +
        "<div id='restart' onClick=restartGame()><h3>Play Again</h3></div>"
    );
  }
}

function restartGame() {
  gameOverSound.pause();
  $("#end").remove();
  start();
}
