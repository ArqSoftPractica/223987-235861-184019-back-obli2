module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [{
        "env": {
          "browser": true,
          "es2021": true,
          "node": true
        },
        "extends": [
          "plugin:react/recommended",
          "airbnb"
        ],
        "parserOptions": {
          "ecmaFeatures": {
            "jsx": true
          },
          "ecmaVersion": "latest",
          "sourceType": "module"
        },
        "plugins": [
          "react"
        ],
        "rules": {
          "func-names": "off",
          "quotes": [
            0,
            "single"
          ],
          "react/jsx-filename-extension": [
            2,
            {
              "extensions": [
                ".js",
                ".jsx"
              ]
            }
          ],
          "react/prop-types": 0,
          "react/function-component-definition": [
            0,
            {
              "namedComponents": "arrow-function"
            }
          ],
          "import/prefer-default-export": 0,
          "object-curly-newline": [
            2,
            {
              "consistent": true
            }
          ],
          "no-alert": 0,
          "linebreak-style": 0,
          "prefer-destructuring": 0,
          "class-methods-use-this": 0,
          "no-unused-expressions": 0,
          "no-underscore-dangle": 0,
          "jsx-a11y/click-events-have-key-events": 0,
          "jsx-a11y/no-static-element-interactions": 0,
          "array-callback-return": 0,
          "no-use-before-define": 0,
          "react/jsx-boolean-value": 0,
          "spaced-comment": 0,
          "react/jsx-one-expression-per-line": 0,
          "arrow-body-style": 0,
          "jsx-a11y/media-has-caption": 0,
          "jsx-a11y/label-has-associated-control": 0,
          "react/no-unused-class-component-methods": 0,
          "react/destructuring-assignment": 0,
          "no-return-assign": 0,
          "no-unsafe-optional-chaining": 0,
          "sort-imports": [
            2,
            {
              "ignoreCase": true,
              "ignoreDeclarationSort": true,
              "ignoreMemberSort": false,
              "memberSyntaxSortOrder": [
                "none",
                "all",
                "multiple",
                "single"
              ],
              "allowSeparatedGroups": false
            }
          ],
          "react/button-has-type": 0
        },
        "ignorePatterns": [
          "src/plugins"
        ]
      }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double"],
      "semi": ["error", "always"]
    }
}
