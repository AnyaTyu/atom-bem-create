/**
 * @typedef {Object} PluralBemEntity
 * @property {String} block
 * @property {String} elem
 * @property {Object} mods
 * @property {Object} elemMods
 */

 /**
  * @typedef {Object} SingleBemEntity
  * @property {String} block
  * @property {String} elem
  * @property {Object} modName
  * @property {Object} modVal
  */

const parse = require('acorn');
const traverse = require('estraverse');
const codegen = require('escodegen');
const bemNaming = require('bem-naming')();
const _ = require('lodash');
const color = require('chalk');

function debug(message) {
  var log = console.log.bind(console, color.blue('debug> ') + message);
  log.apply(null, Array.from(arguments).splice(1))
}

// todo: extract into external npm package
function cursorPositionToOffset(text, cursor) {
  const lines = text.split(/\n/);
  const prelLines = cursor.row;
  const prevOffset = lines.splice(0, prelLines).join('\n').length;

  return prevOffset + cursor.column;
}

// todo: extract into external npm package
/**
 * @param {PluralBemEntity} bemEntity
 * @returns {SingleBemEntity}
 */
function pluralBemEntityToSingle(pluralBemEntity) {
  var singleBemEntity = _.cloneDeep(pluralBemEntity);
  debug('pluralBemEntity', pluralBemEntity);
  if (singleBemEntity.modName) return singleBemEntity;

  ['mods', 'elemMods'].forEach((i)=>{
    if (!singleBemEntity.hasOwnProperty(i)) return;
    for (var j in singleBemEntity[i]) {
      singleBemEntity.modName = j;
      singleBemEntity.modVal = singleBemEntity[i][j]
      break;
    }
    delete singleBemEntity[i];
  });
  return singleBemEntity;
}

function isObject(node) {
  return node.type === 'ObjectExpression';
}

function isBemjson(node) {
  const bemKeys = ['block', 'elem'];
  return !!_(node.properties).map('key.name').intersection(bemKeys).size();
}

var hasToEnlargeLocalTreeSize = false;

function _onNode(node, parent) {
  var bemjson, bemName;
  const bemKeys = ['block', 'elem', 'mods', 'elemMods', 'modName', 'modVal'];
  if (isObject(node)) {
    if (isBemjson(node)) {
        bemjson = JSON.parse(codegen.generate(node, {format:{realjson: true}}));
        bemname = _(bemjson).pick(bemKeys);
        return bemname.size() && pluralBemEntityToSingle(bemname.value())
    } else {
      if (!parent) {
        hasToEnlargeLocalTreeSize = true;
      } else {
        return _onNode(parent, null);
      }
    }
  }
}

function retrieveBemEntity (fileContent, offset, options) {
  const canEnlarge = options && options.canEnlarge !== false || !options;

  return new Promise(function (res, err) {
    const ast = parse.parseExpressionAt(fileContent, offset);
    traverse.traverse(ast, {enter: function (node, parent) {
      const bemEntity = _onNode(node, parent);
      if (bemEntity) res(bemEntity), this.break();
    }, onEnd: function () {
      res(hasToEnlargeLocalTreeSize && canEnlarge ? 'enlarge' : null);
    }});
  })
  .catch(e=> {
    if (e instanceof SyntaxError) {
      debug('fix> fileContent %d: «%s» (%s)', e.pos, fileContent[e.pos], e.message)
      if (fileContent.length > e.pos) {
        const newFileContent = fileContent.substr(0, e.pos);
        debug('fix> newFileContent', newFileContent.substr(offset))
        return retrieveBemEntity(newFileContent, offset)
      }
    }
    return e;
  })
}

function retrieveBemEntityByCursor (fileContent, cursor) {
  const cursorOffset = cursorPositionToOffset(fileContent, cursor);
  debug('cursor:', cursor, ', cursor offset:', cursorOffset)
  const offset = findNearLeftCurlyOpenPos(fileContent, cursorOffset);
  debug('bem entity offset', offset)

  return retrieveBemEntity(fileContent, offset)
  .then((res) => {
    // if BemJson not found, enlarge local tree up to next {} once
    if (res === 'enlarge') {
      // {block:'block1', elem:'elem1', content: {block:'b'}}
      // ^-- SECOND_{                  FIRST_{ --^    ^-- CURSOR
      // SECOND(FIRST(CURSOR) - 1)
      const nextOffset = findNearLeftCurlyOpenPos(fileContent, offset - 1);
      return retrieveBemEntity(fileContent, nextOffset, {canEnlarge: false})
    } else {
      return res;
    }
  })
}

function findNearLeftCurlyOpenPos(fileContent, offset) {
  return fileContent.substr(0, offset).lastIndexOf('{');
}

module.exports = retrieveBemEntityByCursor;
