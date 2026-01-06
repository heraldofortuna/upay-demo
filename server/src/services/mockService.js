/**
 * Servicio para obtener datos mock
 */
export function getMockData(mockId, query = {}) {
  const mocks = {
    card: {
      cardNumber: '**** **** **** 1234',
      cardType: 'credit',
      expiryDate: '12/25',
      holderName: 'TARJETA DE PRUEBA',
    },
    posStatus: {
      isLinked: false,
      message: 'POS requiere vinculación',
    },
    otp: {
      otp: Math.floor(100 + Math.random() * 900).toString(),
      expiresIn: 20,
    },
  };

  const mock = mocks[mockId];
  if (!mock) {
    throw new Error(`Mock ${mockId} no encontrado`);
  }

  return mock;
}