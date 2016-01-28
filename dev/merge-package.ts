#!/bin/node

const origin = require('../package.json');
const override = require('./package.override.json');

const {assign} = <any>Object;

const json = assign({}, origin, override);

json.dependencies = assign({}, origin.dependencies, override.dependencies);
json.devDependencies = assign({}, origin.devDependencies, override.devDependencies);

import fs = require('fs');
fs.writeFileSync(__dirname + '/package.json', JSON.stringify(json, null, 2));

console.log('Package file written');
