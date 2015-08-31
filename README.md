**Note: This is a work in process.  It is not completed yet!**

# Menu Hotkeys

Quickly add keyboard hotkeys (keyboard shortcuts) to HTML menu items.  Dependent on [jQuery Hotkeys](https://github.com/jeresig/jquery.hotkeys).

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.min.js
[max]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/menu-hotkeys.min.js"></script>
<script>
  $('.nav').menu_hotkeys();
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_

## To Do
- Fix running tests from command line
- Add bootstrap popover dependency (both CSS/JS)
- Popover input should be populated with existing shortcut
- Add indicator to menu item text when a shortcut is present
- Entering keyboard shortcut should navigate to page !!major feature
- Add ability to delete shortcut
- Detect side or top menu and place the pop over accordingly
- Refactor code (right now it is a hack job)
- Create a better demo (maybe 2- one for top menu, one for side)
- Update README
  - Add Images to describe how it works
