export const topLevelKeywords = new Set([
  'include',
  'import',
  'sub',
  'acl',
  'backend',
])

export const keywords = new Set([
  // statement directives
  'call',
  'declare',
  'local',
  'declare',
  'local',
  'add',
  'set',
  'unset',
  'return',
  'error',
  'restart',
  'synthetic',
  'log',
  'if',
  'else',
  ...topLevelKeywords,
])

export const returnActions = new Set(['deliver', 'pass', 'fetch', 'lookup'])
