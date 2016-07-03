var CompositeDisposable = require('atom').CompositeDisposable,
  notify = require('atom-notify')
  jQuery = require('jquery');

module.exports = {
    subscriptions: null,

    activate: function(state) {
        var _this = this;

        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-bem-create:create': function() {
                return _this.create();
            },
            'atom-bem-create:createModal': function() {
                return _this.createModal();
            }
        }));

        atom.contextMenu.itemSets.push({
          items:[
            { type: 'separator' },
            { 'label': 'bem-create', 'command': 'atom-bem-create:createModal' },
            { type: 'separator' }
          ],
          selector: '.tree-view.full-menu .project-root'
        });

        return this.subscriptions;
    },
    deactivate: function() {
        return this.subscriptions.dispose();
    },
    create: function() {
        var editor = atom.workspace.getActiveTextEditor(),
          isBemjsonFound = false;

        if (!editor) return;

        if (isBemjsonFound) {

        } else {
          var selection = editor.getSelectedText(),
              caretPos = editor.getCursorBufferPosition(),
              rangeBeforeCaret = [[0, caretPos.row], caretPos],
              lineText = editor.lineTextForBufferRow(caretPos.row),
              textBeforeCaret = lineText
                .substr(0, caretPos.column)
                .replace(/^.*[^a-zA-Z0-9_\-]/, ''),
              textAfterCaret = lineText
                .substr(caretPos.column)
                .replace(/[^a-zA-Z0-9_\-].*$/, '');

          if (!selection) {
               selection += textBeforeCaret + textAfterCaret;
          }
        }

        this.bemCreate(selection, editor.getPath());
    },

    bemCreate: function (bemName, path) {
      var bemNaming = require('bem-naming'),
          editor = atom.workspace.getActiveTextEditor(),
          naming = bemNaming(),
          notifier = notify(""),
          bemToolsCreate = function(){console.log('bemCreate', bemName); return true;};
          // todo: bemCreate = require('bem-tools-create');
          if (naming.validate(bemName)) {
              notifier.addSuccess("Sucsess created - " + bemName)
          } else {
              notifier.addWarning("Error bem naming - " + bemName)
          }
        return naming.validate(bemName)
          && bemToolsCreate([naming.parse(bemName)], [path], ['css', 'js']);
    },

    createModal: function() {
      var path = jQuery('.selected')[0].getPath();
      var CreateDialog = require('./create-dialog');
      new CreateDialog(path).attach();
    }
};
