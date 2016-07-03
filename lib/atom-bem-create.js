const CompositeDisposable = require('atom').CompositeDisposable;
const notify = require('atom-notify');
const jQuery = require('jquery');

module.exports = {
    subscriptions: null,

    activate: function() {
        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-bem-create:create': () => {
                return this.create();
            },
            'atom-bem-create:createModal': () => {
                return this.createModal();
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
        const editor = atom.workspace.getActiveTextEditor(),
          isBemjsonFound = false;

        if (!editor) return;

        if (isBemjsonFound) {

        } else {
          let selection = editor.getSelectedText();

          const caretPos = editor.getCursorBufferPosition();
          const rangeBeforeCaret = [[0, caretPos.row], caretPos];
          const lineText = editor.lineTextForBufferRow(caretPos.row);
          const textBeforeCaret = lineText
                .substr(0, caretPos.column)
                .replace(/^.*[^a-zA-Z0-9_\-]/, ''),
          const textAfterCaret = lineText
                .substr(caretPos.column)
                .replace(/[^a-zA-Z0-9_\-].*$/, '');

          (!selection) && selection += textBeforeCaret + textAfterCaret;
        }

        this.bemCreate(selection, editor.getPath());
    },

    bemCreate: function (bemName, path) {
      const bemNaming = require('bem-naming');
      const editor = atom.workspace.getActiveTextEditor();
      const naming = bemNaming();
      const notifier = notify("");
      const bemToolsCreate = function(){console.log('bemCreate', bemName); return true;};
          // todo: bemCreate = require('bem-tools-create');
      (naming.validate(bemName)) ?
        notifier.addSuccess("Sucsess created - " + bemName) :
        notifier.addWarning("Error bem naming - " + bemName)

        return naming.validate(bemName)
          && bemToolsCreate([naming.parse(bemName)], [path], ['css', 'js']);
    },

    createModal: function() {
      const path = jQuery('.selected')[0].getPath();
      const CreateDialog = require('./create-dialog');
      new CreateDialog(path).attach();
    }
};
