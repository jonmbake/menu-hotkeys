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

  var HotkeyPrompt = function (menuItem) {
    this.menuItem = menuItem;
    this.init();
  };

  $.extend(HotkeyPrompt.prototype, {
    init: function () {
      this.menuItem.$a.popover({
        animation: false,
        placement: 'bottom',
        html: true,
        title: 'Add a Shortcut',
        content: '<div class="alert alert-danger hotkey-error-msg" style="margin-bottom: 10px; display: none; font-size: 12px;"></div><div class="input-group input-group-sm" style="margin-bottom: 10px;"><span class="input-group-addon" id="sizing-addon3">' + this.menuItem.hotkeyPrefix + ' + </span>\
          <input type="text" class="input-sm hotkey-input" size="1" maxlength="1"></div>\
          <button class="confirm btn btn-xs btn-danger add-shortcut-btn">Add</button>\
          <button class="unconfirm btn btn-xs cancel-shortcut-btn">Cancel</button>',
      });
    },
    open: function () {
      var menuItem = this.menuItem;
      var $a = this.menuItem.$a;
      $a.popover('show');

      if (this.menuItem.hotkey) {
        $('.hotkey-input').val(this.menuItem.hotkey);
      }
      $('.cancel-shortcut-btn').click(function () {
        $a.popover('destroy');
      });
      $('.add-shortcut-btn').click(function () {
        var hotkey = $('.hotkey-input').val();
        //a little validation
        var errorMsg;
        if (hotkey.length === 0) {
          errorMsg = 'Please enter a Shortcut value.';
        } else if (hotkey.length > 1) {
          errorMsg = 'Shortcut must be one character long.';
        }
        if (errorMsg) {
          $('.hotkey-error-msg').text(errorMsg).show();
          $('.hotkey-input').focus();
          return;
        }
        menuItem.hotkeyUpdater('add', {name: menuItem.name, hotkey: hotkey}).then(
          //success
          function (shortCut) {
            menuItem.updateHotkey(shortCut.hotkey);
            $a.popover('destroy');
          },
          //error
          function (errorMsg) {
            $('.hotkey-error-msg').text(errorMsg).show();
            $('.hotkey-input').focus();
          }
        );
      });   
    }
  });
  /**
   * A Menu Item managed by {@link HotkeyMenu}.  Can be either a 
   * @param {[type]} $a     [description]
   * @param {[type]} prefix [description]
   * @param {[type]} hotkey [description]
   */
  var MenuItem = function ($a, hotkeyUpdater, hotkeyPrefix, hotkey) {
    $.extend(this, { $a: $a, hotkeyUpdater: hotkeyUpdater, hotkeyPrefix: hotkeyPrefix});
    this.name = $a.text();
    this.updateHotkey(hotkey);
    this.addClickHandler();
  };

  $.extend(MenuItem.prototype, {
    addClickHandler: function () {
      //would like to use Function.prototype.bind, but Phantomjs barfs when running tests :(
      var _this = this;
      var $a = this.$a;
      var clicks = 0;
      $a.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clicks++;
        if (clicks === 1) {
          setTimeout(function() {
            if (clicks === 1) {
              window.location = $a.attr('href');
            } else {
              new HotkeyPrompt(_this).open();
            }
            clicks = 0;
          }, 300);
        }
      }.bind(this));
    },
    updateHotkey: function (hotkey) {
      if (!hotkey) {
        return;
      }
      if (this.hotkey) {
        $(document).unbind('keydown', this.hotkeyPrefix + '+' + this.hotkey);
      }
      this.hotkey = hotkey;
      this.$a.remove('sup').append($('<sup>').text(hotkey));
      var keyCombination = this.hotkeyPrefix + '+' + hotkey;
      
      $(document).bind('keydown', keyCombination, function () {
        this.$a.click();
      }.bind(this));
    }
  });


  var HotkeyMenu = function ($menu, options) {
    $.extend(this, defaultOptions, options);
    this.$menu = $menu;

    var items = this.menuItems = [];
    var hotkeyPrefix = this.hotkeyPrefix;
    var hotkeyUpdater = this.updateShortcut.bind(this);

    this.loadSavedShortcuts().then(function (shortcuts) {
      $menu.find('a').each(function () {
        var $a = $(this);
        for (var i = 0; i < shortcuts.length; ++i) {
          var sc = shortcuts[i];
          if (sc.name === $a.text()) {
            items.push(new MenuItem($a, hotkeyUpdater, hotkeyPrefix, sc.hotkey));
            return;
          }
        }
        items.push(new MenuItem($a, hotkeyUpdater, hotkeyPrefix));
      });
    });
  };

  $.extend(HotkeyMenu.prototype, {
    LOCAL_STORAGE_ITEM_NAME: 'MENU_SHORTCUTS',
    updateShortcut: function (action, shortcut) {
      var deferred = $.Deferred();
      switch(action) {
        case 'add':
          var existingSc = this.getShortcutByHotkey(shortcut.hotkey);
          if (existingSc) {
            deferred.reject('Shortcut already exists for ' +  existingSc.name + '.');
            break;
          }
          this.shortcuts.push(shortcut);
          window.localStorage.setItem(this.LOCAL_STORAGE_ITEM_NAME, JSON.stringify(this.shortcuts));
          deferred.resolve(shortcut);
          break;
      }
      return deferred.promise();
    },
    loadSavedShortcuts: function () {
      var deferred = $.Deferred();
      this.shortcuts = [];
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
    getShortcutByHotkey: function (hotkey) {
      for (var i = 0; i < this.shortcuts.length; ++i) {
        var sc = this.shortcuts[i];
        if (sc.hotkey === hotkey) {
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

  $.fn.menu_hotkeys = function(firstArg) {
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
