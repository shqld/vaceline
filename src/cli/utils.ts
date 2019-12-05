import fs from 'fs'
import path from 'path'

// readdir recursively
export const readdirr = (dirPath: string): Array<string> =>
  fs.statSync(dirPath).isDirectory()
    ? fs
        .readdirSync(dirPath)
        .map((p) => readdirr(path.join(dirPath, p)))
        .flat(Infinity)
    : [dirPath]
