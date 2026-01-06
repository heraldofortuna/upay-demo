import { mockPosService } from '../mocks/posService.js';

/**
 * Inicializa el POS y verifica si está vinculado
 * @returns {Promise<{isLinked: boolean, message?: string}>}
 */
export async function initializePos() {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  return mockPosService.initialize();
}

/**
 * Obtiene un código OTP para vinculación
 * @returns {Promise<{otp: string, expiresIn: number}>}
 */
export async function getOtp() {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  return mockPosService.getOtp();
}

/**
 * Vincula el POS usando un código OTP
 * @param {string} otp - Código OTP
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function linkPos(otp) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Validación básica - el mock se encargará de la validación detallada
  const otpString = String(otp || '').trim();
  if (!otpString) {
    throw {
      message: 'OTP inválido',
      code: 'INVALID_OTP',
    };
  }

  return mockPosService.link(otpString);
}