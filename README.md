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

## Events

Event Name          | Description                                 | Arguments
--------------------| ------------------------------------------- | ----------

## To Do
- Fix running tests from command line
- Add ability to delete shortcut
- Refactor code (right now it is a hack job)
- Create a better demo
- Update README
  - Add Images to describe how it works
