module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-use-before-define": ["warn"],
  },
  plugins: ["@typescript-eslint"],
};
