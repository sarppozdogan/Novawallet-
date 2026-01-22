import { apiRequestWithAuth } from "./client";

export type CardSummary = {
  id: number;
  maskedPan: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  brand: string;
  isActive: boolean;
};

export type CardDetail = CardSummary & {
  createdAt: string;
};

export async function getCards(includeInactive = false): Promise<CardSummary[]> {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiRequestWithAuth<CardSummary[]>(`/api/cards${query}`);
}

export async function getCardById(cardId: number): Promise<CardDetail> {
  return apiRequestWithAuth<CardDetail>(`/api/cards/${cardId}`);
}

export async function createCard(payload: {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
}): Promise<CardDetail> {
  return apiRequestWithAuth<CardDetail>("/api/cards", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deactivateCard(cardId: number): Promise<void> {
  await apiRequestWithAuth<void>(`/api/cards/${cardId}`, {
    method: "DELETE"
  });
}
