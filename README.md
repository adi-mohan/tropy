# Tropy

[![Build Status](https://travis-ci.org/tropy/tropy.svg?branch=master)](https://travis-ci.org/tropy/tropy)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/tropy/tropy?branch=master&svg=true)](https://ci.appveyor.com/project/inukshuk/tropy)
[![Coverage Status](https://coveralls.io/repos/tropy/tropy/badge.svg?branch=master&service=github)](https://coveralls.io/github/tropy/tropy?branch=master)
[![License AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)

## Development

Install the latest version of Node.js (or at least the version that ships
with the current Electron release) and run:

     $ npm install -g node-gyp
     $ npm install

If rebuilding native modules fails, please ensure you have a supported C/C++
compiler installed, see [node-gyp](https://www.npmjs.com/package/node-gyp)
for details.

Run `npm test` to run all tests; `npm run test:renderer` or
`npm run test:browser` to run only the Renderer/Browser tests, or
`node scripts/make mocha -- <path>` to run only a given test file.

See `node scripts/make rules` and `node scripts/db rules` for additional
available targets.

To start the app in development mode, run `npm start`.
