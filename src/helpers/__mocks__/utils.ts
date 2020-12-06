export const prepareNgrams = jest.fn(() => ({
  text: '',
  escapeSpecialCharacters: true,
  minSize: 2,
  prefixOnly: false,
}));

export const replaceSymbols = jest.fn((text: string) => text.toLowerCase());

export const isString = jest.fn(() => true);
