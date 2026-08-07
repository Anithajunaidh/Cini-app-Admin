/** Payload for POST /auth/login */
export type LoginDto = {
  email: string;
  password: string;
};

/** Response from POST /auth/login */
export type LoginResponseDto = {
  access_token: string;
  refresh_token?: string;
};
