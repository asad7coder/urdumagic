const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(__dirname, '..', 'src', 'data', 'english-urdu-dictionary.ts');
const jsonFilePath = path.join(__dirname, '..', 'src', 'data', 'english-urdu-dictionary.json');

const content = fs.readFileSync(tsFilePath, 'utf8');

// Use regex to extract the entries
// Pattern matches: ['key', { ... }]
const entriesMatch = content.match(/\[\s*['"](.*?)['"]\s*,\s*({[\s\S]*?})\s*\]/g);

if (!entriesMatch) {
  console.error('No entries found in dictionary file');
  process.exit(1);
}

const dictionary = {};

entriesMatch.forEach(entry => {
  const match = entry.match(/\[\s*['"](.*?)['"]\s*,\s*({[\s\S]*?})\s*\]/);
  if (match) {
    const key = match[1];
    let valueStr = match[2];
    
    // Convert JS object-like string to JSON
    // 1. Wrap keys in quotes if they aren't
    valueStr = valueStr.replace(/(\w+):/g, '"$1":');
    // 2. Convert single quotes to double quotes for strings
    valueStr = valueStr.replace(/'(.*?)'/g, '"$1"');
    
    try {
      dictionary[key] = JSON.parse(valueStr);
    } catch (e) {
      // Fallback for more complex strings
      try {
          // Dangerous but this is a controlled script on local data
          dictionary[key] = eval(`(${match[2]})`);
      } catch (e2) {
          console.warn(`Failed to parse entry: ${key}`);
      }
    }
  }
});

fs.writeFileSync(jsonFilePath, JSON.stringify(dictionary, null, 2), 'utf8');
console.log(`Successfully converted ${Object.keys(dictionary).length} entries to JSON`);
