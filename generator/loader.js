const fs = require('fs');
const glob = require('glob');

/**
 * Load JSON templates from a directory.
 *
 * @param  {string} directory Input directory.
 * @return {array} Output array of objects.
 */
exports.loader = (directory) => {
    return glob.sync(directory + '/*.json').map(file => {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    });
}

/**
 * Load resource patterns.
 * @return {array} Array of pattern objects.
 */
exports.loadPatterns = () => {
    return exports.loader('patterns');
}

/**
 * Load color themes.
 * @return {array} Array of theme objects.
 */
exports.loadThemes = () => {
    return exports.loader('themes');
}
