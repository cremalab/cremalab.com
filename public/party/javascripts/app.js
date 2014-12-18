(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
var Application, GameController, mediator;

GameController = require('controllers/game_controller');

mediator = require('lib/mediator');

Application = {
  initialize: function() {
    this.gameController = new GameController();
    return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
  }
};

module.exports = Application;
});

;require.register("controllers/game_controller", function(exports, require, module) {
var Admin, AutoPilot, Avatar, DJView, DrawingCanvas, EditAvatarView, EventBroker, GameController, IntroView, JoinGameView, MapView, Navi, Notifier, Player, PlayerList, Players, Reactor, Trailblazer, Weather, mediator, utils;

MapView = require('views/map_view');

DJView = require('views/dj_view');

mediator = require('lib/mediator');

EventBroker = require('lib/event_broker');

Player = require('models/player');

Players = require('models/players');

PlayerList = require('views/player_list');

Avatar = require('views/avatar');

DrawingCanvas = require('views/drawing_canvas');

IntroView = require('views/intro_view');

Trailblazer = require('models/trailblazer');

Weather = require('lib/weather');

Notifier = require('models/notifier');

JoinGameView = require('views/join_game_view');

EditAvatarView = require('views/edit_avatar_view');

AutoPilot = require('lib/autopilot');

Navi = require('lib/navi');

Reactor = require('lib/reactor');

Admin = require('lib/admin');

utils = require('lib/utils');

module.exports = GameController = (function() {
  Backbone.utils.extend(GameController.prototype, EventBroker);

  GameController.prototype.players = [];

  GameController.prototype.multiplayer = true;

  GameController.prototype.snow = false;

  GameController.prototype.trails = false;

  GameController.prototype.customNames = true;

  GameController.prototype.clickToNavigate = false;

  function GameController() {
    this.players = new Players([]);
    this.notifier = new Notifier;
    this.setupDJ();
    this.setupMap();
    this.setupCanvas();
    this.setupPlayer();
    this.setupSidebar();
    this.admin = new Admin;
    this.subscribeEvent('addPlayer', this.addPlayer);
    this.subscribeEvent('triggerIntro', this.intro);
    this.subscribeEvent('togglePlayback', function() {
      return this.DJ.togglePlayback();
    });
    this.createPlayerList();
    mediator.game_state = 'playing';
  }

  GameController.prototype.setupMap = function() {
    this.mapView = new MapView({
      className: 'map',
      el: document.getElementById("map"),
      autoRender: true
    });
    this.mapView.DJ = this.DJ;
    mediator = mediator;
    this.reactor = new Reactor(this.mapView, this.players);
    this.nav = new Navi(this.mapView);
    if (this.snow) {
      return Weather.snow('snowCanvas');
    }
  };

  GameController.prototype.setupDJ = function() {
    return this.DJ = new DJView;
  };

  GameController.prototype.setupCanvas = function() {
    return this.canvas = new DrawingCanvas({
      el: document.getElementById('drawCanvas'),
      autoRender: true
    });
  };

  GameController.prototype.setupPlayer = function() {
    var attrs, view,
      _this = this;
    attrs = JSON.parse(localStorage.getItem("CremalabPartyAvatar"));
    mediator.current_player = new Player(attrs);
    mediator.current_player.set({
      orientation: 1,
      x_position: 968,
      y_position: 1384,
      active: true,
      id: Date.now()
    });
    view = this.intro();
    this.mapView.listenTo(view, 'dispose', function() {
      return _this.drawOrPromptAvatar();
    });
    if (this.multiplayer) {
      return this.notifier.connect(mediator.current_player, function(channel) {
        channel = channel.split("players_")[1];
        return _this.mapView.setDimensions();
      });
    }
  };

  GameController.prototype.drawOrPromptAvatar = function() {
    if (mediator.current_player.get('name')) {
      return this.createPlayerAvatar(mediator.current_player);
    } else {
      if (this.customNames) {
        return this.promptPlayerName();
      } else {
        return this.createPlayerAvatar(mediator.current_player);
      }
    }
  };

  GameController.prototype.promptPlayerName = function(editing) {
    var player, view,
      _this = this;
    player = mediator.current_player;
    if (editing) {
      view = new EditAvatarView({
        container: document.body,
        model: player
      });
    } else {
      view = new JoinGameView({
        container: document.body,
        model: player
      });
    }
    return mediator.current_player.listenTo(view, 'setPlayerName', function(name) {
      view.dispose();
      player.set('name', name);
      player.save();
      if (!editing) {
        return _this.createPlayerAvatar(player);
      }
    });
  };

  GameController.prototype.createPlayerAvatar = function(player) {
    var avatar;
    avatar = new Avatar({
      model: player
    });
    avatar.autopilot = new AutoPilot(avatar, this.mapView);
    if (this.trails) {
      avatar.trailblazer = new Trailblazer({
        player: player,
        avatar: avatar,
        canvas: this.canvas
      });
    }
    this.mapView.listenTo(avatar, 'playerMove', this.mapView.checkPlayerPosition);
    this.mapView.spawnPlayer(player, avatar);
    this.players.add(player, {
      at: 0
    });
    this.mapView.addTouchEvents(avatar, 'touchstart');
    if (this.clickToNavigate) {
      this.mapView.addTouchEvents(avatar, 'click');
    }
    this.setupGameMenu();
    return this.mapView.centerMapOn(player.get('x_position'), player.get('y_position'), 0, 20);
  };

  GameController.prototype.addPlayer = function(uuid, data) {
    var avatar, player;
    if (data) {
      if (parseFloat(uuid) !== parseFloat(mediator.current_player.id)) {
        if (!this.players.get(uuid)) {
          player = new Player({
            id: uuid
          });
          player.set(data);
          avatar = new Avatar({
            model: player
          });
          if (this.trails) {
            avatar.trailblazer = new Trailblazer({
              player: player,
              avatar: avatar,
              canvas: this.canvas
            });
          }
          this.mapView.listenTo(avatar, 'playerMove', this.mapView.checkPlayerPosition);
          this.mapView.spawnPlayer(player, avatar);
          return this.players.add(player);
        }
      }
    }
  };

  GameController.prototype.createPlayerList = function() {
    return this.playerList = new PlayerList({
      collection: this.players,
      autoRender: true,
      container: document.getElementById('player_list'),
      map: this.mapView
    });
  };

  GameController.prototype.setupGameMenu = function() {
    var editAvatarButton,
      _this = this;
    editAvatarButton = document.createElement("button");
    document.getElementById('game-settings').appendChild(editAvatarButton);
    editAvatarButton.innerHTML = "Edit";
    return editAvatarButton.addEventListener('click', function(e) {
      e.preventDefault();
      return _this.promptPlayerName(true);
    });
  };

  GameController.prototype.intro = function(triggerVolume) {
    var view;
    view = new IntroView({
      container: document.body,
      triggerVolume: triggerVolume
    });
    return view;
  };

  GameController.prototype.setupSidebar = function() {
    var audioToggle, logo,
      _this = this;
    logo = document.querySelector('.sidebar-brand');
    logo.addEventListener('click', function() {
      return _this.publishEvent('triggerIntro', false);
    });
    audioToggle = document.querySelector('.audioToggle');
    return audioToggle.addEventListener('click', function() {
      _this.publishEvent('togglePlayback');
      return audioToggle.classList.toggle('sub-muted');
    });
  };

  return GameController;

})();
});

;require.register("initialize", function(exports, require, module) {
var application;

application = require('application');

document.addEventListener("DOMContentLoaded", function() {
  return application.initialize();
});
});

;require.register("lib/actions", function(exports, require, module) {
var EventBroker, Modal, mediator;

Modal = require('views/modal_view');

mediator = require('lib/mediator');

EventBroker = require('lib/event_broker');

module.exports = {
  team_photo: function(map) {
    var view;
    if (mediator.game_state !== 'modal') {
      view = new Modal({
        container: document.body,
        className: 'modal',
        template: require('views/templates/team_photo'),
        autoRender: true
      });
      return mediator.game_state = 'modal';
    }
  },
  bathroom_photo: function(map) {
    var view;
    if (mediator.game_state !== 'modal') {
      view = new Modal({
        container: document.body,
        className: 'modal',
        template: require('views/templates/bathroom_photo'),
        autoRender: true
      });
    }
    if (this.audio.paused) {
      return mediator.game_state = 'modal';
    }
  },
  lamp_light: function(map, options) {
    var item;
    item = options[0];
    if (item.img) {
      if (item.lamp_on) {
        item.img.setAttribute('src', 'party/images/lamp_1.png');
        return item.lamp_on = false;
      } else {
        item.img.setAttribute('src', 'party/images/lamp_2.png');
        return item.lamp_on = true;
      }
    }
  },
  lamp_light_flip: function(map, options) {
    var item;
    item = options[0];
    if (item.img) {
      if (item.lamp_on) {
        item.img.setAttribute('src', 'party/images/lamp_1_flip.png');
        return item.lamp_on = false;
      } else {
        item.img.setAttribute('src', 'party/images/lamp_2_flip.png');
        return item.lamp_on = true;
      }
    }
  },
  tweet_friends: function(map, options) {
    return window.open(options[0], "twitter");
  },
  disco: function(map) {
    var classList;
    classList = map.el.classList;
    if (classList.contains('disco-time')) {
      classList.remove('disco-time');
      return map.DJ.playTrack('soundtrack');
    } else {
      classList.add('disco-time');
      return map.DJ.playTrack('disco');
    }
  }
};
});

