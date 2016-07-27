const CompositeDisposable = require('atom').CompositeDisposable;
const notify = require('atom-notify');
const jQuery = require('jquery');
const parse = require('./parse');

const bemToolsCreate = function(bemName, path){console.log('bemCreate', JSON.stringify(bemName), path); return true;};
// todo: bemToolsCreate = require('bem-tools-create');

const naming = require('bem-naming')();
const notifier = notify('');


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
        const editor = atom.workspace.getActiveTextEditor();
        const caretPos = editor.getCursorBufferPosition();
        const path = editor.getPath();

        let selection = editor.getSelectedText();

        if (selection) {
          parse.fromSelection(selection).then((entity) => {
              this.bemCreate(entity || selection, path);
            })
        } else {
          parse.underCursor(editor.getText(), caretPos).then((entity) => {
            this.bemCreate(
              entity || editor.getWordUnderCursor({wordRegex:/[a-z0-9_-]+/i}),
              path
            );
          })
        }
    },

    bemCreate: function (bemName, path) {
      var bemEntity = (() => {
        if (typeof bemName == 'string') {
          if (naming.validate(bemName)) return naming.parse(bemName);
          else notifier.addWarning('Error: Block not created\nBlock name: ' + JSON.stringify(bemName));
        }

        return bemName;
      })();

      bemToolsCreate([bemEntity], [path], ['css', 'js']);
      notifier.addSuccess('Sucsess: Block created\nBlock name: ' + JSON.stringify(bemName))
    },

    createModal: function() {
      const path = jQuery('.selected')[0].getPath();
      const CreateDialog = require('./create-dialog');
      new CreateDialog(path).attach();
    }
};
