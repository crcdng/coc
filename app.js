/* global Phaser */

const fightScreen = {
  // each time we add or play a different animation we must load the texture first
  // this is not efficient
  // normally you would use one spritesheet with a known number of frames per animation or a texture atlas
  // here we use one spritesheet file per animation as we don't know in advance how many frames each animation has
  // and we don't use an texture atlas
  addAnimation: function (sprite, animationId, frames = null, fps = 0, loop = false) {
    sprite.loadTexture(animationId);
    return sprite.animations.add(animationId, frames, fps, loop);
  },

  create: function () {
    const addAnimations = (sprite, id) => {
      const idle = this.addAnimation(sprite, `${id}_idle`, null, 0, true);
      idle.speed = idle.frameTotal * 1.66; // idle should take 600ms
      this.addAnimation(sprite, `${id}_walk`, null, 10, true);
      const action1 = this.addAnimation(sprite, `${id}_attack`, null, 0, false);
      action1.speed = action1.frameTotal * 3; // attack should take 333ms
      action1.onComplete.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      const action2 = this.addAnimation(sprite, `${id}_defense`, null, 0, false);
      action2.speed = action2.frameTotal * 2; // defense should take 500ms
      action2.onComplete.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      const special = this.addAnimation(sprite, `${id}_special`, null, 0, false);
      special.speed = special.frameTotal * 2.2; // special move should take 450ms
      special.onComplete.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      const gothit = this.addAnimation(sprite, `${id}_gothit`, null, 0, false);
      gothit.speed = gothit.frameTotal * 1.66; // gothit should take 600ms
      gothit.onComplete.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      const win = this.addAnimation(sprite, `${id}_win`, null, 0, true); // win should take 1s
      win.speed = win.frameTotal * 1; // idle should take 1s
      const lose = this.addAnimation(sprite, `${id}_lose`, null, 0, true); // win should take 1s
      lose.speed = lose.frameTotal * 1.2; // idle should take a bit longer than win
    };

    const addSounds = (player, id) => {
      for (const sound of this.options.sounds) {
        player.sounds[sound] = game.add.sound(`${id}_${sound}`);
      }
    };

    const createPlayer = (id, name, health, spriteName, posX, posY, leftKey, rightKey, action1Key, action2Key, specialKey) => {
      return {
        id: id,
        name: name,
        health: 100,
        isHitting: false,
        sounds: {},
        sprite: game.add.sprite(posX, posY, spriteName),
        leftKey: game.input.keyboard.addKey(leftKey),
        rightKey: game.input.keyboard.addKey(rightKey),
        action1Key: game.input.keyboard.addKey(action1Key),
        action2Key: game.input.keyboard.addKey(action2Key),
        specialKey: game.input.keyboard.addKey(specialKey)
      };
    };

    const initializeHealthBar = (x, y, length, height, bgColor) => {
      const background = game.add.graphics();
      background.beginFill(bgColor);
      background.drawRect(0, 0, length, height);
      background.endFill();
      background.x = x;
      background.y = y;
      const bar = game.add.graphics();
      bar.x = x;
      bar.y = y;
      return bar;
    };

    const initializePlayer = (player, isLeftPlayer, bodyWidth, bodyHeight, bodyOffsetX, bodyOffsetY) => {
      player.sprite.scale.set(1);
      if (isLeftPlayer === false) { player.sprite.scale.x = -player.sprite.scale.x; }
      addAnimations(player.sprite, player.id);
      addSounds(player, player.id);
      // sprite body needs to be set before playing the first animation
      game.physics.enable(player.sprite, Phaser.Physics.ARCADE);
      player.sprite.body.immovable = true;
      player.sprite.body.collideWorldBounds = true;
      player.sprite.body.setSize(bodyWidth, bodyHeight, bodyOffsetX, bodyOffsetY);
      this.playAnimation(player.sprite, `${player.id}_idle`);
    };

    const mapInputToActions = (player, sprite, id) => {
      player.leftKey.onDown.add(() => { this.playAnimation(sprite, `${id}_walk`); });
      player.leftKey.onUp.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      player.rightKey.onDown.add(() => { this.playAnimation(sprite, `${id}_walk`); });
      player.rightKey.onUp.add(() => { this.playAnimation(sprite, `${id}_idle`); });
      player.action1Key.onUp.add(() => {
        const actionId = `${id}_attack`;
        this.playSound(player, actionId);
        this.playAnimation(sprite, actionId);
      });
      player.action2Key.onUp.add(() => {
        const actionId = `${id}_defense`;
        this.playSound(player, actionId);
        this.playAnimation(sprite, actionId);
      });
      player.specialKey.onUp.add(() => {
        const actionId = `${id}_special`;
        this.playSound(player, actionId);
        this.playAnimation(sprite, actionId);
      });
    };

    game.add.image(0, 0, this.background);
    // the sprite created is on the idle animation tileset
    this.player1 = createPlayer(this.player1Id,
      game.cache.getText(`${this.player1Id}_name`),
      100,
      `${this.player1Id}_idle`,
      game.world.width / 12,
      game.world.height / 2,
      this.options.player1.keys.left,
      this.options.player1.keys.right,
      this.options.player1.keys.action1,
      this.options.player1.keys.action2,
      this.options.player1.keys.special
    );
    initializePlayer(this.player1, true, 154, 256, 44, 0);
    mapInputToActions(this.player1, this.player1.sprite, this.player1.id);
    this.player2 = createPlayer(
      this.player2Id,
      game.cache.getText(`${this.player2Id}_name`),
      100,
      `${this.player2Id}_idle`,
      11 * game.world.width / 12,
      game.world.height / 2,
      this.options.player2.keys.left,
      this.options.player2.keys.right,
      this.options.player2.keys.action1,
      this.options.player2.keys.action2,
      this.options.player2.keys.special
    );
    initializePlayer(this.player2, false, 154, 256, 44, 0);
    mapInputToActions(this.player2, this.player2.sprite, this.player2.id);
    this.healthBar1 = initializeHealthBar(game.world.width / 8, game.world.height / 6, 200, 20, 0xFF3300);
    this.healthBar2 = initializeHealthBar(5 * game.world.width / 8, game.world.height / 6, 200, 20, 0xFF3300);

    //  Stop the following keys from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.KeyCode.SPACEBAR ]);
  },

  hit: function (hitter, hitterMove, target, targetMove, deduction) {
    hitterMove.onComplete.add(() => { hitter.isHitting = false; });
    hitter.isHitting = true;
    this.playSound(target, targetMove); // this is `${target.id}_gothit`
    this.playAnimation(target.sprite, targetMove, 0, true);
    target.health = target.health - deduction;
    console.log(`${hitter.name} hit ${target.name} with ${hitterMove.name}`);
    console.log(`${target.name} health: ${target.health}`);
    if (target.health <= 0) { this.win(hitter, target); }
  },

  init: function (options, fighters, selected) {
    this.options = options;
    this.fighters = fighters;
    this.player1Id = selected.player1;
    this.player2Id = selected.player2;
    this.background = selected.background;
  },

  // arguments: player1.sprite, player2.sprite
  onOverlap: function (sprite1, sprite2) {
    const anim1 = sprite1.animations.currentAnim;
    const anim2 = sprite2.animations.currentAnim;
    const frame1 = anim1.currentFrame.index;
    const frame2 = anim2.currentFrame.index;

    // a hit gets through if:
    // - they overlap
    // - the player is not already hitting
    // - the opponent is not defending
    if (this.player1.isHitting !== true && anim2.name !== `${this.player2.id}_defense`) {
      if (anim1.name === `${this.player1.id}_attack` && frame1 === anim1.frameTotal - 1) {
        this.hit(this.player1, anim1, this.player2, `${this.player2.id}_gothit`, 3);
      } else if (anim1.name === `${this.player1.id}_special` && frame1 === anim1.frameTotal - 1) {
        this.hit(this.player1, anim1, this.player2, `${this.player2.id}_gothit`, 10);
      }
    }

    if (this.player2.isHitting !== true && anim1.name !== `${this.player1.id}_defense`) {
      if (anim2.name === `${this.player2.id}_attack` && frame2 === anim2.frameTotal - 1) {
        this.hit(this.player2, anim2, this.player1, `${this.player1.id}_gothit`, 3);
      } else if (anim2.name === `${this.player2.id}_special` && frame2 === anim2.frameTotal - 1) {
        this.hit(this.player2, anim2, this.player1, `${this.player1.id}_gothit`, 10);
      }
    }
  },

  playAnimation: function (sprite, key, frame = 0, interrupt = false) {
    // move attack overlap areas during attack
    const animationType = this.getTypeFromKey(key);
    if (animationType === 'attack') {
      sprite.body.offset.x = 100;
    } else if (animationType === 'special') {
      sprite.body.offset.x = 112;
    } else {
      sprite.body.offset.x = 44;
    }
    sprite.loadTexture(key, frame, interrupt);
    sprite.animations.play(key);
  },

  playSound: function (player, key) {
    const soundType = this.getTypeFromKey(key);
    if (game.cache.checkSoundKey(key) === true) { player.sounds[soundType].play(); }
  },

  render: function () {
    // collision rectangles
    if (this.options.debug === true) {
      game.debug.body(this.player1.sprite);
      game.debug.body(this.player2.sprite);
    }
  },

  update: function () {
    const updateHealthBar = (bar, x, y, length, height, color) => {
      bar.clear(); // stretched image would be more efficient
      bar.beginFill(color);
      bar.drawRect(x, y, length, height);
      bar.endFill();
    };
    game.physics.arcade.overlap(this.player1.sprite, this.player2.sprite, this.onOverlap, null, this);
    updateHealthBar(this.healthBar1, 0, 0,
      this.player1.health >= 0 ? this.player1.health * 2 : 0, 20, 0x33FF00);
    updateHealthBar(this.healthBar2,
      this.player2.health >= 0 ? 200 - this.player2.health * 2 : 0, 0, this.player2.health >= 0 ? this.player2.health * 2 : 0, 20, 0x33FF00);
    if (this.player1.leftKey.isDown) { this.player1.sprite.x--; } else if (this.player1.rightKey.isDown) { this.player1.sprite.x++; }
    if (this.player2.leftKey.isDown) { this.player2.sprite.x--; } else if (this.player2.rightKey.isDown) { this.player2.sprite.x++; }
  },

  win: function (winner, loser) {
    game.input.keyboard.stop();
    winner.sprite.animations.currentAnim.stop();
    loser.sprite.animations.currentAnim.stop();
    this.playAnimation(winner.sprite, `${winner.id}_win`, 0, true);
    this.playAnimation(loser.sprite, `${loser.id}_lose`, 0, true);
    this.playSound(winner, `${winner.id}_win`);
    this.playSound(loser, `${loser.id}_lose`);
    game.time.events.add(Phaser.Timer.SECOND * 6,
      () => { game.state.start('gameover', true, false, this.options, this.fighters, winner); }
    );
  }
};

