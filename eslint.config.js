import js from "@eslint/js"
import vueParser from "vue-eslint-parser"
import tsParser from "typescript-eslint"

export default [
  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "node_modules", ".vscode", ".eslintrc.cjs"],
  },
  {
    name: "app/commonjs-files",
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    name: "app/node-files",
    files: ["playwright.config.ts", "postcss.config.js", "vite.config.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  },
  {
    name: "app/test-files",
    files: ["**/*.{test,spec}.{js,ts}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },
  {
    name: "app/js-rules",
    files: ["**/*.{js,mjs,cjs}"],
    rules: js.configs.recommended.rules,
  },
  {
    name: "app/vue-rules",
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser.parser,
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  },
  {
    name: "app/ts-rules",
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
  },
]
