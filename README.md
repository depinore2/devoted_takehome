# devoted_takehome

Thanks for considering me for your position!  I was pleasantly surprised by how entertaining this particular take-home exam was.  I hope you enjoy reading through my code.

### Running the Project ###

This project utilizes nodeJS. If you do not already have nodejs installed on your machine, open this repository in VS Code and open it using the `Remote Development - Containers` extension. That will automatically open this repo in a nodeJS container without the need to install it on your host machine.  For more information, please refer [to the official Remote Development Extension documentation](https://code.visualstudio.com/docs/remote/containers#:~:text=The%20Visual%20Studio%20Code%20Remote,Studio%20Code's%20full%20feature%20set.).

All of the test scenarios specified in the assignment sheet have been implemented as unit tests in `core.spec.js`.  In order to run those tests, run the command `npm t`.

### Command Line Arguments ###

You can also pipe the script input yourself, by running a command like this: `cat script1.txt | node index.js` or interactively, by simply running `node index.js`.

To view the internal state of the in-memory database after each command, provide the `--debug` flag, like so: `node index.js --debug`.  This will display the internal state of the in-memory database after each command as JSON output.

### Project Structure ###

The application is pretty straightforward, so it didn't require the use of any third-party modules. 

- `index.js` acts as the wrapper for interacting with user input/output.
- `core.js` is where all of the logic resides.  I segregate the logic from the I/O in order to make it easier to unit test.
- `core.spec.js` are all of the unit tests for `core.js`.

### Closing Thoughts ###

I appreciate that this take-home assignment really gave me an opportunity to showcase my coding abilities.  Many other take-home assignments for DevOps positions are much more focused on infrastructure provisionment.  Overall, it was a nice change of pace.

I appreciate your time, and look forward to hearing back from you.