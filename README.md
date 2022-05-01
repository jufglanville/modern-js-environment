# modern-js-environment

# Project Set up

## Setting up `npm`

1. To use different packages we need to setup the package manager - `npm` in our directory. Navigate to the directory or in VSCode use *ctrl + shift + \`*, and enter the following.

```
npm init -y
```

This will set up an npm package using the default settings.

2. Next we add a `.gitignore` file to leave the `node_modules` out of our commits.

```
echo "node_modules" > .gitignore
```

**Save the `.gitignore` file with the code editor to apply the changes.**

## Set up [[Webpack]] to bundle code

1. Install `webpack` as a development dependency and the `webpack-cli` by running:

```
npm install webpack --save-dev
npm install -D webpack-cli
```

2. Add an empty `webpack` config file.

```
echo "module.exports = {}" > webpack.config.js
```

3. Add an *entry point* to your `webpack.config.js` file. We will use `require("path")` to allow us to target the current directory with `__dirname` and then navigate to our input file:

```js
const path = require("path");

module.exports = {
 entry: path.join(__dirname, "src/scripts.js"),
}
```

4. Add an output configuration to the `webpack` file. Again we use `path` to target where we want to export our bundle, in this case the `build` directory found in the current directory. We then set the file name we want to use, in this case `bundle.js`:

```js
const path = require("path");

module.exports = {
 entry: path.join(__dirname, "src/scripts.js"),
 output: {
  path: path.resolve(__dirname, "build"),
  filename: "bundle.js",
 },
 mode: "production"
}
```

5. We will also want to add the `/build` directory to our `.gitignore` file.

```
echo "build" >> .gitignore
```

**Save the `.gitignore` file with the code editor to apply the changes.**

6. Next we add a script to build our application for production in the `package.json` file:

```json
...
"scripts": {
 "build": "webpack"
},
...
```

### Example Scenario

Using the set up above imagine we had the following directory structure:

```
EnvironmentSetupProject
|-- build
|-- src
| |-- scripts.js
| |-- sum.js
|-- index.html
|-- .gitignore
|-- package.json
|-- webpack.config.json
```

##### `sum.js`  File

```js
function sum() {
 const total = 4 + 4;
 alert(total);
}

module.exports = sum;
```

##### `scripts.js`  File

```js
const sum = require("./sum");

document.getElementById("btn-one").addEventListener("click", sum);
```

##### `index.html`  File

```html
...
<body>
 <button id="btn-one">Click Me</button>
 <script src="./build/bundle.js"></script>
</body>
```

When we run our `build` script using `npm run build` in our terminal we will see that `webpack` will bundle and minimise our code and save it as `bundle.js` in the build directory.

## Build for any browser with `Babel`

Now that we are using `webpack` to bundle our code we can extend our workflow in many different ways. The most common one is to add `Babel` as a code *transpiler* so we can build for all browsers but still use the latest JavaScript features.

1. Install `Babel` loader for `webpack` by running:

```
npm install -D babel-loader @babel/core @babel/preset-env webpack
```

2. Add the *module* configuration to our `webpack.config.js` file:

```js
module: {
    rules: [
        {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
            loader: 'babel-loader',
            options: { // our code will be compatible with Internet Explorer 11
                presets: [["@babel/preset-env", { "targets": "IE 11" }]]
            }
        }
        }
    ]
}
```

Above we have created a `rules` array and in here we have an object. This object contains three properties: `test`, `exclude` and `use`.

- The `test` property selects all modules that pass the test, in this case we are using `regex` to target all `.js` files.
- The `exclude` property allows us to exclude any modules that match any of the conditions passed. In this case we are excluding all files found within the `node_modules` directory.
- The `use` property tells `webpack` what modules to use for the files that pass the tests. In this case we want `webpack` to use `babel` anytime a `.js` file is found. Now `webpack` will use `babel` to translate our code following the `presets` configuration.

### Example Scenario

Using our previous example we can now update our `.js` files to use advacnced features like the `ES6` modules.

##### `sum.js`  File

```js
function sum() {
 const total = 4 + 4;
 alert(total);
}

