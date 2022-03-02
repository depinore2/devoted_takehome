import * as assert from 'assert'
import fs from 'fs';
import * as readline from 'readline'
import * as core from './core.js'

function readLines(filePath) {
    return new Promise((resolve, reject) => {
        const lines = [];
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: undefined
        });
        
        rl.on('line', function (line) {
            lines.push(line);
        })
        rl.on('close', function () {
            resolve(lines);
            rl.close();
        });
    })
}

await Promise.all(
    [1,2,3,4]
        .map(index => ({ commandsPath: `script${index}.txt`, expectedOutputPath: `expected_output${index}.txt` }))
        .map(async ({ commandsPath, expectedOutputPath }) => {
            const db = core.newInMemoryDatabase();

            const commandsPromise = readLines(commandsPath);
            const expectedOutputPromise = readLines(expectedOutputPath);
            await Promise.all([commandsPromise, expectedOutputPromise]);

            const commands = await commandsPromise;
            const expectedOutput = (await expectedOutputPromise).join('\n')
            const output = commands
                            .map(command => core.interpretLine(db, command))
                            .filter(outputLine => outputLine !== undefined && outputLine !== '' && outputLine !== null)
                            .join(`\n`);

            console.log(`== INPUT ==\n\n${commands.join('\n')}\n\n`);
            console.log(`== OUTPUT ==\n\n${output}`)
            assert.equal(output, expectedOutput, `Failed when inspecting the output for ${commandsPath}.`);
            console.log(`\n\nTEST [${commandsPath}] PASSED\n\n`);
            console.log(`==================`)
        })
);

console.log(`All tests passed successfully!`)