;require.register("lib/activist", function(exports, require, module) {
var Activist, EventBroker,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

EventBroker = require('lib/event_broker');

module.exports = Activist = (function() {
  Backbone.utils.extend(Activist.prototype, EventBroker);

  Activist.prototype.actionKey = 32;

  Activist.prototype.actionableItems = [];

  function Activist(landscaper) {
    this.handleKeyDown = __bind(this.handleKeyDown, this);
    this.landscaper = landscaper;
    document.addEventListener('keydown', this.handleKeyDown);
    this.subscribeEvent('map:interact', this.handleTap);
  }

  Activist.prototype.activate = function(ob) {
    ob.onHit = ob.onHit || {};
    ob.events = {};
    ob.addEventListener = function(eventName, handler) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(handler);
    };
    ob.raiseEvent = function(eventName, args) {
      var currentEvents, i;
      currentEvents = this.events[eventName];
      if (!currentEvents) {
        return;
      }
      i = 0;
      while (i < currentEvents.length) {
        if (typeof currentEvents[i] === "function") {
          currentEvents[i](args);
        }
        i++;
      }
    };
    this.addActor(ob);
    return ob;
  };

  Activist.prototype.addActor = function(item) {
    item.addEventListener('hit_left', function(options) {
      if (item.onHit.left) {
        return item.onHit.left(item, options);
      }
    });
    item.addEventListener('hit_right', function(options) {
      if (item.onHit.right) {
        return item.onHit.right(item, options);
      }
    });
    item.addEventListener('hit_top', function(options) {
      if (item.onHit.top) {
        return item.onHit.top(item, options);
      }
    });
    item.addEventListener('hit_bottom', function(options) {
      if (item.onHit.bottom) {
        return item.onHit.bottom(item, options);
      }
    });
    item.addEventListener('hit_any', function(options) {
      if (item.onHit.any) {
        return item.onHit.any(item, options);
      }
    });
    item.addEventListener('enterProximity', function(options) {
      item.current_player_within_proximity = true;
      if (item.proximity) {
        return item.proximity.onEnter(item, options);
      }
    });
    item.addEventListener('leaveProximity', function(options) {
      item.current_player_within_proximity = false;
      if (item.proximity) {
        return item.proximity.onLeave(item, options);
      }
    });
    if (item.proximity && item.proximity.keys) {
      if (item.proximity.keys.hasOwnProperty('action')) {
        this.actionableItems.push(item);
        return console.log(item.id);
      }
    }
  };

  Activist.prototype.handleKeyDown = function(e) {
    switch (e.keyCode) {
      case 32:
        return this.fireActionHandlers();
    }
  };

  Activist.prototype.handleTap = function(e, x, y) {
    var av_proxy, item, _i, _len, _ref, _results;
    _ref = this.actionableItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.current_player_within_proximity) {
        av_proxy = {
          width: 10,
          height: 10
        };
        if (this.landscaper.avatarOverlaps(av_proxy, item, x - this.landscaper.map.offset_x, y - this.landscaper.map.offset_y)) {
          e.preventDefault();
          e.stopPropagation();
          _results.push(item.proximity.keys.action(item));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Activist.prototype.fireActionHandlers = function() {
    var item, _i, _len, _ref, _results;
    _ref = this.actionableItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      if (item.current_player_within_proximity) {
        _results.push(item.proximity.keys.action(item));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Activist;

})();
});

;require.register("lib/admin", function(exports, require, module) {
var Admin, EventBroker, mediator;

mediator = require('lib/mediator');

EventBroker = require('lib/event_broker');

module.exports = Admin = (function() {
  Backbone.utils.extend(Admin.prototype, EventBroker);

  function Admin() {
    this.subscribeEvent("admin:init", this.init);
  }

  Admin.prototype.init = function() {
    mediator.game_state = 'admin';
    this.subscribeEvent("clickAvatar", this.kickPlayer);
    return document.body.classList.add("admin");
  };

  Admin.prototype.kickPlayer = function(avatar, player, e) {
    var kick;
    kick = confirm("Kick " + (player.get('name')) + "?");
    if (kick) {
      return this.publishEvent("admin:kick", player.id);
    }
  };

  Admin.prototype.uninit = function() {
    mediator.game_state = 'playing';
    this.unsubscribeEvent("clickAvatar", this.kickPlayer);
    return document.body.classList.remove("admin");
  };

  return Admin;

})();
});

;require.register("lib/autopilot", function(exports, require, module) {
var AutoPilot;

module.exports = AutoPilot = (function() {
  function AutoPilot(avatar, map) {
    this.avatar = avatar;
    this.map = map;
  }

  AutoPilot.prototype.travelToPoint = function(target) {
    target.x = target.x - this.map.offset_x;
    target.y = target.y - this.map.offset_y;
    return this.travelAvatar(target);
  };

  AutoPilot.prototype.travelAvatar = function(target) {
    var _this = this;
    if (!(this.avatar.moving || this.avatar.movementLoop)) {
      this.avatar.clearMovementClasses();
      return this.avatar.movementLoop = setInterval(function() {
        var current, dirs;
        current = _this.getCurrentPosition();
        dirs = _this.avatar.directionsByName;
        target.x = target.x;
        target.y = target.y;
        if (_this.avatar.isCloseEnoughTo(target.x, target.y)) {
          return _this.avatar.stopMovement();
        }
        if (current.x > target.x && !(Math.abs(current.x - target.x) < 10)) {
          _this.avatar.addActiveMovementKey(dirs['left']);
        } else {
          _this.avatar.stopMovementDirection(dirs['left']);
        }
        if (current.x < target.x && !(Math.abs(current.x - target.x) < 10)) {
          _this.avatar.addActiveMovementKey(dirs['right']);
        } else {
          _this.avatar.stopMovementDirection(dirs['right']);
        }
        if (current.y < target.y && !(Math.abs(current.y - target.y) < 10)) {
          _this.avatar.addActiveMovementKey(dirs['down']);
        } else {
          _this.avatar.stopMovementDirection(dirs['down']);
        }
        if (current.y > target.y && !(Math.abs(current.y - target.y) < 10)) {
          _this.avatar.addActiveMovementKey(dirs['up']);
        } else {
          _this.avatar.stopMovementDirection(dirs['up']);
        }
        return _this.avatar.move();
      }, this.avatar.movementLoopInc);
    }
  };

  AutoPilot.prototype.getCurrentPosition = function() {
    var current;
    current = {
      x: this.avatar.model.get('x_position'),
      y: this.avatar.model.get('y_position')
    };
    return current;
  };

  return AutoPilot;

})();
});

;require.register("lib/chatterbox", function(exports, require, module) {
var ChatInputView, ChatMessage, ChatterBox, Model, SpeechBubbleView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/model');

ChatInputView = require('views/chat_input_view');

ChatMessage = require('models/chat_message');

SpeechBubbleView = require('views/speech_bubble_view');

module.exports = ChatterBox = (function(_super) {
  __extends(ChatterBox, _super);

  function ChatterBox() {
    _ref = ChatterBox.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ChatterBox.prototype.initialize = function() {
    ChatterBox.__super__.initialize.apply(this, arguments);
    this.subscribeEvent("messages:received:" + (this.get('player').id), this.renderSpeechBubble);
    return this.subscribeEvent("messages:dismissed:" + (this.get('player').id), this.disposeBubble);
  };

  ChatterBox.prototype.handleEnter = function() {
    if (this.open) {
      return this.submit();
    } else {
      return this.openDialog();
    }
  };

  ChatterBox.prototype.openDialog = function() {
    if (this.speechBubble) {
      this.speechBubble.dispose();
    }
    this.open = true;
    this.message = new ChatMessage({
      uuid: this.get('player').id
    });
    return this.dialog = new ChatInputView({
      container: this.get('avatar').el,
      autoRender: true,
      model: this.message,
      avatar: this.get('avatar')
    });
  };

  ChatterBox.prototype.submit = function() {
    var message;
    message = this.dialog.el.querySelector("[name='chat_text']").value;
    if (message = "/admin") {
      this.publishEvent("admin:init");
      this.open = false;
      return this.dialog.dispose();
    }
    this.open = false;
    if (message) {
      this.message.set({
        content: message
      });
      this.message.save();
      this.renderSpeechBubble(this.message);
    }
    return this.dialog.dispose();
  };

  ChatterBox.prototype.renderSpeechBubble = function(message) {
    if (!(message instanceof ChatMessage)) {
      message = new ChatMessage(message);
    }
    if (this.speechBubble) {
      this.speechBubble.dispose();
    }
    this.speechBubble = new SpeechBubbleView({
      container: this.get('avatar').el,
      autoRender: true,
      avatar: this.get('avatar'),
      model: message,
      chatterBox: this
    });
    return this.message = message;
  };

  ChatterBox.prototype.disposeBubble = function(local) {
    this.open = false;
    if (this.message) {
      this.message.dispose();
    }
    if (this.dialog) {
      this.dialog.dispose();
    }
    if (this.speechBubble) {
      this.speechBubble.dispose();
    }
    if (local) {
      return this.publishEvent("messages:dismissed", this.get('player').id);
    }
  };

  return ChatterBox;

})(Model);
});

;require.register("lib/escort", function(exports, require, module) {
var channel_prefix;

channel_prefix = "players_";

module.exports = {
  capacity: 50,
  findEmptyRoom: function(PN, cb) {
    return this.testRoom(PN, 0, cb);
  },
  testRoom: function(PN, i, cb) {
    var _this = this;
    return PN.here_now({
      channel: channel_prefix + i,
      callback: function(m) {
        if (m.uuids.length >= _this.capacity) {
          return _this.testRoom(PN, i + 1, cb);
        } else {
          return cb(channel_prefix + i);
        }
      }
    });
  }
};
});

;require.register("lib/event_broker", function(exports, require, module) {
'use strict';
var EventBroker, mediator,
  __slice = [].slice;

mediator = require('lib/mediator');

EventBroker = {
  subscribeEvent: function(type, handler) {
    if (typeof type !== 'string') {
      throw new TypeError('EventBroker#subscribeEvent: ' + 'type argument must be a string');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('EventBroker#subscribeEvent: ' + 'handler argument must be a function');
    }
    mediator.unsubscribe(type, handler, this);
    return mediator.subscribe(type, handler, this);
  },
  subscribeEventOnce: function(type, handler) {
    if (typeof type !== 'string') {
      throw new TypeError('EventBroker#subscribeEventOnce: ' + 'type argument must be a string');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('EventBroker#subscribeEventOnce: ' + 'handler argument must be a function');
    }
    mediator.unsubscribe(type, handler, this);
    return mediator.subscribeOnce(type, handler, this);
  },
  unsubscribeEvent: function(type, handler) {
    if (typeof type !== 'string') {
      throw new TypeError('EventBroker#unsubscribeEvent: ' + 'type argument must be a string');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('EventBroker#unsubscribeEvent: ' + 'handler argument must be a function');
    }
    return mediator.unsubscribe(type, handler);
  },
  unsubscribeAllEvents: function() {
    return mediator.unsubscribe(null, null, this);
  },
  publishEvent: function() {
    var args, type;
    type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (typeof type !== 'string') {
      throw new TypeError('EventBroker#publishEvent: ' + 'type argument must be a string');
    }
    return mediator.publish.apply(mediator, [type].concat(__slice.call(args)));
  }
};

if (typeof Object.freeze === "function") {
  Object.freeze(EventBroker);
}

module.exports = EventBroker;
});

;require.register("lib/landscape", function(exports, require, module) {
var EventBroker;

EventBroker = require('lib/event_broker');

module.exports = [
  {
    id: "table",
    src: "/party/images/table.png",
    x: 260,
    y: 400
  }, {
    id: "table2",
    src: "/party/images/table.png",
    x: 25,
    y: 400
  }, {
    id: "table3",
    src: "/party/images/table.png",
    x: 25,
    y: 475
  }, {
    id: "table4",
    src: "/party/images/table.png",
    x: 260,
    y: 475
  }, {
    id: "table5",
    src: "/party/images/table.png",
    x: 25,
    y: 800
  }, {
    id: "table8",
    src: "/party/images/table.png",
    x: 260,
    y: 800
  }, {
    id: "table6",
    src: "/party/images/table.png",
    x: 25,
    y: 875
  }, {
    id: "table7",
    src: "/party/images/table.png",
    x: 260,
    y: 875
  }, {
    id: "mac",
    src: "/party/images/mac.png",
    x: 345,
    y: 480,
    ghosty: true
  }, {
    id: "mac2",
    src: "/party/images/mac.png",
    x: 115,
    y: 480,
    ghosty: true
  }, {
    id: "mac3",
    src: "/party/images/mac.png",
    x: 345,
    y: 880,
    ghosty: true
  }, {
    id: "mac4",
    src: "/party/images/mac.png",
    x: 115,
    y: 880,
    ghosty: true
  }, {
    id: "macflip",
    src: "/party/images/mac_flip.png",
    x: 345,
    y: 410,
    ghosty: true
  }, {
    id: "macflip2",
    src: "/party/images/mac_flip.png",
    x: 115,
    y: 410,
    ghosty: true
  }, {
    id: "macflip3",
    src: "/party/images/mac_flip.png",
    x: 345,
    y: 810,
    ghosty: true
  }, {
    id: "macflip4",
    src: "/party/images/mac_flip.png",
    x: 115,
    y: 810
  }, {
    id: "table_vertical",
    src: "/party/images/table_vertical.png",
    x: 900,
    y: 400
  }, {
    id: "table_vertical2",
    src: "/party/images/table_vertical.png",
    x: 970,
    y: 400
  }, {
    id: "table_vertical3",
    src: "/party/images/table_vertical.png",
    x: 970,
    y: 635
  }, {
    id: "table_vertical4",
    src: "/party/images/table_vertical.png",
    x: 900,
    y: 635
  }, {
    id: "orange_chair",
    src: "/party/images/orange_chair.png",
    x: 850,
    y: 725
  }, {
    id: "red_chair",
    src: "/party/images/red_chair.png",
    x: 1050,
    y: 680
  }, {
    id: "red_chair2",
    src: "/party/images/red_chair.png",
    x: 300,
    y: 960
  }, {
    id: "red_chair3",
    src: "/party/images/red_chair.png",
    x: 130,
    y: 960
  }, {
    id: "orange_chair5",
    src: "/party/images/orange_chair.png",
    x: 310,
    y: 1120
  }, {
    id: "red_chair5",
    src: "/party/images/red_chair.png",
    x: 300,
    y: 1260
  }, {
    id: "red_chair4",
    src: "/party/images/red_chair.png",
    x: 350,
    y: 560
  }, {
    id: "orange_chair3",
    src: "/party/images/orange_chair.png",
    x: 358,
    y: 345
  }, {
    id: "orange_chair4",
    src: "/party/images/orange_chair.png",
    x: 375,
    y: 745
  }, {
    id: "orange_chair2",
    src: "/party/images/orange_chair.png",
    x: 1050,
    y: 390
  }, {
    id: "bookshelf",
    src: "/party/images/bookshelf.png",
    x: 25,
    y: 55
  }, {
    id: "bookshelf2",
    src: "/party/images/bookshelf.png",
    x: 110,
    y: 55
  }, {
    id: "bookshelf3",
    src: "/party/images/bookshelf.png",
    x: 195,
    y: 55
  }, {
    id: "bookshelf5",
    src: "/party/images/bookshelf.png",
    x: 280,
    y: 55
  }, {
    id: "bookshelf4",
    src: "/party/images/bookshelf.png",
    x: 690,
    y: 55
  }, {
    id: "couch",
    src: "/party/images/couch.png",
    x: 495,
    y: 475
  }, {
    id: "couch2",
    src: "/party/images/couch.png",
    x: 495,
    y: 875
  }, {
    id: "couch_flip",
    src: "/party/images/couch_flip.png",
    x: 335,
    y: 1175
  }, {
    id: "sharpie_table",
    src: "/party/images/sharpie_table.png",
    x: 190,
    y: 550
  }, {
    id: "sharpie_table2",
    src: "/party/images/sharpie_table.png",
    x: 215,
    y: 740
  }, {
    id: "sharpie_table3",
    src: "/party/images/sharpie_table.png",
    x: 70,
    y: 340
  }, {
    id: "office_table",
    src: "/party/images/office_table.png",
    x: 1640,
    y: 1075
  }, {
    id: "long_cabinet",
    src: "/party/images/long_cabinet.png",
    x: 500,
    y: 80
  }, {
    id: "long_cabinet2",
    src: "/party/images/long_cabinet.png",
    x: 775,
    y: 80
  }, {
    id: "container",
    src: "/party/images/container.png",
    x: 965,
    y: 80
  }, {
    id: "container2",
    src: "/party/images/container.png",
    x: 1015,
    y: 80
  }, {
    id: "container3",
    src: "/party/images/container.png",
    x: 1065,
    y: 80
  }, {
    id: "office_chair",
    src: "/party/images/office_chair.png",
    x: 1810,
    y: 1130
  }, {
    id: "office_chair2",
    src: "/party/images/office_chair.png",
    x: 1810,
    y: 1230
  }, {
    id: "office_chair3",
    src: "/party/images/office_chair.png",
    x: 1810,
    y: 1330
  }, {
    id: "office_chair4",
    src: "/party/images/office_chair.png",
    x: 1810,
    y: 1430
  }, {
    id: "office_chair_flip",
    src: "/party/images/office_chair_flip.png",
    x: 1605,
    y: 1130
  }, {
    id: "office_chair_flip2",
    src: "/party/images/office_chair_flip.png",
    x: 1605,
    y: 1230
  }, {
    id: "office_chair_flip3",
    src: "/party/images/office_chair_flip.png",
    x: 1605,
    y: 1330
  }, {
    id: "office_chair_flip4",
    src: "/party/images/office_chair_flip.png",
    x: 1605,
    y: 1430
  }, {
    id: "desk_chair",
    src: "/party/images/desk_chair.png",
    x: 1055,
    y: 500
  }, {
    id: "desk_chair2",
    src: "/party/images/desk_chair.png",
    x: 1055,
    y: 750
  }, {
    id: "desk_chair_flip",
    src: "/party/images/desk_chair_flip.png",
    x: 870,
    y: 500
  }, {
    id: "desk_chair_flip2",
    src: "/party/images/desk_chair_flip.png",
    x: 870,
    y: 750
  }, {
    id: "fridge",
    src: "/party/images/fridge.png",
    x: 1125,
    y: 50,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "[Interact] View the curious photo on the fridge",
          id: "fridge_hint",
          position: 'right'
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "fridge_hint");
      },
      keys: {
        action: function() {
          return EventBroker.publishEvent('reactor:act', 'team_photo');
        }
      }
    }
  }, {
    id: "wall",
    src: "/party/images/wall.png",
    x: 1630,
    zIndex: 10,
    y: 285
  }, {
    id: "door",
    src: "/party/images/door.png",
    x: 1780,
    zIndex: 50,
    y: 315,
    proximity: {
      radius: 10,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "[Interact] Knock on the door?",
          id: "bathroom_hint"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "bathroom_hint");
      },
      keys: {
        action: function() {
          return EventBroker.publishEvent('reactor:act', 'bathroom_photo');
        }
      }
    }
  }, {
    id: "wall_2",
    src: "/party/images/wall_2.png",
    x: 1630,
    zIndex: 20,
    y: 0
  }, {
    id: "wall_3",
    src: "/party/images/wall3.png",
    x: 1430,
    y: 835
  }, {
    id: "wall_4",
    src: "/party/images/wall4.png",
    x: 1408,
    y: 835
  }, {
    id: "counter",
    src: "/party/images/counter.png",
    x: 1590,
    y: 80,
    zIndex: 25
  }, {
    id: "counter_2",
    src: "/party/images/counter_2.png",
    x: 1222,
    y: 82
  }, {
    id: "coffee_table",
    src: "/party/images/coffee_table.png",
    x: 200,
    y: 1160
  }, {
    id: "front_table",
    src: "/party/images/front_table.png",
    x: 900,
    y: 1060
  }, {
    id: "tree",
    src: "/party/images/tree1.png",
    x: 1485,
    y: 530
  }, {
    id: "plant",
    src: "/party/images/plant.png",
    x: 955,
    y: 590,
    ghosty: true
  }, {
    id: "Lamp",
    src: "/party/images/lamp_1.png",
    x: 990,
    y: 380,
    zIndex: 400,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        return EventBroker.publishEvent('reactor:act', 'lamp_light', item);
      },
      onLeave: function(item, options) {
        return EventBroker.publishEvent('reactor:act', "lamp_light", item);
      }
    }
  }, {
    id: "Lamp2",
    src: "/party/images/lamp_1_flip.png",
    x: 920,
    y: 680,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        return EventBroker.publishEvent('reactor:act', 'lamp_light_flip', item);
      },
      onLeave: function(item, options) {
        return EventBroker.publishEvent('reactor:act', "lamp_light_flip", item);
      }
    }
  }, {
    id: "Lamp3",
    src: "/party/images/lamp_1_flip.png",
    x: 190,
    y: 400,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        return EventBroker.publishEvent('reactor:act', 'lamp_light_flip', item);
      },
      onLeave: function(item, options) {
        return EventBroker.publishEvent('reactor:act', "lamp_light_flip", item);
      }
    }
  }, {
    id: "Lamp4",
    src: "/party/images/lamp_1.png",
    x: 270,
    y: 800,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        return EventBroker.publishEvent('reactor:act', 'lamp_light', item);
      },
      onLeave: function(item, options) {
        return EventBroker.publishEvent('reactor:act', "lamp_light", item);
      }
    }
  }, {
    id: "ipad",
    src: "/party/images/ipad.png",
    x: 990,
    y: 480,
    ghosty: true,
    mirror: true
  }, {
    id: "ipad4",
    src: "/party/images/ipad.png",
    x: 915,
    y: 755,
    ghosty: true
  }, {
    id: "ipad3",
    src: "/party/images/ipad.png",
    x: 435,
    y: 515,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "[Interact] Start the dance party",
          id: "disco_hint"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "disco_hint");
      },
      keys: {
        action: function() {
          return EventBroker.publishEvent('reactor:act', 'disco');
        }
      }
    }
  }, {
    id: "ipad2",
    src: "/party/images/ipad.png",
    x: 630,
    y: 75,
    ghosty: true,
    mirror: true
  }, {
    id: "flamingo",
    src: "/party/images/flamingo.png",
    x: 930,
    y: 525,
    ghosty: true
  }, {
    id: "dan",
    src: "/party/images/dan.png",
    x: 390,
    y: 70,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Go Jayhawks!",
          id: "dan_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "dan_talk");
      }
    }
  }, {
    id: "george",
    src: "/party/images/george.png",
    x: 1070,
    y: 1170,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Welcome to Cremalab! Try and find the hidden disco mode!",
          id: "george_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "george_talk");
      }
    }
  }, {
    id: "nate",
    src: "/party/images/nate.png",
    x: 120,
    y: 520,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "[interact] Invite your friends to the party!",
          id: "nate_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "nate_talk");
      },
      keys: {
        action: function() {
          return EventBroker.publishEvent('reactor:act', 'tweet_friends', 'https://twitter.com/home?status=Have%20you%20visited%20the%20%23CremaChristmas%20party%20yet?%20@Cremalab%20used%20@PubNub%20@Brunch%20to%20bring%20it%20to%20life.%20Come%20join%20me!%20cremalab.com/party');
        }
      }
    }
  }, {
    id: "rob",
    src: "/party/images/rob.png",
    x: 1520,
    y: 120,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Did you bring any food?",
          id: "rob_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "rob_talk");
      }
    }
  }, {
    id: "ross",
    src: "/party/images/ross.png",
    x: 1450,
    y: 900,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Leave me alone! I'm working!",
          id: "ross_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "ross_talk");
      }
    }
  }, {
    id: "deric",
    src: "/party/images/deric.png",
    x: 380,
    y: 1170,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "We hope you and your family have a great holiday season!",
          id: "deric_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "deric_talk");
      }
    }
  }, {
    id: "kelly",
    src: "/party/images/kelly.png",
    x: 1410,
    y: 580,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Welcome to our space. Come back anytime!",
          id: "kelly_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "kelly_talk");
      }
    }
  }, {
    id: "John",
    src: "/party/images/john.png",
    x: 820,
    y: 1180,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Life's a garden... Dig it!",
          id: "john_talk"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "john_talk");
      }
    }
  }, {
    id: "present21",
    src: "/party/images/present_32.png",
    x: 1470,
    y: 655,
    ghosty: true
  }, {
    id: "present22",
    src: "/party/images/present_2.png",
    x: 1560,
    y: 645
  }, {
    id: "present23",
    src: "/party/images/present_2.png",
    x: 940,
    y: 425,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Ross wants a new synthesizer!",
          id: "ross_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "ross_present");
      }
    }
  }, {
    id: "present24",
    src: "/party/images/present_31.png",
    x: 995,
    y: 515,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Rob wants the new Call of Duty!",
          id: "rob_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "rob_present");
      }
    }
  }, {
    id: "present1",
    src: "/party/images/present_1.png",
    x: 1495,
    y: 650,
    ghosty: true
  }, {
    id: "present6",
    src: "/party/images/present_3.png",
    x: 1535,
    y: 655,
    ghosty: true
  }, {
    id: "present2",
    src: "/party/images/present_22.png",
    x: 1515,
    y: 655,
    ghosty: true
  }, {
    id: "present3",
    src: "/party/images/present_21.png",
    x: 925,
    y: 805,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Deric wants more Sriracha sauce!",
          id: "deric_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "deric_present");
      }
    }
  }, {
    id: "present4",
    src: "/party/images/present_3.png",
    zIndex: 100,
    x: 525,
    y: 75,
    ghosty: true
  }, {
    id: "present41",
    src: "/party/images/present_31.png",
    zIndex: 100,
    x: 825,
    y: 75,
    ghosty: true
  }, {
    id: "present25",
    src: "/party/images/present_2.png",
    zIndex: 100,
    x: 803,
    y: 68,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "George wants shoes as cool as Bishop's!",
          id: "george_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "george_present");
      }
    }
  }, {
    id: "present26",
    src: "/party/images/present_22.png",
    zIndex: 1000,
    x: 195,
    y: 498,
    ghosty: true
  }, {
    id: "present27",
    src: "/party/images/present_2.png",
    zIndex: 1000,
    x: 195,
    y: 798,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Matt wants a new messenger bag!",
          id: "matt_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "matt_present");
      }
    }
  }, {
    id: "present51",
    src: "/party/images/present_21.png",
    x: 225,
    y: 1160,
    ghosty: true
  }, {
    id: "present5",
    src: "/party/images/present_31.png",
    x: 240,
    y: 1175,
    ghosty: true
  }, {
    id: "present7",
    src: "/party/images/present_35.png",
    x: 220,
    y: 895,
    ghosty: true
  }, {
    id: "present72",
    src: "/party/images/present_31.png",
    x: 415,
    y: 910,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Michael wants an iPad air 2!",
          id: "michael_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "michael_present");
      }
    }
  }, {
    id: "present71",
    src: "/party/images/present_22.png",
    x: 205,
    y: 895,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Bishop wants an iPhone 6+!",
          id: "bishop_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "bishop_present");
      }
    }
  }, {
    id: "present8",
    src: "/party/images/present_35.png",
    x: 1015,
    y: 785,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "John wants something purple!",
          id: "john_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "john_present");
      }
    }
  }, {
    id: "present81",
    src: "/party/images/present_32.png",
    x: 1015,
    y: 635,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Kelly wants more cheese!",
          id: "kelly_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "kelly_present");
      }
    }
  }, {
    id: "present9",
    src: "/party/images/present_33.png",
    x: 430,
    y: 410,
    proximity: {
      radius: 60,
      onEnter: function(item, options) {
        var hint;
        hint = {
          obstruction: item,
          text: "Dan wants KU basketball tickets!",
          id: "dan_present"
        };
        return EventBroker.publishEvent('navi:hint', hint);
      },
      onLeave: function() {
        return EventBroker.publishEvent('navi:dismiss_hint', "dan_present");
      }
    }
  }, {
    id: "present11",
    src: "/party/images/present_2.png",
    x: 1510,
    y: 65,
    zIndex: 100,
    ghosty: true
  }, {
    id: "present10",
    src: "/party/images/present_32.png",
    x: 1530,
    y: 80,
    zIndex: 100,
    ghosty: true
  }
];
});

