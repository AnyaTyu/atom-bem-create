var Dialog = require('./dialog'),
  AtomBemCreate = require('./atom-bem-create');

module.exports = class CreateDialog extends Dialog {
  constructor () {
    super({
      prompt: "Enter BEM name",
      select: false
    });
  }

  onConfirm (bemName) {
      // @showError("You must open a directory to create a file with a relative path")
      console.log(bemName);
      AtomBemCreate.bemCreate(bemName);
      this.close();
  }
};
