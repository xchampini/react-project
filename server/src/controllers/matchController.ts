import {
  calculateKDA,
  extractPlayerStats,
  getAccountByRiotId,
  getMatchById,
  getMatchIdsByPuuid,
  getRankedInfo,
  getSummonerByPuuid,
} from '../utils/riotApi.js';
import type { Request, Response } from 'express';

type GetSummonerParams = {
  gameName: string;
  tagLine: string;
};

type GetSummonerQuery = {
  region?: string;
};

type GetSummonerByPuuidParams = {
  puuid: string;
};

type GetSummonerByPuuidQuery = {
  platform?: string;
};

type GetMatchIdsParams = {
  puuid: string;
};

type GetMatchIdsQuery = {
  region?: string;
  start?: string | number;
  count?: string | number;
};

type GetMatchParams = {
  matchId: string;
};

type GetMatchQuery = {
  region?: string;
};

type GetMatchHistoryParams = {
  gameName: string;
  tagLine: string;
};

type GetMatchHistoryQuery = {
  region?: string;
  platform?: string;
  count?: string | number;
};

type AccountSummary = {
  gameName: string;
  tagLine: string;
  puuid: string;
};

type SummonerSummary = {
  summonerLevel: number;
  profileIconId: number;
};

type RankedEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

type PlayerStats = ReturnType<typeof extractPlayerStats>;

type ChampionStats = {
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
};

