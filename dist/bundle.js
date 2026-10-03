/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/boot.js"
/*!*********************!*\
  !*** ./src/boot.js ***!
  \*********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * BootState
 * @module boot
 */

class BootState extends Phaser.State {
  preload() {
    this.game.load.image('loading', 'loading.png');
  }
  create() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.refresh();
    if (this.game.mulle.networkEnabled) {
      this.game.mulle.net.connect();

      // launch on connect
      this.game.mulle.net.socket.addEventListener('open', event => {
        if (this.game.state.current === 'boot') {
          this.game.state.start('load');
        }
      });

      // inform on connection close
      this.game.mulle.net.socket.addEventListener('close', event => {
        if (this.game.state.current === 'boot') {
          alert('Server ej tillgänglig, multiplayer avstängt.');
          this.game.state.start('load');
        } else {
          alert('Anslutningen till servern avbröts.');
        }
      });

      // update state
      this.game.state.onStateChange.add(s => {
        this.game.mulle.net.send({
          scene: s
        });
      });
    } else {
      this.game.state.start('load');
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BootState);

/***/ },

/***/ "./src/game.js"
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var boot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! boot */ "./src/boot.js");
/* harmony import */ var load__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! load */ "./src/load.js");
/* harmony import */ var util_network__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! util/network */ "./src/util/network.js");
/* harmony import */ var util_cursor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! util/cursor */ "./src/util/cursor.js");
/* harmony import */ var scenes_menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! scenes/menu */ "./src/scenes/menu.js");
/* harmony import */ var scenes_garage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! scenes/garage */ "./src/scenes/garage.js");
/* harmony import */ var scenes_junk__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! scenes/junk */ "./src/scenes/junk.js");
/* harmony import */ var scenes_yard__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! scenes/yard */ "./src/scenes/yard.js");
/* harmony import */ var scenes_album__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! scenes/album */ "./src/scenes/album.js");
/* harmony import */ var scenes_diploma__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! scenes/diploma */ "./src/scenes/diploma.js");
/* harmony import */ var scenes_world__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! scenes/world */ "./src/scenes/world.js");
/* harmony import */ var scenes_mission__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! scenes/mission */ "./src/scenes/mission.js");
/* harmony import */ var scenes_figgeferrum__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! scenes/figgeferrum */ "./src/scenes/figgeferrum.js");
/* harmony import */ var scenes_roaddog__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! scenes/roaddog */ "./src/scenes/roaddog.js");
/* harmony import */ var scenes_roadthing__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! scenes/roadthing */ "./src/scenes/roadthing.js");
/* harmony import */ var scenes_carshow__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! scenes/carshow */ "./src/scenes/carshow.js");
/* harmony import */ var scenes_sturestortand__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! scenes/sturestortand */ "./src/scenes/sturestortand.js");
/* harmony import */ var scenes_saftfabrik__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! scenes/saftfabrik */ "./src/scenes/saftfabrik.js");
/* harmony import */ var scenes_solhem__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! scenes/solhem */ "./src/scenes/solhem.js");
/* harmony import */ var scenes_dorisdigital__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! scenes/dorisdigital */ "./src/scenes/dorisdigital.js");
/* harmony import */ var scenes_viola__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! scenes/viola */ "./src/scenes/viola.js");
/* harmony import */ var objects_subtitle__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! objects/subtitle */ "./src/objects/subtitle.js");
/* harmony import */ var objects_audio__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! objects/audio */ "./src/objects/audio.js");
/* harmony import */ var struct_savedata__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! struct/savedata */ "./src/struct/savedata.js");
/* harmony import */ var _scenes_mudcar__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./scenes/mudcar */ "./src/scenes/mudcar.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./objects/DirectorHelper */ "./src/objects/DirectorHelper.js");
/* global Phaser */
/**
 * MulleGame module
 * @module game
 */























// var requireScenes = require.context('scenes', true, /\.js$/);
// requireScenes.keys().forEach(requireScenes);




// import PluginState from './scenes/plugin'
// import TreeCarState from './scenes/treecar'



// import * as MulleScenes from 'scenes/*';

var memberLookup = {};
var directorImageLookup = {};

/**
 * Main game object
 * @extends Phaser.Game
 * @property {self} MulleGame
 */
class MulleGame extends Phaser.Game {
  constructor() {
    super({
      width: 640,
      height: 480,
      // width: '80%',
      // height: '80%',

      type: Phaser.AUTO,
      parent: 'player',
      antialias: false
    });

    /**
     * Utility library
     * @property {MulleGame} game      Main game
     * @property {Object}    scenes    Scene lookups
     * @property {Object}    audio     Audio collections
     * @property {Object}    actors    Available actors
     * @property {function}  playAudio
     */
    this.mulle = {};
    this.mulle.game = this;
    this.mulle.debug = false;
    this.mulle.cheats = true;

    // Multiplayer is off for the boat game until the server is set up for it:
    // with this on, boot.js waits for a WebSocket and alerts on failure.
    this.mulle.networkEnabled = false;
    this.mulle.networkServer = 'mulle.datagutten.net:8765';
    this.mulle.networkDevServer = 'localhost:8765';
    this.mulle.defaultLanguage = 'english';
    // this.mulle.defaultLanguage = 'swedish';
    /**
     * Helper class for director assets
     * @type {DirectorHelper}
     */
    this.director = new _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_25__["default"](this);
    this.mulle.scenes = {
      '02': 'junk',
      '03': 'garage',
      '04': 'yard',
      '05': 'world',
      '06': 'album',
      '08': 'diploma',
      10: 'menu',
      66: 'plugin',
      // Mission movies (05.DXR DirResources) - boat game only
      70: 'mission70',
      71: 'mission71',
      76: 'mission76',
      77: 'mission77',
      78: 'mission78',
      79: 'mission79',
      80: 'mission80',
      81: 'mission81',
      83: 'mission83',
      84: 'mission84',
      85: 'mission85',
      86: 'mission86',
      87: 'mission87',
      88: 'mission88',
      // Non-conflicting car game scenes (character dialogue, etc.)
      89: 'viola',
      90: 'dorisdigital',
      91: 'luddelabb',
      92: 'figgeferrum',
      93: 'ocean',
      94: 'carshow'
    };
    this.mulle.states = {
      boot: boot__WEBPACK_IMPORTED_MODULE_0__["default"],
      load: load__WEBPACK_IMPORTED_MODULE_1__["default"],
      menu: scenes_menu__WEBPACK_IMPORTED_MODULE_4__["default"],
      // 10

      junk: scenes_junk__WEBPACK_IMPORTED_MODULE_6__["default"],
      // 02
      garage: scenes_garage__WEBPACK_IMPORTED_MODULE_5__["default"],
      // 03
      yard: scenes_yard__WEBPACK_IMPORTED_MODULE_7__["default"],
      // 04
      world: scenes_world__WEBPACK_IMPORTED_MODULE_10__["default"],
      // 05
      album: scenes_album__WEBPACK_IMPORTED_MODULE_8__["default"],
      // 06
      diploma: scenes_diploma__WEBPACK_IMPORTED_MODULE_9__["default"],
      // 08

      //plugin: PluginState, // 66

      mission70: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission71: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission76: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission77: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission78: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission79: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission80: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission81: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission83: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission84: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission85: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission86: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission87: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      mission88: scenes_mission__WEBPACK_IMPORTED_MODULE_11__["default"],
      viola: scenes_viola__WEBPACK_IMPORTED_MODULE_20__["default"],
      // 89
      dorisdigital: scenes_dorisdigital__WEBPACK_IMPORTED_MODULE_19__["default"],
      // 90
      figgeferrum: scenes_figgeferrum__WEBPACK_IMPORTED_MODULE_12__["default"],
      // 92

      carshow: scenes_carshow__WEBPACK_IMPORTED_MODULE_15__["default"] // 94
    };
    this.mulle.audio = {};
    this.mulle.subtitle = new objects_subtitle__WEBPACK_IMPORTED_MODULE_21__["default"](this);
    this.mulle.actors = {};

    /**
     * Play audio by member name
     * @param  {string} id
     * @param {function} onStop
     * @return {Phaser.Sound} sound object
     */
    this.mulle.playAudio = function (id, onStop = null) {
      for (const a in this.game.mulle.audio) {
        var p = this.game.mulle.audio[a];
        for (var s in p.sounds) {
          if (p.sounds[s].extraData && id.toLowerCase() === p.sounds[s].extraData.dirName.toLowerCase()) {
            var snd = p.play(s);
            if (snd && onStop) {
              snd.onStop.addOnce(onStop);
            }
            return snd;
          }
        }
      }
      console.error('sound not found', id, this.game.mulle.audio);
      return false;
    };
    this.mulle.addAudio = function (key) {
      if (this.game.mulle.audio[key]) return;
      this.game.mulle.audio[key] = new objects_audio__WEBPACK_IMPORTED_MODULE_22__["default"](this.game, key + '-audio');
      for (var id in this.game.mulle.audio[key].config.spritemap) {
        this.game.mulle.audio[key].sounds[id].extraData = this.game.mulle.audio[key].config.spritemap[id].data;

        /*
        var cues = this.game.mulle.audio[key].config.spritemap[id].cue
         if (cues) {
           this.game.mulle.audio[key].sounds[id].cuePoints = []
           for (var i = 0; i < cues.length; i++) {
             this.game.mulle.audio[key].sounds[id].cuePoints.push( cues[i] ) // addMarker( i + '_' + cues[i][1], cues[i][0] / 1000, 0.1 )
           }
         }
        */
      }
      console.debug('[audio]', 'add', this.game.mulle.audio[key]);
    };
    this.mulle.stopAudio = function (id) {
      for (const a in this.game.mulle.audio) {
        var p = this.game.mulle.audio[a];
        for (var s in p.sounds) {
          if (p.sounds[s].extraData && id === p.sounds[s].extraData.dirName) {
            return p.stop(s);
          }
        }
      }
      console.error('sound not found', id);
      return false;
    };
    this.mulle.cursor = new util_cursor__WEBPACK_IMPORTED_MODULE_3__["default"](this);
    this.mulle.PartsDB = {};
    this.mulle.getPart = function (id) {
      return this.PartsDB[id];
    };
    this.mulle.UsersDB = [];
    this.mulle.saveData = function () {
      console.debug('SAVING DATA');
      window.localStorage.setItem('mulle_SaveData', JSON.stringify(this.game.mulle.UsersDB));
    };
    this.mulle.setData = function (key, value) {
      this.game.mulle.UsersDB[this.game.mulle.activeProfile][key] = value;
    };
    this.mulle.loadData = function () {
      // console.debug('LOADING DATA');

      this.game.mulle.UsersDB = {};
      var savedata = window.localStorage.getItem('mulle_SaveData');
      if (savedata) {
        var data = JSON.parse(savedata);

        // console.debug('Raw save data', data);

        for (var name in data) {
          this.game.mulle.UsersDB[name] = new struct_savedata__WEBPACK_IMPORTED_MODULE_23__["default"](this.game, data[name]);
          console.debug('[userdata]', 'loaded', name, this.game.mulle.UsersDB[name]);
        }
        console.debug('[userdata]', 'finish loading', this.game.mulle.UsersDB);
      } else {
        console.warn('[userdata]', 'empty');
      }
    };
    this.mulle.findFrame = function (collection, name) {
      for (var i in collection) {
        var a = collection[i];
        if (a.frameData.checkFrameName(name)) return a.key;
      }
      return false;
    };
    this.mulle.frameLookup = {};
    this.mulle.findFrameById = function (id, returnFrame = false) {
      var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
      for (var k in keys) {
        var img = this.game.cache.getImage(keys[k], true);
        var frames = img.frameData.getFrames();
        for (var f in frames) {
          if (frames[f].id && id === frames[f].id) {
            // this.game.mulle.frameLookup[ id ] = [img.key, frames[f].name];

            return returnFrame ? {
              frame: frames[f],
              key: img.key,
              name: frames[f].name
            } : [img.key, frames[f].name];
          }
        }
      }
      return false;
    };

    /**
     *
     * @param name
     * @returns {*|Phaser.Frame}
     * @deprecated Use getImageByCastNumber or getNamedImage
     */
    this.mulle.findDirectorMember = function (name) {
      if (memberLookup[name]) {
        return memberLookup[name];
      }
      var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
      for (var k in keys) {
        var img = this.game.cache.getImage(keys[k], true);
        var frames = img.frameData.getFrames();
        for (var f in frames) {
          if (frames[f].dirName === name) {
            memberLookup[name] = frames[f];
            return frames[f];
          }
        }
      }
      console.error('get member fail', name);
    };

    /**
     *
     * @param dir
     * @param num
     * @returns {{name: *, key: *, frame: *}|boolean|*}
     * @deprecated Use getImageByCastNumber or getNamedImage
     */
    this.mulle.getDirectorImage = function (dir, num) {
      if (!dir || !num) {
        // console.error('invalid parameters', dir, num);
        return false;
      }
      var l = dir + '_' + num;
      if (directorImageLookup[l]) return directorImageLookup[l];
      var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
      for (var k in keys) {
        var img = this.game.cache.getImage(keys[k], true);
        var frames = img.frameData.getFrames();
        for (var f in frames) {
          if (frames[f].dirFile === dir && (frames[f].dirNum === num || frames[f].dirName === num)) {
            var data = {
              frame: frames[f],
              key: img.key,
              name: frames[f].name
            };
            directorImageLookup[l] = data;
            return data;
          }
        }
      }
      console.error('get image fail', dir, num);
      return false;
    };
    this.mulle.getFrameRegPoint = function (id) {
      var f = this.game.mulle.findFrameById(id, true);
      if (f) {
        return f.regpoint;
      } else {
        return false;
      }
    };
    this.mulle.net = new util_network__WEBPACK_IMPORTED_MODULE_2__["default"](this);
  }

  /**
   * Setup and launch game
   * @return {void}
   */
  setup() {
    for (var i in this.mulle.states) {
      this.state.add(i, this.mulle.states[i]);
    }
    this.state.start('boot');
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleGame);

/***/ },

/***/ "./src/load.js"
/*!*********************!*\
  !*** ./src/load.js ***!
  \*********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var struct_partdata__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! struct/partdata */ "./src/struct/partdata.js");

class LoadState extends Phaser.State {
  preload() {
    // static data
    this.load.json('MapsDB', 'data/maps.hash.json');
    this.load.json('MissionsDB', 'data/missions.hash.json');
    this.load.json('ObjectsDB', 'data/objects.hash.json');
    this.load.json('PartsDB', 'data/parts.hash.json');
    this.load.json('WorldsDB', 'data/worlds.hash.json');

    // this.load.atlas('garage-0', 'assets/garage-0.png', 'assets/garage-0.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    // this.load.atlas('carparts-0', 'assets/carparts-0.png', 'assets/carparts-0.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    // this.load.atlas('carparts-1', 'assets/carparts-1.png', 'assets/carparts-1.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

    this.game.load.pack('cutscenes', 'assets/cutscenes.json', null, this);
    this.game.load.pack('characters', 'assets/characters.json', null, this);
    this.game.load.pack('boatparts', 'assets/boatparts.json', null, this);
    this.game.load.pack('shared', 'assets/shared.json', null, this);
    // this.game.load.pack('voices', 'assets_new/voices.json', null, this);
    this.game.load.pack('ui', 'assets/ui.json', null, this);

    // this.game.load.onPackComplete.add(handleMulleArchive, this);
    // this.game.load.onFileComplete.add(this.game.mulle.hijackFile, this);
    // this.game.load.onLoadComplete.add(this.game.mulle.hijackLoad, this);

    this.game.load.onLoadComplete.add(this.loadComplete, this);
    this.progress = game.add.graphics(0, 0);
    this.loadImage = this.game.add.sprite(320 - 235 / 2, 240 - 189 / 2, 'loading');
  }
  loadRender() {
    if (this.progress) {
      var p = this.game.load.progressFloat / 100;
      this.progress.clear();
      this.progress.beginFill('0x333333', 1);
      this.progress.drawRect(640 / 2 - 150, 400, 300, 32);
      this.progress.endFill();
      this.progress.beginFill('0x65C265', 1);
      this.progress.drawRect(640 / 2 - 150, 400, p * 300, 32);
      this.progress.endFill();
      this.progress.beginFill('0x65C265', 1);
    }
  }
  create() {
    var parts = this.game.cache.getJSON('PartsDB');
    for (var id in parts) {
      this.game.mulle.PartsDB[id] = new struct_partdata__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, id, parts[id]);
    }
    this.game.mulle.MapsDB = this.game.cache.getJSON('MapsDB');
    this.game.mulle.WorldsDB = this.game.cache.getJSON('WorldsDB');

    /*
    this.game.mulle.WorldsDB = {};
    for (var id in worlds) {
      this.game.mulle.WorldsDB[id] = new MulleWorld(this.game, id)
      this.game.mulle.WorldsDB[id].fromJSON(worlds[id])
    }
    */

    this.game.mulle.ObjectsDB = this.game.cache.getJSON('ObjectsDB');

    // this.loadText = this.game.add.text(32, 32, 'Loading...', { fill: '#ffffff' });

    this.game.mulle.addAudio('shared');
    this.game.mulle.addAudio('boatparts');
    this.game.mulle.loadData();
  }
  loadComplete() {
    this.ready = true;
  }
  fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {

    // this.loadText.setText("Loading " + totalLoaded + "/" + totalFiles + " files, " + progress + "% done.");

    // console.log('File loaded', cacheKey);
  }
  update() {
    if (this.ready) this.game.state.start(window.location.hash ? window.location.hash.substr(1) : 'menu');
  }
  shutdown() {
    if (this.loadImage) {
      this.loadImage.destroy();
    }
    if (this.progress) {
      this.progress.destroy();
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadState);

/***/ },

/***/ "./src/objects/DirectorHelper.js"
/*!***************************************!*\
  !*** ./src/objects/DirectorHelper.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* global Phaser */

class DirectorHelper {
  /**
   *
   * @param {MulleGame} game
   */
  constructor(game) {
    this.game = game;
    this.name_cache = {};
    this.movie_cache = {};
  }

  /**
   * Get key and frame for a director image
   * @param {Phaser.Game} game
   * @param {string} movie
   * @param {int|string} member
   * @returns string[] Array with sprite sheet key and frame number
   * @deprecated Use getImageByCastNumber or getNamedImage
   */
  static getDirectorImage(game, movie, member) {
    // noinspection JSUnresolvedVariable
    const {
      key,
      frame
    } = game.mulle.getDirectorImage(movie, member);
    return [key, frame];
  }

  /**
   * Get frame from sprite sheet
   * @param {string} spriteSheetKey
   * @param {string|int} castNumber Cast number
   * @returns {Phaser.Frame}
   */
  static getSpriteSheetImage(spriteSheetKey, castNumber) {
    const spriteSheet = game.cache.getImage(spriteSheetKey, true);
    for (const frame of spriteSheet.frameData.getFrames()) {
      if (frame.dirNum === castNumber) {
        return frame;
      }
    }
    console.error('No image with cast number', castNumber);
  }

  /**
   * Get sprite by director movie and cast number
   * @param {string} movie Director movie
   * @param {string} member Director cast member
   * @returns string[] Array with sprite sheet key and frame number
   */
  getImageByCastNumber(movie, member) {
    if (this.movie_cache[movie] && this.movie_cache[movie][member]) {
      return this.movie_cache[movie][member];
    }
    var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
    for (const k in keys) {
      var spriteSheet = game.cache.getImage(keys[k], true);
      var frames = spriteSheet.frameData.getFrames();
      for (const f in frames) {
        const frame = frames[f];
        if (frame.dirFile === movie && frame.dirNum === member) {
          console.log('match', frame);
          this.movie_cache[frame.dirFile][frame.dirNum] = [spriteSheet.key, frames[f].name];
          return [spriteSheet.key, frames[f].name];
        }
      }
    }
    console.error('Unable to find image', name);
    return [false, false];
  }

  /**
   * Get sprite by director cast name
   * @param {string} name Director cast name
   * @returns string[] Array with sprite sheet key and frame number
   */
  getNamedImage(name) {
    if (this.name_cache[name]) return this.name_cache[name];
    var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
    for (var k in keys) {
      var img = game.cache.getImage(keys[k], true);
      var frames = img.frameData.getFrames();
      for (var f in frames) {
        if (frames[f].dirName === name) {
          console.log('match', frames[f]);
          this.name_cache[name] = [img.key, frames[f].name];
          return [img.key, frames[f].name];
        }
      }
    }
    console.error('Unable to find image', name);
    return [false, false];
  }

  /**
   * Create a Phaser.Button with director texture and position
   * @param {Phaser.Game} game
   * @param {int|null} x X, set to null to use director position
   * @param {int|null} y Y, set to null to use director position
   * @param {Function} callback
   * @param callbackContext Callback context
   * @param {string} movie Director movie
   * @param {int|string} overFrameDir Director cast number or name for hover texture
   * @param {int|string} outFrameDir Director cast number or name for standard texture
   * @param {boolean} center Treat given coordinates as center and convert to top left
   * @return {Phaser.Button}
   */
  static button(game, x, y, callback, callbackContext, movie, overFrameDir, outFrameDir, center = false) {
    let overKey, outKey, key, overFrame, outFrame;
    if (overFrameDir) {
      [overKey, overFrame] = this.getDirectorImage(game, movie, overFrameDir);
      key = overKey;
    } else {
      overKey = null;
    }
    if (outFrameDir) {
      [outKey, outFrame] = this.getDirectorImage(game, movie, outFrameDir);
      key = outKey;
    } else {
      outKey = null;
      outFrame = {
        name: undefined
      };
    }
    if (overKey && outKey && overKey !== outKey) {
      throw Error('Frames are from different sprite sheets');
    }
    if (x === null && y === null && outFrame) {
      x = 320 - outFrame.regpoint.x;
      y = 240 - outFrame.regpoint.y;
    }
    if (center) {
      [x, y] = this.CenterToOuter(x, y, outFrame.height, outFrame.width);
    }
    return new Phaser.Button(game, x, y, key, callback, callbackContext, overFrame.name, outFrame.name, null, null);
  }
  static rectangleButton(game, x, y, h, w, callback, movie, overFrame, outFrame) {
    const button = this.button(game, x, y, callback, movie, overFrame, outFrame);
    button.height = h;
    button.width = w;
    return button;
  }

  /**
   * Create a Phaser.Sprite with director texture and position
   * @param {Phaser.Game} game
   * @param {int|null} x X, set to null to use director position
   * @param {int|null} y Y, set to null to use director position
   * @param {string} movie Director movie
   * @param {int|string} member Director cast number or name
   * @param {boolean} center Treat given coordinates as center and convert to top left
   * @param {boolean} use_regpoint Use Director regpoint as Phaser pivot point
   * @return {Phaser.Sprite}
   */
  static sprite(game, x, y, movie, member, center = false, use_regpoint = true) {
    const [key, frame] = this.getDirectorImage(game, movie, member);
    if (x === null && y === null) {
      x = 320 - frame.regpoint.x;
      y = 240 - frame.regpoint.y;
    }
    if (center) {
      [x, y] = this.CenterToOuter(x, y, frame.height, frame.width);
    }
    const sprite = new Phaser.Sprite(game, x, y, key, frame.name);
    if (use_regpoint) sprite.pivot = frame.regpoint;
    return sprite;
  }

  /**
   * Convert center coordinates to top left coordinates
   * @param {int} x Center X
   * @param {int} y Center Y
   * @param {int} h Height
   * @param {int} w Width
   * @return {[int, int]} Top left coordinates
   */
  static CenterToOuter(x, y, h, w) {
    return [x - w / 2, y - h / 2];
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DirectorHelper);

/***/ },

/***/ "./src/objects/MulleFileBrowser.js"
/*!*****************************************!*\
  !*** ./src/objects/MulleFileBrowser.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _TextInput__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TextInput */ "./src/objects/TextInput.js");
/* harmony import */ var _button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./button */ "./src/objects/button.js");
/* harmony import */ var _sprite__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sprite */ "./src/objects/sprite.js");
/* global FileReader */



class MulleFileBrowser extends _sprite__WEBPACK_IMPORTED_MODULE_2__["default"] {
  /**
   * @param {Phaser.Game} game
   * @param {function} callback Function to be called with file content when OK-button is pressed
   */
  constructor(game, callback) {
    super(game, 320, 240, '', '');
    this.callback = callback;
    this.setDirectorMember('13.DXR', 32);
    this.leftPoint = this.x - this.width / 2;
    this.topPoint = this.y - this.height / 2;
    this.input_path = new _TextInput__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, this.leftPoint + 14, this.topPoint + 7, 302, 12);
    this.input_file = new _TextInput__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, 170, this.topPoint + 228, this.leftPoint + 65, 24);
    this.input_file.type('file');
    this.input_file.id('file');
    this.input_file.input.setAttribute('accept', '*.car');
    this.buttonOk = this.relativeRectangleButton(263, 209, 64, 32, {
      click: () => {
        const file = this.input_file.input.files[0];
        const reader = new FileReader();
        reader.onload = e => {
          this.callback(e.target.result);
          this.destroy();
        };
        reader.readAsText(file);
      }
    });
    this.game.add.existing(this.buttonOk);
    this.buttonClose = this.relativeRectangleButton(278, 241, 31, 36, {
      click: () => {
        this.destroy(true);
      }
    });
    this.game.add.existing(this.buttonClose);
    this.buttonUp = this.relativeRectangleButton(274, 32, 17, 27, {
      click: () => {
        this.scrollUp();
      }
    });
    this.game.add.existing(this.buttonUp);
    this.buttonDown = this.relativeRectangleButton(274, 184, 17, 27, {
      click: () => {
        this.scrollDown();
      }
    });
    this.game.add.existing(this.buttonDown);
  }

  /**
   * Simplified method to create a button within the file browser frame
   * @param {int} x X relative to file browser frame
   * @param {int} y Y relative to file browser frame
   * @param {int} h Height
   * @param {int} w Width
   * @param {array} opt Options
   */
  relativeRectangleButton(x, y, h, w, opt) {
    return _button__WEBPACK_IMPORTED_MODULE_1__["default"].fromRectangle(this.game, this.leftPoint + x, this.topPoint + y, h, w, opt);
  }
  scrollUp() {
    console.log('Scroll up');
  }
  scrollDown() {
    console.log('Scroll down');
  }
  destroy(destroyChildren) {
    document.getElementById('player').removeChild(this.input_path.input);
    document.getElementById('player').removeChild(this.input_file.input);
    super.destroy(destroyChildren);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleFileBrowser);

// https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/

/***/ },

/***/ "./src/objects/SubtitleLoader.js"
/*!***************************************!*\
  !*** ./src/objects/SubtitleLoader.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class SubtitleLoader {
  /**
   * Class to help load subtitles from JSON
   * @param {Phaser.Game|MulleGame} game Game instance
   * @param {string} topic Subtitle topic
   * @param {string[]} languages Languages to load
   */
  constructor(game, topic, languages = ['english', 'swedish']) {
    this.game = game;
    this.topic = topic;
    this.languages = languages;
  }
  preload(topic = null) {
    if (!topic) topic = this.topic;
    for (const language of this.languages) {
      this.game.load.json(topic + 'Subs', 'data/subtitles/' + language + '/' + topic + '.json');
    }
  }
  load(topic) {
    if (!topic) topic = this.topic;
    for (const language of this.languages) {
      if (!this.game.mulle.subtitle.database[language]) {
        console.error('Invalid subtitle language ' + language);
        continue;
      }
      let data = this.game.cache.getJSON(topic + 'Subs');
      for (const file in data) {
        this.game.mulle.subtitle.database[language][file] = data[file];
        console.debug('Loaded subtitles for', file);
      }
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SubtitleLoader);

/***/ },

/***/ "./src/objects/TextInput.js"
/*!**********************************!*\
  !*** ./src/objects/TextInput.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class TextInput {
  constructor(game, x, y, w, fontSize, fontStyle = 'serif') {
    this.input = document.createElement('input');
    this.input.style.position = 'absolute';
    this.input.style.top = `${y}px`;
    this.input.style.left = `${x}px`;
    this.input.style.border = 'none';
    this.input.style.font = `${fontSize}px ${fontStyle}`;
    this.input.style.background = 'none';
    this.input.style.width = `${w}px`;
    this.input.addEventListener('keyup', ev => {
      if (ev.keyCode === 13) {
        console.log('Enter pressed');
      }
    });
    document.getElementById('player').appendChild(this.input);
  }
  text(text) {
    this.input.value = text;
  }
  value() {
    return this.input.value;
  }
  type(type) {
    this.input.setAttribute('type', type);
    this.input.setAttribute('accept', '*.car');
  }
  id(id) {
    this.input.setAttribute('id', id);
  }
  onChange(listener) {
    this.input.addEventListener('change', listener);
  }
  remove() {
    document.getElementById('player').removeChild(this.input);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextInput);

/***/ },

/***/ "./src/objects/actor.js"
/*!******************************!*\
  !*** ./src/objects/actor.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var objects_sprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! objects/sprite */ "./src/objects/sprite.js");
/**
 * MulleActor object
 * @module objects/actor
 */




/**
 * Mulle actor, extension of mulle sprite + phaser sprite
 * @extends MulleSprite
 */
class MulleActor extends objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
   * Create
   * @param  {Phaser.Game} game  Main game
   * @param  {number}      x     x coordinate
   * @param  {number}      y     y coordinate
   * @param  {string}      name  Hardcoded actor name
   * @param  {boolean}     ignore Ignore invalid actor name
   * @return {void}
   */
  constructor(game, x, y, name, ignore = false) {
    super(game, x, y);
    this.actorName = name;
    var b = '00.CXT';
    if (this.actorName === 'mulleDefault') {
      this.setDirectorMember(b, 271);
      this.addAnimation('idle', [[b, 271]], 10, true, false);
      this.addAnimation('scratchChin', [[b, 271], [b, 272], [b, 273], [b, 274], [b, 275], [b, 276]], 10, false, false);
      this.addAnimation('scratchHead', [[b, 277], [b, 278], [b, 279], [b, 280], [b, 281], [b, 282]], 10, false, false);
      this.addAnimation('lookPlayer', [[b, 287], [b, 288]], 10, true, false);
      this.addAnimation('talkPlayer', [[b, 289], [b, 290], [b, 291], [b, 292], [b, 293], [b, 294], [b, 295]], 10, true, false);
      this.addAnimation('talkRegular', [[b, 296], [b, 297], [b, 298], [b, 299], [b, 300], [b, 301], [b, 302]], 10, true, false);

      // this.addAnimation('turnLeft', [ [b, 283] ], 10, true, false);
      this.addAnimation('lookLeft', [[b, 283]], 10, true, false);

      // this.addAnimation('turnRight', [ [b, 286],  [b, 287], ], 10, true, false);

      this.addAnimation('turnBack', [[b, 285]], 10, true, false);
    } else if (this.actorName === 'mulleSit') {
      this.setDirectorMember(b, 245);
      this.addAnimation('idle', [[b, 245]], 0, true, false);
      this.addAnimation('wave', [[b, 246], [b, 247], [b, 248], [b, 249], [b, 250], [b, 251], [b, 252], [b, 251], [b, 250], [b, 249], [b, 248], [b, 247]], 10, true, false);
      this.addAnimation('lookPlayer', [[b, 253]], 0, true, false);
      this.addAnimation('talkPlayer', [[b, 253], [b, 254], [b, 255], [b, 256], [b, 257], [b, 258], [b, 259], [b, 260]], 10, true, false);
      this.addAnimation('smilePlayer', [[b, 261], [b, 262], [b, 263]], 5, true, false);
    } else if (this.actorName === 'mulleMenuHead') {
      var ten = '10.DXR';
      this.setDirectorMember(ten, 126);
      this.addAnimation('idle', [[ten, 126]], 0, true, false);
      this.addAnimation('point', [[ten, 136], [ten, 137], [ten, 137], [ten, 137], [ten, 137], [ten, 137], [ten, 137], [ten, 137], [ten, 137], [ten, 136], [ten, 126]], 10, false, false);
    } else if (this.actorName === 'mulleMenuMouth') {
      b = '10.DXR';
      this.setDirectorMember(b, 115);
      this.addAnimation('idle', [[b, 115]], 5, true, false);
      this.addAnimation('blink', [[b, 123]], 5, true, false);
      this.addAnimation('lookPlayer', [[b, 115]], 5, true, false);
      this.addAnimation('talkPlayer', [[b, 115], [b, 116], [b, 117], [b, 118], [b, 119], [b, 120], [b, 121], [b, 122]], 10, true, false);
    } else if (this.actorName === 'figge') {
      b = '92.DXR';
      this.setDirectorMember(b, 17);
      this.addAnimation('idle', [[b, 17]]);
      this.addAnimation('talkPlayer', [[b, 17], [b, 18], [b, 19], [b, 20], [b, 21], [b, 22], [b, 23], [b, 24], [b, 25]], 10, true, false);
    } else if (this.actorName === 'salkaRight') {
      b = '85.DXR';
      this.setDirectorMember(b, 26);
      this.addAnimation('idle', [[b, 26], [b, 27], [b, 28], [b, 29], [b, 30], [b, 29], [b, 28], [b, 27]], 15, true, false);
    } else if (this.actorName === 'salkaLeft') {
      b = '92.DXR';
      this.setDirectorMember(b, 40);
      this.addAnimation('idle', [[b, 40], [b, 41], [b, 42], [b, 43], [b, 44], [b, 43], [b, 42], [b, 41]], 15, true, false);
    } else if (this.actorName === 'buffa') {
      this.setDirectorMember(b, 214);
      this.addAnimation('idle', [[b, 214]], 10, true, false);
      this.addAnimation('scratch1', [[b, 214], [b, 215]], 10, true, false);
      this.addAnimation('sleep_intro', [[b, 214], [b, 216], [b, 217], [b, 218]], 10, false, false);
      this.addAnimation('sleep_loop', [[b, 219], [b, 220]], 1, false, false);
      this.addAnimation('bark', [[b, 222], [b, 223]], 10, true, false);
    } else if (this.actorName === 'judge') {
      b = '94.DXR';
      this.setDirectorMember(b, 31);
      this.addAnimation('idle', [[b, 31]], 10, true);
      this.addAnimation('talk', [[b, 43], [b, 44], [b, 45], [b, 46], [b, 47]], 10, true);
      var raise = this.addAnimation('raiseScore', [[b, 32], [b, 33], [b, 34], [b, 35]], 5, false);
      raise.onComplete.add(() => {
        console.log('raise hook');
        this.silenceAnimation = 'idleScore';
        this.talkAnimation = 'talkScore';
        this.animations.play('idleScore');
        this.displayScore();
      });
      this.addAnimation('idleScore', [[b, 36]], 10, false);
      this.addAnimation('talkScore', [[b, 37], [b, 38], [b, 39], /* [b, 40], */[b, 41], [b, 42]], 10, true);
      var lower = this.addAnimation('lowerScore', [[b, 35], [b, 34], [b, 33], [b, 32]], 5, false);
      lower.onComplete.add(() => {
        console.log('lower hook');
        this.silenceAnimation = 'idle';
        this.talkAnimation = 'talk';
        this.animations.play('idle');
      });
    } else if (this.actorName === 'figgeDoor') {
      b = '03.DXR';
      this.setDirectorMember(b, 81);
      var enter = this.addAnimation('enter', [[b, 81], [b, 82], [b, 83], [b, 84], [b, 85]], 10, false);
      enter.onComplete.add(() => {
        this.animations.play('entered');
      });
      this.addAnimation('entered', [[b, 86]], 10, true);
      this.addAnimation('exit', [[b, 85], [b, 84], [b, 83], [b, 82], [b, 81]], 10, false);
      this.addAnimation('talk', [[b, 86], [b, 87], [b, 88], [b, 89], [b, 90], [b, 91], [b, 92], [b, 93]], 10, true);
      this.talkAnimation = 'talk';
      this.silenceAnimation = 'entered';
    } else if (this.actorName === 'stureSad') {
      b = '88.DXR';
      this.setDirectorMember(b, 41);
      this.addAnimation('idle', [[b, 41]], 10, false);
      this.addAnimation('talk', [[b, 42], [b, 43], [b, 44], [b, 44], [b, 45]], 10, true);
    } else if (this.actorName === 'stureHappy') {
      b = '88.DXR';
      this.setDirectorMember(b, 33);
      this.addAnimation('idle', [[b, 33]], 10, false);
      this.addAnimation('talk', [[b, 34], [b, 35], [b, 36], [b, 36], [b, 37]], 8, true);
    } else if (this.actorName === 'garson') {
      b = '87.DXR';
      this.setDirectorMember(b, 15);
      this.addAnimation('idle', [[b, 15]], 10, false);
      this.addAnimation('talk', [[b, 16], [b, 17], [b, 18]], 8, true);
    } else if (this.actorName === 'miaBody') {
      b = '86.DXR';
      this.setDirectorMember(b, 55);
      this.addAnimation('idle', [[b, 55]], 10, false);
      this.addAnimation('catchIntro', [[b, 55], [b, 56], [b, 57], [b, 58]], 10, false);
      this.addAnimation('catchEnd', [[b, 47], [b, 48], [b, 49], [b, 50]], 10, false);
    } else if (this.actorName === 'miaHead') {
      b = '86.DXR';
      this.setDirectorMember(b, 62);
      this.addAnimation('idle', [[b, 62]], 10, false);
      this.addAnimation('talk', [[b, 63], [b, 64], [b, 65], [b, 66], [b, 67]], 10, true);
      this.addAnimation('idleCat', [[b, 69]], 10, false);
      this.addAnimation('talkCat', [[b, 69], [b, 70], [b, 71], [b, 72], [b, 73], [b, 74]], 10, true);
    } else if (this.actorName === 'cat') {
      b = '86.DXR';
      this.setDirectorMember(b, 30);
      this.addAnimation('idle', [[b, 30]], 10, false);
      var f = [];
      for (var i = 0; i < 12; i++) f.push([b, 31 + i]);
      this.addAnimation('jump1', f, 10, false);
      var f = [];
      for (var i = 0; i < 4; i++) f.push([b, 42 + i]);
      this.addAnimation('jump2', f, 10, false);
      // Boat game menu actors (11.DXR)
    } else if (this.actorName === 'mulleBody') {
      // Members 125-132: 87a001v2 (125), 02(126), 03(127), 04(128), 05(129), 06(130), 07(131), 08(132) - 180x346
      this.setDirectorMember('11.DXR', 125);
      this.addAnimation('still', [['11.DXR', 125]], 1, true, false);
      this.addAnimation('talk', [['11.DXR', 126], ['11.DXR', 127], ['11.DXR', 128], ['11.DXR', 129], ['11.DXR', 130], ['11.DXR', 131], ['11.DXR', 132]], 8, false, false);
    } else if (this.actorName === 'mulleHead') {
      // Members 133-143: 87a001v0 (133), 10(134), 11(135), 12(136), 13(137), 14(138), 15(139), 16(140), 17(141), 18(142), 19(143) - ~118x128
      this.setDirectorMember('11.DXR', 133);
      this.addAnimation('idle', [['11.DXR', 133]], 1, true, false);
      this.addAnimation('talk', [['11.DXR', 134], ['11.DXR', 135], ['11.DXR', 136], ['11.DXR', 137], ['11.DXR', 138], ['11.DXR', 139], ['11.DXR', 140], ['11.DXR', 141], ['11.DXR', 142], ['11.DXR', 143]], 10, false, false);
      this.addAnimation('point', [['11.DXR', 143]], 1, true, false);
    } else if (!ignore) {
      console.error('invalid actor', this.actorName);
    }
    this.onCue = new Phaser.Signal();
    this.isTalking = false;
    this.sentenceNum = 0;
  }

  /**
   * Make actor talk
   * @param  {string}   id    Sound name/ID
   * @param  {function} onEnd End callback
   * @param {function} onCue
   * @return {void}
   */
  talk(id, onEnd = null, onCue = null) {
    // console.log('talk', id, onEnd);

    this.isTalking = true;
    if (this.talkAudio) {
      console.warn('talk while already talking');
      this.resetTalk();
    }
    console.debug('[talk]', this.actorName, id);
    if (onCue) {
      this.onCue.add(onCue);
    } else {
      this.onCue.add(v => {
        if (v[1].toLowerCase() === 'silence') this.animations.play(this.silenceAnimation ? this.silenceAnimation : 'lookPlayer', 0);
        if (v[1].toLowerCase() === 'talk') this.animations.play(this.talkAnimation ? this.talkAnimation : 'talkPlayer');
      });
    }
    this.talkAudio = this.game.mulle.playAudio(id);
    if (!this.talkAudio) {
      console.error('invalid talk audio', this, id);
      this.talkAudio = null;
      return false;
    }
    var subData = this.game.mulle.subtitle.getData(id);
    if (subData) {
      var cueAmount = 1;
      var lines = subData.lines;

      // var lines = this.game.mulle.subtitle.database[ this.game.mulle.user.language ][ id ];

      var lineAmount = lines.length;
      if (this.talkAudio.extraData && this.talkAudio.extraData.cue) {
        var onlyTalk = this.talkAudio.extraData.cue.find(function (v) {
          return v[1].toLowerCase() === 'talk';
        });
        cueAmount = onlyTalk ? onlyTalk.length : 1;
      }
      console.debug('[talk-sub]', 'sentences', cueAmount);
      if (cueAmount === 1) {
        if (lineAmount > 1) {
          console.debug('[talk-sub]', this.actorName, 'only one cue, but multiple lines');

          /*
            // add all at once
            for (var t of lines) {
              this.game.mulle.subtitle.showLine(t);
            }
          */

          for (var i in lines) {
            if (i === 0) {
              this.game.mulle.subtitle.showLine(lines[i], subData.actor);
            } else {
              var del = 900 * Math.log(lines[i].length);
              this.game.time.events.add(del, () => {
                this.game.mulle.subtitle.showLine(lines[i], subData.actor);
              });
            }
          }
        } else {
          console.debug('[talk-sub]', this.actorName, 'only one sentence');
          this.game.mulle.subtitle.showLine(lines[0], subData.actor);
        }
      } else {
        console.debug('[talk-sub]', this.actorName, this.talkAudio.extraData.cue);
        this.onCue.add(v => {
          if (v[1].toLowerCase() === 'talk') {
            this.game.mulle.subtitle.showLine(lines[this.sentenceNum], subData.actor);
            this.sentenceNum++;
          }
        });
      }

      // this.game.mulle.subtitle.text = this.game.mulle.subtitles[id][0];
    } else {
      console.warn('no subtitle', id);
    }

    // if(!this.talkAudio.cuePoints) return;

    this.cuesCompleted = {};
    if (!this.talkAudio.isDecoded) {
      this.talkAudio.onPlay.add(this.onAudioPlay, this);
    } else {
      this.onAudioPlay();
    }
    this.onEnd = onEnd;
    if (this.onEnd) this.talkAudio.onStop.add(this.onEnd);
    this.talkAudio.onStop.add(this.onAudioStop, this);
    this.talkAudio.onResume.add(function () {
      console.log('resume');
    }, this);

    // console.log( 'talk audio', this.talkAudio );
  }

  /**
   * Internal audio play hook
   * @return {void}
   */
  onAudioPlay() {
    // console.log('audio play');

    this.animations.play(this.talkAnimation ? this.talkAnimation : 'talkPlayer');
    this.talkLoop = this.game.time.events.loop(Phaser.Timer.SECOND / 15, () => {
      // console.log('talk loop', this.talkAudio.currentTime);

      if (!this.talkAudio.extraData || !this.talkAudio.extraData.cue) {
        console.warn('no cue points', this.talkAudio);
        return;
      }
      this.talkAudio.extraData.cue.forEach((v, k) => {
        if (!this.cuesCompleted[k] && this.talkAudio.currentTime >= v[0]) {
          this.onCue.dispatch(v);
          this.cuesCompleted[k] = true;
        }
      });
    }, this);
  }

  /**
   * Internal audio stop hook
   * @return {void}
   */
  onAudioStop() {
    // console.log('audio stop');
    const idle = this.animations.getAnimation('idle');
    if (idle) idle.play();else if (!this.silenceAnimation) console.warn('No silence animation for actor', this.actorName);else {
      console.debug('Audio stop, start silenceAnimation', this.silenceAnimation);
      this.animations.play(this.silenceAnimation);
    }
    this.resetTalk();
    this.isTalking = false;
  }

  /**
   * Stop talking, remove audio, and reset animation
   * @return {void}
   */
  resetTalk() {
    // console.log('reset talk');

    this.sentenceNum = 0;
    if (this.talkAudio) {
      this.talkAudio.onPlay.remove(this.onAudioPlay, this);
      this.talkAudio.onStop.remove(this.onAudioStop, this);
      if (this.onEnd) this.talkAudio.onStop.remove(this.onEnd);
      this.talkAudio.stop();
      this.talkAudio = null;

      // console.log('removed events');
    }
    if (this.talkLoop) {
      this.game.time.events.remove(this.talkLoop);
      this.talkLoop = null;
    }
    this.onCue.removeAll();
  }
  destroy() {
    this.resetTalk();
    super.destroy();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleActor);

/***/ },

/***/ "./src/objects/audio.js"
/*!******************************!*\
  !*** ./src/objects/audio.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class MulleAudio extends Phaser.AudioSprite {
  constructor(game, key) {
    super(game, key);
  }
  playId(id) {
    for (var i in this.config.spritemap) {
      if (this.config.spritemap[i].id && id === this.config.spritemap[i].id) {
        return this.play(i);
      }
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleAudio);

/***/ },

/***/ "./src/objects/boat/boatbase.js"
/*!**************************************!*\
  !*** ./src/objects/boat/boatbase.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BoatBase: () => (/* binding */ BoatBase),
/* harmony export */   DepthChecker: () => (/* binding */ DepthChecker),
/* harmony export */   DisplayBoat: () => (/* binding */ DisplayBoat),
/* harmony export */   DummyBoatAncestor: () => (/* binding */ DummyBoatAncestor),
/* harmony export */   MedalScript: () => (/* binding */ MedalScript),
/* harmony export */   MeterScript: () => (/* binding */ MeterScript),
/* harmony export */   MotorBoatAncestor: () => (/* binding */ MotorBoatAncestor),
/* harmony export */   OarBoatAncestor: () => (/* binding */ OarBoatAncestor),
/* harmony export */   ObjectCompassScript: () => (/* binding */ ObjectCompassScript),
/* harmony export */   Sail: () => (/* binding */ Sail),
/* harmony export */   SailBoatAncestor: () => (/* binding */ SailBoatAncestor),
/* harmony export */   SelectorMaster: () => (/* binding */ SelectorMaster),
/* harmony export */   TypeSelectButton: () => (/* binding */ TypeSelectButton)
/* harmony export */ });
/* harmony import */ var _lingo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lingo */ "./src/objects/boat/lingo.js");
/* harmony import */ var _struct_saildata__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../struct/saildata */ "./src/struct/saildata.js");
/* harmony import */ var _props__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./props */ "./src/objects/boat/props.js");
/* harmony import */ var _topology__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./topology */ "./src/objects/boat/topology.js");
/**
 * Boat simulation for the sailing scene.
 *
 * Direct port of the 05.DXR parent scripts:
 *
 *   ParentScript 35 - DepthChecker
 *   ParentScript 181 - MeterScript
 *   ParentScript 36 - DisplayBoat
 *   ParentScript 171 / 170 - SelectorMaster / TypeSelectButton
 *   ParentScript 37/38/39/40/44 - Sail / Motor / Oar / Dummy ancestors
 *   ParentScript 34 - BoatBase
 *
 * @module objects/boat/boatbase
 */







/* -------------------------------------------------------------------------
 * DepthChecker
 * ---------------------------------------------------------------------- */

/**
 * Topology sampler: buckets the water depth of a point and detects land.
 * @extends DepthChecker
 */
class DepthChecker {
  constructor() {
    this.topoWidth = _topology__WEBPACK_IMPORTED_MODULE_3__.TOPO_SIZE.width;
    this.topoHeight = _topology__WEBPACK_IMPORTED_MODULE_3__.TOPO_SIZE.height;
    this.active = false;
    this.depth = 0;
    this.topo = null;
  }

  /**
   * @param {string} which Member name, "30t999v0" disables the checker
   */
  setTopology(which) {
    if (!which || which === '30t999v0') {
      this.active = false;
      this.topo = null;
      return;
    }
    this.active = true;
    this.topo = (0,_topology__WEBPACK_IMPORTED_MODULE_3__.readTopology)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game, which);
    if (!this.topo) this.active = false;
  }

  /** Bucket a real depth into 0..4 */
  setDepth(argDepth) {
    if (argDepth < 2) this.depth = 0;else if (argDepth < 4) this.depth = 1;else if (argDepth < 10) this.depth = 2;else if (argDepth < 16) this.depth = 3;else this.depth = 4;
  }

  /**
   * Nearness to the map edge.
   * @param  {Object} argLoc Point in screen coordinates
   * @return {Object|number} Direction point, or 0
   */
  checkBorders(argLoc) {
    const h = (argLoc.x - 4) / 2;
    const v = (argLoc.y - 4) / 2;
    const border = 4;
    if (h < 1 + border) return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(-1, 0);
    if (h > this.topoWidth - border - 2) return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(1, 0);
    if (v < 1 + border) return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, -1);
    if (v > this.topoHeight - border - 2) return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 1);
    return 0;
  }

  /**
   * Depth under the three collision corners.
   * @param  {Object} argLoc   Boat point
   * @param  {Array}  corners  Three [x, y] offsets in topology units
   * @return {string|number}   '#Hit' | 1 | '#Shallow' | 0
   */
  checkDepth(argLoc, corners) {
    if (!this.active || !this.topo) return 0;
    const baseH = (argLoc.x - 4) / 2;
    const baseV = (argLoc.y - 4) / 2;
    const total = this.topoWidth * this.topoHeight;
    for (let n = 0; n < corners.length; n++) {
      const c = corners[n];
      const tmpH = baseH + c[0];
      const tmpV = baseV + c[1];
      const index = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(tmpH + (tmpV - 1) * this.topoWidth);

      // `char N of str` outside the string yields "" -> charToNum -> 0 -> land
      if (index < 1 || index > total) return '#Hit';
      const info = this.topo[index - 1];
      if (info === 0) return '#Hit';
      if (info < 4) {
        if (info < this.depth) return 1;
        if (info === this.depth) return '#Shallow';
      }
    }
    return 0;
  }
  kill() {
    this.topo = null;
    this.active = false;
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * MeterScript
 * ---------------------------------------------------------------------- */

/**
 * A gauge drawn as a strip of Director members.
 */
class MeterScript {
  /**
   * @param {number} sp        Sprite number
   * @param {number} maxVal    Value shown by the last frame
   * @param {string} member    Name of the first member
   * @param {number} nrOfFrames Steps in the strip
   * @param {string} movie     Director movie
   * @param {number} lastMember Highest existing member (safety clamp)
   */
  constructor(sp, maxVal, member, nrOfFrames, movie, lastMember) {
    this.SP = sp;
    this.nrOfFrames = nrOfFrames || 17;
    this.movie = movie;
    this.lastMember = lastMember;
    this.speedPerFrame = maxVal / this.nrOfFrames;
    if (this.speedPerFrame === 0) this.speedPerFrame = 1;
    const first = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.findMember(movie, member);
    this.firstFrame = first || 0;
    this.meter = 0;
    this.counter = 0;
  }
  setMax(maxVal) {
    this.speedPerFrame = maxVal / this.nrOfFrames;
    if (this.speedPerFrame === 0) this.speedPerFrame = 1;
  }
  show(argSpeed) {
    this.meter = argSpeed / this.speedPerFrame;
    if (this.meter > this.nrOfFrames) this.meter = this.nrOfFrames;
    if (this.meter < 0) this.meter = 0;
    let member = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(this.firstFrame + this.meter);
    if (this.lastMember && member > this.lastMember) member = this.lastMember;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, this.movie, member);
  }
  fill() {
    this.counter = 0;
  }
  loop() {
    if (this.counter % 2 === 0 && this.meter < this.nrOfFrames) {
      this.meter += 1;
      let member = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(this.firstFrame + this.meter);
      if (this.lastMember && member > this.lastMember) member = this.lastMember;
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, this.movie, member);
    }
    this.counter += 1;
  }
  kill() {
    return 0;
  }
  kill() {
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * ObjectCompassScript
 * ---------------------------------------------------------------------- */

/**
 * Drives the on-screen compass for a map object with CustomObject = 'Compass'.
 * The compass sprite points to the object location with smooth needle rotation.
 */
class ObjectCompassScript {
  constructor(sp, objectLoc) {
    this.SP = sp;
    this.objectLoc = objectLoc;
    this.visible = 0;
    this.direction = 0;
    this.targetDirection = 0;
    this.rotationSpeed = 0.15; // Smooth rotation interpolation factor
  }
  init() {
    // Set initial member (compass base)
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(this.SP, 'CompassBottom');
    this.visible = 1;
  }
  loop(boatLoc) {
    if (!this.visible) return;

    // Calculate direction from boat to compass object
    const diffVec = pointSub(this.objectLoc, boatLoc);
    const angle = Math.atan2(diffVec.x, diffVec.y) * 180 / Math.PI;
    this.targetDirection = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(Math.round(angle / 22.5) + 1);

    // Smooth rotation interpolation
    let dirDiff = this.targetDirection - this.direction;
    if (dirDiff > 8) dirDiff -= 16;else if (dirDiff < -8) dirDiff += 16;
    this.direction += dirDiff * this.rotationSpeed;
    this.direction = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(Math.round(this.direction));

    // Update compass sprite (needle sprite)
    const needleSP = this.SP + 1; // Needle is SP+1
    const needleFrame = 484 + (this.direction - 1) * 2; // Needle frames
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(needleSP, '05.DXR', needleFrame);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setSpriteLoc(needleSP, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Stroot'] - 10,
    // Approximate position
    366 // Stroot Y position
    ));
  }
  show(yesNo) {
    this.visible = yesNo ? 1 : 0;
  }
  kill() {
    this.visible = 0;
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * MedalScript
 * ---------------------------------------------------------------------- */

/**
 * Handles medal display in the HUD with sparkle animation.
 */
class MedalScript {
  constructor(sp, medalId) {
    this.SP = sp;
    this.medalId = medalId;
    this.visible = 0;
    this.frameCounter = 0;
    this.sparklePhase = 0;
    this.sparkleTimer = 0;
    this.sparkleInterval = 60; // Frames between sparkles
  }
  init() {
    this.visible = 1;
    this.showMedal();
  }
  showMedal() {
    const member = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.findMember('05.DXR', 'medal' + this.medalId);
    if (member) {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(this.SP, member);
    }
  }
  loop() {
    if (!this.visible) return;

    // Sparkle animation
    this.sparkleTimer++;
    if (this.sparkleTimer >= this.sparkleInterval) {
      this.sparkleTimer = 0;
      this.sparklePhase = (this.sparklePhase + 1) % 4;

      // Toggle between medal frame and sparkle frame
      const baseMember = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.findMember('05.DXR', 'medal' + this.medalId);
      if (this.sparklePhase === 0) {
        // Show sparkle variant (assuming medal + _sparkle = sparkle variant)
        const sparkleMember = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.findMember('05.DXR', 'medal' + this.medalId + '_sparkle');
        if (sparkleMember) {
          _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(this.SP, sparkleMember);
        } else {
          _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(this.SP, this.medalId);
        }
      } else {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(this.SP, 'medal' + this.medalId);
      }
    }
    this.frameCounter++;
  }
  show(yesNo) {
    this.visible = yesNo ? 1 : 0;
  }
  kill() {
    this.visible = 0;
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * DisplayBoat
 * ---------------------------------------------------------------------- */

const SIDE_LIST = [2, 1, 0, 3, 4];
const FRONT_BACK_LIST = [2, 1, 0, 4, 3];

/**
 * Lingo `getAt(list, n)` is 1 based - DisplayBoat passes `side + 3` which
 * spans 1..5 for the five entry side lists.
 *
 * @param  {Array}  list       Source list
 * @param  {number} lingoIndex 1 based index
 * @return {*}                 Entry, 0 when out of range
 */
function listAt(list, lingoIndex) {
  const i = Math.round(lingoIndex) - 1;
  if (i < 0 || i >= list.length) return 0;
  return list[i];
}

/**
 * Keeps sprite #boat pointed at the right boat picture.
 */
class DisplayBoat {
  constructor(master, isShow) {
    this.masterObject = master;
    this.SP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#boat'];
    this.firstFrame = 0;
    this.decimalPrec = 100;
    this.frontBackList = FRONT_BACK_LIST;
    this.sideList = SIDE_LIST;
    this.visible = 1;
    this.soundOn = 0;
  }

  /** Member offset for a heading + inclination pair. */
  calcPicToShow(argDisplay, argDirection, argInclinationList) {
    const side = argInclinationList[0];
    const frontBack = argInclinationList[1];
    const tmpDir = 1 + (argDirection % 16 + 16) % 16;
    return tmpDir + 80 * listAt(this.sideList, side + 3) + 16 * listAt(this.frontBackList, frontBack + 3);
  }
  display(argInclinationList) {
    if (!this.visible) return;
    const loc = this.masterObject.loc;
    const direction = this.masterObject.direction;
    const side = argInclinationList[1];
    const frontBack = argInclinationList[2];
    const tmpAlt = argInclinationList[0];
    const tmpDir = 1 + (direction % 16 + 16) % 16;
    const xx = tmpDir + 80 * listAt(this.sideList, side + 3) + 16 * listAt(this.frontBackList, frontBack + 3);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.boatPack, this.firstFrame + xx);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setSpriteLoc(this.SP, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(-(tmpAlt / 10) + loc.x / this.decimalPrec, loc.y / this.decimalPrec));
  }
  loop() {
    this.display(this.masterObject.inclinations);
  }
  show(yesNo) {
    this.visible = yesNo ? 1 : 0;
    if (!this.visible) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(this.SP);else this.display(this.masterObject.inclinations);
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(this.SP);
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * SelectorMaster / TypeSelectButton
 * ---------------------------------------------------------------------- */

const ROLL_SOUNDS = {
  '#Motor': '05d130v0',
  '#Sail': '05d131v0',
  '#Oar': '05d129v0'
};

/**
 * The three drive type buttons in the bottom panel.
 */
class SelectorMaster {
  constructor(argOKTypes) {
    this.buttons = [];
    if (Array.isArray(argOKTypes)) {
      const tmpSP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#BoatTypes'];
      argOKTypes.forEach((type, i) => {
        const btn = new TypeSelectButton(this, tmpSP + i, type, ROLL_SOUNDS[type]);
        this.buttons.push(btn);
      });
    }
  }
  clickedOne(target) {
    this.buttons.forEach(b => {
      const match = b === target || b.type === target;
      if (match) b.select();else b.deselect();
    });
  }
  activate(yesNo) {
    this.buttons.forEach(b => b.activate(yesNo));
  }
  kill() {
    this.buttons.forEach(b => b.kill());
    this.buttons = [];
    return 0;
  }
}

/**
 * Single drive type button.
 */
class TypeSelectButton {
  constructor(reportObject, sp, type, sound) {
    this.reportObject = reportObject;
    this.SP = sp;
    this.type = type;
    this.sound = sound;
    this.selected = 0;
    this.active = 1;
    const name = 'TypePic' + type.substring(1); // #Sail -> TypePicSail
    this.firstFrame = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.findMember('05.DXR', name) || 0;
    this.rect = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.getMemberRect('05.DXR', this.firstFrame);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.game.mulle.worldState.registerRect('type-' + sp, this.rect, {
      onOver: () => this.mouse('#enter'),
      onOut: () => this.mouse('#Leave'),
      onUp: () => this.mouse('#click')
    }, 'interface');
  }
  mouse(what) {
    if (!this.active) return;
    if (what === '#click') {
      const tmp = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.boat.changeType(this.type);
      // changeType returns the new type (e.g. '#Sail') on success,
      // or an error sound string (e.g. '#NoFuel') on failure.
      // Success means the returned value is a known drive type.
      const possible = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.boat.possibleTypes || ['#Motor', '#Sail', '#Oar'];
      if (typeof tmp === 'string' && possible.includes(tmp)) {
        this.reportObject.clickedOne(this);
      } else if (typeof tmp === 'string') {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say(tmp, 4);
      }
      return;
    }
    if (what === '#enter') {
      if (!this.selected) {
        if (_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.level === 1) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say(this.sound, 6);
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 2);
      }
      return;
    }
    if (what === '#Leave') {
      if (!this.selected) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1);
    }
  }
  select() {
    if (!this.active) return;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', this.firstFrame);
    this.selected = 1;
  }
  deselect() {
    if (!this.active) return;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', this.firstFrame + 1);
    this.selected = 0;
  }
  activate(yesNo) {
    this.active = yesNo ? 1 : 0;
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.game.mulle.worldState.unregisterRect('type-' + this.SP);
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * Drive ancestors
 * ---------------------------------------------------------------------- */

/** Placeholder used before a drive type has been picked. */
class DummyBoatAncestor {
  constructor() {
    this.type = '#none';
    this.child = null;
  }
  init() {}
  steer() {}
  loop() {
    return 0;
  }
  setSpeed() {}
  display() {}
  playSounds() {}
  kill() {
    return 0;
  }
}

/**
 * Outboard / inboard engine drive.
 */
class MotorBoatAncestor {
  constructor(child) {
    this.child = child;
    this.type = '#Motor';
    this.motorSpeed = 0;
    this.Steering = 0;
    this.speedChange = 0;
    this.playingSounds = false;
    this.soundMode = '#normal';
    this.pitchPercent = 100;
    this.volume = 80;
    this.fuelConsumption = 0;
    this.zeroSpeedWait = 0;
    this.speedChangeSpeed = 2;
    this.sndId = 0;
  }
  init() {
    this.fuelConsumption = this.child.quickProps.fuelconsumption || 0;
    this.playSounds(true);
    this.zeroSpeedWait = 0;
    this.speedChangeSpeed = 2;
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.stop(this.sndId);
    return 0;
  }
  steer(toWhere, argSpeed) {
    if (toWhere === '#left') this.Steering = -1;else if (toWhere === '#right') this.Steering = 1;else this.Steering = 0;
    if (argSpeed === '#down') this.speedChange = -1;else if (argSpeed === '#up') this.speedChange = 1;else this.speedChange = argSpeed;
  }
  loop() {
    const child = this.child;
    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir();
      this.speedChange = this.motorSpeed > 0 ? -1 : 0;
      if (this.game().input.activePointer.isDown) this.speedChange = 1;
    } else if (typeof this.speedChange !== 'number') {
      this.speedChange = 0;
    }
    if (this.zeroSpeedWait) {
      this.zeroSpeedWait -= 1;
    } else if (this.speedChange > 0) {
      if (this.motorSpeed < 100) {
        if (this.motorSpeed < 0 && this.motorSpeed >= -this.speedChangeSpeed) {
          this.zeroSpeedWait = 15;
          this.motorSpeed = 0;
        } else {
          this.motorSpeed += this.speedChangeSpeed;
        }
      }
    } else if (this.speedChange < 0) {
      if (this.motorSpeed > -20) {
        if (this.motorSpeed > 0) {
          if (this.motorSpeed <= this.speedChangeSpeed) {
            this.zeroSpeedWait = 15;
            this.motorSpeed = 0;
          } else {
            this.motorSpeed -= this.speedChangeSpeed * 2;
          }
        } else {
          this.motorSpeed -= this.speedChangeSpeed;
        }
      }
    }
    if (!child.inFreeZone) {
      let fuel = child.fuel;
      if (fuel > 0) {
        fuel -= Math.abs(this.motorSpeed) * this.fuelConsumption / 30;
        child.fuelMeter.show(fuel);
        child.fuel = fuel;
        if (fuel <= 0) {
          child.OutOfFuel();
          return 0;
        }
      }
    }
    child.calcSpeedNDir(this.motorSpeed, this.Steering);
    return 0;
  }
  setSpeed(argSpeed) {
    this.motorSpeed = argSpeed;
  }
  display() {}
  playSounds(yesNo) {
    this.playingSounds = yesNo ? 1 : 0;
  }
  game() {
    return _lingo__WEBPACK_IMPORTED_MODULE_0__.g.game;
  }
}

/**
 * Rowing drive - one impulse per stroke.
 */
class OarBoatAncestor {
  constructor(child) {
    this.child = child;
    this.type = '#Oar';
    this.Steering = 0;
    this.Oar = 0;
    this.oarForce = [20, 20, 20, 20, 40, 40, 40, 60, 60, 80, 100, 80, 80, 80, 60, 60, 60, 60, 40, 40, 40, 40, 20, 20, 0];
    this.forceCount = this.oarForce.length;
    this.mouseForceCount = this.forceCount;
    this.sounds = ['05d127v0', '05d126v0'];
    this.soundCount = 1;
    this.sndId = 0;
  }
  init() {
    this.Steering = 0;
    this.internalDirection = this.child.direction * this.child.decimalPrec;
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.stop(this.sndId);
    return 0;
  }
  steer(toWhere, argSpeed) {
    if (toWhere === '#left') this.Steering = -1;else if (toWhere === '#right') this.Steering = 1;else this.Steering = 0;
    if (typeof argSpeed === 'string') {
      if (this.Oar === 0) {
        if (argSpeed === '#down') this.Oar = -this.forceCount;else if (argSpeed === '#up') this.Oar = this.forceCount;
      }
    } else {
      this.Oar = 0;
    }
  }
  loop() {
    const child = this.child;
    let tmpForce = 0;
    let tmpPlaySound = 0;
    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir();
      if (_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game.input.activePointer.isDown) {
        tmpForce = this.oarForce[this.mouseForceCount - 1] || 0;
        this.mouseForceCount -= 1;
        if (this.mouseForceCount < 1) this.mouseForceCount = this.forceCount;
        if (tmpForce === 0) tmpPlaySound = 1;
      } else {
        this.mouseForceCount = this.forceCount;
        tmpForce = 0;
      }
    } else if (this.Oar > 1) {
      tmpForce = this.oarForce[this.Oar - 1] || 0;
      this.Oar -= 1;
      if (tmpForce === 0) tmpPlaySound = 1;
    } else if (this.Oar < -1) {
      tmpForce = -(this.oarForce[-this.Oar - 1] || 0);
      this.Oar += 1;
    } else {
      tmpForce = 0;
    }
    child.mulleHungerSpeed = tmpForce ? 2 * child.orgMulleHungerSpeed : child.orgMulleHungerSpeed;
    if (tmpPlaySound) {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.stop(this.sndId);
      this.sndId = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(this.sounds[this.soundCount - 1], '#BG');
      this.soundCount = 3 - this.soundCount;
    }
    child.calcSpeedNDir(tmpForce * 13, this.Steering);
    return 0;
  }
  setSpeed() {
    this.Oars = [1, 1];
  }
  display() {}
  playSounds() {}
}

/**
 * The sail picture book-keeper, used by SailBoatAncestor.
 */
class Sail {
  constructor(reportObject) {
    this.reportObject = reportObject;
    this.direction = 1;
    this.SP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Sail'];
    this.firstFrame = 0;
    this.tightness = 2;
    this.forceList = [0, 20, 70, 80, 100];
    this.oldDiff = 0;
    this.movie = 'SAIL.CXT';
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(this.SP);
    return 0;
  }
  setDirection(theDir) {
    this.direction = theDir;
  }
  setTightness(how) {
    this.tightness += how;
    if (this.tightness < 0) this.tightness = 0;else if (this.tightness > 4) this.tightness = 4;
  }
  calcDirection(theDir) {
    let tmpScoot = this.reportObject.scooting;
    const game = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.game;
    if (game.input.keyboard && game.input.keyboard.altKey) tmpScoot = -1;
    this.setTightness(tmpScoot);
    const windDir = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind.getToDirection();
    theDir = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(theDir - 8);
    let tmpDiff = windDir - theDir;
    if (tmpDiff > 8) tmpDiff -= 16;else if (tmpDiff < -8) tmpDiff += 16;
    if (Math.abs(tmpDiff) > this.tightness) {
      tmpDiff = Math.sign(tmpDiff) * this.tightness;
      this.oldDiff = tmpDiff;
      this.direction = theDir + tmpDiff;
    } else {
      this.oldDiff = tmpDiff;
      this.direction = windDir;
    }
    this.direction = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.direction);
  }
  setPic(argOffset) {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, this.movie, this.firstFrame + argOffset);
  }
  getForce() {
    let force = Math.abs(this.direction - _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind.getDirection());
    if (force >= 8) force -= 8;
    if (force > 4) force = 8 - force;
    return (this.forceList[force] || 0) * _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind.getSpeed() / 1000;
  }
  loop() {}
}

/**
 * Wind powered drive.
 */
class SailBoatAncestor {
  constructor(child) {
    this.child = child;
    this.type = '#Sail';
    this.Sail = new Sail(this);
    this.Steering = 0;
    this.scooting = 0;
    this.soundMode = '#normal';
    this.SailSize = child.quickProps.sailsize || 0;
  }
  init() {
    this.Steering = 0;
    this.internalDirection = this.child.direction * this.child.decimalPrec;
    this.SailSize = this.child.quickProps.sailsize || 0;
  }
  kill() {
    return this.Sail.kill();
  }
  steer(toWhere, argScoot) {
    if (toWhere === '#left') this.Steering = -1;else if (toWhere === '#right') this.Steering = 1;else this.Steering = 0;
    if (argScoot === '#up') this.scooting = -1;else if (argScoot === '#down') this.scooting = 1;else this.scooting = 0;
  }
  loop() {
    const child = this.child;
    let tmpForce = this.Sail.getForce();
    if (child.steerMethod === '#mouse') {
      this.Steering = child.calcMouseDir();
      tmpForce = (tmpForce > 0) * (tmpForce + 10) / 2;
    }
    child.calcSpeedNDir(tmpForce * 14, this.Steering);
    this.Sail.calcDirection(child.direction);
    let tmpDiff = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind.getDirection() - child.direction - 8);
    if (tmpDiff > 8) tmpDiff = 8 - tmpDiff;else if (tmpDiff > 4) tmpDiff = 8 - tmpDiff;
    if (tmpDiff < -4) tmpDiff = -8 - tmpDiff;
    const tmpInclination = child.inclinations.slice();
    const tmpAngleDiff = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(child.direction - this.Sail.direction) - 8;
    const tmpRadiansDiff = tmpAngleDiff * Math.PI / 8.0;
    const tmp = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.calcRadians)(tmpInclination);
    const tmpNewAngle = tmp[0] - tmpRadiansDiff;
    const tmpHypo = tmp[1];
    const tmpSailIncl = [(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(tmpHypo * Math.sin(tmpNewAngle)), -(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(tmpHypo * Math.cos(tmpNewAngle))];
    for (let i = 0; i < 2; i++) {
      if (Math.abs(tmpSailIncl[i]) > 2) {
        tmpSailIncl[i] = 2 * tmpSailIncl[i] / Math.abs(tmpSailIncl[i]);
      }
    }
    const tmpPicOffset = child.displayObject.calcPicToShow(child.displayObject, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.Sail.direction + 8), tmpSailIncl);
    this.Sail.setPic(tmpPicOffset);
    return tmpForce * tmpDiff * this.SailSize;
  }
  setSpeed() {}
  display() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setSpriteLoc(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Sail'], _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.getSpriteLoc(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#boat']));
  }
  playSounds() {}
}

/* -------------------------------------------------------------------------
 * BoatBase
 * ---------------------------------------------------------------------- */

const CRASH_SOUNDS = {
  1: {
    '#Heavy': [1, 2, 3],
    '#Light': [4, 5, 6]
  },
  2: {
    '#Heavy': [7, 8, 9],
    '#Light': [10, 11, 12]
  }
};
const ERROR_SOUNDS = {
  '#NoRudder': '05d055v0',
  '#NoSteering': '05d056v0',
  '#NoTank': '05d023v0',
  '#NoWind': ['05d135v0', '05d136v0'],
  '#HardWind': '05d018v0',
  '#NoFuel': '05d137v0'
};

/**
 * The player's boat: position, physics, meters and drive selection.
 */
class BoatBase {
  constructor() {
    this.decimalPrec = 100;
    this.speed = 3;
    this.velPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0);
    this.direction = 1;
    this.internalDirection = this.direction * this.decimalPrec;
    this.firstFrame = 0;
    this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(320 * this.decimalPrec, 240 * this.decimalPrec);
    this.quickProps = (0,_props__WEBPACK_IMPORTED_MODULE_2__.refreshBoatProperties)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game);
    this.inclinations = [0, 0];
    this.depthChecker = new DepthChecker();
    this.locHistory = [];
    this.swayHistory = [];
    for (let n = 0; n < 10; n++) {
      this.locHistory.push({
        x: this.loc.x,
        y: this.loc.y
      });
      this.swayHistory.push(0);
    }
    this.hitLast = 0;
    this.steerMethod = '#Keys';
    const tmpPills = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.lookUpInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#Pills');
    const pillCount = tmpPills && typeof tmpPills === 'object' ? tmpPills.nr || 0 : 0;
    this.buffaSick = 1000 + pillCount * 25;
    this.mulleHunger = 1000;
    const tmpHunger = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.lookUpInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#Belly');
    if (tmpHunger && typeof tmpHunger === 'object') this.mulleHunger = tmpHunger.nr || 0;
    this.mulleHunger = this.mulleHunger * 10;
    this.programControlsBoat = 0;
    this.hungerMeter = new MeterScript(74, 10000, '34n003v0', 4, '05.DXR', 190);
    this.speedMeter = new MeterScript(70, 700, '34n002v0', 25, '05.DXR', 221);
    this.speedDivider = 1;
    this.shallowCommentCounter = 500;
    this.inFreeZone = 0;
    this.changedMapRecently = 0;
    this.cornerPoints = [];
    this.currentCorners = [];
    this.level = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.level || 1;
    this.orgMulleHungerSpeed = this.level === 1 ? 3 : 2;
    this.mulleHungerSpeed = this.orgMulleHungerSpeed;
    this.crashSndID = 0;
    this.notAllowedTypes = [];
    this.ancestor = new DummyBoatAncestor();
    this.fuelMeter = new MeterScript(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#fuel'], 1, '01a001v0', 13, '05.DXR', 132);
    this.compassScript = null;
    this.medalScript = null;
    this.possibleTypes = [];
    this.SelectorMaster = null;
    this.displayObject = null;
    this.speedList = [];
    this.Durability = undefined;
    this.wishedType = 0;
  }

  /* ---------------------------------------------------------- lifecycle */

  init() {
    this.possibleTypes = (0,_props__WEBPACK_IMPORTED_MODULE_2__.findPossiblePowers)(this.quickProps);
    if (this.possibleTypes.length === 0) {
      console.warn('[world] CheatBoat!');
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.makeCheatBoat();
      this.quickProps = (0,_props__WEBPACK_IMPORTED_MODULE_2__.refreshBoatProperties)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game);
      this.possibleTypes = (0,_props__WEBPACK_IMPORTED_MODULE_2__.findPossiblePowers)(this.quickProps);
    }

    // Sort possible types in UI order: #Sail, #Motor, #Oar (left to right)
    const typeOrder = ['#Sail', '#Motor', '#Oar'];
    this.possibleTypes.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));

    // Initialize compass script if boat has compass
    if (this.quickProps.compass) {
      const compassSP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Stroot'] + 2; // Compass needle sprite
      this.compassScript = new ObjectCompassScript(compassSP, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0));
      this.compassScript.init();
    }

    // Initialize medal display
    if (this.medals && this.medals.length > 0) {
      const medalSP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#medal'];
      this.medalScript = new MedalScript(medalSP, this.medals[0]);
      this.medalScript.init();
    }
    this.SelectorMaster = new SelectorMaster(this.possibleTypes);
    this.displayObject = new DisplayBoat(this);
    this.calculateFuel();
    let tmpType = this.changeType(this.wishedType);
    this.wishedType = 0;
    if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
      tmpType = this.changeType();
      if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say(tmpType, 1, this, null, '#GoHome');
        this.waitToGoHome();
        return;
      }
    }
    this.calculateMyProps(tmpType);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.waves.setCornerPoints([[0, -10], [-5, 5], [5, 5]]);
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.deleteReference(this);
    this.speedMeter.kill();
    this.hungerMeter.kill();
    this.fuelMeter.kill();
    if (this.compassScript) this.compassScript.kill();
    if (this.medalScript) this.medalScript.kill();
    if (this.displayObject) this.displayObject.kill();
    if (this.SelectorMaster) this.SelectorMaster.kill();
    this.depthChecker.kill();
    if (this.ancestor) this.ancestor.kill();
    return 0;
  }

  /* ------------------------------------------------------------- props */

  calculateFuel() {
    if (this.fuel === undefined || this.fuel === '#Full') {
      this.fuel = 4500 * (this.quickProps.fuelvolume || 0);
      this.quickProps.maxfuelvolume = this.fuel;
    } else if (this.quickProps.maxfuelvolume === undefined) {
      this.quickProps.maxfuelvolume = 4000 * (this.quickProps.fuelvolume || 0);
    }
    this.fuelMeter.setMax(this.quickProps.maxfuelvolume || 1);
  }
  calculateMyProps(argType) {
    this.quickProps = (0,_props__WEBPACK_IMPORTED_MODULE_2__.refreshBoatProperties)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game);
    (0,_props__WEBPACK_IMPORTED_MODULE_2__.makeCleanBoat)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game, argType, this.quickProps);
    const result = (0,_props__WEBPACK_IMPORTED_MODULE_2__.recalculateBoatProps)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game, argType, this.quickProps);
    this.speedList = result.speedList;
    this.cornerPoints = (0,_props__WEBPACK_IMPORTED_MODULE_2__.calcCornersList)(null);
    this.calculateFuel();
    this.stabilities = this.quickProps.stabilities || [100, 0];
    if (this.Durability === undefined) this.Durability = this.quickProps.durability || 0;
    this.acceleration = this.quickProps.acceleration || 30;
    this.retardation = this.quickProps.retardation || 10;
    this.depthChecker.setDepth(this.quickProps.realdepth || 0);
    const tmpAllDriv = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.lookUpInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#DrivenTimes') || {
      Motor: 0,
      Sail: 0,
      Oar: 0
    };
    const key = argType.substring(1);
    tmpAllDriv[key] = (tmpAllDriv[key] || 0) + 1;
    (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.setInInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#DrivenTimes', tmpAllDriv);
    if (this.ancestor) this.ancestor.kill();
    const ctors = {
      '#Motor': MotorBoatAncestor,
      '#Sail': SailBoatAncestor,
      '#Oar': OarBoatAncestor
    };
    const Ctor = ctors[argType] || DummyBoatAncestor;
    this.ancestor = new Ctor(this);
    this.ancestor.init();
    if (this.SelectorMaster) this.SelectorMaster.clickedOne(argType);
  }
  getType() {
    return this.ancestor ? this.ancestor.type : 0;
  }
  checkWindOK(argType) {
    if (argType === '#Sail' && _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind.getSpeed() === 0) {
      const snd = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(2) === 1 ? '05d135v0' : '05d136v0';
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say(snd, 5);
      return snd;
    }
    return null;
  }

  /**
   * Try to switch drive type.
   * @param  {string} [argRequestedType] '#Motor' | '#Sail' | '#Oar'
   * @return {string} Either '#Type' on success or an error sound name
   */
  changeType(argRequestedType) {
    if (argRequestedType && argRequestedType.charAt(0) === '#') {
      if (this.notAllowedTypes.includes(argRequestedType)) return 0;
    }
    if (!this.quickProps) this.quickProps = (0,_props__WEBPACK_IMPORTED_MODULE_2__.refreshBoatProperties)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game);
    const tmpCurrentlyOK = (0,_props__WEBPACK_IMPORTED_MODULE_2__.checkCurrentlyOKPowers)(this.quickProps, this.possibleTypes);
    let tmpLastType = 0;
    if (this.ancestor) tmpLastType = this.ancestor.type;
    const motorOK = valueOf(tmpCurrentlyOK, '#Motor');
    if (motorOK === 1 && this.fuel !== undefined && this.fuel <= 0) {
      setValue(tmpCurrentlyOK, '#Motor', '#NoFuel');
    }
    let tmpType;
    let tmpError = 0;
    if (argRequestedType && argRequestedType.charAt(0) === '#') {
      if (valueOf(tmpCurrentlyOK, argRequestedType) === 1) {
        this.calculateMyProps(argRequestedType);
        this.checkWindOK(argRequestedType);
        return argRequestedType;
      }
      tmpError = valueOf(tmpCurrentlyOK, argRequestedType);
    } else {
      const pos = positionOfValue(tmpCurrentlyOK, 1);
      if (pos >= 0) {
        tmpType = tmpCurrentlyOK[pos][0];
      }
    }
    if (tmpType) {
      if (tmpLastType === '#Motor') {
        if (tmpType === '#Sail') _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#MotorToSail', 5);else _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#MotorToOar', 5);
      } else if (tmpLastType === '#Sail' && tmpType === '#Oar') {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#SailToOar', 5);
      }
      this.checkWindOK(tmpType);
      return tmpType;
    }
    return errorSound(tmpError);
  }
  calculateFuelAmountRemoved() {}
  OutOfFuel() {
    if (this.possibleTypes.length === 1) {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#OutOfFuel', 1, this, '#Q', '#GoHomeTow');
      this.waitToGoHome();
      return;
    }
    const tmpType = this.changeType();
    if (typeof tmpType === 'string' && tmpType.charAt(0) !== '#') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say(tmpType, 1, this, null, '#GoHomeTow');
      this.waitToGoHome();
      return;
    }
    this.calculateMyProps(tmpType);
  }
  fillErUp() {
    this.fuel = '#Full';
    this.calculateFuel();
    this.fuelMeter.show(typeof this.fuel === 'number' ? this.fuel : this.quickProps.maxfuelvolume || 0);
  }
  save() {
    const tmpPillsList = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.lookUpInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#Pills');
    if (tmpPillsList && typeof tmpPillsList === 'object') {
      const left = (this.buffaSick - 1000) / 25;
      if (left > 0) tmpPillsList.nr = left;else delete _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user.Inventory['#Pills'];
    }
    ;(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.setInInventory)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.user, '#Belly', {
      nr: this.mulleHunger / 10
    });
    return {
      direction: this.direction,
      loc: (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x / this.decimalPrec, this.loc.y / this.decimalPrec),
      fuel: this.fuel,
      Durability: this.Durability,
      type: this.getType()
    };
  }
  load(argList) {
    if (!argList) return;
    if (argList.direction) {
      this.direction = argList.direction;
      this.internalDirection = this.direction * this.decimalPrec;
    }
    if (argList.loc) {
      this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(argList.loc.x * this.decimalPrec, argList.loc.y * this.decimalPrec);
      this.locHistory = this.locHistory.map(() => ({
        x: this.loc.x,
        y: this.loc.y
      }));
    }
    const tmpFuel = argList.fuel;
    if (tmpFuel === '#Full' || typeof tmpFuel === 'number') this.fuel = tmpFuel;
    if (typeof argList.Durability === 'number') this.Durability = argList.Durability;
    this.wishedType = argList.type || 0;
  }
  cheat() {
    this.mulleHunger = 10000;
    this.fuel = 40000;
    this.buffaSick = 2000;
  }
  stopMotor() {
    if (this.ancestor && this.ancestor.type === '#Motor') this.ancestor.setSpeed(0);
  }
  stepback(argNrOfSteps) {
    this.speed = 0;
    if (argNrOfSteps < 1) return this.loc;
    let tmp = this.locHistory.length - argNrOfSteps + 1;
    if (tmp < 1) tmp = 1;
    this.loc = Object.assign({}, this.locHistory[tmp - 1]);
    for (let n = tmp; n < this.locHistory.length; n++) {
      this.locHistory[n] = Object.assign({}, this.loc);
    }
    return this.loc;
  }
  freeZone(yesNo) {
    this.inFreeZone = yesNo;
  }
  setTopology(which) {
    this.depthChecker.setTopology(which);
  }
  getShowCoordinate() {
    return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x / this.decimalPrec, this.loc.y / this.decimalPrec);
  }
  setShowCoordinate(argPoint) {
    this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(argPoint.x * this.decimalPrec, argPoint.y * this.decimalPrec);
  }
  setCoordinate(argPoint, mode) {
    if (mode === '#AdjustTopo') this.setShowCoordinate(argPoint);else this.setShowCoordinate(argPoint);
  }
  steer(arg1, arg2) {
    if (this.ancestor) this.ancestor.steer(arg1, arg2);
  }
  playSounds(yesNo) {
    if (this.ancestor) this.ancestor.playSounds(yesNo);
  }
  waitToGoHome() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.activateinterface(0);
    this.programControlsBoat = 1;
  }
  programControl(yesNo) {
    this.programControlsBoat = yesNo ? 1 : 0;
  }
  mulleFinished(argID) {
    if (argID === '#continue') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#TRANS']);
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.pause(0);
    } else if (argID === '#GoHome') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.prepareToLeave('04');
    } else if (argID === '#GoHomeTow') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.prepareToLeave('04', '33b011v0', '33e011v0');
    } else if (argID === '#GoHomeCapsize') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.prepareToLeave('04', '33b014v0', '05d125v0');
    }
  }

  /* ------------------------------------------------------------ physics */

  calcMouseDir() {
    const mousePoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.game.input.activePointer.x, _lingo__WEBPACK_IMPORTED_MODULE_0__.g.game.input.activePointer.y);
    const tmp = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.calcDirection)(this.getShowCoordinate(), mousePoint, '#WithHypo');
    const tmpDirection = tmp[0];
    const tmpDiff = tmpDirection - this.direction;
    if (Math.abs(tmpDiff) >= 8) return 0;
    if (tmpDiff > 0) return 1;
    if (tmpDiff < 0) return -1;
    return 0;
  }
  calcSpeedNDir(argForce, argSteering) {
    const props = this.quickProps;
    const power = props.power || 0;
    const tmpPowerIn = Math.abs(argForce * power);
    const tmpPower = Math.floor(tmpPowerIn / 100);
    const tmpDec = tmpPowerIn - tmpPower * 100;
    let tmpLower;
    let tmpHigher;
    if (tmpPower) {
      const count = this.speedList.length;
      if (tmpPower > count) {
        tmpLower = this.speedList[count - 1] || 0;
        tmpHigher = tmpLower;
      } else {
        tmpLower = this.speedList[tmpPower - 1] || 0;
        tmpHigher = this.speedList[tmpPower] !== undefined ? this.speedList[tmpPower] : tmpLower;
      }
    } else {
      tmpLower = 0;
      tmpHigher = this.speedList[0] || 0;
    }
    let tmpWanted = tmpLower + tmpDec * (tmpHigher - tmpLower) / 100;
    if (argForce < 0) tmpWanted = -tmpWanted;
    const tmp = tmpWanted - this.speed;
    let change;
    if (tmp > 0) {
      change = this.acceleration * (tmpWanted - this.speed) / this.decimalPrec;
      if (Math.abs(change) > this.acceleration) {
        change = this.acceleration * (2 * (change > 0 ? 1 : 0) - 1);
      }
    } else {
      change = this.retardation * (tmpWanted - this.speed) / this.decimalPrec;
      if (Math.abs(change) > this.retardation) {
        change = this.retardation * (2 * (change > 0 ? 1 : 0) - 1);
      }
    }
    this.speed += change;
    if (argSteering) {
      const tmpSteer = argSteering * (props.manoeuverability || 0) / 40;
      this.internalDirection += tmpSteer;
      this.direction = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.internalDirection / this.decimalPrec);
    }
    this.currentCorners = this.cornerPoints[this.direction - 1] || [[0, -10], [-5, 5], [5, 5]];
    const v = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.getVelPoint)(_struct_saildata__WEBPACK_IMPORTED_MODULE_1__.DirectionList, this.direction);
    this.velPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(v.x * this.speed / 100, v.y * this.speed / 100);
  }
  setSpeed(argSpeed) {
    this.speed = argSpeed;
  }
  checkBorders() {
    const tmp = this.depthChecker.checkBorders(this.getShowCoordinate());
    if (tmp && typeof tmp === 'object') {
      const neighbour = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.world.getNewMapId(tmp, '#Relational', 1);
      if (Number.isInteger(neighbour)) {
        const tmpBorder = 8 + 4;
        if (tmp.x === -1) this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)((640 - tmpBorder) * this.decimalPrec, this.loc.y);else if (tmp.x === 1) this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)((4 + tmpBorder) * this.decimalPrec, this.loc.y);else if (tmp.y === -1) this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x, (396 - tmpBorder) * this.decimalPrec);else if (tmp.y === 1) this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x, (4 + tmpBorder) * this.decimalPrec);
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.changeMap(tmp);
        this.changedMapRecently = 5;
      } else {
        const l = this.getShowCoordinate();
        let x = l.x;
        let y = l.y;
        if (x > 630) x = 630;else if (x < 10) x = 10;
        if (y > 386) y = 386;else if (y < 10) y = 10;
        this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(x * this.decimalPrec, y * this.decimalPrec);
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('05d051v0', 2);
      }
    }
    if (this.changedMapRecently) this.changedMapRecently -= 1;
  }
  loop() {
    if (this.programControlsBoat) return;
    const wind = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.wind;
    const driftX = 90 * (this.quickProps.drift || 0) * wind.getVelPoint().x / 100 / 100;
    const driftY = 90 * (this.quickProps.drift || 0) * wind.getVelPoint().y / 100 / 100;
    this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x + (this.velPoint.x + driftX) / this.speedDivider, this.loc.y + (this.velPoint.y + driftY) / this.speedDivider);
    this.checkBorders();
    this.speedMeter.show(Math.abs(this.speed));
    this.hungerMeter.show(this.mulleHunger);
    const tmpInfo = this.depthChecker.checkDepth(this.getShowCoordinate(), this.currentCorners);
    if (tmpInfo === '#Hit' || tmpInfo === 1) {
      const damage = Math.abs(this.speed);
      if (!this.changedMapRecently) this.stepback(2);
      this.velPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0);
      this.speed = 0;
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#CrashEasy', 4, 0, 0, 0, 100);
      if (_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.finished(this.crashSndID)) {
        const material = this.quickProps.material || 1;
        let tmpSnds = CRASH_SOUNDS[material] || CRASH_SOUNDS[1];
        tmpSnds = this.quickProps.weight < 100 ? tmpSnds['#Heavy'] : tmpSnds['#Light'];
        let tmpVol = 60;
        if (damage > 300) tmpVol = 90;else if (damage > 100) tmpVol = 75;
        const snd = '05e008v1';
        this.crashSndID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(snd, '#EFFECT');
        if (this.crashSndID) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.crashSndID, tmpVol);
      }
      if (!this.inFreeZone) {
        this.Durability -= damage;
        if (this.Durability <= 0) {
          _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#crash', 1, this, '#Q', '#GoHomeTow');
          this.waitToGoHome();
        }
      }
      const last = this.locHistory[this.locHistory.length - 1];
      const lastPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(last.x / this.decimalPrec, last.y / this.decimalPrec);
      if (!(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.pointEq)(pointSubSafe(this.getShowCoordinate(), lastPoint), (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0))) {
        // keep rolling
      } else {
        this.speed = 0;
        this.hitLast = 1;
      }
    } else if (tmpInfo === '#Shallow') {
      if (this.shallowCommentCounter > 500) this.shallowCommentCounter = 0;
      if (this.shallowCommentCounter % 50 === 0 || this.speedDivider === 1) {
        const sounds = ['05e058v0', '05e059v0', '05e060v0'];
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(sounds[(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(3) - 1], '#OPEFFECT');
      }
      this.speedDivider = 2;
    } else {
      this.speedDivider = 1;
    }
    this.shallowCommentCounter += 1;
    this.locHistory.push({
      x: this.loc.x,
      y: this.loc.y
    });
    this.locHistory.shift();
    const additionalSideForce = this.ancestor.loop();
    const topoInfo = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.weatherRenderer.waves.getTopoInfo(this.getShowCoordinate(), this.direction, this.currentCorners);
    const tmpAlt = topoInfo[0];
    let frontBack = (this.stabilities[0] || 0) * topoInfo[1] / 17;
    if (!this.inFreeZone && this.level >= 4 && this.buffaSick > 0) {
      const tmpLast = this.swayHistory[this.swayHistory.length - 1];
      const tmpDiff = Math.abs(frontBack - tmpLast);
      this.buffaSick -= tmpDiff / 13;
      if (this.buffaSick <= 0) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#Vomit', 1, this, '#Q', '#GoHome');
        this.waitToGoHome();
      }
    }
    if (!this.inFreeZone && this.mulleHunger > 0) {
      this.mulleHunger -= this.mulleHungerSpeed;
      if (this.mulleHunger <= 0) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#Hungry', 1, this, '#Q', '#GoHome');
        this.waitToGoHome();
      }
    }
    this.swayHistory.push(frontBack);
    this.swayHistory.shift();
    frontBack = frontBack / 100;
    let tmpSideAngle;
    if (additionalSideForce) {
      tmpSideAngle = (this.stabilities[1] || 0) * (topoInfo[2] / 4 - additionalSideForce / 100) / 100;
    } else {
      tmpSideAngle = (this.stabilities[1] || 0) * topoInfo[2] / 100;
    }
    if (Math.abs(tmpSideAngle) > 30) {
      if (!this.inFreeZone) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#Capsize', 1, this, '#Q', '#GoHomeCapsize');
        this.waitToGoHome();
      }
    } else if (Math.abs(tmpSideAngle) > 27) {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#LurchHard', 4, this, 0, 0, 100);
    } else if (Math.abs(tmpSideAngle) > 23) {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.mulleTalk.say('#LurchEasy', 4, this, 0, 0, 100);
    }
    let side = tmpSideAngle / 5;
    if (Math.abs(side) > 2) side = Math.sign(side) * 2;
    if (Math.abs(frontBack) > 2) frontBack = Math.sign(frontBack) * 2;
    this.inclinations = [side, frontBack];
    this.displayObject.display([tmpAlt, side, frontBack]);
    this.ancestor.display();
  }
}
function pointSubSafe(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}

/* ------------------------------------------------------ property helpers */

function valueOf(list, key) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) return list[i][1];
  }
  return undefined;
}
function setValue(list, key, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) {
      list[i][1] = value;
      return;
    }
  }
  list.push([key, value]);
}
function positionOfValue(list, value) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][1] === value) return i;
  }
  return -1;
}
function errorSound(error) {
  if (!error || error === 1) return ERROR_SOUNDS['#NoSteering'] || '05d001v0';
  const snd = ERROR_SOUNDS[error];
  if (Array.isArray(snd)) return snd[(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(2) - 1];
  return snd || '05d001v0';
}

/***/ },

/***/ "./src/objects/boat/lingo.js"
/*!***********************************!*\
  !*** ./src/objects/boat/lingo.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SailSound: () => (/* binding */ SailSound),
/* harmony export */   calcDirection: () => (/* binding */ calcDirection),
/* harmony export */   calcRadians: () => (/* binding */ calcRadians),
/* harmony export */   checkRadius: () => (/* binding */ checkRadius),
/* harmony export */   correctDirection: () => (/* binding */ correctDirection),
/* harmony export */   deleteFromInventory: () => (/* binding */ deleteFromInventory),
/* harmony export */   g: () => (/* binding */ g),
/* harmony export */   getVelPoint: () => (/* binding */ getVelPoint),
/* harmony export */   integer: () => (/* binding */ integer),
/* harmony export */   inventory: () => (/* binding */ inventory),
/* harmony export */   isInInventory: () => (/* binding */ isInInventory),
/* harmony export */   lookUpInventory: () => (/* binding */ lookUpInventory),
/* harmony export */   point: () => (/* binding */ point),
/* harmony export */   pointAdd: () => (/* binding */ pointAdd),
/* harmony export */   pointEq: () => (/* binding */ pointEq),
/* harmony export */   pointScale: () => (/* binding */ pointScale),
/* harmony export */   pointSub: () => (/* binding */ pointSub),
/* harmony export */   random: () => (/* binding */ random),
/* harmony export */   setInInventory: () => (/* binding */ setInInventory)
/* harmony export */ });
/**
 * Lingo helpers shared by the sailing scene.
 *
 * Direct ports of the small movie handlers that the boat, weather and
 * UI scripts rely on (MovieScript 5/9, ParentScript 3 DrivingHandlers).
 *
 * @module objects/boat/lingo
 */


/**
 * Lingo globals, filled in by the world scene when it boots.
 * @type {{game: Object, dir: Object, globals: Object}}
 */
const g = {
  game: null,
  dir: null,
  globals: null
};

/** Lingo `random(n)` - 1..n */
function random(n) {
  if (n < 1) return 1;
  return Math.floor(Math.random() * n) + 1;
}

/** Lingo `integer()` - truncate towards zero */
function integer(v) {
  return v < 0 ? Math.ceil(v) : Math.floor(v);
}

/**
 * Lingo `correctDirection` - wrap a heading into the 1..16 range.
 * @param  {number} dir Heading
 * @return {number}      1..16
 */
function correctDirection(dir) {
  const d = Math.round(dir) % 16;
  if (d <= 0) return d + 16;
  return d;
}

/** Create a point. */
function point(x, y) {
  return {
    x: x,
    y: y
  };
}
function pointAdd(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}
function pointSub(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
function pointScale(a, s) {
  return {
    x: a.x * s,
    y: a.y * s
  };
}
function pointEq(a, b) {
  return a.x === b.x && a.y === b.y;
}

/**
 * `DrivingHandlers.getVelPoint` - the travel vector of a heading.
 * @param  {Array}  directionList 16 [x, y] vectors
 * @param  {number} dir           1..16
 * @return {Object}               point
 */
function getVelPoint(directionList, dir) {
  const p = directionList[dir - 1] || [0, 0];
  return point(p[0], p[1]);
}

/**
 * `DrivingHandlers.calcDirection` - heading from one point to another.
 *
 * @param  {Object}  start    from
 * @param  {Object}  end      to
 * @param  {string}  option   '#WithHypo' to also get the distance
 * @return {number|Array}     heading 1..16, or [heading, distance]
 */
function calcDirection(start, end, option) {
  const diffX = end.x - start.x;
  let diffY = start.y - end.y;
  const hypo = Math.sqrt(diffX * diffX + diffY * diffY);
  if (diffY === 0) diffY = 0.10000000000000001;
  let tempDirection = Math.atan(diffX / diffY);
  if (diffX > 0) {
    if (diffY <= 0) tempDirection += Math.PI;
  } else {
    if (diffY > 0) {
      tempDirection += 2 * Math.PI;
    } else {
      tempDirection += Math.PI;
    }
  }
  tempDirection = tempDirection / Math.PI;
  tempDirection = integer(tempDirection * 16 / 2);
  if (tempDirection === 0) tempDirection = 16;
  if (option === '#WithHypo') return [tempDirection, hypo];
  return tempDirection;
}

/**
 * `calcRadians` - convert [x, y] into [angle, length].
 * @param  {Array} diff [x, y]
 * @return {Array}      [radians, hypo]
 */
function calcRadians(diff) {
  const diffX = diff[0];
  let diffY = -diff[1];
  const hypo = Math.sqrt(diffX * diffX + diffY * diffY);
  if (diffY === 0) diffY = 0.10000000000000001;
  let tempDirection = Math.atan(diffX / diffY);
  if (diffX > 0) {
    if (diffY <= 0) tempDirection += Math.PI;
  } else {
    if (diffY > 0) {
      tempDirection += 2 * Math.PI;
    } else {
      tempDirection += Math.PI;
    }
  }
  return [tempDirection, hypo];
}

/**
 * `DrivingHandlers.checkRadius` - object proximity state machine.
 *
 * @param  {Object} target  Object with insideInner/insideOuter flags
 * @param  {Object} boatLoc Boat point
 * @param  {Object} objLoc  Object point
 * @param  {string} option  '#both' | '#Inner' | '#Outer'
 * @return {string|number}  Event name, or 0
 */
function checkRadius(target, boatLoc, objLoc, option) {
  const d = pointSub(boatLoc, objLoc);
  const hypo = Math.sqrt(d.x * d.x + d.y * d.y);
  if (option === '#Inner') {
    if (hypo <= target.innerRadius) {
      if (!target.insideInner) {
        target.insideInner = 1;
        return '#EnterInnerRadius';
      }
    } else if (target.insideInner) {
      target.insideInner = 0;
      return '#ExitInnerRadius';
    }
    return 0;
  }
  if (option === '#Outer') {
    if (hypo <= target.outerRadius) {
      if (!target.insideOuter) {
        target.insideOuter = 1;
        return '#enterOuterRadius';
      }
    } else if (target.insideOuter) {
      target.insideOuter = 0;
      return '#ExitOuterRadius';
    }
    return 0;
  }
  if (hypo <= target.outerRadius) {
    if (hypo <= target.innerRadius) {
      if (!target.insideInner) {
        target.insideInner = 1;
        if (target.insideOuter) return '#EnterInnerRadius';
        target.insideOuter = 1;
        return '#EnterBoth';
      }
    } else {
      if (!target.insideOuter) {
        target.insideOuter = 1;
        return '#enterOuterRadius';
      }
      if (target.insideInner) {
        target.insideInner = 0;
        return '#ExitInnerRadius';
      }
    }
  } else if (target.insideOuter) {
    target.insideOuter = 0;
    if (target.insideInner) {
      target.insideInner = 0;
      return '#ExitBoth';
    }
    return '#ExitOuterRadius';
  }
  return 0;
}

/**
 * Sound wrapper matching the `gSound` interface used by the Lingo scripts.
 *
 * Sounds are looked up in the already loaded audio sprite packs; anything
 * missing silently reports "already finished".
 */
class SailSound {
  constructor(game) {
    this.game = game;
    this.mode = '#normal';
    this.handles = {};
    this.counter = 0;
  }

  /** Is a sound member loaded? */
  has(name) {
    if (!name) return false;
    const audio = this.game.mulle.audio;
    for (const a in audio) {
      const p = audio[a];
      for (const s in p.sounds) {
        const extra = p.sounds[s].extraData;
        if (extra && extra.dirName && extra.dirName.toLowerCase() === name.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * `play(gSound, name, channel)`
   * @return {number} handle, 0 when nothing was played
   */
  play(name, channel) {
    if (!name || !this.has(name)) return 0;
    const snd = this.game.mulle.playAudio(name);
    if (!snd) return 0;
    this.counter++;
    const id = this.counter;
    this.handles[id] = snd;
    if (channel === '#BG' || channel === '#OPEFFECT') {
      // background loops keep playing over short effects
      snd.loop = channel === '#BG';
    }
    return id;
  }
  preload(name) {
    return this.play(name, '#BG') ? 1 : 0;
  }

  /** `finished(gSound, id)` */
  finished(id) {
    if (!id) return true;
    const snd = this.handles[id];
    if (!snd) return true;
    return !snd.isPlaying;
  }

  /** `stop(gSound, id)` */
  stop(id) {
    if (!id) return;
    const snd = this.handles[id];
    if (snd) {
      try {
        snd.stop();
      } catch (e) {/* already stopped */}
      delete this.handles[id];
    }
  }
  setVol(id, vol) {
    const snd = this.handles[id];
    if (snd) snd.volume = Math.max(0, Math.min(1, vol / 100));
  }
  setFreq(id, freq) {/* not supported by the web audio bridge */}
  unLoad(id) {
    this.stop(id);
  }
  setloop(id, yesNo) {
    const snd = this.handles[id];
    if (snd) snd.loop = !!yesNo;
  }
}

/**
 * User inventory, the `gMulleGlobals` helper handlers in miniature.
 * Values are stored verbatim on `user.Inventory`.
 */
function inventory(user) {
  if (!user) return {};
  if (!user.Inventory) {
    user.Inventory = {
      DrivenTimes: {
        Motor: 0,
        Sail: 0,
        Oar: 0
      }
    };
  }
  return user.Inventory;
}
function lookUpInventory(user, key) {
  const inv = inventory(user);
  return Object.prototype.hasOwnProperty.call(inv, key) ? inv[key] : undefined;
}
function isInInventory(user, key) {
  const v = lookUpInventory(user, key);
  if (v === undefined || v === null || v === 0) return false;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}
function setInInventory(user, key, value) {
  const inv = inventory(user);
  inv[key] = value;
  return value;
}
function deleteFromInventory(user, key) {
  const inv = inventory(user);
  delete inv[key];
}

/***/ },

/***/ "./src/objects/boat/props.js"
/*!***********************************!*\
  !*** ./src/objects/boat/props.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calcCornersList: () => (/* binding */ calcCornersList),
/* harmony export */   checkCurrentlyOKPowers: () => (/* binding */ checkCurrentlyOKPowers),
/* harmony export */   findPossiblePowers: () => (/* binding */ findPossiblePowers),
/* harmony export */   getHullId: () => (/* binding */ getHullId),
/* harmony export */   getPartProperties: () => (/* binding */ getPartProperties),
/* harmony export */   makeCleanBoat: () => (/* binding */ makeCleanBoat),
/* harmony export */   recalculateBoatProps: () => (/* binding */ recalculateBoatProps),
/* harmony export */   refreshBoatProperties: () => (/* binding */ refreshBoatProperties),
/* harmony export */   sumBoatProperties: () => (/* binding */ sumBoatProperties)
/* harmony export */ });
/* harmony import */ var _struct_saildata__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../struct/saildata */ "./src/struct/saildata.js");
/**
 * Boat property helpers.
 *
 * Direct ports of the 00.CXT movie scripts that prepare `boatProperties`
 * before a sailing session:
 *
 *   MovieScript 147 - ExtraBoatDrivingStuff  (makeCleanBoat)
 *   MovieScript 146 - MovieScript 146        (findPossiblePowers,
 *   ParentScript 8   - Part                   checkCurrentlyOKPowers)
 *   MovieScript 30   - RecalcBoatProps        (recalculateBoatProps)
 *
 * Lingo property lists are case insensitive, so every key here is lower case.
 *
 * @module objects/boat/props
 */



const DECIMAL_PREC = 100;

/**
 * Resolve the effective property list of a single part. Master parts borrow
 * their property list from the part they are a copy of.
 *
 * @param  {MulleGame} game  Main game
 * @param  {number}    partId Director member / part id
 * @return {Object}           lower case property list
 */
function getPartProperties(game, partId) {
  const part = game.mulle.PartsDB[partId];
  if (!part) return {};
  const raw = part.data.Properties;

  // Lingo keeps an empty list on master copies: [[], null] -> delegate.
  if (Array.isArray(raw) || !raw || Object.keys(raw).length === 0) {
    if (part.master && part.master !== partId) {
      return getPartProperties(game, part.master);
    }
    return {};
  }
  return part.properties || {};
}

/**
 * Sum the property lists of every part mounted on the boat. This is
 * `updateProperties` from `BoatViewHandler` / `Boat.updateProperties`.
 *
 * @param  {MulleGame} game   Main game
 * @param  {Array}     parts  Part ids
 * @return {Object}           summed properties
 */
function sumBoatProperties(game, parts) {
  const props = {};
  for (let i = 0; i < parts.length; i++) {
    const list = getPartProperties(game, parts[i]);
    for (const key in list) {
      const v = list[key];
      if (typeof v === 'number') {
        props[key] = (props[key] || 0) + v;
      }
    }
  }
  return props;
}

/**
 * Find the id of the hull (the part carrying load capacity).
 *
 * @param  {MulleGame} game  Main game
 * @param  {Array}     parts Part ids
 * @return {number}          Hull id, or 1 when there is none
 */
function getHullId(game, parts) {
  for (let i = 0; i < parts.length; i++) {
    const props = getPartProperties(game, parts[i]);
    if (typeof props.loadcapacity === 'number') return parts[i];
  }
  return 1;
}

/**
 * `findPossiblePowers` - which of Motor / Sail / Oar the current parts allow.
 *
 * @param  {Object} props Boat properties
 * @return {Array}        Ordered list of symbols
 */
function findPossiblePowers(props) {
  const result = [];
  const push = (type, cond) => {
    let ok = true;
    for (const key of cond) {
      if (!(props[key] > 0)) {
        ok = false;
        break;
      }
    }
    if (ok && result.indexOf(type) < 0) result.push(type);
  };
  push('#Motor', ['engine']);
  push('#Motor', ['outboardengine']);
  push('#Sail', ['sailwithpole', 'sailsize']);
  push('#Oar', ['oar']);
  return result;
}

/**
 * `makeCleanBoat` - drain every property a forbidden part type contributes so
 * the drive type can never be selected by accident.
 *
 * Direct port of MovieScript 147:
 *
 *   for each mounted part:
 *     if the part has one of the forbidden "trigger" properties:
 *       props[drain] -= part[drain === maxdepth ? depth : drain]
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    type  '#Motor' | '#Sail' | '#Oar'
 * @param  {Object}    props Properties to clean (mutated)
 * @return {Object}          The same list
 */
function makeCleanBoat(game, type, props) {
  let notAllowed;
  if (type === '#Sail') {
    notAllowed = {
      engine: ['power', 'speed'],
      outboardengine: ['depth', 'maxdepth', 'steerpart'],
      oar: ['power', 'speed']
    };
  } else if (type === '#Motor') {
    notAllowed = {
      oar: ['power', 'speed']
    };
  } else {
    notAllowed = {
      engine: ['power', 'speed'],
      outboardengine: ['depth', 'maxdepth']
    };
  }
  const parts = game.mulle.user && game.mulle.user.Car ? game.mulle.user.Car.Parts : [];
  for (let i = 0; i < parts.length; i++) {
    const partProps = getPartProperties(game, parts[i]);
    for (const trigger in notAllowed) {
      if (!partProps[trigger]) continue;
      const drains = notAllowed[trigger];
      for (let d = 0; d < drains.length; d++) {
        const drainProp = drains[d];
        const partProp = drainProp === 'maxdepth' ? 'depth' : drainProp;
        props[drainProp] = (props[drainProp] || 0) - (partProps[partProp] || 0);
      }
    }
  }
  return props;
}

/**
 * `checkCurrentlyOKPowers` - per drive type, is it structurally runnable?
 *
 * @param  {Object} props     Boat properties
 * @param  {Array}  argTypes  Candidate drive types
 * @return {Array}            Ordered [[type, 1|'#Error'], ...]
 */
function checkCurrentlyOKPowers(props, argTypes) {
  const list = Array.isArray(argTypes) ? argTypes : [argTypes];
  const out = [];
  for (const type of list) {
    let ok = 1;
    if (type === '#Sail') {
      if (!props.rudder) ok = '#NoRudder';else if (!props.steerpart) ok = '#NoSteering';
    } else if (type === '#Motor') {
      if (!props.steerpart && !props.outboardengine) ok = '#NoSteering';
      if (!props.rudder && !props.outboardengine) ok = '#NoRudder';
      if (ok === 1 && !props.fuelvolume) ok = '#NoTank';
    }
    out.push([type, ok]);
  }
  return out;
}

/**
 * `calcCornersList` - pre-computes the collision triangle for all 16
 * headings.
 *
 * NOTE: the original Lingo reads an undefined variable (`theList` instead of
 * `argList`) so the argument is always ignored and the default triangle is
 * used - reproduced here on purpose.
 *
 * @param  {Array} unused Ignored, kept for API parity
 * @return {Array}        16 lists of three [x, y] corners
 */
function calcCornersList(unused) {
  const theList = [[0, -10], [-5, 5], [5, 5]];
  const hypos = [];
  const orgAngles = [];
  for (const p of theList) {
    const tmpX = p[0];
    const tmpY = p[1];
    const hypo = Math.sqrt(tmpX * tmpX + tmpY * tmpY);
    hypos.push(hypo);
    let angle;
    if (tmpY === 0) {
      angle = Math.abs(tmpX) / tmpX * Math.PI / 2;
    } else {
      angle = Math.atan(tmpX / tmpY);
    }
    if (tmpX > 0) {
      if (tmpY <= 0) angle += Math.PI;
    } else if (tmpY > 0) {
      angle += 2 * Math.PI;
    } else {
      angle += Math.PI;
    }
    orgAngles.push(angle);
  }
  const corners = [];
  const tmpDirs = 16;
  for (let n = 1; n <= tmpDirs; n++) {
    const tmpList = [];
    const addAngle = 2 * Math.PI * n / tmpDirs;
    for (let m = 0; m < theList.length; m++) {
      const angle = orgAngles[m] + addAngle;
      const hypo = hypos[m];
      tmpList.push([Math.trunc(-hypo * Math.sin(angle)), Math.trunc(hypo * Math.cos(angle))]);
    }
    corners.push(tmpList);
  }
  return corners;
}

/**
 * Extend a speed lookup table the same way `recalculateBoatProps` does.
 *
 * @param  {Array} source Base table
 * @return {Array}        Extended table
 */
function extendSpeedList(source) {
  const list = source.slice();
  let tmp = list.length ? list[list.length - 1] : 0;
  for (let n = list.length; n <= 250; n++) {
    if (n < 50) {
      if (n % 2 === 0) tmp += 1;
    } else if (n % 4 === 0) {
      tmp += 1;
    }
    list.push(tmp);
  }
  return list;
}

/**
 * `recalculateBoatProps` - derive the driving numbers from the parts and
 * write `RealDepth`, `RealResistance`, `speedList` and `cornerPoints` back
 * onto `props`.
 *
 * @param {MulleGame} game   Main game
 * @param {string}    type   '#Motor' | '#Sail' | '#Oar'
 * @param {Object}    props  Boat properties (mutated)
 * @return {Object}          Extra results: speedList, stabilities
 */
function recalculateBoatProps(game, type, props) {
  const parts = game.mulle.user && game.mulle.user.Car ? game.mulle.user.Car.Parts : [];
  let hullId = getHullId(game, parts);
  if (!hullId) hullId = 1;
  const hullProps = getPartProperties(game, hullId);
  const hullWeight = hullProps.weight || 0;
  let weight = props.weight || 0;
  if (weight <= hullWeight) weight = hullWeight + 50;
  const loadCapacity = props.loadcapacity || 1;
  const loadPercent = 100 * (weight - hullWeight) / loadCapacity;
  const minDepth = props.depth || 0;
  props.realdepth = minDepth + loadPercent * ((props.maxdepth || 0) - minDepth) / 100;
  const minResistance = props.waterresistance || 0;
  props.realresistance = minResistance + loadPercent * ((props.maxwaterresistance || 0) - minResistance) / 100;
  if (type === '#Sail') {
    props.power = (props.sailsize || 0) * 60 / 100;
  }
  const rawWeight = props.weight || 0;
  props.retardation = DECIMAL_PREC * 200 / (400 + 2 * rawWeight);
  let tmpAcc = ((props.power || 0) + 50) * DECIMAL_PREC * 20 / (400 + 2 * rawWeight) / 11;
  if (tmpAcc > 100) tmpAcc = 100;else if (tmpAcc < 30) tmpAcc = 30;
  props.acceleration = tmpAcc;
  const tmpStab = 100 - (weight - 18) / 20;
  let tmpSideStab = tmpStab - (props.stability || 0);
  if (tmpSideStab < 0) tmpSideStab = 0;
  props.stabilities = [tmpStab, tmpSideStab];
  props.durability = 1000 * (props.durability || 0);
  props.manoeuverability = (props.manoeuverability || 0) * 2;
  const key = props.smallship ? 'Small' : props.largeship ? 'large' : 'Medium';
  let table = _struct_saildata__WEBPACK_IMPORTED_MODULE_0__.SpeedLists[key];
  if (!table) table = _struct_saildata__WEBPACK_IMPORTED_MODULE_0__.SpeedLists.Medium;
  table = extendSpeedList(table);
  table = table.map(v => (100 - (props.realresistance || 0)) * v / 10);
  return {
    speedList: table,
    stabilities: props.stabilities,
    weight: weight
  };
}

/**
 * `MulleCar.updateProperties` equivalent for the sailing side - refresh the
 * aggregated boat properties from the currently mounted parts.
 *
 * @param  {MulleGame} game Main game
 * @return {Object}         Aggregated properties
 */
function refreshBoatProperties(game) {
  const car = game.mulle.user && game.mulle.user.Car;
  if (!car) return {};
  return sumBoatProperties(game, car.Parts);
}

/***/ },

/***/ "./src/objects/boat/topology.js"
/*!**************************************!*\
  !*** ./src/objects/boat/topology.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TOPO_SIZE: () => (/* binding */ TOPO_SIZE),
/* harmony export */   readTopology: () => (/* binding */ readTopology)
/* harmony export */ });
/**
 * Topography sampler for the DepthChecker.
 *
 * The original keeps the topology of every map as an ASCII string in the
 * cast members `30tXXXv0` + `30tXXXv0-2` and reads single characters back
 * with `char N of str`. Here the same bytes are read out of the topography
 * sprite sheet once per map change instead of shipping ~6.7 MB of text.
 *
 * @module objects/boat/topology
 */


const TOPO_WIDTH = 316;
const TOPO_HEIGHT = 198;
const ATLAS_KEYS = ['topography-0', 'topography-1'];
const cache = {};

/**
 * Locate a topography frame in the loaded atlas sheets.
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    name  Member name, ie "30t029v0"
 * @return {Object|null}     { image, x, y } or null
 */
function findFrame(game, name) {
  for (let i = 0; i < ATLAS_KEYS.length; i++) {
    const key = ATLAS_KEYS[i];
    if (!game.cache.checkImageKey(key)) continue;
    const img = game.cache.getImage(key, true);
    if (!img || !img.frameData) continue;
    const frames = img.frameData.getFrames();
    for (const f in frames) {
      if (frames[f].name === name) {
        return {
          image: img.data,
          x: frames[f].x,
          y: frames[f].y
        };
      }
    }
  }
  return null;
}

/**
 * Read a topology frame into a byte buffer.
 *
 * Indexing matches the original string: `char (H + ((V - 1) * 316))` of the
 * 316x198 character grid, so the returned buffer is already row major from
 * (0,0).
 *
 * @param  {MulleGame} game  Main game
 * @param  {string}    name  Member name
 * @return {Uint8Array}      316 * 198 bytes, r channel of the pixels
 */
function readTopology(game, name) {
  if (cache[name]) return cache[name];
  const frame = findFrame(game, name);
  if (!frame) {
    console.warn('[topology] frame not found', name);
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = TOPO_WIDTH;
  canvas.height = TOPO_HEIGHT;
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true
  });
  ctx.clearRect(0, 0, TOPO_WIDTH, TOPO_HEIGHT);
  ctx.drawImage(frame.image, frame.x, frame.y, TOPO_WIDTH, TOPO_HEIGHT, 0, 0, TOPO_WIDTH, TOPO_HEIGHT);
  const pixels = ctx.getImageData(0, 0, TOPO_WIDTH, TOPO_HEIGHT).data;
  const out = new Uint8Array(TOPO_WIDTH * TOPO_HEIGHT);
  for (let i = 0, j = 0; i < out.length; i++, j += 4) {
    out[i] = pixels[j];
  }
  cache[name] = out;
  return out;
}
const TOPO_SIZE = {
  width: TOPO_WIDTH,
  height: TOPO_HEIGHT
};

/***/ },

/***/ "./src/objects/boat/weather.js"
/*!*************************************!*\
  !*** ./src/objects/boat/weather.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AmbienceSound: () => (/* binding */ AmbienceSound),
/* harmony export */   LoopHandler: () => (/* binding */ LoopHandler),
/* harmony export */   MulleSez: () => (/* binding */ MulleSez),
/* harmony export */   SingleWave: () => (/* binding */ SingleWave),
/* harmony export */   Waves: () => (/* binding */ Waves),
/* harmony export */   Weather: () => (/* binding */ Weather),
/* harmony export */   WeatherRenderer: () => (/* binding */ WeatherRenderer),
/* harmony export */   Wind: () => (/* binding */ Wind)
/* harmony export */ });
/* harmony import */ var _lingo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lingo */ "./src/objects/boat/lingo.js");
/* harmony import */ var _struct_saildata__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../struct/saildata */ "./src/struct/saildata.js");
/**
 * Weather, waves, wind and Mulle's chatter for the sailing scene.
 *
 * Direct port of the 05.DXR / 00.CXT parent scripts:
 *
 *   ParentScript 18 - WeatherRenderer
 *   ParentScript 21 - Wind
 *   ParentScript 22 / 23 - Waves / SingleWave
 *   ParentScript 42 - MulleSez
 *   ParentScript 24 - AmbienceSound
 *   ParentScript 18 - LoopHandler (00.CXT)
 *   ParentScript 142 - Weather (00.CXT)
 *
 * @module objects/boat/weather
 */





/* -------------------------------------------------------------------------
 * LoopHandler
 * ---------------------------------------------------------------------- */

/**
 * Tick list, the `loopMaster of gMulleGlobals`.
 */
class LoopHandler {
  constructor() {
    this.objects = [];
    this.addList = [];
    this.deleteList = [];
  }
  addObject(obj) {
    if (this.objects.includes(obj) || this.addList.includes(obj)) return;
    this.addList.push(obj);
  }
  deleteObject(obj) {
    if (!this.deleteList.includes(obj)) this.deleteList.push(obj);
  }
  loop() {
    if (this.deleteList.length) {
      this.deleteList.forEach(o => {
        const i = this.objects.indexOf(o);
        if (i >= 0) this.objects.splice(i, 1);
      });
      this.deleteList = [];
    }
    if (this.addList.length) {
      this.objects = this.objects.concat(this.addList);
      this.addList = [];
    }
    this.objects.forEach(o => {
      if (o && typeof o.loop === 'function') o.loop();
    });
  }
}

/* -------------------------------------------------------------------------
 * Weather
 * ---------------------------------------------------------------------- */

const WIND_INFO = [{
  '#Speeds': [1],
  '#Directions': [12]
}, {
  '#Speeds': [0, 1, 2],
  '#Directions': [16, 2, 6, 8, 10]
}, {
  '#Speeds': [0, 1, 2, 3],
  '#Directions': [16, 2, 6, 8, 10]
}, {
  '#Speeds': [0, 2, 3],
  '#Directions': [2, 4, 4, 6, 8, 10, 12, 12, 14, 16]
}];
const POSSIBLE_WEATHER = [[1], [1], [1, 2], [3, 4], [1, 2, 3, 4], [1, 2, 3, 4]];
function listValue(list, key) {
  for (let i = 0; i < list.length; i++) {
    if (list[i][0] === key) return list[i][1];
  }
  return undefined;
}

/**
 * Long running weather simulation (00.CXT `Weather`).
 */
class Weather {
  constructor(globals) {
    this.globals = globals;
    this.weatherType = 1;
    this.windspeed = 0;
    this.windDirection = 1;
    this.foreCastCounter = 0;
    this.changeWaitCounter = 0;
    this.reportTime = 0;
    this.nextWeather = [];
    this.windInfo = WIND_INFO;
    this.possibleWeatherInLevel = POSSIBLE_WEATHER;
    this.setNextWeather();
    this.loop();
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.addObject(this);
  }
  setNextWeather(argRandomWait) {
    const level = Math.min(Math.max((this.globals.level || 1) - 1, 0), 5);
    const possible = this.possibleWeatherInLevel[level] || [1];
    this.foreCastCounter = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(possible.length) - 1;
    const tmpType = possible[this.foreCastCounter];
    const info = this.windInfo[tmpType - 1] || this.windInfo[0];
    this.nextWeather = [['#type', tmpType], ['#speed', info['#Speeds'][(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(info['#Speeds'].length) - 1]], ['#direction', info['#Directions'][(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(info['#Directions'].length) - 1]]];
    if (argRandomWait) {
      const quarter = Math.max(1, Math.floor(argRandomWait / 4));
      this.reportTime = quarter + (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(quarter);
      this.changeWaitCounter = argRandomWait;
    } else {
      this.reportTime = 0;
      this.changeWaitCounter = 0;
    }
  }
  loop() {
    if (this.changeWaitCounter === 0) {
      this.weatherType = listValue(this.nextWeather, '#type');
      this.windDirection = listValue(this.nextWeather, '#direction');
      this.windspeed = listValue(this.nextWeather, '#speed');
      this.setNextWeather(3000 + (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(3000));
    } else {
      this.changeWaitCounter -= 1;
    }
  }
  getComingWeather() {
    if (this.changeWaitCounter < this.reportTime) {
      return this.nextWeather;
    }
    return [['#type', this.weatherType], ['#direction', this.windDirection], ['#speed', this.windspeed]];
  }
  getWindspeed() {
    return this.windspeed;
  }
  getWindDirection() {
    return this.windDirection;
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.deleteObject(this);
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * Wind
 * ---------------------------------------------------------------------- */

/**
 * Wind vane: drives the `strut` sprite and hands out the drift vector.
 */
class Wind {
  constructor() {
    this.randSpeed = 3;
    this.speed = 0;
    this.randDirection = 2;
    this.direction = 15 * 100;
    this.SP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Stroot'];
    this.firstFrame = 508; // -1 + number of member "strut0000"
    this.changeTime = 0;
    this.counter = 0;
    this.smallChange = 0;
    this.smallChangeWait = 0;
    this.vel = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0);
    this.toSpeed = 0;
    this.toDirection = 0;
    this.speedStep = 0;
    this.directionStep = 0;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.addObject(this);
  }
  init() {
    this.loop();
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.deleteObject(this);
    return 0;
  }
  loop() {
    if (this.changeTime) {
      this.speed += this.speedStep;
      this.direction += this.directionStep;
      this.changeTime -= 1;
      if (this.changeTime === 0) {
        this.speed = this.toSpeed;
        this.direction = this.toDirection;
      }
    }
    const tmpDirection = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.direction / 100 + 8);
    const vp = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.getVelPoint)(_struct_saildata__WEBPACK_IMPORTED_MODULE_1__.DirectionList, tmpDirection);
    this.vel = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.speed * vp.x / 100, this.speed * vp.y / 100);
    let tmpPicOffset;
    if (this.speed >= 300) tmpPicOffset = 0;else if (this.speed >= 200) tmpPicOffset = 1;else if (this.speed >= 100) tmpPicOffset = 2;else tmpPicOffset = 3;
    if (this.smallChangeWait <= 0) {
      this.smallChangeWait = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(6);
      this.smallChange = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(2) - 1;
    } else {
      this.smallChangeWait -= 1;
    }
    let member = this.firstFrame + tmpPicOffset * 32 + (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(tmpDirection + 9) * 2 + this.smallChange;
    if (member > 636) member = 636;
    if (member < 509) member = 509;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', member);
  }
  getVelPoint() {
    return this.vel;
  }
  slowChange(argSpeed, argDirection, argTime) {
    this.toSpeed = argSpeed * 100;
    this.changeTime = argTime;
    this.speedStep = (this.toSpeed - this.speed) / this.changeTime;
    let tmpDirChange = argDirection - this.direction / 100;
    if (tmpDirChange > 8) tmpDirChange -= 16;else if (tmpDirChange < -8) tmpDirChange = -16 - tmpDirChange;
    this.toDirection = argDirection * 100;
    this.directionStep = tmpDirChange * 100 / this.changeTime;
  }
  getDirection() {
    return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.direction / 100);
  }
  getToDirection() {
    return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(this.direction / 100 + 8);
  }
  getSpeed() {
    return this.speed;
  }
  Change(argSpeed, argDirection) {
    if (argSpeed !== undefined && argSpeed !== null) this.speed = Math.trunc(argSpeed * 100);
    if (argDirection !== undefined && argDirection !== null) this.direction = argDirection * 100;
  }
}

/* -------------------------------------------------------------------------
 * SingleWave
 * ---------------------------------------------------------------------- */

const WAVE_DUR = 30;
const WAVE_MAX = 4;
function buildFrameList() {
  const list = [];
  for (let m = 1; m <= 2; m++) {
    for (let n = 1; n <= WAVE_DUR - 1; n++) list.push(1 + (WAVE_MAX - 1) * n / WAVE_DUR);
    for (let n = 1; n <= WAVE_DUR; n++) list.push(WAVE_MAX);
    for (let n = 2; n <= WAVE_DUR; n++) list.push(1 + (WAVE_MAX - 1) * (WAVE_DUR - n) / WAVE_DUR);
  }
  return list;
}
const WAVE_FRAMES = buildFrameList();

/**
 * One travelling wave sprite.
 */
class SingleWave {
  constructor(reportObject, sp, theLoc, velPoint, direction, amplitude) {
    this.reportObject = reportObject;
    this.SP = sp;
    this.amplitude = amplitude;
    if (amplitude > 60) {
      this.firstFrame = 272 + 4 * (direction - 1); // -1 + number of member "WavePic1"
    } else {
      this.firstFrame = 360 + 4 * (direction - 1); // -1 + number of member "WavePic2"
    }
    this.frameList = WAVE_FRAMES;
    this.listLen = this.frameList.length;
    this.counter = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(this.listLen - 1);
    this.vel = velPoint;
    this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(theLoc.x * 10, theLoc.y * 10);
    this.active = 1;
    this.waveCircle = 70;
    this.loop();
  }
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(this.SP);
    this.active = 0;
    return 0;
  }
  check(thePoint) {
    const dx = thePoint.x - this.loc.x / 10;
    const dy = thePoint.y - this.loc.y / 10;
    const hypo = Math.sqrt(dx * dx + dy * dy);
    let factor = this.waveCircle - hypo;
    if (factor < 0) factor = 0;
    return this.frameList[this.counter - 1] * factor * this.amplitude * 2;
  }
  getLoc() {
    return (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x / 10, this.loc.y / 10);
  }
  loop() {
    if (!this.active) return;
    this.counter += 1;
    if (this.counter >= this.listLen) this.counter = 1;
    if (this.loc.x < -1000 || this.loc.y < -1000 || this.loc.x > 6400 || this.loc.y > 5100) {
      this.reportObject.Stopped(this);
      this.active = 0;
      return;
    }
    const tmpFrame = this.frameList[this.counter - 1];
    this.loc = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x + this.vel.x / 2 + this.vel.x * tmpFrame / 8, this.loc.y + this.vel.y / 2 + this.vel.y * tmpFrame / 8);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setSpriteLoc(this.SP, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(this.loc.x / 10, this.loc.y / 10));
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMember(this.SP, '05.DXR', (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(this.firstFrame + tmpFrame));
  }
}

/* -------------------------------------------------------------------------
 * Waves
 * ---------------------------------------------------------------------- */

/**
 * Keeps up to six wave sprites moving across the play field.
 */
class Waves {
  constructor() {
    this.phase = 0;
    this.waveObjs = [];
    // SpawnLines is exported as [[x, y], [x, y]] pairs - Director points are
    // objects for us, so rehydrate them once here.
    this.spawnLines = _struct_saildata__WEBPACK_IMPORTED_MODULE_1__.SpawnLines.map(line => line.map(p => (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(p.x !== undefined ? p.x : p[0], p.y !== undefined ? p.y : p[1])));
    this.amplitudeList = _struct_saildata__WEBPACK_IMPORTED_MODULE_1__.amplitudeList;
    this.corners = [];
    this.deleteList = [];
    this.speed = 0;
    this.direction = 1;
    this.amplitude = 0;
    this.period = 30;
    this.waveAngle = 0;
    this.waveVelPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, 0);
    this.currentSpawnLine = [(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(20, 202), (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(0, -100)];
    const tmpSP = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#waves'];
    this.waveSPs = [];
    for (let n = 1; n <= 6; n++) this.waveSPs.push(tmpSP + n - 1);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.addObject(this);
  }
  init() {}
  kill() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.deleteObject(this);
    return 0;
  }
  setCornerPoints(theList) {
    if (!theList) theList = [[0, -10], [-5, 5], [5, 5]];
    const hypos = [];
    const orgAngles = [];
    for (const p of theList) {
      const tmpX = p[0];
      const tmpY = p[1];
      const hypo = Math.sqrt(tmpX * tmpX + tmpY * tmpY);
      hypos.push(hypo);
      let angle;
      if (tmpY === 0) angle = Math.abs(tmpX) / tmpX * Math.PI / 2;else angle = Math.atan(tmpX / tmpY);
      if (tmpX > 0) {
        if (tmpY <= 0) angle += Math.PI;
      } else if (tmpY > 0) {
        angle += 2 * Math.PI;
      } else {
        angle += Math.PI;
      }
      orgAngles.push(angle);
    }
    this.corners = [];
    const tmpDirs = 16;
    for (let n = 1; n <= tmpDirs; n++) {
      const tmpList = [];
      const addAngle = 2 * Math.PI * n / tmpDirs;
      for (let m = 0; m < theList.length; m++) {
        const angle = orgAngles[m] + addAngle;
        const hypo = hypos[m];
        tmpList.push([Math.trunc(-hypo * Math.sin(angle)), Math.trunc(hypo * Math.cos(angle))]);
      }
      this.corners.push(tmpList);
    }
  }
  setDirection(argDir, argSpeed) {
    if (this.waveObjs.length) {
      this.waveObjs.slice().forEach(w => this.Stopped(w));
      this.deleteObjects();
      this.waveObjs = [];
    }
    this.speed = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(argSpeed);
    this.direction = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.correctDirection)(argDir + 8);
    this.currentSpawnLine = this.spawnLines[this.direction - 1];
    this.waveAngle = this.direction * Math.PI / 8.0;
    this.waveVelPoint = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(10 * this.speed * Math.sin(this.waveAngle), -10 * this.speed * Math.cos(this.waveAngle));
    this.amplitude = this.speed * 30;
    this.period = 30 + this.speed * 30;
    this.phase = 0;
    if (this.speed === 0) return;
    const tmpCnt = this.waveSPs.length;
    for (let n = 1; n <= tmpCnt - 2; n++) {
      const sp = this.waveSPs.shift();
      const wave = new SingleWave(this, sp, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(640), (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(400)), this.waveVelPoint, this.direction, this.amplitude);
      this.waveObjs.push(wave);
    }
  }
  Stopped(theObj) {
    this.waveSPs.push(theObj.SP);
    theObj.kill();
    if (this.deleteList.indexOf(theObj) < 0) this.deleteList.push(theObj);
  }
  loop() {
    if ((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(30) === 1 && this.speed > 0 && this.waveSPs.length) {
      const tmpLocs = this.waveObjs.map(w => w.getLoc());
      const tmpMid = this.currentSpawnLine[0];
      const tmpLim = this.currentSpawnLine[1];
      let tmpX = 0;
      let tmpY = 0;
      let itsBad = 1;
      for (let n = 1; n <= 30; n++) {
        const tmpRnd = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(400) - 200;
        tmpX = tmpMid.x + tmpLim.x * tmpRnd / 100;
        tmpY = tmpMid.y + tmpLim.y * tmpRnd / 100;
        itsBad = 0;
        for (const aLoc of tmpLocs) {
          if (Math.abs(tmpX - aLoc.x) < 100) {
            itsBad = 1;
            break;
          }
          if (Math.abs(tmpY - aLoc.y) < 100) {
            itsBad = 1;
            break;
          }
        }
        if (!itsBad) break;
      }
      if (!itsBad) {
        const sp = this.waveSPs.shift();
        const wave = new SingleWave(this, sp, (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(tmpX, tmpY), this.waveVelPoint, this.direction, this.amplitude);
        this.waveObjs.push(wave);
      }
    }
    this.phase = ((this.phase + this.speed) % this.period + this.period) % this.period;
    this.waveObjs.forEach(w => w.loop());
    this.deleteObjects();
  }
  deleteObjects() {
    this.deleteList.forEach(obj => {
      const i = this.waveObjs.indexOf(obj);
      if (i >= 0) this.waveObjs.splice(i, 1);
    });
    this.deleteList = [];
  }

  /**
   * Average water height under the hull plus the two tilt components.
   * @return {Array} [altitude, frontBack, side]
   */
  getTopoInfo(theCenter, theDir, argCorners) {
    let totAlt = 0;
    const alts = [];
    for (let n = 0; n < 3; n++) {
      const c = argCorners[n] || [0, 0];
      const alt = this.getAltitude((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.point)(theCenter.x + c[0], theCenter.y + c[1]));
      alts.push(alt);
      totAlt += alt;
    }
    const frontBack = alts[0] - (alts[1] + alts[2]) / 2;
    const side = alts[1] - alts[2];
    return [totAlt / 3, frontBack, side];
  }
  getAltitude(aPoint) {
    let bigWaveTot = 0;
    for (const w of this.waveObjs) bigWaveTot += w.check(aPoint);
    if (bigWaveTot > 7000 && _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.ambience) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.ambience.hitWave(bigWaveTot);
    const tmpX = aPoint.x + 100;
    const tmpY = aPoint.y + 100;
    const tmpAngle = Math.atan(tmpX / tmpY);
    const hypo = Math.sqrt(tmpX * tmpX + tmpY * tmpY);
    const totalAngle = tmpAngle + this.waveAngle;
    const fromZero = (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(hypo * Math.cos(totalAngle));
    let whereInPeriod = (fromZero + this.phase) % this.period;
    if (whereInPeriod < 0) whereInPeriod += this.period;
    whereInPeriod = 1 + ((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.integer)(100 * whereInPeriod / this.period) % 100 + 100) % 100;
    const amplitude = this.amplitudeList[whereInPeriod - 1] || 0;
    return (this.amplitude * amplitude + bigWaveTot) / 200;
  }
}

/* -------------------------------------------------------------------------
 * WeatherRenderer
 * ---------------------------------------------------------------------- */

const SPEED_FACTOR = {
  0: 0,
  1: 100,
  2: 125,
  3: 150,
  4: 175,
  5: 200
};

/**
 * Glue between the global weather, the wind vane and the waves.
 */
class WeatherRenderer {
  constructor() {
    this.wind = new Wind();
    this.waves = new Waves();
    this.speedFactor = 100;
    this.allowingRadio = 1;
  }
  init() {
    const weather = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.weather;
    this.wind.Change(weather.getWindspeed(), weather.getWindDirection());
    this.wind.init();
    this.waves.init();
  }
  kill() {
    this.wind.kill();
    this.waves.kill();
    return 0;
  }
  allowRadio(yesNo) {
    this.allowingRadio = yesNo;
  }

  /**
   * @param {string} [argHide] '#hide' covers the water
   * @param {*}      argWindSpeedFactor Map special "windSpeed"
   */
  changeMap(argHide, argWindSpeedFactor) {
    const weather = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.weather;
    const tmpWeather = weather.getComingWeather();
    if (argHide === '#hide') {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Water']);
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Fog']);
    } else {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Water'], 'Weather1');
      // Show fog for weather types 2-4 (fog, storms)
      const weatherType = listValue(tmpWeather, '#type');
      if (weatherType >= 2) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.setMemberByName(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Fog'], 'FogPic');
        // Initialize fog particles for weather types 2-4
        this.initFogParticles(weatherType);
      } else {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.hideSprite(_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.spriteList['#Fog']);
        this.clearFogParticles();
      }
    }
    let speedFactor = argWindSpeedFactor;
    if (speedFactor === undefined || speedFactor === null || speedFactor === '') {
      speedFactor = 100;
    } else if (typeof speedFactor === 'string') {
      const parsed = speedFactor.replace('#', '');
      if (parsed.toLowerCase() === 'full') speedFactor = '#Full';else speedFactor = parseInt(parsed, 10);
      if (isNaN(speedFactor)) speedFactor = 100;
    }
    if (typeof speedFactor === 'number' && SPEED_FACTOR[speedFactor] !== undefined) {
      speedFactor = SPEED_FACTOR[speedFactor];
    }
    let tmpSpeed;
    if (speedFactor === '#Full') {
      tmpSpeed = 4;
      speedFactor = 200;
    } else {
      tmpSpeed = speedFactor * listValue(tmpWeather, '#speed') / 100.0;
    }
    if (!Number.isInteger(speedFactor)) speedFactor = 100;
    this.speedFactor = speedFactor;
    const tmpDir = listValue(tmpWeather, '#direction');
    this.waves.setDirection(tmpDir, tmpSpeed);
    this.wind.Change(tmpSpeed, tmpDir);
  }

  /**
   * Initialize fog particle system for weather types 2-4 (fog, storms)
   * @param {number} weatherType - Weather type (2=fog, 3=storm, 4=heavy storm)
   */
  initFogParticles(weatherType) {
    if (this.fogParticles && this.fogParticles.length > 0) return;
    this.fogParticles = [];
    this.fogParticleCount = weatherType === 2 ? 30 : weatherType === 3 ? 50 : 70;
    this.fogType = weatherType;
    this.fogTimer = 0;

    // Create fog particles
    for (let i = 0; i < this.fogParticleCount; i++) {
      this.fogParticles.push({
        x: (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(640),
        y: (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(480),
        speedX: ((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(200) - 100) / 100,
        // -1 to 1
        speedY: ((0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(100) - 50) / 100,
        // -0.5 to 0.5
        alpha: (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(100) / 255 * 0.5,
        // 0-0.5 alpha
        size: 10 + (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(30),
        // 10-40px
        driftDirection: (0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(16) // Wind direction influence
      });
    }

    // Start fog animation loop
    if (!this.fogAnimationId) {
      this.fogAnimationId = setInterval(() => this.updateFogParticles(), 50);
    }
  }

  /**
   * Update fog particle positions
   */
  updateFogParticles() {
    if (!this.fogParticles || this.fogParticles.length === 0) return;
    const wind = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.weather;
    const windDir = wind.getWindDirection();
    const windSpeed = wind.getWindspeed();
    for (const particle of this.fogParticles) {
      // Apply wind influence
      const windAngle = (windDir - 1) * 22.5 * Math.PI / 180;
      const windForce = (wind.getWindspeed() || 0) * 0.5;
      particle.x += particle.speedX + Math.cos(windAngle) * windForce;
      particle.y += particle.speedY + Math.sin(windAngle) * windForce;

      // Wrap around screen
      if (particle.x < -50) particle.x = 690;else if (particle.x > 690) particle.x = -50;
      if (particle.y < -50) particle.y = 530;else if (particle.y > 530) particle.y = -50;

      // Pulsate alpha for organic feel
      particle.alpha = 0.2 + Math.sin(Date.now() * 0.003 + particle.size) * 0.3;
    }
  }

  /**
   * Clear fog particles
   */
  clearFogParticles() {
    if (this.fogAnimationId) {
      clearInterval(this.fogAnimationId);
      this.fogAnimationId = null;
    }
    this.fogParticles = [];
    this.fogType = 0;
  }
  kill() {
    this.wind.kill();
    this.waves.kill();
    this.clearFogParticles();
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * MulleSez
 * ---------------------------------------------------------------------- */

const COMMENT_LIST = {
  '#Vomit': [52, 53, 54],
  '#VomitPills': [39, 44],
  '#Tired': [12],
  '#Hungry': [13, 14, 15],
  '#MotorToSail': [20, 33],
  '#MotorToOar': [33],
  '#SailToOar': [16],
  '#Heavy': [22],
  '#OutOfFuel': [30, 31, 32],
  '#BadWeather': [8, 9, 18, 21],
  '#crash': [89, 90, 91, 92, 93],
  '#CrashEasy': [94, 99, 100],
  '#LurchEasy': [121, 122, 123],
  '#LurchHard': [107, 102, 104, 108],
  '#Capsize': [21]
};
function convItoS(n, width) {
  let s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

/**
 * Mulle's voice lines, with a per line cooldown.
 */
class MulleSez {
  constructor() {
    this.commentList = COMMENT_LIST;
    this.lastPlayed = {};
    for (const key in this.commentList) {
      this.lastPlayed[key] = {
        nr: 0,
        started: 0,
        wait: 0
      };
    }
    this.currentPriority = 0;
    this.soundsInQ = [];
    this.sndId = 0;
    this.counter = 0;
    this.soundList = 0;
    this.soundCounter = 0;
    this.nowPlaying = '';
    this.reportObject = null;
    this.currentIdentifier = 0;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.addObject(this);
  }
  isQuiet() {
    return _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.finished(this.sndId);
  }
  say(argWhat, argPriority, argReportObject, argPutInQ, argID, argMinWait) {
    if (argWhat === this.nowPlaying) return 0;
    if (typeof argWhat === 'string' && argWhat.charAt(0) === '#') {
      const played = this.lastPlayed[argWhat];
      if (!played) return 0;
      if (this.counter < played.started + (played.wait || 0)) return 0;
      const tmpList = this.commentList[argWhat].slice();
      if (tmpList.length > 1) {
        const i = tmpList.indexOf(played.nr);
        if (i >= 0) tmpList.splice(i, 1);
      }
      const tmpSndNr = tmpList[(0,_lingo__WEBPACK_IMPORTED_MODULE_0__.random)(tmpList.length) - 1];
      this.lastPlayed[argWhat] = {
        nr: tmpSndNr,
        started: this.counter,
        wait: argMinWait || 0
      };
      argWhat = '05d' + convItoS(tmpSndNr, 3) + 'v0';
    }
    if (this.sndId) {
      if ((argPriority || 0) <= this.currentPriority) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.stop(this.sndId);
        if (this.reportObject && typeof this.reportObject.mulleFinished === 'function') {
          this.reportObject.mulleFinished(this.currentIdentifier);
        }
        this.sndId = 0;
      } else {
        if (argPutInQ === '#Q') {
          this.soundsInQ.push({
            priority: argPriority,
            what: argWhat,
            reportObject: argReportObject,
            id: argID
          });
        }
        return 0;
      }
    }
    this.reportObject = argReportObject || null;
    this.currentPriority = argPriority || 0;
    this.currentIdentifier = argID || 0;
    this.playStringOrList(argWhat);
    return this.sndId;
  }
  playStringOrList(argWhat) {
    if (typeof argWhat === 'string') {
      this.nowPlaying = argWhat;
      this.sndId = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(argWhat, '#EFFECT');
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.sndId, 100);
    } else if (Array.isArray(argWhat)) {
      this.soundList = argWhat;
      this.soundCounter = 1;
      this.nowPlaying = this.soundList[0];
      this.sndId = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(this.nowPlaying, '#EFFECT');
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.sndId, 100);
    }
  }
  loop() {
    this.counter += 1;
    if (!this.sndId) return;
    if (!_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.finished(this.sndId)) return;
    this.nowPlaying = '';
    if (Array.isArray(this.soundList)) {
      this.soundCounter += 1;
      if (this.soundCounter <= this.soundList.length) {
        this.sndId = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play(this.soundList[this.soundCounter - 1], '#EFFECT');
        return;
      }
    }
    this.soundList = 0;
    this.sndId = 0;
    this.currentPriority = 0;
    if (this.reportObject && typeof this.reportObject.mulleFinished === 'function') {
      this.reportObject.mulleFinished(this.currentIdentifier);
    }
    this.currentIdentifier = 0;
    this.reportObject = null;
    if (this.soundsInQ.length) {
      const tmp = this.soundsInQ.shift();
      this.currentPriority = tmp.priority;
      this.reportObject = tmp.reportObject;
      this.currentIdentifier = tmp.id;
      this.playStringOrList(tmp.what);
    }
  }
  stop() {
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.stop(this.sndId);
    this.nowPlaying = '';
    this.reportObject = null;
    this.sndId = 0;
  }
  deleteReference(theObject) {
    this.soundsInQ = this.soundsInQ.filter(q => q.reportObject !== theObject);
    if (this.reportObject === theObject) {
      this.reportObject = null;
      this.stop();
    }
  }
  kill() {
    this.reportObject = null;
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.deleteObject(this);
    this.soundsInQ = [];
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * AmbienceSound
 * ---------------------------------------------------------------------- */

/**
 * Looping water/wind bed plus the occasional wave slap.
 */
class AmbienceSound {
  constructor() {
    this.active = 0;
    this.wavesID = 0;
    this.stemWaterID = 0;
    this.windID = 0;
    this.singleWaveID = 0;
    this.soundMode = '#normal';
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.addObject(this);
    this.activate(1);
  }
  activate(yesNo) {
    this.active = yesNo ? 1 : 0;
    if (this.active) {
      this.wavesID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play('WaveSm', '#OPEFFECT');
      if (this.wavesID) {
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setloop(this.wavesID, 1);
        _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.wavesID, 50);
      }
      this.stemWaterID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play('Vatten', '#OPEFFECT');
      if (this.stemWaterID) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.stemWaterID, 100);
      this.windID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play('05e043v0', '#OPEFFECT');
      if (this.windID) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.windID, 100);
      this.singleWaveID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play('OneWave2', '#OPEFFECT');
      if (this.singleWaveID) _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.singleWaveID, 75);
    } else {
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.unLoad(this.wavesID);
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.unLoad(this.stemWaterID);
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.unLoad(this.windID);
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.unLoad(this.singleWaveID);
      this.wavesID = this.stemWaterID = this.windID = this.singleWaveID = 0;
    }
  }
  hitWave() {
    if (!this.active) return;
    if (_lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.finished(this.singleWaveID)) {
      this.singleWaveID = _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.play('OneWave2', '#OPEFFECT');
      _lingo__WEBPACK_IMPORTED_MODULE_0__.g.dir.sounds.setVol(this.singleWaveID, 75);
    }
  }
  kill() {
    this.activate(0);
    _lingo__WEBPACK_IMPORTED_MODULE_0__.g.globals.loopMaster.deleteObject(this);
    return 0;
  }
}

/***/ },

/***/ "./src/objects/buildcar.js"
/*!*********************************!*\
  !*** ./src/objects/buildcar.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var objects_sprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var objects_actor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! objects/actor */ "./src/objects/actor.js");
/* harmony import */ var objects_carpart__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! objects/carpart */ "./src/objects/carpart.js");
/**
 * Buildable car
 * @module objects/buildcar
 */


// import MulleSave from 'struct/savedata'




/**
 * Buildable car
 * @extends Phaser.Group
 */
class MulleBuildCar extends Phaser.Group {
  /**
   * Create car
   * @param  {Phaser.Game} game
   * @param  {number}      x
   * @param  {number}      y
   * @param  {Array}       parts
   * @param  {Boolean}     isLocked
   * @param  {Boolean}     hasDriver
   * @return {void}
   */
  constructor(game, x, y, parts, isLocked = false, hasDriver = false) {
    super(game);
    this.x = x;
    this.y = y;
    if (parts) {
      this.parts = parts;
    } else {
      this.parts = this.game.mulle.user.Car.Parts;
    }
    this.locked = isLocked;
    this.partSprites = {};
    this.points = {};
    this.layers = {};
    this.usedPoints = {};
    this.coveredPoints = {};
    this.mulleSit = null;
    this.hasDriver = hasDriver;
    this.onAttach = new Phaser.Signal();
    this.onDetach = new Phaser.Signal();
    this.onRefresh = new Phaser.Signal();
    this.refresh();
  }

  /**
   * Refresh visible object with parts set earlier
   * @return {void}
   */
  refresh() {
    // console.log('refresh car', this.parts);

    this.points = {};
    this.layers = {};
    this.usedPoints = {};
    this.coveredPoints = {};

    // this.killAll();
    this.removeAll(true);
    this.partSprites = {};
    for (let partNum in this.parts) {
      let partId = this.parts[partNum];
      let partData = this.game.mulle.getPart(partId); // this.game.mulle.PartsDB[partId];

      if (!partData) {
        console.error('invalid part', partId);
        continue;
      }
      this.partSprites[partId] = {};
      if (partData.new) {
        partData.new.forEach((v, k) => {
          this.points[v.id] = {
            fg: v.fg,
            bg: v.bg,
            offset: v.offset
          };
        });
      }
      if (partData.Requires) {
        partData.Requires.forEach(s => {
          this.usedPoints[s] = true;
        });
      }

      /*
      if (partData.Covers) {
        partData.Covers.forEach( (s) => {
          console.log('covers', partId, s)
          this.coveredPoints[s] = true
        })
      }
      */

      if (partData.UseView) {
        // let atlasId_fg = this.game.mulle.findFrame([cp1, cp2], partData.UseView);

        let sprite_fg = new objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, 0, 0);

        // sprite_fg.setFrameId( partData.UseView );
        sprite_fg.setDirectorMember('CDDATA.CXT', partData.UseView);
        sprite_fg.partId = partId;
        sprite_fg.layer = partData.Requires[0];
        sprite_fg.sortIndex = this.points[sprite_fg.layer] ? this.points[sprite_fg.layer].fg : 8;
        sprite_fg.position.add(partData.offset.x, partData.offset.y);
        if (!this.locked && partData.Requires) {
          sprite_fg.inputEnabled = true;

          // sprite_fg.input.useHandCursor = true;

          sprite_fg.events.onInputOver.add(() => {
            this.game.mulle.cursor.current = 'Grab';
          });
          sprite_fg.events.onInputOut.add(() => {
            this.game.mulle.cursor.current = null;
          });
          sprite_fg.events.onInputDown.add(ev => {
            this.game.mulle.cursor.current = null;
            console.debug('detach part by drag', partId);
            this.detach(partId);
          }, this.game);
        }
        this.add(sprite_fg);
        this.partSprites[partId]['fg'] = sprite_fg;
      }
      if (partData.UseView2) {
        // let atlasId_bg = this.game.mulle.findFrame([cp1, cp2], partData.UseView2);

        let sprite_bg = new objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, 0, 0);
        sprite_bg.setDirectorMember('CDDATA.CXT', partData.UseView2);
        sprite_bg.partId = partId;
        sprite_bg.layer = partData.Requires[0];
        sprite_bg.sortIndex = this.points[sprite_bg.layer].bg ? this.points[sprite_bg.layer].bg : 7;
        sprite_bg.is_bg = true;
        sprite_bg.position.add(partData.offset.x, partData.offset.y);
        this.add(sprite_bg);
        this.partSprites[partId]['bg'] = sprite_bg;
      }

      // console.log( partId, sprite.regPoint );
    }
    if (this.hasDriver) {
      this.mulleSit = new objects_actor__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 0, 0, 'mulleSit');
      this.mulleSit.isMulle = true;
      this.mulleSit.sortIndex = 18;
      this.addChild(this.mulleSit);
      this.game.mulle.actors.mulle = this.mulleSit;

      // this.mulleSit.animations.play('wave');
    }
    for (var k in this.points) {
      this.layers[k] = {
        fg: this.points[k].fg,
        bg: this.points[k].bg
      };
    }
    this.sortLayers();
    this.onRefresh.dispatch();

    // console.log('used points', this.usedPoints);
    // console.log('covered points', this.coveredPoints);

    console.debug('[build-car]', 'attachment points', this.points);
    // console.log('sprites', this.sprites);
    // console.log('layers', this.layers);
  }
  sortLayers() {
    this.customSort((a, b) => {
      return a.sortIndex < b.sortIndex ? -1 : 1;
    });
  }

  /**
   * Attach a part by ID
   * @param  {number} partId
   * @return {Boolean} successful
   */
  attach(partId, noSave = false) {
    if (this.locked) return false;
    this.parts.push(parseInt(partId));
    this.onAttach.dispatch(partId);
    this.refresh();
    if (!noSave) this.save();
    return true;
  }

  /**
   * Detach a part by ID
   * @param  {number}  partId
   * @param  {Boolean} makePart   create part and start dragging
   * @return {Boolean} successful
   */
  detach(partId, makePart = false) {
    if (this.locked) return false;
    console.debug('detach part', partId);
    var partIndex = this.parts.indexOf(partId);
    if (partIndex === -1) return false;
    let partData = this.game.mulle.getPart(partId);
    var newPos = this.partSprites[partId].fg.worldPosition.clone();
    var newId = partData.master ? partData.master : partId;
    this.parts.splice(partIndex, 1);
    this.onDetach.dispatch(partId, newId, newPos);
    this.refresh();
    if (makePart) {
      var holdPart = new objects_carpart__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, newId);
      holdPart.car = this;
      holdPart.justDetached = true;

      // holdPart.setJunkPile( this.game.mulle.user.Junk.shopFloor, true );

      this.junkParts.addChild(holdPart);
      holdPart.position.set(newPos.x, newPos.y);
      holdPart.position.add(holdPart.regPoint.x, holdPart.regPoint.y);
      holdPart.input.startDrag(this.game.input.activePointer);
      this.game.mulle.playAudio(holdPart.sound_attach);
    }
    this.save();
    return true;
  }
  destroy() {
    if (this.mulleSit && this.game.mulle.actors.mulle === this.mulleSit) this.game.mulle.actors.mulle = null;
    super.destroy();
  }

  /**
   * Trash the car and place the parts on the junk yard
   */
  trash() {
    let partId, partData;
    for (partId of this.parts) {
      if (partId > 1) {
        partData = this.game.mulle.PartsDB[partId];
        if (partData.master) {
          // Un-morph parts
          partId = partData.master;
        }
        // Place part in the junk yard
        this.game.mulle.user.addPart('Pile1', partId, null, true);
      }
    }
    this.parts = [1];
    this.game.mulle.user.Car.Medals = [];
    this.game.mulle.user.Car.Name = '';
    this.refresh();
    this.save();
  }

  /**
   * Dump data into user save object
   * @return {void}
   */
  save() {
    this.game.mulle.user.Car.Parts = this.parts;
    // this.game.mulle.user.save();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleBuildCar);

/***/ },

/***/ "./src/objects/button.js"
/*!*******************************!*\
  !*** ./src/objects/button.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var objects_sprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! objects/sprite */ "./src/objects/sprite.js");
/* global Phaser */
/**
 * Button extension
 * @module objects/button
 */




/**
 * Mulle button
 * @extends Phaser.Button
 */
class MulleButton extends Phaser.Button {
  constructor(game, x, y, opt) {
    super(game, x, y);
    this.opt = opt;
    this.displaySprite = new objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, this.x, this.y);

    // this.displaySprite.loadTexture( this.opt.imageDefault[0], this.opt.imageDefault[1].toString() );
    if (this.opt.imageDefault) {
      this.displaySprite.setDirectorMember(this.opt.imageDefault[0], this.opt.imageDefault[1]);
      this.game.add.existing(this.displaySprite);
      if (this.displaySprite._frame) {
        this.hitArea = new Phaser.Rectangle(-this.displaySprite.regPoint.x, -this.displaySprite.regPoint.y, this.displaySprite._frame.width, this.displaySprite._frame.height);
      } else {
        console.error('no hit area', this);
      }
    }
    this.input.useHandCursor = false;
    this.cursor = 'Click';
  }

  /**
   * Create a button without a texture
   * @param {Phaser.Game} game
   * @param {int} x Left
   * @param {int} y Top
   * @param {int} w Width
   * @param {int} h Height
   * @param opt Options
   */
  static fromRectangle(game, x, y, w, h, opt) {
    const button = new MulleButton(game, x, y, opt);
    button.width = w;
    button.height = h;
    return button;
  }
  onInputOverHandler() {
    if (this.cursor) this.game.mulle.cursor.current = this.cursor;
    if (this.displaySprite && this.opt.imageHover) this.displaySprite.setDirectorMember(this.opt.imageHover[0], this.opt.imageHover[1]);
    if (this.opt.soundHover) this.game.mulle.playAudio(this.opt.soundHover);
  }
  onInputOutHandler() {
    this.game.mulle.cursor.current = null;
    if (this.displaySprite && this.opt.imageDefault) this.displaySprite.setDirectorMember(this.opt.imageDefault[0], this.opt.imageDefault[1]);
    if (this.opt.soundDefault) this.game.mulle.playAudio(this.opt.soundDefault);
  }
  onInputUpHandler() {
    this.opt.click();
  }
  onDown() {}

  /**
   * Destroy the button and its sprite
   * @param destroyChildren
   */
  destroy(destroyChildren) {
    super.destroy(destroyChildren);
    this.displaySprite.destroy();
  }

  /**
   * Hide the button and its sprite
   */
  hide() {
    this.visible = false;
    this.displaySprite.visible = false;
  }

  /**
   * Show the button and its sprite
   */
  show() {
    this.visible = true;
    this.displaySprite.visible = true;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleButton);

/***/ },

/***/ "./src/objects/carpart.js"
/*!********************************!*\
  !*** ./src/objects/carpart.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var objects_sprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! objects/sprite */ "./src/objects/sprite.js");
/**
 * MulleCarPart object
 * @module objects/carpart
 */




/**
 * Mulle sprite, extension of phaser sprite
 * @extends MulleSprite
 */
class MulleCarPart extends objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
   * Create car part
   * @param  {Phaser.Game} game      Main game
   * @param  {number}      part_id   Junk part ID
   * @param  {number}      x         x position
   * @param  {number}      y         y position
   * @param  {boolean}     noPhysics Disable physics
   * @return {void}
   */
  constructor(game, part_id, x, y, noPhysics = false) {
    super(game, x, y);
    this.part_id = part_id;
    this.car = null;
    this.canAttach = false;
    this.activeMorph = null;
    this.activeView = null;
    this.noAttach = false;
    this.snapSound = false;
    this.snapDistance = 40;
    this.justDetached = false;
    this.groundSound = false;
    this.noPhysics = noPhysics;
    this.dropTargets = [];
    this.dragTicks = 0;
    if (!this.game.mulle.PartsDB[this.part_id]) {
      console.error('invalid part', this.part_id);
      return;
    }
    this.partData = this.game.mulle.getPart(this.part_id);

    // this.sound_grab = "00e004v0";
    this.sound_floor = '00e001v0';
    this.sound_attach = '03e003v0';
    var weight = this.getProperty('weight');

    // console.log(this.part_id, 'weight', weight);

    if (weight) {
      /*
        "00e001v0" // light floor
        "00e002v0" // medium floor
        "00e003v0" // heavy floor
         "00e004v0" // light lower
        "00e005v0" // medium lower
        "00e006v0" // heavy lower
         "03e003v0" // light attach
        "03e003v1" // medium attach
        "03e003v2" // heavy attach
      */

      if (weight >= 4) {
        this.sound_attach = '03e003v2';
        this.sound_floor = '00e003v0';
      } else if (weight >= 2) {
        this.sound_attach = '03e003v1';
        this.sound_floor = '00e002v0';
      }
    }
    this.default = {
      junkView: game.mulle.getDirectorImage('CDDATA.CXT', this.partData.junkView),
      UseView: game.mulle.getDirectorImage('CDDATA.CXT', this.partData.UseView),
      UseView2: game.mulle.getDirectorImage('CDDATA.CXT', this.partData.UseView2),
      offset: this.partData.offset.clone()
    };
    console.log('default', this.default);
    this.morphs = null;
    if (this.partData.MorphsTo) {
      this.morphs = [];
      for (let i = 0; i < this.partData.MorphsTo.length; i++) {
        let partId = this.partData.MorphsTo[i];
        let partData = this.game.mulle.getPart(partId);

        // this.morphs.push(partData);

        this.morphs.push({
          partId: partId,
          partData: partData,
          junkView: game.mulle.getDirectorImage('CDDATA.CXT', partData.junkView),
          UseView: game.mulle.getDirectorImage('CDDATA.CXT', partData.UseView),
          UseView2: game.mulle.getDirectorImage('CDDATA.CXT', partData.UseView2),
          offset: partData.offset.clone()
        });
      }
    }

    // this.loadTexture( this.UseView.key, this.UseView.frame );

    this.setImage('junkView');
    this.inputEnabled = true;
    this.input.enableDrag(false);

    // this.input.useHandCursor = true;

    this.cursor = 'Grab';

    // this.cursorDefault = 'grab';
    // this.cursorGrab = 'grab';

    this.events.onInputOver.add(() => {
      this.game.mulle.cursor.current = 'Grab';
    });
    this.events.onInputOut.add(() => {
      this.game.mulle.cursor.current = null;
    });

    // dragging
    this.events.onDragStart.add(this.onGrab.bind(this));
    this.events.onDragStop.add(this.onDrop.bind(this));
    this.events.onDragUpdate.add(this.onMove.bind(this));
    if (!this.noPhysics) {
      this.game.physics.enable(this, Phaser.Physics.ARCADE);
      this.body.collideWorldBounds = true;
      this.body.onWorldBounds = new Phaser.Signal();
      this.body.onWorldBounds.add(this.onHitGround, this);
    }

    // console.log('part', this.part_id, this.partData);
  }

  /**
   * Set active image
   * @param {string} name junkView/UseView/UseView2
   */
  setImage(name) {
    /*
    if (this.frameName == name) return
     if (this.activeMorph != null) {
     } else {
       console.log('set frame', this.default[name])
       this.setFrame(this.default[name])
     }
    */

    var src = this.activeMorph != null ? this.morphs[this.activeMorph] : this.default;
    if (this.key === src[name].key && this.animations.frameName === src[name].name) return;
    if (this.key === src[name].key) {
      // console.log('same key', src[name].name, this.frameName);

      this.frameName = src[name].name;
    } else {
      this.loadTexture(src[name].key, src[name].name);
    }
    this.activeView = name;
    console.debug('set image', this.activeMorph, name, src[name].key, src[name].name);
  }
  onMove(game, pointer, x, y, point, fromStart) {
    // console.debug('move part', pointer, x, y, point, fromStart);

    /*
    for (var obj of window.game.world.children) {
       if (obj.hitArea) {
         if (obj.hitArea.contains( pointer.position.x - obj.position.x, pointer.position.y - obj.position.y)) {
           if (!obj.isOver) {
            // obj.onInputOverHandler();
            obj.events.onInputOver.dispatch(this, { dragging: this } );
            obj.isOver = true;
          }
         } else {
           if (obj.isOver) {
            // obj.onInputOutHandler();
            obj.events.onInputOut.dispatch(this, { dragging: this } );
            obj.isOver = null;
          }
         }
       }
     }
    */

    if (this.dropTargets) {
      for (var t of this.dropTargets) {
        // console.log(i, this.dropTargets[i]);

        if (!t[0].hitArea) continue;

        // var test = t[0].hitArea.clone();
        // test.offset( t[0].x, t[0].y );

        // game.debug.geom(test,'rgba(255,0,0,.6)');

        if (t[0].hitArea.contains(pointer.x - t[0].position.x, pointer.y - t[0].position.y)) {
          if (!t[0].isHovering) {
            t[0].cursor = t[0].cursorDrag;
            t[0].events.onInputOver.dispatch();
            t[0].isHovering = true;

            // this.game.mulle.cursor.add( t[0].cursorDrag );
          }
          break;
        } else {
          if (t[0].isHovering) {
            t[0].cursor = t[0].cursorHover;
            t[0].events.onInputOut.dispatch();
            t[0].isHovering = null;

            // this.game.mulle.cursor.remove( t[0].cursorDrag );
          }
        }
      }
    }
    if (!this.car) return;
    if (!this.justDetached && this.noAttach) {
      this.activeMorph = null;
      this.canAttach = false;
      if (this.activeView !== 'junkView') this.setImage('junkView');
      this.dragTicks++;
      if (this.dragTicks === 60) {
        this.game.mulle.actors.mulle.talk('03d04' + this.game.rnd.integerInRange(0, 2) + 'v0');
      }

      // console.log('no attach');

      return;
    }
    var offJnk = this.default.junkView.frame.regpoint;
    if (this.morphs) {
      for (var i = 0; i < this.morphs.length; i++) {
        var morph = this.morphs[i];

        // var partData = this.game.PartsDB[ partId ];

        var offUse = morph.UseView.frame.regpoint;
        var chk_x = x - offJnk.x + offUse.x;
        var chk_y = y - offJnk.y + offUse.y - morph.offset.y;
        var dst_x = this.car.x + morph.offset.x;
        var dst_y = this.car.y + morph.offset.y;
        var distance = this.game.math.distance(chk_x, chk_y, dst_x, dst_y);
        if (distance < this.snapDistance) {
          // console.log('snap to morph ' + i);

          if (!this.checkCanAttach(i)) continue;
          this.position.set(dst_x, dst_y);
          this.canAttach = true;
          this.activeMorph = i;
          this.setImage('UseView');
          if (!this.snapSound) {
            this.game.mulle.playAudio(this.sound_attach);
            this.snapSound = true;
          }
          return;
        }
      }
      if (this.snapSound) {
        this.game.mulle.playAudio(this.sound_attach);
        this.snapSound = false;
      }
      this.canAttach = false;
      this.activeMorph = null;
      this.setImage('junkView');
    } else {
      // var offJnk = this.game.offsets[ this.junkView.frame ];

      var offUse = this.default.UseView.frame.regpoint;
      var chk_x = x - offJnk.x + offUse.x;
      var chk_y = y - offJnk.y + offUse.y;
      var distance = this.game.math.distance(chk_x, chk_y, this.car.x, this.car.y);
      if (distance < this.snapDistance && this.checkCanAttach()) {
        this.setImage('UseView');
        this.position.set(this.car.x, this.car.y);
        this.canAttach = true;
        if (!this.snapSound) {
          this.game.mulle.playAudio(this.sound_attach);
          this.snapSound = true;
        }
      } else {
        this.setImage('junkView');
        this.canAttach = false;
        if (this.snapSound) {
          this.game.mulle.playAudio(this.sound_attach);
          this.snapSound = false;
        }
      }
    }
  }

  /**
   * Check if part can be attached
   * @param  {number} morph Morph ID
   * @return {boolean}
   */
  checkCanAttach(morph = null) {
    // this.noAttach = false;

    if (morph != null && this.morphs) {
      if (this.morphs[morph].partData.Requires) {
        for (var r in this.morphs[morph].partData.Requires) {
          if (this.car.usedPoints[this.morphs[morph].partData.Requires[r]]) {
            // console.log('used point', morph);
            return false;
          }
        }
      }
      if (this.morphs[morph].partData.Covers) {
        for (var r in this.morphs[morph].partData.Covers) {
          if (this.car.coveredPoints[this.morphs[morph].partData.Covers[r]]) {
            // console.log('covered point', morph, this.morphs[ morph ].partData.Covers[r] );
            return false;
          }
        }
      }
    }
    if (this.partData.Requires) {
      var hasPoint = false;
      for (var r in this.partData.Requires) {
        if (this.car.points[this.partData.Requires[r]]) {
          hasPoint = true;
          break;
        }
      }
      if (!hasPoint) return false;
      for (var r in this.partData.Requires) {
        if (this.car.usedPoints[this.partData.Requires[r]]) {
          return false;
        }
      }
      for (var r in this.partData.Covers) {
        if (this.car.coveredPoints[this.partData.Covers[r]]) {
          return false;
        }
      }
    }
    return true;
  }
  onGrab() {
    // console.debug('grab part', this);

    this.dragTicks = 0;
    this.bringToTop();

    // this.game.mulle.playAudio( this.sound_grab );

    this.groundSound = false;
    if (!this.noPhysics) {
      this.body.moves = false;
    }
    if (!this.car) return;
    if (this.morphs) {
      var ok = this.morphs.length;
      this.morphs.forEach((m, i) => {
        if (!this.checkCanAttach(i)) ok--;
      });
      this.noAttach = ok <= 0;
    } else {
      this.noAttach = !this.checkCanAttach();
    }
  }
  onDrop(obj, pointer) {
    // console.log('drop part', a, b, c);

    if (!this.justDetached) {
      var dist = Phaser.Point.distance(this.position, this.input.dragStartPoint);
      if (dist < 5) {
        this.playDescription();
      }
    }
    this.snapSound = false;
    if (!this.noPhysics) {
      this.body.moves = true;
      this.body.velocity.set(0);
    } else {
      this.game.mulle.playAudio(this.sound_floor);
    }
    this.justDetached = false;
    if (!this.noAttach && this.canAttach) {
      var partId = this.part_id;
      if (this.activeMorph !== null) partId = this.morphs[this.activeMorph].partId;
      console.log('attach part by drag', partId);
      this.events.onInputOut.dispatch();
      this.destroy();
      this.car.attach(partId);
      return;
    } else {
      this.activeMorph = null;
      this.setImage('junkView');
    }

    // drop action
    if (this.dropTargets) {
      for (var dt of this.dropTargets) {
        // console.log(i, this.dropTargets[i]);

        if (!dt[0].hitArea) continue;

        // var test = dt[0].hitArea.clone();
        // test.offset( dt[0].x, dt[0].y );

        // game.debug.geom(test,'rgba(255,0,0,.6)');

        if (dt[0].hitArea.contains(pointer.x - dt[0].position.x, pointer.y - dt[0].position.y)) {
          var g = this.game; // save this just for a second

          var ret = dt[1](this);
          if (ret) {
            g.mulle.cursor.remove(dt[0].cursor);
            dt[0].cursor = dt[0].cursorHover;
            return;
          }
        }
      }
    }

    // tween back
    if (this.dropRects) {
      var inBounds = false;
      for (var i = 0; i < this.dropRects.length; i++) {
        if (this.dropRects[i].contains(this.x, this.y)) {
          inBounds = true;
          break;
        }
      }
      if (!inBounds) {
        // console.log('out of bounds');

        var r = this.game.rnd.pick(this.dropRects);
        this.game.add.tween(this).to({
          x: r.randomX,
          y: r.randomY
        }, 1000, Phaser.Easing.Cubic.Out, true);
      }
    }

    // if (this.junkPile) {
    //   this.updateJunkPile()
    // }
  }
  onHitGround() {
    if (!this.groundSound) {
      this.game.mulle.playAudio(this.sound_floor);
      this.groundSound = true;

      // if (this.junkPile) {
      //   this.updateJunkPile()
      // }
    }
  }

  /**
   * Have Mulle talk about the part
   * @return {void}
   */
  playDescription() {
    if (!this.game.mulle.actors.mulle) return;
    this.game.mulle.actors.mulle.talk(this.partData.description);
  }
  getProperty(name) {
    return this.partData.getProperty(name);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleCarPart);

/***/ },

/***/ "./src/objects/sprite.js"
/*!*******************************!*\
  !*** ./src/objects/sprite.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util_directorAnimation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/directorAnimation */ "./src/util/directorAnimation.js");
/**
 * MulleSprite object
 * @module objects/sprite
 */



var spriteLookup = {};

/**
 * Mulle sprite, extension of phaser sprite
 * @extends Phaser.Sprite
 */
class MulleSprite extends Phaser.Sprite {
  /**
   * Create
   * @param	{Phaser.Game} game  Main game
   * @param	{number}      x     x coordinate
   * @param	{number}      y     y coordinate
   * @param	{string|null}      key   texture atlas key
   * @param	{string|null}      frame frame name/number
   * @return	{void}
   */
  constructor(game, x, y, key = null, frame = null) {
    super(game, x, y, key, frame);
    this.regPoint = new PIXI.Point(0, 0);

    /**
     * Director movie
     * @type {string}
     */
    this.movie = '';

    // console.log('MulleSprite', this)

    /*
    this.events.onInputOver.add( () => {
       this.game.mulle.cursor.current = this.cursor
     } )
    */

    // this.events.onInputOut.add( this.cursorOut, this )

    // this._cursor = null
  }

  /*
  getCursor() {
    return false
  }
   cursorOver() {
    // console.log('cursor in')
     // var c = this.getCursor()
    // if (c) this.game.canvas.className = 'cursor-' + c
     // if (this.cursor) this.game.canvas.className = 'cursor-' + this.cursor
     if (this.cursor) {
      this.game.mulle.cursor.setCursor(this, this.cursor)
    }
   }
   cursorOut(){
    // console.log('cursor out')
    // if (this.cursor) this.game.canvas.className = ''
    if (this.cursor) {
      this.game.mulle.cursor.setCursor(this, null)
    }
  }
  */

  /**
   * Update pivot point, called internally
   * @return {void}
   */
  updatePivot() {
    // console.log('regpoint update', this, this._frame.regpoint)

    if (!this._frame) {
      console.warn('no frame');
      return;
    }
    if (!this._frame.regpoint) {
      console.warn('no regpoint', this._frame, this.key, this._frame.name);
      return;
    }
    this.regPoint.set(this._frame.regpoint.x, this._frame.regpoint.y); // new PIXI.Point( this._frame.regpoint.x, this._frame.regpoint.y )

    this.pivot.set(this.regPoint.x, this.regPoint.y);

    // this.anchor = new PIXI.Point( this._frame.regpoint.x / this.w, this._frame.regpoint.y / this.h )
  }

  /**
   * Override phaser setFrame function
   * @param {string} frame
   */
  setFrame(frame) {
    super.setFrame(frame);
    this.updatePivot();

    // console.log('setFrame hijack')
  }
  setFrameId(val) {
    // console.log('frame id', this)

    var f = this.game.mulle.findFrameById(val);
    if (f) {
      this.loadTexture(f[0], f[1]);

      // console.log('frame found', val, f[0], f[1])

      return true;
    } else {
      // console.warn('frame not found', val)

      return false;
    }
  }

  /**
   * Set sprite frame by Director member
   * Deprecated, use DirectorHelper.sprite
   * @param {string} dir
   * @param {number} num
   * @deprecated
   */
  setDirectorMember(dir, num) {
    if (dir && num && spriteLookup[dir + '_' + num]) {
      this.loadTexture(spriteLookup[dir + '_' + num][0], spriteLookup[dir + '_' + num][1]);
      return;
    }
    var keys = this.game.cache.getKeys(Phaser.Cache.IMAGE);
    for (var k in keys) {
      var img = this.game.cache.getImage(keys[k], true);
      var frames = img.frameData.getFrames();
      for (var f in frames) {
        if (!num) {
          if (frames[f].dirNum === dir || frames[f].dirName === dir) {
            this.loadTexture(img.key, frames[f].name);
            return true;
          }
        } else {
          if (frames[f].dirFile === dir && (frames[f].dirNum === num || frames[f].dirName === num)) {
            spriteLookup[dir + '_' + num] = [img.key, frames[f].name];
            this.loadTexture(img.key, frames[f].name);
            return true;
          }
        }
      }
    }
    console.error('set member fail', dir, num);
    return false;
  }
  loadDirectorTexture(name) {
    const [key, frame] = this.game.director.getNamedImage(name);
    this.loadTexture(key, frame);
  }

  /**
   * Add animation with director members instead of frames
   * @param {string}  name           [description]
   * @param {array}   members        [description]
   * @param {number}  fps            [description]
   * @param {boolean}    loop           [description]
   * @param {boolean}    killOnComplete [description]
   * @return {Phaser.Animation}
   */
  addAnimation(name, members, fps, loop, killOnComplete = false) {
    var frames = [];
    members.forEach(v => {
      frames.push(this.game.mulle.getDirectorImage(v[0], v[1]).name);
    });
    console.debug('[sprite-anim]', 'animation added', name, frames);
    return this.animations.add(name, frames, fps, loop, killOnComplete);
  }

  /**
   * Add animation with director offset frames
   * @param {string} name Animation name
   * @param {int} firstFrame First frame number
   * @param {array} frames Frames relative to first frame
   * @param {boolean} loop Loop the animation
   * @returns {Phaser.Animation}
   */
  addDirectorAnimation(name, firstFrame, frames, loop = false) {
    const [key, frames_offset] = _util_directorAnimation__WEBPACK_IMPORTED_MODULE_0__["default"].createAnimation(this.game, this.movie, firstFrame, frames);
    if (!this.key) {
      console.debug('Set sprite key to', key);
      this.key = key;
    } else if (this.key !== key) {
      console.error('Tried to add animation using frames from a different sprite sheet');
    }
    return this.animations.add(name, frames_offset, 10, loop);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleSprite);

/***/ },

/***/ "./src/objects/subtitle.js"
/*!*********************************!*\
  !*** ./src/objects/subtitle.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


class MulleSubtitle {
  constructor(game) {
    this.game = game;
    this.textLines = [];
    this.lastLine = null;
    var s = '- ';
    this.database = {
      swedish: {},
      english: {}
    };
    this.setLines('20d124v0', 'swedish', [s + 'Bra hjul, på riktiga fälgar.'], 'mulle');
    this.setLines('03d012v0', 'swedish', [s + 'Inga hjul, inge kul, inge snurr och inge rull.'], 'mulle');
    this.setLines('03d013v0', 'swedish', [s + 'Det verkar som om liksom själva motorn fattas.'], 'mulle');
    this.setLines('03d014v0', 'swedish', [s + 'Batteriet som ska ge ström, var är det?'], 'mulle');
    this.setLines('03d015v0', 'swedish', [s + 'Soppa saknas!', s + 'Tanken är inte bara tom,', s + 'den finns ju inte ens!'], 'mulle');
    this.setLines('03d016v0', 'swedish', [s + 'Hördu, här fattas ju växellådan!', s + 'Det är ju den som ser till att motorn kan driva hjulen.'], 'mulle');
    this.setLines('03d017v0', 'swedish', [s + 'Ratten kallas femte hjulet.', s + 'Med den styr man i sol som mulet.'], 'mulle');
    this.setLines('03d018v0', 'swedish', [s + 'Stopp, stopp stopp! Hur ska du bromsa?'], 'mulle');
    this.setLines('20d124v0', 'english', [s + 'Good wheels, on real rims.'], 'mulle');
    this.setLines('03d012v0', 'english', [s + 'No wheels, no fun, no spin, no roll.'], 'mulle');
    this.setLines('03d013v0', 'english', [s + 'It seems as if the engine itself is missing.'], 'mulle');
    this.setLines('03d014v0', 'english', [s + "The battery that's gonna supply power, where's that?"], 'mulle');
    this.setLines('03d015v0', 'english', [s + 'No juice!', s + "The tank isn't just empty,", s + "it doesn't exist!"], 'mulle');
    this.setLines('03d016v0', 'english', [s + 'Hey! The transmission is missing!', s + "It's the one making it possible for the engine to spin the wheels."], 'mulle');
    this.setLines('03d017v0', 'english', [s + 'The steering wheel', s + 'is called the fifth wheel.', s + "With it, you steer whether it's sunny or cloudy."], 'mulle');
    this.setLines('03d018v0', 'english', [s + 'Stop, stop stop! How are you going to brake?'], 'mulle');
    this.actorColors = {
      'mulle': '#CDE7CF'
    };
  }
  makeObject() {
    if (this.textObject) this.textObject.destroy();
    this.textObject = new Phaser.Text(this.game, 0, 0, '', {
      font: '20px arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: 'rgba(0, 0, 0, .6)',
      align: 'center',
      boundsAlignH: 'center',
      boundsAlignV: 'bottom'
    });
    this.textObject.setTextBounds(0, 420, 640, 40);
    this.textObject.lineSpacing = -8;
    this.game.add.existing(this.textObject);
    console.log('add text', this.textObject);
  }
  showLine(text, actor) {
    if (!text) {
      console.error('subtitle line with no text');
      return false;
    }
    if (!this.textObject) {
      // this.game.mulle.subtitle = new MulleSubtitle( this.game );
      // this.game.add.existing( this.game.mulle.subtitle );
      this.makeObject();
    }
    console.debug('[subtitle]', text, actor);
    var k = this.textLines.push({
      text: text,
      time: Date.now(),
      actor: actor
    });
    var del = 1000 * Math.log(text.length);

    // console.log('delay', text, text.length, del);

    this.game.time.events.add(del, () => {
      console.log('remove line', k);
      this.textLines.splice(0, 1);
      this.refresh();
    });

    // if( this.textLines.length >= 3 ) this.textLines.splice(0, 1);

    this.refresh();
    this.lastLine = Date.now();
    return true;
  }
  getData(file, language) {
    if (!language) language = this.game.mulle.user ? this.game.mulle.user.language : this.game.mulle.defaultLanguage;
    if (!this.database[language] || !this.database[language][file]) return false;
    return this.database[language][file];
  }
  setLines(file, language, lines, actor) {
    if (!this.database[language]) return false;
    console.debug('[sub-add]', file, language, lines, actor);
    this.database[language][file] = {
      lines: lines,
      actor: actor
    };
    return true;
  }
  refresh() {
    this.textObject.clearColors();
    let text = '';
    for (let i in this.textLines) {
      let line = this.textLines[i].text;

      /*
      if (this.textLines[i].actor && this.actorColors[ this.textLines[i].actor ]) {
        this.textObject.addColor(this.actorColors[ this.textLines[i].actor ], text.length)
      } else {
        this.textObject.addColor('#ffffff', text.length)
      }
      */

      /*
      var hReg = /\{([A-Za-z0-9]+)\}/g
       var hlMatch
      while((hlMatch = hReg.exec(this.textLines[i].text)) !== null) {
         console.log('hlMatch', hlMatch)
         this.textObject.addColor('#88B14E', text.length + hlMatch.index)
         this.textObject.addColor('#FFFFFF', text.length + hlMatch.index + hlMatch[0].length)
       }
      */

      line = line.replace(/\{([A-Za-z0-9\s]+)\}/g, (match, group, index) => {
        // console.log('group', match, group, index)
        this.textObject.addColor('#88B14E', text.length - i + index);
        this.textObject.addColor('#FFFFFF', text.length - i + index + group.length);
        return group;
      });
      text += line;
      text += '\n';
    }
    text = text.trim('\n');
    this.textObject.text = text;
    this.textObject.visible = text !== '';
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleSubtitle);

/***/ },

/***/ "./src/scenes/album.js"
/*!*****************************!*\
  !*** ./src/scenes/album.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_TextInput__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/TextInput */ "./src/objects/TextInput.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../objects/button */ "./src/objects/button.js");
/* harmony import */ var _objects_MulleFileBrowser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../objects/MulleFileBrowser */ "./src/objects/MulleFileBrowser.js");
/* harmony import */ var _util_LoadSaveCar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../util/LoadSaveCar */ "./src/util/LoadSaveCar.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");
/* global Phaser */









/**
 * Album UI
 */
class AlbumState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  /**
   * Create a sprite with director position
   * @param {string} dir Director movie
   * @param {string|int} num Director number or name
   * @returns {Phaser.Sprite}
   */
  positionSprite(dir, num) {
    const image = this.game.mulle.getDirectorImage(dir, num);
    const x = 320 - image.frame.regpoint.x;
    const y = 240 - image.frame.regpoint.y;
    return new Phaser.Sprite(this.game, x, y, image.key, image.name);
  }
  init(mode) {
    this.mode = mode;
  }
  preload() {
    this.DirResource = '06.DXR';
    super.preload();
    this.game.load.pack('album', 'assets/album.json', null, this);
    this.game.load.pack('fileBrowser', 'assets/fileBrowser.json', null, this);
  }
  buildPages() {
    let pageNumSprite;
    for (let page = 1; page <= 12; page++) {
      if (this.loadSave.isSaved(page)) {
        // Is a car saved on this page?
        pageNumSprite = this.positionSprite(this.DirResource, page + 60);
      } else {
        pageNumSprite = this.positionSprite(this.DirResource, page + 48);
      }
      if (page === this.selectedPage) {
        if (this.pagenumSpriteSelected) {
          this.pagenumSpriteSelected.destroy();
        }
        this.pagenumSpriteSelected = this.positionSprite(this.DirResource, page + 72);
        this.game.add.existing(this.pagenumSpriteSelected);
      } else {
        const button = _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"].fromRectangle(this.game, pageNumSprite.x, pageNumSprite.y, 40, 40, {
          click: () => {
            this.setPage(page);
          }
        });
        this.game.add.existing(button);
      }
      this.game.add.existing(pageNumSprite);
    }
  }

  /**
   * Select album page
   * @param page
   */
  setPage(page) {
    this.selectedPage = page;
    this.game.mulle.playAudio('06e003v0');
    this.showSavedCar(page);
    this.buildPages();
  }

  /**
   * Show a car in the album
   */
  albumCar(parts = null) {
    if (this.albumCarImage) {
      this.albumCarImage.destroy();
    }
    this.albumCarImage = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 320, 240, parts, true, false);
    this.background_layer.add(this.albumCarImage);
  }

  /**
   * Picture in the left corner ready for pasting
   */
  showPasteFrame() {
    this.imageFrame = new _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 67, 401, {
      imageDefault: [this.DirResource, 159],
      click: () => {
        this.pasteCar();
      }
    });
    this.game.add.existing(this.imageFrame);
    this.pasting_car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 0, 400, null, true, false);
    this.pasting_car.height = this.pasting_car.height / 2;
    this.pasting_car.width = this.pasting_car.width / 2;
    this.game.add.existing(this.pasting_car);
  }

  /**
   * Paste a car in the album
   */
  pasteCar() {
    this.imageFrame.destroy();
    this.imageFrame.displaySprite.visible = false;
    this.pasting_car.destroy();
    this.albumCar();
    this.game.mulle.user.Car.Name = this.carName.value();
    this.loadSave.saveCurrentCar(this.selectedPage);
  }

  /**
   * Build the saved car
   * @param {int} page Album page
   */
  buildSavedCar(page) {
    let partId;
    const [parts, medals, name] = this.loadSave.loadCar(page);
    // Place redundant parts in the junk yard
    for (partId of this.game.mulle.user.Car.Parts) {
      if (!(partId in parts)) {
        if (this.game.mulle.PartsDB[partId].master) {
          // Un-morph parts
          partId = this.game.mulle.PartsDB[partId].master;
        }

        // Place the part in the junk yard
        this.game.mulle.user.addPart('Pile1', partId, null, true);
      }
    }
    this.removeParts(parts); // Remove the parts from wherever they are
    this.game.mulle.user.Car.Parts = [];
    for (partId of parts) {
      this.game.mulle.user.Car.Parts.push(partId);
    }
    this.game.mulle.user.Car.Medals = medals;
    this.game.mulle.user.Car.Name = name;
    this.game.mulle.user.Car.updateStats();
    this.close();
  }

  /**
   * Show the saved car in the album
   * @param {int} page Album page
   */
  showSavedCar(page) {
    if (this.loadSave.isSaved(page)) {
      const [parts, medals, name] = this.loadSave.loadCar(page);
      this.albumCar(parts);
      this.parts = parts;
      this.carName.text(name);
      this.showMedals(medals);
      if (this.mode === 'load') this.fetchButton.show();
    } else {
      if (this.albumCarImage) {
        this.albumCarImage.destroy();
      }
      if (this.mode === 'load') {
        this.fetchButton.hide();
      }
      if (this.medals) {
        this.medals.destroy(true);
      }
    }
  }

  /**
   * Remove a part from junk piles, shop floor and yard
   * @param {int} partId Part id
   */
  removePart(partId) {
    if (this.game.mulle.PartsDB[partId].master) {
      // Un-morph parts
      partId = this.game.mulle.PartsDB[partId].master;
    }
    for (const pile in this.game.mulle.user.Junk) {
      if (partId in this.game.mulle.user.Junk[pile]) {
        console.log(`Remove part ${partId} from ${pile}`);
        delete this.game.mulle.user.Junk[pile][partId];
      }
    }
  }

  /**
   * Remove multiple parts from junk piles, shop floor and yard
   * @param {array} parts Array with part ids
   */
  removeParts(parts) {
    for (const part of parts) {
      this.removePart(part);
    }
  }
  importCar() {
    this.browser = new _objects_MulleFileBrowser__WEBPACK_IMPORTED_MODULE_5__["default"](this.game, data => {
      this.loadSave.importCar(this.selectedPage, data);
      this.showSavedCar(this.selectedPage);
    });
    this.album_ui.add(this.browser);
  }
  showMedals(medals) {
    if (this.medals) {
      this.medals.destroy(true);
    }
    this.medals = this.game.add.group();
    let count = 1;
    for (const medal of medals) {
      const {
        key,
        frame
      } = this.game.mulle.getDirectorImage(this.DirResource, 20 + medal);
      const sprite = new Phaser.Sprite(this.game, 550, 55 * count, key, frame.name);
      this.medals.add(sprite);
      count++;
    }
  }
  create() {
    this.game.mulle.addAudio('album');
    super.create();
    this.loadSave = new _util_LoadSaveCar__WEBPACK_IMPORTED_MODULE_6__["default"](this.game);
    this.background_layer = this.game.add.group();
    this.album_ui = this.game.add.group();
    this.background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 320, 240);
    this.background.setDirectorMember(this.DirResource, 93);
    this.background_layer.add(this.background);

    // Car name
    this.name_input = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_7__["default"].sprite(this.game, 210, 427, this.DirResource, 101, false, false);
    this.album_ui.add(this.name_input);
    this.carName = new _objects_TextInput__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, this.name_input.x + 5, this.name_input.y + 5, 203, 20);
    this.carName.id('car_name');
    if (this.mode === 'save') {
      this.game.mulle.playAudio('06e002v0', () => {
        this.game.mulle.playAudio('06d001v0');
      });
      this.showPasteFrame();
      this.export_button = new _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 487, 413, {
        imageDefault: ['06.DXR', 164],
        click: () => {
          console.warn('Export car not implemented');
        }
      });
      this.game.add.existing(this.export_button);
    } else {
      // Show picture
      this.game.mulle.playAudio('07d001v0');
      this.fetchButton = new _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 76, 400, {
        imageDefault: [this.DirResource, 162],
        click: () => {
          this.buildSavedCar(this.selectedPage);
        }
      });
      this.album_ui.add(this.fetchButton);
      this.carName.input.readOnly = true;
      this.importButton = new _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 487, 413, {
        imageDefault: ['06.DXR', 161],
        click: () => {
          this.importCar();
        }
      });
      this.album_ui.add(this.importButton);
    }
    this.close_button = new _objects_button__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 554, 414, {
      imageDefault: ['06.DXR', 153],
      click: () => {
        console.log('Close album');
        this.close();
      }
    });
    this.album_ui.add(this.close_button);
    this.setPage(1);
  }
  close() {
    this.game.state.start('garage');
  }
  shutdown(game) {
    this.cutscene = 83;
    this.carName.remove();
    super.shutdown(game);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AlbumState);

/***/ },

/***/ "./src/scenes/base.js"
/*!****************************!*\
  !*** ./src/scenes/base.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _struct_savedata__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../struct/savedata */ "./src/struct/savedata.js");
/**
 * MulleState base state
 * @module MulleState
 */





/**
 * MulleState, extension of phaser state
 * @extends Phaser.State
 */
class MulleState extends Phaser.State {
  preload() {
    if (this.game.mulle.activeCutscene) {
      console.log('cutscene', this.key, this.game.mulle.activeCutscene);
      this.cutscene = new _objects_sprite__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, 320, 240);
      this.cutscene.setDirectorMember('00.CXT', this.game.mulle.activeCutscene);
      this.game.add.existing(this.cutscene);
      this.progress = game.add.graphics(0, 0);
    }
  }
  loadRender() {
    if (this.progress) {
      var p = this.game.load.progressFloat / 100;
      this.progress.clear();
      this.progress.beginFill('0x333333', 1);
      this.progress.drawRect(640 / 2 - 150, 400, 300, 32);
      this.progress.endFill();
      this.progress.beginFill('0x65C265', 1);
      this.progress.drawRect(640 / 2 - 150, 400, p * 300, 32);
      this.progress.endFill();
      this.progress.beginFill('0x65C265', 1);
    }
  }

  /*
  loadUpdate() {
    console.log('loadUpdate', this.key)
  }
  */

  create() {
    if (this.cutscene) {
      console.log('destroy cutscene');
      this.cutscene.destroy();
      this.game.mulle.activeCutscene = null;
      this.progress.destroy();
    }
    if (!this.game.mulle.user) {
      const userKeys = Object.keys(this.game.mulle.UsersDB);
      if (userKeys.length > 0) {
        this.game.mulle.user = this.game.mulle.UsersDB[userKeys[0]];
      } else {
        // Create a default user for first-time play
        this.game.mulle.user = new _struct_savedata__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, {
          UserId: 'Player',
          Car: {
            Parts: []
          },
          Medals: [],
          Inventory: {
            DrivenTimes: {
              Motor: 0,
              Sail: 0,
              Oar: 0
            }
          }
        });
        this.game.mulle.UsersDB['Player'] = this.game.mulle.user;
      }

      // if( process.env.NODE_ENV !== "production" ){

      window.location.hash = this.key;
      this.game.mulle.net.send({
        name: this.game.mulle.user.UserId
      });
      this.game.mulle.net.send({
        parts: this.game.mulle.user.Car.Parts
      });
    }

    // this.game.canvas.className = '';

    this.game.mulle.cursor.reset();

    // console.log('prelaunch', this.key);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleState);

/***/ },

/***/ "./src/scenes/carshow.js"
/*!*******************************!*\
  !*** ./src/scenes/carshow.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");






class CarShowState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();

    // game.load.pack('04.DXR', 'assets/04.DXR/pack.json', null, this);

    this.game.load.pack('carshow', 'assets/carshow.json', null, this);
  }
  create() {
    super.create();
    this.car = null;
    this.game.mulle.addAudio('carshow');
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('94.DXR', 200);
    this.game.add.existing(background);
    var judge = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 155, 210, 'judge');
    judge.talkAnimation = 'talk';
    judge.silenceAnimation = 'idle';
    this.game.add.existing(judge);
    this.game.mulle.actors.judge = judge;
    var score = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 177, 93);
    score.setDirectorMember('94.DXR', 17);
    this.game.add.existing(score);
    score.visible = false;
    var mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 89, 337, 'mulleDefault');
    mulle.talkAnimation = 'talkRegular';
    mulle.silenceAnimation = 'idle';
    this.game.add.existing(mulle);
    this.game.mulle.actors.mulle = mulle;
    mulle.animations.play('lookLeft');
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 321, 288, null, true, false);
    this.game.add.existing(this.car);
    this.game.mulle.playAudio('94e001v0');

    // begin

    const medal = this.game.mulle.SetWhenDone.Medals[0];
    var funnyFactor = this.game.mulle.user.Car.getProperty('funnyfactor', 0);
    var rating;
    if (funnyFactor < 2) {
      rating = 1;
    } else if (funnyFactor < 3) {
      rating = 2;
    } else if (funnyFactor < 5) {
      rating = 3;
    } else if (funnyFactor < 7) {
      rating = 4;
    } else {
      rating = 5;
    }

    // 94d003v0 - welcome
    // 94d004v0 - 5
    // 94d005v0 - 4
    // 94d006v0 - 3
    // 94d007v0 - 2
    // 94d008v0 - 1
    // 94d009v0 - medalj

    var scoreTalk = {
      1: '94d008v0',
      2: '94d007v0',
      3: '94d006v0',
      4: '94d005v0',
      5: '94d004v0'
    };
    console.log('funnyfactor', funnyFactor, rating);
    judge.displayScore = () => {
      judge.talkAnimation = 'talkScore';
      console.log('display score');

      // display score
      score.setDirectorMember('94.DXR', 17 + (rating - 1));
      score.visible = true;

      // say score
      judge.talk(scoreTalk[rating], () => {
        // end
        console.log('end');
        this.game.state.start('world');
      });
      if (funnyFactor > 8 && !this.game.mulle.user.Car.hasMedal(medal)) {
        this.game.mulle.user.Car.addMedal(medal);
      }
    };

    // intro
    judge.talkAnimation = 'talk';
    judge.talk('94d003v0', () => {
      console.log('raise score');

      // show score
      setTimeout(() => {
        judge.animations.play('raiseScore');
      }, 500);
    });

    // ;

    console.log('Car show');
  }
  shutdown() {
    this.game.mulle.stopAudio('94e001v0');
    this.game.mulle.actors.mulle = null;
    this.game.mulle.actors.judge = null;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CarShowState);

/***/ },

/***/ "./src/scenes/diploma.js"
/*!*******************************!*\
  !*** ./src/scenes/diploma.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/boat/lingo */ "./src/objects/boat/lingo.js");
/**
 * Diploma scene - shows the player's achievements and medals.
 * @module scenes/diploma
 */





class DiplomaState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('diploma', 'assets/diploma.json', null, this);
    this.game.load.pack('sailing', 'assets/sailing.json', null, this);
    this.game.load.pack('cutscenes', 'assets/cutscenes.json', null, this);
    this.game.load.pack('shared', 'assets/shared.json', null, this);
  }
  create() {
    super.create();
    this.game.mulle.addAudio('shared');
    this.game.mulle.worldState = this;

    // Background
    this.background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    this.background.setDirectorMember('08.DXR', 31);
    this.game.add.existing(this.background);

    // Diploma paper
    this.diploma = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    this.diploma.setDirectorMember('08.DXR', 71);
    this.game.add.existing(this.diploma);

    // Player name
    const user = this.game.mulle.user;
    this.nameText = this.game.add.text(320, 180, user.UserId || 'Player', {
      font: '24px Arial',
      fill: '#000000',
      align: 'center'
    });
    this.nameText.anchor.set(0.5);

    // Medals earned
    const medals = user.Car && user.Car.Medals ? user.Car.Medals : [];
    let y = 240;
    medals.forEach((medalId, i) => {
      const medalName = this.getMedalName(medalId);
      const text = this.game.add.text(320, y + i * 30, medalName, {
        font: '18px Arial',
        fill: '#8B4513',
        align: 'center'
      });
      text.anchor.set(0.5);
    });

    // Stats
    const stats = ['Distance sailed: ' + Math.round((user.Car?.totalDistance || 0) / 100) + ' km', 'Missions completed: ' + (user.CompletedMissions?.length || 0), 'Money earned: ' + (user.Money || 0) + ' kr'];
    stats.forEach((stat, i) => {
      const text = this.game.add.text(320, 350 + i * 25, stat, {
        font: '16px Arial',
        fill: '#333333',
        align: 'center'
      });
      text.anchor.set(0.5);
    });

    // Continue button
    this.continueRect = this.game.add.graphics(0, 0);
    this.continueRect.beginFill(0x0066CC);
    this.continueRect.drawRect(270, 430, 100, 40);
    this.continueRect.endFill();
    this.continueRect.inputEnabled = true;
    this.continueRect.events.onInputUp.add(() => {
      this.game.state.start('yard');
    }, this);
    const continueText = this.game.add.text(320, 450, 'CONTINUE', {
      font: '18px Arial',
      fill: '#FFFFFF',
      align: 'center'
    });
    continueText.anchor.set(0.5);
    this.game.mulle.cursor.reset();
  }
  getMedalName(medalId) {
    const names = {
      1: 'Navigator Medal',
      2: 'Racing Medal',
      3: 'Explorer Medal',
      4: 'Rescue Medal',
      5: 'Fishing Medal',
      6: 'Trading Medal',
      7: 'Speed Medal',
      8: 'Endurance Medal',
      9: 'Master Sailor Medal'
    };
    return names[medalId] || 'Medal ' + medalId;
  }
  shutdown() {
    if (this.background) this.background.destroy();
    if (this.diploma) this.diploma.destroy();
    if (this.nameText) this.nameText.destroy();
    if (this.continueRect) this.continueRect.destroy();
    if (this.continueText) this.continueText.destroy();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DiplomaState);

/***/ },

/***/ "./src/scenes/dorisdigital.js"
/*!************************************!*\
  !*** ./src/scenes/dorisdigital.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");





/*
 * 90e001v0: Game sound
 * 90d001v0: Doris intro by narrator
 * 90d003v0: After the game
 * 90d007v0: Revisit
 */

class DorisDigitalState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('dorisdigital', 'assets/dorisdigital.json', null, this);
  }
  create() {
    super.create();
    this.DirResource = '90.DXR';
    this.game.mulle.addAudio('dorisdigital');
    const background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember(this.DirResource, 1);
    this.game.add.existing(background);
    const gameBlink = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    gameBlink.setDirectorMember(this.DirResource, 18);
    this.game.add.existing(gameBlink);
    gameBlink.addAnimation('game', [['90.DXR', 18], ['90.DXR', 19]], 12, true);
    gameBlink.play('game');
    const bgSnd = this.game.mulle.playAudio('90e001v0');
    console.log('given part', 306);
    if (!this.game.mulle.user.hasPart(306)) {
      this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 446, 368, null, true, false);
      this.game.add.existing(this.car);
      const part = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 82, 373 - 47);
      part.setDirectorMember('CDDATA.CXT', 1003);
      this.game.add.existing(part);
      const buffa = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 275, 327, 'buffa');
      buffa.animations.play('idle');
      this.game.add.existing(buffa);
      this.game.mulle.actors.buffa = buffa;
      this.game.mulle.user.addPart('yard', 306);

      // narrator
      this.game.mulle.playAudio('90d001v0', () => {
        // After game
        this.game.mulle.playAudio('90d003v0', () => {
          console.log('return to world');
          this.game.state.start('world');
          bgSnd.stop();
        });
      });
    } else {
      // Revisit
      this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 446, 368, null, true, true);
      this.game.add.existing(this.car);
      this.game.mulle.playAudio('90d007v0', () => {
        bgSnd.stop();
        this.game.state.start('world');
      });
    }
  }
  shutdown() {
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DorisDigitalState);

/***/ },

/***/ "./src/scenes/figgeferrum.js"
/*!***********************************!*\
  !*** ./src/scenes/figgeferrum.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");
/* harmony import */ var _util_blinkThing__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/blinkThing */ "./src/util/blinkThing.js");
/* harmony import */ var _objects_SubtitleLoader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../objects/SubtitleLoader */ "./src/objects/SubtitleLoader.js");


// import MulleBuildCar from '../objects/buildcar'



class FiggeFerrumState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('figgeferrum', 'assets/figgeferrum.json', null, this);
    this.subtitles = new _objects_SubtitleLoader__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, 'figgeferrum', ['english', 'swedish']);
    this.subtitles.preload();
  }
  create() {
    super.create();
    this.game.mulle.addAudio('figgeferrum');
    this.subtitles.load();
    this.car = null;
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('92.DXR', 1);
    this.game.add.existing(background);
    var mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 95, 300, 'mulleDefault');
    mulle.animations.play('idle');
    mulle.talkAnimation = 'talkRegular';
    mulle.silenceAnimation = 'idle';
    this.game.add.existing(mulle);
    this.game.mulle.actors.mulle = mulle;
    var buffa = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 271, 347, 'buffa');
    buffa.animations.play('idle');
    this.game.add.existing(buffa);
    this.game.mulle.actors.buffa = buffa;

    // this.car = new MulleBuildCar(this.game, 368, 240, null, true, true);
    // this.game.add.existing(this.car);

    var figgeBody = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 102, 292);
    figgeBody.setDirectorMember('92.DXR', 16);
    this.game.add.existing(figgeBody);
    var figgeHead = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 102, 292, 'figge');
    this.game.add.existing(figgeHead);
    this.game.mulle.actors.figge = figgeHead;

    // 92e001v0 - gas
    // 92e002v0 - bg
    // 92d001v0 - intro

    // 92d002v0 - nu har en salka sprungit
    // 92d003v0 - nää int har jag sett din hund
    // 92d004v0 - jo visst
    // 92d005v0 - tack du mulle
    // 92d006v0 - tack ska du ha

    // 92d007v0 - mulle intro talk

    this.game.mulle.playAudio('92e002v0');
    if (this.game.mulle.user.Car.hasCache('#ExtraTank')) {
      // 92d007v0 - mulle intro talk
      this.game.mulle.actors.mulle.talk('92d007v0', () => {
        this.game.state.start('world');
      });
      return;
    }
    console.log('last session', this.game.mulle.lastSession);

    // 92d002v0 - nu har en salka sprungit
    this.game.mulle.actors.figge.talk('92d002v0', () => {
      if (this.game.mulle.user.Car.hasCache('#Dog')) {
        // 92d004v0 - jo visst
        this.game.mulle.actors.mulle.talk('92d004v0', () => {
          var salka = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 200, 363, 'salkaLeft');
          salka.animations.play('idle');
          this.game.add.existing(salka);

          // 92d005v0 - tack du mulle
          this.game.mulle.actors.figge.talk('92d005v0', () => {
            var gas = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 168, 413);
            gas.setDirectorMember('92.DXR', 11);
            this.game.add.existing(gas);

            // 92d006v0 - tack ska du ha
            this.game.mulle.actors.mulle.talk('92d006v0', () => {
              this.game.mulle.user.Car.addCache('#ExtraTank');
              this.game.mulle.lastSession.carFuel = this.game.mulle.lastSession.carMaxFuel;
              new _util_blinkThing__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, gas, () => {
                this.game.state.start('world');
              }, this);
            });
          });
        });
      } else {
        // 92d003v0 - nää int har jag sett din hund
        this.game.mulle.actors.mulle.talk('92d003v0', () => {
          this.game.state.start('world');
        });
      }
    });
  }
  shutdown() {
    this.game.mulle.stopAudio('92e002v0');
    this.game.mulle.actors.figge = null;
    this.game.mulle.actors.mulle = null;
    this.game.mulle.actors.buffa = null;
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FiggeFerrumState);

/***/ },

/***/ "./src/scenes/garage.js"
/*!******************************!*\
  !*** ./src/scenes/garage.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");
/* harmony import */ var _objects_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../objects/button */ "./src/objects/button.js");





class GarageState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    this.game.load.pack('garage', 'assets/garage.json', null, this);
  }
  create() {
    this.game.mulle.addAudio('garage');

    // Background: 03.DXR member 1 = 03b001v1 (640x480)
    const background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('03.DXR', 1);
    this.game.add.existing(background);

    // Border frame (same as other scenes: ch113-116 in score)
    const border = this.game.add.graphics(0, 0);
    border.lineStyle(4, 0x888888, 1);
    border.moveTo(0, 0);
    border.lineTo(640, 0);
    border.lineTo(640, 480);
    border.lineTo(0, 480);
    border.lineTo(0, 0);

    // Mulle body sprite (simplified - no complex animation charts yet)
    this.mulle = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 300);
    this.mulle.setDirectorMember('03.DXR', 1);
    this.game.add.existing(this.mulle);

    // Navigation hotspots (invisible clickable areas)
    // rect(left, top, right, bottom) -> frame label
    this.hotspots = [{
      rect: [29, 0, 124, 300],
      target: 'yard',
      label: 'Quay',
      cursor: 'left'
    },
    // Left edge -> 04.DXR
    {
      rect: [131, 43, 206, 307],
      target: 'junk',
      label: 'Shelf1',
      cursor: 'forward'
    },
    // Shelf1
    {
      rect: [207, 40, 288, 314],
      target: 'junk',
      label: 'Shelf2',
      cursor: 'forward'
    }, {
      rect: [289, 34, 380, 322],
      target: 'junk',
      label: 'Shelf3',
      cursor: 'forward'
    }, {
      rect: [381, 31, 479, 329],
      target: 'junk',
      label: 'Shelf4',
      cursor: 'forward'
    }, {
      rect: [480, 28, 579, 335],
      target: 'junk',
      label: 'Shelf5',
      cursor: 'forward'
    }, {
      rect: [580, 25, 640, 343],
      target: 'junk',
      label: 'Shelf6',
      cursor: 'forward'
    }];
    this.hotspotGfx = [];
    this.hotspots.forEach(hs => {
      const gfx = this.game.add.graphics(0, 0);
      gfx.beginFill(0x00ff00, 0);
      gfx.drawRect(hs.rect[0], hs.rect[1], hs.rect[2] - hs.rect[0], hs.rect[3] - hs.rect[1]);
      gfx.endFill();
      gfx.inputEnabled = true;
      gfx.events.onInputUp.add(() => this.navigate(hs), this);
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = this.cursorMap(hs.cursor), this);
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
      this.hotspotGfx.push(gfx);
    });

    // Gift button (if user has gifts)
    this.checkGifts();

    // Sky/weather (placeholder)
    this.setupSky();

    // Subtitle lines for garage dialog (from 03d001v0-03d007v0)
    this.game.mulle.subtitle.setLines('03d001v0', 'swedish', ['- Välkommen till båtbygget!'], 'mulle');
    this.game.mulle.subtitle.setLines('03d001v0', 'english', ['- Welcome to the boat building!'], 'mulle');

    // Random chatter timer
    this.loopCounter = this.game.rnd.integerInRange(120, 360);
    this.firstTime = !this.game.mulle.user.firstTimeYard;
    this.game.time.events.loop(Phaser.Timer.SECOND / 15, this.updateLoop, this);
  }
  checkGifts() {
    const gifts = this.game.mulle.user.gifts || [];
    if (gifts.length > 0) {
      // Gift hotspot: rect(262, 383, 379, 478)
      const gfx = this.game.add.graphics(0, 0);
      gfx.beginFill(0xffd700, 0.3);
      gfx.drawRect(262, 383, 117, 95);
      gfx.endFill();
      gfx.inputEnabled = true;
      gfx.events.onInputUp.add(() => this.openGift(), this);
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = 'point', this);
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
      this.giftGfx = gfx;

      // Gift icon using 03b999v0 (member 40)
      this.giftIcon = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 430);
      this.giftIcon.setDirectorMember('03.DXR', 40);
      this.game.add.existing(this.giftIcon);
    }
  }
  openGift() {
    // Add all gifted parts to user's yard
    const gifts = this.game.mulle.user.gifts || [];
    gifts.forEach(partId => {
      // In the original, this calls addJunkPart / addNewPart
      // For now just add to user's parts
      if (!this.game.mulle.user.parts.includes(partId)) {
        this.game.mulle.user.parts.push(partId);
      }
    });
    this.game.mulle.user.gifts = [];
    this.game.mulle.saveData();
    if (this.giftGfx) {
      this.giftGfx.destroy();
      this.giftGfx = null;
    }
    if (this.giftIcon) {
      this.giftIcon.destroy();
      this.giftIcon = null;
    }

    // Play gift sound
    this.game.mulle.playAudio('GiftSnd1');

    // Go to "Gift" marker/frame (in original: go "Gift")
    // For now just show message
    this.game.mulle.subtitle.showLine('- Du fick en present!', 'mulle');
  }
  navigate(hs) {
    if (hs.target === 'yard') {
      this.game.state.start('yard');
    } else if (hs.target === 'junk') {
      this.game.mulle.user.enterShelf = hs.label;
      this.game.state.start('junk');
    }
  }
  cursorMap(name) {
    const map = {
      left: 'w-resize',
      forward: 'n-resize',
      point: 'pointer',
      default: 'default'
    };
    return map[name] || 'default';
  }
  setupSky() {
    // Weather-based sky from gMulleGlobals.weather
    // For now just a simple gradient
    const sky = this.game.add.graphics(0, 0);
    sky.beginFill(0x87ceeb);
    sky.drawRect(0, 0, 640, 200);
    sky.endFill();
  }
  updateLoop() {
    if (this.loopCounter > 0) {
      this.loopCounter--;
    }

    // First-time dialogs
    if (this.firstTime && this.loopCounter === 0) {
      this.firstTime = false;
      this.game.mulle.user.firstTimeYard = false;
      this.game.mulle.saveData();
      this.game.mulle.playAudio('03d001v0');
      this.loopCounter = this.game.rnd.integerInRange(120, 240);
    }
    // Random chatter (simplified)
    else if (this.loopCounter === 0) {
      const sounds = ['00d001v0', '00d002v0', '00d003v0', '00d004v0', '00d005v0'];
      const snd = this.game.rnd.pick(sounds);
      this.game.mulle.playAudio(snd);
      this.loopCounter = this.game.rnd.integerInRange(360, 720);
    }
  }
  shutdown() {
    this.hotspotGfx.forEach(g => g.destroy());
    this.hotspotGfx = [];
    if (this.giftGfx) {
      this.giftGfx.destroy();
      this.giftGfx = null;
    }
    if (this.giftIcon) {
      this.giftIcon.destroy();
      this.giftIcon = null;
    }
    this.game.sound.stopAll();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GarageState);

/***/ },

/***/ "./src/scenes/junk.js"
/*!****************************!*\
  !*** ./src/scenes/junk.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");



class JunkState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    this.game.load.pack('junk', 'assets/junk.json', null, this);
  }
  create() {
    this.game.mulle.addAudio('junk');

    // Background: 02.DXR member 1 = 02b001v1 (640x480)
    const background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('02.DXR', 1);
    this.game.add.existing(background);

    // Border frame
    const border = this.game.add.graphics(0, 0);
    border.lineStyle(4, 0x888888, 1);
    border.moveTo(0, 0);
    border.lineTo(640, 0);
    border.lineTo(640, 480);
    border.lineTo(0, 480);
    border.lineTo(0, 0);

    // Junk pile doors: members 2-7 (02b002v0-02b007v0, 26x61)
    // Position them roughly where the shelves were in garage
    // In original, these are the "doors" to each shelf area
    this.shelfDoors = [];
    const shelfPositions = [{
      x: 150,
      y: 100,
      shelf: 'Shelf1'
    }, {
      x: 230,
      y: 95,
      shelf: 'Shelf2'
    }, {
      x: 320,
      y: 90,
      shelf: 'Shelf3'
    }, {
      x: 410,
      y: 88,
      shelf: 'Shelf4'
    }, {
      x: 500,
      y: 85,
      shelf: 'Shelf5'
    }, {
      x: 590,
      y: 82,
      shelf: 'Shelf6'
    }];
    shelfPositions.forEach((pos, i) => {
      const door = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, pos.x, pos.y);
      door.setDirectorMember('02.DXR', i + 2); // members 2-7
      door.inputEnabled = true;
      door.events.onInputUp.add(() => this.enterShelf(pos.shelf), this);
      door.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this);
      door.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
      this.game.add.existing(door);
      this.shelfDoors.push(door);
    });

    // Exit to yard (04.DXR) - right side
    const yardExit = this.game.add.graphics(600, 0);
    yardExit.beginFill(0x0000ff, 0);
    yardExit.drawRect(0, 0, 40, 480);
    yardExit.endFill();
    yardExit.inputEnabled = true;
    yardExit.events.onInputUp.add(() => this.game.state.start('yard'), this);

    // Exit to garage (03.DXR) - left side
    const garageExit = this.game.add.graphics(0, 0);
    garageExit.beginFill(0xff0000, 0);
    garageExit.drawRect(0, 0, 40, 480);
    garageExit.endFill();
    garageExit.inputEnabled = true;
    garageExit.events.onInputUp.add(() => this.game.state.start('garage'), this);

    // Handle enterShelf from garage
    this.currentShelf = this.game.mulle.user.enterShelf || 'Shelf1';
    this.game.mulle.user.enterShelf = null;

    // Init part sprites array
    this.partSprites = [];

    // Show parts on current shelf (placeholder)
    this.showShelfParts(this.currentShelf);

    // Subtitle for PartData (member 25)
    this.game.mulle.subtitle.setLines('PartData', 'swedish', ['- Välj ett hyllfack för att se delarna.'], 'mulle');
    this.game.mulle.subtitle.setLines('PartData', 'english', ['- Select a shelf compartment to see parts.'], 'mulle');

    // Play ambient sound
    this.game.mulle.playAudio('02d002v0');
  }
  enterShelf(shelf) {
    this.currentShelf = shelf;
    this.showShelfParts(shelf);
  }
  showShelfParts(shelf) {
    // Clear existing part sprites
    if (this.partSprites) {
      this.partSprites.forEach(s => s.destroy());
    }
    this.partSprites = [];

    // In the original, this draws parts from the user's junk pile for this shelf
    // For now show placeholder text
    const text = this.game.add.text(320, 400, `Hylla: ${shelf}`, {
      font: '24px serif',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: {
        x: 16,
        y: 8
      }
    });
    text.anchor.set(0.5);
    this.partSprites.push(text);

    // Play shelf sound
    this.game.mulle.playAudio('02e003v0');
  }
  shutdown() {
    if (this.shelfDoors) {
      this.shelfDoors.forEach(d => d.destroy());
      this.shelfDoors = [];
    }
    if (this.partSprites) {
      this.partSprites.forEach(s => s.destroy());
      this.partSprites = [];
    }
    this.game.sound.stopAll();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JunkState);

/***/ },

/***/ "./src/scenes/menu.js"
/*!****************************!*\
  !*** ./src/scenes/menu.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");




class MenuState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    this.game.load.pack('menu', 'assets/menu.json', null, this);
  }
  create() {
    this.game.mulle.addAudio('menu');

    // Background: 11.DXR member 86 = 11b001v1 (640x480)
    const background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('11.DXR', 86);
    this.game.add.existing(background);

    // Border frame: 11.DXR score ch83-86 use castId 3 (member 4 = 10a001v0, 42x19)
    // Stretched to 640x4 (top/bottom) and 4x472 (left/right) at center (320,240)
    // We'll draw this as graphics since it's just colored lines
    const border = this.game.add.graphics(0, 0);
    border.lineStyle(4, 0x888888, 1);
    border.moveTo(0, 0);
    border.lineTo(640, 0);
    border.lineTo(640, 480);
    border.lineTo(0, 480);
    border.lineTo(0, 0);

    // Mulle body: members 125-132 (87a001v2, 02-08) 180x346
    this.mulleBody = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 320, 320, 'mulleBody');
    this.mulleBody.animations.play('still');
    this.game.add.existing(this.mulleBody);

    // Mulle head: members 133-143 (87a001v0, 10-19) ~118x128
    this.mulleHead = new _objects_actor__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 320, 180, 'mulleHead');
    this.mulleHead.animations.play('idle');
    this.game.add.existing(this.mulleHead);

    // Name input field (HTML overlay) - positioned like car game
    this.nameInput = document.createElement('input');
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.top = '320px';
    this.nameInput.style.left = '230px';
    this.nameInput.style.width = '180px';
    this.nameInput.style.height = '32px';
    this.nameInput.style.font = '24px serif';
    this.nameInput.style.padding = '4px 8px';
    this.nameInput.style.border = '2px solid #888';
    this.nameInput.style.background = 'rgba(255,255,255,0.9)';
    this.nameInput.style.borderRadius = '4px';
    this.nameInput.style.zIndex = '1000';
    this.nameInput.placeholder = 'Ditt namn...';
    this.nameInput.maxLength = 20;
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    this.nameInput.style.left = `${rect.left + 230 / scaleX}px`;
    this.nameInput.style.top = `${rect.top + 320 / scaleY}px`;
    this.nameInput.style.width = `${180 / scaleX}px`;
    this.nameInput.style.height = `${32 / scaleY}px`;
    this.nameInput.style.fontSize = `${24 / Math.max(scaleX, scaleY)}px`;
    document.body.appendChild(this.nameInput);
    this.nameInput.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        this.handleLogin();
      }
    });

    // OK button - simple graphics button since 11.DXR lacks dedicated button frames
    // (car game used 10.DXR #169/#170 for toilet button)
    const btnGfx = this.game.add.graphics(420, 330);
    btnGfx.beginFill(0x88cc88, 0.9);
    btnGfx.drawRoundedRect(0, 0, 80, 36, 6);
    btnGfx.endFill();
    btnGfx.inputEnabled = true;
    btnGfx.events.onInputUp.add(() => this.handleLogin(), this);
    this.okButtonText = this.game.add.text(460, 348, 'OK', {
      font: '20px serif',
      fill: '#fff',
      fontWeight: 'bold'
    });
    this.okButtonText.anchor.set(0.5);
    this.okButton = btnGfx;

    // Existing users list (like car game)
    this.userList = [];
    let y = 370;
    for (const name in this.game.mulle.UsersDB) {
      const text = this.game.add.text(230, y, name, {
        font: '20px serif',
        fill: '#333',
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: {
          x: 8,
          y: 4
        }
      });
      text.inputEnabled = true;
      text.events.onInputUp.add(() => {
        this.game.mulle.user = this.game.mulle.UsersDB[name];
        this.game.mulle.activeCutscene = '11d001v0';
        this.game.state.start('garage');
      }, this);
      this.userList.push(text);
      y += 28;
    }

    // Subtitle lines (from 11d001v0 - member 90)
    this.game.mulle.subtitle.setLines('11d001v0', 'swedish', ['- Hej!', '- Jag heter {Mulle Meck}!', '- Vill du bygga båtar med mig?', '- Skriv ditt namn så kan vi sätta igång.', '- Har du byggt förr så klickar du på ditt namn i {listan}.'], 'mulle');
    this.game.mulle.subtitle.setLines('11d001v0', 'english', ['- Hello!', '- My name is {Mulle Meck}!', '- Do you want to build boats with me?', '- Write down your name so we can start.', "- If you've been here before, click your name in the {list}."], 'mulle');

    // Play intro audio and start Mulle animation
    this.game.mulle.playAudio('10e001v0', () => {
      this.mulleHead.animations.play('talk');
      this.mulleBody.animations.play('talk');

      // Simulate the Talk marker (frame 3) → Wait (frame 4) → IntroStart (frame 5)
      this.game.time.events.add(3000, () => {
        this.mulleHead.animations.play('idle');
        this.mulleBody.animations.play('still');
      }, this);
      this.game.time.events.add(5000, () => {
        this.mulleHead.animations.play('point');
      }, this);
    });

    // Cursor handling
    this.setupCursors();
  }
  handleLogin() {
    const name = this.nameInput.value.trim();
    if (!name) return;
    if (this.game.mulle.UsersDB[name]) {
      this.game.mulle.user = this.game.mulle.UsersDB[name];
    } else {
      const save = new (__webpack_require__(/*! ../struct/savedata */ "./src/struct/savedata.js"))(this.game);
      save.UserId = name;
      this.game.mulle.UsersDB[name] = save;
      this.game.mulle.saveData();
      this.game.mulle.user = save;
    }
    this.game.mulle.activeCutscene = '11d001v0';
    this.game.state.start('garage');
  }
  setupCursors() {
    // Load cursor sprites from 11.DXR members 101-109
    // C_standard (101), C_Grab (102), C_Left (103), C_Click (104), C_Back (105), C_Right (106), C_MoveLeft (107), C_MoveRight (108), C_MoveIn (109)
    // For now use default cursor
    this.game.canvas.style.cursor = 'default';
  }
  update() {
    // Update cursor position for custom cursors if needed
  }
  shutdown() {
    if (this.nameInput && this.nameInput.parentNode) {
      this.nameInput.parentNode.removeChild(this.nameInput);
    }
    this.nameInput = null;
    if (this.okButton) {
      this.okButton.destroy();
      this.okButton = null;
    }
    if (this.okButtonText) {
      this.okButtonText.destroy();
      this.okButtonText = null;
    }
    this.userList.forEach(t => t.destroy());
    this.userList = [];
    this.game.sound.stopAll();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MenuState);

/***/ },

/***/ "./src/scenes/mission.js"
/*!*******************************!*\
  !*** ./src/scenes/mission.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MissionState)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/boat/lingo */ "./src/objects/boat/lingo.js");
/**
 * Generic Mission State - handles mission minigames (movies 70-88).
 *
 * The original game has 14 unique mission minigames (70.DXR-88.DXR excluding 72-75, 82).
 * Each has unique gameplay (diver, rope, racing, etc.). For a playable
 * completion path we provide a generic handler that loads the mission movie
 * and allows the player to "complete" it to return to the world map.
 *
 * @module scenes/mission
 */





class MissionState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();

    // The mission ID is passed via g.game.mulle.activeMission
    let missionId = this.game.mulle.activeMission;
    if (!missionId) {
      // Direct URL navigation: extract from state name
      const stateName = this.game.state.current;
      if (stateName && stateName.startsWith('mission')) {
        missionId = stateName.replace('mission', '');
        this.game.mulle.activeMission = missionId;
      }
    }
    if (!missionId) {
      console.error('[mission] No active mission ID');
      return;
    }
    this.missionId = missionId;
    this.missionMovie = String(missionId) + '.DXR';

    // Map mission ID to pack name (from PACKS dictionary in gen_assets_bat.py)
    const packNameMap = {
      '70': 'm70',
      '71': 'm71',
      '76': 'm76',
      '77': 'm77',
      '78': 'm78',
      '79': 'm79',
      '80': 'm80',
      '81': 'm81',
      '83': 'm83',
      '84': 'm84',
      '85': 'm85',
      '86': 'm86',
      '87': 'm87',
      '88': 'm88'
    };
    const packName = packNameMap[this.missionId] || 'm' + this.missionId;

    // Load the mission pack (pack key must match the key in the JSON)
    this.game.load.pack(packName, 'assets/' + packName + '.json', null, this);

    // Also load sailing pack for common assets (boat, water, etc.)
    this.game.load.pack('sailing', 'assets/sailing.json', null, this);
    this.game.load.pack('map', 'assets/map.json', null, this);
  }
  create() {
    super.create();
    const g = this.game;
    g.mulle.worldState = this;

    // Create background from mission movie
    this.createMissionScreen();

    // Set up input
    this.setupInput();
    console.log('[mission] Starting mission', this.missionId);
  }
  createMissionScreen() {
    const g = this.game;

    // Try to show mission background art if available
    const idx = buildFrameIndex(g);
    const bgNames = ['missionbg', 'background', 'bakgrund', 'intro', 'title'];
    let bgFrame = null;
    for (const name of bgNames) {
      const list = idx.byName[name];
      if (list && list.length) {
        for (const e of list) {
          if (e.movie === this.missionMovie) {
            bgFrame = e;
            break;
          }
        }
        if (bgFrame) break;
      }
    }
    if (bgFrame) {
      const sprite = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](g, 320, 240);
      sprite.loadTexture(bgFrame.frame[0], bgFrame.frame[1]);
      g.add.existing(sprite);
    } else {
      // Fallback: solid color background
      const gfx = g.add.graphics(0, 0);
      gfx.beginFill(0x003366, 1);
      gfx.drawRect(0, 0, 640, 480);
      gfx.endFill();
    }

    // Mission title text
    const title = g.add.text(320, 80, 'Mission ' + this.missionId, {
      font: '28px Arial',
      fill: '#ffffff',
      align: 'center'
    });
    title.anchor.set(0.5);

    // Instructions
    const instr = g.add.text(320, 200, 'Press SPACE to complete mission', {
      font: '18px Arial',
      fill: '#ffff00',
      align: 'center'
    });
    instr.anchor.set(0.5);

    // Mission description placeholder
    const desc = g.add.text(320, 280, 'Mission briefing would appear here.\nOriginal minigame: ' + this.missionMovie, {
      font: '14px Arial',
      fill: '#cccccc',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500
    });
    desc.anchor.set(0.5);
  }
  setupInput() {
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceKey.onDown.add(this.completeMission, this);
  }
  completeMission() {
    const g = this.game;

    // Award mission completion (SetWhenDone rewards)
    this.awardMissionRewards();

    // Return to world map
    g.mulle.activeMission = null;
    g.state.start('world');
  }
  awardMissionRewards() {
    const g = this.game;
    const user = g.mulle.user;

    // Find the object that led to this mission
    // The mission ID corresponds to DirResource in objects
    const objects = g.mulle.ObjectsDB || {};
    for (const id in objects) {
      const obj = objects[id];
      if (obj.DirResource && String(obj.DirResource) === String(this.missionId)) {
        // Award SetWhenDone rewards
        if (obj.SetWhenDone && typeof obj.SetWhenDone === 'object') {
          const spec = obj.SetWhenDone;
          if (spec.Inventory) {
            for (const item of (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__.asList)(spec.Inventory)) {
              (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__.setInInventory)(user, item, item);
            }
          }
          if (spec.Missions) {
            if (!user.givenMissions) user.givenMissions = [];
            for (const m of (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__.asList)(spec.Missions)) {
              if (user.givenMissions.indexOf(m) < 0) user.givenMissions.push(m);
            }
          }
          if (spec.Medals && user.Car && user.Car.addMedal) {
            for (const m of (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__.asList)(spec.Medals)) user.Car.addMedal(m);
          }
          if (spec.Parts) {
            if (!user.Car) user.Car = {
              Parts: []
            };
            for (const p of (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_2__.asList)(spec.Parts)) {
              if (p !== '#Random' && p !== '#random' && user.Car.Parts.indexOf(p) < 0) {
                user.Car.Parts.push(p);
              }
            }
          }
        }
        console.log('[mission] Awarded rewards for mission', this.missionId, 'from object', id);
        break;
      }
    }
  }
  shutdown() {
    if (this.spaceKey) this.spaceKey.onDown.remove(this.completeMission, this);
    super.shutdown();
  }
}

/* -------------------------------------------------------------------------
 * Specific Mission Implementations
 * ---------------------------------------------------------------------- */

/**
 * Base class for specific mission minigames
 */
class BaseMission extends MissionState {
  constructor() {
    super();
  }
  createMissionScreen() {
    const g = this.game;
    super.createMissionScreen();

    // Add mission-specific UI
    if (this.missionBriefing) {
      const briefing = g.add.text(320, 280, this.missionBriefing, {
        font: '14px Arial',
        fill: '#cccccc',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 500
      });
      briefing.anchor.set(0.5);
    }
  }
  completeMission() {
    this.awardMissionRewards();
    this.game.mulle.activeMission = null;
    this.game.state.start('world');
  }
}

/**
 * Mission 70 - Erson / Diver
 * Underwater diving minigame
 */
class Mission70 extends BaseMission {
  constructor() {
    super();
    this.missionId = '70';
    this.missionMovie = '70.DXR';
    this.missionBriefing = 'Help Erson dive underwater and collect treasures!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m70', 'assets/m70.json', null, this);
  }
  createMissionScreen() {
    super.createMissionScreen();
    const g = this.game;
    // Add diver sprite, oxygen meter, collectibles
    const diver = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    diver.setDirectorMember('70.DXR', '70a001v0');
    this.game.add.existing(diver);
  }
  update() {
    // Diver movement, oxygen depletion, collectible collection
  }
}

/**
 * Mission 71 - Erson / Rope
 * Rope swinging minigame
 */
class Mission71 extends BaseMission {
  constructor() {
    super();
    this.missionId = '71';
    this.missionMovie = '71.DXR';
    this.missionBriefing = 'Swing with Erson across the gaps!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m71', 'assets/m71.json', null, this);
  }
}

/**
 * Mission 76 - Judge / Boat Show
 * Boat show judging minigame
 */
class Mission76 extends BaseMission {
  constructor() {
    super();
    this.missionId = '76';
    this.missionMovie = '76.DXR';
    this.missionBriefing = 'Judge the boat show entries!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m76', 'assets/m76.json', null, this);
  }
}

/**
 * Mission 77 - Birgit / Dogs
 * Dog herding minigame
 */
class Mission77 extends BaseMission {
  constructor() {
    super();
    this.missionId = '77';
    this.missionMovie = '77.DXR';
    this.missionBriefing = 'Help Birgit herd the dogs!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m77', 'assets/m77.json', null, this);
  }
}

/**
 * Mission 78 - Preacher
 * Sermon/dialogue minigame
 */
class Mission78 extends BaseMission {
  constructor() {
    super();
    this.missionId = '78';
    this.missionMovie = '78.DXR';
    this.missionBriefing = 'Listen to the preacher\'s sermon.';
  }
  preload() {
    super.preload();
    this.game.load.pack('m78', 'assets/m78.json', null, this);
  }
}

/**
 * Mission 79 - Head/Body Animation
 * Character animation minigame
 */
class Mission79 extends BaseMission {
  constructor() {
    super();
    this.missionId = '79';
    this.missionMovie = '79.DXR';
    this.missionBriefing = 'Watch the head/body animation show!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m79', 'assets/m79.json', null, this);
  }
}

/**
 * Mission 80 - Sam
 * Dialogue/interaction minigame
 */
class Mission80 extends BaseMission {
  constructor() {
    super();
    this.missionId = '80';
    this.missionMovie = '80.DXR';
    this.missionBriefing = 'Talk with Sam!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m80', 'assets/m80.json', null, this);
  }
}

/**
 * Mission 81 - Sur
 * Surfing/water minigame
 */
class Mission81 extends BaseMission {
  constructor() {
    super();
    this.missionId = '81';
    this.missionMovie = '81.DXR';
    this.missionBriefing = 'Surf the waves with Sur!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m81', 'assets/m81.json', null, this);
  }
}

/**
 * Mission 83 - Mia
 * Dialogue/interaction minigame
 */
class Mission83 extends BaseMission {
  constructor() {
    super();
    this.missionId = '83';
    this.missionMovie = '83.DXR';
    this.missionBriefing = 'Chat with Mia!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m83', 'assets/m83.json', null, this);
  }
}

/**
 * Mission 84 - Viola
 * Dialogue/interaction minigame
 */
class Mission84 extends BaseMission {
  constructor() {
    super();
    this.missionId = '84';
    this.missionMovie = '84.DXR';
    this.missionBriefing = 'Talk with Viola!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m84', 'assets/m84.json', null, this);
  }
}

/**
 * Mission 85 - Water/Sinking
 * Sinking boat survival minigame
 */
class Mission85 extends BaseMission {
  constructor() {
    super();
    this.missionId = '85';
    this.missionMovie = '85.DXR';
    this.missionBriefing = 'Survive the sinking boat!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m85', 'assets/m85.json', null, this);
  }
}

/**
 * Mission 86 - Sven / Bat
 * Bat cave navigation minigame
 */
class Mission86 extends BaseMission {
  constructor() {
    super();
    this.missionId = '86';
    this.missionMovie = '86.DXR';
    this.missionBriefing = 'Navigate the bat cave with Sven!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m86', 'assets/m86.json', null, this);
  }
}

/**
 * Mission 87 - Dive / Factory
 * Factory diving minigame
 */
class Mission87 extends BaseMission {
  constructor() {
    super();
    this.missionId = '87';
    this.missionMovie = '87.DXR';
    this.missionBriefing = 'Dive into the factory!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m87', 'assets/m87.json', null, this);
  }
}

/**
 * Mission 88 - Water / Tree
 * Tree/water puzzle minigame
 */
class Mission88 extends BaseMission {
  constructor() {
    super();
    this.missionId = '88';
    this.missionMovie = '88.DXR';
    this.missionBriefing = 'Solve the tree/water puzzle!';
  }
  preload() {
    super.preload();
    this.game.load.pack('m88', 'assets/m88.json', null, this);
  }
}

/* -------------------------------------------------------------------------
 * Mission Factory
 * ---------------------------------------------------------------------- */

const MissionClasses = {
  '70': Mission70,
  '71': Mission71,
  '76': Mission76,
  '77': Mission77,
  '78': Mission78,
  '79': Mission79,
  '80': Mission80,
  '81': Mission81,
  '83': Mission83,
  '84': Mission84,
  '85': Mission85,
  '86': Mission86,
  '87': Mission87,
  '88': Mission88
};
function createMission(missionId) {
  const MissionClass = MissionClasses[missionId];
  if (MissionClass) {
    return new MissionClass();
  }
  return new BaseMission();
}

/* -------------------------------------------------------------------------
 * Helpers (duplicated from world.js for independence)
 * ---------------------------------------------------------------------- */

function buildFrameIndex(game) {
  const keys = game.cache.getKeys(Phaser.Cache.IMAGE);
  const byMovie = {};
  const byName = {};
  for (const key of keys) {
    const img = game.cache.getImage(key, true);
    if (!img || !img.frameData) continue;
    const frames = img.frameData.getFrames();
    for (const f in frames) {
      const fr = frames[f];
      if (fr.dirFile && fr.dirNum !== undefined && fr.dirNum !== null) {
        if (!byMovie[fr.dirFile]) byMovie[fr.dirFile] = {};
        if (byMovie[fr.dirFile][fr.dirNum] === undefined) {
          byMovie[fr.dirFile][fr.dirNum] = [key, fr.name];
        }
      }
      if (fr.dirName) {
        if (!byName[fr.dirName]) byName[fr.dirName] = [];
        byName[fr.dirName].push({
          movie: fr.dirFile,
          frame: [key, fr.name],
          width: fr.width,
          height: fr.height,
          regpoint: fr.regpoint || null
        });
      }
    }
  }
  return {
    byMovie,
    byName
  };
}

/***/ },

/***/ "./src/scenes/mudcar.js"
/*!******************************!*\
  !*** ./src/scenes/mudcar.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");
/* harmony import */ var _util_directorAnimation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/directorAnimation */ "./src/util/directorAnimation.js");
/* harmony import */ var _util_movingAnimation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util/movingAnimation */ "./src/util/movingAnimation.js");
/* harmony import */ var _util_partUtil__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/partUtil */ "./src/util/partUtil.js");
/* harmony import */ var _util_blinkThing__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../util/blinkThing */ "./src/util/blinkThing.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");








/**
 * Car stuck in mud
 * 82.DXR
 */
class MudCarState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('mudcar', 'assets/mudcar.json', null, this);
    this.dirResource = '82.DXR';
    this.game.load.json('JustDoIt_car', 'data/score/82.DXR_JustDoIt_4.json');
    this.game.load.json('JustDoIt_rope', 'data/score/82.DXR_JustDoIt_5.json');
    this.game.load.json('MudcarAnimations', 'data/82.DXR-animations.json');
  }

  /**
   * Animation "titt", driver talks on the phone
   */
  driverAnimation() {
    const driverHead = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 412, 216, this.dirResource, 26);
    this.car_layer.add(driverHead);
    const suckFrames = this.animations['TittAnimChart']['Actions']['suck'];
    _util_directorAnimation__WEBPACK_IMPORTED_MODULE_2__["default"].addAnimation(driverHead, 'suck', suckFrames, 26, true);
    driverHead.animations.play('suck');

    //Help! i'm stuck in the mud
    this.game.mulle.playAudio('82d009v0', () => {
      driverHead.destroy();
      this.checkStrength();
    });
  }

  /**
   * Check car strength and start the correct animation
   */
  checkStrength() {
    const strength = this.game.mulle.user.Car.getProperty('strength');
    console.log('Car strength is', strength);
    if (strength <= 2) {
      this.weakCar();
    } else {
      this.strongCar();
    }
  }
  addPart() {
    const part = new _util_partUtil__WEBPACK_IMPORTED_MODULE_4__["default"](this.game);
    this.partId = part.getPart();
    this.partSprite = part.showPart(this.partId, 412, 326);
    this.background_layer.add(this.partSprite);
  }

  /**
   * Mulle discovers the part
   */
  findPart() {
    /*this.game.mulle.playAudio('82d006v0', () => {
     }*/
    const mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_6__["default"](this.game, 15, 254, 'mulleDefault');
    const buffa = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 218, 244, this.dirResource, 57);
    this.game.add.existing(buffa);
    mulle.talkAnimation = 'talkRegular';
    mulle.silenceAnimation = 'idle';
    this.game.add.existing(mulle);
    this.game.mulle.actors.mulle = mulle;
    this.game.mulle.actors.mulle.talk('82d006v0', () => {
      new _util_blinkThing__WEBPACK_IMPORTED_MODULE_5__["default"](this.game, this.partSprite, this.exit, this);
    });
  }
  strongCar() {
    this.moose();
    this.addPart();
    this.game.mulle.playAudio('82e002v0', () => {
      this.buffaEnterAnimation();
    });
    let strongFrames = this.animations['StrongCarAnimChart']['Actions']['strong'];
    const strongAnimation = _util_directorAnimation__WEBPACK_IMPORTED_MODULE_2__["default"].addAnimation(this.rope, 'strong', strongFrames, 34);
    strongAnimation.onComplete.add(this.pullCar, this);
    this.rope.animations.play('strong', 12);
  }
  pullCar() {
    this.stuckCar.destroy();
    this.rope.destroy();
    const JustDoIt = this.game.cache.getJSON('JustDoIt_car');
    const JustDoItAnimation = new _util_movingAnimation__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, this.dirResource, JustDoIt);
    this.game.add.existing(JustDoItAnimation.sprite);
    JustDoItAnimation.play();
    const JustDoItRope = this.game.cache.getJSON('JustDoIt_rope');
    const JustDoItRopeAnimation = new _util_movingAnimation__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, this.dirResource, JustDoItRope);
    this.game.add.existing(JustDoItRopeAnimation.sprite);
    JustDoItRopeAnimation.play();
    this.game.mulle.user.Car.addCache('#RescuedMudCar');
  }
  weakCar() {
    this.moose();
    let weakFrames = this.animations['WeakCarAnimChart']['Actions']['Svag'];
    _util_directorAnimation__WEBPACK_IMPORTED_MODULE_2__["default"].addAnimation(this.rope, 'weak', weakFrames, 34);
    console.log('Engine too weak');
    this.rope.animations.play('weak', 12, true);
    this.game.mulle.playAudio('82e001v0', () => {
      console.log('Audio finished, stop animation');
      this.rope.animations.stop('weak', true);
      this.game.mulle.playAudio('82d003v0', () => {
        this.game.state.start('world');
      });
    });
  }
  buffaEnterAnimation() {
    const sittFrames = this.animations['SittAnimChart']['Actions']['Sitt'];
    let x = -16;
    const step = 5;
    let pos = 0;
    const offset = 50;
    let frames = [];
    for (const cast of sittFrames) {
      frames[pos] = {
        x: x + step * pos,
        y: 239,
        cast: offset + pos
      };
      pos += 1;
    }
    this.buffaAnimation = new _util_movingAnimation__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, this.dirResource, frames);
    this.game.add.existing(this.buffaAnimation.sprite);
    this.buffaAnimation.play(this.findPart, this);
  }
  moose() {
    const mooseFrames = this.animations['MooseAnimChart']['Actions']['Blink'];
    const mooseSprite = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 87, 155, this.dirResource, 18);
    this.game.add.existing(mooseSprite);
    _util_directorAnimation__WEBPACK_IMPORTED_MODULE_2__["default"].addAnimation(mooseSprite, 'blink', mooseFrames, 18);
    mooseSprite.animations.play('blink', 12, false, true);
  }
  create() {
    super.create();
    this.game.mulle.addAudio('mudcar');
    this.car = null;
    this.background_layer = this.game.add.group();
    this.car_layer = this.game.add.group();
    const background = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 320, 240, this.dirResource, 1);
    this.background_layer.add(background);
    this.stuckCar = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 389, 279, this.dirResource, 43);
    this.car_layer.add(this.stuckCar);
    this.rope = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_1__["default"].sprite(this.game, 321, 248, this.dirResource, 34);
    this.car_layer.add(this.rope);
    this.animations = this.game.cache.getJSON('MudcarAnimations');
    this.driverAnimation();
  }
  exit() {
    this.game.state.start('world');
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MudCarState);

/***/ },

/***/ "./src/scenes/roaddog.js"
/*!*******************************!*\
  !*** ./src/scenes/roaddog.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");
/* harmony import */ var _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/blinkThing */ "./src/util/blinkThing.js");





class RoadDogState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('roaddog', 'assets/roaddog.json', null, this);
  }
  create() {
    super.create();
    this.game.mulle.addAudio('roaddog');
    this.car = null;
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('85.DXR', 25);
    this.game.add.existing(background);
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 368, 240, null, true, true);
    this.game.add.existing(this.car);

    // var dog = new MulleSprite(this.game, 480, 386);
    // dog.setDirectorMember('85.DXR', 26);
    // this.game.add.existing(dog);

    var salka = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 480, 386, 'salkaRight');
    salka.animations.play('idle');
    this.game.add.existing(salka);
    this.game.mulle.playAudio('85e001v0'); // salka idle audio

    this.game.mulle.subtitle.setLines('85d002v0', 'swedish', ['- Jahadu lilla {Salka}, du har kommit vilse igen.', '- Då kör vi hem dig till {Figge}!'], 'mulle');
    this.game.mulle.subtitle.setLines('85d002v0', 'english', ["- Oh {Salka}, you've gotten lost again.", "- We'll drive you home to {Figge}!"], 'mulle');
    this.game.mulle.actors.mulle.talk('85d002v0', () => {
      this.game.mulle.activeCutscene = '00b008v0';
      this.game.mulle.user.Car.addCache('#GotDogOnce');
      this.game.mulle.user.Car.addCache('#Dog');
      new _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, salka, () => {
        this.game.state.start('world');
      }, this);
    });
  }
  shutdown() {
    this.game.mulle.stopAudio('85e001v0');
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RoadDogState);

/***/ },

/***/ "./src/scenes/roadthing.js"
/*!*********************************!*\
  !*** ./src/scenes/roadthing.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_carpart__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/carpart */ "./src/objects/carpart.js");
/* harmony import */ var _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/blinkThing */ "./src/util/blinkThing.js");



// import MulleActor from '../objects/actor';


class RoadThingState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('roadthing', 'assets/roadthing.json', null, this);
  }
  create() {
    super.create();
    this.DirResource = '84.DXR';
    this.game.mulle.addAudio('roadthing');
    this.car = null;
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember(this.DirResource, 25);
    this.game.add.existing(background);
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 368, 240, null, true, true);
    this.game.add.existing(this.car);
    if (!this.game.mulle.SetWhenDone) {
      this.game.mulle.SetWhenDone = {
        Cache: ['#RoadThing1'],
        'Parts': [287, '#Random']
      };
    }
    var partId;
    for (var i of this.game.mulle.SetWhenDone.Parts) {
      if (i === '#Random') {
        i = this.game.mulle.user.getRandomPart();
      } else {
        if (this.game.mulle.user.hasPart(i)) continue;
      }

      // console.log('final part', i);

      partId = i;
      break;
    }
    console.log('given part', partId);
    var part = new _objects_carpart__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, partId, 150, 400);
    part.input.inputEnabled = false;
    part.input.disableDrag();
    this.game.add.existing(part);
    this.game.mulle.user.addPart('yard', partId);
    this.game.mulle.user.Car.addCache(this.game.mulle.SetWhenDone.Cache[0]);
    this.game.mulle.actors.mulle.talk('84d001v0', () => {
      new _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, part, () => {
        this.game.state.start('world');
      }, this);
    });
  }
  shutdown() {
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RoadThingState);

/***/ },

/***/ "./src/scenes/saftfabrik.js"
/*!**********************************!*\
  !*** ./src/scenes/saftfabrik.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");




class SaftfabrikState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('saftfabrik', 'assets/saftfabrik.json', null, this);
  }
  create() {
    super.create();
    this.DirResource = '87.DXR';
    this.game.mulle.addAudio('saftfabrik');
    this.car = null;

    // var hasLemonade = this.game.mulle.user.Car.hasCache('#Lemonade')
    var hasTank = this.game.mulle.user.Car.hasPart(172);
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember(this.DirResource, 208);
    this.game.add.existing(background);
    var mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 496, 332, 'mulleDefault');
    mulle.talkAnimation = 'talkRegular';
    mulle.silenceAnimation = 'idle';
    this.game.add.existing(mulle);
    this.game.mulle.actors.mulle = mulle;
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 217, 335, null, true, false);
    this.game.add.existing(this.car);
    var garson = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 537, 218, 'garson');
    garson.talkAnimation = 'talk';
    garson.silenceAnimation = 'idle';
    this.game.add.existing(garson);
    this.game.mulle.actors.garson = garson;
    garson.talk('87d002v0', () => {
      if (hasTank) {
        // jomenvisst
        mulle.talk('87d004v0', () => {
          var splash = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 241);
          splash.setDirectorMember(this.DirResource, 26);
          this.game.add.existing(splash);
          var f = [];
          for (var i = 0; i < 4; i++) f.push([this.DirResource, 26 + i]);
          splash.addAnimation('idle', f, 5, true);
          splash.animations.play('idle');

          // splash sound
          this.game.mulle.playAudio('87e001v0', () => {
            splash.destroy();

            // nu kör du bara rakt fram
            garson.talk('87d005v0', () => {
              // uppfattat
              mulle.talk('87d006v0', () => {
                game.time.events.add(Phaser.Timer.SECOND * 1, () => {
                  this.game.state.start('world');
                });
              });
            });
          });
        });
        this.game.mulle.user.Car.addCache('#Lemonade');
      } else {
        // nja
        mulle.talk('87d003v0', () => {
          game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.game.state.start('world');
          });
        });
      }
    });

    // var dog = new MulleSprite(this.game, 480, 386)
    // dog.setDirectorMember('85.DXR', 26)
    // this.game.add.existing(dog)

    // narrator
    // this.game.mulle.playAudio('87d001v0')

    // slut saft
    // this.game.mulle.playAudio('87d002v0')

    // nja
    // this.game.mulle.playAudio('87d003v0')

    // this.game.mulle.playAudio('87d004v0')

    // this.game.mulle.playAudio('87d005v0')

    // this.game.mulle.playAudio('87d006v0')

    // nu är ju saftfabriken stängd
    // this.game.mulle.playAudio('87d007v0')
  }
  shutdown() {
    this.game.mulle.stopAudio('87e001v0');
    this.game.mulle.actors.mulle = null;
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SaftfabrikState);

/***/ },

/***/ "./src/scenes/solhem.js"
/*!******************************!*\
  !*** ./src/scenes/solhem.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");




class SolhemState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('solhem', 'assets/solhem.json', null, this);
  }
  create() {
    super.create();
    this.DirResource = '86.DXR';
    this.game.mulle.addAudio('solhem');
    this.car = null;
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember(this.DirResource, 1);
    this.game.add.existing(background);
    var hasLadder = this.game.mulle.user.Car.hasPart(173);
    if (!this.game.mulle.user.hasStuff('#FerryTicket')) {
      var car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 257, 344, null, true, false);
      this.game.add.existing(car);
      var mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 350, 398, 'mulleDefault');
      mulle.animations.play('idle');
      mulle.talkAnimation = 'talkRegular';
      mulle.silenceAnimation = 'idle';
      this.game.add.existing(mulle);
      this.game.mulle.actors.mulle = mulle;
      var miaBody = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 277, 246, 'miaBody');
      miaBody.animations.play('idle');
      miaBody.talkAnimation = 'talk';
      miaBody.silenceAnimation = 'idle';
      this.game.add.existing(miaBody);
      this.game.mulle.actors.miaBody = miaBody;
      var miaHead = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 535, 336, 'miaHead');
      miaHead.animations.play('idle');
      miaHead.talkAnimation = 'talk';
      miaHead.silenceAnimation = 'idle';
      this.game.add.existing(miaHead);
      this.game.mulle.actors.miaHead = miaHead;
      var cat = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 278, 240, 'cat');
      cat.animations.play('idle');
      this.game.add.existing(cat);
      this.game.mulle.actors.cat = cat;

      // åh vad bra att du kom mulle
      miaHead.talk('86d002v0', () => {
        if (hasLadder) {
          mulle.talk('86d004v0', () => {
            if (hasLadder) {
              var ladder = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 0, 0);
              ladder.setDirectorMember(this.DirResource, 3);
              ladder.sortIndex = 12;
              car.add(ladder);
              car.forEach(c => {
                if (c.partId === 173) c.destroy();
              });
              car.sortLayers();
            }
            cat.animations.play('jump1').onComplete.addOnce(() => {
              miaBody.position.set(278, 240);
              miaHead.position.set(528, 337);
              miaBody.animations.play('catchIntro');
              miaHead.visible = false;
              cat.animations.play('jump2').onComplete.addOnce(() => {
                cat.visible = false;

                // miaBody.animations.play('idleCat');

                miaBody.animations.play('catchEnd').onComplete.addOnce(() => {
                  miaHead.animations.play('idleCat');
                  miaHead.visible = true;
                  miaHead.talkAnimation = 'talkCat';
                  miaHead.silenceAnimation = 'idleCat';

                  // färja
                  miaHead.talk('86d005v0', () => {
                    this.game.mulle.user.addStuff('#FerryTicket');

                    // man tackar
                    mulle.talk('86d006v0', () => {
                      this.game.state.start('world');
                    });
                  });
                });
              });

              //
            });
          });
        } else {
          mulle.talk('86d003v0', () => {
            this.game.state.start('world');
          });
        }
      });
    } else {
      var car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 257, 344, null, true, true);
      this.game.add.existing(car);
      this.game.mulle.actors.mulle.talk('86d007v0', () => {
        this.game.state.start('world');
      });
    }

    // 86e001v0 - cat meow
    // 86e002v0 - cat angry
    // 86e003v0 - cat meoooow
    // 86e004v0 - cat meow x3

    // 86e005v0 - bg loop

    // 86d001v0 - narrator

    //  - nja
    //  - jajamänsan
    // 86d005v0 - tack snälla
    // 86d006v0 - man tackar

    // 86d007v0 - ja jag hjälpte mia att ta ner

    this.game.mulle.playAudio('86e005v0');
  }
  shutdown() {
    this.game.mulle.actors.mulle = null;
    this.game.mulle.actors.miaHead = null;
    this.game.mulle.actors.miaBody = null;
    this.game.mulle.actors.cat = null;
    this.game.mulle.stopAudio('86e005v0');
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SolhemState);

/***/ },

/***/ "./src/scenes/sturestortand.js"
/*!*************************************!*\
  !*** ./src/scenes/sturestortand.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");




class StureStortandState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('sturestortand', 'assets/sturestortand.json', null, this);
  }
  create() {
    super.create();
    this.DirResource = '88.DXR';
    this.game.mulle.addAudio('sturestortand');
    this.car = null;
    var hasLemonade = this.game.mulle.user.Car.hasCache('#Lemonade');
    var hasTank = this.game.mulle.user.Car.hasPart(172);
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember(this.DirResource, hasLemonade ? 32 : 40);
    this.game.add.existing(background);
    var mulle = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 351, 234, 'mulleDefault');
    mulle.talkAnimation = 'talkRegular';
    mulle.silenceAnimation = 'idle';
    this.game.add.existing(mulle);
    this.game.mulle.actors.mulle = mulle;
    mulle.scale.x = -1;
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 41, 301, null, true, false);
    this.game.add.existing(this.car);
    if (hasLemonade) {
      var tube = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 304, 245);
      tube.setDirectorMember(this.DirResource, 17);
      this.game.add.existing(tube);
      var f = [];
      for (let i = 0; i < 7; i++) f.push([this.DirResource, 17 + i]);
      tube.addAnimation('idle', f, 5, true);
      tube.animations.play('idle');
      var sture = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 285, 162, 'stureHappy');
      sture.talkAnimation = 'talk';
      sture.silenceAnimation = 'idle';
      this.game.add.existing(sture);
      this.game.mulle.actors.sture = sture;

      // tackar tackar, mera saft och kalaset
      sture.talk('88d005v0', () => {
        // men så bra, den kommer nog väl till pass
        mulle.talk('88d006v0', () => {
          game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.game.state.start('world');
          });
        });
      });
      var partId = 162;
      this.game.mulle.user.addPart('yard', partId);
      this.game.mulle.user.Car.removeCache('#Lemonade');
    } else {
      var sture = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 285, 162, 'stureSad');
      sture.talkAnimation = 'talk';
      sture.silenceAnimation = 'idle';
      this.game.add.existing(sture);
      this.game.mulle.actors.sture = sture;

      // mulle, vi har ett problem
      sture.talk('88d002v0', () => {
        if (!hasTank) {
          // tja, jag kan ju försöka hjälpa till
          mulle.talk('88d003v0', () => {
            game.time.events.add(Phaser.Timer.SECOND * 1, () => {
              this.game.state.start('world');
            });
          });
        } else {
          // jajamänsan, såklart
          mulle.talk('88d004v0', () => {
            game.time.events.add(Phaser.Timer.SECOND * 1, () => {
              this.game.state.start('world');
            });
          });
        }
      });
    }

    // var dog = new MulleSprite(this.game, 480, 386)
    // dog.setDirectorMember('85.DXR', 26)
    // this.game.add.existing(dog)

    // narrator
    // this.game.mulle.playAudio('88d001v0')

    // bg loop
    this.game.mulle.playAudio('88e001v0');
  }
  shutdown() {
    this.game.mulle.stopAudio('88e001v0');
    this.game.mulle.actors.mulle = null;
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StureStortandState);

/***/ },

/***/ "./src/scenes/viola.js"
/*!*****************************!*\
  !*** ./src/scenes/viola.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/buildcar */ "./src/objects/buildcar.js");
/* harmony import */ var _objects_actor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/actor */ "./src/objects/actor.js");
/* harmony import */ var _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../util/blinkThing */ "./src/util/blinkThing.js");
/* harmony import */ var _objects_SubtitleLoader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../objects/SubtitleLoader */ "./src/objects/SubtitleLoader.js");






class ViolaState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    super.preload();
    this.game.load.pack('viola', 'assets/viola.json', null, this);
    this.subtitles = new _objects_SubtitleLoader__WEBPACK_IMPORTED_MODULE_5__["default"](this.game, 'viola', ['english']);
    this.subtitles.preload();
  }
  create() {
    super.create();
    this.game.mulle.addAudio('viola');
    this.subtitles.load();

    // Play background sound
    this.game.mulle.playAudio('89e001v0');

    // Background
    var background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    background.setDirectorMember('89.DXR', 1);
    this.game.add.existing(background);

    // The car (without Salka/Mulle)
    this.car = new _objects_buildcar__WEBPACK_IMPORTED_MODULE_2__["default"](this.game, 445, 370, null, false, false);
    this.game.add.existing(this.car);

    // Buffa with animation
    var buffa = new _objects_actor__WEBPACK_IMPORTED_MODULE_3__["default"](this.game, 360, 320, 'buffa');
    buffa.setDirectorMember('00.CXT', 214);
    this.game.add.existing(buffa);
    this.game.mulle.actors.buffa = buffa;
    let animationCount = 0;
    let isWaiting = false;
    let buffaTimer = this.game.time.events.loop(150, () => {
      if (!isWaiting && animationCount < 8) {
        buffa.animations.play('scratch1', null, false);
        buffa.animations.currentAnim.onComplete.addOnce(() => {
          buffa.setDirectorMember('00.CXT', 214);
          animationCount++;
          if (animationCount >= 8) {
            isWaiting = true;
            this.game.time.events.add(3000, () => {
              animationCount = 0;
              isWaiting = false;
            });
          }
        });
      }
    });

    // Viola in the window
    var viola = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 246, 154);
    viola.setDirectorMember('89.DXR', 18);
    this.game.add.existing(viola);

    // Window animation
    let frame = 18;
    let animationTimer = this.game.time.events.loop(300, () => {
      frame++;
      if (frame > 20) {
        frame = 18;
      }
      viola.setDirectorMember('89.DXR', frame);
    });

    // Show the tank directly with correct properties
    var tank = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 2, 332);
    tank.setDirectorMember('CDDATA.CXT', 436);
    tank.partId = 172;
    tank.properties = {
      Weight: 4,
      Color: 1,
      Funnyfactor: 5
    };
    tank.requires = ['#b1'];
    tank.covers = ['#a5', '#a6', '#a7', '#b1'];
    this.game.add.existing(tank);

    // Play the dialogs one after another
    this.game.mulle.playAudio('89d001v0', () => {
      this.game.mulle.playAudio('89d003v0', () => {
        this.game.mulle.user.Junk.yard[172] = {
          x: this.game.rnd.integerInRange(290, 580),
          y: 440
        };
        this.game.time.events.remove(buffaTimer);
        buffa.animations.stop();

        // Use blinkThing for the disappearing effect
        new _util_blinkThing__WEBPACK_IMPORTED_MODULE_4__["default"](this.game, tank, () => {
          this.game.mulle.stopAudio('89e001v0');
          this.game.time.events.remove(animationTimer);
          this.game.time.events.remove(buffaTimer);
          buffa.animations.stop();
          this.game.state.start('world');
        }, this);
      });
    });
  }
  shutdown() {
    this.game.mulle.stopAudio('viola');
    super.shutdown();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ViolaState);

/***/ },

/***/ "./src/scenes/world.js"
/*!*****************************!*\
  !*** ./src/scenes/world.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _struct_savedata__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../struct/savedata */ "./src/struct/savedata.js");
/* harmony import */ var _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../objects/boat/lingo */ "./src/objects/boat/lingo.js");
/* harmony import */ var _objects_boat_boatbase__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../objects/boat/boatbase */ "./src/objects/boat/boatbase.js");
/* harmony import */ var _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../objects/boat/weather */ "./src/objects/boat/weather.js");
/* harmony import */ var _objects_boat_props__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../objects/boat/props */ "./src/objects/boat/props.js");
/**
 * World / sailing scene - Director movie 05.DXR.
 *
 * This is a port of the original movie:
 *
 *   ParentScript 2   - Dir               (state machine, map switching)
 *   ParentScript 3   - DrivingHandlers   (key polling / headings)
 *   BehaviorScript 7 - TransToNextMovie  (scene transitions)
 *   BehaviorScript 78 - MapDisplay       (the over-view map)
 *   ParentScript 171 / 170 - SelectorMaster / TypeSelectButton
 *   plus the boat, weather and sound modules in objects/boat/*.
 *
 * @module scenes/world
 */










/* -------------------------------------------------------------------------
 * Score layout
 *
 * Sprite numbers are the original channel numbers, sort order is the z order
 * of the score. Positions are the "loc" of the sprite, i.e. the registration
 * point - MulleSprite uses the frame regpoint as the pivot so the rendered
 * top left corner ends up at `loc - regPoint`, exactly like Director.
 * ---------------------------------------------------------------------- */

const SPRITE_LAYOUT = [[15, 321, 202, '05.DXR', 144],
// #Water  Weather1
[18, 320, 202, null, null],
// #UnderMap
[20, 0, 0, null, null],
// #waves
[21, 0, 0, null, null], [22, 0, 0, null, null], [23, 0, 0, null, null], [24, 0, 0, null, null], [25, 334, 148, null, null], [26, 0, 0, null, null], [27, 0, 0, null, null], [28, 0, 0, null, null], [29, 334, 148, null, null], [34, 320, 202, null, null],
// #map
[36, 0, 0, null, null],
// #ObjectsUnder
[37, 0, 0, null, null], [38, 334, 148, null, null], [39, 0, 0, null, null], [40, 0, 0, null, null], [41, 334, 148, null, null], [42, 320, 239, null, null],
// #boat
[43, 320, 240, null, null],
// #Sail
[44, 321, 202, null, null],
// #Fog
[45, 0, 0, null, null],
// #ObjectsOver
[46, 0, 0, null, null], [47, 334, 148, null, null], [48, 0, 0, null, null], [49, 0, 0, null, null], [50, 334, 148, null, null], [52, 320, 240, '05.DXR', 153],
// frame border
[53, 320, 240, '05.DXR', 154], [54, 320, 240, '05.DXR', 155], [55, 320, 240, '05.DXR', 156], [57, 321, 202, null, null], [59, 320, 240, '05.DXR', 185],
// HUD panel
[60, 319, 220, null, null], [64, 36, 366, null, null],
// #Stroot  wind vane
[65, 320, 240, null, null],
// #BoatTypes
[66, 320, 240, null, null], [67, 320, 240, null, null], [68, 320, 240, '05.DXR', 173],
// #HelpButton
[70, 165, 244, '05.DXR', 197],
// speed meter
[72, 250, 445, '05.DXR', 117],
// fuel meter
[74, 320, 240, '05.DXR', 187],
// hunger meter
[75, 320, 240, null, null],
// #TRANS
[76, 0, 0, null, null], [77, 0, 0, null, null], [79, 320, 240, '05.DXR', 79],
// #MapOverview  litenkarta
[80, 0, 0, null, null],
// map region picture
[81, 635, 423, '05.DXR', 77],
// boat marker on the over-view map
[91, 0, 0, null, null],
// #medal / #dialog
[92, 0, 0, null, null],
// #DialogOverlay
[93, 0, 0, null, null], [94, 0, 0, null, null], [95, 0, 0, null, null], [96, 0, 0, null, null], [97, 0, 0, null, null], [98, 0, 0, null, null], [99, 0, 0, null, null], [100, 0, 0, null, null], [101, 0, 0, null, null], [102, 0, 0, null, null], [106, 673, 440, null, null],
// #ToolBox (kept off screen, art missing)
// BehaviourScript 7 - TransToNextMovie paints on the hardcoded channel 120,
// which has no score entry of its own (score index 123 = sprite 120). It is
// last in the list so it draws on top of everything else.
[120, 320, 240, null, null]];
const SPRITE_LIST = {
  '#Water': 15,
  '#UnderMap': 18,
  '#waves': 20,
  '#map': 34,
  '#ObjectsUnder': 36,
  '#boat': 42,
  '#Sail': 43,
  '#Fog': 44,
  '#ObjectsOver': 45,
  '#Stroot': 64,
  '#BoatTypes': 65,
  '#HelpButton': 68,
  '#speed': 70,
  '#fuel': 72,
  '#hunger': 74,
  '#TRANS': 75,
  '#MapOverview': 79,
  '#medal': 91,
  '#dialog': 91,
  '#DialogOverlay': 92,
  '#ToolBox': 106,
  '#TransToNext': 120
};
const CHEAT_BOAT_PARTS = [724, 848, 792, 123, 162, 120, 178];

/**
 * The default save has no usable drive, in which case the original falls back
 * to the "CheatBoat" parts. This has to happen before preload() because the
 * boat cast library (BS/BM/BL x W/S) is picked from the mounted parts.
 *
 * @param  {MulleGame} game Main game
 * @return {Object}         Refreshed boat properties
 */
function ensureDrivableBoat(game) {
  let props = (0,_objects_boat_props__WEBPACK_IMPORTED_MODULE_6__.refreshBoatProperties)(game);
  if ((0,_objects_boat_props__WEBPACK_IMPORTED_MODULE_6__.findPossiblePowers)(props).length === 0) {
    console.warn('[world] CheatBoat!');
    game.mulle.user.Car.Parts = CHEAT_BOAT_PARTS.slice();
    props = (0,_objects_boat_props__WEBPACK_IMPORTED_MODULE_6__.refreshBoatProperties)(game);
  }
  return props;
}

/* -------------------------------------------------------------------------
 * Frame lookup helpers
 * ---------------------------------------------------------------------- */

const warnedMembers = {};
function warnMissing(movie, member) {
  const key = movie + '_' + member;
  if (warnedMembers[key]) return;
  warnedMembers[key] = 1;
  console.warn('[world] member not found', movie, member);
}
let FRAME_INDEX = null;
function buildFrameIndex(game) {
  if (FRAME_INDEX) return FRAME_INDEX;
  const byMovie = {};
  const byName = {}; // keyed by member name (dirName)
  const byFrameName = {}; // keyed by atlas frame name (fr.name)

  const keys = game.cache.getKeys(Phaser.Cache.IMAGE);
  for (const key of keys) {
    const img = game.cache.getImage(key, true);
    if (!img || !img.frameData) continue;
    const frames = img.frameData.getFrames();
    for (const f in frames) {
      const fr = frames[f];
      if (fr.dirFile && fr.dirNum !== undefined && fr.dirNum !== null) {
        if (!byMovie[fr.dirFile]) byMovie[fr.dirFile] = {};
        if (byMovie[fr.dirFile][fr.dirNum] === undefined) {
          byMovie[fr.dirFile][fr.dirNum] = [key, fr.name];
        }
      }
      if (fr.dirName) {
        const regpoint = fr.regpoint || null;
        if (!byName[fr.dirName]) byName[fr.dirName] = [];
        byName[fr.dirName].push({
          movie: fr.dirFile,
          frame: [key, fr.name],
          width: fr.width,
          height: fr.height,
          regpoint: regpoint
        });

        // Also index by frame name for direct lookups
        if (!byFrameName[fr.name]) byFrameName[fr.name] = [];
        byFrameName[fr.name].push({
          movie: fr.dirFile,
          frame: [key, fr.name],
          width: fr.width,
          height: fr.height,
          regpoint: regpoint
        });
      }
    }
  }
  FRAME_INDEX = {
    byMovie,
    byName,
    byFrameName
  };
  return FRAME_INDEX;
}
function invalidateFrameIndex() {
  FRAME_INDEX = null;
}
function frameRect(idx, movie, name, loc) {
  // name can be a member name (dirName) or an atlas frame name
  // Try byFrameName first (for frame name lookups from getMemberRect)
  let list = idx.byFrameName[name];
  if (!list || !list.length) {
    // Fall back to byName (for member name lookups)
    list = idx.byName[name];
  }
  if (!list || !list.length) return null;
  let hit = null;
  for (const e of list) {
    if (e.movie === movie) {
      hit = e;
      break;
    }
  }
  if (!hit) hit = list[0];
  if (!hit.width || !hit.height) return null;
  const reg = hit.regpoint || {
    x: 0,
    y: 0
  };
  const at = loc || {
    x: 320,
    y: 240
  };
  const left = at.x - reg.x;
  const top = at.y - reg.y;
  return [left, top, left + hit.width, top + hit.height];
}

/* -------------------------------------------------------------------------
 * MapObject - the `Object` parent script
 *
 * NOTE: the 05.DXR `Object` parent script itself is not part of the shipped
 * movie (it lives in a behaviour the decompiler cannot reach) and none of the
 * `31b*` object pictures exist in any built pack. Radius tracking, the
 * `#dest` transitions and the pickup `CheckFor`/`SetWhenDone` logic are
 * therefore reimplemented from objects.hash.json, while the sprites are
 * simply never assigned.
 * ---------------------------------------------------------------------- */

function asList(v) {
  if (v === undefined || v === null || v === 0 || v === '') return [];
  if (Array.isArray(v)) return v.filter(x => x !== null && x !== undefined);
  if (typeof v === 'object') return Object.keys(v).length ? [v] : [];
  return [v];
}
function isEmptySpec(v) {
  if (v === undefined || v === null || v === 0 || v === '') return true;
  if (Array.isArray(v)) return v.length === 0 || v.every(x => x === null || x === undefined);
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}
class MapObject {
  constructor(dir, objectId) {
    this.dir = dir;
    this.objectId = objectId;
    const data = (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.ObjectsDB || {})[objectId] || (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.ObjectsDB || {})[String(objectId)] || {};
    this.data = data;
    this.type = data.type || '#dest';
    this.innerRadius = data.InnerRadius || 45;
    this.outerRadius = data.OuterRadius || 65;
    this.dirResource = data.DirResource || '';
    this.sounds = data.Sounds || [];
    this.ifFound = data.IfFound;
    this.insideInner = 0;
    this.insideOuter = 0;
    this.active = 1;
    this.collected = 0;
    this.loc = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(0, 0);
    this.sprites = null;
  }

  /**
   * @return {number} 1 when the object should be tracked
   */
  init(sprites, loc, optional, boatLoc) {
    this.sprites = sprites;
    this.loc = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(loc.x, loc.y);
    this.optional = optional || {};
    this.boatLoc = boatLoc;
    this.insideInner = 0;
    this.insideOuter = 0;
    this.collected = 0;
    this.active = 1;

    // Check IfFound logic (like Lingo Object.init)
    const ifFound = this.data.IfFound;
    if (ifFound && typeof ifFound === 'string' && ifFound.charAt(0) === '#') {
      const checkFor = this.data.CheckFor || {};
      let foundOne = false;
      if (checkFor && typeof checkFor === 'object' && !Array.isArray(checkFor)) {
        const user = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user;
        const level = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.level || 1;
        for (const key in checkFor) {
          const k = key.toLowerCase();
          const need = asList(checkFor[key]);
          let ok = false;
          if (k === 'inventory') {
            ok = need.every(item => (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(user, item));
          } else if (k === 'level') {
            ok = need.includes(level);
          } else if (k === 'notgivenmissions') {
            ok = need.every(m => !(user.givenMissions || []).includes(m));
          } else if (k === 'missiongiven') {
            ok = need.every(m => (user.givenMissions || []).includes(m));
          } else if (k === 'parts') {
            const parts = user.Car ? user.Car.Parts : [];
            ok = need.every(p => p === '#Random' || p === '#random' || parts.includes(p));
          } else if (k === 'boatprop') {
            const props = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat ? _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.quickProps : {};
            ok = need.every(p => props[String(p).replace(/^#/, '').toLowerCase()]);
          }
          if (ok) {
            foundOne = true;
            break;
          }
        }
      }
      if (foundOne) {
        const ifFoundVal = ifFound.replace(/^#/, '').toLowerCase();
        if (ifFoundVal === 'nodisplay') return 0;
        if (ifFoundVal === 'noenter') this.canEnter = 0;
      }
    }

    // Set up initial frame from FrameList['normal']
    const frameList = this.data.FrameList || {};
    const normalFrames = frameList.normal || frameList.Normal || frameList.Normal || [];
    if (normalFrames.length > 0) {
      const firstFrame = normalFrames[0];
      if (firstFrame && firstFrame !== 'Dummy' && firstFrame !== '0') {
        // Use the first sprite (SPUnder) for the object
        const spUnder = sprites[1];
        if (spUnder) {
          this.dir.state.setMemberByName(spUnder, firstFrame);
          this.dir.state.setSpriteLoc(spUnder, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(this.loc.x, this.loc.y));
        }
      }
    }
    return 1;
  }
  getSpritesInfo() {
    return this.data.SpriteInfo || {};
  }

  /** Is the pickup allowed to exist right now? */
  checkForOK() {
    const spec = this.data.CheckFor;
    if (isEmptySpec(spec)) return true;
    if (typeof spec !== 'object' || Array.isArray(spec)) return true;
    const user = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user;
    const level = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.level || 1;
    for (const key in spec) {
      const k = key.toLowerCase();
      const need = asList(spec[key]);
      if (k === 'inventory') {
        for (const item of need) {
          const name = typeof item === 'string' ? item : item;
          if (!(0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(user, name)) return false;
        }
      } else if (k === 'level') {
        if (need.indexOf(level) < 0) return false;
      } else if (k === 'notgivenmissions') {
        for (const m of need) {
          if ((user.givenMissions || []).indexOf(m) >= 0) return false;
        }
      } else if (k === 'missiongiven') {
        for (const m of need) {
          if ((user.givenMissions || []).indexOf(m) < 0) return false;
        }
      } else if (k === 'parts') {
        const parts = user.Car ? user.Car.Parts : [];
        for (const p of need) {
          if (p === '#Random' || p === '#random') continue;
          if (parts.indexOf(p) < 0) return false;
        }
      } else if (k === 'boatprop') {
        const props = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat ? _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.quickProps : {};
        for (const p of need) {
          const name = String(p).replace(/^#/, '').toLowerCase();
          if (!props[name]) return false;
        }
      }
    }
    return true;
  }
  setWhenDone() {
    const spec = this.data.SetWhenDone;
    if (isEmptySpec(spec) || typeof spec !== 'object' || Array.isArray(spec)) return;
    const user = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user;
    if (spec.Inventory) {
      for (const item of asList(spec.Inventory)) (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.setInInventory)(user, item, item);
    }
    if (spec.Missions) {
      if (!user.givenMissions) user.givenMissions = [];
      for (const m of asList(spec.Missions)) {
        if (user.givenMissions.indexOf(m) < 0) user.givenMissions.push(m);
      }
    }
    if (spec.Medals && user.Car && user.Car.addMedal) {
      for (const m of asList(spec.Medals)) user.Car.addMedal(m);
    }
  }

  /** @return {string} '#EnterInnerRadius' | ... | 0 */
  step(boatLoc) {
    if (!this.active) return 0;

    // Animate the sprite frames (like Destination.step)
    if (this.sprites && this.sprites[1]) {
      const frameList = this.data.FrameList || {};
      let frames = frameList.normal || frameList.Normal || [];
      if (!frames.length) frames = frameList.Inner || frameList.inner || frameList.Inner || [];
      if (!frames.length) frames = frameList.Outer || frameList.outer || frameList.Outer || [];
      if (frames.length > 0) {
        this._frameCounter = (this._frameCounter || 0) + 1;
        if (this._frameCounter >= frames.length) this._frameCounter = 0;
        const frame = frames[this._frameCounter];
        if (frame && frame !== 'Dummy' && frame !== '0') {
          this.dir.state.setMemberByName(this.sprites[1], frame);
        }
      }
    }
    const event = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.checkRadius)(this, boatLoc, this.loc, '#both');
    if (!event) return 0;
    if (event === '#EnterBoth' || event === '#EnterInnerRadius') {
      if (this.type === '#dest') {
        this.enterDestination();
      } else if (this.type === '#rdest') {
        this.pickup();
      } else if (this.type === '#custom') {
        this.customEnter();
      }
    }
    return event;
  }
  enterDestination() {
    // A grace period so the boat cannot trigger the destination it just
    // spawned next to when a map is entered.
    if (this.dir.mapAge < 180) return;
    if (!this.dirResource) return;
    const scene = this.dir.resolveDirResource(this.dirResource);
    if (!scene) return;
    if (this.sounds.length) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(this.sounds[0], '#EFFECT');
    this.dir.prepareToLeave(this.dirResource);
  }
  pickup() {
    if (this.collected) return;
    if (!this.checkForOK()) return;
    this.setWhenDone();
    this.collected = 1;
    if (this.sounds.length) {
      for (const s of this.sounds) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(s, '#EFFECT');
    }
  }
  customEnter() {
    const custom = (this.data.CustomObject || '').toLowerCase();
    if (custom === 'gas') {
      // Refuel when moored next to the gas station.
      if (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat && _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.fuel !== '#Full') {
        if (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.fuel <= (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.quickProps.maxfuelvolume || 0) * 0.95) return;
      }
      if (this.sounds.length) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(this.sounds[1] || this.sounds[0], '#EFFECT');
    } else if (custom === 'compass') {
      // The compass object shows a compass at the object location
      // This is handled by the ObjectCompassScript - here we just trigger it
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const compassFrames = frameList.normal || frameList.Normal || [];
        if (compassFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], compassFrames[0]);
        }
      }
    } else if (custom === 'fogedge') {
      // Fog edge - visual effect, could show fog particles
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const fogFrames = frameList.normal || frameList.Normal || [];
        if (fogFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], fogFrames[0]);
        }
      }
    } else if (custom === 'nomotor') {
      // No motor zone - disable motor when entering
      if (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat && _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.ancestor && _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat.ancestor.type === '#Motor') {
        _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.mulleTalk.say('#NoMotor', 4, _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.boat, '#Q');
      }
    } else if (custom === 'bridge') {
      // Bridge - can pass under if mast is low enough
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const bridgeFrames = frameList.normal || frameList.Normal || [];
        if (bridgeFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], bridgeFrames[0]);
        }
      }
    } else if (custom === 'riverenter') {
      // River entrance - mark on map
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const riverFrames = frameList.normal || frameList.Normal || [];
        if (riverFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], riverFrames[0]);
        }
      }
    } else if (custom === 'randomanim') {
      // Random animation - cycle through frames
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const animFrames = frameList.normal || frameList.Normal || [];
        if (animFrames.length > 0) {
          this._animCounter = (this._animCounter || 0) + 1;
          if (this._animCounter >= animFrames.length) this._animCounter = 0;
          this.dir.state.setMemberByName(this.sprites[1], animFrames[this._animCounter]);
        }
      }
    } else if (custom === 'racing') {
      // Racing - start a race
      if (this.sounds.length) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(this.sounds[0], '#EFFECT');
      // Could start a race minigame here
    } else if (custom === 'mullecomment') {
      // Mulle comment - play random comment
      if (this.sounds.length) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(this.sounds[0], '#EFFECT');
    } else if (custom === 'picture') {
      // Picture frame - display picture
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const pictureFrames = frameList.normal || frameList.Normal || [];
        if (pictureFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], pictureFrames[0]);
        }
      }
    } else if (custom === 'reef') {
      // Reef - hazard warning
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const reefFrames = frameList.normal || frameList.Normal || [];
        if (reefFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], reefFrames[0]);
        }
      }
    } else if (custom === 'maelstrom') {
      // Maelstrom - whirlpool effect
      if (this.sounds.length) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(this.sounds[0], '#EFFECT');
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const maelstromFrames = frameList.normal || frameList.Normal || [];
        if (maelstromFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], maelstromFrames[0]);
        }
      }
    } else if (custom === 'stream') {
      // Stream - water current
      if (this.sprites && this.sprites[1]) {
        const frameList = this.data.FrameList || {};
        const streamFrames = frameList.normal || frameList.Normal || [];
        if (streamFrames.length > 0) {
          this.dir.state.setMemberByName(this.sprites[1], streamFrames[0]);
        }
      }
    } else if (custom === 'racing') {
      // Racing - handled above
    }
  }
  kill() {
    this.active = 0;
    this.insideInner = 0;
    this.insideOuter = 0;
    // Hide the object's sprite(s)
    if (this.sprites) {
      for (const sp of this.sprites) {
        if (sp) this.dir.state.hideSprite(sp);
      }
    }
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * MapDisplay - BehaviourScript 78
 * ---------------------------------------------------------------------- */

const ROLL_OVERS = {
  1: [[30, 100, 67, 124], [144, 128, 182, 160], [95, 204, 152, 238], [32, 193, 70, 225], [178, 274, 202, 311], [271, 199, 295, 236], [72, 157, 146, 199], [-1, 352, 73, 394]],
  2: [[212, 352, 263, 389], [274, 277, 298, 314], [326, 318, 367, 367], [364, 381, 433, 421]],
  3: [[402, 85, 457, 134], [479, 277, 504, 314], [531, 244, 560, 276]],
  4: [[530, 327, 620, 378]]
};
const REGION_PICS = {
  6: 10,
  7: 12,
  8: 11,
  9: 15,
  10: 13,
  11: 14,
  12: 19,
  13: 16,
  14: 17,
  15: 18,
  16: 20,
  17: 21
};
const REGION_SOUNDS = {
  6: '19d001v0',
  7: '19d003v0',
  8: '19d002v0',
  9: '19d005v0',
  10: '19d004v0',
  11: '19d006v0',
  12: '19d009v0',
  13: '19d007v0',
  14: '19d008v0',
  15: '19d010v0',
  16: '19d011v0',
  17: '19d012v0',
  18: '19d013v0',
  19: '19d014v0',
  20: '19d015v0',
  21: '19d016v0'
};
class MapDisplay {
  constructor(dir) {
    this.dir = dir;
    this.SP = SPRITE_LIST['#MapOverview'];
    this.displaying = 0;
    this.active = 1;
    this.regionPics = REGION_PICS;
    this.rollovers = ROLL_OVERS;
    this.sounds = REGION_SOUNDS;
    const rect = frameRect(buildFrameIndex(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game), '05.DXR', 'litenkarta') || [2, 410, 66, 471];
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.worldState.registerRect('map', rect, {
      onOver: () => {
        if (this.active && !this.displaying) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setMemberByName(this.SP, 'litenkarta-hi');
      },
      onOut: () => {
        if (this.active && !this.displaying) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setMemberByName(this.SP, 'litenkarta');
      },
      onUp: () => this.mouseUp()
    }, 'map');
  }
  activate(yesNo) {
    const was = this.active;
    this.active = yesNo ? 1 : 0;
    if (was && !this.active && this.displaying) this.kill();
  }
  mouseUp() {
    if (this.displaying) {
      this.kill();
      return;
    }
    if (!this.active) return;
    const world = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.world;
    if (world.getId().toLowerCase() !== 'da hood') return;
    this.dir.pause(1);
    this.dir.Mode = '#Waiting';

    // world overview, reveals more of the map as map pieces are collected
    let tmpMapMemb = 0;
    if ((0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user, '#MapPiece3')) tmpMapMemb = 4;else if ((0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user, '#MapPiece2')) tmpMapMemb = 3;else if ((0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user, '#MapPiece1')) tmpMapMemb = 2;else if ((0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.lookUpInventory)(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.user, '#MapPiece0')) tmpMapMemb = 1;
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setSpriteLoc(this.SP, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(320, 240));
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setMember(this.SP, '05.DXR', 81 + tmpMapMemb);
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setSpriteLoc(this.SP + 1, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(320, 240));
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.hideSprite(this.SP + 1);

    // boat marker
    const size = world.getWorldSize();
    const one = {
      x: 603 * 100 / size.x,
      y: 407 * 100 / size.y
    };
    const mc = this.dir.mapCoordinate;
    const boatLoc = this.dir.boat.getShowCoordinate();
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setSpriteLoc(this.SP + 2, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(19 + (mc.x - 1) * one.x / 100 + boatLoc.x * one.x / 6400, 16 + (mc.y - 1) * one.y / 100 + boatLoc.y * one.y / 4000));
    this.displaying = 1;
    this.activeRects = [];
    const rects = this.rollovers[1] || [];
    rects.forEach((r, i) => {
      _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.worldState.registerRect('rollover' + i, r, {
        onOver: () => this.hoverRegion(6 + i),
        onOut: () => {}
      }, 'rollover');
    });
  }
  hoverRegion(region) {
    const member = this.regionPics[region];
    if (!member) return;
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setMember(this.SP + 1, '05.DXR', 80 + member);
    const snd = this.sounds[region];
    if (snd) _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.sounds.play(snd, '#EFFECT');
  }
  kill() {
    const wasShowing = this.displaying;
    const ws = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.worldState;
    if (ws) ws.unregisterRects('rollover');
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setSpriteLoc(this.SP, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(320, 240));
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setMemberByName(this.SP, 'litenkarta');
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.hideSprite(this.SP + 1);
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir.setSpriteLoc(this.SP + 2, (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(-100, -100));
    this.displaying = 0;
    if (wasShowing) {
      this.dir.pause(0);
      this.dir.Mode = '#Driving';
    }
  }
}

/* -------------------------------------------------------------------------
 * Dir - ParentScript 2
 * ---------------------------------------------------------------------- */

class Dir {
  constructor(state) {
    this.state = state;
    this.game = state.game;
    this.sounds = new _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.SailSound(state.game);
    this.drivingHandlers = null;
    this.boat = null;
    this.counter = 1;
    this.Mode = '#normal';
    this.cycling = 0;
    this.spriteList = Object.assign({}, SPRITE_LIST);
    this.ambience = null;
    this.map = null;
    this.mapCoordinate = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(0, 0);
    this.objects = [];
    this.weatherRenderer = null;
    this.nextDir = '04';
    this.gotKeyPoll = 1;
    this.mulleTalk = null;
    this.transPic = '';
    this.transSnd = '';
    this.pausing = 0;
    this.isLeaving = 0;
    this.mapAge = 0;
    this.rDests = {};
    this.boatPack = 'BSW.CXT';
    this.mapDisplay = null;
    this.interfaceActive = 1;
  }

  /* ------------------------------------------------------- lifecycle */

  init() {
    this.loadWorld();
    this.mapCoordinate = this.world.getStartInfo().map;
    this.boat = new _objects_boat_boatbase__WEBPACK_IMPORTED_MODULE_4__.BoatBase();
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir = this;

    // pick the boat cast library: BS/BM/BL + W(ood)/S(teel)
    this.boatPack = this.chooseBoatPack();
    this.mulleTalk = new _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__.MulleSez();
    this.ambience = new _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__.AmbienceSound();
    this.weatherRenderer = new _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__.WeatherRenderer();
    this.weatherRenderer.init();
    this.mapDisplay = new MapDisplay(this);
    const saved = lookUpDrivingInfo(this.game.mulle.user);
    if (saved && typeof saved === 'object') {
      if (saved.map) this.mapCoordinate = saved.map;
      this.boat.load(saved);
    } else {
      const start = this.world.getStartInfo();
      this.boat.load({
        direction: start.direction,
        loc: start.coordinate
      });
    }
    this.boat.init();

    // makeCheatBoat() may have replaced the parts during init(), so the cast
    // library (BS/BM/BL + W/S) has to be picked again before the first frame.
    this.boatPack = this.chooseBoatPack();
    this.changeMap(this.mapCoordinate, '#Absolute');
    this.Mode = '#Driving';
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.addObject(this);
  }
  chooseBoatPack() {
    const props = (0,_objects_boat_props__WEBPACK_IMPORTED_MODULE_6__.refreshBoatProperties)(this.game);
    const material = props.material === 1 ? 'W' : 'S';
    let prefix = 'BM';
    if (props.smallship) prefix = 'BS';else if (props.largeship) prefix = 'BL';
    return prefix + material + '.CXT';
  }
  makeCheatBoat() {
    const user = this.game.mulle.user;
    user.Car.Parts = CHEAT_BOAT_PARTS.slice();
    setDrivingInfo(user, 0);
    console.warn('[world] CheatBoat!');
  }
  kill() {
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.deleteObject(this);
    this.objects.forEach(o => o.kill());
    this.objects = [];
    if (this.boat) this.boat.kill();
    if (this.weatherRenderer) this.weatherRenderer.kill();
    if (this.ambience) this.ambience.kill();
    if (this.mulleTalk) this.mulleTalk.kill();
    if (this.mapDisplay) this.mapDisplay.activate(0);
    this.sounds.play('', '');
    return 0;
  }

  /* ---------------------------------------------------------- input */

  pollKeys() {
    const kb = this.game.input.keyboard;
    let lr = 0;
    let ud = 0;
    if (kb.isDown(Phaser.Keyboard.LEFT)) lr = '#left';else if (kb.isDown(Phaser.Keyboard.RIGHT)) lr = '#right';
    if (kb.isDown(Phaser.Keyboard.UP)) ud = '#up';else if (kb.isDown(Phaser.Keyboard.DOWN)) ud = '#down';
    this.key(lr, ud);
  }
  key(arg1, arg2) {
    const boat = this.boat;
    if (!boat) return;
    if (boat.steerMethod === '#Keys') {
      boat.steer(arg1, arg2);
    } else if (arg1 !== 0 || arg2 !== 0) {
      boat.steerMethod = '#Keys';
      boat.steer(arg1, arg2);
    }
  }
  mouse(argObj, argWhat) {
    if (this.pausing) return;
    if (argWhat === '#down' && this.boat && this.boat.steerMethod !== '#mouse') {
      this.boat.steerMethod = '#mouse';
    }
  }
  loop() {
    if (this.Mode === '#Driving') {
      this.pollKeys();
      this.boat.loop();
      const loc = this.boat.getShowCoordinate();
      this.objects.forEach(o => o.step(loc));
      this.mapAge += 1;
    }
  }
  pause(argYesNo) {
    this.pausing = argYesNo;
    if (this.boat) {
      this.boat.programControl(argYesNo);
      this.boat.playSounds(!argYesNo);
    }
    this.activateinterface(!argYesNo);
    if (this.weatherRenderer) this.weatherRenderer.allowRadio(!argYesNo);
    if (!argYesNo && this.Mode === '#Waiting') this.Mode = '#Driving';
  }
  activateinterface(argYesNo) {
    this.interfaceActive = argYesNo ? 1 : 0;
    this.state.setInterfaceActive(argYesNo);
    if (this.mapDisplay) this.mapDisplay.active = argYesNo ? 1 : 0;
    if (this.boat && this.boat.SelectorMaster) this.boat.SelectorMaster.activate(argYesNo);
  }

  /* ----------------------------------------------------------- world */

  loadWorld() {
    const gml = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals;
    if (!gml.world) {
      const name = 'Da Hood';
      const data = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.WorldsDB[name];
      if (!data) {
        console.error('[world] missing world data', name);
        return;
      }
      gml.world = new World(name, data, _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game);
    }
    if (!gml.maps) gml.maps = new Maps(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game);
    if (!lookUpDrivingInfo(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game.mulle.user)) {
      gml.world.randomizeDestinations();
    }
    this.world = gml.world;
    this.map = new Map();
    gml.maps.map = this.map;
  }

  /**
   * @param {Object|number} thePoint Target cell (or map id when absolute)
   * @param {string}        theMode  '#Relational' | '#Absolute'
   * @param {boolean}       theRealInit Skip the per map setup
   */
  changeMap(thePoint, theMode, theRealInit) {
    if (theMode === undefined || theMode === null) theMode = '#Relational';
    if (thePoint === undefined || thePoint === null) thePoint = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(0, 0);
    const tmpMapID = this.world.getNewMapId(thePoint, theMode, 0);
    if (!Number.isInteger(tmpMapID)) {
      console.warn('[world] map error', tmpMapID);
      return 0;
    }
    if (theMode === '#Relational') {
      this.mapCoordinate = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(this.mapCoordinate.x + thePoint.x, this.mapCoordinate.y + thePoint.y);
    } else {
      this.mapCoordinate = thePoint;
    }
    const status = _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.maps.loadMap(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.maps, this.map, tmpMapID);
    if (typeof status === 'string' && status.charAt(0) === '#') {
      console.error('[world] Map error:', status);
      return 0;
    }
    const start = this.world.getStartInfo().map;
    const tmpDiff = {
      x: this.mapCoordinate.x - start.x,
      y: this.mapCoordinate.y - start.y
    };
    const tmpDist = Math.sqrt(tmpDiff.x * tmpDiff.x + tmpDiff.y * tmpDiff.y);
    const tmpWindSpeedFactor = this.map.getSpecial('#windspeed');
    const tmpFog = this.map.getSpecial('#Fog');
    if (tmpFog) {
      this.weatherRenderer.changeMap('#hide', tmpWindSpeedFactor);
      this.state.hideSprite(this.spriteList['#map']);
      this.state.setMemberByName(this.spriteList['#Fog'], 'FogPic');
    } else {
      this.weatherRenderer.changeMap(null, tmpWindSpeedFactor);
      this.state.setMemberByName(this.spriteList['#map'], this.map.getMapImage());
      const tmpUnder = this.map.getUnderMapImage();
      if (typeof tmpUnder === 'string' && tmpUnder) {
        this.state.setMemberByName(this.spriteList['#UnderMap'], tmpUnder);
      } else {
        this.state.hideSprite(this.spriteList['#UnderMap']);
      }
      this.state.hideSprite(this.spriteList['#Fog']);
    }
    this.mapAge = 0;
    if (theRealInit === undefined || theRealInit === null) {
      this.boat.setTopology(this.map.getTopology());
      this.correctedBoatLoc = null;
      this.goThroughObjects();
      if (this.correctedBoatLoc) {
        this.boat.setCoordinate(this.correctedBoatLoc, '#AdjustTopo');
      }
    }
    return 1;
  }
  goThroughObjects() {
    this.objects.forEach(o => o.kill());
    this.objects = [];
    this.rDests = this.world.getRandomDestinations();
    const spUnder = this.spriteList['#ObjectsUnder'];
    const spOver = this.spriteList['#ObjectsOver'];
    for (let n = 0; n < 6; n++) this.state.hideSprite(spUnder + n);
    for (let n = 0; n < 6; n++) this.state.hideSprite(spOver + n);
    const tmpObjects = this.map.getObjects();
    const boatLoc = this.boat.getShowCoordinate();
    let spCounterUnder = 0;
    let spCounterOver = 0;
    for (const objData of tmpObjects) {
      const objectId = objData[0];
      const objectLoc = objData[1];
      const optional = objData.length === 3 ? objData[2] : {};
      const tmpObj = new MapObject(this, objectId);
      let tmpOK = 0;
      if (tmpObj.type === '#rdest') {
        const tmpInMap = this.rDests[objectId];
        if (tmpInMap === this.mapCoordinate.x + (this.mapCoordinate.y - 1) * 10) tmpOK = 1;
      } else if (tmpObj.type === '#Correct') {
        const dx = boatLoc.x - objectLoc.x;
        const dy = boatLoc.y - objectLoc.y;
        const hypo = Math.sqrt(dx * dx + dy * dy);
        let radius = 80;
        if (optional && typeof optional === 'object' && (optional.InnerRadius || optional.innerradius) !== undefined) {
          radius = optional.InnerRadius || optional.innerradius || 80;
        }
        if (hypo < radius) this.correctedBoatLoc = (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(objectLoc.x, objectLoc.y);
      } else {
        tmpOK = 1;
      }
      if (tmpOK) {
        const showIt = tmpObj.init([spCounterOver + spOver, spCounterUnder + spUnder], objectLoc, optional, boatLoc);
        if (showIt) {
          // Update sprite counters from the object's getSpritesInfo
          const spInfo = tmpObj.getSpritesInfo();
          if (spInfo && typeof spInfo === 'object') {
            for (const [key, count] of Object.entries(spInfo)) {
              const k = key.toLowerCase();
              if (k === 'under' || k === '#under') spCounterUnder += count;else if (k === 'over' || k === '#over') spCounterOver += count;
            }
          }
          this.objects.push(tmpObj);
        }
      }
    }
  }
  resolveDirResource(dirResource) {
    const scenes = this.game.mulle.scenes;
    return scenes[String(dirResource)] || scenes[parseInt(dirResource, 10)] || null;
  }
  prepareToLeave(argToDir, argTransPic, argTransSnd) {
    if (this.isLeaving) return;
    this.isLeaving = 1;
    const user = this.game.mulle.user;
    const tmpSave = this.boat.save();
    tmpSave.map = this.mapCoordinate;
    this.nextDir = String(argToDir);
    if (this.ambience) this.ambience.activate(0);
    this.activateinterface(0);

    // Set active mission for mission scene transition
    const scenes = this.game.mulle.scenes;
    const targetScene = scenes[String(argToDir)] || scenes[parseInt(argToDir, 10)];
    if (targetScene && targetScene.startsWith('mission')) {
      this.game.mulle.activeMission = argToDir;
    }
    if (this.nextDir === '04' || this.nextDir === '03') {
      setDrivingInfo(user, 0);
      this.transPic = argTransPic || '33b018v0';
      this.transSnd = argTransSnd || '';
    } else if (this.nextDir === '08') {
      setDrivingInfo(user, tmpSave);
      this.transPic = 'TransTmp8';
      this.transSnd = '';
    } else {
      setDrivingInfo(user, tmpSave);
      this.transPic = '33b007v0';
      this.transSnd = '33e007v0';
    }
    this.Mode = '#Leave';
    this.leaveFrames = 0;
  }

  /** TransToNextMovie behaviour: show the transition, then change state. */
  tick() {
    if (this.Mode !== '#Leave') return;
    const sp = this.spriteList['#TransToNext'];
    this.leaveFrames += 1;
    if (this.leaveFrames === 1) {
      this.state.setMemberByName(sp, this.transPic);
      if (this.transSnd) this.sounds.play(this.transSnd, '#EFFECT');
    }
    const sndBusy = this.transSnd && !this.sounds.finished(this.transSnd);
    if (this.leaveFrames > 8 && !sndBusy) {
      const target = this.game.mulle.scenes[this.nextDir];
      if (target && this.game.state.states[target]) {
        invalidateFrameIndex();
        this.game.state.start(target);
      } else {
        console.warn('[world] no scene for', this.nextDir);
        this.isLeaving = 0;
        this.Mode = '#Driving';
        this.state.hideSprite(sp);
        this.activateinterface(1);
      }
    }
  }

  /* ------------------------------------------------------ sprite glue */

  /**
   * `the number of member "xxx"` - resolve a Director member number.
   * @param  {string} movie  Movie name
   * @param  {string|number} member Member number or member name
   * @return {number}        Member number, 0 when not found
   */
  findMember(movie, member) {
    if (typeof member === 'number') {
      const table = buildFrameIndex(this.game).byMovie[movie];
      return table && table[member] !== undefined ? member : 0;
    }
    const list = buildFrameIndex(this.game).byName[member];
    if (!list) return 0;
    for (const e of list) {
      if (e.movie === movie) return this.memberNumber(movie, e.frame[1]);
    }
    return this.memberNumber(movie, list[0].frame[1]);
  }
  memberNumber(movie, frameName) {
    const table = buildFrameIndex(this.game).byMovie[movie];
    if (!table) return 0;
    for (const num in table) {
      if (table[num][1] === frameName) return parseInt(num, 10);
    }
    return 0;
  }

  /** Hit rect of a member assuming its sprite sits at (320, 240). */
  getMemberRect(movie, member) {
    const idx = buildFrameIndex(this.game);
    const table = idx.byMovie[movie];
    if (!table || table[member] === undefined) return [0, 0, 32, 32];
    const name = table[member][1];
    return frameRect(idx, movie, name) || [0, 0, 32, 32];
  }
  setMember(spriteNum, movie, member) {
    return this.state.setMember(spriteNum, movie, member);
  }
  setMemberByName(spriteNum, name) {
    return this.state.setMemberByName(spriteNum, name);
  }
  hideSprite(spriteNum) {
    return this.state.hideSprite(spriteNum);
  }
  setSpriteLoc(spriteNum, loc) {
    return this.state.setSpriteLoc(spriteNum, loc);
  }
  getSpriteLoc(spriteNum) {
    return this.state.getSpriteLoc(spriteNum);
  }
}

/* -------------------------------------------------------------------------
 * World / Map / Maps - the 00.CXT helpers
 * ---------------------------------------------------------------------- */

class World {
  constructor(id, data, game) {
    this.game = game;
    this.WorldId = id;
    this.id = id;
    this.map = data.map || [];
    this.StartMap = {
      x: data.StartMap.x,
      y: data.StartMap.y
    };
    this.StartCoordinate = {
      x: data.StartCoordinate.x,
      y: data.StartCoordinate.y
    };
    this.StartDirection = data.StartDirection;
    this.currentMap = {
      x: this.StartMap.x,
      y: this.StartMap.y
    };
    this.symbolPosition = data.symbolPosition || 0;
    this.rDests = {};
    this.enteredObjectId = 0;
  }
  getId() {
    return this.WorldId;
  }
  getStartInfo() {
    return {
      map: {
        x: this.StartMap.x,
        y: this.StartMap.y
      },
      coordinate: {
        x: this.StartCoordinate.x,
        y: this.StartCoordinate.y
      },
      direction: this.StartDirection
    };
  }
  getWorldSize() {
    return {
      x: this.map[0] ? this.map[0].length : 0,
      y: this.map.length
    };
  }
  getCurrentMapId() {
    const y = this.currentMap.y;
    if (y < 1 || y > this.map.length) return '#InvalidYIndex';
    const list = this.map[y - 1];
    const x = this.currentMap.x;
    if (x < 1 || x > list.length) return '#InvalidXIndex';
    const v = list[x - 1];
    return Number.isInteger(v) ? v : '#InvalidXIndex';
  }

  /**
   * @param {Object}  thePoint    Cell, relative when theMode is '#Relational'
   * @param {string}  theMode     '#Relational' | '#Absolute'
   * @param {boolean} theJustCheck Do not commit the new cell
   * @return {number|string} Map id or an error symbol
   */
  getNewMapId(thePoint, theMode, theJustCheck) {
    let p = thePoint;
    if (theMode === '#Relational') p = {
      x: thePoint.x + this.currentMap.x,
      y: thePoint.y + this.currentMap.y
    };
    if (p.y < 1 || p.y > this.map.length) return '#InvalidYIndex';
    const list = this.map[p.y - 1];
    if (p.x < 1 || p.x > list.length) return '#InvalidXIndex';
    if (theJustCheck !== 1 && theJustCheck !== true) this.currentMap = {
      x: p.x,
      y: p.y
    };
    const v = list[p.x - 1];
    return Number.isInteger(v) ? v : '#InvalidXIndex';
  }

  /** Every `#rdest` object gets one random map cell where it shows up. */
  randomizeDestinations() {
    const maps = this.game.mulle.MapsDB;
    const rdests = {};
    for (const mapId in maps) {
      const objects = maps[mapId].objects || [];
      for (const o of objects) {
        const def = (this.game.mulle.ObjectsDB || {})[o[0]];
        if (def && def.type === '#rdest') {
          if (!rdests[o[0]]) rdests[o[0]] = [];
          rdests[o[0]].push(parseInt(mapId, 10));
        }
      }
    }
    this.rDests = {};
    for (const id in rdests) {
      const cells = rdests[id];
      this.rDests[id] = cells[(0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.random)(cells.length) - 1];
    }
    return this.rDests;
  }
  getRandomDestinations() {
    if (!Object.keys(this.rDests).length) this.randomizeDestinations();
    return this.rDests;
  }
  getEnteredObject() {
    return this.enteredObjectId;
  }
}
class Map {
  constructor() {
    this.MapId = 0;
    this.objects = [];
    this.MapImage = '';
    this.underMapImage = '';
    this.Topology = '';
    this.Special = null;
  }
  getMapImage() {
    return this.MapImage;
  }
  getUnderMapImage() {
    return this.underMapImage;
  }
  getObjects() {
    return this.objects;
  }
  getTopology() {
    return this.Topology;
  }
  getSpecial(argProp) {
    if (!argProp) return this.Special;
    if (this.Special && typeof this.Special === 'object') {
      for (const k in this.Special) {
        if (k.toLowerCase() === argProp.replace('#', '').toLowerCase()) {
          return this.Special[k];
        }
      }
    }
    return null;
  }
  fromJSON(data, id) {
    this.MapId = data.MapId !== undefined ? data.MapId : parseInt(id, 10);
    this.objects = data.objects || [];
    this.MapImage = data.MapImage || '';
    this.underMapImage = data.underMapImage || '';
    this.Topology = data.Topology || '';
    this.Special = data.Special || null;
  }
}
class Maps {
  constructor(game) {
    this.game = game;
    this.map = null;
    this.loadedMaps = [];
    this.currentMap = 0;
  }

  /** @return {number|string} 0 on success, error symbol otherwise */
  loadMap(maps, map, MapId) {
    const data = this.game.mulle.MapsDB[MapId];
    if (!data) return '#MissingMapDB';
    map.fromJSON(data, MapId);
    this.loadedMaps.push(MapId);
    this.currentMap = MapId;
    return 0;
  }
}

/* -------------------------------------------------------------------------
 * Driving info / mission helpers
 * ---------------------------------------------------------------------- */

function setDrivingInfo(user, value) {
  user.DrivingInfo = value;
}
function lookUpDrivingInfo(user) {
  return user.DrivingInfo;
}

/* -------------------------------------------------------------------------
 * The scene
 * ---------------------------------------------------------------------- */

class WorldState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor() {
    super();
    this.sprites = {};
    this.hitRects = [];
    this.prevPointerDown = false;
  }
  preload() {
    super.preload();

    // the boat pack is chosen from the mounted parts, so the user has to
    // exist before we start loading
    if (!this.game.mulle.user) {
      const keys = Object.keys(this.game.mulle.UsersDB);
      if (keys.length) this.game.mulle.user = this.game.mulle.UsersDB[keys[0]];else this.game.mulle.user = new _struct_savedata__WEBPACK_IMPORTED_MODULE_2__["default"](this.game);
    }
    const props = ensureDrivableBoat(this.game);
    const material = props.material === 1 ? 'W' : 'S';
    let prefix = 'BM';
    if (props.smallship) prefix = 'BS';else if (props.largeship) prefix = 'BL';
    const pack = (prefix + material).toLowerCase();
    this.game.load.pack('sailing', 'assets/sailing.json', null, this);
    this.game.load.pack('map', 'assets/map.json', null, this);
    this.game.load.pack('sailFrames', 'assets/sailFrames.json', null, this);
    this.game.load.pack(pack, 'assets/' + pack + '.json', null, this);
    this.load.atlas('topography-0', 'assets/topography/topography-0.png', 'assets/topography/topography-0.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    this.load.atlas('topography-1', 'assets/topography/topography-1.png', 'assets/topography/topography-1.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
  }
  create() {
    super.create();
    this.game.mulle.addAudio('sailing');
    invalidateFrameIndex();
    buildFrameIndex(this.game);
    const user = this.game.mulle.user;
    if (user.givenMissions === undefined) user.givenMissions = [];
    if (user.CompletedMissions === undefined) user.CompletedMissions = [];
    if (!user.Inventory) user.Inventory = {
      DrivenTimes: {
        Motor: 0,
        Sail: 0,
        Oar: 0
      }
    };
    this.game.mulle.worldState = this;

    // --- globals -----------------------------------------------------
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.game = this.game;
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals = {
      loopMaster: new _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__.LoopHandler(),
      user: user,
      level: user.Level || 1,
      world: null,
      maps: null,
      weather: null
    };
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.weather = new _objects_boat_weather__WEBPACK_IMPORTED_MODULE_5__.Weather(_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals);
    this.createSprites();

    // --- dir ---------------------------------------------------------
    const dir = new Dir(this);
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir = dir;
    this.dir = dir;
    this.game.mulle.gDir = dir;
    dir.init();
    this._firstUpdate = true;

    // Force correct start map (workaround for mapCoordinate initialization bug)
    dir.mapCoordinate = dir.world.getStartInfo().map;
    dir.world.currentMap = {
      x: dir.mapCoordinate.x,
      y: dir.mapCoordinate.y
    };
    this.setupInput();
    this.setupHelpButton();
    this.game.mulle.cursor.reset();
  }

  /**
   * HelpBH (BehaviorScript 175). Hovering swaps to `HelpButton-hi`, clicking
   * saves the drive state so the help movie can return to the right spot.
   *
   * NOTE: the original does `go(string(type), "ShowBoat")` which leaves for
   * SHOWBOAT.DXR / a Motor|Sail|Oar movie. Those are not part of this build,
   * so the save is written and the transition skipped.
   */
  setupHelpButton() {
    const dir = this.dir;
    const rect = frameRect(buildFrameIndex(this.game), '05.DXR', 'HelpButton') || [355, 450, 375, 473];
    this.registerRect('help', rect, {
      onOver: () => {
        if (dir.interfaceActive) this.setMemberByName(68, 'HelpButton-hi');
      },
      onOut: () => this.setMemberByName(68, 'HelpButton'),
      onUp: () => {
        if (!dir.interfaceActive) return;
        const type = dir.boat ? dir.boat.getType() : 0;
        if (typeof type !== 'string' || type.charAt(0) !== '#') return;
        const tmpSave = dir.boat.save();
        tmpSave.map = dir.mapCoordinate;
        setDrivingInfo(this.game.mulle.user, tmpSave);
        console.info('[world] showboat help requested for', type);
      }
    }, 'interface');
  }
  createSprites() {
    SPRITE_LAYOUT.forEach(row => {
      const sprite = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, row[1], row[2]);
      sprite.name = 'sprite' + row[0];
      this.game.add.existing(sprite);
      this.sprites[row[0]] = sprite;
      if (row[3] && row[4]) this.setMember(row[0], row[3], row[4]);else this.hideSprite(row[0]);
    });
  }

  /* ------------------------------------------------------ sprite glue */

  setMember(spriteNum, movie, member) {
    const entry = buildFrameIndex(this.game).byMovie[movie];
    const f = entry ? entry[member] : null;
    if (!f) {
      warnMissing(movie, member);
      this.hideSprite(spriteNum);
      return false;
    }
    const sprite = this.sprites[spriteNum];
    if (!sprite) return false;
    sprite.loadTexture(f[0], f[1]);
    sprite.visible = true;
    return true;
  }
  setMemberByName(spriteNum, name) {
    if (!name || name === 'Dummy' || name === '') {
      this.hideSprite(spriteNum);
      return false;
    }
    const idx = buildFrameIndex(this.game);
    const list = idx.byName[name];
    if (!list || !list.length) {
      warnMissing('name', name);
      this.hideSprite(spriteNum);
      return false;
    }
    let hit = list[0];
    for (const e of list) {
      if (e.movie === '05.DXR') {
        hit = e;
        break;
      }
    }
    const sprite = this.sprites[spriteNum];
    if (!sprite) return false;
    sprite.loadTexture(hit.frame[0], hit.frame[1]);
    sprite.visible = true;
    return true;
  }
  hideSprite(spriteNum) {
    const sprite = this.sprites[spriteNum];
    if (!sprite) return false;
    sprite.visible = false;
    return true;
  }
  setSpriteLoc(spriteNum, loc) {
    const sprite = this.sprites[spriteNum];
    if (!sprite) return null;
    sprite.x = loc.x;
    sprite.y = loc.y;
    return loc;
  }
  getSpriteLoc(spriteNum) {
    const sprite = this.sprites[spriteNum];
    if (!sprite) return (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(0, 0);
    return (0,_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.point)(sprite.x, sprite.y);
  }

  /* ---------------------------------------------------------- hit rects */

  registerRect(id, rect, cbs, tag) {
    this.unregisterRect(id);
    this.hitRects.push({
      id: id,
      rect: rect,
      tag: tag || 'default',
      active: true,
      hover: false,
      down: false,
      onOver: cbs.onOver,
      onOut: cbs.onOut,
      onDown: cbs.onDown,
      onUp: cbs.onUp
    });
  }
  unregisterRect(id) {
    const i = this.hitRects.findIndex(r => r.id === id);
    if (i >= 0) this.hitRects.splice(i, 1);
  }
  unregisterRects(tag) {
    for (let i = this.hitRects.length - 1; i >= 0; i--) {
      if (this.hitRects[i].tag === tag) this.hitRects.splice(i, 1);
    }
  }
  setInterfaceActive(yesNo) {
    this.hitRects.forEach(r => {
      if (r.tag === 'interface') r.active = !!yesNo;
    });
  }
  updateRects() {
    const p = this.game.input.activePointer;
    const down = p.isDown;
    let anyHit = false;
    for (const r of this.hitRects) {
      const inside = r.active && p.x >= r.rect[0] && p.y >= r.rect[1] && p.x <= r.rect[2] && p.y <= r.rect[3];
      if (inside) anyHit = true;
      if (inside !== r.hover) {
        r.hover = inside;
        if (inside && r.onOver) r.onOver();else if (!inside && r.onOut) r.onOut();
      }
      if (inside && down && !r.down) {
        r.down = true;
        if (r.onDown) r.onDown();
      }
      if (r.down && !down) {
        r.down = false;
        if (inside && r.onUp) r.onUp();
      }
      if (!inside) r.down = false;
    }

    // clicking the water switches to mouse steering (Dir.mouse #down)
    if (down && !this.prevPointerDown && !anyHit && p.y < 396 && this.dir) {
      this.dir.mouse(null, '#down');
    }
    this.prevPointerDown = down;
  }
  setupInput() {
    if (this.game.input.keyboard) {
      this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);
    }
  }
  update() {
    if (!this.dir) return;

    // Force correct start map on first update (workaround for mapCoordinate drift)
    if (this._firstUpdate) {
      this._firstUpdate = false;
      const startMap = this.dir.world.getStartInfo().map;
      if (this.dir.mapCoordinate.x !== startMap.x || this.dir.mapCoordinate.y !== startMap.y) {
        console.warn('[world] Correcting mapCoordinate from', this.dir.mapCoordinate, 'to', startMap);
        this.dir.mapCoordinate = startMap;
        this.dir.world.currentMap = {
          x: startMap.x,
          y: startMap.y
        };
      }
    }
    this.updateRects();
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.loop();
    if (this.dir.Mode === '#Leave') {
      this.dir.tick();
    } else {
      this.dir.loop();
    }
  }
  shutdown() {
    if (this.dir) this.dir.kill();
    if (_objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals && _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster) {
      _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.objects = [];
      _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.addList = [];
      _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals.loopMaster.deleteList = [];
    }
    this.game.mulle.worldState = null;
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.dir = null;
    _objects_boat_lingo__WEBPACK_IMPORTED_MODULE_3__.g.globals = null;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WorldState);

/***/ },

/***/ "./src/scenes/yard.js"
/*!****************************!*\
  !*** ./src/scenes/yard.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/scenes/base.js");
/* harmony import */ var _objects_sprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../objects/sprite */ "./src/objects/sprite.js");
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");



class YardState extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
  preload() {
    this.game.load.pack('yard', 'assets/yard.json', null, this);
  }
  create() {
    super.create();
    this.game.mulle.addAudio('yard');

    // Background: 04.DXR has multiple backgrounds (member 1 = 04b001v0, member 9 = 04b009v0, member 21 = 04b010v0)
    // Start with member 1
    this.background = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 240);
    this.background.setDirectorMember('04.DXR', 1);
    this.game.add.existing(this.background);

    // Border frame
    const border = this.game.add.graphics(0, 0);
    border.lineStyle(4, 0x888888, 1);
    border.moveTo(0, 0);
    border.lineTo(640, 0);
    border.lineTo(640, 480);
    border.lineTo(0, 480);
    border.lineTo(0, 0);

    // Mulle at quay (member 66) - simplified as sprite for now
    this.mulle = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 320, 320);
    this.mulle.setDirectorMember('04.DXR', 66);
    this.game.add.existing(this.mulle);

    // Navigation hotspots from decompiled Lingo:
    // 1. Left edge (rect 4, 322, 56, 433) -> Shipyard/garage (03)
    // 2. Right edge (rect 602, 97, 1640, 302) -> Yard/junk (02)
    // 3. Top area (rect 0, 0, 508, 155) -> World/sailing (05)
    // 4. Pole (rect 477, 331, 509, 379) -> World (with animation)
    // 5. PhotoBook (rect 554, 115, 592, 157) -> album/photo
    // 6. Camera (rect 550, 184, 587, 230) -> camera
    // 7. Radio (rect 554, 115, 592, 157 area) -> radio dialog
    // 8. Windmeter (rect 554, 115 area) -> wind report

    this.hotspots = [
    // Shipyard/Garage entrance (left edge)
    {
      rect: [4, 322, 56, 433],
      target: 'garage',
      label: 'Shipyard',
      cursor: 'left'
    },
    // Junkyard/Boatyard entrance (right edge)
    {
      rect: [602, 97, 640, 302],
      target: 'junk',
      label: 'Yard',
      cursor: 'right'
    },
    // World/Sailing entrance (top/water)
    {
      rect: [0, 0, 508, 155],
      target: 'world',
      label: 'World',
      cursor: 'forward'
    },
    // Pole -> World with animation
    {
      rect: [477, 331, 509, 379],
      target: 'world',
      label: 'Pole',
      cursor: 'point'
    },
    // PhotoBook
    {
      rect: [554, 115, 592, 157],
      target: 'album',
      label: 'PhotoBook',
      cursor: 'point'
    },
    // Camera
    {
      rect: [550, 184, 587, 230],
      target: 'camera',
      label: 'Camera',
      cursor: 'point'
    },
    // Radio
    {
      rect: [554, 115, 592, 157],
      target: 'radio',
      label: 'Radio',
      cursor: 'point'
    }];
    this.hotspotGfx = [];
    this.hotspots.forEach(hs => {
      const gfx = this.game.add.graphics(0, 0);
      gfx.beginFill(0x00ff00, 0);
      gfx.drawRect(hs.rect[0], hs.rect[1], hs.rect[2] - hs.rect[0], hs.rect[3] - hs.rect[1]);
      gfx.endFill();
      gfx.inputEnabled = true;
      gfx.events.onInputUp.add(() => this.navigate(hs), this);
      gfx.events.onInputOver.add(() => this.game.canvas.style.cursor = this.cursorMap(hs.cursor), this);
      gfx.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
      this.hotspotGfx.push(gfx);
    });

    // Windmeter (member 9 = windmeterAnimChart)
    this.windmeter = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 100, 100);
    this.windmeter.setDirectorMember('04.DXR', 9);
    this.windmeter.inputEnabled = true;
    this.windmeter.events.onInputUp.add(() => this.showWindReport(), this);
    this.windmeter.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this);
    this.windmeter.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
    this.game.add.existing(this.windmeter);

    // Radio (member 8)
    this.radio = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 570, 130);
    this.radio.setDirectorMember('04.DXR', 8);
    this.radio.inputEnabled = true;
    this.radio.events.onInputUp.add(() => this.playRadio(), this);
    this.radio.events.onInputOver.add(() => this.game.canvas.style.cursor = 'pointer', this);
    this.radio.events.onInputOut.add(() => this.game.canvas.style.cursor = 'default', this);
    this.game.add.existing(this.radio);

    // Buffa at quay (member 5 = BuffaQuayAnimChart frames)
    // Using member 42-58 range for Buffa animation
    this.buffa = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 150, 200);
    this.buffa.setDirectorMember('04.DXR', 42);
    this.game.add.existing(this.buffa);

    // Figge (member 3 = Figge)
    this.figge = new _objects_sprite__WEBPACK_IMPORTED_MODULE_1__["default"](this.game, 500, 150);
    this.figge.setDirectorMember('04.DXR', 3);
    this.game.add.existing(this.figge);

    // Sky/weather gradient
    const sky = this.game.add.graphics(0, 0);
    const skyGradient = sky.generateTexture ? sky : null;
    if (sky) {
      sky.beginFill(0x87ceeb);
      sky.drawRect(0, 0, 640, 200);
      sky.endFill();
    }

    // First-time dialog handling
    if (this.game.mulle.user.firstTimeQuay === undefined) {
      this.game.mulle.user.firstTimeQuay = true;
    }
    this.firstTime = !this.game.mulle.user.firstTimeQuay;
    this.loopCounter = this.game.rnd.integerInRange(120, 360);

    // Dialog lists from Lingo
    this.firstDialogList = ['04d010v0', '04d012v0', '04d047v0', '04d051v0', '04d052v0'];
    this.genDialogList = ['00d001v0', '00d002v0', '00d003v0', '00d004v0', '00d005v0', '04d001v0', '04d002v0', '04d003v0', '04d004v0', '04d007v0', '04d013v0', '04d014v0', '04d015v0', '04d016v0', '04d017v0', '04d018v0', '04d019v0', '04d020v0', '04d022v0', '04d023v0', '04d027v0', '04d028v0', '04d029v0', '04d030v0', '04d032v0'];
    this.dorisPartList = ['04d034v0', '04d035v0', '04d036v0', '04d037v0', '04d038v0', '04d039v0', '04d041v0', '04d042v0', '04d043v0', '04d045v0', '04d046v0'];

    // Subtitle lines
    this.game.mulle.subtitle.setLines('04d001v0', 'swedish', ['- Välkommen till hamnen!'], 'mulle');
    this.game.mulle.subtitle.setLines('04d001v0', 'english', ['- Welcome to the harbor!'], 'mulle');

    // Play ambient harbor sound
    this.game.mulle.playAudio('04d001v0');

    // Loop timer for random chatter
    this.game.time.events.loop(Phaser.Timer.SECOND / 15, this.updateLoop, this);
  }
  navigate(hs) {
    if (hs.target === 'garage') {
      this.game.state.start('garage');
    } else if (hs.target === 'junk') {
      this.game.state.start('junk');
    } else if (hs.target === 'world') {
      this.game.state.start('world');
    } else if (hs.target === 'album') {
      this.game.state.start('album');
    } else if (hs.target === 'radio') {
      this.playRadio();
    }
  }
  playRadio() {
    // Play radio sound and show radio dialog
    const sounds = ['04d040v0', '04d044v0']; // dorisBluePrintList
    const snd = this.game.rnd.pick(sounds);
    this.game.mulle.playAudio(snd);
    this.game.mulle.subtitle.showLine('- Radio: Nyheter och väder...', 'mulle');
  }
  showWindReport() {
    // Play windmeter sound
    this.game.mulle.playAudio('04e005v0');
    this.game.mulle.subtitle.showLine('- Vindmätare: Vind från väster...', 'mulle');
  }
  cursorMap(name) {
    const map = {
      left: 'w-resize',
      right: 'e-resize',
      forward: 'n-resize',
      point: 'pointer',
      default: 'default'
    };
    return map[name] || 'default';
  }
  updateLoop() {
    if (this.loopCounter > 0) {
      this.loopCounter--;
    }

    // First-time dialogs
    if (this.firstTime && this.loopCounter === 0) {
      this.firstTime = false;
      this.game.mulle.user.firstTimeQuay = false;
      this.game.mulle.saveData();
      this.game.mulle.playAudio('04d010v0');
      this.loopCounter = this.game.rnd.integerInRange(120, 240);
    }
    // Random chatter
    else if (this.loopCounter === 0) {
      if (this.game.mulle.user.gotNewParts) {
        const snd = this.game.rnd.pick(this.dorisPartList);
        this.game.mulle.playAudio(snd);
        this.game.mulle.user.gotNewParts = false;
        this.loopCounter = this.game.rnd.integerInRange(120, 240);
      } else {
        const snd = this.game.rnd.pick(this.genDialogList);
        this.game.mulle.playAudio(snd);
        this.loopCounter = this.game.rnd.integerInRange(360, 720);
      }
    }
  }
  shutdown() {
    if (this.hotspotGfx) {
      this.hotspotGfx.forEach(g => g.destroy());
      this.hotspotGfx = [];
    }
    if (this.windmeter) {
      this.windmeter.destroy();
      this.windmeter = null;
    }
    if (this.radio) {
      this.radio.destroy();
      this.radio = null;
    }
    if (this.buffa) {
      this.buffa.destroy();
      this.buffa = null;
    }
    if (this.figge) {
      this.figge.destroy();
      this.figge = null;
    }
    if (this.mulle) {
      this.mulle.destroy();
      this.mulle = null;
    }
    this.game.sound.stopAll();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (YardState);

/***/ },

/***/ "./src/struct/cardata.js"
/*!*******************************!*\
  !*** ./src/struct/cardata.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @property {array} Parts Parts currently on the car
 */
class MulleCar {
  constructor(game, data) {
    this.game = game;
    this.properties = {};
    this.quickProperties = {};
    this.criteria = {};
    if (data) {
      this.Parts = data.Parts;
      this.Name = data.Name;
      this.Medals = data.Medals;
      this.CacheList = data.CacheList;
    } else {
      this.Parts = [1, 82, 133, 152]; // [1, 12, 82, 133, 152, 7, 307, 142, 145, 122, 201];
      this.Name = '';
      this.Medals = [];
      this.CacheList = [];
    }

    // console.log('cardata created');
  }
  getParts() {
    var l = [];
    this.Parts.forEach(v => {
      l.push(this.game.mulle.PartsDB[v]);
    });
    return l;
  }
  hasPart(partId) {
    return this.Parts.indexOf(parseInt(partId)) !== -1;
  }
  hasMedal(id) {
    return this.Medals.includes(id);
  }
  addMedal(id) {
    this.Medals.push(id);
    console.log(`Added medal ${id}`);
    console.log('Medals', this.Medals);
  }
  hasCache(name) {
    return this.CacheList.indexOf(name) !== -1;
  }
  addCache(name) {
    if (this.hasCache(name)) return false;
    console.debug('[cachelist]', 'add', name);
    this.CacheList.push(name);
    return true;
  }
  removeCache(name) {
    var i = this.CacheList.indexOf(name);
    if (i === -1) return false;
    console.debug('[cachelist]', 'remove', name);
    this.CacheList.splice(i, 1);
    return true;
  }
  resetCache() {
    this.CacheList = [];
  }
  set Parts(val) {
    this._Parts = val;
    console.debug('[parts]', 'set', val);
    this.updateStats();
  }
  get Parts() {
    return this._Parts;
  }
  getProperty(name, defVal = null) {
    return this.properties[name.toLowerCase()] !== undefined ? this.properties[name.toLowerCase()] : defVal;
  }
  getQuickProperty(name, defVal = null) {
    return this.quickProperties[name.toLowerCase()] !== undefined ? this.quickProperties[name.toLowerCase()] : defVal;
  }
  updateStats() {
    var lst = this.getParts();
    var attributes = ['weight', 'break', 'durability', 'grip', 'steering', 'acceleration', 'speed', 'strength', 'fuelconsumption', 'fuelvolume', 'electricconsumption', 'electricvolume', 'comfort', 'funnyfactor', 'horn', 'exhaustpipe', 'lamps', 'loadcapacity', 'enginetype', 'horntype', 'pedals'];
    this.properties = {};
    this.quickProperties = {};
    attributes.forEach(a => {
      this.properties[a] = 0;
      this.quickProperties[a] = 0;
    });

    // regular
    lst.forEach(l => {
      // console.log(l.properties);

      this.properties.weight += l.getProperty('weight', 0);
      this.properties.break += l.getProperty('break', 0);
      this.properties.durability = Math.max(l.getProperty('durability', 0), this.properties.durability);
      this.properties.grip += l.getProperty('grip', 0);
      this.properties.steering = Math.max(l.getProperty('steering', 0), this.properties.steering);
      this.properties.acceleration = Math.max(l.getProperty('acceleration', 0), this.properties.acceleration);
      this.properties.speed = Math.max(l.getProperty('speed', 0), this.properties.speed);
      this.properties.strength += l.getProperty('strength', 0);
      this.properties.fuelconsumption += l.getProperty('fuelconsumption', 0);
      this.properties.fuelvolume += l.getProperty('fuelvolume', 0);
      this.properties.electricconsumption += l.getProperty('electricconsumption', 0);
      this.properties.electricvolume += l.getProperty('electricvolume', 0);
      this.properties.comfort += l.getProperty('comfort', 0);
      this.properties.funnyfactor += l.getProperty('funnyfactor', 0);
      if (l.getProperty('horn', 0)) this.properties.horn = 1;
      if (l.getProperty('exhaustpipe', 0)) this.properties.exhaustpipe = 1;
      if (l.getProperty('lamps', 0)) this.properties.lamps = 1;
      if (l.getProperty('pedals', 0)) this.properties.pedals = 1;
      this.properties.loadcapacity += l.getProperty('loadcapacity', 0);
      this.properties.enginetype = Math.max(l.getProperty('enginetype', 0), this.properties.enginetype);
      this.properties.horntype = Math.max(l.getProperty('horntype', 0), this.properties.horntype);
    });

    // quick
    if (this.properties.speed === 5) {
      this.quickProperties.speed = this.properties.speed * 27 / 25;
    } else {
      this.quickProperties.speed = this.properties.speed * 20 / 25;
    }
    this.quickProperties.break = this.properties.break * 3 / 100;
    if (this.quickProperties.acceleration === 0) {
      this.quickProperties.acceleration = 1;
    }
    this.quickProperties.acceleration = this.properties.acceleration * 2 / 100;
    this.quickProperties.steering = this.properties.steering + 3 * 2 / 20 * 70;
    this.quickProperties.fuelvolume = this.properties.fuelvolume * 12;
    this.quickProperties.fuelconsumption = this.properties.fuelconsumption;

    // Evaluate properties to boolean criteria
    this.criteria = {
      MudGrip: 8,
      HolesDurability: 3,
      BigHill: 3,
      SmallHill: 2
    };
    this.criteria.MudGrip = this.getProperty('grip', 0) > this.criteria.MudGrip;
    this.criteria.HolesDurability = this.getProperty('durability', 0) > this.criteria.HolesDurability;
    this.criteria.BigHill = this.getProperty('strength', 0) > this.criteria.BigHill;
    this.criteria.SmallHill = this.getProperty('strength', 0) > this.criteria.SmallHill;
    console.debug('[props]', 'updated', this.properties);
    console.debug('[quickprops]', 'updated', this.quickProperties);
  }
  isRoadLegal(talk = false) {
    if (!this.getProperty('enginetype')) {
      if (talk) this.game.mulle.actors.mulle.talk('03d013v0');
      return false;
    }
    var tires = 0;
    this.getParts().forEach(v => {
      if (v.getProperty('grip')) tires++;
      if (v.getProperty('grip') === 9) tires = 2; //Caterpillars count as wheels for both axles
    });

    // tires
    if (tires < 2) {
      if (talk) this.game.mulle.actors.mulle.talk('03d012v0');
      return false;
    }

    // 03d018v0 brakes
    if (this.getProperty('break') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d018v0');
      return false;
    }

    // consumption
    if (this.getProperty('fuelconsumption') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d013v0');
      return false;
    }

    // 03d014v0 battery
    if (this.getProperty('electricvolume') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d014v0');
      return false;
    }

    // 03d015v0 fuel
    if (this.getProperty('fuelvolume') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d015v0');
      return false;
    }

    // 03d016v0 gearbox
    if (this.getProperty('acceleration') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d016v0');
      return false;
    }

    // 03d017v0 steering wheel
    if (this.getProperty('steering') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d017v0');
      return false;
    }

    // 03d019v0 horn
    /*
    if (this.getProperty('horn') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d019v0')
      return false
    }
    */

    // 03d020v0 exhaust
    /*
    if (this.getProperty('exhaustpipe') === 0 ) {
      if (talk) this.game.mulle.actors.mulle.talk('03d020v0')
      return false
    }
    */

    // 03d021v0 lamps
    /*
    if (this.getProperty('lamps') === 0) {
      if (talk) this.game.mulle.actors.mulle.talk('03d021v0')
      return false
    }
    */

    /*
    if (!this.getProperty('grip')) {
      if (talk) this.game.mulle.actors.mulle.talk('03d012v0')
      return false
    }
    */

    return true;
  }
  toJSON() {
    return {
      Parts: this.Parts,
      Name: this.Name,
      Medals: this.Medals,
      CacheList: this.CacheList
    };
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleCar);

/***/ },

/***/ "./src/struct/partdata.js"
/*!********************************!*\
  !*** ./src/struct/partdata.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


/**
 * Lingo properties are case insensitive, but the extracted part data keeps the
 * original cast member names (`Offset`, `Master`, `JunkView`) while older
 * callers expect camelCase. Look the key up case insensitively.
 *
 * @param  {Object} data Raw part entry
 * @param  {...string} names Candidate key spellings
 * @return {*}           First match, or undefined
 */
function pick(data, ...names) {
  for (const n of names) {
    if (data[n] !== undefined) return data[n];
  }
  const wanted = names.map(n => n.toLowerCase());
  for (const key in data) {
    if (wanted.indexOf(key.toLowerCase()) >= 0) return data[key];
  }
  return undefined;
}
class MullePartData {
  constructor(game, partId, partData) {
    this.game = game;
    this.partId = parseInt(partId);
    this.data = partData; // game.mulle.PartsDB[ partId ];

    this.junkView = pick(this.data, 'junkView', 'JunkView');
    this.UseView = pick(this.data, 'UseView');
    this.UseView2 = pick(this.data, 'UseView2');
    this.description = pick(this.data, 'description', 'Description') || '';
    this.Requires = pick(this.data, 'Requires');
    this.Covers = pick(this.data, 'Covers');
    const master = pick(this.data, 'master', 'Master');
    if (master) {
      this.master = master;
      // this.master = new MulleCarpart( this._master );
    } else {
      this.master = false;
    }
    this.MorphsTo = pick(this.data, 'MorphsTo') || false;
    this.new = [];
    if (this.data.new) {
      for (var i = 0; i < this.data.new.length; i++) {
        var e = this.data.new[i];
        this.new.push({
          id: e[0],
          fg: e[1][0],
          bg: e[1][1],
          offset: new Phaser.Point(e[2][0], e[2][1])
        });
      }
    }

    // car offset
    const offset = pick(this.data, 'offset', 'Offset') || [0, 0];
    this.offset = new Phaser.Point(offset[0], offset[1]);

    // lowercase properties, thanks lingo
    this.properties = {};
    if (this.data.Properties && !Array.isArray(this.data.Properties)) {
      for (var n in this.data.Properties) {
        this.properties[n.toLowerCase()] = this.data.Properties[n];
      }
    }
  }
  getProperty(name, defVal = null) {
    /*
    if (!this.data) return false
     // quick lookup
    if (this.data.Properties[name]) return this.data.Properties[name]
     // case insensitive lookup
    for (var n in this.data.Properties) {
      if (name.toLocaleString() === n.toLowerCase()) {
        return this.data.Properties[n]
      }
    }
    */

    name = name.toLowerCase();
    if (this.properties[name]) return this.properties[name];

    // traverse
    if (this.MorphsTo) {
      for (var i in this.MorphsTo) {
        var m = this.game.mulle.getPart(this.MorphsTo[i]);
        if (!m) {
          console.error('invalid part', this.MorphsTo[i]);
          continue;
        }
        if (m.getProperty(name, defVal)) return m.getProperty(name, defVal);
      }
    }
    return defVal;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MullePartData);

/***/ },

/***/ "./src/struct/saildata.js"
/*!********************************!*\
  !*** ./src/struct/saildata.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DirectionList: () => (/* binding */ DirectionList),
/* harmony export */   MapHoverRects: () => (/* binding */ MapHoverRects),
/* harmony export */   SpawnLines: () => (/* binding */ SpawnLines),
/* harmony export */   SpeedLists: () => (/* binding */ SpeedLists),
/* harmony export */   amplitudeList: () => (/* binding */ amplitudeList)
/* harmony export */ });
/**
 * Sailing scene field data extracted from the 05.DXR cast members
 * (DirectionList, SpawnLines, AmplitudeList, SpeedLists, MapHoverRects).
 *
 * Generated from reference/data05/*.txt - do not edit by hand.
 * @module struct/saildata
 */

// 16 boat headings, 1 = "up" (north). Values are x, y vectors.
const DirectionList = [[38, -92], [70, -70], [92, -38], [100, 0], [92, 38], [70, 70], [38, 92], [0, 100], [-38, 92], [-70, 70], [-92, 38], [-100, 0], [-92, -38], [-70, -70], [-38, -92], [0, -100]];

// [start point, travel vector] for each of the 16 wave spawn lines.
const SpawnLines = [[[206, 478], [-92, -38]], [[110, 412], [-70, -70]], [[44, 316], [-38, -92]], [[20, 202], [0, -100]], [[44, 88], [38, -92]], [[110, -8], [70, -70]], [[206, -74], [92, -38]], [[320, -98], [100, 0]], [[434, -74], [92, 38]], [[530, -8], [70, 70]], [[596, 88], [38, 92]], [[620, 202], [0, 100]], [[596, 316], [-38, 92]], [[530, 412], [-70, 70]], [[434, 478], [-92, 38]], [[320, 502], [-100, 0]]];

// One period of the wave silhouette curve (-100..100).
const amplitudeList = [6, 13, 19, 25, 31, 37, 43, 48, 54, 59, 64, 68, 73, 77, 81, 84, 88, 90, 93, 95, 97, 98, 99, 100, 100, 100, 99, 98, 97, 95, 93, 90, 88, 84, 81, 77, 73, 68, 64, 59, 54, 48, 43, 37, 31, 25, 19, 13, 6, 0, -6, -13, -19, -25, -31, -37, -43, -48, -54, -59, -64, -68, -73, -77, -81, -84, -88, -90, -93, -95, -97, -98, -99, -100, -100, -100, -99, -98, -97, -95, -93, -90, -88, -84, -81, -77, -73, -68, -64, -59, -54, -48, -43, -37, -31, -25, -19, -13, -6, 0];

// Lookup tables of achievable speed indexed by applied power/100.
const SpeedLists = {
  "Small": [1, 2, 4, 5, 6, 13, 16, 17, 17, 17, 19, 22, 25, 26, 27, 27, 28, 28, 29, 30, 30, 30, 31, 31, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45],
  "Medium": [1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 9, 11, 13, 16, 16, 17, 18, 19, 20, 20, 20, 21, 21, 22, 22, 22, 23, 23, 24, 24, 24, 25, 25, 26, 26, 26, 27, 27, 28, 28, 28, 29, 29, 30, 30, 30, 31, 31, 32, 32, 32, 33, 33, 34, 34, 34, 35, 35, 36, 36, 36, 37, 37, 38, 38, 38, 39, 39, 40, 40, 41, 41, 42, 42, 43, 43, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 50],
  "large": [1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
};

// Hover rectangles per row of the over-view map (rect(left, top, right, bottom)).
const MapHoverRects = {
  "1": [[2, 30, 100, 67, 124], [3, 144, 128, 182, 160], [4, 95, 204, 152, 238], [5, 32, 193, 70, 225], [6, 178, 274, 202, 311], [9, 271, 199, 295, 236], [15, 72, 157, 146, 199], [16, -1, 352, 73, 394]],
  "2": [[7, 212, 352, 263, 389], [8, 274, 277, 298, 314], [10, 326, 318, 442, 426], [12, 343, 238, 380, 276]],
  "3": [[11, 414, 141, 480, 234], [13, 516, 45, 553, 83], [14, 530, 327, 620, 378]],
  "4": [[2, 171, 20, 208, 44]],
  "5": []
};

/***/ },

/***/ "./src/struct/savedata.js"
/*!********************************!*\
  !*** ./src/struct/savedata.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _cardata__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cardata */ "./src/struct/cardata.js");

class MulleSave {
  constructor(game, data) {
    this.game = game;
    if (data) {
      console.debug('[savedata]', 'supplied, apply', data.UserId);
      this.fromJSON(data);
    } else {
      console.debug('[savedata]', 'not found, set defaults');
      this.setDefaults();
    }
    this.calculateParts();
  }
  setDefaults() {
    this.UserId = '';
    this.Car = new _cardata__WEBPACK_IMPORTED_MODULE_0__["default"](this.game);

    // default junk locations
    this.Junk = {
      Pile1: {
        66: new Phaser.Point(296, 234),
        29: new Phaser.Point(412, 311),
        143: new Phaser.Point(416, 186),
        178: new Phaser.Point(570, 255)
      },
      Pile2: {
        215: new Phaser.Point(545, 222),
        47: new Phaser.Point(386, 304),
        12: new Phaser.Point(239, 269),
        140: new Phaser.Point(352, 187)
      },
      Pile3: {
        153: new Phaser.Point(512, 153),
        131: new Phaser.Point(464, 298),
        307: new Phaser.Point(246, 285),
        112: new Phaser.Point(561, 293),
        30: new Phaser.Point(339, 189)
      },
      Pile4: {
        190: new Phaser.Point(182, 143),
        23: new Phaser.Point(346, 203),
        126: new Phaser.Point(178, 301),
        211: new Phaser.Point(75, 193)
      },
      Pile5: {
        6: new Phaser.Point(192, 377),
        90: new Phaser.Point(102, 290),
        203: new Phaser.Point(33, 122),
        158: new Phaser.Point(186, 164),
        119: new Phaser.Point(375, 268)
      },
      Pile6: {
        2: new Phaser.Point(160, 351),
        214: new Phaser.Point(130, 172),
        210: new Phaser.Point(281, 300),
        121: new Phaser.Point(85, 275)
      },
      shopFloor: {},
      yard: {}
    };
    this.NrOfBuiltCars = 0;
    this.Saves = [];
    this.CompletedMissions = [];
    this.OwnStuff = [];
    this.myLastPile = 1;
    this.gifts = [];
    this.toYardThroughDoor = true;
    this.givenMissions = [];
    this.figgeIsComing = false;
    this.missionIsComing = false;
    this.savedCars = [];
    this.language = this.game.mulle.defaultLanguage; // 'swedish'
  }
  addStuff(name) {
    if (this.hasStuff(name)) return false;
    this.OwnStuff.push(name);
    this.save();
    return true;
  }
  removeStuff(name) {
    if (!this.hasStuff(name)) return false;
    var i = this.OwnStuff.indexOf(name);
    this.OwnStuff.splice(i, 1);
    this.save();
    return true;
  }
  hasStuff(name) {
    return this.OwnStuff.indexOf(name) !== -1;
  }
  hasPart(partId) {
    // junk piles
    for (var junkKey in this.Junk) {
      if (Object.keys(this.Junk[junkKey]).indexOf(partId) !== -1 || Object.keys(this.Junk[junkKey]).indexOf(partId.toString()) !== -1) return true;
    }

    // regular car parts
    if (this.Car.Parts.indexOf(partId) !== -1 || this.Car.Parts.indexOf(partId.toString()) !== -1) return true;

    // morphed car parts
    for (var i of this.Car.Parts) {
      var p = this.game.mulle.PartsDB[i];
      if (p.master && partId === p.master) return true;
    }
    return false;
  }

  /**
   * @param {string}       pile   Pile name
   * @param {number}       partId Part ID
   * @param {Phaser.Point} pos    Position in pile
   * @param {Boolean}      noSave Don't save user data
   */
  addPart(pile, partId, pos, noSave = false) {
    if (!this.Junk[pile]) return false;
    if (!pos) pos = new Phaser.Point(this.game.rnd.integerInRange(0, 640), this.game.rnd.integerInRange(0, 480));
    this.Junk[pile][partId] = pos;
    console.log('part added', pile, partId, pos);
    if (!noSave) this.save();
    return true;
  }
  calculateParts() {
    this.availableParts = {};
    var defaultParts = {
      Postal: [],
      JunkMan: [13, 20, 17, 89, 290, 120, 18, 19, 173, 21, 297, 22, 24, 25, 185, 26, 27, 28, 32, 35, 91, 132, 129, 134, 137, 146, 149, 154, 168, 216, 174, 175, 177, 189, 191, 192, 193, 233, 199, 208, 209, 212, 221, 227, 229, 235, 251, 264, 278, 294, 295, 14],
      Destinations: [162, 99, 172, 54, 306, 287, 113, 283, 9],
      Random: [33, 38, 41, 42, 43, 176, 48, 53, 55, 64, 65, 74, 75, 76, 92, 93, 100, 101, 104, 107, 116, 130, 96, 155, 161, 181, 186, 195, 196, 200, 213, 219, 220, 222, 228, 230, 234, 236, 239, 242, 245, 248, 254, 257, 260, 261, 265, 271, 272, 273, 286, 288, 296]
    };
    for (var cat in defaultParts) {
      this.availableParts[cat] = [];
      for (var id of defaultParts[cat]) {
        if (!this.hasPart(id)) {
          this.availableParts[cat].push(id);
          // }else{
          // console.warn('already has part', id);
        }
      }
    }
    console.log('availableParts', this.availableParts);
  }
  getRandomPart() {
    this.calculateParts();
    return this.game.rnd.pick(this.availableParts.Random);
  }
  save() {
    console.log('save data', this.UserId);
    window.localStorage.setItem('mulle_SaveData', JSON.stringify(this.game.mulle.UsersDB));
  }
  fromJSON(data) {
    this.UserId = data.UserId;
    this.Car = new _cardata__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, data.Car);
    this.Junk = data.Junk;
    this.NrOfBuiltCars = data.NrOfBuiltCars;
    this.Saves = data.Saves;
    this.CompletedMissions = data.CompletedMissions;
    this.OwnStuff = data.OwnStuff ? data.OwnStuff : [];
    this.myLastPile = data.myLastPile;
    this.gifts = data.gifts;
    this.toYardThroughDoor = data.toYardThroughDoor;
    this.givenMissions = data.givenMissions;
    this.figgeIsComing = data.figgeIsComing;
    this.missionIsComing = data.missionIsComing;
    this.savedCars = data.savedCars;
    this.language = this.game.mulle.defaultLanguage; // data.language ? data.language : this.game.mulle.defaultLanguage
  }
  toJSON() {
    return {
      UserId: this.UserId,
      Car: this.Car,
      Junk: this.Junk,
      NrOfBuiltCars: this.NrOfBuiltCars,
      CompletedMissions: this.CompletedMissions,
      OwnStuff: this.OwnStuff,
      givenMissions: this.givenMissions,
      myLastPile: this.myLastPile,
      savedCars: this.savedCars
    };
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleSave);

/***/ },

/***/ "./src/util/LoadSaveCar.js"
/*!*********************************!*\
  !*** ./src/util/LoadSaveCar.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class LoadSaveCar {
  /**
   * @param {Phaser.Game} game
   */
  constructor(game) {
    this.game = game;
    if (!this.game.mulle.user.savedCars) {
      this.game.mulle.user.savedCars = [];
    }
  }

  /**
   * Parse a string from an exported car file from the original game
   * @param {string} carDataString Car file string content
   * @return {array}
   */
  static parseOriginalGame(carDataString) {
    carDataString = carDataString.replace(/#([a-zA-Z0-9]+):/g, '"$1":');
    carDataString = '{' + carDataString.substring(1, carDataString.length - 1) + '}';
    carDataString = carDataString.replace('[:]', '[]');
    carDataString = carDataString.replace(/("cacheList": )\[(.+)]/, '$1{$2}');
    console.log(carDataString);
    return JSON.parse(carDataString);
  }

  /**
   * Save a car
   * @param {int} page Album page to save the car
   * @param {array} parts Parts on car
   * @param {array} medals Car medals
   * @param {string} name Car name
   */
  saveCar(page, parts, medals, name = '') {
    console.log(`Save car to page ${page}`);
    this.game.mulle.user.savedCars[page] = {
      parts: parts,
      medals: medals,
      name: name
    };
    this.game.mulle.user.save();
  }

  /**
   * Save the current car
   * @param {int} page Album page to save the car
   */
  saveCurrentCar(page) {
    this.saveCar(page, this.game.mulle.user.Car.Parts, this.game.mulle.user.Car.Medals, this.game.mulle.user.Car.Name);
  }
  loadCar(page) {
    if (!this.isSaved(page)) throw new Error('No car saved on page ' + page);
    console.log(this.game.mulle.user.savedCars[page]);
    if (!('parts' in this.game.mulle.user.savedCars[page])) {
      this.saveCar(page, this.game.mulle.user.savedCars[page], []);
    }
    const {
      parts,
      medals,
      name
    } = this.game.mulle.user.savedCars[page];
    return [parts, medals, name];
  }

  /**
   * Import a car from a saved file
   * @param {int} page Album page to save the car
   * @param {string} carDataString String content from an exported car file
   */
  importCar(page, carDataString) {
    const {
      parts,
      name,
      medals
    } = LoadSaveCar.parseOriginalGame(carDataString);
    this.saveCar(page, parts, medals, name);
  }

  /**
   * Is a car saved on this page?
   * @param {int} page Page number
   * @return {boolean}
   */
  isSaved(page) {
    return page in this.game.mulle.user.savedCars;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadSaveCar);

/***/ },

/***/ "./src/util/blinkThing.js"
/*!********************************!*\
  !*** ./src/util/blinkThing.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class blinkThing {
  /**
   *
   * @param {MulleGame|Phaser.Game} game
   * @param {Phaser.Sprite} sprite Sprite to blink
   * @param {function} callback - The callback that will be called when the blink ends.
   * @param {object} callbackContext - The context in which the callback will be called.
   */
  constructor(game, sprite, callback = undefined, callbackContext = this) {
    this.game = game;
    this.callback = callback;
    this.callbackContext = callbackContext;
    this.sound = this.game.mulle.playAudio('00e028v0');
    this.sprite = sprite;
    this.blinkSprite();
  }
  blinkSprite(frequency = 2) {
    // 12 fps, 2 blink per frame, 6 blink per second
    const delay = 1000 / 12 * frequency;
    this.toggleSprite(delay);
  }
  toggleSprite(delay) {
    this.sprite.visible = !this.sprite.visible;
    console.debug('Visible', this.sprite.visible, 'Playing', this.sound.isPlaying, 'delay', delay);
    if (this.sound.isPlaying) {
      this.game.time.events.add(delay, this.toggleSprite, this, delay);
    } else {
      this.sprite.destroy();
      if (this.callback !== undefined) {
        this.callback.apply(this.callbackContext);
      }
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (blinkThing);

/***/ },

/***/ "./src/util/cursor.js"
/*!****************************!*\
  !*** ./src/util/cursor.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class MulleCursor {
  constructor(game) {
    this.game = game;
    this.cursorName = null;
    this.activator = null;
    this.default = 'Standard';
    this._current = null;
    this._previous = null;
    this._history = [];

    // this.bindings = { over: [], out: [] };
  }
  get current() {
    return this._current;
  }
  set current(val) {
    // this.game.canvas.className = 'C_' + ( val ? val : ( this._previous ? this._previous : this.default ) );

    // this._previous = this._current;

    if (!val) {
      this._history.splice(-1, 1);
    } else {
      this._history.push(val);
    }
    this.refresh();
    this._current = val;

    // console.debug('[cursor]', 'current', val, this._history);
  }
  reset() {
    this._history = [];
    this._current = null;
    this.refresh();
  }
  add(name) {
    if (this._history.indexOf(name) === -1) this._history.push(name);
    this.refresh();
  }
  remove(name) {
    var i = this._history.indexOf(name) !== -1;
    if (i) this._history.splice(i, 1);
    this.refresh();
  }
  refresh() {
    if (this._history.length > 0) {
      this.game.canvas.className = 'C_' + this._history[this._history.length - 1];
    } else {
      this.game.canvas.className = 'C_' + this.default;
    }
  }
  setCursor(activator, name) {
    if (name) {
      console.debug('[cursor]', 'set', activator, name);
      this.activator = activator;
      this.cursorName = name;
      this.game.canvas.className = 'cursor-' + this.cursorName;
    } else {
      console.debug('[cursor]', 'default', activator);
      this.activator = null;
      this.cursorName = null;
      this.game.canvas.className = '';
    }
  }
  addHook(obj, callback) {
    // var over =
    obj.events.onInputOver.add(this.cursorOver, this, null, callback);

    // var out =
    obj.events.onInputOut.add(this.cursorOut, this, null, callback);

    // this.bindings.over.push(over);

    // this.bindings.out.push(out);

    // console.log( this.bindings );
  }
  cursorOver(obj, pointer, callback) {
    // console.log( 'cursorOver', obj, pointer, d );

    if (callback) {
      var ret = callback(obj, 'over', pointer);
      if (ret) {
        this.setCursor(obj, ret);
      } else {
        this.setCursor(obj, null);
      }
    }
  }
  cursorOut(obj, pointer, callback) {
    // console.log( 'cursorOut', obj, pointer, d );

    if (callback) {
      var ret = callback(obj, 'out', pointer);
      if (ret) {
        this.setCursor(obj, ret);
      } else {
        this.setCursor(obj, null);
      }
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleCursor);

/***/ },

/***/ "./src/util/directorAnimation.js"
/*!***************************************!*\
  !*** ./src/util/directorAnimation.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");

class directorAnimation {
  /**
   *
   * @param {array} frames
   * @param {int} offset Offset number
   * @return {[]}
   */
  static offset(frames, offset) {
    const framesOffset = [];
    for (const frame of frames) {
      framesOffset.push(frame + offset);
    }
    return framesOffset;
  }

  /**
   * Resolve a list of director frame numbers
   * @param {MulleGame|Phaser.Game} game
   * @param {string} movie Director movie
   * @param {array} frames List of frames relative to first frame
   * @return {array} Resolved frames
   */
  static resolveDirectorFrames(game, movie, frames) {
    if (!movie) {
      console.error('Movie not set');
      return [];
    }
    const DirectorFrames = [];
    const DirectorFramesObjects = [];
    let key, frame;
    for (const frameName of frames) {
      if (frameName === 'Dummy') continue;
      [key, frame] = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_0__["default"].getDirectorImage(game, movie, frameName);
      DirectorFrames.push(frame.name);
      DirectorFramesObjects.push(frame);
    }
    return [key, DirectorFrames, DirectorFramesObjects];
  }

  /**
   * Offset and resolve frames from a director animation
   * @param {MulleGame|Phaser.Game} game
   * @param {string} movie Move file name
   * @param {int} firstFrame First frame number
   * @param {array} frames Frames relative to first frame
   * @return {array} Resolved frames
   */
  static createAnimation(game, movie, firstFrame, frames) {
    const offset_frames = directorAnimation.offset(frames, firstFrame - 1);
    return this.resolveDirectorFrames(game, movie, offset_frames);
  }

  /**
   * Add animation to existing sprite
   * @param {Phaser.Sprite} sprite
   * @param {string} name The unique (within this Sprite) name for the animation, i.e. "run", "fire", "walk".
   * @param {int[]} frames List of frames, relative to first frame
   * @param {number} firstFrame Cast number of the first frame in the animation
   * @param {boolean} loop Whether or not the animation is looped or just plays once.
   * @param {int} frameRate The speed at which the animation should play. The speed is given in frames per second.
   */
  static addAnimation(sprite, name, frames, firstFrame, loop = false, frameRate = 12) {
    const offset_frames = directorAnimation.offset(frames, firstFrame - 1);
    let resolved_frames = [];
    for (const castNum of offset_frames) {
      const frame = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_0__["default"].getSpriteSheetImage(sprite.key, castNum);
      if (frame === null) console.error('Unable to find image', movie, member);
      resolved_frames.push(frame.name);
    }
    return sprite.animations.add(name, resolved_frames, frameRate, loop);
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (directorAnimation);

/***/ },

/***/ "./src/util/movingAnimation.js"
/*!*************************************!*\
  !*** ./src/util/movingAnimation.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objects/DirectorHelper */ "./src/objects/DirectorHelper.js");
/* harmony import */ var _directorAnimation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./directorAnimation */ "./src/util/directorAnimation.js");



/**
 * https://gist.github.com/eddieajau/5f3e289967de60cf7bf9
 * @param arr
 * @param column
 * @returns {*}
 */
function extractColumn(arr, column) {
  return arr.map(x => x[column]);
}
class movingAnimation {
  /**
   * Create moving animation
   * @param {Phaser.Game} game
   * @param {string} movie Director movie
   * @param {array} frames
   * @param {int} fps
   * @param {int} offsetX
   * @param {int} offsetY
   * @param {boolean} destroy Destroy sprite after animation
   * @param {boolean} director_pos Use position without conversion
   */
  constructor(game, movie, frames, fps = 12, offsetX = 0, offsetY = 0, destroy = true, director_pos = true) {
    this.game = game;
    this.movie = movie;
    this.frames = frames;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.destroy = destroy;
    this.director_pos = director_pos;
    const [spriteSheet, spriteFrames, spriteFrameObjects] = this.resolveCastToSprites();
    this.spriteSheet = spriteSheet;
    this.spriteFrames = spriteFrames;
    this.spriteFrameObjects = spriteFrameObjects;
    this.createSprite();
    this.frameCount = frames.length;
    this.delay = 1000 / fps;
  }

  /**
   * Resolve director cast numbers to sprite numbers
   * @returns {Array}
   */
  resolveCastToSprites() {
    const casts = extractColumn(this.frames, 'cast');
    return _directorAnimation__WEBPACK_IMPORTED_MODULE_1__["default"].resolveDirectorFrames(game, this.movie, casts);
  }

  /**
   * Get position for the frame with the correct offset
   * @param {int} frameNum Frame number
   * @returns {number[]} X and Y coordinates
   */
  getPosition(frameNum) {
    let x;
    let y;
    if (this.offsetX === 0 && this.offsetY === 0) {
      [x, y] = _objects_DirectorHelper__WEBPACK_IMPORTED_MODULE_0__["default"].CenterToOuter(this.frames[frameNum].x, this.frames[frameNum].y, this.frames[frameNum].h, this.frames[frameNum].w);
    } else {
      x = this.frames[frameNum].x - this.offsetX;
      y = this.frames[frameNum].y - this.offsetY;
    }
    return [x, y];
  }
  createSprite() {
    if (!this.director_pos) {
      const [x, y] = this.getPosition(0);
      this.sprite = new Phaser.Sprite(this.game, x, y, this.spriteSheet, this.spriteFrameObjects[0].name);
    } else {
      this.sprite = new Phaser.Sprite(this.game, null, null, this.spriteSheet);
      this.setFrame(0);
    }
    this.currentSprite = this.spriteFrames[0];
    this.currentFrame = 0;
  }

  /**
   * Start animation
   * @param {function} callback - The callback that will be called when the blink ends.
   * @param {object} callbackContext - The context in which the callback will be called.
   */
  play(callback = undefined, callbackContext = this) {
    this.setNextFrame();
    this.callback = callback;
    this.callbackContext = callbackContext;
  }

  /**
   * Set the frame to show
   * @param {int} frameNum
   */
  setFrame(frameNum) {
    this.currentFrame = frameNum;
    if (!this.director_pos) {
      const [x, y] = this.getPosition(frameNum);
      this.sprite.x = x;
      this.sprite.y = y;
    } else {
      const frame = this.spriteFrameObjects[frameNum];
      this.sprite.x = this.frames[frameNum].x;
      this.sprite.y = this.frames[frameNum].y;
      this.sprite.pivot = frame.regpoint;
    }
    if (this.spriteFrames[frameNum] !== this.currentSprite) {
      console.log(`Set texture to ${this.spriteFrames[frameNum]} at frame ${frameNum}`);
      this.sprite.loadTexture(this.spriteSheet, this.spriteFrames[frameNum]);
      this.currentSprite = this.spriteFrames[frameNum];
    }
  }
  setNextFrame() {
    this.setFrame(this.currentFrame + 1);
    if (this.currentFrame + 1 < this.frameCount) {
      game.time.events.add(this.delay, this.setNextFrame, this);
    } else {
      if (this.destroy) this.sprite.destroy();
      if (this.callback !== undefined) this.callback.apply(this.callbackContext);
    }
  }
  static offset(x, y) {
    return [x - 320, y - 240];
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (movingAnimation);

/***/ },

/***/ "./src/util/network.js"
/*!*****************************!*\
  !*** ./src/util/network.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * MulleNet
 * @module network
 */

class MulleNet {
  constructor(game) {
    this.game = game;
  }
  connect() {
    if (this.connected) {
      console.error('Already connected');
      return false;
    }
    var address =  true ? this.game.mulle.networkDevServer : 0;
    console.log('[network]', 'connect', process.env.SERVER_ADDRESS ?? address);
    this.socket = new WebSocket(process.env.SERVER_ADDRESS ?? 'ws://' + address);

    // launch on connect
    this.socket.addEventListener('open', event => {
      console.log('[network]', 'connected');
    });
    this.socket.addEventListener('close', event => {
      console.warn('[network]', 'disconnected', event);
      this.socket = null;
    });
    this.socket.addEventListener('message', msg => {
      var msg = JSON.parse(event.data);
      if (msg.error) {
        alert(msg.error);
      }
      if (msg.message) {
        alert(msg.message);
      }
    });
  }
  disconnect() {
    this.socket.close();
  }
  send(data) {
    if (!this.socket) return false;
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.debug('[network]', 'offline', data);
      return false;
    }
    console.debug('[network]', 'send', data);
    this.socket.send(JSON.stringify(data));
  }
  get connected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MulleNet);

/***/ },

/***/ "./src/util/partUtil.js"
/*!******************************!*\
  !*** ./src/util/partUtil.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _objects_carpart__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objects/carpart */ "./src/objects/carpart.js");

class partUtil {
  /**
   *
   * @param {MulleGame|Phaser.Game} game
   */
  constructor(game) {
    this.game = game;
  }

  /**
   *
   * @returns int
   */
  getPart() {
    console.log(this.game.mulle);
    if (this.game.mulle.SetWhenDone === undefined) {
      console.error('SetWhenDone is not defined, state not started from MapObject?');
      return 0;
    }
    for (const partId of this.game.mulle.SetWhenDone.Parts) {
      if (partId === '#Random') {
        return this.game.mulle.user.getRandomPart();
      } else {
        if (!this.game.mulle.user.hasPart(partId)) return partId;
      }
    }
  }

  /**
   *
   * @param partId
   * @param x
   * @param y
   * @returns {MulleCarPart}
   */
  showPart(partId, x, y) {
    const part = new _objects_carpart__WEBPACK_IMPORTED_MODULE_0__["default"](this.game, partId, x, y);
    part.input.inputEnabled = false;
    part.input.disableDrag();
    return part;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (partUtil);

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! game */ "./src/game.js");
/*
console.log('Import Phaser');
import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
*/

// import Phaser from 'phaser-ce';


console.debug('Import Game');
console.debug('Create game');
var game = new game__WEBPACK_IMPORTED_MODULE_0__["default"]();
console.debug('Override atlas');
Phaser.AnimationParser.JSONDataHash = function (game, json) {
  //  Malformed?
  if (!json['frames']) {
    console.warn("Phaser.AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object");
    console.log(json);
    return;
  }

  //  Let's create some frames then
  var data = new Phaser.FrameData();

  //  By this stage frames is a fully parsed array
  var frames = json['frames'];
  var newFrame;
  var i = 0;

  // console.log('json hash hijack', json['meta']['image'], frames);

  for (var key in frames) {
    newFrame = data.addFrame(new Phaser.Frame(i, frames[key].frame.x, frames[key].frame.y, frames[key].frame.w, frames[key].frame.h, key));
    if (frames[key].trimmed) {
      newFrame.setTrim(frames[key].trimmed, frames[key].sourceSize.w, frames[key].sourceSize.h, frames[key].spriteSourceSize.x, frames[key].spriteSourceSize.y, frames[key].spriteSourceSize.w, frames[key].spriteSourceSize.h);
    }
    if (frames[key].rotated) {
      newFrame.rotated = true;
    }
    if (frames[key].regpoint) {
      newFrame.regpoint = new Phaser.Point(frames[key].regpoint.x, frames[key].regpoint.y);
    }
    newFrame.dirName = frames[key].dirName;
    newFrame.dirFile = frames[key].dirFile;
    newFrame.dirNum = frames[key].dirNum;
    if (frames[key].id) {
      newFrame.id = frames[key].id;
    }
    i++;
  }
  return data;
};
window.addEventListener('beforeunload', function (e) {
  console.debug('Unload shutdown');
  game.state.states[game.state.current].shutdown();
});
window.game = game;

// module.exports = game;
})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map