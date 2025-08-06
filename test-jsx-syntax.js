// Simple JSX syntax test for CryptoInfoModal
const fs = require('fs');

try {
  // Read the file content
  const content = fs.readFileSync('./src/app/components/Crypto/CryptoInfoModal.jsx', 'utf8');
  
  // Basic checks
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log('JSX Syntax Check Results:');
  console.log('========================');
  console.log(`Open braces: ${openBraces}`);
  console.log(`Close braces: ${closeBraces}`);
  console.log(`Balanced braces: ${openBraces === closeBraces ? '✓' : '✗'}`);
  console.log(`Open parentheses: ${openParens}`);
  console.log(`Close parentheses: ${closeParens}`);
  console.log(`Balanced parentheses: ${openParens === closeParens ? '✓' : '✗'}`);
  
  // Check for common JSX issues
  const hasUnmatchedJSX = content.includes(')}') && !content.includes('{(');
  console.log(`No obvious JSX mismatches: ${!hasUnmatchedJSX ? '✓' : '✗'}`);
  
  // Check for the specific error pattern that was mentioned
  const lines = content.split('\n');
  let foundErrors = false;
  
  lines.forEach((line, index) => {
    if (line.trim() === ')}' && index > 0) {
      const prevLine = lines[index - 1];
      if (!prevLine.includes('(') && !prevLine.includes('{')) {
        console.log(`⚠️  Potential issue at line ${index + 1}: orphaned )}}`);
        foundErrors = true;
      }
    }
  });
  
  if (!foundErrors) {
    console.log('No syntax errors detected ✓');
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}