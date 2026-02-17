#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { runAllTests } = require('../tests/assignment.test.ts');

console.log('🧪 Running Assignment System Tests...\n');

runAllTests().catch((error) => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});