const gameOverScreen = {
  create: function () {
    game.stage.backgroundColor = 0x000000;
    this.displayText(game.world.width / 2, game.world.height / 2, `${this.winner.name} wins`, 32);
    this.displayText(game.world.width / 2, game.world.height / 1.5, 'press any key to play again', 24);
    game.input.keyboard.start(); // start() explicitely after stop() in last state
    game.input.keyboard.onUpCallback = () => {
      game.input.keyboard.onUpCallback = null;
      game.state.start('select', true, false, this.options, this.fighters);
    };
  },

  init: function (options, fighters, winner) {
    this.options = options;
    this.fighters = fighters;
    this.winner = winner;
  }
};

const loadScreen = {
  init (options) {
    this.options = options;
    this.maxFighters = this.options.maxFighters;
    this.animations = this.options.animations;
    this.sounds = this.options.sounds;
  },

  preload: function () {
    const constructFighterId = (index) => {
      return `fighter${index < 10 ? '0' + index : index}`;
    };

    const getFighterFromId = (descriptor) => {
      const arr = descriptor.split('_');
      return arr[0];
    };

    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    this.displayText(game.world.width / 2, game.world.height / 2, 'Conflict of Character', 72);
    this.loadText = this.displayText(game.world.width / 2, game.world.height / 1.2, 'loading...', 42);
    game.load.onLoadComplete.add(() => {
      game.input.keyboard.onDownCallback = () => {
        game.input.keyboard.onDownCallback = null;
        game.state.start('select', true, false, this.options, this.fighters);
      };
      this.loadText.setText('press any key to continue');
    });

    this.fighters = [];

    // when a portrait file has been sucessfully loaded, load the other corresponding files
    game.load.onFileComplete.add((progress, key, success, totalloadedfiles, totalfiles) => {
      if (success === true && this.getTypeFromKey(key) === 'portrait') {
        let fighterId = getFighterFromId(key);
        let path = `assets/${fighterId}`;
        for (const anim of this.animations) {
          game.load.spritesheet(`${fighterId}_${anim}`, `${path}/${anim}.png`, 256, 256);
        }
        for (const sound of this.sounds) {
          game.load.audio(`${fighterId}_${sound}`, `${path}/${sound}.mp3`);
        }
        game.load.text(`${fighterId}_name`, `${path}/name.txt`);
        game.load.image(`${fighterId}_background`, `${path}/background.png`);
        this.fighters.push(fighterId);
      }
    });

    // load the portrait file
    for (let n = 0; n < this.maxFighters; n++) {
      let fighterId = constructFighterId(n + 1);
      let path = `assets/${fighterId}`;
      game.load.image(`${fighterId}_portrait`, `${path}/portrait.png`);
    }
  },

  update: function () {
    if (this.options.debug) { game.state.start('select', true, false, this.options, this.fighters); }
  }
};

