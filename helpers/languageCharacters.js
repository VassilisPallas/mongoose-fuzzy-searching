const letters = {
  α: 'a',
  ά: 'a',
  αυ: 'af',
  αύ: 'af',
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  ą: 'a',
  β: 'v',
  ß: 's',
  ç: 'c',
  γ: 'g',
  γγ: 'ng',
  γκ: 'gk',
  γξ: 'nx',
  δ: 'd',
  ð: 'd',
  ε: 'e',
  æ: 'e',
  έ: 'e',
  ευ: 'ev',
  εύ: 'ev',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ζ: 'z',
  η: 'i',
  ή: 'i',
  ηυ: 'if',
  θ: 'th',
  ι: 'i',
  ί: 'i',
  ϊ: 'i',
  ἰ: 'i',
  ΐ: 'i',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ñ: 'n',
  ξ: 'ks',
  ο: 'o',
  ό: 'o',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ø: 'o',
  π: 'p',
  þ: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  τ: 't',
  υ: 'u',
  ύ: 'u',
  ϋ: 'u',
  ΰ: 'u',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  φ: 'f',
  ý: 'y',
  ÿ: 'y',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
  ώ: 'o',
};

const handleGreekIdioms = (ch, nextCh) => {
  let found = false;
  let letter = null;

  if (!nextCh) {
    return { letter: letters[ch], found };
  }

  switch (ch) {
    case 'α':
    case 'ε':
    case 'γ':
    case 'η':
      letter = letters[`${ch}${nextCh}`];
      found = !!letter;
      break;
    default:
      break;
  }

  return { letter: letter || letters[ch], found };
};

module.exports = (word) => {
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