type MatchMetadata = {
  metadata: {
    matchId: string;
  };
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

/**
 * Get summoner by Riot ID
 */
export async function getSummoner(
  req: Request<GetSummonerParams, unknown, unknown, GetSummonerQuery>,
  res: Response
) {
  try {
    const { gameName, tagLine } = req.params;
    const { region = 'americas' } = req.query;

    const account = (await getAccountByRiotId(gameName, tagLine, region)) as AccountSummary;
    res.json(account);
  } catch (error: unknown) {
    console.error('Error getting summoner:', error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}

/**
 * Get summoner details by PUUID
 */
export async function getSummonerByPuuidController(
  req: Request<GetSummonerByPuuidParams, unknown, unknown, GetSummonerByPuuidQuery>,
  res: Response
) {
  try {
    const { puuid } = req.params;
    const { platform = 'na1' } = req.query;

    const summoner = (await getSummonerByPuuid(puuid, platform)) as SummonerSummary;
    res.json(summoner);
  } catch (error: unknown) {
    console.error('Error getting summoner details:', error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}

/**
 * Get match IDs for a player
 */
export async function getMatchIds(
  req: Request<GetMatchIdsParams, unknown, unknown, GetMatchIdsQuery>,
  res: Response
) {
  try {
    const { puuid } = req.params;
    const { region = 'americas', start = 0, count = 20 } = req.query;
    const startIndex = Number.parseInt(String(start), 10);
    const countValue = Number.parseInt(String(count), 10);

    const matchIds = await getMatchIdsByPuuid(puuid, region, startIndex, countValue);

    res.json(matchIds);
  } catch (error: unknown) {
    console.error('Error getting match IDs:', error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}

/**
 * Get single match details
 */
export async function getMatch(
  req: Request<GetMatchParams, unknown, unknown, GetMatchQuery>,
  res: Response
) {
  try {
    const { matchId } = req.params;
    const { region = 'americas' } = req.query;

    const match = await getMatchById(matchId, region);
    res.json(match);
  } catch (error: unknown) {
    console.error('Error getting match:', error);
    res.status(500).json({ error: getErrorMessage(error) });
  }
}

/**
 * Main aggregator: Get full match history with statistics
 */
export async function getMatchHistory(
  req: Request<GetMatchHistoryParams, unknown, unknown, GetMatchHistoryQuery>,
  res: Response
) {
  try {
    const { gameName, tagLine } = req.params;
    const { region = 'americas', platform = 'na1', count = 10 } = req.query;
    const matchCount = Number.parseInt(String(count), 10);

    console.log(`Fetching match history for ${gameName}#${tagLine}`);

    // 1. Get account info
    const account = (await getAccountByRiotId(gameName, tagLine, region)) as AccountSummary;
    console.log(`Found account: ${account.puuid}`);

    // 2. Get summoner info
    const summoner = (await getSummonerByPuuid(account.puuid, platform)) as SummonerSummary;
    console.log(`Summoner level: ${summoner.summonerLevel}`);

    // 3. Get ranked info
    let rankedInfo: RankedEntry[] | null = null;
    try {
      rankedInfo = (await getRankedInfo(account.puuid, platform)) as RankedEntry[];
    } catch (error: unknown) {
      console.log('No ranked info available:', getErrorMessage(error));
    }

    // 4. Get match IDs
    const matchIds = await getMatchIdsByPuuid(account.puuid, platform, 0, matchCount);
    console.log(`Found ${matchIds.length} matches`);

    // 5. Get match details for each match
    const matchDetailsPromises = matchIds.map((matchId: string) =>
      getMatchById(matchId, platform)
    );
    const matches = (await Promise.all(matchDetailsPromises)) as MatchMetadata[];
    console.log(`Fetched ${matches.length} match details`);

    // 6. Extract player stats from each match
    const playerStats = matches
      .map((match) => {
        try {
          return extractPlayerStats(match, account.puuid);
        } catch (error: unknown) {
          console.error(
            `Error extracting stats for match ${match.metadata.matchId}:`,
            getErrorMessage(error)
          );
          return null;
        }
      })
      .filter((stats): stats is PlayerStats => stats !== null);

    // 7. Calculate aggregate statistics
    const totalGames = playerStats.length;
    const wins = playerStats.filter((s) => s.win).length;
    const losses = totalGames - wins;

    const totalKills = playerStats.reduce((sum, s) => sum + s.kills, 0);
    const totalDeaths = playerStats.reduce((sum, s) => sum + s.deaths, 0);
    const totalAssists = playerStats.reduce((sum, s) => sum + s.assists, 0);
    const totalDamage = playerStats.reduce((sum, s) => sum + s.damage, 0);
    const totalGold = playerStats.reduce((sum, s) => sum + s.gold, 0);
    const totalCS = playerStats.reduce((sum, s) => sum + s.cs, 0);
    const totalVisionScore = playerStats.reduce((sum, s) => sum + s.visionScore, 0);
    const totalWardsPlaced = playerStats.reduce((sum, s) => sum + s.wardsPlaced, 0);
    const totalDetectorWardsPlaced = playerStats.reduce((sum, s) => sum + s.detectorWardsPlaced, 0);
    const totalVisionScorePerMinute = playerStats.reduce(
      (sum, s) => sum + s.visionScorePerMinute,
      0
    );
    const totalWardTakedowns = playerStats.reduce((sum, s) => sum + s.wardTakedowns, 0);
    const totalWardTakedownsBefore20M = playerStats.reduce(
      (sum, s) => sum + s.wardTakedownsBefore20M,
      0
    );

    // Champion statistics
    const championStats: Record<string, ChampionStats> = {};
    playerStats.forEach((stat) => {
      const entry =
        championStats[stat.champion] ??
        (championStats[stat.champion] = {
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        });

      entry.games++;
      if (stat.win) entry.wins++;
      entry.kills += stat.kills;
      entry.deaths += stat.deaths;
      entry.assists += stat.assists;
    });

    // Format champion stats
    const topChampions = Object.entries(championStats)
      .map(([champion, stats]) => ({
        champion,
        games: stats.games,
        wins: stats.wins,
        winRate: ((stats.wins / stats.games) * 100).toFixed(1),
        kda: calculateKDA(stats.kills, stats.deaths, stats.assists),
        avgKills: (stats.kills / stats.games).toFixed(1),
        avgDeaths: (stats.deaths / stats.games).toFixed(1),
        avgAssists: (stats.assists / stats.games).toFixed(1),
      }))
      .sort((a, b) => b.games - a.games);

    // 8. Build response
    const aggregatedData = {
      summoner: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
        summonerLevel: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
      },
      ranked: rankedInfo
        ? rankedInfo.map((league) => ({
            queueType: league.queueType,
            tier: league.tier,
            rank: league.rank,
            leaguePoints: league.leaguePoints,
            wins: league.wins,
            losses: league.losses,
            winRate: ((league.wins / (league.wins + league.losses)) * 100).toFixed(1),
          }))
        : [],
      stats: {
        totalGames,
        wins,
        losses,
        winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0',
        avgKills: totalGames > 0 ? (totalKills / totalGames).toFixed(1) : '0.0',
        avgDeaths: totalGames > 0 ? (totalDeaths / totalGames).toFixed(1) : '0.0',
        avgAssists: totalGames > 0 ? (totalAssists / totalGames).toFixed(1) : '0.0',
        overallKDA: calculateKDA(totalKills, totalDeaths, totalAssists),
        avgDamage: totalGames > 0 ? Math.round(totalDamage / totalGames) : 0,
        avgGold: totalGames > 0 ? Math.round(totalGold / totalGames) : 0,
        avgCS: totalGames > 0 ? (totalCS / totalGames).toFixed(1) : '0.0',
        avgVisionScore: totalGames > 0 ? (totalVisionScore / totalGames).toFixed(1) : '0.0',
        avgWardsPlaced: totalGames > 0 ? Math.round(totalWardsPlaced / totalGames) : 0,
        avgDetectorWardsPlaced:
          totalGames > 0 ? Math.round(totalDetectorWardsPlaced / totalGames) : 0,
        avgVisionScorePerMinute:
          totalGames > 0 ? (totalVisionScorePerMinute / totalGames).toFixed(1) : '0.0',
        avgWardTakedowns: totalGames > 0 ? Math.round(totalWardTakedowns / totalGames) : 0,
        avgWardTakedownsBefore20M:
          totalGames > 0 ? Math.round(totalWardTakedownsBefore20M / totalGames) : 0,
      },
      champions: topChampions,
      recentMatches: playerStats.slice(0, 20), // Limit to 20 most recent
    };

    console.log(`Successfully aggregated data for ${gameName}#${tagLine}`);
    res.json(aggregatedData);
  } catch (error: unknown) {
    console.error('Error in getMatchHistory:', error);
    res.status(500).json({
      error: getErrorMessage(error),
      details: 'Failed to fetch match history. Please check summoner name and region.',
    });
  }
}
