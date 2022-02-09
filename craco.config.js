/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const path = require("path");
const fs = require("fs");

// Support optionally pulling in external branding if the module is installed.
const theme = "@microbit-foundation/python-editor-next-microbit";
const external = `node_modules/${theme}`;
const internal = "src/deployment/default";

module.exports = {
  webpack: {
    alias: {
      "theme-package": fs.existsSync(external)
        ? theme
        : path.resolve(__dirname, internal),
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^theme-package(.*)$": `<rootDir>/${
          fs.existsSync(external) ? external : internal
        }$1`,
        "\\.worker": "<rootDir>/src/mocks/worker.js",
      },
    },
  },
};

console.log(module.exports);
