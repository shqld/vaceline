declare type Class<T> = { new (...args: any[]): T }
declare type Emit<T, U> = { [K in Exclude<keyof T, U>]: T[K] }
