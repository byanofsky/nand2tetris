#!/usr/bin/env node

import JackAnalyzer from './JackAnalyzer';

const filePath = process.argv[2];
const jackAnalyzer = new JackAnalyzer();
jackAnalyzer.analyze(filePath);
