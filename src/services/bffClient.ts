/**
 * Cliente para comunicarse con el BFF (Backend for Frontend)
 */

import { getBFFBaseURL } from '../utils/getLocalIP';

// Obtener la URL base del BFF
// En desarrollo: usa localhost (con adb reverse) o IP local (para dispositivos físicos)
// En producción: usa la URL del servidor real
const BFF_BASE_URL = getBFFBaseURL();

export interface ScreenDefinition {
  id: string;
  type: string;
  layout: any;
  actions?: any[];
  hooks?: any[];
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

class BffClient {
  private baseUrl: string;

  constructor(baseUrl: string = BFF_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtiene la definición de UI para una pantalla
   */
  async getScreenDefinition(
    screenId: string,
    context: Record<string, any> = {}
  ): Promise<ScreenDefinition> {
    try {
      const contextParam = encodeURIComponent(JSON.stringify(context));
      const response = await fetch(
        `${this.baseUrl}/api/screens/${screenId}?context=${contextParam}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching screen definition:', error);
      throw error;
    }
  }

  /**
   * Realiza una llamada a la API del BFF
   */
  async callApi<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    try {
      const { method = 'GET', body, headers = {} } = options;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Error desconocido',
          code: 'UNKNOWN_ERROR',
        }));
        throw errorData;
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }

  /**
   * Health check del BFF
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const bffClient = new BffClient();