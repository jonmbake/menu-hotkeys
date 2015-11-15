/*! Menu Hotkeys - v0.1.0 - 2015-11-14
* https://github.com/jonmbake/menu-hotkeys
* Copyright (c) 2015 Jon Bake; Licensed MIT */
/* globals define */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(root.jQuery);
  }
}(this, function($) {
  var jQuery = $;
  /**
   * Default initialization options.
   * Other valid options are:
   *   menuHotkeyUrl - the url to GET and PUT hotkeys to
   * @type {Object}
   */
  var defaultOptions = {
    hotkeyPrefix: 'alt'
  };
  /**
   * A simple jQuery Event Dispatcher (Event Bus).  Any registered event will have every registered element notified
   * (triggerd) when the event is triggered through the dispatcher.
   * This allows components to remain decoupled and allows event to easily propogate up to the main element.
   * @constructor
   */
  var Dispatcher = function () {
    this.reset();
  };

  $.extend(Dispatcher.prototype, {
    /**
     * Clear all registered events.
     * @return {undefined}
     */
    reset: function () {
      //hash of event to elements registered
      this.registered = {};
    },
    /**
     * Register an element to one or multiple events.  Optionally provided a callback to be invoked when the event is
     * triggered through the dispatcher.
     * @param  {jQuqery Object}   $element - to register the event on
     * @param  {String} or {Array}   events  - or single event to register the $element under
     * @param  {Function} callback - optional callback to be invoked when event is triggered
     * @return {undefined}
     */
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
    /**
     * Unregister an element from an event.
     * @param  {jQuqery Object}   $element - to unregister from the event
     * @param  {String} or {Array}   events or single event to unregister the $element from.  If no events specified, remove element from every registerd event.
     * @return {undefined}
     */
    unregister: function ($element, events) {
      if (events) {
        events = Array.isArray(events) ? events : [events];
      } else {
        events = Object.keys(this.registered);
      }
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
    /**
     * Trigger an event.
     * @param  {String} event -
     * @return {undefined}
     */
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
  /**
   * Hotkey Prompt.
   * @constructor
   * @param {MenuItem} menuItem - menu item the prompt is attached to
   */
  var HotkeyPrompt = function (menuItem) {
    this.menuItem = menuItem;
    var $a = this.menuItem.$a;
    this.menuItem.hotkeyDispatcher.register($a, 'menu-hotkey-input-error', function (errorMsg) {
      $('.hotkey-error-msg').text(errorMsg).show();
      $('.hotkey-input').focus();
    });
    this.menuItem.hotkeyDispatcher.register($a, 'menu-hotkey-input-close', this.close.bind(this));
    this.menuItem.hotkeyDispatcher.register($a, 'menu-hotkey-input-open');
  };

  $.extend(HotkeyPrompt.prototype, {
    /**
     * Close the prompt
     * @return {undefined}
     */
    close: function () {
      this.menuItem.$a.popover('destroy');
    },
    /**
     * Open the prompt.
     * @return {undefined}
     */
    open: function () {
      var menuItem = this.menuItem;
      var $a = menuItem.$a;
      //close any prompts that are open
      menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-close');
      $a.popover({
        animation: false,
        placement: 'bottom',
        html: true,
        title: 'Add a Hotkey',
        content: '<div class="alert alert-danger hotkey-error-msg" style="margin-bottom: 10px; display: none; font-size: 12px;"></div><div class="input-group input-group-sm input-prepend input-append" style="margin-bottom: 10px;"><span class="input-group-addon add-on" id="sizing-addon3">' + this.menuItem.hotkeyPrefix + '+</span>\
          <input type="text" class="input-sm input-small hotkey-input" size="1" maxlength="1"></div>\
          <button class="confirm btn btn-xs btn-mini btn-danger add-shortcut-btn">Add</button>\
          <button class="unconfirm btn btn-xs btn-mini cancel-shortcut-btn">Cancel</button>',
      });
      $a.popover('show');
      $('.popover-title').css({'white-space': 'nowrap'});

      if (menuItem.hotkey) {
        $('.hotkey-input').val(menuItem.hotkey);
      }
      $('.cancel-shortcut-btn').on('click', function () {
        menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-close');
      });
      $('.add-shortcut-btn').on('click', function () {
        var hotkey = $('.hotkey-input').val();
        if (this.validateHotkeyInput(hotkey)) {
          menuItem.hotkeyDispatcher.trigger('update-menu-shortcut', {name: menuItem.name, hotkey: hotkey});
        }
      }.bind(this));
      $('.hotkey-input').focus();
      menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-open');
    },
    /**
     * Validate input and trigger 'menu-hotkey-input-error' if invalid.
     * Checks that a value is chosen, has change and that the value is one char. long.  Additonal validation can be done by
     * listening for 'update-menu-shortcut'.
     * @param  {String} hotkey - hotkey text
     * @return {boolean}        true if valid, false otherwise
     */
    validateHotkeyInput: function (hotkey) {
      if (hotkey.length === 0) {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-error', 'Please enter a Shortcut value.');
        return false;
      } else if (hotkey.length > 1) {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-error', 'Shortcut must be one character long.');
        return false;
      } else if (hotkey === this.menuItem.hotkey) {
        this.menuItem.hotkeyDispatcher.trigger('menu-hotkey-input-error', 'Value has not changed.');
        return false;
      }
      return true;
    }
  });
  /**
   * A Menu Item managed by {@link HotkeyMenu}.
   * @param {jQuery Object} $a - menu link element
   * @param {Dispatcher} hotkeyDispatcher - event dispatcher
   * @param {String} hotkeyPrefix - hot key prefix (passed in as option)
   * @param {String} hotkey - existing hotkey
   */
  var MenuItem = function ($a, hotkeyDispatcher, hotkeyPrefix, hotkey) {
    $.extend(this, { $a: $a, hotkeyDispatcher: hotkeyDispatcher, hotkeyPrefix: hotkeyPrefix});
    this.name = $a.text();
    this.linkClicker = function () {
      var a = $a[0];
      if (a) {
        a.click();
      }
    };
    hotkeyDispatcher.register($a, 'menu-hotkey-updated', function (shortcut) {
      if (shortcut.name === this.name) {
        this.updateHotkey(shortcut.hotkey);
        hotkeyDispatcher.trigger('menu-hotkey-input-close');
      }
    }.bind(this));
    this.updateHotkey(hotkey);
    this.boundClickHandler = this.clickHandler.bind(this);
    this.$a.on('click', this.boundClickHandler);
  };

  $.extend(MenuItem.prototype, {
    destroy: function () {
      this.hotkeyDispatcher.trigger('menu-hotkey-input-close');
      this.removeHotkeyIndicator();
      this.hotkeyDispatcher.unregister(this.$a);
      if (this.hotkey) {
        $(document).unbind('keydown', this.linkClicker);
      }
      this.$a.off('click', this.boundClickHandler);
    },
    /**
     * Add menu item click handlers.  If shift key is down, open the prompt; otherwise preform default click action.
     */
    clickHandler: function (e) {
      if (e.altKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        //lazily construct prompt
        this.hotkeyPrompt = this.hotkeyPrompt || new HotkeyPrompt(this);
        this.hotkeyPrompt.open();
      }
    },
    /**
     * Update hotkey with new value.
     * Unbind hotkey, update UI and trigger 'update-menu-shortcut' event.
     * @param {String} hotkey -
     * @return {undefined}
     */
    updateHotkey: function (hotkey) {
      if (!hotkey) {
        return;
      }
      if (this.hotkey) {
        $(document).unbind('keydown', this.linkClicker);
      }
      this.hotkey = hotkey;
      this.addHotkeyIndicator(hotkey);
      var keyCombination = this.hotkeyPrefix + '+' + hotkey;
      
      $(document).bind('keydown', keyCombination, this.linkClicker);
    },
    addHotkeyIndicator: function (hotkey) {
      this.removeHotkeyIndicator();
      this.$a.append($('<sup>').text(hotkey));
    },
    removeHotkeyIndicator: function () {
      this.$a.find('sup').remove();
    }
  });
  /**
   * Hotkey menu - repsponsible for setting up menu items, including loading persisted data.
   * @param {jQuery Object} $menu   menu element - should contain links
   * @param {object} options - options to plugin @see defaultOptions above
   */
  var HotkeyMenu = function ($menu, options) {
    $.extend(this, {$menu: $menu}, defaultOptions, options);
    this.init();
  };

  $.extend(HotkeyMenu.prototype, {
    LOCAL_STORAGE_ITEM_NAME: 'MENU_SHORTCUTS',
    /**
     * Initialize the hotkey menu.  This can also be used to re-initialize when the base menu changes.
     * @return {undefined}
     */
    init: function () {
      var $menu = this.$menu;
      //if re-initializing, destroy any existing menu items.
      if (this.menuItems) {
        this.menuItems.forEach(function (mi) {
          mi.destroy();
        });
      }
      var items = this.menuItems = [];
      var hotkeyPrefix = this.hotkeyPrefix;
      var dispatcher = this.dispatcher = new Dispatcher();
      dispatcher.register($menu, 'update-menu-shortcut', this.saveShortcut.bind(this));
      dispatcher.register($menu, ['menu-hotkey-input-open', 'menu-hotkey-input-close', 'menu-hotkey-input-error']);

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
        $menu.trigger('menu-hotkeys-loaded', shortcuts);
      });
    },
    /**
     * Save shortcut either in local storage or by PUTing to url if menuHotkeyUrl option is supplied.
     * @param  {Object} shortcut - shortcut object with name and hotkey properties
     * @return {undefined}
     */
    saveShortcut: function (shortcut) {
      var existing = this.getNameForHotkey(shortcut.hotkey);
      if (existing) {
        this.dispatcher.trigger('menu-hotkey-input-error', 'Shortcut already exists for ' +  existing + '.');
        return;
      }
      if (this.menuHotkeyUrl) {
         $.ajax({
          dataType: "json",
          method: "PUT",
          url: this.menuHotkeyUrl + '/' + encodeURI(shortcut.name),
          data: shortcut,
          success: function () {
            this.shortcuts[shortcut.name] = shortcut.hotkey;
            this.dispatcher.trigger('menu-hotkey-updated', shortcut);
          }.bind(this)
        });
      } else {
        this.shortcuts[shortcut.name] = shortcut.hotkey;
        window.localStorage.setItem(this.LOCAL_STORAGE_ITEM_NAME, JSON.stringify(this.shortcuts));
        this.dispatcher.trigger('menu-hotkey-updated', shortcut);
      }
    },
    /**
     * Load saved shorcuts from either Local Storage or url if menuHotkeyUrl option is supplied.
     * @return {promise} - will reject if loading fails
     */
    loadSavedShortcuts: function () {
      this.shortcuts = {};
      if (this.menuHotkeyUrl) {
        return $.ajax({
          dataType: "json",
          url: this.menuHotkeyUrl,
          success: function (data) {
            this.shortcuts = data;
          }.bind(this)
        });
      } else {
        var deferred = $.Deferred();
        var shortcuts = window.localStorage.getItem(this.LOCAL_STORAGE_ITEM_NAME);
        if (shortcuts) {
          try {
            this.shortcuts = JSON.parse(shortcuts);
          } catch (e) {
            return deferred.reject('Error while attempting to load menu shortcuts.  Unable to parse: ', shortcuts);
          }
        }
        return deferred.resolve(this.shortcuts);
      }
    },
    /**
     * Returns Menu Item name for given hotkey.
     * @param  {String} hotkey - hotkey name
     * @return {Object}        Shortcut Object
     */
    getNameForHotkey: function (hotkey) {
      for (var sc in this.shortcuts) {
        if (this.shortcuts[sc] === hotkey) {
          return sc;
        }
      }
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
      var d = this.data('hotkeys');
      if (d) {
        d.init();
      } else {
        d = new HotkeyMenu(this, options);
        this.data('hotkeys', d);
      }
      return this;
    }
  };

  //Register this plugin.
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
   * Everything after here is **jQuery Hotkeys Plugin** source.
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
      filterInputAcceptingElements: false,
      filterTextInputs: false,
      filterContentEditable: false
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
}));
