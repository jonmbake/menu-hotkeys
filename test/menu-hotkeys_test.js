(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  // creates new key event
  var createKeyEvent = function(keyCode, keyEventType) {

    keyEventType = keyEventType || 'keyup';

    var event = $.Event(keyEventType);
    event.keyCode = keyCode;
    event.which = keyCode;

    return event;
  };

  var triggerHotKeyBinding = function(keyEvent, keyCombinationAsText, keyCombinationAsKeyCode, modifiers) {
    if (!keyEvent || !keyCombinationAsText || !keyCombinationAsKeyCode) {
      throw new Error("Missing arguments for assertion, check your arguments.");
    }

    modifiers = modifiers || [];

    var event = createKeyEvent(keyCombinationAsKeyCode, keyEvent);

    $.each(modifiers, function(index, modifier) {
      event[modifier + 'Key'] = true;
    });

    $(document).trigger(event);
  };

  var altClick = function ($a) {
    var e = $.Event("click");
    e.altKey = true;
    $a.trigger(e);
  };

  module('jQuery#menuHotkeys base functionality', {
    // This will run before each test in this module.
    setup: function(assert) {
      var done = assert.async();
      var $n = this.$nav = $('#nav');
      this.$homeMenuItem = $('#home');
      window.localStorage.setItem('MENU_SHORTCUTS', '{"Home": "h"}');
      $n.on('menu-hotkeys-loaded', function () {
        $n.off('menu-hotkeys-loaded');
        done();
      });
      this.$nav.menuHotkeys();
    },
    teardown: function() {
      $(document).off();
      $('#nav').off();
      $('#nav a').popover('destroy');
      $('#nav a').off();
      $('sup').remove();
      window.localStorage.clear('MENU_SHORTCUTS');
      this.$nav.removeData('hotkeys');
    }
  });

  QUnit.test('should show popover on alt-click, hide when clicking cancel', function(assert) {
    var done = assert.async();
    $('#home').on('inserted.bs.popover', function () {
      ok(true, 'Popover is showing');
      setTimeout(function() {
        $('.cancel-shortcut-btn').click();
      });
    });
    $('#home').on('hidden.bs.popover', function () {
      ok(true, 'Popover is hiden');
      done();
    });
    altClick($('#home'));
  });

  QUnit.test('should add indicator to menu item with shortcut', function() {
    equal($('#home > sup:contains("h")').length, 1, 'superscript "h" is present on Home Menu Item');
    equal($('#foo > sup').length, 0, 'no superscript is present on Foo Menu Item');
  });

  QUnit.test('should display error when submitting empty hotkey value', function(assert) {
    var done = assert.async();
    $('#foo').on('menu-hotkey-input-open', function () {
      $('.hotkey-input').val('');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Please enter a Shortcut value.');
        done();
      });
    });
    altClick($('#foo'));
  });

  QUnit.test('should display error when submitting hotkey value that already exists', function(assert) {
    var done = assert.async();
    $('#foo').on('menu-hotkey-input-open', function () {
      $('.hotkey-input').val('h');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Shortcut already exists for Home.');
        done();
      });
    });
    altClick($('#foo'));
  });

  QUnit.test('should display error when shortcut is longer than one char', function(assert) {
    var done = assert.async();
    $('#foo').on('menu-hotkey-input-open', function () {
      $('.hotkey-input').val('foo');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Shortcut must be one character long.');
        done();
      });
    });
    altClick($('#foo'));
  });

  QUnit.test('should be able to add a shortcut (hotkey) by entering text into input', function(assert) {
    var done = assert.async();
    $('#foo').on('menu-hotkey-input-open', function () {
      $('.hotkey-input').val('f');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('#nav').data('hotkeys').shortcuts["Foo"], "f");
        done();
      });
    });
    altClick($('#foo'));
  });

  QUnit.test('should bind hotkey to document', function(assert) {
    var done = assert.async();
    $('#home').on('click', function () {
      ok(true, 'Home was clicked by hotkey');
      done();
    });
    triggerHotKeyBinding('keydown', 'alt+h', 72, ['alt']);
  });

  QUnit.test('should be able to update existing shortcut which unbinds hotkey', function(assert) {
    var done = assert.async();
    $('#home').on('menu-hotkey-input-open', function () {
      equal($('.hotkey-input').val(), 'h');
      $('.hotkey-input').val('o');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('#nav').data('hotkeys').shortcuts["Home"], "o");
        triggerHotKeyBinding('keydown', 'alt+h', 72, ['alt']);
        setTimeout(function () {
          done();
        });
      });
    });
    altClick($('#home'));
    $('#home').one('click', function () {
      ok(false, 'Home was clicked with old hotkey');
    });
  });

  QUnit.test('should be able to re-initialize hotkey menu', function(assert) {
    var done = assert.async();
    $('#nav').append('<a href="#new" id="new">New Item</a>');
    $('#new').on('menu-hotkey-input-open', function () {
      ok(true, 'New menu item prompt opened');
      done();
    });
    this.$nav.on('menu-hotkeys-loaded', function () {
      altClick($('#new'));
    });
    this.$nav.menuHotkeys();
  });

  module('jQuery#menuHotkeys non-default options', {
    teardown: function() {
      $(document).off();
      $('#nav').off();
      $('#nav a').off();
    }
  });

  QUnit.test('should make a request to get saved menu items', function(assert) {
    var done = assert.async();
    $.ajax = function(options) {
      var deferred = $.Deferred();
      var resp = {"Home": "h"};
      equal(options.url, "/menu-hotkeys");
      options.success(resp);
      return deferred.resolve(resp);
    };
    $('#nav').on('menu-hotkeys-loaded', function () {
      setTimeout(function () {
        equal($('#nav').data('hotkeys').shortcuts["Home"], "h");
        done();
      });
    });
    $('#nav').menuHotkeys({menuHotkeyUrl: '/menu-hotkeys'});
  });

  QUnit.test('should put to update url menu item', function(assert) {
    var done = assert.async();
    $.ajax = function(options) {
      var deferred = $.Deferred();
      var resp = {"Home": "h"};
      options.success(resp);
      return deferred.resolve(resp);
    };
    $('#nav').on('menu-hotkeys-loaded', function () {
      $.ajax = function(options) {
        equal(options.method, "PUT");
        equal(options.url, "/menu-hotkeys/Home");
        done();
      };
      setTimeout(function () {
        $('#nav').data('hotkeys').saveShortcut({name: "Home", hotkey: "o"});
      });
    });
    $('#nav').menuHotkeys({menuHotkeyUrl: '/menu-hotkeys'});
  });
}(jQuery));
