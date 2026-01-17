import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getMatchIdsByPuuid,
  getMatchById,
  getRankedInfo,
  extractPlayerStats,
  calculateKDA,
  PLATFORM_TO_REGION,
} from "../utils/riotApi.js";

/**
 * Get summoner by Riot ID
 */
export async function getSummoner(req, res) {
  try {
    const { gameName, tagLine } = req.params;
    const { region = "americas" } = req.query;

    const account = await getAccountByRiotId(gameName, tagLine, region);
    res.json(account);
  } catch (error) {
    console.error("Error getting summoner:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get summoner details by PUUID
 */
export async function getSummonerByPuuidController(req, res) {
  try {
    const { puuid } = req.params;
    const { platform = "na1" } = req.query;

    const summoner = await getSummonerByPuuid(puuid, platform);
    res.json(summoner);
  } catch (error) {
    console.error("Error getting summoner details:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get match IDs for a player
 */
export async function getMatchIds(req, res) {
  try {
    const { puuid } = req.params;
    const { region = "americas", start = 0, count = 20 } = req.query;

    const matchIds = await getMatchIdsByPuuid(
      puuid,
      region,
      parseInt(start),
      parseInt(count),
    );

    res.json(matchIds);
  } catch (error) {
    console.error("Error getting match IDs:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single match details
 */
export async function getMatch(req, res) {
  try {
    const { matchId } = req.params;
    const { region = "americas" } = req.query;

    const match = await getMatchById(matchId, region);
    res.json(match);
  } catch (error) {
    console.error("Error getting match:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Main aggregator: Get full match history with statistics
 */
export async function getMatchHistory(req, res) {
  try {
    const { gameName, tagLine } = req.params;
    const { region = "americas", platform = "na1", count = 10 } = req.query;
    const matchCount = parseInt(count);

    console.log(`Fetching match history for ${gameName}#${tagLine}`);

    // 1. Get account info
    const account = await getAccountByRiotId(gameName, tagLine, region);
    console.log(`Found account: ${account.puuid}`);

    // 2. Get summoner info
    const summoner = await getSummonerByPuuid(account.puuid, platform);
    console.log(`Summoner level: ${summoner.summonerLevel}`);

    // 3. Get ranked info
    let rankedInfo = null;
    try {
      rankedInfo = await getRankedInfo(account.puuid, platform);
    } catch (error) {
      console.log("No ranked info available:", error.message);
    }

    // 4. Get match IDs
    const matchIds = await getMatchIdsByPuuid(
      account.puuid,
      platform,
      0,
      matchCount,
    );
    console.log(`Found ${matchIds.length} matches`);

    // 5. Get match details for each match
    const matchDetailsPromises = matchIds.map((matchId) =>
      getMatchById(matchId, platform),
    );
    const matches = await Promise.all(matchDetailsPromises);
    console.log(`Fetched ${matches.length} match details`);

    // 6. Extract player stats from each match
    const playerStats = matches
      .map((match) => {
        try {
          return extractPlayerStats(match, account.puuid);
        } catch (error) {
          console.error(
            `Error extracting stats for match ${match.metadata.matchId}:`,
            error,
          );
          return null;
        }
      })
      .filter((stats) => stats !== null);

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

    // Champion statistics
    const championStats = {};
    playerStats.forEach((stat) => {
      if (!championStats[stat.champion]) {
        championStats[stat.champion] = {
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        };
      }
      championStats[stat.champion].games++;
      if (stat.win) championStats[stat.champion].wins++;
      championStats[stat.champion].kills += stat.kills;
      championStats[stat.champion].deaths += stat.deaths;
      championStats[stat.champion].assists += stat.assists;
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
            winRate: (
              (league.wins / (league.wins + league.losses)) *
              100
            ).toFixed(1),
          }))
        : [],
      stats: {
        totalGames,
        wins,
        losses,
        winRate:
          totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0",
        avgKills: totalGames > 0 ? (totalKills / totalGames).toFixed(1) : "0.0",
        avgDeaths:
          totalGames > 0 ? (totalDeaths / totalGames).toFixed(1) : "0.0",
        avgAssists:
          totalGames > 0 ? (totalAssists / totalGames).toFixed(1) : "0.0",
        overallKDA: calculateKDA(totalKills, totalDeaths, totalAssists),
        avgDamage: totalGames > 0 ? Math.round(totalDamage / totalGames) : 0,
        avgGold: totalGames > 0 ? Math.round(totalGold / totalGames) : 0,
        avgCS: totalGames > 0 ? (totalCS / totalGames).toFixed(1) : "0.0",
      },
      champions: topChampions,
      recentMatches: playerStats.slice(0, 20), // Limit to 20 most recent
    };

    console.log(`Successfully aggregated data for ${gameName}#${tagLine}`);
    res.json(aggregatedData);
  } catch (error) {
    console.error("Error in getMatchHistory:", error);
    res.status(500).json({
      error: error.message,
      details:
        "Failed to fetch match history. Please check summoner name and region.",
    });
  }
}
