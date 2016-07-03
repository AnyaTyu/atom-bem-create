var Dialog = require('./dialog'),
  AtomBemCreate = require('./atom-bem-create');

module.exports = class CreateDialog extends Dialog {
  constructor (path) {
    super({
      prompt: "Enter BEM name",
      select: false
    });
    this._path = path;
  }

  onConfirm (bemName) {
      var result = AtomBemCreate.bemCreate(bemName, this._path);
      if (!result) {
        this.showError('Not valid BEM name! Input [a-z0-9_-] symbols, please!');
      } else {
        this.close();
      }
  }
};
