#!/usr/bin/env node

/**
 * Generate llms.txt for the Narou API wrapper library using TypeDoc JSON output
 * This script creates a comprehensive documentation file for LLMs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

function formatComment(comment) {
  if (!comment || !comment.summary) return '';
  return comment.summary.map(part => part.text || '').join('');
}

function formatType(type) {
  if (!type) return 'unknown';
  
  switch (type.type) {
    case 'intrinsic':
      return type.name;
    case 'reference':
      return type.name;
    case 'array':
      return `${formatType(type.elementType)}[]`;
    case 'union':
      return type.types.map(formatType).join(' | ');
    case 'literal':
      return JSON.stringify(type.value);
    default:
      return type.name || 'unknown';
  }
}

function formatParameters(parameters) {
  if (!parameters || parameters.length === 0) return '';
  
  return parameters.map(param => {
    const optional = param.flags?.isOptional ? '?' : '';
    const type = formatType(param.type);
    const comment = formatComment(param.comment);
    return `- \`${param.name}${optional}: ${type}\` - ${comment}`;
  }).join('\n');
}

function formatFunction(func) {
  const comment = formatComment(func.comment);
  const signatures = func.signatures || [];
  
  let result = `### ${func.name}\n\n`;
  if (comment) {
    result += `${comment}\n\n`;
  }
  
  signatures.forEach(sig => {
    const params = formatParameters(sig.parameters);
    const returnType = formatType(sig.type);
    
    result += `**Signature:** \`${sig.name}(${sig.parameters?.map(p => `${p.name}${p.flags?.isOptional ? '?' : ''}: ${formatType(p.type)}`).join(', ') || ''}): ${returnType}\`\n\n`;
    
    if (params) {
      result += `**Parameters:**\n${params}\n\n`;
    }
  });
  
  return result;
}

function formatClass(cls) {
  const comment = formatComment(cls.comment);
  let result = `## ${cls.name}\n\n`;
  
  if (comment) {
    result += `${comment}\n\n`;
  }
  
  const methods = cls.children?.filter(child => child.kind === 2048) || []; // Method kind
  const properties = cls.children?.filter(child => child.kind === 1024) || []; // Property kind
  
  if (properties.length > 0) {
    result += `### Properties\n\n`;
    properties.forEach(prop => {
      const propComment = formatComment(prop.comment);
      const propType = formatType(prop.type);
      result += `- \`${prop.name}: ${propType}\` - ${propComment}\n`;
    });
    result += '\n';
  }
  
  if (methods.length > 0) {
    result += `### Methods\n\n`;
    methods.forEach(method => {
      result += formatFunction(method);
    });
  }
  
  return result;
}

function formatInterface(iface) {
  const comment = formatComment(iface.comment);
  let result = `## ${iface.name}\n\n`;
  
  if (comment) {
    result += `${comment}\n\n`;
  }
  
  const properties = iface.children || [];
  if (properties.length > 0) {
    result += `### Properties\n\n`;
    properties.forEach(prop => {
      const propComment = formatComment(prop.comment);
      const propType = formatType(prop.type);
      const optional = prop.flags?.isOptional ? '?' : '';
      result += `- \`${prop.name}${optional}: ${propType}\` - ${propComment}\n`;
    });
    result += '\n';
  }
  
  return result;
}

async function processTypeDocJson(jsonPath) {
  const jsonContent = await readFile(jsonPath);
  if (!jsonContent) return '';
  
  const apiDoc = JSON.parse(jsonContent);
  let result = '';
  
  // Process main exports
  const children = apiDoc.children || [];
  
  const classes = children.filter(child => child.kind === 128); // Class kind
  const interfaces = children.filter(child => child.kind === 256); // Interface kind  
  const functions = children.filter(child => child.kind === 64); // Function kind
  const enums = children.filter(child => child.kind === 8); // Enum kind
  const types = children.filter(child => child.kind === 4194304); // Type alias kind
  
  if (classes.length > 0) {
    result += `# Classes\n\n`;
    classes.forEach(cls => {
      result += formatClass(cls);
    });
  }
  
  if (interfaces.length > 0) {
    result += `# Interfaces\n\n`;
    interfaces.forEach(iface => {
      result += formatInterface(iface);
    });
  }
  
  if (functions.length > 0) {
    result += `# Functions\n\n`;
    functions.forEach(func => {
      result += formatFunction(func);
    });
  }
  
  if (enums.length > 0) {
    result += `# Enums\n\n`;
    enums.forEach(enumItem => {
      const comment = formatComment(enumItem.comment);
      result += `## ${enumItem.name}\n\n`;
      if (comment) {
        result += `${comment}\n\n`;
      }
      
      const members = enumItem.children || [];
      members.forEach(member => {
        const memberComment = formatComment(member.comment);
        result += `- \`${member.name}\` - ${memberComment}\n`;
      });
      result += '\n';
    });
  }
  
  if (types.length > 0) {
    result += `# Type Aliases\n\n`;
    types.forEach(type => {
      const comment = formatComment(type.comment);
      const typeInfo = formatType(type.type);
      result += `## ${type.name}\n\n`;
      if (comment) {
        result += `${comment}\n\n`;
      }
      result += `\`\`\`typescript\ntype ${type.name} = ${typeInfo}\n\`\`\`\n\n`;
    });
  }
  
  return result;
}

async function generateLlmsTxt() {
  console.log('Generating llms.txt from TypeDoc JSON...');
  
  const sections = [];
  
  // Header
  sections.push(`# Narou API Wrapper - LLM Documentation

This is a TypeScript library that provides a fluent interface wrapper for the Narou (小説家になろう) developer APIs.
It supports both Node.js (using fetch) and browser environments (using JSONP).

Generated on: ${new Date().toISOString()}

`);

  // README
  const readme = await readFile(path.join(rootDir, 'README.md'));
  if (readme) {
    sections.push(`## README

${readme}

`);
  }

  // Package.json for dependency information
  const packageJson = await readFile(path.join(rootDir, 'package.json'));
  if (packageJson) {
    sections.push(`## Package Information

\`\`\`json
${packageJson}
\`\`\`

`);
  }

  // TypeDoc API Documentation
  const apiJsonPath = path.join(rootDir, 'docs', 'api.json');
  const apiDocumentation = await processTypeDocJson(apiJsonPath);
  if (apiDocumentation) {
    sections.push(`## API Documentation

${apiDocumentation}

`);
  }

  // Supported APIs info
  sections.push(`## Supported APIs

This library wraps the following Narou developer APIs:

- [なろう小説 API](https://dev.syosetu.com/man/api/) - Novel search API
- [なろう小説ランキング API](https://dev.syosetu.com/man/rankapi/) - Novel ranking API  
- [なろう殿堂入り API](https://dev.syosetu.com/man/rankinapi/) - Ranking history API
- [なろう R18 小説 API](https://dev.syosetu.com/xman/api/) - R18 novel search API
- [なろうユーザ検索 API](https://dev.syosetu.com/man/userapi/) - User search API

## Architecture

The library uses a builder pattern with fluent interfaces for API construction.
It provides dual environment support through different entry points:

- \`src/index.ts\` - Node.js entry point using fetch
- \`src/index.browser.ts\` - Browser entry point using JSONP

The core architecture includes:
- Abstract base classes for builders
- Environment-specific API implementations  
- Type-safe field selection with TypeScript generics
- Comprehensive test coverage with MSW mocking

## Usage Examples

\`\`\`typescript
import { search, ranking, rankingHistory, searchR18 } from "narou";

// Basic search
const results = await search("異世界")
  .genre(Genre.RenaiIsekai)
  .order(Order.FavoriteNovelCount)
  .execute();

// Ranking
const ranking = await ranking()
  .date(new Date())
  .type(RankingType.Daily)
  .execute();

// R18 search
const r18Results = await searchR18("word")
  .r18Site(R18Site.Nocturne)
  .execute();
\`\`\`

`);

  const llmsTxt = sections.join('');
  
  // Write to docs directory
  const docsDir = path.join(rootDir, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(path.join(docsDir, 'llms.txt'), llmsTxt);
  
  console.log('Generated llms.txt successfully!');
  console.log(`File size: ${(llmsTxt.length / 1024).toFixed(1)} KB`);
}

generateLlmsTxt().catch(console.error);