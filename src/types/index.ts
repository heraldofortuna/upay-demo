export interface InitializeResponse {
  isLinked: boolean;
  message?: string;
}

export interface OtpResponse {
  otp: string;
  expiresIn: number; // segundos
}

export interface LinkRequest {
  otp: string;
}

export interface LinkResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface CardData {
  cardNumber?: string;
  cardType?: 'credit' | 'debit';
  expiryDate?: string;
  holderName?: string;
}

export type RootStackParamList = {
  Initializing: undefined;
  Waiting: undefined;
  LinkingStep1: undefined;
  LinkingStep2: undefined;
  LinkingStep3: undefined;
  OtpScreen: undefined;
  Linking: { otp: string };
  ReadingCard: { cardData?: CardData };
  Error: { message?: string };
  SDUIScreen: { 
    screenId: string; 
    initialContext?: Record<string, any>;
    [key: string]: any;
  };
};
