var CompositeDisposable = require('atom').CompositeDisposable,
  jQuery = require('jquery');

module.exports = {
    subscriptions: null,

    initialize: function () {
      console.log('initialize', arguments);
    },

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

        // TODO: moved to init section
        atom.contextMenu.itemSets.push({
          items:[
            { type: 'separator' },
            { 'label': 'bem-create', 'command': 'atom-bem-create:createModal' },
            { type: 'separator' }
          ],
          selector: '.tree-view.full-menu .project-root > .header'
        });

        return this.subscriptions;
    },
    deactivate: function() {
        return this.subscriptions.dispose();
    },
    create: function() {
        var editor = atom.workspace.getActiveTextEditor();

        if (!editor) return;

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

        this.bemCreate(selection);
    },

    bemCreate: function (bemName) {
      //todo: bemCreate = require('bem-tools-create'),
      var bemNaming = require('bem-naming'),
          naming = bemNaming(),
          bemCreate = function(){console.log('bem-create', arguments);};

      if (naming.validate(bemName)) {
        bemCreate([naming.parse(bemName)], ['.'], ['css', 'js']);
        return true;
      } else {
        return false;
      }
    },

    createModal: function() {
      var CreateDialog = require('./create-dialog');
      new CreateDialog().attach();
    },

    getEntities: function(selection) {
        if (selection.indexOf(':') < 0) return naming.parse(selection);

        var bemjson;
        try {
            bemjson = require('vm').runInNewContext('(' + selection + ')');
        } catch(err) {}

        return bemjson && bemjson2decl.convert(bemjson);
    }
};
