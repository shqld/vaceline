export const assert: typeof console.assert =
  // FIXME: remove undefined handling after server-side is also built by webpack
  typeof BUILD_ENV === 'undefined' && BUILD_ENV === 'development'
    ? console.assert
    : // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
