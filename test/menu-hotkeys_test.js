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

  module('jQuery#menu_hotkeys', {
    // This will run before each test in this module.
    setup: function() {
      this.$nav = $('#nav');
      this.$homeMenuItem = $('#home');
      window.localStorage.setItem('MENU_SHORTCUTS', '{"Home": "h"}');
      this.$nav.menu_hotkeys();
    },
    teardown: function() {
      $(document).unbind();
      window.localStorage.clear('MENU_SHORTCUTS');
      this.$nav.removeData('hotkeys');
    }
  });

  asyncTest('should show/hide popover when double clicking link', function() {
    expect(2);
    stop(1);
    $('#home').on('inserted.bs.popover', function () {
      ok(true, 'Popover is showing');
      setTimeout(function() {
        $('.cancel-shortcut-btn').click();
        start();
      });
    });
    $('#home').on('hidden.bs.popover', function () {
      ok(true, 'Popover is hiden');
      start();
    });
    $('#home').click().click();
  });
/*
  asyncTest('should display error when input is empty, same shortcut already exist or shortcut is more than one char', function() {
    expect(1);
      $('#foo-menu-item').on('menu-hotkey-input-error', function () {
        equal($('.hotkey-error-msg').text(), 'Please enter a Shortcut value.');
        start();
      });
      $('#foo-menu-item').click().click();
      $('.hotkey-input').val('');
      $('.add-shortcut-btn').click();
      /*
      $('.hotkey-input').val('h');
      $('.add-shortcut-btn').click();
      equal($('.hotkey-error-msg').text(), 'Shortcut already exists for Home.');
      $('.hotkey-input').val('foo');
      $('.add-shortcut-btn').click();
      equal($('.hotkey-error-msg').text(), 'Shortcut must be one character long.');
      start();

  });

  asyncTest('should be able to add a shortcut (hotkey) by entering text into input', function() {
    expect(2);
    $('#foo-menu-item').click().click();
    setTimeout(function() {
      equal($('#foo-menu-item').next('div.popover:visible').length, 1, 'Popover is showing');
      $('.hotkey-input').val('f');
      $('.add-shortcut-btn').click();
      equal($('#nav').data('hotkeys').shortcuts["Foo"], "f");
      start();
    }, 1000);
  });

  asyncTest('should be able to edit an existing shortcut (hotkey)', function() {
    expect(2);
    $('#home').click().click();
    setTimeout(function() {
      equal($('.hotkey-input').val(), 'h');
      $('.hotkey-input').val('o');
      $('.add-shortcut-btn').click();
      equal($('#nav').data('hotkeys').shortcuts["Home"], "o");
      start();
    }, 1000);
  });

  asyncTest('should bind hotkey to document', function() {
    expect(1);
    $('#home').on('click', function () {
      ok(true, 'Event was fired');
    });
    setTimeout(function() {
      triggerHotKeyBinding('keydown', 'ctrl+shift+h', 72, ['ctrl', 'shift']);
      start();
    }, 500);
  });

  test('is awesome', function() {
    expect(1);
    strictEqual(this.elems.menu_hotkeys().text(), 'awesome0awesome1awesome2', 'should be awesome');
  });

  module('jQuery.menu_hotkeys');

  test('is awesome', function() {
    expect(2);
    strictEqual($.menu_hotkeys(), 'awesome.', 'should be awesome');
    strictEqual($.menu_hotkeys({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

  module(':menu_hotkeys selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is awesome', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':menu_hotkeys').get(), this.elems.last().get(), 'knows awesome when it sees it');
  });
*/
}(jQuery));
