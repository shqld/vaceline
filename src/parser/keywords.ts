export const topLevelKeywords = new Set([
  'include',
  'import',
  'sub',
  'acl',
  'backend',
])

export const keywords = new Set([
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
