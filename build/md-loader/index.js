const {
  stripScript,
  stripTemplate,
  genInlineComponentText
} = require('./util');
const md = require('./config');

module.exports = function(source) {
  const content = md.render(source); // 把 md格式 转换成 html格式, 例子见 ./popconfirm.html
  // console.log('------------------------------------------', content)

  const startTag = '<!--element-demo:'; // el全局组件解析出来的代码
  const startTagLen = startTag.length;
  const endTag = ':element-demo-->';
  const endTagLen = endTag.length;

  let componenetsString = '';
  let id = 0; // demo 的 id
  let output = []; // 输出的内容
  let start = 0; // 字符串开始位置

  let commentStart = content.indexOf(startTag);
  let commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  while (commentStart !== -1 && commentEnd !== -1) {
    output.push(content.slice(start, commentStart));

    // 拿到 vue 需要解析的代码: 比如: <template> <el-popconfirm ....</el-popconfirm></template>
    const commentContent = content.slice(commentStart + startTagLen, commentEnd);
    // 去掉 script|style 标签(及里面的内容)
    const html = stripTemplate(commentContent);
    // 只去掉script标签(保留内容)
    const script = stripScript(commentContent);

    // 用vue-loader提供的方法, 把vue语法的html模板, 转成  render函数可以渲染的样子,
    // 如 ./popconfirm.html内的 111111
    let demoComponentContent = genInlineComponentText(html, script);
    const demoComponentName = `element-demo${id}`;
    output.push(`<template slot="source"><${demoComponentName} /></template>`);
    componenetsString += `${JSON.stringify(demoComponentName)}: ${demoComponentContent},`;

    // 重新计算下一次的位置
    id++;
    start = commentEnd + endTagLen;
    commentStart = content.indexOf(startTag, start);
    commentEnd = content.indexOf(endTag, commentStart + startTagLen);
  }

  // console.log(11111111, componenetsString)
  // 仅允许在 demo 不存在时，才可以在 Markdown 中写 script 标签
  // todo: 优化这段逻辑
  let pageScript = '';
  if (componenetsString) {
    pageScript = `<script>
      export default {
        name: 'component-doc',
        components: {
          ${componenetsString}
        }
      }
    </script>`;
  } else if (content.indexOf('<script>') === 0) { // 硬编码，有待改善
    start = content.indexOf('</script>') + '</script>'.length;
    pageScript = content.slice(0, start);
  }

  output.push(content.slice(start));
  // console.log(2222222, pageScript)
  // console.log(333333, output)
  return `
    <template>
      <section class="content element-doc">
        ${output.join('')}
      </section>
    </template>
    ${pageScript}
  `;
};
