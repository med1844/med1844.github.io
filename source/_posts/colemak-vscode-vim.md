---
title: Using colemak with vscode vim
date: 2021-11-30 20:10:37
tags: 键盘
---

This article will be written in English to help international visitors.

## Overriding vscode vim key bindings

The following snippet would generate key binding that can be pasted to `settings.json`:

```python
QWERTY = "qwertyuiopasdfghjkl;zxcvbnm,."


def gen_langmap_vimrc(current_layout):
    return "set langmap=%s" % ",".join(b + a for a, b in zip(QWERTY, current_layout) if a != b)


def gen_langmap_vscode(current_layout):
    mapping = []
    for a, b in zip(QWERTY, current_layout):
        if a != b:
            mapping.append({"before": [b], "after": [a]})
            mapping.append({"before": [b.upper()], "after": [a.upper()]})
            # mapping.append({"before": ["<C-%s>" % b], "after": ["<C-%s>" % a]})

    return {"vim.normalModeKeyBindingsNonRecursive": mapping, "vim.visualModeKeyBindingsNonRecursive": mapping}


colemak = "qwfpbjluy;arstgmneiozxcdvkh,."
print(gen_langmap_vscode(colemak))

```

I used **colemak dhm** to generate the key bindings. You might want to change the snippet to generate mappings of the layout you are using. Simply changing the input of `gen_langmap_vscode` should work.

Here's it's output:

```json
"vim.normalModeKeyBindingsNonRecursive": [{"before": ["f"], "after": ["e"]}, {"before": ["F"], "after": ["E"]}, {"before": ["p"], "after": ["r"]}, {"before": ["P"], "after": ["R"]}, {"before": ["b"], "after": ["t"]}, {"before": ["B"], "after": ["T"]}, {"before": ["j"], "after": ["y"]}, {"before": ["J"], "after": ["Y"]}, {"before": ["l"], "after": ["u"]}, {"before": ["L"], "after": ["U"]}, {"before": ["u"], "after": ["i"]}, {"before": ["U"], "after": ["I"]}, {"before": ["y"], "after": ["o"]}, {"before": ["Y"], "after": ["O"]}, {"before": [";"], "after": ["p"]}, {"before": [";"], "after": ["P"]}, {"before": ["r"], "after": ["s"]}, {"before": ["R"], "after": ["S"]}, {"before": ["s"], "after": ["d"]}, {"before": ["S"], "after": ["D"]}, {"before": ["t"], "after": ["f"]}, {"before": ["T"], "after": ["F"]}, {"before": ["m"], "after": ["h"]}, {"before": ["M"], "after": ["H"]}, {"before": ["n"], "after": ["j"]}, {"before": ["N"], "after": ["J"]}, {"before": ["e"], "after": ["k"]}, {"before": ["E"], "after": ["K"]}, {"before": ["i"], "after": ["l"]}, {"before": ["I"], "after": ["L"]}, {"before": ["o"], "after": [";"]}, {"before": ["O"], "after": [";"]}, {"before": ["d"], "after": ["v"]}, {"before": ["D"], "after": ["V"]}, {"before": ["v"], "after": ["b"]}, {"before": ["V"], "after": ["B"]}, {"before": ["k"], "after": ["n"]}, {"before": ["K"], "after": ["N"]}, {"before": ["h"], "after": ["m"]}, {"before": ["H"], "after": ["M"]}], "vim.visualModeKeyBindingsNonRecursive": [{"before": ["f"], "after": ["e"]}, {"before": ["F"], "after": ["E"]}, {"before": ["p"], "after": ["r"]}, {"before": ["P"], "after": ["R"]}, {"before": ["b"], "after": ["t"]}, {"before": ["B"], "after": ["T"]}, {"before": ["j"], "after": ["y"]}, {"before": ["J"], "after": ["Y"]}, {"before": ["l"], "after": ["u"]}, {"before": ["L"], "after": ["U"]}, {"before": ["u"], "after": ["i"]}, {"before": ["U"], "after": ["I"]}, {"before": ["y"], "after": ["o"]}, {"before": ["Y"], "after": ["O"]}, {"before": [";"], "after": ["p"]}, {"before": [";"], "after": ["P"]}, {"before": ["r"], "after": ["s"]}, {"before": ["R"], "after": ["S"]}, {"before": ["s"], "after": ["d"]}, {"before": ["S"], "after": ["D"]}, {"before": ["t"], "after": ["f"]}, {"before": ["T"], "after": ["F"]}, {"before": ["m"], "after": ["h"]}, {"before": ["M"], "after": ["H"]}, {"before": ["n"], "after": ["j"]}, {"before": ["N"], "after": ["J"]}, {"before": ["e"], "after": ["k"]}, {"before": ["E"], "after": ["K"]}, {"before": ["i"], "after": ["l"]}, {"before": ["I"], "after": ["L"]}, {"before": ["o"], "after": [";"]}, {"before": ["O"], "after": [";"]}, {"before": ["d"], "after": ["v"]}, {"before": ["D"], "after": ["V"]}, {"before": ["v"], "after": ["b"]}, {"before": ["V"], "after": ["B"]}, {"before": ["k"], "after": ["n"]}, {"before": ["K"], "after": ["N"]}, {"before": ["h"], "after": ["m"]}, {"before": ["H"], "after": ["M"]}]
```

## Handling controls

We need to override vscode key bindings to make sure keys with controls in it (like visual block `<C-v>` and redo `<C-r>`) are mapped to corresponding vscode vim functions. Add this into `keybindings.json`:

```json
  {
    "key": "ctrl+s",
    "command": "-workbench.action.files.save"
  },
  {
    "key": "ctrl+l",
    "command": "-extension.vim_navigateCtrlL",
    "when": "editorTextFocus && vim.active && vim.use<C-l> && !inDebugRepl"
  },
  {
    "key": "ctrl+l",
    "command": "-expandLineSelection",
    "when": "textInputFocus"
  },
  {
    "key": "ctrl+s",
    "command": "extension.vim_ctrl+d",
    "when": "editorTextFocus && vim.active && !inDebugRepl"
  },
  {
    "key": "ctrl+s",
    "command": "list.focusPageDown",
    "when": "listFocus && !inputFocus"
  },
  {
    "key": "ctrl+l",
    "command": "extension.vim_ctrl+u",
    "when": "editorTextFocus && vim.active && !inDebugRepl"
  },
  {
    "key": "ctrl+l",
    "command": "list.focusPageUp",
    "when": "listFocus && !inputFocus"
  },
  {
    "key": "ctrl+p",
    "command": "-workbench.action.quickOpen"
  },
  {
    "key": "ctrl+p",
    "command": "extension.vim_ctrl+r",
    "when": "editorTextFocus && vim.active && vim.use<C-r> && !inDebugRepl"
  },
  {
    "key": "ctrl+d",
    "command": "extension.vim_ctrl+v",
    "when": "editorTextFocus && vim.active && vim.use<C-v> && !inDebugRepl"
  }
```

Again, these keys are totally changed based on **colemak-dhm**. You might need to change keys above to fit your needs.

This might be, again, done by parsing `package.json` and be automatically generated.
