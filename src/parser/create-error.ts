import * as chalk from '../utils/chalk'
import { Position } from '../nodes'

const MARGIN = 2
const HORIZONTAL_MARK = '> '
const VERTICAL_MARK = '^'

export const createError = (
  source: string,
  message: string,
  start: Position,
  end?: Position
): SyntaxError => {
  const lines = source.split('\n')

  // const loc = getLocation(lines, start, end)
  const loc = {
    line: start.line,
    column: start.column,
    range: end ? end.column - start.column : 1,
  }

  const topLine = loc.line - MARGIN - 1 > 0 ? loc.line - MARGIN - 1 : 0
  const bottomLine =
    loc.line + MARGIN <= lines.length ? loc.line + MARGIN : lines.length

  const pad = String(bottomLine).length // The max of line num digits

  const verticalMark =
    ' '.repeat('> '.length + pad + ' | '.length + loc.column - 1) +
    chalk.red(VERTICAL_MARK.repeat(loc.range))

  const errorLocationDisplay: Array<string> = []

  lines.slice(topLine, bottomLine).forEach((lineStr, num) => {
    const currentLine = topLine + num + 1
    const isTargetLine = currentLine === loc.line

    // `90 | `
    const lineIndicator = String(currentLine).padStart(pad) + ' | '

    // `> `
    const horizontalMark = isTargetLine
      ? chalk.red(HORIZONTAL_MARK)
      : ' '.repeat(HORIZONTAL_MARK.length)

    // `> 90 | source`
    errorLocationDisplay.push(
      horizontalMark + chalk.gray(lineIndicator) + lineStr
    )

    if (isTargetLine) errorLocationDisplay.push(verticalMark)
  })

  return new SyntaxError(message + '\n\n' + errorLocationDisplay.join('\n'))
}
