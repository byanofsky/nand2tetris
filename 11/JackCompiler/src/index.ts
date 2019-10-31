#!/usr/bin/env node

import JackCompiler from './JackCompiler';

const filePath = process.argv[2];
const jackCompiler = new JackCompiler();
jackCompiler.analyze(filePath);
