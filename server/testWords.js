const fs = require('fs');
const path = require('path');
const wordListPath = path.join(path.dirname(require.resolve('word-list')), 'words.txt');
const englishWords = new Set(fs.readFileSync(wordListPath, 'utf8').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean));
console.log('gggg:', englishWords.has('gggg'));
console.log('fff:', englishWords.has('fff'));
console.log('hhh:', englishWords.has('hhh'));
console.log('iii:', englishWords.has('iii'));
console.log('jjj:', englishWords.has('jjj'));
