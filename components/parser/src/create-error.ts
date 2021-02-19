import { Position } from '@vaceline/types'
import * as chalk from '@vaceline/utils'

const MARGIN = 2
const HORIZONTAL_MARK = '> '
const VERTICAL_MARK = '^'

export function createError(
  source: string,
  message: string,
  start: Position,
  end: Position
): SyntaxError {
  const topLineNumber = start.line >= MARGIN ? start.line - MARGIN : start.line
  const topLineOffset = topLineNumber - 1 // zero-offset

  const indicator = source
    .split('\n')
    .slice(topLineOffset, topLineOffset + MARGIN * 2 + 1)
    .map((line, i) => {
      const lineNumber = topLineNumber + i
      const lineOffset = topLineOffset + i

      const bar = chalk.gray(String(lineNumber) + ' | ')

      if (lineNumber === start.line) {
        return [
          chalk.red(HORIZONTAL_MARK) + bar + line,
          ' '.repeat(5 + String(lineOffset).length + start.column - 1) +
            chalk.red(VERTICAL_MARK.repeat(end.offset + 1 - start.offset)),
        ]
      }

      return ' '.repeat(HORIZONTAL_MARK.length) + bar + line
    })
    .flat()
    .join('\n')

  return new SyntaxError(message + '\n\n' + indicator + '\n')
}
