import { isDev } from './env'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const assert: typeof console.assert = isDev ? console.assert : () => {}
