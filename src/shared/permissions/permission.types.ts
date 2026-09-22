/**
 * A permission is whatever string the backend actually issues — there is no
 * way for the frontend to know that shape in advance, so this stays a plain
 * `string` rather than a union derived from `permission-map.ts`. Deriving it
 * from a local literal map would silently reject (or worse, type-check but
 * always mismatch) any real permission name the backend didn't happen to
 * match character-for-character.
 */
export type Permission = string;
