const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'data', 'english-urdu-dictionary.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const seen = new Map();
const duplicates = [];
const uniqueLines = [];

// Header lines (before the dictionary entries)
let headerLines = [];
let footerLines = [];
let entriesStarted = false;
let entriesEnded = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*\['(.*?)',/);

    if (match) {
        entriesStarted = true;
        const key = match[1].toLowerCase().trim();
        if (seen.has(key)) {
            duplicates.push({ key, line: i + 1, originalLine: seen.get(key) });
        } else {
            seen.set(key, i + 1);
            uniqueLines.push(line);
        }
    } else {
        if (!entriesStarted) {
            headerLines.push(line);
        } else if (line.trim() === ']);') {
            entriesEnded = true;
            footerLines.push(line);
        } else if (entriesEnded) {
            footerLines.push(line);
        } else {
            // Lines between entries or stray lines
            if (line.trim() !== '') {
                uniqueLines.push(line);
            }
        }
    }
}

console.log('Total unique entries:', seen.size);
console.log('Total duplicates removed:', duplicates.length);

const newContent = [...headerLines, ...uniqueLines, ...footerLines].join('\n');
fs.writeFileSync(filePath, newContent);
console.log('Cleaned dictionary written back to file.');
