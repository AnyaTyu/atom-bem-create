const retrieveBemEntity = require('./lib/parse');
const assert = require('assert');
const color = require('chalk');
const parse = require('acorn');
const bemNaming = require('bem-naming')();
const _ = require('lodash');

function debug(message) {
  var log = console.log.bind(console, color.blue('debug> ') + message);
  log.apply(null, Array.from(arguments).splice(1))
}

/*
_________ _______  _______ _________ _______
\__   __/(  ____ \(  ____ \\__   __/(  ____ \
   ) (   | (    \/| (    \/   ) (   | (    \/
   | |   | (__    | (_____    | |   | (_____
   | |   |  __)   (_____  )   | |   (_____  )
   | |   | (            ) |   | |         ) |
   | |   | (____/\/\____) |   | |   /\____) |
   )_(   (_______/\_______)   )_(   \_______)

*/

const fileContent = `function foo (){
  const i = 0;
  const o = {block:'block1', elem:'elem1', content: {block:'b'}, mix:[{elem:'mix1'}]},
      q;
  console.log(({block: 'block2'}).block);
  console.log(({block: 'block3', // multiline bemjson
    elem: 'elem3'}).block);
    // { block: 'b', elem: "foobar", elemMods: {foo:'bar'} }
    // '{ block: "bb", elem: "baz", modName: "qux" }' // <-- working snippet
}`;

function test(fileContent, cursor, expectedBemString) {
  retrieveBemEntity.underCursor(fileContent, cursor)
  .then(bn => {
    const bemString = bn && bemNaming.stringify(bn);
    expectedBemString && assert.equal(bemString, expectedBemString, 'bem entity string is changed');
    setTimeout(()=>console.log(color.green.bold('result>') + ' bem entity:', bn, ', bem class:', bn && bemNaming.stringify(bn)),0)
  })
  .catch(e=> setTimeout(()=>debug(color.red('err>'), e), 0))

}

console.log(color.red('Run tests...'), 'for test file', '\n' + color.black.bold(fileContent))

Promise.resolve()
.then(()=>{test(fileContent, {row: 2, column: 22}, 'block1__elem1')})
.then(()=>{test(fileContent, {row: 5, column: 32}, 'block3__elem3')})
.then(()=>{test(fileContent, {row: 7, column: 52}, 'b__foobar_foo_bar')})
.then(()=>{test(fileContent, {row: 7, column: 42}, 'b__foobar_foo_bar')})
.then(()=>{test(fileContent, {row: 8, column: 42}, 'bb__baz_qux')})
.then(()=>{test(fileContent, {row: 1, column: 1}, '')})
.catch(e=>{setTimeout(()=>debug(color.red('err>'), e), 0)})
