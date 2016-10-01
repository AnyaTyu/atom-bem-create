const CompositeDisposable = require('atom').CompositeDisposable;
const notifier = require('atom-notify')('');
const $ = sel => document.querySelector(sel)
const parse = require('./parse');

// todo: bemToolsCreate = require('bem-tools-create');
const bemToolsCreate = (bemName, path) => {
    console.log('bemCreate', JSON.stringify(bemName), path);
    return JSON.stringify(bemName);
};

const naming = require('bem-naming')();

module.exports = {
    subscriptions: null, //For example, `b1__elem1` or `{ block: 'b1', elem: 'e1' }` will create following folders and files

    activate: function () {
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
            items: [
                {type: 'separator'},
                {'label': 'bem-create', 'command': 'atom-bem-create:createModal'},
                {type: 'separator'}
            ],
            selector: '.tree-view.full-menu .project-root'
        });

        return this.subscriptions;
    },
    deactivate: function () {
        return this.subscriptions.dispose();
    },
    create: function () {
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
                    entity || editor.getWordUnderCursor({wordRegex: /[a-z0-9_-]+/i}),
                    path
                );
            })
        }
    },

    bemCreate: function (bemName, path) {
        const bemEntity = (typeof bemName == 'string') ? bemName : naming.stringify(bemName);

        var rx = /\.{.*}/;
        const nameEntity = bemEntity.replace(rx, '');
        const tech = (bemEntity.match(rx) || [])[0];

        if (naming.validate(nameEntity)) {
            notifier.addSuccess(
                'Success: Block created\nBlock name: ' + nameEntity + '\nWith tech: ' + (tech ? tech.match(/\.{(.+)}/)[1] : 'all tech')
            );

            return bemToolsCreate([bemEntity], [path])
        } else {
            return null;
        }
    },

    createModal: function () {
        const path = $('.tree-view .list-item.selected').getPath();
        const CreateDialog = require('./create-dialog');
        new CreateDialog(path).attach();
    }
};