- module.exports = sum;
+ export default sum;
```

##### `scripts.js`  File

```js
- const sum = require("./sum");
+ import sum from "./sum.js";

document.getElementById("btn-one").addEventListener("click", sum);
```

## Extending our tooling with `Webpack` plugins

Webpack offers many plugins to extend our workflow, optimise our code and improve the development experience.

1. We can avoid caching issues by producing a *unique bundle name* everytime we build. To do this we need to update our `output` in our `webpack.config.js` file.

```js
output: {
 path: path.resolve(__dirname, "build"),
 - filename: "bundle.js",
 + filename: "[contenthash].bundle.js",
}
```

The `[contenthash]` command will create a new hash each time we run our `build`  script.

![[webpackContentHash.png]]

2. We can now use `HTMLWebpackPlugin` to automatically add this new hashed file to our `index.html`.

```
npm install --save-dev html-webpack-plugin
```

3. Back in our `webpack.config.js` we need to import this new package and add it to our module.

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
 entry: path.join(__dirname, "src/scripts.js"),
 output: {
  path: path.resolve(__dirname, "build"),
  filename: "[contenthash].bundle.js",
 },
 plugins: [new HtmlWebpackPlugin({
  template: path.join(__dirname, "public", "index.html"),
 })],
 mode: "production",
 module: {
  rules: [
   {
    test: /\.m?js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
     loader: "babel-loader",
     options: {
      presets: [["@babel/preset-env", { targets: "IE 11" }]],
     },
    },
   },
  ],
 },
};
```

4. We next need to make a new `public` directory and move our `index.html` file to this.

```
mkdir public
mv index.html public/index.html
```

5. Within the `index.html` file we can remove the `<script>` tag.

```html
...
<body>
 <button id="btn-one">Click Me</button>
 - <script src="./build/bundle.js"></script>
</body>
```

6. Finally, we will remove the `build` folder:

```
rm -rf build
```

Our directory structure should now look like the below:

```
EnvironmentSetupProject
|-- public
| |-- index.html
|-- src
| |-- scripts.js
| |-- sum.js
|-- .gitignore
|-- package.json
|-- webpack.config.json
```

7. Now we can run our `build` script using `npm run build` and again we will get a `build` directory created but this time it will include both our bundled `.js` file as well as a minimised `index.html` file. If we open our `index.html` we will see that our newly named `.js` file is being reference.

![[webpackContentHashIndexFile.png]]
![[webpackContentHashIndexDir.png]]

## Adding `React` to leverage `JSX` and OOP `Components`

1. First we need to add the `react-presets` for `babel` as a dev dependency.

```
npm install --save-dev @babel/preset-react
```

2. Next we need to add the *react presets* to the `babel` config in the `webpack.config.js` file. We add `jsx` to our `test` and we add `@babel/preset-react` to our `presets`.

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
 entry: path.join(__dirname, "src/scripts.js"),
 output: {
  path: path.resolve(__dirname, "build"),
  filename: "[contenthash].bundle.js",
 },
 plugins: [
  new HtmlWebpackPlugin({
   template: path.join(__dirname, "public", "index.html"),
  }),
 ],
 mode: "production",
 module: {
  rules: [
   {
    test: /\.m?js|jsx$/,
    exclude: /(node_modules|bower_components)/,
    use: {
     loader: "babel-loader",
     options: {
      // our code will be compatible with Internet Explorer 11
      presets: [
       "@babel/preset-react", 
       ["@babel/preset-env", { targets: "IE 11" }]
      ],
     },
    },
   },
  ],
 },
};
```

3. From our *Example Scenario* above we can now delete our `sum.js` and `scripts.js` files as we will use `react` instead.

```
rm src/scripts.js
rm src/sum.js
```

4. Now we can add `react` and `react-dom` as a dependency.

```
npm install react-dom react
```

5. Next we add the new `react` code.

```
touch src/index.jsx
```

In this file we can add the following.

```jsx
import ReactDOM from "react-dom";
import React from "react";

class App extends React.Component {
render() {
    return (
        <div>
            <h3>Hello There! What is your name?</h3>
            <input></input>   
            <button onClick={() => alert("Hello")}>Say Hello</button>
        </div>
        );
    }
}