;require.register("lib/landscaper", function(exports, require, module) {
var Activist, Landscaper;

Activist = require('lib/activist');

module.exports = Landscaper = (function() {
  Landscaper.prototype.landscape = require('lib/landscape');

  Landscaper.prototype.obstructions = [];

  Landscaper.prototype.current_player_overlaps = [];

  function Landscaper(options) {
    this.map = options.map;
  }

  Landscaper.prototype.init = function() {
    var obstruction, svg, _i, _len, _ref, _results;
    this.activist = new Activist(this);
    _ref = this.landscape;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obstruction = _ref[_i];
      if (obstruction.hasOwnProperty('src')) {
        svg = this.createObstructionGraphic(obstruction);
        obstruction = this.activist.activate(obstruction);
        if (!obstruction.ghosty) {
          _results.push(this.obstructions.push(obstruction));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Landscaper.prototype.createObstructionGraphic = function(obstruction) {
    var extension, img, position;
    position = "" + obstruction.x + "px, " + obstruction.y + "px";
    img = document.createElement('img');
    img.id = obstruction.id;
    img.setAttribute('src', obstruction.src);
    img = this.map.el.appendChild(img);
    extension = obstruction.src.split(".");
    extension = extension[extension.length - 1];
    img.style.top = "" + obstruction.y + "px";
    img.style.left = "" + obstruction.x + "px";
    img.classList.add('obstruction');
    if (extension === 'svg') {
      return this.createSVG(obstruction, img);
    } else {
      return this.createImage(obstruction, img);
    }
  };

  Landscaper.prototype.createSVG = function(obstruction, img) {
    return SVGInjector(img, {}, function() {
      var box;
      img = document.querySelector("svg#" + obstruction.id);
      box = img.getBBox();
      img.x = obstruction.x;
      img.y = obstruction.y;
      obstruction.left = obstruction.x;
      obstruction.top = obstruction.y;
      obstruction.right = obstruction.x + box.width;
      obstruction.bottom = obstruction.y + box.height;
      img.classList.add('svg');
      if (obstruction.mirror) {
        img.style.webkitTransform = "scaleX(-1)";
      }
      return obstruction.svg = img;
    });
  };

  Landscaper.prototype.createImage = function(obstruction, img) {
    img = document.getElementById(obstruction.id);
    return imagesLoaded(img, function() {
      var rect;
      rect = img.getClientRects()[0];
      obstruction.left = obstruction.x;
      obstruction.top = obstruction.y;
      obstruction.right = obstruction.x + rect.width;
      obstruction.bottom = obstruction.y + rect.height;
      img.classList.add('img');
      img.style.zIndex = obstruction.zIndex || obstruction.y;
      if (obstruction.mirror) {
        img.style.webkitTransform = "scaleX(-1)";
      }
      return obstruction.img = img;
    });
  };

  Landscaper.prototype.checkObstructions = function(x, y, avatar, map) {
    var availableDirections, obstruction, _i, _len, _ref;
    availableDirections = {
      right: true,
      left: true,
      up: true,
      down: true
    };
    this.rights = [];
    this.ups = [];
    this.lefts = [];
    this.downs = [];
    _ref = this.obstructions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obstruction = _ref[_i];
      this.getObstructionShape(obstruction, x, y, avatar);
    }
    availableDirections.right = this.rights.indexOf(false) < 0;
    availableDirections.left = this.lefts.indexOf(false) < 0;
    availableDirections.up = this.ups.indexOf(false) < 0;
    availableDirections.down = this.downs.indexOf(false) < 0;
    if ((x + avatar.width) > map.width) {
      availableDirections.right = false;
    }
    if (x < 0) {
      availableDirections.left = false;
    }
    if ((y + avatar.height + map.padding_bottom) >= map.height) {
      availableDirections.down = false;
    }
    if ((y + avatar.height - map.padding_top) < 0) {
      availableDirections.up = false;
    }
    avatar.availableDirections = availableDirections;
    return avatar.trigger('availableDirectionsUpdated', x, y);
  };

  Landscaper.prototype.getObstructionShape = function(obstruction, x, y, avatar) {
    var avatarRect, player;
    if (obstruction.svg) {
      avatarRect = obstruction.svg.createSVGRect();
    } else {
      avatarRect = avatar.rect;
    }
    avatarRect.height = avatar.height;
    avatarRect.width = avatar.width;
    player = avatar.model;
    avatarRect.x = player.get('x_position');
    avatarRect.y = player.get('y_position');
    this.checkIntersections(obstruction, avatarRect, player, x, y, avatar);
    if (obstruction.proximity) {
      return this.checkProximities(avatarRect, obstruction, x, y, avatar);
    }
  };

  Landscaper.prototype.checkIntersections = function(obstruction, avatarRect, player, x, y, avatar) {
    if (x < avatarRect.x) {
      avatarRect.x = x;
      this.determineDirections(avatarRect, obstruction, this.lefts, 'right', x, y, avatar);
      avatarRect.x = player.get('x_position');
    }
    if (x > avatarRect.x) {
      avatarRect.x = x;
      this.determineDirections(avatarRect, obstruction, this.rights, 'left', x, y, avatar);
      avatarRect.x = player.get('x_position');
    }
    if (y < avatarRect.y) {
      avatarRect.y = y;
      this.determineDirections(avatarRect, obstruction, this.ups, 'bottom', x, y, avatar);
      avatarRect.y = player.get('y_position');
    }
    if (y > avatarRect.y) {
      avatarRect.y = y;
      this.determineDirections(avatarRect, obstruction, this.downs, 'top', x, y, avatar);
      return avatarRect.y = player.get('y_position');
    }
  };

  Landscaper.prototype.checkProximities = function(avatarRect, obstruction, x, y, avatar) {
    var proximity, radius;
    radius = obstruction.proximity.radius;
    if (!radius) {
      throw new Error("Proximity declaration of " + obstruction.id + " needs a radius");
    }
    proximity = {
      top: obstruction.top - radius,
      bottom: obstruction.bottom + radius,
      left: obstruction.left - radius,
      right: obstruction.right + radius
    };
    if (this.avatarOverlaps(avatar, proximity, x, y)) {
      if (!obstruction.current_player_overlap) {
        this.current_player_overlaps.push(obstruction.id);
        obstruction.current_player_overlap = true;
        return obstruction.raiseEvent('enterProximity');
      }
    } else {
      if (this.current_player_overlaps.indexOf(obstruction.id) > -1) {
        obstruction.raiseEvent('leaveProximity');
        this.current_player_overlaps.splice(this.current_player_overlaps.indexOf(obstruction.id), 1);
        return obstruction.current_player_overlap = false;
      }
    }
  };

  Landscaper.prototype.determineDirections = function(avatarRect, obstruction, array, dir, x, y, avatar) {
    if (obstruction.svg) {
      return this.determineSVGDirections(avatarRect, obstruction, array, dir, x, y, avatar);
    } else {
      return this.determineImgDirections(avatarRect, obstruction, array, dir, x, y, avatar);
    }
  };

  Landscaper.prototype.determineImgDirections = function(avatarRect, obstruction, array, dir, x, y, avatar) {
    if (this.avatarOverlaps(avatar, obstruction, x, y)) {
      array.push(false);
      return this.dispatchHitActions(obstruction, dir, x, y, avatar);
    } else {
      return array.push(true);
    }
  };

  Landscaper.prototype.determineSVGDirections = function(avatarRect, obstruction, array, dir, x, y, avatar) {
    if (obstruction.svg.getIntersectionList(avatarRect, null).length < 1) {
      return array.push(true);
    } else {
      array.push(false);
      return this.dispatchHitActions(obstruction, dir, x, y, avatar);
    }
  };

  Landscaper.prototype.dispatchHitActions = function(obstruction, dir, x, y, avatar) {
    var options;
    options = {
      avatar: avatar,
      x: x,
      y: y
    };
    obstruction.raiseEvent("hit_" + dir, options);
    return obstruction.raiseEvent("hit_any", options);
  };

  Landscaper.prototype.avatarOverlaps = function(a, b, x, y) {
    var aAboveB, aBelowB, aLeftOfB, aRightOfB;
    aLeftOfB = (x + a.width) < b.left;
    aRightOfB = x > b.right;
    aBelowB = y > b.bottom;
    aAboveB = (y + a.height) < b.top;
    return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
  };

  return Landscaper;

})();
});

;require.register("lib/mediator", function(exports, require, module) {
'use strict';
var handlers, mediator,
  __slice = [].slice;

mediator = {};

mediator.subscribe = mediator.on = Backbone.Events.on;

mediator.subscribeOnce = mediator.once = Backbone.Events.once;

mediator.unsubscribe = mediator.off = Backbone.Events.off;

mediator.publish = mediator.trigger = Backbone.Events.trigger;

mediator._callbacks = null;

mediator.current_player = null;

mediator.game_state = null;

handlers = mediator._handlers = {};

mediator.setHandler = function(name, method, instance) {
  return handlers[name] = {
    instance: instance,
    method: method
  };
};

mediator.execute = function() {
  var args, handler, name, nameOrObj, silent;
  nameOrObj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  silent = false;
  if (typeof nameOrObj === 'object') {
    silent = nameOrObj.silent;
    name = nameOrObj.name;
  } else {
    name = nameOrObj;
  }
  handler = handlers[name];
  if (handler) {
    return handler.method.apply(handler.instance, args);
  } else if (!silent) {
    throw new Error("mediator.execute: " + name + " handler is not defined");
  }
};

mediator.removeHandlers = function(instanceOrNames) {
  var handler, name, _i, _len;
  if (!instanceOrNames) {
    mediator._handlers = {};
  }
  if (Array.isArray(instanceOrNames)) {
    for (_i = 0, _len = instanceOrNames.length; _i < _len; _i++) {
      name = instanceOrNames[_i];
      delete handlers[name];
    }
  } else {
    for (name in handlers) {
      handler = handlers[name];
      if (handler.instance === instanceOrNames) {
        delete handlers[name];
      }
    }
  }
};

mediator.seal = function() {
  if (support.propertyDescriptors && Object.seal) {
    return Object.seal(mediator);
  }
};

module.exports = mediator;
});

;require.register("lib/navi", function(exports, require, module) {
var EventBroker, Hint, HintView, Navi;

EventBroker = require('lib/event_broker');

Hint = require('models/hint');

HintView = require('views/hint_view');

module.exports = Navi = (function() {
  Backbone.utils.extend(Navi.prototype, EventBroker);

  Navi.prototype.subviews = [];

  Navi.prototype.hints = [];

  function Navi(map) {
    this.map = map;
    this.subscribeEvent("navi:hint", this.hint);
    this.subscribeEvent("navi:dismiss_hint", this.removeHint);
  }

  Navi.prototype.hint = function(options) {
    var hint, view;
    hint = new Hint(options);
    this.hints.push(hint);
    view = new HintView({
      model: hint,
      container: this.map.el,
      autoRender: true
    });
    return this.subviews.push(view);
  };

  Navi.prototype.removeHint = function(id) {
    var match;
    match = this.hints.filter(function(item) {
      return item.id === id;
    });
    match = match[0];
    if (match) {
      match.dispose();
      this.hints.splice(this.hints.indexOf(match), 1);
      return this.subviews.splice(this.hints.indexOf(match), 1);
    }
  };

  return Navi;

})();
});

;require.register("lib/reactor", function(exports, require, module) {
var EventBroker, Reactor, actions, mediator,
  __slice = [].slice;

EventBroker = require('lib/event_broker');

mediator = require('lib/mediator');

actions = require('lib/actions');

module.exports = Reactor = (function() {
  Backbone.utils.extend(Reactor.prototype, EventBroker);

  function Reactor(mapView, players) {
    var _this = this;
    this.map = mapView;
    this.players = players;
    this.actions = actions;
    this.subscribeEvent('reactor:act', function() {
      var actionName, options;
      actionName = arguments[0], options = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return _this.actions[actionName](_this.map, options);
    });
  }

  return Reactor;

})();
});

;require.register("lib/utils", function(exports, require, module) {
var utils,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

utils = {
  getAllPropertyVersions: function(object, property) {
    var proto, result, value, _i, _len, _ref;
    result = [];
    _ref = utils.getPrototypeChain(object);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      proto = _ref[_i];
      value = proto[property];
      if (value && __indexOf.call(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  },
  serialize: function(data) {
    if (typeof data.serialize === 'function') {
      return data.serialize();
    } else if (typeof data.toJSON === 'function') {
      return data.toJSON();
    } else {
      throw new TypeError('utils.serialize: Unknown data was passed');
    }
  },
  getPrototypeChain: function(object) {
    var chain, _ref, _ref1, _ref2, _ref3;
    chain = [object.constructor.prototype];
    while (object = (_ref = (_ref1 = object.constructor) != null ? (_ref2 = _ref1.superclass) != null ? _ref2.prototype : void 0 : void 0) != null ? _ref : (_ref3 = object.constructor) != null ? _ref3.__super__ : void 0) {
      chain.push(object);
    }
    return chain.reverse();
  }
};

module.exports = utils;
});

;require.register("lib/weather", function(exports, require, module) {
var doSnow, flakeCount, flakes, mX, mY, reset, startSnow, weather;

flakeCount = 200;

mX = -100;

mY = -100;

flakes = [];

reset = function(flake, canvas) {
  flake.x = Math.floor(Math.random() * canvas.width);
  flake.y = 0;
  flake.size = (Math.random() * 3) + 2;
  flake.speed = (Math.random() * 1) + 0.5;
  flake.velY = flake.speed;
  flake.velX = 0;
  flake.opacity = (Math.random() * 0.5) + 0.3;
};

startSnow = function(canvasId) {
  var canvas, ctx, i, opacity, requestAnimationFrame, size, speed, x, y;
  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
  window.requestAnimationFrame = requestAnimationFrame;
  canvas = document.getElementById(canvasId);
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener("mousemove", function(e) {
    mX = e.clientX;
    mY = e.clientY;
  });
  i = 0;
  while (i < flakeCount) {
    x = Math.floor(Math.random() * canvas.width);
    y = Math.floor(Math.random() * canvas.height);
    size = (Math.random() * 3) + 2;
    speed = (Math.random() * 1) + 0.5;
    opacity = (Math.random() * 0.5) + 0.3;
    flakes.push({
      speed: speed,
      velY: speed,
      velX: 0,
      x: x,
      y: y,
      size: size,
      stepSize: (Math.random()) / 30,
      step: 0,
      angle: 180,
      opacity: opacity
    });
    i++;
  }
  doSnow(ctx, canvas);
};

doSnow = function(ctx, canvas) {
  var deltaV, dist, dx, dy, flake, force, i, minDist, x, x2, xcomp, y, y2, ycomp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  i = 0;
  while (i < flakeCount) {
    flake = flakes[i];
    x = mX;
    y = mY;
    minDist = 150;
    x2 = flake.x;
    y2 = flake.y;
    dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y));
    dx = x2 - x;
    dy = y2 - y;
    if (dist < minDist) {
      force = minDist / (dist * dist);
      xcomp = (x - x2) / dist;
      ycomp = (y - y2) / dist;
      deltaV = force / 2;
      flake.velX -= deltaV * xcomp;
      flake.velY -= deltaV * ycomp;
    } else {
      flake.velX *= .98;
      if (flake.velY <= flake.speed) {
        flake.velY = flake.speed;
      }
      flake.velX += Math.cos(flake.step += .05) * flake.stepSize;
    }
    ctx.fillStyle = "rgba(255,255,255," + flake.opacity + ")";
    flake.y += flake.velY;
    flake.x += flake.velX;
    if (flake.y >= canvas.height || flake.y <= 0) {
      reset(flake, canvas);
    }
    if (flake.x >= canvas.width || flake.x <= 0) {
      reset(flake, canvas);
    }
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
    i++;
  }
  requestAnimationFrame(function() {
    return doSnow(ctx, canvas);
  });
};

weather = {
  snow: function(canvasId) {
    return startSnow(canvasId);
  }
};

module.exports = weather;
});

;require.register("models/chat_message", function(exports, require, module) {
var ChatMessage, Model, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/model');

module.exports = ChatMessage = (function(_super) {
  __extends(ChatMessage, _super);

  function ChatMessage() {
    _ref = ChatMessage.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ChatMessage.prototype.save = function() {
    return this.publishEvent('messages:saved', this.attributes);
  };

  return ChatMessage;

})(Model);
});

;require.register("models/collection", function(exports, require, module) {
var Collection, EventBroker, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventBroker = require('lib/event_broker');

module.exports = Collection = (function(_super) {
  __extends(Collection, _super);

  function Collection() {
    _ref = Collection.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Backbone.utils.extend(Collection.prototype, EventBroker);

  return Collection;

})(Backbone.Collection);
});

;require.register("models/hint", function(exports, require, module) {
var Hint, Model, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/model');

module.exports = Hint = (function(_super) {
  __extends(Hint, _super);

  function Hint() {
    _ref = Hint.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Hint;

})(Model);
});

;require.register("models/model", function(exports, require, module) {
var EventBroker, Model, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventBroker = require('lib/event_broker');

module.exports = Model = (function(_super) {
  __extends(Model, _super);

  function Model() {
    _ref = Model.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Backbone.utils.extend(Model.prototype, EventBroker);

  Model.prototype.disposed = false;

  Model.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    this.trigger('dispose', this);
    this.unsubscribeAllEvents();
    this.stopListening();
    this.off();
    properties = ['collection', 'attributes', 'changed', 'defaults', '_escapedAttributes', '_previousAttributes', '_silent', '_pending', '_callbacks'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return this.disposed = true;
  };

  return Model;

})(Backbone.Model);
});

;require.register("models/notifier", function(exports, require, module) {
var Escort, Modal, Model, Notifier, mediator, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('lib/mediator');

Model = require('models/model');

Escort = require('lib/escort');

Modal = require('views/modal_view');

module.exports = Notifier = (function(_super) {
  __extends(Notifier, _super);

  function Notifier() {
    _ref = Notifier.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Notifier.prototype.connect = function(player, onConnect) {
    var _this = this;
    this.player = player;
    this.PN = PUBNUB.init({
      publish_key: 'pub-c-7f96182e-eed7-46dd-9b72-80d838427d8e',
      subscribe_key: 'sub-c-b9f703c2-7109-11e4-aacc-02ee2ddab7fe',
      uuid: player.get('id'),
      heartbeat: 10,
      restore: false
    });
    return Escort.findEmptyRoom(this.PN, function(channel_name) {
      var pubnub;
      _this.subscribe(channel_name, onConnect);
      _this.subscribeEvent('playerMoved', _this.publishPlayerMovement);
      _this.subscribeEvent("players:left", _this.removePlayer);
      _this.subscribeEvent("messages:saved", _this.publishMessage);
      _this.subscribeEvent("messages:dismissed", _this.dismissMessage);
      _this.subscribeEvent("players:name_changed", _this.setAttrs);
      _this.subscribeEvent("players:avatar_changed", _this.setAttrs);
      _this.subscribeEvent("admin:kick", _this.publishKick);
      pubnub = _this.PN;
      return window.addEventListener("beforeunload", function(e) {
        return _this.PN.unsubscribe({
          channel: _this.channel
        });
      });
    });
  };

  Notifier.prototype.subscribe = function(channel, onConnect) {
    var attrs,
      _this = this;
    attrs = this.player.toJSON();
    delete attrs.active;
    return this.PN.subscribe({
      channel: channel,
      presence: function(m) {
        return _this.handlePresence(m);
      },
      message: function(m) {
        return _this.message(m);
      },
      state: attrs,
      connect: function() {
        _this.channel = channel;
        return _this.getRoomPlayers(onConnect);
      }
    });
  };

  Notifier.prototype.getRoomPlayers = function(onConnect) {
    var _this = this;
    return this.PN.here_now({
      channel: this.channel,
      state: true,
      callback: function(message) {
        return _this.handlePlayers(message, onConnect);
      }
    });
  };

  Notifier.prototype.message = function(m) {
    if (m.type) {
      switch (m.type) {
        case 'chat_message':
          if (mediator.current_player.id !== m.uuid) {
            return this.publishEvent("messages:received:" + m.uuid, m);
          }
          break;
        case 'chat_message_dismissed':
          return this.publishEvent("messages:dismissed:" + m.uuid);
        case 'kick':
          return this.removePlayer(m.uuid, true);
      }
    }
  };

  Notifier.prototype.handlePlayers = function(message, onConnect) {
    var player, _i, _len, _ref1;
    if (message.uuids) {
      _ref1 = message.uuids;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        player = _ref1[_i];
        if (parseInt(player.uuid) !== parseInt(this.player.get('id'))) {
          this.publishEvent('addPlayer', player.uuid, player.state);
        }
      }
    }
    if (onConnect) {
      return onConnect(this.channel);
    }
  };

  Notifier.prototype.handlePresence = function(m, a) {
    if (m.uuid !== mediator.current_player.id) {
      switch (m.action) {
        case 'join':
          return this.publishEvent('addPlayer', m.uuid, m.data);
        case 'state-change':
          return this.publishEvent("players:moved:" + m.uuid, m.data);
        case 'leave':
          return this.publishEvent("players:left", m.uuid);
        case 'timeout':
          return this.publishEvent("players:left", m.uuid);
      }
    }
  };

  Notifier.prototype.publishPlayerMovement = function(player) {
    var moving, name, orientation, x_position, y_position;
    x_position = player.get('x_position');
    y_position = player.get('y_position');
    orientation = player.get('orientation');
    name = player.get('name');
    moving = player.get('moving');
    return this.setAttrs(player);
  };

  Notifier.prototype.removePlayer = function(id, kicked) {
    if (mediator.current_player.id === id) {
      console.log('unsubscribe');
      this.PN.unsubscribe({
        channel: this.channel
      });
      if (kicked) {
        return this.notifyKick(id);
      }
    }
  };

  Notifier.prototype.publishMessage = function(attributes) {
    attributes.type = 'chat_message';
    return this.PN.publish({
      channel: this.channel,
      message: attributes
    });
  };

  Notifier.prototype.publishKick = function(uuid) {
    var attributes;
    attributes = {
      type: 'kick',
      uuid: uuid
    };
    return this.PN.publish({
      channel: this.channel,
      message: attributes
    });
  };

  Notifier.prototype.notifyKick = function(uuid) {
    if (mediator.current_player.id === uuid) {
      console.log('notify!');
      return new Modal({
        template: require('views/templates/kick'),
        className: 'modal',
        container: document.body,
        autoRender: true
      });
    }
  };

  Notifier.prototype.dismissMessage = function(uuid) {
    return this.PN.publish({
      channel: this.channel,
      message: {
        type: 'chat_message_dismissed',
        uuid: uuid
      }
    });
  };

  Notifier.prototype.setAttrs = function(player) {
    var attrs;
    attrs = player.toJSON();
    delete attrs.active;
    return this.PN.state({
      channel: this.channel,
      state: attrs
    });
  };

  return Notifier;

})(Model);
});

;require.register("models/player", function(exports, require, module) {
var Model, Player, mediator, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

mediator = require('lib/mediator');

Model = require('models/model');

module.exports = Player = (function(_super) {
  __extends(Player, _super);

  function Player() {
    _ref = Player.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Player.prototype.movement_inc = 0;

  Player.prototype.defaults = {
    x_position: 0,
    y_position: 0
  };

  Player.prototype.initialize = function() {
    Player.__super__.initialize.apply(this, arguments);
    this.listenTo(this, "change:x_position change:y_position change:orientation change:moving", this.streamPosition);
    this.listenTo(this, "change:name", this.publishNameChange);
    this.subscribeEvent("players:moved:" + this.id, this.setPosition);
    return this.subscribeEvent("players:left", this.handleLeave);
  };

  Player.prototype.position = function() {
    return "" + (this.get('x_position')) + "px, " + (this.get('y_position')) + "px";
  };

  Player.prototype.isCurrentPlayer = function() {
    return parseInt(mediator.current_player.id) === parseInt(this.id);
  };

  Player.prototype.setPosition = function(data) {
    if (!this.isCurrentPlayer()) {
      return this.set(data);
    }
  };

  Player.prototype.streamPosition = function() {
    var triggerMove;
    this.movement_inc++;
    triggerMove = this.movement_inc === 5 || this.hasChanged('orientation') || this.hasChanged('moving');
    if (triggerMove) {
      this.movement_inc = 0;
      if (this.isCurrentPlayer()) {
        this.publishEvent('playerMoved', this);
      }
      return this.set('z-plane', this.get('y_position'));
    }
  };

  Player.prototype.leaveRoom = function() {
    return this.publishEvent('players:left', this.id);
  };

  Player.prototype.handleLeave = function(id) {
    if (id === this.id) {
      return this.dispose();
    }
  };

  Player.prototype.publishNameChange = function() {
    if (this.isCurrentPlayer()) {
      this.publishEvent('players:name_changed', this);
    }
    return this.save();
  };

  Player.prototype.save = function() {
    var attrs;
    if (this.isCurrentPlayer()) {
      attrs = this.toJSON();
      delete attrs.id;
      delete attrs.active;
      localStorage.setItem("CremalabPartyAvatar", JSON.stringify(this.toJSON()));
      this.publishEvent("players:avatar_changed", this);
      return this;
    }
  };

  Player.prototype.dispose = function() {
    this.trigger('dispose');
    return Player.__super__.dispose.apply(this, arguments);
  };

  return Player;

})(Model);
});

;require.register("models/players", function(exports, require, module) {
var Collection, Players, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = require('./collection');

module.exports = Players = (function(_super) {
  __extends(Players, _super);

  function Players() {
    _ref = Players.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Players.prototype.initialize = function() {
    var _this = this;
    Players.__super__.initialize.apply(this, arguments);
    return this.subscribeEvent("players:left", function(m) {
      return _this.remove(m);
    });
  };

  return Players;

})(Collection);
});

;require.register("models/trailblazer", function(exports, require, module) {
var Model, Trailblazer, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = require('models/model');

module.exports = Trailblazer = (function(_super) {
  __extends(Trailblazer, _super);

  function Trailblazer() {
    _ref = Trailblazer.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Trailblazer.prototype.initialize = function(options) {
    var _this = this;
    Trailblazer.__super__.initialize.apply(this, arguments);
    this.canvas = options.canvas;
    this.avatar = options.avatar;
    this.player = this.avatar.model;
    this.plots = [];
    this.plot_count = 0;
    return this.listenTo(this.player, 'change:x_position change:y_position', function(x, y) {
      var plot;
      _this.plot_count++;
      plot = {
        x: _this.player.get('x_position'),
        y: _this.player.get('y_position')
      };
      _this.plots.push(plot);
      _this.cleanupPlots();
      return _this.canvas.addPointToTrail(_this.getStartEnd(_this.plots), _this.player, _this.avatar);
    });
  };

  Trailblazer.prototype.getStartEnd = function(plots) {
    var last, latest;
    if (plots.length > 1) {
      last = plots[plots.length - 2];
      latest = plots[plots.length - 1];
    } else {
      last = {
        x: this.player.get('x_position') + (this.avatar.width / 1.65),
        y: this.player.get('y_position') + this.avatar.height
      };
      if (plots.length) {
        latest = plots[plots.length];
        if (!latest) {
          latest = last;
        }
      }
    }
    latest.x = latest.x + (this.avatar.width / 1.65);
    latest.y = latest.y + this.avatar.height;
    return [last, latest];
  };

  Trailblazer.prototype.cleanupPlots = function() {
    if (this.plots.length > 10) {
      return this.plots.shift();
    }
  };

  return Trailblazer;

})(Model);
});

;require.register("views/avatar", function(exports, require, module) {
var Avatar, ChatterBox, View, down, left, mediator, right, up, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

ChatterBox = require('lib/chatterbox');

mediator = require('lib/mediator');

left = 37;

up = 38;

right = 39;

down = 40;

module.exports = Avatar = (function(_super) {
  __extends(Avatar, _super);

  function Avatar() {
    this.publishClick = __bind(this.publishClick, this);
    this.handleKeyUp = __bind(this.handleKeyUp, this);
    this.handleKeyDown = __bind(this.handleKeyDown, this);
    _ref = Avatar.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Avatar.prototype.directionsByName = {
    left: left,
    up: up,
    right: right,
    down: down
  };

  Avatar.prototype.directionsByCode = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
  };

  Avatar.prototype.template = require('./templates/avatar');

  Avatar.prototype.autoRender = false;

  Avatar.prototype.className = 'avatar';

  Avatar.prototype.movementInc = 8;

  Avatar.prototype.movementLoopInc = 30;

  Avatar.prototype.moving = false;

  Avatar.prototype.activeMovementKeys = [];

  Avatar.prototype.movementKeys = [left, up, right, down];

  Avatar.prototype.availableDirections = {
    left: true,
    right: true,
    up: true,
    down: true
  };

  Avatar.prototype.initialize = function(options) {
    var _this = this;
    if (options.template) {
      this.template = options.template;
    }
    this.soulless = options.soulless;
    Avatar.__super__.initialize.apply(this, arguments);
    this.listenTo(this.model, "change:avatar-gender change:avatar-hat change:avatar-hair change:avatar-skin change:avatar-coat change:avatar-pants", this.updateLook);
    this.listenTo(this.model, "dispose", this.dispose);
    this.listenTo(this.model, "change:z-plane", this.updateZIndex);
    this.subscribeEvent("players:left", this.handleLeave);
    if (!this.model.isCurrentPlayer()) {
      this.listenTo(this.model, "change:moving", function() {
        return _this.setMovementClasses();
      });
    }
    if (!this.soulless) {
      this.listenTo(this.model, "change:x_position change:y_position change:orientation", this.broadCastMove);
      this.listenTo(this, "availableDirectionsUpdated", this.updatePosition);
      this.chatterbox = new ChatterBox({
        player: this.model,
        avatar: this
      });
    }
    this.listenTo(this.model, "change:orientation", this.orient);
    return this.listenTo(this.model, "change:name", this.setName);
  };

  Avatar.prototype.render = function() {
    var _this = this;
    Avatar.__super__.render.apply(this, arguments);
    if (this.soulless) {
      this.orient(this.model, 0);
    } else {
      this.positionOnMap();
      this.bindEvents();
      this.el.setAttribute('data-pos', 7);
      setTimeout(function() {
        _this.rect = _this.el.getClientRects()[0];
        _this.boundingRect = _this.el.getBoundingClientRect();
        return _this.setDimensions();
      }, 0);
      if (this.model.get('active')) {
        this.el.classList.add('active');
      }
      if (this.model.isCurrentPlayer()) {
        this.el.addEventListener('touchstart', function(e) {
          e.preventDefault();
          e.stopPropagation();
          return _this.chatterbox.handleEnter();
        });
      }
      this.orient(this.model, this.model.get('orientation'));
    }
    this.updateLook();
    return this.updateZIndex();
  };

  Avatar.prototype.bindEvents = function() {
    this.el.addEventListener('click', this.publishClick);
    if (this.model.isCurrentPlayer()) {
      document.addEventListener('keydown', this.handleKeyDown);
      return document.addEventListener('keyup', this.handleKeyUp);
    }
  };

  Avatar.prototype.broadCastMove = function(player) {
    if (!player.isCurrentPlayer()) {
      this.positionOnMap();
      return this.trigger('playerMove', player, this);
    }
  };

  Avatar.prototype.handleKeyDown = function(e) {
    var _this = this;
    e.stopPropagation();
    if (mediator.game_state !== 'modal') {
      if (this.isMovementKey(e) && this.activeMovementKeys.indexOf(e.keyCode) < 0) {
        this.addActiveMovementKey(e.keyCode);
        if (!(this.moving || this.movementLoop)) {
          this.clearMovementClasses();
          this.movementLoop = setInterval(function() {
            return _this.move();
          }, this.movementLoopInc);
        }
      }
      if (e.keyCode === 16) {
        this.addActiveMovementKey(e.keyCode);
      }
      if (e.keyCode === 13) {
        this.chatterbox.handleEnter(e);
      }
      if (e.keyCode === 27) {
        return this.chatterbox.disposeBubble(true);
      }
    }
  };

  Avatar.prototype.move = function(keys) {
    var new_x, new_y;
    this.moving = true;
    this.model.set('moving', true);
    this.checkCollision();
    if (!this.isMovingDirection(up) && !this.isMovingDirection(down) && !this.isMovingDirection(left) && !this.isMovingDirection(right)) {
      this.moving = false;
      this.model.set('moving', false);
      this.stopMovementLoop();
    }
    new_x = this.model.get('x_position');
    new_y = this.model.get('y_position');
    if (this.isMovingDirection(up)) {
      new_y = this.model.get('y_position') + -this.movementInc;
    }
    if (this.isMovingDirection(down)) {
      new_y = this.model.get('y_position') + this.movementInc;
    }
    if (this.isMovingDirection(left)) {
      new_x = this.model.get('x_position') + -this.movementInc;
    }
    if (this.isMovingDirection(right)) {
      new_x = this.model.get('x_position') + this.movementInc;
    }
    this.trigger('playerMove', new_x, new_y, this);
    this.setMovementClasses();
    this.setOrientation();
    return this.positionOnMap();
  };

  Avatar.prototype.positionOnMap = function() {
    this.position_x = this.model.get('x_position');
    this.position_y = this.model.get('y_position');
    this.el.style.webkitTransform = "translate3d(" + (this.model.position()) + ", 0)";
    this.el.style.MozTransform = "translate3d(" + (this.model.position()) + ", 0)";
    return this.el.style.transform = "translate3d(" + (this.model.position()) + ", 0)";
  };

  Avatar.prototype.addActiveMovementKey = function(key) {
    if (this.activeMovementKeys.indexOf(key) < 0) {
      return this.activeMovementKeys.push(key);
    }
  };

  Avatar.prototype.travelToPoint = function(x, y) {
    var target;
    target = {
      x: x,
      y: y
    };
    return this.autopilot.travelToPoint(target, this);
  };

  Avatar.prototype.orient = function(player, orientation) {
    return this.el.setAttribute('data-pos', orientation);
  };

  Avatar.prototype.handleKeyUp = function(e) {
    this.stopMovement(e);
    if (e.keyCode === 16) {
      return this.stopMovementDirection(e.keyCode);
    }
  };

  Avatar.prototype.stopMovement = function(e) {
    if (e && e.keyCode) {
      if (this.activeMovementKeys.indexOf(e.keyCode) > -1) {
        this.stopMovementDirection(e.keyCode);
      }
      if (this.activeMovementKeys.length === 0) {
        this.stopMovementLoop();
        this.moving = false;
      }
      if (this.moving) {
        this.el.classList.remove(this.directionsByCode[e.keyCode]);
      }
    } else {
      this.stopMovementLoop();
      this.activeMovementKeys = [];
      this.moving = false;
    }
    this.setMovementClasses();
    return this.setOrientation();
  };

  Avatar.prototype.isMovementKey = function(e) {
    return this.movementKeys.indexOf(e.keyCode) > -1;
  };

  Avatar.prototype.isMovingDirection = function(keyCode) {
    if (keyCode.isArray) {
      return keyCode.every(function(e) {
        return this.activeMovementKeys.indexOf(e) > -1;
      });
    }
    return this.activeMovementKeys.indexOf(keyCode) > -1;
  };

  Avatar.prototype.isShiftKeyDown = function() {
    return this.activeMovementKeys.indexOf(16) > -1;
  };

  Avatar.prototype.setMovementClasses = function() {
    var classList, classToAdd;
    classList = this.el.classList;
    classToAdd = '';
    if (this.model.get('moving')) {
      classList.add('moving');
    } else {
      classList.remove('moving');
    }
    this.clearMovementClasses();
    if (this.isMovingDirection(up)) {
      classList.add('dir-up');
    }
    if (this.isMovingDirection(down)) {
      classList.add('dir-down');
    }
    if (this.isMovingDirection(left)) {
      classList.add('dir-left');
    }
    if (this.isMovingDirection(right)) {
      return classList.add('dir-right');
    }
  };

  Avatar.prototype.setOrientation = function() {
    var cl;
    cl = this.el.classList;
    if (cl.contains('dir-up') && cl.contains('dir-left')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 1);
      }
      return this.model.set('orientation', 5);
    }
    if (cl.contains('dir-up') && cl.contains('dir-right')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 7);
      }
      return this.model.set('orientation', 3);
    }
    if (cl.contains('dir-down') && cl.contains('dir-left')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 3);
      }
      return this.model.set('orientation', 7);
    }
    if (cl.contains('dir-down') && cl.contains('dir-right')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 5);
      }
      return this.model.set('orientation', 1);
    }
    if (cl.contains('dir-up')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 0);
      }
      return this.model.set('orientation', 4);
    }
    if (cl.contains('dir-down')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 4);
      }
      return this.model.set('orientation', 0);
    }
    if (cl.contains('dir-right')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 6);
      }
      return this.model.set('orientation', 2);
    }
    if (cl.contains('dir-left')) {
      if (this.isShiftKeyDown()) {
        return this.model.set('orientation', 2);
      }
      return this.model.set('orientation', 6);
    }
  };

  Avatar.prototype.clearMovementClasses = function() {
    var classList;
    classList = this.el.classList;
    classList.remove('dir-up');
    classList.remove('dir-down');
    classList.remove('dir-left');
    return classList.remove('dir-right');
  };

  Avatar.prototype.stopMovementLoop = function() {
    clearInterval(this.movementLoop);
    this.model.set('moving', false);
    return this.movementLoop = null;
  };

  Avatar.prototype.stopMovementDirection = function(keyCode) {
    if (this.activeMovementKeys.indexOf(keyCode) > -1) {
      return this.activeMovementKeys.splice(this.activeMovementKeys.indexOf(keyCode), 1);
    }
  };

  Avatar.prototype.setDimensions = function() {
    this.width = this.rect.right - this.rect.left;
    return this.height = this.rect.bottom - this.rect.top;
  };

  Avatar.prototype.checkCollision = function() {
    var blocked_down, blocked_left, blocked_right, blocked_up;
    blocked_up = this.isMovingDirection(up) && !this.availableDirections.up;
    blocked_down = this.isMovingDirection(down) && !this.availableDirections.down;
    blocked_left = this.isMovingDirection(left) && !this.availableDirections.left;
    blocked_right = this.isMovingDirection(right) && !this.availableDirections.right;
    if (blocked_up) {
      this.stopMovementDirection(up);
    }
    if (blocked_down) {
      this.stopMovementDirection(down);
    }
    if (blocked_left) {
      this.stopMovementDirection(left);
    }
    if (blocked_right) {
      return this.stopMovementDirection(right);
    }
  };

  Avatar.prototype.updatePosition = function(new_x, new_y) {
    if ((new_x > this.model.get('x_position') && this.availableDirections.right) || (new_x < this.model.get('x_position') && this.availableDirections.left)) {
      this.model.set('x_position', new_x);
    }
    if ((new_y > this.model.get('y_position') && this.availableDirections.down) || (new_y < this.model.get('y_position') && this.availableDirections.up)) {
      return this.model.set('y_position', new_y);
    }
  };

  Avatar.prototype.isCloseEnoughTo = function(x, y) {
    var px, py;
    px = Math.abs(x - this.model.get('x_position')) < 20;
    py = Math.abs(y - this.model.get('y_position')) < 20;
    return px && py;
  };

  Avatar.prototype.setName = function() {
    var name;
    name = this.model.get('name');
    return this.el.querySelector('.player-name').innerText = name;
  };

  Avatar.prototype.updateLook = function() {
    this.el.className = 'avatar';
    if (this.model.get('active')) {
      this.el.classList.add('active');
    }
    this.el.setAttribute('data-gender', this.model.get('avatar-gender'));
    this.el.classList.add(this.model.get('avatar-hat'));
    this.el.classList.add(this.model.get('avatar-hair'));
    this.el.classList.add(this.model.get('avatar-skin'));
    this.el.classList.add(this.model.get('avatar-coat'));
    this.el.classList.add(this.model.get('avatar-pants'));
    if (this.model.isCurrentPlayer()) {
      return this.model.save();
    }
  };

  Avatar.prototype.updateZIndex = function() {
    return this.el.style.zIndex = this.model.get('y_position');
  };

  Avatar.prototype.handleLeave = function(id) {
    if (this.model) {
      if (parseInt(id) === parseInt(this.model.id)) {
        return this.dispose();
      }
    }
  };

  Avatar.prototype.publishClick = function(e) {
    console.log('click avatar');
    return this.publishEvent("clickAvatar", this, this.model, e);
  };

  Avatar.prototype.dispose = function() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    return Avatar.__super__.dispose.apply(this, arguments);
  };

  return Avatar;

})(View);
});

