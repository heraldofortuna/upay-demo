/**
 * Servicio para cargar textos desde API remota (BFF)
 * Si la API no está disponible, usa el JSON local como fallback
 */

import { getBFFBaseURL } from '../utils/getLocalIP';
import textsData from '../config/texts.json';

export interface TextsConfig {
  screens: {
    Initializing: { loaderText: string };
    LinkingStep1: { title: string; subtitle: string; button: string };
    LinkingStep2: { title: string; subtitle: string; button: string };
    LinkingStep3: { title: string; subtitle: string; button: string };
    OtpScreen: {
      title: string;
      label: string;
      timerPrefix: string;
      timerSuffix: string;
      timerSuffixPlural: string;
      buttonContinue: string;
      buttonCancel: string;
      loadingOtp: string;
    };
    Linking: { loaderText: string };
    Waiting: { title: string; subtitle: string };
    ReadingCard: { loaderText: string };
    Error: { title: string; defaultMessage: string; buttonRetry: string };
  };
  errors: {
    initialize: string;
    otp: string;
    link: string;
    network: string;
  };
}

class TextServiceRemote {
  private texts: TextsConfig;
  private useRemote: boolean;
  private bffBaseUrl: string;

  constructor() {
    this.bffBaseUrl = getBFFBaseURL();
    this.useRemote = __DEV__ && this.bffBaseUrl.includes('localhost');
    this.texts = textsData as TextsConfig;
    
    // Intentar cargar desde API si está disponible
    if (this.useRemote) {
      this.loadFromAPI().catch(() => {
        console.log('📝 Usando textos locales (JSON)');
      });
    }
  }

  /**
   * Carga textos desde la API del BFF
   */
  private async loadFromAPI(): Promise<void> {
    try {
      const response = await fetch(`${this.bffBaseUrl}/api/admin/texts/all`, {
        headers: {
          // En desarrollo, podrías no necesitar API key
          // En producción, requerirías autenticación
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.texts) {
          // Convertir estructura de API a estructura local
          this.texts = this.convertAPIToLocal(data.texts);
          console.log('📝 Textos cargados desde API remota');
          return;
        }
      }
    } catch (error) {
      // Silenciosamente fallar a JSON local
      console.log('📝 API no disponible, usando textos locales');
    }
  }

  /**
   * Convierte estructura de API a estructura local
   */
  private convertAPIToLocal(apiTexts: Record<string, Record<string, any>>): TextsConfig {
    const local: TextsConfig = {
      screens: {} as any,
      errors: {},
    };

    // Convertir textos de pantallas
    for (const [screenName, texts] of Object.entries(apiTexts)) {
      if (screenName === 'errors') {
        local.errors = texts as any;
      } else {
        (local.screens as any)[screenName] = texts;
      }
    }

    // Mergear con JSON local para campos faltantes
    return {
      screens: { ...this.texts.screens, ...local.screens },
      errors: { ...this.texts.errors, ...local.errors },
    };
  }

  /**
   * Obtiene un texto de una pantalla específica
   */
  getScreenText(screenName: keyof TextsConfig['screens'], key: string): string {
    const screen = this.texts.screens[screenName];
    if (!screen) {
      console.warn(`Screen ${screenName} not found in texts`);
      return '';
    }
    return (screen as any)[key] || '';
  }

  /**
   * Obtiene un mensaje de error
   */
  getError(key: keyof TextsConfig['errors']): string {
    return this.texts.errors[key] || this.texts.errors.network;
  }

  /**
   * Obtiene todos los textos de una pantalla
   */
  getScreenTexts<T extends keyof TextsConfig['screens']>(
    screenName: T
  ): TextsConfig['screens'][T] {
    return this.texts.screens[screenName];
  }

  /**
   * Obtiene todos los textos (útil para debugging)
   */
  getAllTexts(): TextsConfig {
    return this.texts;
  }

  /**
   * Recarga textos desde la API
   */
  async reloadFromAPI(): Promise<void> {
    await this.loadFromAPI();
  }
}

// Singleton instance
export const textServiceRemote = new TextServiceRemote();
