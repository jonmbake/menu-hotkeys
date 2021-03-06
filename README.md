# Menu Hotkeys

Quickly add hotkeys (keyboard shortcuts) to HTML menu items.

**[Demo](http://jonmbake.github.io/menu-hotkeys/demo.html)**

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.min.js
[max]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.js

## How it Works

### 1) Hold Down Alt and Click a Menu Item to Add a Hotkey &#916;

![Hotkey Prompt](https://raw.githubusercontent.com/jonmbake/screenshots/master/menu-hotkeys/hotkeys_dbl_click.png)

*Enter your hotkey.*

&#916; *Shift-Alt-Click* on Linux

### 2) Click *Add* to Add the Hotkey to the Menu Item

![Hotkey Indicator](https://raw.githubusercontent.com/jonmbake/screenshots/master/menu-hotkeys/hotkeys_indicator.png)

*After clicking the Add Button, the Hotkey will be added and an Indicator will appear.*&nbsp;&nbsp;&nbsp;

### 3) Typing the Keyboard Shortcut Will Now Navigate to the Page

![Typing Shortcut](https://raw.githubusercontent.com/jonmbake/screenshots/master/menu-hotkeys/hotkeys_keyboard.png)

![Typing Shortcut](https://raw.githubusercontent.com/jonmbake/screenshots/master/menu-hotkeys/hotkeys_nav.png)&nbsp;&nbsp;&nbsp;

## Dependencies

- [jQuery Hotkeys](https://github.com/jeresig/jquery.hotkeys) (Included in source)
- [Bootstrap Popover JS and CSS](https://github.com/twbs/bootstrap) &Delta;

&Delta; Hope to remove this dependency in the near future

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.min.js
[max]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="bootstrap-popover.js"></script>
<script src="dist/menu-hotkeys.min.js"></script>
<script>
  $('#nav').menuHotkeys();
</script>
```

Any nested links under the *#nav* will get the ability to have hotkeys assigned.

## Options

Option Name          | Description | Default Value
---------------------|------------ | -------------
hotkeyPrefix         | Starting keyboard sequence for all hotkeys. | alt
menuHotkeyUrl | URL to *GET* persisted shortcuts from and *PUT* to save | *None*

Note: menuHotkeyUrl will *PUT* to *menuHotkeyUrl/{menuItemName}*

**Note on choosing a hotkeyPrefix**: Make sure to pick some that is not going to conflict with OS or browser shortcuts!

Example:

```html
<script>
  $('#nav').menuHotkeys({
    hotkeyPrefix: 'alt',
    menuHotkeyUrl: 'https://localhost/menu-hotkeys'
  });
</script>

```

## Events

This is the list of events that are fired when certain action happen:

Event Name          | Action                                 | Arguments
--------------------| ------------------------------------------- | ----------
menu-hotkeys-loaded | When the persisted hotkeys are loaded | Array of Objects with name and hotkey properties
menu-hotkey-input-open | When Hotkey Input Prompt opens. | *None*
menu-hotkey-input-close | When Hotkey Input Prompt closes. | *None*
menu-hotkey-input-error | When Hotkey Input Prompt has an input error. | error menu-hotkey-updated | When hotkey is updated | Object with name and hotkey properties

# Version History

Version             | Features                                    |
--------------------| ------------------------------------------- |
[0.2.0](https://github.com/jonmbake/menu-hotkeys/tree/0.2.0)               | Added abiltiy to remove shortcuts           |
[0.1.0](https://github.com/jonmbake/menu-hotkeys/tree/0.1.0) | Init                                        |

## To Do

- Should only attach to first link under nav