ReactDOM.render(
<App/>,
document.getElementById('root')
);
```

6. We now need to change the *entry point* in the `webpack.config.js` file.

```json
module.exports = {
 entry: path.join(__dirname, "src/index.jsx"),
...
}
```

7. In the `public/index` we can remove our `button` and add a `div` with an `id="root"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta http-equiv="X-UA-Compatible" content="IE=edge">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Document</title>
</head>
<body>
 <div id="root"></div>>
</body>
</html>
```

8. Next we will add a development server to improve of dev environment. First we will need to install `webpack-dev-server` as a development dependency.

```
npm install -D webpack-dev-server
```

9. In `webpack.config.js` we will add the following, this can be added after our `module`.

```json
module.exports = {
...
 devServer: {
  port: 3000
 },
};
```

10. Now we need to add a `dev` command to our `npm script`. So, in our `package.json` file we will add the following.

```json
"scripts": {
 "build": "webpack",
 "dev": "webpack serve"
}
```

The `serve` command will run our `devServer`.

11. Now we can run our `dev` script in our terminal with `npm run dev`. This will return something like the below. As you can see our app is being hosted on our stated `port` value.

![[webpackDevServer.png]]

## Adding TypeScript

We will now extend our code so that it uses `typescript`.

1. First we need to add this using the `ts-loader`.

```
npm install --save-dev typescript ts-loader
```

2. We can now extend our `webpack.config.js` file. Within our `rules` we will add a new object which will `test` for our `tsx` files and use `ts-loader` on these.

```js
module: {
 rules: [
  {
   test: /\.m?js|jsx$/,
   exclude: /(node_modules|bower_components)/,
   use: {
    loader: "babel-loader",
    options: {
     // our code will be compatible with Internet Explorer 11
     presets: [
      "@babel/preset-react",
      ["@babel/preset-env", { targets: "IE 11" }],
     ],
    },
   },
  },
  {
   test: /\.tsx?$/,
   exclude: /node_modules/,
   use: 'ts-loader',
  },
 ],
},
```

3. We now need to add a `tsconfig.json` file to our main directory.

```
touch tsconfig.json
```

4. In here we will use the default `react` configuration.

```json
{
 "compilerOptions": {
     "module": "commonjs",
     "noImplicitAny": true,
     "removeComments": true,
     "preserveConstEnums": true,
     "sourceMap": true,
     "esModuleInterop": true,
     "jsx": "react"
 },
 "include": ["src"],
 "exclude": ["node_modules"]
}
```

5. Finally, we need to change all our `jsx` files to `tsx` files to allow us to use static typing. In our *example scenario* this is our `src/index.jsx`.

## Adding a Linter

Next we will add a *linter* to our project to ensure that we are following correct coding standards. For this we are going to use `eslint`.

1. We will first download `eslint` as a developer dependency package.

```
npm install eslint --save-dev
```

2. We can then run `npx eslint --init` which will give us options for configuring our eslint config file. We will use the following setup:

![[eslintInitSetup.png]]

After this `eslint` will check the dependencies needed to be installed for this setup and ask if we want to install them, which we will select `yes`.

3. We should now get a `.eslintrc.json` file created in our root directory, and this should have the following settings.

```json
{
 "env": {
  "browser": true,
  "es2021": true
 },
 "extends": [
  "plugin:react/recommended",
  "airbnb"
 ],
 "parser": "@typescript-eslint/parser",
 "parserOptions": {
  "ecmaFeatures": {
   "jsx": true
  },
  "ecmaVersion": "latest",
  "sourceType": "module"
 },
 "plugins": [
  "react",
  "@typescript-eslint"
 ],
 "rules": {
 }
}
```

## Adding Prettier to our Linter

We will now integrate *Prettier* into our *eslint*.

1. First we need to install `prettier`, `eslint-plugin-prettier` and `eslint-config-prettier`.

```
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier
```

2. We can next create a `.prettierrc` file using `touch .prettierrc` in our root directory to allow some configuration.

```json
{
 "trailingComma": "es5",
 "tabWidth": 2,
 "semi": true,
 "singleQuote": true
}
```

3. Now in our `.eslintrc.json` file we can add our plugin to the `extends`.

```json
  "extends": [
 "plugin:react/recommended",
 "airbnb",
    "plugin:prettier/recommended",
    "prettier"
  ],
