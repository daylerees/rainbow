const fs         = require('fs');
const colors     = require('colors');
const mkdirp     = require('mkdirp');
const rimraf     = require('rimraf');
const Handlebars = require('handlebars');
const loader     = require('./loader');

/**
 * Copy files into resource directory.
 * @param  {object} pattern      Pattern object.
 * @param  {object} theme        Theme object.
 * @param  {string} resourcePath Path to resource location.
 */
exports.moveFiles = (pattern, theme, resourcePath) => {
    for (let key in pattern.copy) {
        let value = pattern.copy[key].replace('{slug}', theme.meta.slug);
        fs.createReadStream('patterns/' + pattern.meta.slug + '/' + key)
            .pipe(fs.createWriteStream(resourcePath + '/' + value));
    }
}

/**
 * Render template files.
 * @param  {object} pattern      Pattern object.
 * @param  {object} theme        Theme object.
 * @param  {string} resourcePath Path to resource location.
 */
exports.renderFiles = (pattern, theme, resourcePath) => {
    for (let key in pattern.render) {
        let value = pattern.render[key].replace('{slug}', theme.meta.slug);
        let fileContent = fs.readFileSync('patterns/' + pattern.meta.slug + '/' + key, 'utf8');
        fileContent = Handlebars.compile(fileContent)({theme, pattern});
        fs.writeFileSync(resourcePath + '/' + value, fileContent);
    }
}

/**
 * Render generation output.
 * @param  {object} pattern Pattern object.
 * @param  {object} theme   Theme object.
 */
exports.renderOutput = (pattern, theme) => {
    console.log(
        colors.yellow('- ') +
        colors.green('Generating [') +
        colors.yellow(theme.meta.slug) +
        colors.green('] for pattern [') +
        colors.yellow(pattern.meta.slug) +
        colors.green(']')
    );
}

/**
 * Build the path to the new resource.
 * @param  {object} pattern Pattern object.
 * @param  {object} theme   Theme object.
 * @return {string}         New path.
 */
exports.buildResourcePath = (pattern, theme) => {
    return 'output' +
        '/' + pattern.meta.slug +
        '/' + theme.meta.slug;
}

/**
 * Build pattern directory structure.
 * @param  {string} resourcePath Pattern destination.
 * @param  {object} pattern      Pattern object.
 */
exports.buildDirectoryStructure = (resourcePath, pattern) => {
    // Create resource path.
    mkdirp.sync(resourcePath);

    pattern.dirs.map(dir => {
        mkdirp.sync(resourcePath + '/' + dir);
    });
}

/**
 * Generate a resource for a pattern and theme.
 * @param  {object} pattern Pattern object.
 * @param  {object} theme   Theme object.
 */
exports.generateResource = (pattern, theme)  => {

    // Show output.
    exports.renderOutput(pattern, theme);

    // Generate resource path.
    const resourcePath = exports.buildResourcePath(pattern, theme);

    // Build directory structure.
    exports.buildDirectoryStructure(resourcePath, pattern);

    // Copy static files.
    exports.moveFiles(pattern, theme, resourcePath);

    // Render template files.
    exports.renderFiles(pattern, theme, resourcePath);
}

/**
 * Start building the themes.
 */
exports.buildThemes = () => {

    // Load patterns and themes.
    const patterns = loader.loadPatterns();
    const themes   = loader.loadThemes();

    // Clear output directory.
    rimraf('output', () => {

        // Iterate pattern and theme combinations to generate.
        patterns.map(pattern => {
            themes.map(theme => exports.generateResource(pattern, theme));
        });

    });
}
