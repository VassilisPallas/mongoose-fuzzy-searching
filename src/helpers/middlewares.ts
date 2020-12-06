import { createNGrams } from './db/fields';
import { HookNextFunction, Fields, Attributes } from '../types';

export const createNGramsMiddleware = (
  attributes: Attributes,
  fields: Fields,
  next: HookNextFunction,
): void => {
  try {
    if (!Array.isArray(attributes)) {
      attributes = [attributes];
    }

    attributes.forEach((attribute: Attributes) => {
      createNGrams(attribute, fields);
    });
    next();
  } catch (err) {
    next(err);
  }
};
