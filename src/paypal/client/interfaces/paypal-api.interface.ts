export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  status: string;
  id: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
  payer?: {
    payer_id: string;
  };
}

export interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalErrorResponse {
  name: string;
  message: string;
  debug_id: string;
  details?: Array<{
    field: string;
    location: string;
    issue: string;
    description?: string;
  }>;
}
