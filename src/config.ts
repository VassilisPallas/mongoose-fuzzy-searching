export type Config = {
  DEFAULT_MIN_SIZE: number;
  DEFAULT_PREFIX_ONLY: boolean;
  ESCAPE_SPECIAL_CHARACTERS: boolean;
  DEFAULT_EXACT_SEARCH: boolean;
};

const config: Config = {
  DEFAULT_MIN_SIZE: 2,
  DEFAULT_PREFIX_ONLY: false,
  ESCAPE_SPECIAL_CHARACTERS: true,
  DEFAULT_EXACT_SEARCH: false,
};

export default config;
