const path = require("path");
const commonjs = require("@rollup/plugin-commonjs");
const terser = require("@rollup/plugin-terser");
const typescript = require("@rollup/plugin-typescript");

const dotenv = require("dotenv");
dotenv.config();

const production = process.env.NODE_ENV !== "dev";

module.exports = {
  input: "src/main/index.ts",
  output: {
    sourcemap: !production,
    format: "cjs",
    name: "app",
    file: "dist/main/main.js",
  },
  plugins: [
    commonjs(),
    typescript({
      tsconfig: "tsconfig.json",
      sourceMap: !production,
      inlineSources: !production,
    }),

    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