;require.register("views/chat_input_view", function(exports, require, module) {
var ChatInputView, View, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/view');

template = require('./templates/chat_input');

module.exports = ChatInputView = (function(_super) {
  __extends(ChatInputView, _super);

  function ChatInputView() {
    _ref = ChatInputView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ChatInputView.prototype.template = template;

  ChatInputView.prototype.className = 'chat-dialog speech-bubble';

  ChatInputView.prototype.render = function() {
    var _this = this;
    ChatInputView.__super__.render.apply(this, arguments);
    setTimeout(function() {
      return _this.el.querySelector('input').focus();
    }, 0);
    return this.el.querySelector('input').addEventListener('blur', function() {
      return window.scrollTo(0, 0);
    });
  };

  return ChatInputView;

})(View);
});

;require.register("views/collection_view", function(exports, require, module) {
'use strict';
var $, CollectionView, View, addClass, filterChildren, insertView, toggleElement,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

$ = Backbone.$;

filterChildren = function(nodeList, selector) {
  var node, _i, _len, _results;
  if (!selector) {
    return nodeList;
  }
  _results = [];
  for (_i = 0, _len = nodeList.length; _i < _len; _i++) {
    node = nodeList[_i];
    if (Backbone.utils.matchesSelector(node, selector)) {
      _results.push(node);
    }
  }
  return _results;
};

toggleElement = (function() {
  if ($) {
    return function(elem, visible) {
      return elem.toggle(visible);
    };
  } else {
    return function(elem, visible) {
      return elem.style.display = (visible ? '' : 'none');
    };
  }
})();

addClass = (function() {
  if ($) {
    return function(elem, cls) {
      return elem.addClass(cls);
    };
  } else {
    return function(elem, cls) {
      return elem.classList.add(cls);
    };
  }
})();

insertView = (function() {
  if ($) {
    return function(list, viewEl, position, length, itemSelector) {
      var children, childrenLength, insertInMiddle, isEnd, method;
      insertInMiddle = (0 < position && position < length);
      isEnd = function(length) {
        return length === 0 || position === length;
      };
      if (insertInMiddle || itemSelector) {
        children = list.children(itemSelector);
        childrenLength = children.length;
        if (children[position] !== viewEl) {
          if (isEnd(childrenLength)) {
            return list.append(viewEl);
          } else {
            if (position === 0) {
              return children.eq(position).before(viewEl);
            } else {
              return children.eq(position - 1).after(viewEl);
            }
          }
        }
      } else {
        method = isEnd(length) ? 'append' : 'prepend';
        return list[method](viewEl);
      }
    };
  } else {
    return function(list, viewEl, position, length, itemSelector) {
      var children, childrenLength, insertInMiddle, isEnd, last;
      insertInMiddle = (0 < position && position < length);
      isEnd = function(length) {
        return length === 0 || position === length;
      };
      if (insertInMiddle || itemSelector) {
        children = filterChildren(list.children, itemSelector);
        childrenLength = children.length;
        if (children[position] !== viewEl) {
          if (isEnd(childrenLength)) {
            return list.appendChild(viewEl);
          } else if (position === 0) {
            return list.insertBefore(viewEl, children[position]);
          } else {
            last = children[position - 1];
            if (list.lastChild === last) {
              return list.appendChild(viewEl);
            } else {
              return list.insertBefore(viewEl, last.nextElementSibling);
            }
          }
        }
      } else if (isEnd(length)) {
        return list.appendChild(viewEl);
      } else {
        return list.insertBefore(viewEl, list.firstChild);
      }
    };
  }
})();

module.exports = CollectionView = (function(_super) {
  __extends(CollectionView, _super);

  CollectionView.prototype.itemView = null;

  CollectionView.prototype.autoRender = true;

  CollectionView.prototype.renderItems = true;

  CollectionView.prototype.listSelector = null;

  CollectionView.prototype.$list = null;

  CollectionView.prototype.fallbackSelector = null;

  CollectionView.prototype.$fallback = null;

  CollectionView.prototype.loadingSelector = null;

  CollectionView.prototype.$loading = null;

  CollectionView.prototype.itemSelector = null;

  CollectionView.prototype.filterer = null;

  CollectionView.prototype.filterCallback = function(view, included) {
    if ($) {
      view.$el.stop(true, true);
    }
    return toggleElement(($ ? view.$el : view.el), included);
  };

  CollectionView.prototype.visibleItems = null;

  CollectionView.prototype.optionNames = View.prototype.optionNames.concat(['renderItems', 'itemView']);

  function CollectionView(options) {
    this.renderAllItems = __bind(this.renderAllItems, this);
    this.toggleFallback = __bind(this.toggleFallback, this);
    this.itemsReset = __bind(this.itemsReset, this);
    this.itemRemoved = __bind(this.itemRemoved, this);
    this.itemAdded = __bind(this.itemAdded, this);
    this.visibleItems = [];
    CollectionView.__super__.constructor.apply(this, arguments);
  }

  CollectionView.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    this.addCollectionListeners();
    if (options.filterer != null) {
      return this.filter(options.filterer);
    }
  };

  CollectionView.prototype.addCollectionListeners = function() {
    this.listenTo(this.collection, 'add', this.itemAdded);
    this.listenTo(this.collection, 'remove', this.itemRemoved);
    return this.listenTo(this.collection, 'reset sort', this.itemsReset);
  };

  CollectionView.prototype.getTemplateData = function() {
    var templateData;
    templateData = {
      length: this.collection.length
    };
    if (typeof this.collection.isSynced === 'function') {
      templateData.synced = this.collection.isSynced();
    }
    return templateData;
  };

  CollectionView.prototype.getTemplateFunction = function() {};

  CollectionView.prototype.render = function() {
    CollectionView.__super__.render.apply(this, arguments);
    this.list = this.el;
    this.initFallback();
    this.initLoadingIndicator();
    if (this.renderItems) {
      return this.renderAllItems();
    }
  };

  CollectionView.prototype.itemAdded = function(item, collection, options) {
    return this.insertView(item, this.renderItem(item), options.at);
  };

  CollectionView.prototype.itemRemoved = function(item) {
    return this.removeViewForItem(item);
  };

  CollectionView.prototype.itemsReset = function() {
    return this.renderAllItems();
  };

  CollectionView.prototype.initFallback = function() {
    if (!this.fallbackSelector) {
      return;
    }
    if ($) {
      this.$fallback = this.$(this.fallbackSelector);
    } else {
      this.fallback = this.find(this.fallbackSelector);
    }
    this.on('visibilityChange', this.toggleFallback);
    this.listenTo(this.collection, 'syncStateChange', this.toggleFallback);
    return this.toggleFallback();
  };

  CollectionView.prototype.toggleFallback = function() {
    var visible;
    visible = this.visibleItems.length === 0 && (typeof this.collection.isSynced === 'function' ? this.collection.isSynced() : true);
    return toggleElement(($ ? this.$fallback : this.fallback), visible);
  };

  CollectionView.prototype.initLoadingIndicator = function() {
    if (!(this.loadingSelector && typeof this.collection.isSyncing === 'function')) {
      return;
    }
    if ($) {
      this.$loading = this.$(this.loadingSelector);
    } else {
      this.loading = this.find(this.loadingSelector);
    }
    this.listenTo(this.collection, 'syncStateChange', this.toggleLoadingIndicator);
    return this.toggleLoadingIndicator();
  };

  CollectionView.prototype.toggleLoadingIndicator = function() {
    var visible;
    visible = this.collection.length === 0 && this.collection.isSyncing();
    return toggleElement(($ ? this.$loading : this.loading), visible);
  };

  CollectionView.prototype.getItemViews = function() {
    var itemViews, name, view, _ref;
    itemViews = {};
    if (this.subviews.length > 0) {
      _ref = this.subviewsByName;
      for (name in _ref) {
        view = _ref[name];
        if (name.slice(0, 9) === 'itemView:') {
          itemViews[name.slice(9)] = view;
        }
      }
    }
    return itemViews;
  };

  CollectionView.prototype.filter = function(filterer, filterCallback) {
    var hasItemViews, included, index, item, view, _i, _len, _ref,
      _this = this;
    if (typeof filterer === 'function' || filterer === null) {
      this.filterer = filterer;
    }
    if (typeof filterCallback === 'function' || filterCallback === null) {
      this.filterCallback = filterCallback;
    }
    hasItemViews = (function() {
      var name;
      if (_this.subviews.length > 0) {
        for (name in _this.subviewsByName) {
          if (name.slice(0, 9) === 'itemView:') {
            return true;
          }
        }
      }
      return false;
    })();
    if (hasItemViews) {
      _ref = this.collection.models;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        included = typeof this.filterer === 'function' ? this.filterer(item, index) : true;
        view = this.subview("itemView:" + item.cid);
        if (!view) {
          throw new Error('CollectionView#filter: ' + ("no view found for " + item.cid));
        }
        this.filterCallback(view, included);
        this.updateVisibleItems(view.model, included, false);
      }
    }
    return this.trigger('visibilityChange', this.visibleItems);
  };

  CollectionView.prototype.renderAllItems = function() {
    var cid, index, item, items, remainingViewsByCid, view, _i, _j, _len, _len1, _ref;
    items = this.collection.models;
    this.visibleItems = [];
    remainingViewsByCid = {};
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      view = this.subview("itemView:" + item.cid);
      if (view) {
        remainingViewsByCid[item.cid] = view;
      }
    }
    _ref = this.getItemViews();
    for (cid in _ref) {
      if (!__hasProp.call(_ref, cid)) continue;
      view = _ref[cid];
      if (!(cid in remainingViewsByCid)) {
        this.removeSubview("itemView:" + cid);
      }
    }
    for (index = _j = 0, _len1 = items.length; _j < _len1; index = ++_j) {
      item = items[index];
      view = this.subview("itemView:" + item.cid);
      if (view) {
        this.insertView(item, view, index, false);
      } else {
        this.insertView(item, this.renderItem(item), index);
      }
    }
    if (items.length === 0) {
      return this.trigger('visibilityChange', this.visibleItems);
    }
  };

  CollectionView.prototype.renderItem = function(item) {
    var view;
    view = this.subview("itemView:" + item.cid);
    if (!view) {
      view = this.initItemView(item);
      this.subview("itemView:" + item.cid, view);
    }
    view.render();
    return view;
  };

  CollectionView.prototype.initItemView = function(model) {
    if (this.itemView) {
      return new this.itemView({
        autoRender: false,
        model: model
      });
    } else {
      throw new Error('The CollectionView#itemView property ' + 'must be defined or the initItemView() must be overridden.');
    }
  };

  CollectionView.prototype.insertView = function(item, view, position) {
    var elem, included, length, list;
    if (typeof position !== 'number') {
      position = this.collection.indexOf(item);
    }
    included = typeof this.filterer === 'function' ? this.filterer(item, position) : true;
    elem = $ ? view.$el : view.el;
    if (this.filterer) {
      this.filterCallback(view, included);
    }
    length = this.collection.length;
    list = $ ? this.$list : this.list;
    insertView(list, elem, position, length, this.itemSelector);
    view.trigger('addedToParent');
    this.updateVisibleItems(item, included);
    return view;
  };

  CollectionView.prototype.removeViewForItem = function(item) {
    this.updateVisibleItems(item, false);
    return this.removeSubview("itemView:" + item.cid);
  };

  CollectionView.prototype.updateVisibleItems = function(item, includedInFilter, triggerEvent) {
    var includedInVisibleItems, visibilityChanged, visibleItemsIndex;
    if (triggerEvent == null) {
      triggerEvent = true;
    }
    visibilityChanged = false;
    visibleItemsIndex = this.visibleItems.indexOf(item);
    includedInVisibleItems = visibleItemsIndex !== -1;
    if (includedInFilter && !includedInVisibleItems) {
      this.visibleItems.push(item);
      visibilityChanged = true;
    } else if (!includedInFilter && includedInVisibleItems) {
      this.visibleItems.splice(visibleItemsIndex, 1);
      visibilityChanged = true;
    }
    if (visibilityChanged && triggerEvent) {
      this.trigger('visibilityChange', this.visibleItems);
    }
    return visibilityChanged;
  };

  CollectionView.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    properties = ['$list', '$fallback', '$loading', 'visibleItems'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return CollectionView.__super__.dispose.apply(this, arguments);
  };

  return CollectionView;

})(View);
});

