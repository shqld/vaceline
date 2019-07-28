import chalk from 'chalk'
import { assert } from '../utils/assert'

const MARGIN = 2
const HORIZONTAL_MARK = '> '
const VERTICAL_MARK = '^'

const getLocation = (lines: Array<string>, start: number, end?: number) => {
  if (end && start > end)
    throw new Error('invalid end offset (end number is less than start)')

  let acc = 0
  let line: number
  let column: number
  let range: number = 1

  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length
    acc += lineLength

    if (acc > start) {
      // Add 1 because line & col count from 1
      line = i + 1
      column = start - (acc - lineLength) + 1

      if (end) {
        if (end + 1 > acc)
          throw new Error('invalid end offset (end number exceeds line)')

        range = end - start + 1
      }
      break
    }
  }

  if (line! === undefined || column! === undefined)
    throw new Error('invalid start offset')

  return { line, column, range }
}

export const createError = (
  source: string,
  message: string,
  start: number,
  end?: number
): SyntaxError => {
  const lines = source.split('\n')

  const loc = getLocation(lines, start, end)

  const topLine = loc.line - MARGIN - 1 > 0 ? loc.line - MARGIN - 1 : 0
  const bottomLine =
    loc.line + MARGIN <= lines.length ? loc.line + MARGIN : lines.length

  const pad = String(bottomLine).length // The max of line num digits

  const verticalMark =
    ' '.repeat('> '.length + pad + ' | '.length + loc.column - 1) +
    chalk.redBright.bold(VERTICAL_MARK.repeat(loc.range))

  const errorLocationDisplay: Array<String> = []

  lines.slice(topLine, bottomLine).forEach((lineStr, num) => {
    const currentLine = topLine + num + 1
    const isTargetLine = currentLine === loc.line

    // `90 | `
    const lineIndicator = String(currentLine).padStart(pad) + ' | '

    // `> `
    const horizontalMark = isTargetLine
      ? chalk.redBright.bold(HORIZONTAL_MARK)
      : ' '.repeat(HORIZONTAL_MARK.length)

    // `> 90 | source`
    errorLocationDisplay.push(
      horizontalMark + chalk.gray(lineIndicator) + lineStr
    )

    if (isTargetLine) errorLocationDisplay.push(verticalMark)
  })

  return new SyntaxError(message + '\n\n' + errorLocationDisplay.join('\n'))
}