const readyScreen = {
  create: function () {
    game.stage.backgroundColor = 0x808080;

    this.displayText(game.world.width / 2, game.world.height / 12, `Get Ready`, 32);
    this.displayText(game.world.width / 2, 2 * game.world.height / 12, 'press any key to continue', 24);

    this.displayText(game.world.width / 5, game.world.height / 2.75, game.cache.getText(`${this.selected.player1}_name`).trim().substr(0, 16), 32);
    this.displayText(4 * game.world.width / 5, game.world.height / 2.75, game.cache.getText(`${this.selected.player2}_name`).trim().substr(0, 16), 32);

    game.add.sprite(game.world.width / 12, game.world.height / 2.5, `${this.selected.player1}_portrait`);
    let rightPlayer = game.add.sprite(11 * game.world.width / 12, game.world.height / 2.5, `${this.selected.player2}_portrait`);
    rightPlayer.scale.x = -rightPlayer.scale.x;

    this.displayText(game.world.width / 2, game.world.height / 1.5, 'vs.', 96);

    const instructionsLeftText = `
    ${String.fromCharCode(this.options.player1.keys.action1)}: attack
    ${String.fromCharCode(this.options.player1.keys.left)}: left
    ${String.fromCharCode(this.options.player1.keys.action2)}: defend
    ${String.fromCharCode(this.options.player1.keys.right)}: right
    ${String.fromCharCode(this.options.player1.keys.special)}: special
    `;

    const instructionsLeft = this.displayText(game.world.width / 12, game.world.height / 6, instructionsLeftText, 19);
    instructionsLeft.align = 'left';

    const instructionsRightText = `
    attack: ${String.fromCharCode(this.options.player2.keys.action1)}
    left: ${String.fromCharCode(this.options.player2.keys.left)}
    defend: ${String.fromCharCode(this.options.player2.keys.action2)}
    right: ${String.fromCharCode(this.options.player2.keys.right)}
    special: ${String.fromCharCode(this.options.player2.keys.special)}
    `;

    const instructionsRight = this.displayText(10.65 * game.world.width / 12, game.world.height / 6, instructionsRightText, 19);
    instructionsRight.align = 'right';

    game.input.keyboard.onUpCallback = () => {
      game.input.keyboard.onUpCallback = null;
      game.state.start('fight', true, false, this.options, this.fighters, this.selected);
    };
  },

  init: function (options, fighters, selected) {
    this.options = options;
    this.fighters = fighters;
    this.selected = selected;
  },

  update: function () {
    if (this.options.debug) { game.state.start('fight', true, false, this.options, this.fighters, this.selected); }
  }

};

