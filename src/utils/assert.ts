import { isDev } from './env'

export const assert: typeof console.assert = isDev ? console.assert : () => {}
