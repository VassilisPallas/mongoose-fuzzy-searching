import { replaceSymbols, isFunction, isObject, isString } from './utils';

describe('replaceSymbols', () => {
  it('should return `hello world` when the given string is `hello_world`', () => {
    expect(replaceSymbols('hello_world', false)).toBe('hello world');
  });

  it('should return `exampledomaincom` when the given string is `example@domain.com`', () => {
    expect(replaceSymbols('example@domain.com', true)).toBe('exampledomaincom');
  });

  it('should return `example@domain.com` when the given string is `example@domain.com`', () => {
    expect(replaceSymbols('example@domain.com', false)).toBe('example@domain.com');
  });
});

describe('isObject', () => {
  it('should return false when the parameter is array', () => {
    expect(isObject([])).toBeFalsy();
  });

  it('should return false when object is empty', () => {
    expect(isObject({})).toBeFalsy();
  });

  it('should return false when object is function', () => {
    expect(isObject(jest.fn)).toBeFalsy();
  });

  it('should return true when the parameter is an object', () => {
    expect(isObject({ name: 'Joe' })).toBeTruthy();
  });
});

describe('isFunction', () => {
  it('should return false when the parameter is array', () => {
    expect(isFunction([])).toBeFalsy();
  });

  it('should return false when the parameter is null', () => {
    expect(isFunction(null)).toBeFalsy();
  });

  it('should return false when the parameter is object', () => {
    expect(isFunction({})).toBeFalsy();
  });

  it('should return true when the parameter is a function', () => {
    expect(isFunction(jest.fn)).toBeTruthy();
  });
});

describe('isString', () => {
  it('should return false when the parameter is array', () => {
    expect(isString([])).toBeFalsy();
  });

  it('should return false when the parameter is null', () => {
    expect(isString(null)).toBeFalsy();
  });

  it('should return false when the parameter is object', () => {
    expect(isString({})).toBeFalsy();
  });

  it('should return true when the parameter is a string', () => {
    expect(isString('test')).toBeTruthy();
  });
});
