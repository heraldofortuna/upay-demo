/**
 * Servicio mock para operaciones del POS
 */

class MockPosService {
  constructor() {
    this.isLinked = Math.random() > 0.5; // 50% de probabilidad de estar vinculado inicialmente
    this.currentOtp = null;
    this.otpExpiry = null;
  }

  initialize() {
    // Mock: 50% de probabilidad de estar vinculado
    const isLinked = this.isLinked;
    return {
      isLinked,
      message: isLinked ? 'POS ya vinculado' : 'POS requiere vinculación',
    };
  }

  getOtp() {
    // Generar OTP de 3 cifras
    const otp = Math.floor(100 + Math.random() * 900).toString();
    this.currentOtp = otp;
    this.otpExpiry = Date.now() + 20000; // 20 segundos

    return {
      otp,
      expiresIn: 20,
    };
  }

  link(otp) {
    // En modo demo, siempre aceptar cualquier OTP de 3 dígitos
    const otpString = String(otp || '').trim();
    console.log('otpString', otp, otpString);
    // Validar que tenga 3 dígitos
    if (!otpString || otpString.length !== 3 || !/^\d{3}$/.test(otpString)) {
      throw {
        message: 'OTP inválido. Debe tener 3 dígitos.',
        code: 'INVALID_OTP',
      };
    }

    // En modo demo, siempre éxito (100% de probabilidad)
    this.isLinked = true;
    this.currentOtp = null;
    this.otpExpiry = null;

    return {
      success: true,
      message: 'Vinculación exitosa',
    };
  }
}

export const mockPosService = new MockPosService();