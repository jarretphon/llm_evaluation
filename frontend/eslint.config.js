import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import boundaries from 'eslint-plugin-boundaries' 

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "boundaries": boundaries
    },
    settings: {
      "import/resolver": {
        "typescript": {
          "alwaysTryTypes": true
        }
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          "mode": "full",
          "type": "shared",
          "pattern": [
            "src/assets/**/*",
            "src/components/**/*",
            "src/data/**/*",
            "src/hooks/**/*",
            "src/lib/**/*",
            "src/services/**/*",
            "src/styles/**/*",
            "src/types/**/*",
            "src/utils/**/*",
          ]
        },
        {
          "mode": "full",
          "type": "feature",
          "capture": ["featureName"],
          "pattern": ["src/features/*/**/*"]
        },
        {
          "mode": "full",
          "type": "pages",
          "capture": ["_", "fileName"],
          "pattern": ["src/pages/**/*"]
        },
        {
          "mode": "full",
          "type": "app",
          "pattern": ["src/App.tsx", "src/main.tsx"]
        },
        {
          "mode": "full",
          "type": "neverImport",
          "pattern": ["src/*"]
        }
      ]
    },
    "rules": {
      "boundaries/no-unknown": ["error"],
      "boundaries/no-unknown-files": ["error"],
      "boundaries/element-types": [
        "error",
        {
          "default": "disallow",
          "rules": [
            {
              "from": ["shared"],
              "allow": ["shared"]
            },
            {
              "from": ["feature"],
              "allow": [
                "shared",
                ["feature", { "featureName": "${from.featureName}" }]
              ]
            },
            {
              "from": ["pages", "neverImport"],
              "allow": ["shared", "feature"]
            },
            {
              "from": ["pages"],
              "allow": [["pages", { "fileName": "*.css" }]]
            },
            {
              "from": ["app"],
              "allow": ["app", "shared", "feature", "pages"]
            }
          ]
        }
      ]
    }
  },
])
