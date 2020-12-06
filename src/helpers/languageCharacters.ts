import * as letters from './letters.json';

export type Idioms = {
  letter: string;
  found: boolean;
};

const handleGreekIdioms = (ch: string, nextCh: string): Idioms => {
  let found = false;
  let letter = '';

  if (!nextCh) {
    return { letter: letters[ch], found };
  }

  if (['α', 'ά', 'ε', 'έ', 'γ', 'η', 'ή'].includes(ch)) {
    letter = letters[`${ch}${nextCh}`];
    found = !!letter;
  }

  return { letter: letter || letters[ch], found };
};

export default (word: string): string => {
  if (!word) {
    return '';
  }

  let newWord = '';
  let index = 0;

  word = word.toLowerCase();
  while (index < word.length) {
    const ch = word[index];
    const nextCh = word[index + 1];
    let idiom = false;

    if (!letters[ch]) {
      newWord += ch;
    } else {
      const { letter, found } = handleGreekIdioms(ch, nextCh);
      newWord += letter;
      idiom = found;
    }

    index = idiom ? index + 2 : index + 1;
  }

  return newWord;
};
