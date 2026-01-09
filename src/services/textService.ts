/**
 * Servicio para cargar textos desde archivo JSON externo
 * Permite cambiar textos sin modificar código, solo editando el JSON y publicando OTA
 */

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

class TextService {
  private texts: TextsConfig;

  constructor() {
    // Cargar textos desde el JSON
    this.texts = textsData as TextsConfig;
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
}

// Singleton instance
export const textService = new TextService();
