import { maycurRequest } from '../request';

export interface MaycurTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  [key: string]: any;
}

export interface MaycurClientCredentialsPayload {
  client_id: string;
  client_secret: string;
  grant_type?: 'client_credentials';
  scope?: string;
}

function toFormUrlEncoded(data: Record<string, any>) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  return params.toString();
}

/**
 * Get Maycur access token using Client Credentials
 * Default endpoint path is `/c/openapi/oauth2/token`
 *
 * Note: In development, requests are proxied to `https://openapi-ng.maycur.com` via `/proxy-maycur`.
 * In production, you may need a server-side proxy if CORS is restricted.
 */
export function fetchMaycurTokenClientCredentials(
  payload: MaycurClientCredentialsPayload,
  endpoint = '/c/openapi/oauth2/token'
) {
  const { client_id, client_secret, grant_type = 'client_credentials', scope } = payload;
  const body = toFormUrlEncoded({ client_id, client_secret, grant_type, scope });

  return maycurRequest<MaycurTokenResponse>({
    url: endpoint,
    method: 'post',
    data: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  });
}
