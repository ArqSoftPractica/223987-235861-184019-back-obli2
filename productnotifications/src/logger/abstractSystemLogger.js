module.exports = class AbstractSystemLogger {
    constructor() { }
    
    logError(text) {
        throw new Error("Not implemented");
    }

    logInfo(text) {
        throw new Error("Not implemented");
    }
}
