#!/usr/local/bin/node
import * as readline from 'readline'
import * as core from './core.js'
import * as fs from 'fs'

const debug = process.argv.indexOf('--debug') > -1;
const filePathIndex = process.argv.indexOf('--file');

if(debug) {
    console.info(`Debug mode enabled.`)
}

const db = core.newInMemoryDatabase();

process.stdin.setEncoding('utf8');

// the user can optionally pass in a file argument, which will cause the program to read from there rather than stdin.
var rl = readline.createInterface({
    input: filePathIndex > -1 ? fs.createReadStream(process.argv[filePathIndex + 1]) : process.stdin,
    output: undefined
});
const stdin = process.stdin;

stdin.setEncoding('utf8');

rl.on('line', function (line) {
    const result = core.interpretLine(db, line);
    if(debug) {
        console.log(`>> ${line}`)
    }
    if(result !== '' && result !== undefined) {
        console.log(result);
    }
    if(debug) {
        console.log(JSON.stringify(db, null, '  '));
    }
});

rl.on('end', function () {
  process.exit();
});

rl.on('error', console.error);