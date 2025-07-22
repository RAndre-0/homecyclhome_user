import { getCookie } from 'cookies-next';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Le booléen auth permet de savoir si l'on doit ajouter le token d'authentification
interface RequestOptions {
  method: HttpMethod;
  body?: any;
  auth?: boolean;
}

export const apiService = async (
  endpoint: string,
  method: HttpMethod,
  body?: any,
  auth: boolean = true
) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = getCookie('token') as string | undefined;
      if (!token) throw new Error("Token is missing from cookies");
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}${endpoint}`, {
      method,
      headers,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error("API Service Error:", error);
    throw error;
  }
};

export const convertKeysToCamel = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(convertKeysToCamel)
  } else if (input && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      acc[camelKey] = convertKeysToCamel(value)
      return acc
    }, {} as Record<string, any>)
  }
  return input
};

