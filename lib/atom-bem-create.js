var CompositeDisposable = require('atom').CompositeDisposable,
  jQuery = require('jquery');

module.exports = {
    subscriptions: null,
    activate: function(state) {
        var _this = this;

        this.subscriptions = new CompositeDisposable;
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-bem-create:create': function() {
                return _this.create();
            }
        }));

        return this.subscriptions;
    },
    deactivate: function() {
        return this.subscriptions.dispose();
    },
    create: function() {
        var editor = atom.workspace.getActiveTextEditor();

        if (!editor) return;

        var bemNaming = require('bem-naming'),
            naming = bemNaming(),
            //todo: bemCreate = require('bem-tools-create'),
            bemCreate = function(){
              console.log('bem-create', arguments);
            },
            selection = editor.getSelectedText(),
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

        // console.log('selection', selection, naming.validate(selection));
        naming.validate(selection) && bemCreate([naming.parse(selection)], ['.'], ['css', 'js']);
    }

    getEntities: function(selection) {
        if (selection.indexOf(':') < 0) return naming.parse(selection);

        var bemjson;
        try {
            bemjson = require('vm').runInNewContext('(' + selection + ')');
        } catch(err) {}

        return bemjson && bemjson2decl.convert(bemjson);
    }
};
