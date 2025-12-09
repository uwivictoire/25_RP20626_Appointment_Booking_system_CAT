module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Add project-specific rules here if needed.
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
