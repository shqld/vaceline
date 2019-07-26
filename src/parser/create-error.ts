import chalk from 'chalk'
import { Position } from './tokenizer'

const TOP_MARGIN = 2
const BOTTOM_MARGIN = 1

// TODO: still buggy in the case of source with too few lines
export const createError = (
  source: string,
  message: string,
  lineNum: number,
  colNum: number
): SyntaxError => {
  // const { line: lineNum, column: colNum } = position

  const topLine = lineNum - TOP_MARGIN
  const bottomLine = lineNum + BOTTOM_MARGIN

  const hMark = '> '
  const vMark = '^'
  const pad = String(bottomLine).length

  const targets = source
    .split('\n')
    .slice(topLine, bottomLine)
    .map((line, num) => {
      num++ // line index != line number

      const currentLine = topLine + num

      const lineIndicator = chalk.gray(
        String(currentLine).padStart(pad) + ' | '
      )

      if (currentLine === lineNum) {
        return (
          chalk.redBright.bold(hMark) +
          lineIndicator +
          line +
          '\n' +
          ' '.repeat(colNum + pad + '>  | '.length - 1) +
          chalk.redBright.bold(vMark)
        )
      }

      return ' '.repeat(hMark.length) + lineIndicator + line
    })

  const err = new SyntaxError(message + '\n\n' + targets.join('\n'))

  return err
}
