const { compileTemplate } = require('@vue/component-compiler-utils');
const compiler = require('vue-template-compiler');

function stripScript(content) {
  // content = '     <script> var a = 123 </script>'
  // content.match(/<(script)>([\s\S]+)<\/\1>/);
  // 0: "<script> var a = 123 </script>"
  // 1: "script"
  // 2: " var a = 123 "
  const result = content.match(/<(script)>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : '';
}

function stripStyle(content) {
  const result = content.match(/<(style)\s*>([\s\S]+)<\/\1>/);
  return result && result[2] ? result[2].trim() : '';
}

// 编写例子时不一定有 template。所以采取的方案是剔除其他的内容
function stripTemplate(content) {
  content = content.trim();
  if (!content) {
    return content;
  }
  // content = '     <script> var a = 123 </script>'
  // content.replace(/<(script|style)[\s\S]+<\/\1>/g, '').trim();
  // 结果: ""
  return content.replace(/<(script|style)[\s\S]+<\/\1>/g, '').trim();
}

function pad(source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n');
}

function genInlineComponentText(template, script) {
  // https://github.com/vuejs/vue-loader/blob/423b8341ab368c2117931e909e2da9af74503635/lib/loaders/templateLoader.js#L46
  const finalOptions = {
    source: `<div>${template}</div>`,
    filename: 'inline-component', // TODO：这里有待调整
    compiler
  };
  const compiled = compileTemplate(finalOptions);
  // tips
  if (compiled.tips && compiled.tips.length) {
    compiled.tips.forEach(tip => {
      console.warn(tip);
    });
  }
  // errors
  if (compiled.errors && compiled.errors.length) {
    console.error(
      `\n  Error compiling template:\n${pad(compiled.source)}\n` +
        compiled.errors.map(e => `  - ${e}`).join('\n') +
        '\n'
    );
  }
  // 用vue-loader提供的方法, 把我们的模板渲染成 底层 render 可以渲染的格式,  例如:
  // var render = function() {
  //   var _vm = this
  //   var _h = _vm.$createElement
  //   var _c = _vm._self._c || _h
  //   return _c(
  //     "div",
  //     [
  //       [
  //         _c(
  //           "el-popconfirm",
  //           { attrs: { title: "这是一段内容确定删除吗？" } },
  //           [
  //             _c(
  //               "el-button",
  //               { attrs: { slot: "reference" }, slot: "reference" },
  //               [_vm._v("删除")]
  //             )
  //           ],
  //           1
  //         )
  //       ]
  //     ],
  //     2
  //   )
  // }
  // var staticRenderFns = []
  // render._withStripped = true
  let demoComponentContent = `
    ${compiled.code}
  `;
  // console.log(444444444, demoComponentContent)
  // todo: 这里采用了硬编码有待改进
  script = script.trim();
  if (script) {
    script = script.replace(/export\s+default/, 'const democomponentExport =');
  } else {
    script = 'const democomponentExport = {}';
  }
  // console.log(55555555555, script)
  demoComponentContent = `(function() {
    ${demoComponentContent}
    ${script}
    return {
      render,
      staticRenderFns,
      ...democomponentExport
    }
  })()`;
  return demoComponentContent;
}

module.exports = {
  stripScript,
  stripStyle,
  stripTemplate,
  genInlineComponentText
};
