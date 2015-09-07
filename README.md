# Menu Hotkeys

Quickly add keyboard hotkeys (shortcuts) to HTML menu items.  Dependent on [jQuery Hotkeys](https://github.com/jeresig/jquery.hotkeys).

## How it Works

### Double Click Menu Item to Add a Hotkey



## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.min.js
[max]: https://raw.github.com/jonmbake/menu-hotkeys/master/dist/menu-hotkeys.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/menu-hotkeys.min.js"></script>
<script>
  $('.nav').menuHotkeys();
</script>
```

## Events

Event Name          | Description                                 | Arguments
--------------------| ------------------------------------------- | ----------

## To Do

- Document Code
- Create a better demo
- Update README
  - Add Images to describe how it works
  - Describe Options
  - Describe Events
- Should only attach to first link under nav
- Add ability to delete shortcut
