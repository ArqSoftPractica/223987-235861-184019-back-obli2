const AbstractSystemLogger = require('./abstractSystemLogger');
const newrelic = require('newrelic');

class LoggerService extends AbstractSystemLogger {
    constructor() {
        super()
    }

    logError(text, error) {
        try {
            console.log('Error', text ?? error?.message ?? "");
            newrelic.recordLogEvent({
                message: text ?? "",
                level: 'ERROR',
                error: error
             })
        } catch (error) {
            newrelic.recordLogEvent({
                message: error.message ?? "",
                level: 'ERROR',
                error: error
             })
        }
    }

    logInfo(text) {
        try {
            console.log(text ?? "");
            newrelic.recordLogEvent({
               message: text ?? "",
               level: 'INFO'
            })
        } catch (error) {
            this.logError(error.message, error)
        }
    }
}

module.exports = new LoggerService();