let clientAccessToken: string | null = null;

export function setClientAccessToken(token: string | null) {
  clientAccessToken = token;
}

export function getToken() {
  return clientAccessToken;
}

export function clearSession() {
  clientAccessToken = null;
}
