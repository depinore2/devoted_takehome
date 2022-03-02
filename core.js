export const message = `Hello world!`

const indexNames = ['values','counts']

// ======== LAYER MANAGEMENT =========

// this function will save us from having to type this indexName check over and over again.
function isValidIndex(indexName, callback) {
    if(indexNames.indexOf(indexName) > -1) {
        return callback();
    }
    else {
        return new Error(`Invalid index provided: ${indexName}.  Must be one of: ${indexNames.join(', ')}.`);
    }
}
function newLayer() {
    const layer = {};
    for(let indexName of indexNames) {
        layer[indexName] = {};
    }

    return layer;
}

// finds the first transaction that has a value provided for this key, starting from the latest transaction and working backward.
function getIndexValue(db, indexName, key) {
    return isValidIndex(indexName, () => {
        const latestTransactionWithValue = db.transactions
                                            .slice()
                                            .reverse()
                                            .filter(transaction => transaction[indexName][key] !== undefined)[0];
        
        // if we find a transaction that contains this value, then return that.
        // otherwise, return the 'current' value from the base layer.
        return latestTransactionWithValue === undefined 
            ? db.current[indexName][key]
            : latestTransactionWithValue[indexName][key];
    });
}
function setIndexValue(layer, indexName, key, value) {
    return isValidIndex(indexName, () => {
        layer[indexName][key] = value;
    });
}
function getWorkingLayer(db) {
    return db.transactions.length 
        ? db.transactions[db.transactions.length - 1]
        : db.current;
}
// ======== /LAYER MANAGEMENT =========

// ======== PUBLIC API ========
export function newTransaction(db) {
    db.transactions.push(newLayer());
}
export function rollbackTransaction(db) {
    db.transactions.pop(); // removes the last transaction from the transactions list
}
export function commitTransactions(db) {
    for(let transaction of db.transactions) { 
        for(let indexName of indexNames) {
            db.current[indexName] = {
                ...db.current[indexName],
                ...transaction[indexName]
            }
        }
    }
    db.transactions = [];
}

export function setValue(db, key, value) {
    const workingLayer = getWorkingLayer(db);

    const newValueCurrentCount = getIndexValue(db, 'counts', value) || 0;

    const oldValue = getIndexValue(db, 'values', key);
    
    setIndexValue(workingLayer, 'values', key, value);
    setIndexValue(workingLayer, 'counts', value, newValueCurrentCount + 1);

    // if we're changing the value of a pre-existing name in the database, we need to decrement the count of that old value.
    if(oldValue !== undefined && oldValue !== null) {
        const oldValueCount = getIndexValue(db, 'counts', oldValue) || 0;
        setIndexValue(workingLayer, 'counts', oldValue, Math.max(oldValueCount - 1, 0));
    }
}
export function deleteValue(db, key) {
    const currentValueAtKey = getIndexValue(db, 'values', key);
    const keyHasValue = currentValueAtKey !== undefined && currentValueAtKey !== null;

    // only do anything if we have a value at the given key.
    if(keyHasValue) {
        const workingLayer = getWorkingLayer(db);
        const newCount = Math.max(getIndexValue(db, 'counts', currentValueAtKey) - 1, 0); // don't let it go into the negatives.

        setIndexValue(workingLayer, 'values', key, null);
        setIndexValue(workingLayer, 'counts', currentValueAtKey, newCount);
    }
}
export function getValue(db, key) {
    return getIndexValue(db, 'values', key);
}
export function getCount(db, value) {
    return getIndexValue(db, 'counts', value);
}
export function newInMemoryDatabase() {
    return {
        current: newLayer(),
        transactions: []
    }
}

export function interpretLine(db, line) {
    const [command, ...tokens] = line.split(' ');

    switch(command.toUpperCase()) {
        case 'SET':
            return (() => {
                const [name, value] = tokens;
                setValue(db, name, value);
            })();
        case 'GET':
            return (() => {
                const [name] = tokens;
                const value = getValue(db, name)
                const returnValue = 
                    value === undefined || value === null
                    ? 'NULL'
                    : value;

                return returnValue;
            })();
        case 'DELETE':
            return (() => {
                const [name] = tokens;
                deleteValue(db, name);
            })();
        case 'COUNT':
            return (() => {
                const [value] = tokens;
                return getCount(db, value) || 0;
            })();
        case 'BEGIN':
            return (() => {
                newTransaction(db);
            })();
        case 'ROLLBACK':
            return (() => {
                rollbackTransaction(db);
            })();
        case 'COMMIT':
            return (() => {
                commitTransactions(db);
            })();
        case 'END':
            return (() => {
                return '<<EXIT>>'
            })();
        default:
            return `Unrecognized command: [${command.toUpperCase()}] when reading line "${line}".`;
    }
}
// ======== /PUBLIC API ========