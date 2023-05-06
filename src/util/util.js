const crypto = require('crypto');
module.exports = {
    isTextHashedTheSameAsHashedText: async function isTextHashedTheSameAsHashedText(text, hashedText) {
        var hash = crypto.createHash('sha256').update(text).digest('hex');
        return hashedText === hash;
    }
}
