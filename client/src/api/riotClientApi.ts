import type { MatchHistoryResponse } from '../types/riot';

// TODO: look how to actually store api url, shouldnt be localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class RiotApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getMatchHistory(
    gameName: string,
    gameTag: string,
    platform: string,
    region: string,
    matches: number
  ): Promise<MatchHistoryResponse> {
    return this.request<MatchHistoryResponse>(
      `/match-history/${encodeURIComponent(gameName)}/${encodeURIComponent(gameTag)}?region=${region}&platform=${platform}&count=${matches}`
    );
  }
}

export const riotApi = new RiotApiClient(API_BASE_URL);
