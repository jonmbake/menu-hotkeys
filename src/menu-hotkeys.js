/*
 * menu-hotkeys
 * https://github.com/jonmbake/menu-hotkeys
 *
 * Copyright (c) 2015 Jon Bake
 * Dependent on jQuery Hotkeys Plugin (Copyright 2010, John Resig)
 * Licensed under the MIT license.
 */
// A note on nomenclature: Shortcut is menu item and hotkey, hotkey is the key sequence
(function($) {
  var jQuery = $;

  var defaultOptions = {
    hotkeyPrefix: 'ctrl+shift'
  };

  var Dispatcher = function () {
    //hash of event to elements registered
    this.registered = {};
  };

  $.extend(Dispatcher.prototype, {
    register: function ($element, events, callback) {
      events = Array.isArray(events) ? events : [events];
      events.forEach(function (event) {
        if (!this.registered.hasOwnProperty(event)) {
          this.registered[event] = [{element: $element, callback: callback}];
        } else {
          this.registered[event].push({element: $element, callback: callback});
        }
      }, this);
    },
    unregister: function ($element, events) {
      events = Array.isArray(events) ? events : [events];
      events.forEach(function (event) {
        var reg = this.registered[event];
        if (reg) {
          var index = -1;
          for (var i = 0; i < reg.length; i++) {
            if ($element.is(reg[i].element)) {
              index = i;
              break;
            }
          }
          if (index !== -1) {
            reg.splice(index, 1);
          }
        }
      }, this);
    },
    trigger: function (event) {
      var reg = this.registered[event];
      if (reg) {
        var args = Array.prototype.slice.call(arguments, 1);
        reg.forEach(function(r) {
          r.element.trigger(event, args);
          if (r.callback) {
            r.callback.apply(null, args);
          }
        });
      }
    }
  });

  var HotkeyPrompt = function (menuItem) {
    this.menuItem = menuItem;
    var $a = this.menuItem.$a;
    this.menuItem.hotkeyDispatcher.register($a, 'menu-hotkey-input-error', function (errorMsg) {
      $('.hotkey-error-msg').text(errorMsg).show();
      $('.hotkey-input').focus();
    });
    this.menuItem.hotkeyDispatcher.register($a, 'menu-hotkey-input-close', this.destroy.bind(this));
  };

  $.extend(HotkeyPrompt.prototype, {
    destroy: function () {
      this.menuItem.$a.popover('destroy');
    },
    open: function () {
      this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-close');
      var menuItem = this.menuItem;
      var $a = this.menuItem.$a;
       $a.popover({
        animation: false,
        placement: 'bottom',
        html: true,
        title: 'Add a Shortcut',
        content: '<div class="alert alert-danger hotkey-error-msg" style="margin-bottom: 10px; display: none; font-size: 12px;"></div><div class="input-group input-group-sm" style="margin-bottom: 10px;"><span class="input-group-addon" id="sizing-addon3">' + this.menuItem.hotkeyPrefix + ' + </span>\
          <input type="text" class="input-sm hotkey-input" size="1" maxlength="1"></div>\
          <button class="confirm btn btn-xs btn-danger add-shortcut-btn">Add</button>\
          <button class="unconfirm btn btn-xs cancel-shortcut-btn">Cancel</button>',
      });
      $a.popover('show');

      if (this.menuItem.hotkey) {
        $('.hotkey-input').val(this.menuItem.hotkey);
      }
      $('.cancel-shortcut-btn').click(function () {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-close');
      }.bind(this));
      $('.add-shortcut-btn').click(function () {
        var hotkey = $('.hotkey-input').val();
        if (this.validateHotkeyInput(hotkey)) {
          menuItem.updateHotkey(hotkey);
        }
      }.bind(this));
      $a.trigger('hotkey-prompt-open');
    },
    validateHotkeyInput: function (hotkey) {
      if (hotkey.length === 0) {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-error', 'Please enter a Shortcut value.');
        return false;
      } else if (hotkey.length > 1) {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-error', 'Shortcut must be one character long.');
        return false;
      }
      return true;
    }
  });
  /**
   * A Menu Item managed by {@link HotkeyMenu}.  Can be either a 
   * @param {[type]} $a     [description]
   * @param {[type]} prefix [description]
   * @param {[type]} hotkey [description]
   */
  var MenuItem = function ($a, hotkeyDispatcher, hotkeyPrefix, hotkey) {
    $.extend(this, { $a: $a, hotkeyDispatcher: hotkeyDispatcher, hotkeyPrefix: hotkeyPrefix});
    this.name = $a.text();
    this.linkClicker = function () { $a.click(); };
    hotkeyDispatcher.register($a, 'menu-hotkey-updated', function (shortcut) {
      if (shortcut.name === this.name) {
        this.addHotkey(shortcut.hotkey);
        hotkeyDispatcher.trigger('menu-hotkey-input-close');
      }
    }.bind(this));
    this.addHotkey(hotkey);
    this.addClickHandler();
  };

  $.extend(MenuItem.prototype, {
    addClickHandler: function () {
      var clicks = 0;
      this.$a.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clicks++;
        if (clicks === 1) {
          setTimeout(function() {
            if (clicks === 1) {
              window.location = this.$a.attr('href');
            } else {
              //lazy load prompt
              this.hotkeyPrompt = this.hotkeyPrompt || new HotkeyPrompt(this);
              this.hotkeyPrompt.open();
            }
            clicks = 0;
          }.bind(this), 300);
        }
      }.bind(this));
    },
    updateHotkey: function (hotkey) {
      if (!hotkey || hotkey === this.hotkey) {
        return;
      }
      if (this.hotkey) {
        $(document).unbind('keydown', this.linkClicker);
      }
      this.hotkeyDispatcher.trigger('update-menu-shortcut', {name: this.name, hotkey: hotkey});
    },
    addHotkey: function (hotkey) {
      if (!hotkey) {
        return;
      }
      this.hotkey = hotkey;
      this.$a.find('sup').remove();
      this.$a.append($('<sup>').text(hotkey));
      var keyCombination = this.hotkeyPrefix + '+' + hotkey;
      
      $(document).bind('keydown', keyCombination, this.linkClicker);
    }
  });

  var HotkeyMenu = function ($menu, options) {
    $.extend(this, defaultOptions, options);
    this.$menu = $menu;

    var items = this.menuItems = [];
    var hotkeyPrefix = this.hotkeyPrefix;
    var dispatcher = this.dispatcher = new Dispatcher();
    dispatcher.register($menu, 'update-menu-shortcut', this.updateShortcut.bind(this));
    dispatcher.register($menu, 'menu-hotkey-input-error');

    this.loadSavedShortcuts().then(function (shortcuts) {
      $menu.find('a').each(function () {
        var $a = $(this);
        for (var scName in shortcuts) {
          if (scName === $a.text()) {
            items.push(new MenuItem($a, dispatcher, hotkeyPrefix, shortcuts[scName]));
            return;
          }
        }
        items.push(new MenuItem($a, dispatcher, hotkeyPrefix));
      });
      $menu.trigger('menu-hotkeys-loaded');
    });
  };

  $.extend(HotkeyMenu.prototype, {
    LOCAL_STORAGE_ITEM_NAME: 'MENU_SHORTCUTS',
    updateShortcut: function (shortcut) {
      var existing = this.getNameForHotkey(shortcut.hotkey);
      if (existing) {
        this.dispatcher.trigger('menu-hotkey-input-error', 'Shortcut already exists for ' +  existing + '.');
        return;
      }
      this.shortcuts[shortcut.name] = shortcut.hotkey;
      window.localStorage.setItem(this.LOCAL_STORAGE_ITEM_NAME, JSON.stringify(this.shortcuts));
      this.dispatcher.trigger('menu-hotkey-updated', shortcut);
    },
    loadSavedShortcuts: function () {
      var deferred = $.Deferred();
      this.shortcuts = {};
      var shortcuts = window.localStorage.getItem(this.LOCAL_STORAGE_ITEM_NAME);
      if (shortcuts) {
        try {
          this.shortcuts = JSON.parse(shortcuts);
        } catch (e) {
          return deferred.reject('Error while attempting to load menu shortcuts.  Unable to parse: ', shortcuts);
        }
      }
      return deferred.resolve(this.shortcuts);
    },
    getNameForHotkey: function (hotkey) {
      for (var sc in this.shortcuts) {
        if (this.shortcuts[sc] === hotkey) {
          return sc;
        }
      }
    },
    /**
     * Add a shortcut to the menu.
     * @param {object} shortcut - to add
     */
    add: function (/*shortcut*/) {
    }
  });

   /**
   * Public API.
   *
   * @type {Object} api
   */
  var api = {
    /**
     * Inititialize this element to track revisions.
     *
     * @param  {Object} options revision
     * @return {[type]}         [description]
     */
    init: function (options) {
      var rt = new HotkeyMenu(this, options);
      this.data('hotkeys', rt);
      return this;
    }
  };

  $.fn.menuHotkeys = function(firstArg) {
    var pluginArgs = arguments;
    var isApiCall = typeof firstArg === 'string';
    var r = this.map(function () {
      if (firstArg === void 0 || typeof firstArg === 'object') { //calling the constructor
        return api.init.call($(this), firstArg);
      } else if (isApiCall && api[firstArg]) { //calling an API method
        return api[firstArg].apply($(this), Array.prototype.slice.call(pluginArgs, 1));
      } else { //calling a method that is not part of the API -- throw an error
        throw new Error("Calling method that is not part of the API");
      }
    });
    //if API call, "un-jquery" the return value 
    if (isApiCall) {
      //if a "get" call just return a single element
      if (firstArg.indexOf('get') === 0) {
        return r[0];
      }
      return r.toArray();
    }
    return r;
  };

  /*
   * jQuery Hotkeys Plugin
   * Copyright 2010, John Resig
   */
  jQuery.hotkeys = {
    version: "0.8",

    specialKeys: {
      8: "backspace",
      9: "tab",
      10: "return",
      13: "return",
      16: "shift",
      17: "ctrl",
      18: "alt",
      19: "pause",
      20: "capslock",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "del",
      59: ";",
      61: "=",
      96: "0",
      97: "1",
      98: "2",
      99: "3",
      100: "4",
      101: "5",
      102: "6",
      103: "7",
      104: "8",
      105: "9",
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      112: "f1",
      113: "f2",
      114: "f3",
      115: "f4",
      116: "f5",
      117: "f6",
      118: "f7",
      119: "f8",
      120: "f9",
      121: "f10",
      122: "f11",
      123: "f12",
      144: "numlock",
      145: "scroll",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'"
    },

    shiftNums: {
      "`": "~",
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ": ",
      "'": "\"",
      ",": "<",
      ".": ">",
      "/": "?",
      "\\": "|"
    },

    // excludes: button, checkbox, file, hidden, image, password, radio, reset, search, submit, url
    textAcceptingInputTypes: [
      "text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime",
      "datetime-local", "search", "color", "tel"],

    // default input types not to bind to unless bound directly
    textInputTypes: /textarea|input|select/i,

    options: {
      filterInputAcceptingElements: true,
      filterTextInputs: true,
      filterContentEditable: true
    }
  };

  function keyHandler(handleObj) {
    if (typeof handleObj.data === "string") {
      handleObj.data = {
        keys: handleObj.data
      };
    }

    // Only care when a possible input has been specified
    if (!handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string") {
      return;
    }

    var origHandler = handleObj.handler,
      keys = handleObj.data.keys.toLowerCase().split(" ");

    handleObj.handler = function(event) {
      //      Don't fire in text-accepting inputs that we didn't directly bind to
      if (this !== event.target &&
        (jQuery.hotkeys.options.filterInputAcceptingElements &&
          jQuery.hotkeys.textInputTypes.test(event.target.nodeName) ||
          (jQuery.hotkeys.options.filterContentEditable && jQuery(event.target).attr('contenteditable')) ||
          (jQuery.hotkeys.options.filterTextInputs &&
            jQuery.inArray(event.target.type, jQuery.hotkeys.textAcceptingInputTypes) > -1))) {
        return;
      }

      var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[event.which],
        character = String.fromCharCode(event.which).toLowerCase(),
        modif = "",
        possible = {};

      jQuery.each(["alt", "ctrl", "shift"], function(index, specialKey) {

        if (event[specialKey + 'Key'] && special !== specialKey) {
          modif += specialKey + '+';
        }
      });

      // metaKey is triggered off ctrlKey erronously
      if (event.metaKey && !event.ctrlKey && special !== "meta") {
        modif += "meta+";
      }

      if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
        modif = modif.replace("alt+ctrl+shift+", "hyper+");
      }

      if (special) {
        possible[modif + special] = true;
      }
      else {
        possible[modif + character] = true;
        possible[modif + jQuery.hotkeys.shiftNums[character]] = true;

        // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
        if (modif === "shift+") {
          possible[jQuery.hotkeys.shiftNums[character]] = true;
        }
      }

      for (var i = 0, l = keys.length; i < l; i++) {
        if (possible[keys[i]]) {
          return origHandler.apply(this, arguments);
        }
      }
    };
  }

  jQuery.each(["keydown", "keyup", "keypress"], function() {
    jQuery.event.special[this] = {
      add: keyHandler
    };
  });
}(jQuery));