```

The `plugin:prettier/recommended` extends the `eslint-config-prettier` which turns off a [handful of rules](https://github.com/prettier/eslint-config-prettier#special-rules) from our base config that are unnecessary or might conflict with `prettier`. We typically have a base config, like `eslint-config-airbnb` or `eslint-config-react-app`, that makes some code styling decisions. So `eslint-config-prettier` turns off those rules so `prettier` can play nice. The `plugin:prettier/recommended` also turns on the single `prettier/prettier` rule that validates code format using `prettier`.

When developing in `react`, we use `eslint-plugin-react` for `react` specific `eslint` rules. There are some rules within it that also conflict with `prettier`, so `eslint-config-prettier` provides an additional `react` specific config to extend from that removes those conflicting rules.

4. Now we can add a new `script` to our `package.json` file to run our *linter*.

```json
"scripts": {
 "lint": "eslint ./src/*"
}
```

The `eslint` commands registers that we will run `eslint` for this task and `./src/*` states that we want to check the contents of the `src` directory.

## Adding [lint-staged](https://github.com/okonet/lint-staged)

Linting makes more sense when run before commiting your code. By doing so you can ensure no errors go into the repository and enforce code style. But running a lint process on a whole project is slow, and linting results can be irrelevant. Ultimately you only want to lint files that will be commited and for this we will use `lint-staged`. [This Project](https://github.com/okonet/lint-staged#examples) contains a script that will run arbitrary shell tasks with a list of staged files as an argument, filtered by a specific glob pattern.

**Before we set up lint-staged we need to create a new repository and clone this to our app environment. Husky requires Git-Hooks to work and the steps below will not work for just a local project**

1. First we will install the `lint-staged`.

```
npx mrm@2 lint-staged
```

The above command will install and configure [husky](https://typicode.github.io/husky/#/) and `lint-staged` depending on the code quality tools from your projects `package.json` dependencies.

We should now have a `.husky` directory and in here we will have a `pre-commit` file with the following set configuration.

```json
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

This will mean that `husky` will run our `lint-staged` before every commit we make to ensure our code is of good quality.

2. If we now go to our `package.json` file we will see a new `"lint-staged"` property. This will also need to be updated so that we are looking for our `ts` and `tsx` file extensions.

```json
"lint-staged": {
 "*.{ts,tsx}": "eslint --cache --fix"
}
```

## Commiting our code

1. Now we can `add` our code to our repo with `git add --all`. Once we have done this we can `commit` our code and add a message using `git commit -m "initial commit"`. This will run `husky` which in turn will run our `lint-staged`.

![[lintStagedErrors.png]]
As you can see we have some errors that need to be addressed before we can `commit` our code, so we can see that `lint-staged` is working correctly.

## Fixing Errors

The errors above are caused by the `eslint-airbnb-config` file that we used to set up our `eslint`. We can bypass these though by editting our `.eslintrc.json` file or the file in which these errors occured.

1. The first error we will tackle is the *JSX not allowed in files with extension '.tsx'*. In our `.eslintrc.json` file we will add the following `rule`:

```json
"rules": {
 "react/jsx-filename-extension": [1, { "extensions": [".tsx", ".ts"] }]
}
```

This will allow `.jsx` files to be included in our `.tsx` file extensions.

- 0 = turn the rule off
- 1 = turn the rule on as a warning (doesn't affect exit code)
- 2 = turn the rule on as an error (exit code is 1 when triggered)

2. The next error *Missing an explicit type attribute for button* is easily fixed by adding a `type="button"` to our button.

```tsx
<button type="button" onClick={() => alert('Hello')}>
 Say Hello
</button>
```

3. The final error *Component should be written as a pure function* we are going to bypass within the file itself. To do this we will add the following to the top of our `index.tsx` file.

```tsx
/* eslint-disable react/prefer-stateless-function */
```

Once we have saved these updates we will see that our `commit` is now successful and we can push to our repo.
