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

  // Plugins instalados
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],

  // Configuração da ordem dos imports
  importOrder: [
    '^next$',
    '^react$',
    '^react-dom$',
    '^react/(.*)$',
    '^next/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@mui/(.*)$',
    '^@emotion/(.*)$',
    '^@/components/(.*)$',
    '^@/lib/(.*)$',
    '^@/utils/(.*)$',
    '^@/hooks/(.*)$',
    '^@/styles/(.*)$',
    '^@/public/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
