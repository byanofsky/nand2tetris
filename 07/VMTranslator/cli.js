#!/usr/bin/env node

const vmTranslator = require('./dist/').default;

const cli = () => {
  const filePath = process.argv[2];
  vmTranslator(filePath);
};

cli();
