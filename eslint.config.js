import pluginJs from "@eslint/js"
import pluginStylisticJs from "@stylistic/eslint-plugin"
import pluginImport from "eslint-plugin-import"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint" // eslint-disable-line import/no-unresolved

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/package.json", "**/package-lock.json", "public/tinymce/**/*", "src/geojson-to-kml.d.ts"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginStylisticJs.configs["recommended-flat"],
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    name: "Overrides",
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@stylistic/max-len": ["error", { code: 160 }],
      "@stylistic/quotes": [2, "double", { avoidEscape: true }],
    },
  },
  {
    name: "eslintConfigPrettier Overrides",
    rules: {
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/member-delimiter-style": [
        "error",
        {
          singleline: { delimiter: "semi", requireLast: false },
          multiline: {
            delimiter: "none",
            requireLast: true,
          },
        },
      ],
      "@stylistic/multiline-ternary": ["error", "always-multiline", { ignoreJSX: true }],
      "@stylistic/jsx-one-expression-per-line": ["error", { allow: "single-line" }],
      "@stylistic/operator-linebreak": ["error", "after", { overrides: { "?": "before", ":": "before", "=": "after" } }],
      "@stylistic/quote-props": ["error", "as-needed"],
    },
  },
  {
    // Import plugin configuration for sorting imports
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          moduleDirectory: ["node_modules", "src", "tests"],
        },
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "error",
      "import/no-unresolved": "error",
    },
  },
]
