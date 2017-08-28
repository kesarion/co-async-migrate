#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const glob = require('glob');

const path = process.argv[process.argv.length - 1];
const win = ~os.platform().indexOf('win');

let noyield = false;
let co = 'co';
let help = false;

process.argv.forEach((arg, i) => {
    switch (arg) {
        case '--noyield':
            noyield = true;
            break;
        case '--co':
            co = process.argv[i + 1];
            break;
        case '--help':
            help = true;
            break;
    }
});

if (help) {
    return console.log(`
    Migrate files in path from co/yield to co/async.
    
    Usage:
    co-async-migrate /path
    
    Options:
    --noyield - Doesn't replace yield;
    --co string - Instead of 'co(...)', replace 'string(...)', same behaviour otherwise;
    
    Note: Options must be placed before the path string.
    
    Example with options:
    co-async-migrate --noyield --co coexpress /path
    `);
}

console.log(`Migrating files in path: ${path}`);

glob(properPath(`${path}/**/*`), null, async function (err, files) {
    if (err) {
        console.error(err);
    }

    for (let file of files) {
        fs.writeFile(file, replaceCoWithAsync(await new Promise(resolve => fs.readFile(file, 'utf8', (err, data) => resolve(data)))), console.error);
    }

    console.log('Success!');
});

function replaceCoWithAsync (file) {
    let coFunctionString = `${co}(function *`;
    let asyncFunctionString = 'async function ';
    let coFunctionIndex = file.indexOf(coFunctionString);

    while (~coFunctionIndex) {
        let openingCurly = file.indexOf('{', coFunctionIndex);
        let closingCurly = getClosingCurly(file, openingCurly + 1);

        file = file.substring(0, coFunctionIndex) + asyncFunctionString + file.substring(coFunctionIndex + coFunctionString.length, closingCurly + 1) + file.substring(closingCurly + 2);

        coFunctionIndex = file.indexOf(coFunctionString, coFunctionIndex + asyncFunctionString.length);
    }

    if (!noyield) {
        file = file.replace(/yield/g, 'async');
    }

    return file;
}

function getClosingCurly (file, index) {
    let openingCurly = file.indexOf('{', index);
    let closingCurly = file.indexOf('}', index);

    while (~openingCurly && openingCurly < closingCurly) {
        openingCurly = file.indexOf('{', openingCurly + 1);
        closingCurly = file.indexOf('}', closingCurly + 1);
    }

    return closingCurly;
}

function properPath(path) {
    return win ? path.replace(/\//g, '\\') : path;
}