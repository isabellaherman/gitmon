// .prettierrc.cjs
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // Plugin para ordenar imports
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  
  // Ordem dos imports
  importOrder: [
    '^next$',
    '^react$',
    '^react-dom$',
    '^react/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@src/api/(.*)$',
    '^@src/redux/(.*)$',
    '^@src/types/(.*)$',
    '^@src/components/(.*)$',
    '^@src/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};