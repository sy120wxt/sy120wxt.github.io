require = function() {
  function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = "function" == typeof require && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n || e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = "function" == typeof require && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  }
  return e;
}()({
  GAME: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "719d8UXjBZMj6Nk+urktQey", "GAME");
    "use strict";
    var GAME_STATE = cc.Enum({
      PREPARE: -1,
      PLAY: -1,
      DEAD: -1,
      WIN: -1
    });
    var TOUCH_STATE = cc.Enum({
      BLANK: -1,
      FLAG: -1
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        tilesLayout: cc.Node,
        tile: cc.Prefab,
        btnShow: cc.Node,
        tiles: [],
        picPrepare: cc.SpriteFrame,
        picPlay: cc.SpriteFrame,
        picDead: cc.SpriteFrame,
        picWin: cc.SpriteFrame,
        gameState: {
          default: GAME_STATE.PREPARE,
          type: GAME_STATE
        },
        touchState: {
          default: TOUCH_STATE.BLANK,
          type: TOUCH_STATE
        },
        row: 0,
        col: 0,
        bombNum: 0,
        Score: cc.Node,
        Time: cc.Node
      },
      onLoad: function onLoad() {
        this.Tile = require("Tile");
        this.roundClear = false;
        this.alreadyStarted = false;
        var self = this;
        for (var y = 0; y < this.row; y++) for (var x = 0; x < this.col; x++) {
          var tile = cc.instantiate(this.tile);
          tile.tag = y * this.col + x;
          tile.on(cc.Node.EventType.MOUSE_DOWN, function(event) {
            event.getButton() === cc.Event.EventMouse.BUTTON_LEFT && cc.Event.EventMouse.BUTTON_RIGHT && (self.roundClear = self.openNum(this));
          });
          tile.on(cc.Node.EventType.MOUSE_UP, function(event) {
            event.getButton() === cc.Event.EventMouse.BUTTON_LEFT ? self.touchState = TOUCH_STATE.BLANK : event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT && (self.touchState = TOUCH_STATE.FLAG);
            self.stopWatch(GAME_STATE.PLAY);
            self.onTouchTile(this);
          });
          this.tilesLayout.addChild(tile);
          this.tiles.push(tile);
        }
        this.newGame();
        this.btnShow.on(cc.Node.EventType.MOUSE_UP, function(event) {
          self.onBtnShow();
        });
      },
      newGame: function newGame() {
        for (var _n = 0; _n < this.tiles.length; _n++) {
          this.tiles[_n].getComponent("Tile").type = this.Tile.TYPE.ZERO;
          this.tiles[_n].getComponent("Tile").state = this.Tile.STATE.NONE;
        }
        this.restBmob = this.bombNum;
        this.Score.getComponent(cc.Label).string = this.restBmob;
        this.time = 0;
        this.Time.getComponent(cc.Label).string = this.time;
        var tilesIndex = [];
        for (var i = 0; i < this.tiles.length; i++) tilesIndex[i] = i;
        for (var j = 0; j < this.bombNum; j++) {
          var n = Math.floor(Math.random() * tilesIndex.length);
          this.tiles[tilesIndex[n]].getComponent("Tile").type = this.Tile.TYPE.BOMB;
          tilesIndex.splice(n, 1);
        }
        for (var k = 0; k < this.tiles.length; k++) {
          var tempBomb = 0;
          if (this.tiles[k].getComponent("Tile").type == this.Tile.TYPE.ZERO) {
            var roundTiles = this.tileRound(k);
            for (var m = 0; m < roundTiles.length; m++) roundTiles[m].getComponent("Tile").type == this.Tile.TYPE.BOMB && tempBomb++;
            this.tiles[k].getComponent("Tile").type = tempBomb;
          }
        }
        this.gameState = GAME_STATE.PLAY;
        this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picPlay;
      },
      tileRound: function tileRound(i) {
        var roundTiles = [];
        i % this.col > 0 && roundTiles.push(this.tiles[i - 1]);
        i % this.col > 0 && Math.floor(i / this.col) > 0 && roundTiles.push(this.tiles[i - this.col - 1]);
        i % this.col > 0 && Math.floor(i / this.col) < this.row - 1 && roundTiles.push(this.tiles[i + this.col - 1]);
        Math.floor(i / this.col) > 0 && roundTiles.push(this.tiles[i - this.col]);
        Math.floor(i / this.col) < this.row - 1 && roundTiles.push(this.tiles[i + this.col]);
        i % this.col < this.col - 1 && roundTiles.push(this.tiles[i + 1]);
        i % this.col < this.col - 1 && Math.floor(i / this.col) > 0 && roundTiles.push(this.tiles[i - this.col + 1]);
        i % this.col < this.col - 1 && Math.floor(i / this.col) < this.row - 1 && roundTiles.push(this.tiles[i + this.col + 1]);
        return roundTiles;
      },
      onTouchTile: function onTouchTile(touchTile) {
        if (this.gameState != GAME_STATE.PLAY) return;
        switch (this.touchState) {
         case TOUCH_STATE.BLANK:
          if (9 === touchTile.getComponent("Tile").type) {
            touchTile.getComponent("Tile").state = this.Tile.STATE.CLIKED;
            this.gameOver();
            return;
          }
          if (touchTile.getComponent("Tile").state === this.Tile.STATE.CLIKED) {
            console.log(this.roundClear);
            if (false === this.roundClear) {
              var roundTiles = this.tileRound(touchTile.tag);
              for (var _i = 0; _i < roundTiles.length; _i++) roundTiles[_i].getComponent("Tile").state === this.Tile.STATE.PRESS && (roundTiles[_i].getComponent("Tile").state = this.Tile.STATE.NONE);
            }
            if (true === this.roundClear) {
              console.log("touchTile.Cliked");
              var selfType = touchTile.getComponent("Tile").type;
              var _roundTiles = this.tileRound(touchTile.tag);
              console.log("selfType" + selfType);
              var roundNone = [];
              for (var _i2 = 0; _i2 < _roundTiles.length; _i2++) _roundTiles[_i2].getComponent("Tile").state === this.Tile.STATE.FLAG ? selfType-- : roundNone.push(_roundTiles[_i2]);
              var roundBlank = [];
              console.log("selfType" + selfType);
              if (0 == selfType) {
                console.log("rest = 0");
                var touchBmob = false;
                while (roundNone.length) {
                  console.log("enter loop");
                  var tileNone = roundNone.pop();
                  tileNone.getComponent("Tile").state = this.Tile.STATE.CLIKED;
                  tileNone.getComponent("Tile").type === this.Tile.TYPE.BOMB && (touchBmob = true);
                  if (tileNone.getComponent("Tile").type === this.Tile.TYPE.ZERO) {
                    roundBlank = this.tileRound(tileNone.tag);
                    for (var _i3 = 0; _i3 < roundBlank.length; _i3++) if (roundBlank[_i3].getComponent("Tile").state === this.Tile.STATE.NONE && roundBlank[_i3].getComponent("Tile").type === this.Tile.TYPE.ZERO) {
                      roundNone.push(roundBlank[_i3]);
                      roundBlank[_i3].getComponent("Tile").state = this.Tile.STATE.CLIKED;
                    } else roundBlank[_i3].getComponent("Tile").state = this.Tile.STATE.CLIKED;
                  }
                }
                touchBmob && this.gameOver();
              }
              if (0 != selfType) var _roundBlank = [];
            }
          }
          var testTiles = [];
          if (touchTile.getComponent("Tile").state === this.Tile.STATE.NONE) {
            console.log("touchTile.None");
            testTiles.push(touchTile);
            while (testTiles.length) {
              var testTile = testTiles.pop();
              if (0 === testTile.getComponent("Tile").type) {
                testTile.getComponent("Tile").state = this.Tile.STATE.CLIKED;
                var _roundTiles2 = this.tileRound(testTile.tag);
                for (var i = 0; i < _roundTiles2.length; i++) _roundTiles2[i].getComponent("Tile").state == this.Tile.STATE.NONE && testTiles.push(_roundTiles2[i]);
              } else testTile.getComponent("Tile").type > 0 && testTile.getComponent("Tile").type < 9 && (testTile.getComponent("Tile").state = this.Tile.STATE.CLIKED);
            }
            this.judgeWin();
          }
          break;

         case TOUCH_STATE.FLAG:
          if (touchTile.getComponent("Tile").state == this.Tile.STATE.NONE) {
            touchTile.getComponent("Tile").state = this.Tile.STATE.FLAG;
            this.restBmob--;
            this.Score.getComponent(cc.Label).string = this.restBmob;
          } else touchTile.getComponent("Tile").state == this.Tile.STATE.FLAG && (touchTile.getComponent("Tile").state = this.Tile.STATE.NONE);
        }
      },
      openNum: function openNum(tile) {
        if (this.gameState != GAME_STATE.PLAY) return;
        if (tile.getComponent("Tile").state === this.Tile.STATE.CLIKED) {
          var type = tile.getComponent("Tile").type;
          var round = [];
          round = this.tileRound(tile.tag);
          var roundPress = [];
          for (var i = 0; i < round.length; i++) round[i].getComponent("Tile").state === this.Tile.STATE.NONE ? round[i].getComponent("Tile").state = this.Tile.STATE.PRESS : round[i].getComponent("Tile").state === this.Tile.STATE.FLAG && type--;
          console.log(type);
          if (0 === type) return true;
          if (0 !== type) return false;
        }
      },
      judgeWin: function judgeWin() {
        var confNum = 0;
        for (var i = 0; i < this.tiles.length; i++) this.tiles[i].getComponent("Tile").state === this.Tile.STATE.CLIKED && confNum++;
        if (confNum === this.tiles.length - this.bombNum) {
          this.gameState = GAME_STATE.WIN;
          this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picWin;
        }
      },
      gameOver: function gameOver() {
        this.gameState = GAME_STATE.DEAD;
        this.btnShow.getComponent(cc.Sprite).spriteFrame = this.picDead;
        this.stopWatch(this.gameState);
      },
      onBtnShow: function onBtnShow() {
        this.gameState === GAME_STATE.PREPARE && this.newGame();
        this.gameState === GAME_STATE.DEAD && this.newGame();
        this.gameState === GAME_STATE.WIN && this.newGame();
      },
      stopWatch: function stopWatch(gameState) {
        this.timeup = function() {
          this.Time.getComponent(cc.Label).string++;
        };
        var self = this;
        if (gameState === GAME_STATE.PLAY && false === this.alreadyStarted) {
          this.alreadyStarted = true;
          this.Time.getComponent(cc.Label).schedule(function() {
            self.timeup();
          }, 1);
        }
        if (gameState === GAME_STATE.DEAD) {
          this.alreadyStarted = false;
          console.log("stop");
          this.Time.getComponent(cc.Label).unscheduleAllCallbacks();
        }
      }
    });
    cc._RF.pop();
  }, {
    Tile: "Tile"
  } ],
  Tile: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3120ap9E4RDZpWzNxVIqQX0", "Tile");
    "use strict";
    var TYPE = cc.Enum({
      ZERO: 0,
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
      SIX: 6,
      SEVEN: 7,
      EIGHT: 8,
      BOMB: 9
    });
    var STATE = cc.Enum({
      NONE: -1,
      CLIKED: -1,
      FLAG: -1,
      DOUBT: -1,
      PRESS: -1
    });
    module.exports = {
      STATE: STATE,
      TYPE: TYPE
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        picNone: cc.SpriteFrame,
        picFlag: cc.SpriteFrame,
        picDoubt: cc.SpriteFrame,
        picZero: cc.SpriteFrame,
        picOne: cc.SpriteFrame,
        picTwo: cc.SpriteFrame,
        picThree: cc.SpriteFrame,
        picFour: cc.SpriteFrame,
        picFive: cc.SpriteFrame,
        picSix: cc.SpriteFrame,
        picSeven: cc.SpriteFrame,
        picEight: cc.SpriteFrame,
        picBomb: cc.SpriteFrame,
        picPress: cc.SpriteFrame,
        _state: {
          default: STATE.NONE,
          type: STATE,
          visible: false
        },
        state: {
          get: function get() {
            return this._state;
          },
          set: function set(value) {
            if (value !== this._state) {
              this._state = value;
              switch (this._state) {
               case STATE.NONE:
                this.getComponent(cc.Sprite).spriteFrame = this.picNone;
                break;

               case STATE.CLIKED:
                this.showType();
                break;

               case STATE.FLAG:
                this.getComponent(cc.Sprite).spriteFrame = this.picFlag;
                break;

               case STATE.DOUBT:
                this.getComponent(cc.Sprite).spriteFrame = this.picDoubt;
                break;

               case STATE.PRESS:
                this.getComponent(cc.Sprite).spriteFrame = this.picPress;
              }
            }
          },
          type: STATE
        },
        type: {
          default: TYPE.ZERO,
          type: TYPE
        }
      },
      showType: function showType() {
        switch (this.type) {
         case TYPE.ZERO:
          this.getComponent(cc.Sprite).spriteFrame = this.picZero;
          break;

         case TYPE.ONE:
          this.getComponent(cc.Sprite).spriteFrame = this.picOne;
          break;

         case TYPE.TWO:
          this.getComponent(cc.Sprite).spriteFrame = this.picTwo;
          break;

         case TYPE.THREE:
          this.getComponent(cc.Sprite).spriteFrame = this.picThree;
          break;

         case TYPE.FOUR:
          this.getComponent(cc.Sprite).spriteFrame = this.picFour;
          break;

         case TYPE.FIVE:
          this.getComponent(cc.Sprite).spriteFrame = this.picFive;
          break;

         case TYPE.SIX:
          this.getComponent(cc.Sprite).spriteFrame = this.picSix;
          break;

         case TYPE.SEVEN:
          this.getComponent(cc.Sprite).spriteFrame = this.picSeven;
          break;

         case TYPE.EIGHT:
          this.getComponent(cc.Sprite).spriteFrame = this.picEight;
          break;

         case TYPE.BOMB:
          this.getComponent(cc.Sprite).spriteFrame = this.picBomb;
        }
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "GAME", "Tile" ]);
//# sourceMappingURL=project.dev.js.map