const selectScreen = {
  create: function () {
    this.backgrounds = [];
    this.currentCell = 0;

    let leftKeyCode, rightKeyCode, upKeyCode, downKeyCode;
    switch (this.selection) {
      case 'player1':
      case 'player2':
        leftKeyCode = this.options[this.selection].keys.left;
        rightKeyCode = this.options[this.selection].keys.right;
        upKeyCode = this.options[this.selection].keys.action1;
        downKeyCode = this.options[this.selection].keys.action2;
        break;
      case 'background':
        leftKeyCode = this.options['player1'].keys.left;
        rightKeyCode = this.options['player1'].keys.right;
        upKeyCode = this.options['player1'].keys.action1;
        downKeyCode = this.options['player1'].keys.action2;
        break;
    }

    let selectionText, rectangleColor;
    switch (this.selection) {
      case 'player1':
        selectionText = 'Player 1';
        rectangleColor = 0x00fff0;
        break;
      case 'player2':
        selectionText = 'Player 2';
        rectangleColor = 0xff00ff;
        break;
      case 'background':
        selectionText = 'a Background';
        rectangleColor = 0x00ff00;
        break;
    }

    this.displayText(game.world.width / 2, game.world.height / 12, `Select ${selectionText}`, 32);
    const instructionText = `${String.fromCharCode(upKeyCode)}, ${String.fromCharCode(leftKeyCode)}, ${String.fromCharCode(downKeyCode)}, ${String.fromCharCode(rightKeyCode)} to select, Enter to continue`;
    this.displayText(game.world.width / 2, 2 * game.world.height / 12, instructionText, 22);

    let rectangleHeight, rectangleWidth;
    switch (this.selection) {
      case 'player1':
      case 'player2':
        rectangleHeight = 110;
        rectangleWidth = 64;
        this.columns = 12;
        this.rows = 4;
        this.topLeftX = 16;
        this.topLeftY = 128;
        this.cellHeight = 110;
        this.cellWidth = 64;
        break;
      case 'background':
        rectangleHeight = 54;
        rectangleWidth = 120;
        this.columns = 6;
        this.rows = 8;
        this.topLeftX = 20;
        this.topLeftY = 128;
        this.cellHeight = 54;
        this.cellWidth = 120;
        break;
    }

    game.stage.backgroundColor = 0x404040;
    for (let n = 0, b = 0; n < this.fighters.length; n++) {
      switch (this.selection) {
        case 'player1':
        case 'player2':
          const x = this.topLeftX + (n * this.cellWidth) % (this.cellWidth * this.columns);
          const y = this.topLeftY + Math.floor(n / this.columns) * this.cellHeight;
          const portrait = game.add.image(x, y, `${this.fighters[n]}_portrait`);
          portrait.width = 60;
          portrait.height = 80;
          let name = this.displayText(x + 4, y + portrait.height + 12, game.cache.getText(`${this.fighters[n]}_name`).trim().substr(0, 10), 12);
          name.anchor.set(0);
          break;
        case 'background':
          // backgrounds are optional, therefore check if the key exists in the cache
          const backgroundKey = `${this.fighters[n]}_background`;
          if (game.cache.checkImageKey(backgroundKey)) {
            const background = game.add.image(0, 0, backgroundKey);
            background.width = 72;
            background.height = 54;
            background.x = this.topLeftX + (this.cellWidth - background.width) / 2 + (b * this.cellWidth) % (this.cellWidth * this.columns);
            background.y = this.topLeftY + Math.floor(b / this.columns) * this.cellHeight;
            this.backgrounds.push(backgroundKey);
            b = b + 1;
          }
          break;
      }
    }

    this.rectangle = game.add.graphics();
    this.rectangle.lineStyle(6, rectangleColor, 1);
    this.rectangle.drawRect(0, 0, rectangleWidth, rectangleHeight);

    const leftKey = game.input.keyboard.addKey(leftKeyCode);
    const rightKey = game.input.keyboard.addKey(rightKeyCode);
    const upKey = game.input.keyboard.addKey(upKeyCode);
    const downKey = game.input.keyboard.addKey(downKeyCode);

    let maxSelection;
    switch (this.selection) {
      case 'player1':
      case 'player2':
        maxSelection = this.fighters.length;
        break;
      case 'background':
        maxSelection = this.backgrounds.length;
        break;
    }

    upKey.onUp.add(() => {
      if (this.currentCell < this.columns) {
        this.currentCell = (this.columns * this.rows) - (this.columns - this.currentCell);
      } else {
        this.currentCell = this.currentCell - this.columns;
      }
      while (this.currentCell >= maxSelection) {
        this.currentCell = this.currentCell - this.columns;
      }
    });
    leftKey.onUp.add(() => {
      this.currentCell = this.currentCell - 1;
      if (this.currentCell < 0) { this.currentCell = maxSelection - 1; }
    });
    downKey.onUp.add(() => {
      this.currentCell = (this.currentCell + this.columns) % (this.columns * this.rows);
      if (this.currentCell >= maxSelection) {
        this.currentCell = this.currentCell % this.columns;
      }
    });
    rightKey.onUp.add(() => {
      this.currentCell = (this.currentCell + 1) % maxSelection;
    });

    const enter = game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
    enter.onUp.add(() => {
      console.log(this.currentCell);
      switch (this.selection) {
        case 'player1':
        case 'player2':
          this.selected[this.selection] = this.fighters[this.currentCell];
          break;
        case 'background':
          this.selected[this.selection] = this.backgrounds[this.currentCell];
          break;
      }
      this.switchState();
    });
  },

  init: function (options, fighters, selection = 'player1', selected = { player1: null, player2: null, background: null }) {
    this.options = options;
    this.fighters = fighters;
    this.selection = selection;
    this.selected = selected;
  },

  switchState () {
    if (this.selection === 'player1') {
      game.state.start('select', true, false, this.options, this.fighters, 'player2', this.selected);
    } else if (this.selection === 'player2') {
      game.state.start('select', true, false, this.options, this.fighters, 'background', this.selected);
    } else if (this.selection === 'background') {
      game.state.start('ready', true, false, this.options, this.fighters, this.selected);
    }
  },

  update: function () {
    this.rectangle.x = (this.topLeftX + this.currentCell * this.cellWidth) % (this.cellWidth * this.columns);
    this.rectangle.y = (this.topLeftY + (Math.floor(this.currentCell / this.columns) * this.cellHeight) % (this.cellHeight * this.rows));
    if (this.options.debug) {
      this.selected.player1 = this.fighters[0];
      this.selected.player2 = this.fighters[1];
      this.selected.background = this.backgrounds[0];
      this.switchState();
    }
  }
};

