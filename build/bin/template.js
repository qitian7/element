const path = require('path');
const templates = path.resolve(process.cwd(), './examples/pages/template');

const chokidar = require('chokidar');
let watcher = chokidar.watch([templates]);

watcher.on('ready', function() {
  watcher
    .on('change', function() {
      exec('npm run i18n');
    });
});

/** 监听i18n模板: 如果模板发生变化, 则重新, 编译npm run i18n 生成对应的多语言版本
 */

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}
