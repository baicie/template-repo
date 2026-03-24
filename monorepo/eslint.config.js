import defineConfig from '@antfu/eslint-config'

const DOMGlobals = ['window', 'document']
const NodeGlobals = ['module', 'require']

const banConstEnum = {
  selector: 'TSEnumDeclaration[const=true]',
  message: 'Please use non-const enums. This project automatically inlines enums.',
}

export default defineConfig(
  {
    rules: {
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-restricted-globals': ['error', ...DOMGlobals, ...NodeGlobals],

      'no-restricted-syntax': [
        'error',
        banConstEnum,
        {
          selector: 'ObjectPattern > RestElement',
          message:
            'Our output target is ES2016, and object rest spread results in '
            + 'verbose helpers and should be avoided.',
        },
        {
          selector: 'ObjectExpression > SpreadElement',
          message: 'esbuild transpiles object spread into very verbose inline helpers.\n'
            + 'Please use the `extend` helper from @zeus-js/shared instead.',
        },
        {
          selector: 'AwaitExpression',
          message:
            'Our output target is ES2016, so async/await syntax should be avoided.',
        },
        {
          selector: 'ChainExpression',
          message:
            'Our output target is ES2016, and optional chaining results in '
            + 'verbose helpers and should be avoided.',
        },
      ],
    },
  },

  // shared, may be used in any env
  {
    files: ['packages/shared/**', 'eslint.config.js'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },

  // Node scripts
  {
    files: [
      'rollup*.config.js',
      'scripts/**',
      './*.{js,ts}',
      'packages/*/*.js',
    ],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': ['error', banConstEnum],
      'no-console': 'off',
    },
  },

  {
    ignores: [
      '**/dist/',
      '**/temp/',
      '**/coverage/',
      '.idea/',
      'explorations/',
      'dts-build/packages',
      'playground',
    ],
  },
)
