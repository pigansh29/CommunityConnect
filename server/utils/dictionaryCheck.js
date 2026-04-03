/**
 * Loads the English word list once at startup and exposes a fast Set-based lookup.
 * Using a Set allows O(1) membership checks per word.
 */
const fs = require('fs');
const path = require('path');

// word-list is an ES module exporting a default path — resolve it manually
const wordListPath = path.join(
    path.dirname(require.resolve('word-list')),
    'words.txt'
);

// Load all ~274,000 English words into a Set for fast lookup
const englishWords = new Set(
    fs.readFileSync(wordListPath, 'utf8')
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
);

/**
 * Returns the ratio of real English words in a word list.
 * Ignores very short words (1–2 chars) like "a", "is", "at".
 *
 * @param {string[]} words - Array of words to check
 * @returns {number} - Ratio between 0 and 1
 */
function getRealWordRatio(words) {
    const meaningful = words.filter(w => w.length >= 3);
    if (meaningful.length === 0) return 1; // Nothing to check

    const realCount = meaningful.filter(w => englishWords.has(w.toLowerCase())).length;
    return realCount / meaningful.length;
}

module.exports = { getRealWordRatio };
