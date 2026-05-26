export type SummonerSummary = {
  gameName: string;
  tagLine: string;
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
};

export type RankedEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: string;
};

export type AggregateStats = {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: string;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
  overallKDA: string;
  avgDamage: number;
  avgGold: number;
  avgCS: string;
  avgVisionScore: string;
  avgWardsPlaced: number;
  avgDetectorWardsPlaced: number;
  avgVisionScorePerMinute: string;
  avgWardTakedowns: number;
  avgWardTakedownsBefore20M: number;
};

export type ChampionSummary = {
  champion: string;
  games: number;
  wins: number;
  winRate: string;
  kda: string;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
};

export type RecentMatch = {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  queueId: number;
  queueType: string;
  champion: string;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  gold: number;
  cs: number;
  csPerMinute: string;
  damage: number;
  damagePerMinute: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionWardsBoughtInGame: number;
  detectorWardsPlaced: number;
  visionScorePerMinute: number;
  controlWardsPlaced: number;
  wardTakedowns: number;
  wardTakedownsBefore20M: number;
  items: number[];
  summonerSpells: number[];
  primaryRune?: number;
  secondaryRune?: number;
};

export type MatchHistoryResponse = {
  summoner: SummonerSummary;
  ranked: RankedEntry[];
  stats: AggregateStats;
  champions: ChampionSummary[];
  recentMatches: RecentMatch[];
};
