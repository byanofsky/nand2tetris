#!/usr/bin/env node

import JackAnalyzer from './JackAnalyzer';

const filePath = process.argv[2];
const jackCompiler = new JackAnalyzer();
jackCompiler.analyze(filePath);
