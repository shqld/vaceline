import fs from 'fs'
import path from 'path'

// readdir recursively
export const readdirr = (dirPath: string): Array<string> =>
  fs.statSync(dirPath).isDirectory()
    ? fs
        .readdirSync(dirPath)
        .reduce(
          (acc, p) => acc.concat(readdirr(path.join(dirPath, p))),
          [] as Array<string>
        )
    : [dirPath]
