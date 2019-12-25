// 异步函数
const fs = require('mz/fs');

// a simple async function:
module.exports = async () => {
  let expression = await fs.readFile('./basic/mocha/async.txt', 'utf-8');
  // 通过 new Function 创建一个构造函数
  let fn = new Function('return ' + expression);
  let r = fn();
  console.log(`Calculate: ${expression} = ${r}`);
  return r;
}