;require.register("views/dj_view", function(exports, require, module) {
var DJ, View, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

module.exports = DJ = (function(_super) {
  __extends(DJ, _super);

  function DJ() {
    _ref = DJ.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  DJ.prototype.audio = {};

  DJ.prototype.currentTrack = 'soundtrack';

  DJ.prototype.isPlaying = false;

  DJ.prototype.tracks = {
    'soundtrack': 'https://s3.amazonaws.com/cremalab/bit-shifter-let-it-snow.mp3',
    'disco': 'https://s3.amazonaws.com/cremalab/disco.mp3'
  };

  DJ.prototype.trackVolumes = {
    'soundtrack': 0.1,
    'disco': 1.0
  };

  DJ.prototype.initialize = function() {
    var track, _i, _len, _ref1;
    _ref1 = Object.keys(this.tracks);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      track = _ref1[_i];
      this.audio[track] = new Audio(this.tracks[track]);
      this.audio[track].loop = true;
      this.audio[track].volume = this.trackVolumes[track];
    }
    return this.playTrack(this.currentTrack);
  };

  DJ.prototype.playTrack = function(track) {
    this.audio[this.currentTrack].pause();
    if (this.isPlaying !== false) {
      this.audio[track].play();
    }
    return this.currentTrack = track;
  };

  DJ.prototype.togglePlayback = function() {
    if (this.isPlaying) {
      this.audio[this.currentTrack].pause();
      return this.isPlaying = false;
    } else {
      this.audio[this.currentTrack].play();
      return this.isPlaying = true;
    }
  };

  return DJ;

})(View);
});

