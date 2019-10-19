const symbolTokens = [
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',
  '.',
  ',',
  ';',
  '+',
  '-',
  '*',
  '/',
  '&',
  '|',
  '<',
  '>',
  '=',
  '~'
];
const symbolTokensSet = new Set(symbolTokens);

const keywordTokens = [
  'class',
  'constructor',
  'function',
  'method',
  'field',
  'static',
  'var',
  'int',
  'char',
  'boolean',
  'void',
  'true',
  'false',
  'null',
  'this',
  'let',
  'do',
  'if',
  'else',
  'while',
  'return'
];
const keywordSet = new Set<string>(keywordTokens);

const symbolRegex = new RegExp(symbolTokens.map(t => `\\${t}`).join('|'));
const stringConstantRegex = /\"[^\n\"]*\"/;
const integerConstantRegex = /\d+/;
const keyWordOrIdentifierRegex = /\b[A-Za-z]\w*\b/;

const tokenRegex = new RegExp(
  [
    symbolRegex.source,
    stringConstantRegex.source,
    integerConstantRegex.source,
    keyWordOrIdentifierRegex.source
  ].join('|'),
  'g'
);

const inlineCommentsRegex = /\/\/.*?$/gm;
const commentsRegex = /\/\*\*?((?!\*\/).|\n)*\*\//g;
export const removeComments = (code: string) => {
  return code.replace(inlineCommentsRegex, '').replace(commentsRegex, '');
};
export const extractTokens = (code: string) => {
  return code.match(tokenRegex);
};

export const isSymbol = (token: string) => symbolTokensSet.has(token);
export const isStringConstant = (token: string) =>
  token.search(stringConstantRegex) !== -1;
export const isIntegerConstant = (token: string) =>
  token.search(integerConstantRegex) !== -1;
export const isKeyword = (token: string) => keywordSet.has(token);
