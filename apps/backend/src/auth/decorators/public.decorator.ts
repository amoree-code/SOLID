import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as not requiring a valid access token — e.g. login, refresh. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
