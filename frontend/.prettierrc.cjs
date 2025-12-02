// 优化版Prettier配置，符合现代JavaScript/TypeScript开发最佳实践
module.exports = {
  // 核心格式化规则
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,

  // 箭头函数括号配置 - 仅在必要时添加括号
  arrowParens: 'avoid',

  // 引号配置
  quoteProps: 'as-needed',

  // 大括号换行配置
  bracketSameLine: false,

  // Vue相关配置
  vueIndentScriptAndStyle: true,
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',

  // TypeScript相关配置
  singleAttributePerLine: false,

  // 行尾风格
  endOfLine: 'lf',
};
