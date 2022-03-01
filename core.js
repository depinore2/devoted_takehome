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
    const database = {};
    for(let indexName of indexNames) {
        database[indexName] = {};
    }

    return database;
}

// finds the first transaction that has a value provided for this key, starting from the latest transaction and working backward.
function getIndexValue(db, indexName, key) {
    return isValidIndex(indexName, () => {
        const latestTransactionWithValue = db.transactions
                                            .reverse()
                                            .find(transaction => transaction[indexName][key] !== undefined);
        
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
    const currentCount = getIndexValue(db, 'counts', value);
    
    setIndexValue(workingLayer, 'values', key, value);
    setIndexValue(workingLayer, 'counts', value, currentCount + 1);
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
    return getIndex
}
export function newInMemoryDatabase() {
    return {
        current: newLayer(),
        transactions: []
    }
}
// ======== /PUBLIC API ========