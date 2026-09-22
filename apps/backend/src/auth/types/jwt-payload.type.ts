export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

export type RefreshTokenPayload = {
  sub: string;
};