const mixinDisplayText = {
  displayText: function (x, y, text, size = 16, color = '#eeeeee') {
    const gameText = game.add.text(x, y, text);
    gameText.anchor.set(0.5);
    gameText.align = 'center';
    gameText.fontSize = size;
    gameText.fontWeight = 'bold';
    gameText.fill = color; // only takes color strings
    gameText.resolution = 2;
    return gameText;
  }
};

const mixinGetTypeFromKey = {
  getTypeFromKey: function (key) {
    const arr = key.split('_');
    return arr[1];
  }
};

const options = {
  animations: ['idle', 'walk', 'attack', 'defense', 'special', 'gothit', 'win', 'lose'],
  debug: false,
  maxFighters: 48,
  player1: { keys: { left: Phaser.KeyCode.A, right: Phaser.KeyCode.D, action1: Phaser.KeyCode.W, action2: Phaser.KeyCode.S, special: Phaser.KeyCode.C } },
  player2: { keys: { left: Phaser.KeyCode.J, right: Phaser.KeyCode.L, action1: Phaser.KeyCode.I, action2: Phaser.KeyCode.K, special: Phaser.KeyCode.N } },
  sounds: ['attack', 'defense', 'special', 'gothit', 'win', 'lose']
};

Object.assign(loadScreen, mixinDisplayText, mixinGetTypeFromKey);
Object.assign(selectScreen, mixinDisplayText);
Object.assign(readyScreen, mixinDisplayText);
Object.assign(fightScreen, mixinGetTypeFromKey);
Object.assign(gameOverScreen, mixinDisplayText);

const game = new Phaser.Game(800, 600);
game.state.add('load', loadScreen);
game.state.add('select', selectScreen);
game.state.add('ready', readyScreen);
game.state.add('fight', fightScreen);
game.state.add('gameover', gameOverScreen);
game.state.start('load', true, false, options);
