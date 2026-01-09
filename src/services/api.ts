import { InitializeResponse, OtpResponse, LinkRequest, LinkResponse, ApiError } from '../types';

const API_BASE_URL = 'https://api.upay.com/v1'; // URL base del backend

// Simulación de delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // En producción, aquí harías la llamada real al backend
      // const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      // if (!response.ok) throw new Error('Request failed');
      // return await response.json();
      
      // Por ahora, retornamos los mocks
      return await this.getMockResponse<T>(endpoint, options);
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Error desconocido',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  private async getMockResponse<T>(endpoint: string, options: RequestInit): Promise<T> {
    // Simular delay de red
    await delay(1500);

    if (endpoint === '/pos/initialize') {
      // Mock: 50% de probabilidad de estar vinculado
      const isLinked = Math.random() > 0.5;
      return {
        isLinked,
        message: isLinked ? 'POS ya vinculado' : 'POS requiere vinculación',
      } as T;
    }

    if (endpoint === '/pos/otp') {
      // Generar OTP de 3 cifras
      const otp = Math.floor(100 + Math.random() * 900).toString();
      return {
        otp,
        expiresIn: 20,
      } as T;
    }

    if (endpoint === '/pos/link' && options.method === 'POST') {
      const body = JSON.parse(options.body as string) as LinkRequest;
      
      // Mock: validar que el OTP tenga 3 dígitos
      if (body.otp && body.otp.length === 3) {
        // 90% de probabilidad de éxito
        const success = Math.random() > 0.1;
        return {
          success,
          message: success ? 'Vinculación exitosa' : 'Error en la vinculación',
        } as T;
      }
      
      throw {
        message: 'OTP inválido',
        code: 'INVALID_OTP',
      } as ApiError;
    }

    throw {
      message: 'Endpoint no encontrado',
      code: 'NOT_FOUND',
    } as ApiError;
  }

  async initialize(): Promise<InitializeResponse> {
    return this.request<InitializeResponse>('/pos/initialize');
  }

  async getOtp(): Promise<OtpResponse> {
    return this.request<OtpResponse>('/pos/otp');
  }

  async link(otp: string): Promise<LinkResponse> {
    return this.request<LinkResponse>('/pos/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp } as LinkRequest),
    });
  }

  /**
   * Método genérico para llamadas API (compatible con bffClient.callApi)
   * Usado en modo OTA cuando no hay servidor BFF
   */
  async callApi<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    // Normalizar el endpoint (remover /api si está presente)
    const normalizedEndpoint = endpoint.startsWith('/api') 
      ? endpoint.replace('/api', '') 
      : endpoint;
    
    return this.request<T>(normalizedEndpoint, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }
}

export const apiService = new ApiService();
