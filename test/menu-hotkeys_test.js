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

  module('jQuery#menuHotkeys', {
    // This will run before each test in this module.
    setup: function(assert) {
      var done = assert.async();
      this.$nav = $('#nav');
      this.$homeMenuItem = $('#home');
      window.localStorage.setItem('MENU_SHORTCUTS', '{"Home": "h"}');
      this.$nav.on('menu-hotkeys-loaded', done);
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

  QUnit.test('should show popover when double clicking link, hide when clicking cancel', function(assert) {
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
    $('#home').click().click();
  });

  QUnit.test('should add indicator to menu item with shortcut', function() {
    equal($('#home > sup:contains("h")').length, 1, 'superscript "h" is present on Home Menu Item');
    equal($('#foo > sup').length, 0, 'no superscript is present on Foo Menu Item');
  });

  QUnit.test('should display error when submitting empty hotkey value', function(assert) {
    var done = assert.async();
    $('#foo').on('hotkey-prompt-open', function () {
      $('.hotkey-input').val('');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Please enter a Shortcut value.');
        done();
      });
    });
    $('#foo').click().click();
  });

  QUnit.test('should display error when submitting hotkey value that already exists', function(assert) {
    var done = assert.async();
    $('#foo').on('hotkey-prompt-open', function () {
      $('.hotkey-input').val('h');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Shortcut already exists for Home.');
        done();
      });
    });
    $('#foo').click().click();
  });

  QUnit.test('should display error when shortcut is longer than one char', function(assert) {
    var done = assert.async();
    $('#foo').on('hotkey-prompt-open', function () {
      $('.hotkey-input').val('foo');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('.hotkey-error-msg').text(), 'Shortcut must be one character long.');
        done();
      });
    });
    $('#foo').click().click();
  });

  QUnit.test('should be able to add a shortcut (hotkey) by entering text into input', function(assert) {
    var done = assert.async();
    $('#foo').on('hotkey-prompt-open', function () {
      $('.hotkey-input').val('f');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('#nav').data('hotkeys').shortcuts["Foo"], "f");
        done();
      });
    });
    $('#foo').click().click();
  });

  QUnit.test('should bind hotkey to document', function(assert) {
    var done = assert.async();
    $('#home').on('click', function () {
      ok(true, 'Home was clicked by hotkey');
      done();
    });
    triggerHotKeyBinding('keydown', 'ctrl+shift+h', 72, ['ctrl', 'shift']);
  });

  QUnit.test('should be able to update existing shortcut which unbinds hotkey', function(assert) {
    var done = assert.async();
    $('#home').on('hotkey-prompt-open', function () {
      equal($('.hotkey-input').val(), 'h');
      $('.hotkey-input').val('o');
      $('.add-shortcut-btn').click();
      setTimeout(function () {
        equal($('#nav').data('hotkeys').shortcuts["Home"], "o");
        triggerHotKeyBinding('keydown', 'ctrl+shift+h', 72, ['ctrl', 'shift']);
        setTimeout(function () {
          done();
        });
      });
    });
    $('#home').click().click();
    $('#home').one('click', function () {
      ok(false, 'Home was clicked with old hotkey');
    });
  });

/*
  test('is awesome', function() {
    expect(1);
    strictEqual(this.elems.menuHotkeys().text(), 'awesome0awesome1awesome2', 'should be awesome');
  });

  module('jQuery.menuHotkeys');

  test('is awesome', function() {
    expect(2);
    strictEqual($.menuHotkeys(), 'awesome.', 'should be awesome');
    strictEqual($.menuHotkeys({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

  module(':menuHotkeys selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is awesome', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':menuHotkeys').get(), this.elems.last().get(), 'knows awesome when it sees it');
  });
*/
}(jQuery));
