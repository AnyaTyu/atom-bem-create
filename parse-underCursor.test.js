const Test = require('./test');

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

const test = Test(fileContent);

Promise.resolve()
.then(()=>{test(fileContent, {row: 2, column: 22}, 'block1__elem1')})
.then(()=>{test(fileContent, {row: 5, column: 32}, 'block3__elem3')})
.then(()=>{test(fileContent, {row: 7, column: 52}, 'b__foobar_foo_bar')})
.then(()=>{test(fileContent, {row: 7, column: 42}, 'b__foobar_foo_bar')})
.then(()=>{test(fileContent, {row: 8, column: 42}, 'bb__baz_qux')})
.then(()=>{test(fileContent, {row: 1, column: 1}, '')})
.catch(test.error)
