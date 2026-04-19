import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

const tsRules = {
	"indent": ["error", "tab", { "SwitchCase": 1 }],
	"quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],
	"no-var": "error",
	"prefer-const": "error",
	"no-trailing-spaces": "error",
	"@typescript-eslint/no-explicit-any": "off",
	"@typescript-eslint/no-use-before-define": ["error", { functions: false, typedefs: false, classes: false }],
	"@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true, argsIgnorePattern: "^_" }],
	"@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true, allowTypedFunctionExpressions: true }],
	"@typescript-eslint/no-non-null-assertion": "off",
};

export default [
	{
		ignores: ["build/**", "admin/words.js", "node_modules/**"],
	},
	// TypeScript source files
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: "./tsconfig.json",
			},
			globals: {
				...globals.node,
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			...tsRules,
			// TypeScript handles undefined-variable checks more accurately than no-undef
			"no-undef": "off",
		},
	},
	// Test file overrides
	{
		files: ["src/**/*.test.ts"],
		languageOptions: {
			globals: {
				...globals.mocha,
			},
		},
		rules: {
			"@typescript-eslint/explicit-function-return-type": "off",
		},
	},
	// Test directory JS files
	{
		files: ["test/**/*.js"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.mocha,
			},
		},
		rules: {
			...js.configs.recommended.rules,
			"indent": ["error", "tab", { "SwitchCase": 1 }],
			"no-console": "off",
			"no-unused-vars": ["error", { "ignoreRestSiblings": true, "argsIgnorePattern": "^_" }],
			"no-var": "error",
			"no-trailing-spaces": "error",
			"prefer-const": "error",
			"quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],
			"semi": ["error", "always"],
		},
	},
];