;require.register("views/drawing_canvas", function(exports, require, module) {
var DrawingCanvas, View, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

module.exports = DrawingCanvas = (function(_super) {
  __extends(DrawingCanvas, _super);

  function DrawingCanvas() {
    _ref = DrawingCanvas.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  DrawingCanvas.prototype.color = "#363f59";

  DrawingCanvas.prototype.lineWidth = 50;

  DrawingCanvas.prototype.gameLoopInt = 2000;

  DrawingCanvas.prototype.plotCleanCount = 5;

  DrawingCanvas.prototype.cleanup = false;

  DrawingCanvas.prototype.initialize = function() {
    var _this = this;
    DrawingCanvas.__super__.initialize.apply(this, arguments);
    this.plots = [];
    if (this.cleanup) {
      return setInterval(function() {
        return _this.cleanupPlots();
      }, this.gameLoopInt);
    }
  };

  DrawingCanvas.prototype.render = function() {
    DrawingCanvas.__super__.render.apply(this, arguments);
    this.ctx = this.el.getContext('2d');
    this.ctx.globalAlpha = 0.5;
    this.ctx.globalCompositeOperation = "xor";
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    return this.ctx.lineJoin = 'round';
  };

  DrawingCanvas.prototype.drawOnCanvas = function(plots) {
    var i, plot, _i, _len;
    if (plots.length) {
      this.ctx.beginPath();
      this.ctx.moveTo(plots[0].x, plots[0].y);
      for (i = _i = 0, _len = plots.length; _i < _len; i = ++_i) {
        plot = plots[i];
        this.ctx.lineTo(plot.x, plot.y);
      }
      return this.ctx.stroke();
    }
  };

  DrawingCanvas.prototype.addPointToTrail = function(plots, player, avatar) {
    var end, start;
    start = plots[0];
    end = plots[plots.length - 1];
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.ctx.closePath();
    this.plots.push(start);
    return this.plots.push(end);
  };

  DrawingCanvas.prototype.cleanupPlots = function() {
    this.plots.splice(0, this.plotCleanCount);
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    return this.drawOnCanvas(this.plots);
  };

  return DrawingCanvas;

})(View);
});

;require.register("views/edit_avatar_view", function(exports, require, module) {
var EditAvatarView, JoinGameView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

JoinGameView = require('views/join_game_view');

module.exports = EditAvatarView = (function(_super) {
  __extends(EditAvatarView, _super);

  function EditAvatarView() {
    _ref = EditAvatarView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EditAvatarView.prototype.noClose = false;

  EditAvatarView.prototype.render = function() {
    EditAvatarView.__super__.render.apply(this, arguments);
    this.bindForm();
    return this.el.querySelector('button').innerText = "Save Avatar";
  };

  EditAvatarView.prototype.bindForm = function() {
    var attribute, input, val, _i, _len, _ref1, _results;
    _ref1 = Object.keys(this.model.attributes);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      attribute = _ref1[_i];
      val = this.model.get(attribute);
      input = this.el.querySelector("input[name='" + attribute + "']");
      if (input) {
        if (input.type === 'radio') {
          input = this.el.querySelector("input[name='" + attribute + "'][value='" + val + "']");
          if (input) {
            _results.push(input.checked = true);
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(input.value = val);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return EditAvatarView;

})(JoinGameView);
});

;require.register("views/hint_view", function(exports, require, module) {
var HintView, View, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

template = require('./templates/hint');

module.exports = HintView = (function(_super) {
  __extends(HintView, _super);

  function HintView() {
    _ref = HintView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HintView.prototype.className = 'hint';

  HintView.prototype.template = template;

  HintView.prototype.y_offset = 10;

  HintView.prototype.x_offset = 10;

  HintView.prototype.initialize = function() {
    HintView.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'dispose', this.dispose);
  };

  HintView.prototype.render = function() {
    var _this = this;
    HintView.__super__.render.apply(this, arguments);
    return setTimeout(function() {
      var ob_width, obstruction, rect;
      _this.el.style.position = 'absolute';
      rect = _this.el.getBoundingClientRect();
      obstruction = _this.model.get('obstruction');
      _this.el.style.zIndex = obstruction.bottom;
      ob_width = obstruction.right - obstruction.left;
      if (_this.model.get('position') && _this.model.get('position') === 'right') {
        _this.el.style.left = (obstruction.x + ob_width + _this.x_offset) + "px";
        return _this.el.style.top = (_this.model.get('obstruction').y - _this.y_offset) + "px";
      } else {
        _this.el.style.left = (obstruction.x - (rect.width / 4)) + "px";
        return _this.el.style.top = (_this.model.get('obstruction').y - (rect.height + _this.y_offset)) + "px";
      }
    }, 0);
  };

  return HintView;

})(View);
});

;require.register("views/intro_view", function(exports, require, module) {
var IntroView, Modal, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Modal = require('views/modal_view');

template = require('./templates/intro');

module.exports = IntroView = (function(_super) {
  __extends(IntroView, _super);

  function IntroView() {
    _ref = IntroView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  IntroView.prototype.template = template;

  IntroView.prototype.autoRender = true;

  IntroView.prototype.className = 'modal sub-intro';

  IntroView.prototype.triggerVolume = true;

  IntroView.prototype.initialize = function(options) {
    if (options.triggerVolume === false) {
      this.triggerVolume = false;
    }
    return IntroView.__super__.initialize.apply(this, arguments);
  };

  IntroView.prototype.render = function() {
    var thing,
      _this = this;
    IntroView.__super__.render.apply(this, arguments);
    thing = this.el.querySelector('button');
    return thing.addEventListener('click', function() {
      return _this.dispose();
    });
  };

  IntroView.prototype.dispose = function() {
    this.trigger('dispose');
    if (this.triggerVolume) {
      this.publishEvent('togglePlayback');
    }
    return IntroView.__super__.dispose.apply(this, arguments);
  };

  return IntroView;

})(Modal);
});

;require.register("views/join_game_view", function(exports, require, module) {
var Avatar, JoinGameView, Modal, mediator, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Modal = require('./modal_view');

Avatar = require('views/avatar');

mediator = require('lib/mediator');

template = require('./templates/join_game');

module.exports = JoinGameView = (function(_super) {
  __extends(JoinGameView, _super);

  function JoinGameView() {
    _ref = JoinGameView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JoinGameView.prototype.template = template;

  JoinGameView.prototype.autoRender = true;

  JoinGameView.prototype.tagName = 'form';

  JoinGameView.prototype.noClose = true;

  JoinGameView.prototype.render = function() {
    var radio, radios, _i, _len,
      _this = this;
    JoinGameView.__super__.render.apply(this, arguments);
    radios = this.el.querySelectorAll("input[type='radio']");
    mediator.game_state = 'modal';
    this.avatarView = new Avatar({
      model: this.model,
      soulless: true,
      container: this.el.querySelector('.avatar-holder'),
      autoRender: true
    });
    for (_i = 0, _len = radios.length; _i < _len; _i++) {
      radio = radios[_i];
      radio.addEventListener('change', function(e) {
        var name, val;
        name = e.target.name;
        val = _this.el.querySelector("input[name='" + name + "']:checked").value;
        return _this.model.set(name, val);
      });
    }
    return this.el.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return _this.trigger('setPlayerName', document.getElementById('player_name').value);
    });
  };

  JoinGameView.prototype.dispose = function() {
    mediator.game_state = 'playing';
    this.avatarView.dispose();
    return JoinGameView.__super__.dispose.apply(this, arguments);
  };

  return JoinGameView;

})(Modal);
});

;require.register("views/map_view", function(exports, require, module) {
var Landscaper, MapView, View, template, transition_events, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Landscaper = require('lib/landscaper');

View = require('./view');

template = require('./templates/map');

transition_events = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

module.exports = MapView = (function(_super) {
  __extends(MapView, _super);

  function MapView() {
    _ref = MapView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MapView.prototype.template = template;

  MapView.prototype.className = "map";

  MapView.prototype.viewport_padding = 300;

  MapView.prototype.offset_x = 0;

  MapView.prototype.offset_y = 0;

  MapView.prototype.width = 2002;

  MapView.prototype.height = 1500;

  MapView.prototype.padding_top = 80;

  MapView.prototype.padding_bottom = 15;

  MapView.prototype.initialize = function() {
    MapView.__super__.initialize.apply(this, arguments);
    if (!!("ontouchstart" in window) || !!("onmsgesturechange" in window)) {
      this.mobile = true;
    }
    this.landscaper = new Landscaper({
      map: this
    });
    return this.subscribeEvent('map:pan_to_player', this.panToPlayerPosition);
  };

  MapView.prototype.render = function() {
    var doubleTouchStartTimestamp,
      _this = this;
    MapView.__super__.render.apply(this, arguments);
    this.setDimensions();
    this.landscaper.init();
    window.addEventListener('resize', function() {
      return _this.setDimensions();
    });
    doubleTouchStartTimestamp = 0;
    document.addEventListener("touchstart", function(event) {
      var now;
      now = +(new Date());
      if (doubleTouchStartTimestamp + 500 > now) {
        event.preventDefault();
      }
      doubleTouchStartTimestamp = now;
    });
    if (this.mobile) {
      return document.body.removeChild(document.getElementById("keysHints"));
    }
  };

  MapView.prototype.setDimensions = function() {
    this.rect = document.body.getClientRects()[0];
    if (this.mobile) {
      this.viewport_padding = {
        x: this.rect.width * 0.5,
        y: this.rect.height * 0.45
      };
    } else {
      this.viewport_padding = {
        x: this.rect.width * 0.3,
        y: this.rect.height * 0.3
      };
    }
    this.sidebarWidth = document.body.querySelector('.sidebar').getClientRects()[0].width;
    return this.viewport = {
      left: this.rect.left + this.viewport_padding.x - this.sidebarWidth,
      top: this.rect.top + this.viewport_padding.y,
      right: this.rect.right - this.viewport_padding.x,
      bottom: this.rect.bottom - this.viewport_padding.y
    };
  };

  MapView.prototype.spawnPlayer = function(player, avatar) {
    var _this = this;
    avatar.container = this.el;
    avatar.render();
    return setTimeout(function() {
      return _this.checkPlayerPosition(player, avatar);
    }, 0);
  };

  MapView.prototype.checkPlayerPosition = function(px, py, avatar) {
    var within_rect, within_x, within_y;
    this.canMoveTo(px, py, avatar);
    within_x = px > this.viewport.left && px < this.viewport.right;
    within_y = py > this.viewport.top && py < this.viewport.bottom;
    within_rect = within_x && within_y;
    if (avatar) {
      if (avatar.model.isCurrentPlayer()) {
        return this.panToPlayerPosition(avatar.model, avatar);
      }
    }
  };

  MapView.prototype.panToPlayerPosition = function(player, avatar, animate) {
    var a_height, a_width, left_max_pan, new_x, new_y, pan_down, pan_left, pan_right, pan_up, px, py;
    this.focusedPlayer = player;
    px = player.get('x_position');
    py = player.get('y_position');
    a_height = avatar.height || 0;
    a_width = avatar.width || 0;
    pan_right = px > ((this.viewport.right - this.offset_x) - a_width);
    pan_left = px < (this.viewport.left - this.offset_x);
    pan_down = py > ((this.viewport.bottom - this.offset_y) - a_height);
    pan_up = py < (this.viewport.top - this.offset_y);
    new_x = this.offset_x;
    new_y = this.offset_y;
    if (pan_left) {
      new_x = this.rect.left + (this.viewport.left - px);
    }
    if (pan_right) {
      new_x = this.rect.left + ((this.viewport.right - avatar.width) - px);
    }
    if (pan_up) {
      new_y = this.rect.top + (this.viewport.top - py);
    }
    if (pan_down) {
      new_y = this.rect.top + ((this.viewport.bottom - a_height) - py);
    }
    left_max_pan = this.offset_x - (this.viewport_padding.x - a_width);
    if (!((new_x + this.offset_x) >= 0 || Math.abs(px + this.viewport_padding.x) >= this.width)) {
      this.offset_x = new_x;
    }
    if (!((new_y + this.offset_y) >= 0 || Math.abs(py + this.viewport_padding.y) >= this.height)) {
      this.offset_y = new_y;
    }
    return this.repositionMap(parseInt(this.offset_x), parseInt(this.offset_y), animate);
  };

  MapView.prototype.centerMapOn = function(x, y, offset_x, offset_y) {
    var viewportCenterX, viewportCenterY;
    viewportCenterX = this.viewport.right / 2;
    viewportCenterY = this.viewport.bottom / 2;
    this.offset_x = this.offset_x - (x - viewportCenterX - 150);
    this.offset_y = this.offset_y - (y - viewportCenterY);
    if (Math.abs(this.offset_y - (y - viewportCenterY)) >= this.height) {
      this.offset_y = -(y - this.viewport.bottom - (this.viewport_padding.y / 1.6));
    }
    if (Math.abs(this.offset_x - (x - viewportCenterX)) >= this.width) {
      this.offset_x = -(x - this.viewport.right - (this.viewport_padding.x / 1.6));
    }
    return this.repositionMap(parseInt(this.offset_x), parseInt(this.offset_y));
  };

  MapView.prototype.repositionMap = function(left, top, animate) {
    if (animate) {
      this.el.addEventListener("transitionend", this.removeTransition, this);
      this.el.style.transition = 'all .5s';
    }
    this.el.style.webkitTransform = "translate3d(" + left + "px, " + top + "px, 0)";
    return this.el.style.MozTransform = "translate3d(" + left + "px, " + top + "px, 0)";
  };

  MapView.prototype.removeTransition = function() {
    this.style.transition = null;
    return this.removeEventListener('transitionend', this.addAnimation);
  };

  MapView.prototype.canMoveTo = function(x, y, avatar) {
    if (avatar) {
      return this.landscaper.checkObstructions(x, y, avatar, this);
    }
  };

  MapView.prototype.addTouchEvents = function(avatar, event_name) {
    var _this = this;
    return this.el.addEventListener(event_name, function(e) {
      var x, y;
      avatar.stopMovement();
      x = e.touches[0].clientX - _this.sidebarWidth - (avatar.width / 2);
      y = e.touches[0].clientY - (avatar.height / 2);
      _this.publishEvent('map:interact', e, x, y);
      return avatar.travelToPoint(x, y);
    });
  };

  return MapView;

})(View);
});

;require.register("views/modal_view", function(exports, require, module) {
var ModalView, View, mediator, template, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/view');

mediator = require('lib/mediator');

template = require('./templates/modal');

module.exports = ModalView = (function(_super) {
  __extends(ModalView, _super);

  function ModalView() {
    this.checkEsc = __bind(this.checkEsc, this);
    _ref = ModalView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ModalView.prototype.template = template;

  ModalView.prototype.className = 'modal';

  ModalView.prototype.initialize = function(options) {
    if (options && options.template) {
      this.template = options.template;
    }
    return ModalView.__super__.initialize.apply(this, arguments);
  };

  ModalView.prototype.render = function() {
    var _this = this;
    ModalView.__super__.render.apply(this, arguments);
    mediator.game_state = 'modal';
    if (!this.noClose) {
      this.closeButton = document.createElement('a');
      this.el.querySelector('.modal-content-box').appendChild(this.closeButton);
      this.closeButton.setAttribute('href', '#');
      this.closeButton.className = 'close icon-close';
      this.closeButton.addEventListener('click', function() {
        return _this.dispose();
      });
      return window.addEventListener('keyup', this.checkEsc);
    }
  };

  ModalView.prototype.checkEsc = function(e) {
    if (e.keyCode === 27) {
      e.stopPropagation();
      return this.dispose();
    }
  };

  ModalView.prototype.dispose = function() {
    mediator.game_state = 'playing';
    window.removeEventListener('keyup', this.checkEsc);
    return ModalView.__super__.dispose.apply(this, arguments);
  };

  return ModalView;

})(View);
});

;require.register("views/player_list", function(exports, require, module) {
var Avatar, CollectionView, PlayerList, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CollectionView = require('./collection_view');

Avatar = require('./avatar');

module.exports = PlayerList = (function(_super) {
  __extends(PlayerList, _super);

  function PlayerList() {
    _ref = PlayerList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PlayerList.prototype.className = 'playerList';

  PlayerList.prototype.initItemView = function(model) {
    var avatar, template,
      _this = this;
    if (model.isCurrentPlayer()) {
      template = require('./templates/avatar');
    } else {
      template = require('./templates/avatar_head');
    }
    avatar = new Avatar({
      model: model,
      soulless: true,
      template: template
    });
    avatar.el.addEventListener('click', function() {
      return _this.publishEvent("map:pan_to_player", model, avatar, true);
    });
    return avatar;
  };

  return PlayerList;

})(CollectionView);
});

;require.register("views/speech_bubble_view", function(exports, require, module) {
var SpeechBubbleView, View, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('views/view');

template = require('./templates/speech_bubble');

module.exports = SpeechBubbleView = (function(_super) {
  __extends(SpeechBubbleView, _super);

  function SpeechBubbleView() {
    _ref = SpeechBubbleView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SpeechBubbleView.prototype.className = "speech-bubble";

  SpeechBubbleView.prototype.template = template;

  SpeechBubbleView.prototype.initialize = function(options) {
    SpeechBubbleView.__super__.initialize.apply(this, arguments);
    this.chatterBox = options.chatterBox;
    return this.avatar = options.avatar;
  };

  SpeechBubbleView.prototype.render = function() {
    var _this = this;
    SpeechBubbleView.__super__.render.apply(this, arguments);
    if (this.avatar.model.isCurrentPlayer()) {
      this.el.querySelector('.close').addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        return _this.chatterBox.disposeBubble(true);
      });
      return this.el.querySelector('.close').addEventListener('touchstart', function(e) {
        e.stopPropagation();
        e.preventDefault();
        return _this.chatterBox.disposeBubble(true);
      });
    } else {
      return this.el.removeChild(this.el.querySelector('.close'));
    }
  };

  return SpeechBubbleView;

})(View);
});

;require.register("views/templates/avatar", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),name = locals_.name;
buf.push("<div class=\"player-name\">" + (jade.escape(null == (jade.interp = name) ? "" : jade.interp)) + "</div><div class=\"avatar-wrap\"><div class=\"body\"><div class=\"hat\"></div><div class=\"head\"></div><div class=\"hair\"></div><div class=\"left eye\"></div><div class=\"right eye\"></div><div class=\"mouth\"></div><div class=\"torso\"></div><div class=\"left leg\"></div><div class=\"right leg\"></div><div class=\"right arm\"></div><div class=\"left arm\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/avatar_head", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),name = locals_.name;
buf.push("<div class=\"player-name\">" + (jade.escape(null == (jade.interp = name) ? "" : jade.interp)) + "</div><div class=\"avatar-wrap\"><div class=\"body\"><div class=\"hat\"></div><div class=\"head\"></div><div class=\"hair\"></div><div class=\"left eye\"></div><div class=\"right eye\"></div><div class=\"mouth\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/bathroom_photo", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"><img src=\"party/images/bathroom_photo.jpg\"/></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/chat_input", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<input type=\"text\" placeholder=\"say something...\" name=\"chat_text\" autofocus=\"autofocus\" onFocus=\"window.scrollTo(0, 0);\" autocomplete=\"off\"/>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/hint", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),text = locals_.text;
buf.push(jade.escape(null == (jade.interp = text) ? "" : jade.interp));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/intro", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"><div class=\"intro\"><div class=\"intro-logo\"><img src=\"party/images/crema-christmas-logo.svg\" alt=\"Cremalab Christmas Icon\"/></div><div class=\"intro-script\"><img src=\"party/images/crema-christmas-script.svg\" alt=\"Crema-Christmas\"/></div><p>Welcome to the Crema-christmas Holiday Party (Virtual Edition)!\nThis party uses the latest in internet tech, so leave your old\nbrowsers at the door - and the faster your computer the better\n(this is the 21st century after all)!</p><p><button class=\"sub-bigGreen sub-width-full\">Let's Party!</button></p><p>Built using these fine services and tools:</p><div class=\"services grid align-middle spaced\"><div class=\"grid-items\"><div class=\"service sub-pubnub col\"><a href=\"http://www.pubnub.com\" target=\"_blank\"><img src=\"party/images/logo-pubnub.svg\" alt=\"PubNub\"/></a></div><div class=\"service sub-brunch col\"><a href=\"http://brunch.io\" target=\"_blank\"><img src=\"party/images/logo-brunch.svg\" alt=\"Brunch\"/></a></div><div class=\"service sub-github col\"><a href=\"https://github.com\" target=\"_blank\"><img src=\"party/images/logo-github.svg\" alt=\"Github\"/></a></div></div></div><p class=\"tiny\">* best on Modern Browsers &amp; fast computers</p></div></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/join_game", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

var genders      = [ 'male', 'female' ]
var hat_colors   = [ '0', '1', '2', '3', '4', '5', '6', '7', '8']
var hair_colors  = [ '0', '1', '2', '3', '4' ]
var skin_colors  = [ '0', '1', '2', '3', '4' ]
var hat_colors   = [ '0', '1', '2', '3', '4', '5', '6', '7', '8']
var pants_colors = [ '0', '1', '2', '3', '4' ]
buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"><form><h2>Customize Avatar</h2><input id=\"player_name\" name=\"name\" type=\"text\" placeholder=\"What's your name?\"/><div class=\"grid spaced align-middle break-max-medium\"><div class=\"grid-items\"><div class=\"col\"><div class=\"field sub-colorPicker\"><div class=\"grid align-middle spaced break-max-medium\"><div class=\"grid-items\"><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Gender:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate genders
;(function(){
  var $$obj = genders;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var gender = $$obj[$index];

var pickerId = "avatar-gender"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", gender, true, false)) + (jade.attr("id", pickerId + "-" + gender, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + gender, true, false)) + (jade.cls([pickerId + "-" + gender], [true])) + ">" + (jade.escape(null == (jade.interp = gender) ? "" : jade.interp)) + "</label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var gender = $$obj[$index];

var pickerId = "avatar-gender"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", gender, true, false)) + (jade.attr("id", pickerId + "-" + gender, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + gender, true, false)) + (jade.cls([pickerId + "-" + gender], [true])) + ">" + (jade.escape(null == (jade.interp = gender) ? "" : jade.interp)) + "</label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Hat:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate hat_colors
;(function(){
  var $$obj = hat_colors;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var color = $$obj[$index];

var pickerId = "avatar-hat"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var color = $$obj[$index];

var pickerId = "avatar-hat"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Hair:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate hair_colors
;(function(){
  var $$obj = hair_colors;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var color = $$obj[$index];

var pickerId = "avatar-hair"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var color = $$obj[$index];

var pickerId = "avatar-hair"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Skin:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate skin_colors
;(function(){
  var $$obj = skin_colors;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var color = $$obj[$index];

var pickerId = "avatar-skin"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var color = $$obj[$index];

var pickerId = "avatar-skin"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Coat:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate hat_colors
;(function(){
  var $$obj = hat_colors;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var color = $$obj[$index];

var pickerId = "avatar-coat"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var color = $$obj[$index];

var pickerId = "avatar-coat"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div><div class=\"row\"><div class=\"col\"><div class=\"field-label\">Pants:</div></div><div class=\"col\"><div class=\"field-input\"><div class=\"colorPicker\">");
// iterate hat_colors
;(function(){
  var $$obj = hat_colors;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var color = $$obj[$index];

var pickerId = "avatar-pants"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var color = $$obj[$index];

var pickerId = "avatar-pants"
buf.push("<input type=\"radio\"" + (jade.attr("name", pickerId, true, false)) + (jade.attr("value", pickerId + "-" + color, true, false)) + (jade.attr("id", pickerId + "-" + color, true, false)) + "/><label" + (jade.attr("for", pickerId + "-" + color, true, false)) + (jade.cls([pickerId + "-" + color], [true])) + "></label>");
    }

  }
}).call(this);

buf.push("</div></div></div></div></div></div></div></div><div class=\"col nest-reset avatar-holder\"></div></div></div><button class=\"sub-width-full\">Join the party!</button></form></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/kick", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"><h1>You've been kicked.</h1><p>Maybe you were stuck, maybe you were being mean...either way we hope to see you back!</p></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/map", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div id=\"content\"><canvas id=\"drawCanvas\" width=\"5769\" height=\"4102\"></canvas></div><div class=\"disco\"><div class=\"lights\"><div class=\"light red\"></div><div class=\"light yellow\"></div><div class=\"light green\"></div><div class=\"light blue\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/modal", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/speech_bubble", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var locals_ = (locals || {}),content = locals_.content;
buf.push((jade.escape(null == (jade.interp = content) ? "" : jade.interp)) + "<a href=\"#\" class=\"close icon-close\"></a>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/team_photo", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};

buf.push("<div class=\"modal-wrap\"><div class=\"modal-content\"><div class=\"modal-content-box\"><img src=\"party/images/cremacrew_holiday2014.jpg\"/></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/view", function(exports, require, module) {
var $, EventBroker, View, attach, bind, mediator, setHTML, utils,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

mediator = require('lib/mediator');

utils = require('lib/utils');

EventBroker = require('lib/event_broker');

$ = Backbone.$;

bind = (function() {
  if (Function.prototype.bind) {
    return function(item, ctx) {
      return item.bind(ctx);
    };
  } else if (_.bind) {
    return _.bind;
  }
})();

setHTML = (function() {
  if ($) {
    return function(elem, html) {
      return elem.html(html);
    };
  } else {
    return function(elem, html) {
      return elem.innerHTML = html;
    };
  }
})();

attach = (function() {
  if ($) {
    return function(view) {
      var actual;
      actual = $(view.container);
      if (typeof view.containerMethod === 'function') {
        return view.containerMethod(actual, view.el);
      } else {
        return actual[view.containerMethod](view.el);
      }
    };
  } else {
    return function(view) {
      var actual;
      actual = typeof view.container === 'string' ? document.querySelector(view.container) : view.container;
      if (typeof view.containerMethod === 'function') {
        return view.containerMethod(actual, view.el);
      } else {
        return actual[view.containerMethod](view.el);
      }
    };
  }
})();

module.exports = View = (function(_super) {
  __extends(View, _super);

  Backbone.utils.extend(View.prototype, EventBroker);

  View.prototype.autoRender = false;

  View.prototype.autoAttach = true;

  View.prototype.container = null;

  View.prototype.containerMethod = $ ? 'append' : 'appendChild';

  View.prototype.regions = null;

  View.prototype.region = null;

  View.prototype.stale = false;

  View.prototype.noWrap = false;

  View.prototype.keepElement = false;

  View.prototype.subviews = null;

  View.prototype.subviewsByName = null;

  View.prototype.optionNames = ['autoAttach', 'autoRender', 'container', 'containerMethod', 'region', 'regions', 'noWrap'];

  function View(options) {
    var optName, optValue, region, render,
      _this = this;
    if (options) {
      for (optName in options) {
        optValue = options[optName];
        if (__indexOf.call(this.optionNames, optName) >= 0) {
          this[optName] = optValue;
        }
      }
    }
    render = this.render;
    this.render = function() {
      if (_this.disposed) {
        return false;
      }
      render.apply(_this, arguments);
      if (_this.autoAttach) {
        _this.attach.apply(_this, arguments);
      }
      return _this;
    };
    this.subviews = [];
    this.subviewsByName = {};
    if (this.noWrap) {
      if (this.region) {
        region = mediator.execute('region:find', this.region);
        if (region != null) {
          this.el = region.instance.container != null ? region.instance.region != null ? $(region.instance.container).find(region.selector) : region.instance.container : region.instance.$(region.selector);
        }
      }
      if (this.container) {
        this.el = this.container;
      }
    }
    View.__super__.constructor.apply(this, arguments);
    this.delegateListeners();
    if (this.model) {
      this.listenTo(this.model, 'dispose', this.dispose);
    }
    if (this.collection) {
      this.listenTo(this.collection, 'dispose', function(subject) {
        if (!subject || subject === _this.collection) {
          return _this.dispose();
        }
      });
    }
    if (this.regions != null) {
      mediator.execute('region:register', this);
    }
    if (this.autoRender) {
      this.render();
    }
  }

  View.prototype.delegate = function(eventName, second, third) {
    var bound, event, events, handler, list, selector;
    if (Backbone.utils) {
      return Backbone.utils.delegate(this, eventName, second, third);
    }
    if (typeof eventName !== 'string') {
      throw new TypeError('View#delegate: first argument must be a string');
    }
    if (arguments.length === 2) {
      handler = second;
    } else if (arguments.length === 3) {
      selector = second;
      if (typeof selector !== 'string') {
        throw new TypeError('View#delegate: ' + 'second argument must be a string');
      }
      handler = third;
    } else {
      throw new TypeError('View#delegate: ' + 'only two or three arguments are allowed');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('View#delegate: ' + 'handler argument must be function');
    }
    list = (function() {
      var _i, _len, _ref, _results;
      _ref = eventName.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push("" + event + ".delegate" + this.cid);
      }
      return _results;
    }).call(this);
    events = list.join(' ');
    bound = bind(handler, this);
    this.$el.on(events, selector || null, bound);
    return bound;
  };

  View.prototype._delegateEvents = function(events) {
    var bound, eventName, handler, key, match, selector, value;
    if (Backbone.View.prototype.delegateEvents.length === 2) {
      return Backbone.View.prototype.delegateEvents.call(this, events, true);
    }
    for (key in events) {
      value = events[key];
      handler = typeof value === 'function' ? value : this[value];
      if (!handler) {
        throw new Error("Method '" + value + "' does not exist");
      }
      match = key.match(/^(\S+)\s*(.*)$/);
      eventName = "" + match[1] + ".delegateEvents" + this.cid;
      selector = match[2];
      bound = bind(handler, this);
      this.$el.on(eventName, selector || null, bound);
    }
  };

  View.prototype.delegateEvents = function(events, keepOld) {
    var classEvents, _i, _len, _ref;
    if (!keepOld) {
      this.undelegateEvents();
    }
    if (events) {
      return this._delegateEvents(events);
    }
    _ref = utils.getAllPropertyVersions(this, 'events');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      classEvents = _ref[_i];
      if (typeof classEvents === 'function') {
        classEvents = classEvents.call(this);
      }
      this._delegateEvents(classEvents);
    }
  };

  View.prototype.undelegate = function(eventName, second, third) {
    var event, events, handler, list, selector;
    if (Backbone.utils) {
      return Backbone.utils.undelegate(this, eventName, second, third);
    }
    if (eventName) {
      if (typeof eventName !== 'string') {
        throw new TypeError('View#undelegate: first argument must be a string');
      }
      if (arguments.length === 2) {
        if (typeof second === 'string') {
          selector = second;
        } else {
          handler = second;
        }
      } else if (arguments.length === 3) {
        selector = second;
        if (typeof selector !== 'string') {
          throw new TypeError('View#undelegate: ' + 'second argument must be a string');
        }
        handler = third;
      }
      list = (function() {
        var _i, _len, _ref, _results;
        _ref = eventName.split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          _results.push("" + event + ".delegate" + this.cid);
        }
        return _results;
      }).call(this);
      events = list.join(' ');
      return this.$el.off(events, selector || null);
    } else {
      return this.$el.off(".delegate" + this.cid);
    }
  };

  View.prototype.delegateListeners = function() {
    var eventName, key, method, target, version, _i, _len, _ref, _ref1;
    if (!this.listen) {
      return;
    }
    _ref = utils.getAllPropertyVersions(this, 'listen');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      version = _ref[_i];
      if (typeof version === 'function') {
        version = version.call(this);
      }
      for (key in version) {
        method = version[key];
        if (typeof method !== 'function') {
          method = this[method];
        }
        if (typeof method !== 'function') {
          throw new Error('View#delegateListeners: ' + ("listener for \"" + key + "\" must be function"));
        }
        _ref1 = key.split(' '), eventName = _ref1[0], target = _ref1[1];
        this.delegateListener(eventName, target, method);
      }
    }
  };

  View.prototype.delegateListener = function(eventName, target, callback) {
    var prop;
    if (target === 'model' || target === 'collection') {
      prop = this[target];
      if (prop) {
        this.listenTo(prop, eventName, callback);
      }
    } else if (target === 'mediator') {
      this.subscribeEvent(eventName, callback);
    } else if (!target) {
      this.on(eventName, callback, this);
    }
  };

  View.prototype.subview = function(name, view) {
    var byName, subviews;
    subviews = this.subviews;
    byName = this.subviewsByName;
    if (name && view) {
      this.removeSubview(name);
      subviews.push(view);
      byName[name] = view;
      return view;
    } else if (name) {
      return byName[name];
    }
  };

  View.prototype.removeSubview = function(nameOrView) {
    var byName, index, name, otherName, otherView, subviews, view;
    if (!nameOrView) {
      return;
    }
    subviews = this.subviews;
    byName = this.subviewsByName;
    if (typeof nameOrView === 'string') {
      name = nameOrView;
      view = byName[name];
    } else {
      view = nameOrView;
      for (otherName in byName) {
        otherView = byName[otherName];
        if (!(otherView === view)) {
          continue;
        }
        name = otherName;
        break;
      }
    }
    if (!(name && view && view.dispose)) {
      return;
    }
    view.dispose();
    index = subviews.indexOf(view);
    if (index !== -1) {
      subviews.splice(index, 1);
    }
    return delete byName[name];
  };

  View.prototype.getTemplateData = function() {
    var data, source;
    data = this.model ? utils.serialize(this.model) : this.collection ? {
      items: utils.serialize(this.collection),
      length: this.collection.length
    } : {};
    source = this.model || this.collection;
    if (source) {
      if (typeof source.isSynced === 'function' && !('synced' in data)) {
        data.synced = source.isSynced();
      }
    }
    return data;
  };

  View.prototype.getTemplateFunction = function() {
    throw new Error('View#getTemplateFunction must be overridden');
  };

  View.prototype.render = function() {
    var el, html, templateFunc;
    if (this.disposed) {
      return false;
    }
    templateFunc = this.getTemplateFunction();
    if (typeof templateFunc === 'function') {
      html = templateFunc(this.getTemplateData());
      if (this.noWrap) {
        el = document.createElement('div');
        el.innerHTML = html;
        if (el.children.length > 1) {
          throw new Error('There must be a single top-level element when ' + 'using `noWrap`.');
        }
        this.undelegateEvents();
        this.setElement(el.firstChild, true);
      } else {
        setHTML(($ ? this.$el : this.el), html);
      }
    }
    return this;
  };

  View.prototype.attach = function() {
    if (this.region != null) {
      mediator.execute('region:show', this.region, this);
    }
    if (this.container && !document.body.contains(this.el)) {
      attach(this);
      return this.trigger('addedToDOM');
    }
  };

  View.prototype.disposed = false;

  View.prototype.dispose = function() {
    var prop, properties, subview, _i, _j, _len, _len1, _ref;
    if (this.disposed) {
      return;
    }
    _ref = this.subviews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subview = _ref[_i];
      subview.dispose();
    }
    this.unsubscribeAllEvents();
    this.off();
    if (this.keepElement) {
      this.undelegateEvents();
      this.undelegate();
      this.stopListening();
    } else {
      this.remove();
    }
    properties = ['el', '$el', 'options', 'model', 'collection', 'subviews', 'subviewsByName', '_callbacks'];
    for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
      prop = properties[_j];
      delete this[prop];
    }
    this.disposed = true;
    return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
  };

  View.prototype.getTemplateFunction = function() {
    return this.template;
  };

  return View;

})(Backbone.NativeView);
});

;
//# sourceMappingURL=app.js.map