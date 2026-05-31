import dotenv from 'dotenv';

dotenv.config();

// Riot API base URLs
export const RIOT_URLS: Record<string, string> = {
  // Regional routing values (for account-v1 and match-v5)
  americas: 'https://americas.api.riotgames.com',
  europe: 'https://europe.api.riotgames.com',
  asia: 'https://asia.api.riotgames.com',
  sea: 'https://sea.api.riotgames.com',
};

// Riot API platform URLs
export const PLATFORM_URLS: Record<string, string> = {
  // Platform routing values (for summoner-v4, league-v4, etc.)
  na1: 'https://na1.api.riotgames.com',
  br1: 'https://br1.api.riotgames.com',
  la1: 'https://la1.api.riotgames.com',
  la2: 'https://la2.api.riotgames.com',
  euw1: 'https://euw1.api.riotgames.com',
  eun1: 'https://eun1.api.riotgames.com',
  tr1: 'https://tr1.api.riotgames.com',
  ru: 'https://ru.api.riotgames.com',
  kr: 'https://kr.api.riotgames.com',
  jp1: 'https://jp1.api.riotgames.com',
  oc1: 'https://oc1.api.riotgames.com',
  ph2: 'https://ph2.api.riotgames.com',
  sg2: 'https://sg2.api.riotgames.com',
  th2: 'https://th2.api.riotgames.com',
  tw2: 'https://tw2.api.riotgames.com',
  vn2: 'https://vn2.api.riotgames.com',
};

// Map platforms to their regional routing values
export const PLATFORM_TO_REGION: Record<string, string> = {
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  euw1: 'europe',
  eun1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea',
};

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const RIOT_SHORT_WINDOW_LIMIT = 20;
const RIOT_SHORT_WINDOW_MS = 1_000;
const RIOT_RATE_LIMIT_BUFFER_MS = 25;
const RIOT_MAX_RATE_LIMIT_RETRIES = 3;

let riotRateLimitQueue = Promise.resolve();
const riotRequestTimestamps: number[] = [];

const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const waitForRiotRateLimitSlot = async () => {
  while (true) {
    const now = Date.now();
    const windowStart = now - RIOT_SHORT_WINDOW_MS;

    while (
      riotRequestTimestamps.length > 0 &&
      riotRequestTimestamps[0] !== undefined &&
      riotRequestTimestamps[0] <= windowStart
    ) {
      riotRequestTimestamps.shift();
    }

    if (riotRequestTimestamps.length < RIOT_SHORT_WINDOW_LIMIT) {
      riotRequestTimestamps.push(now);
      return;
    }

    const oldestRequestTimestamp = riotRequestTimestamps[0];
    if (oldestRequestTimestamp === undefined) {
      continue;
    }

    const nextSlotAt = oldestRequestTimestamp + RIOT_SHORT_WINDOW_MS;
    await wait(nextSlotAt - now + RIOT_RATE_LIMIT_BUFFER_MS);
  }
};

const reserveRiotRateLimitSlot = () => {
  const reservation = riotRateLimitQueue.then(waitForRiotRateLimitSlot);
  riotRateLimitQueue = reservation.catch(() => {});
  return reservation;
};

/**
 * Make a call to the Riot Games API
 * @param {string} url - The full API endpoint URL
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - The API response data
 */
export async function riotApiCall(url: string, options: any = {}, rateLimitRetryCount = 0) {
  console.log(url);
  try {
    await reserveRiotRateLimitSlot();

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
        ...options.headers,
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After') || 1);
      if (rateLimitRetryCount >= RIOT_MAX_RATE_LIMIT_RETRIES) {
        throw new Error(`Rate limited after ${RIOT_MAX_RATE_LIMIT_RETRIES} retries`);
      }

      await wait(retryAfter * 1_000);
      return riotApiCall(url, options, rateLimitRetryCount + 1);
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Riot API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Riot API call failed:', error.message);
    throw error;
  }
}

/**
 * Get account by Riot ID (Game Name + Tag Line)
 * @param {string} gameName - The player's game name
 * @param {string} tagLine - The player's tag line
 * @param {string} region - Regional routing value (americas, europe, asia, sea)
 * @returns {Promise<Object>} - Account data including puuid
 */
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: string = 'americas'
) {
  const url = `${RIOT_URLS[region]}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotApiCall(url);
}

/**
 * Get summoner by PUUID
 * @param {string} puuid - The player's PUUID
 * @param {string} platform - Platform routing value (na1, euw1, etc.)
 * @returns {Promise<Object>} - Summoner data
 */
export async function getSummonerByPuuid(puuid: string, platform: string = 'na1') {
  const url = `${PLATFORM_URLS[platform]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotApiCall(url);
}

/**
 * Get match IDs for a player
 * @param {string} puuid - The player's PUUID
 * @param {string} platform
 * @param {number} start - Starting index
 * @param {number} count - Number of matches to retrieve
 * @returns {Promise<string[]>} - Array of match IDs
 */
export async function getMatchIdsByPuuid(
  puuid: string,
  platform: string = 'na1',
  start: number = 0,
  count: number = 20
) {
  const region = PLATFORM_TO_REGION[platform];

  if (!region) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const url = `${RIOT_URLS[region]}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
  return riotApiCall(url);
}

/**
 * Get match details by match ID
 * @param {string} matchId - The match ID
 * @param {string} platform
 * @returns {Promise<Object>} - Full match data
 */
export async function getMatchById(matchId: string, platform: string = 'na1') {
  const region = PLATFORM_TO_REGION[platform];

  if (!region) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const url = `${RIOT_URLS[region]}/lol/match/v5/matches/${matchId}`;
  return riotApiCall(url);
}

/**
 * Get ranked information for a summoner
 * @param {string} puuid - The summoner's encrypted ID
 * @param {string} platform
 * @returns {Promise<Object[]>} - Array of ranked league entries
 */
export async function getRankedInfo(puuid: string, platform: string = 'na1') {
  if (!platform) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const url = `${PLATFORM_URLS[platform]}/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotApiCall(url);
}

/**
 * Calculate KDA ratio
 * @param {number} kills
 * @param {number} deaths
 * @param {number} assists
 * @returns {string} - KDA ratio or "Perfect" if no deaths
 */
export function calculateKDA(kills: number, deaths: number, assists: number) {
  if (deaths === 0) {
    return 'Perfect';
  }
  return ((kills + assists) / deaths).toFixed(2);
}

/**
 * Format game duration from seconds to MM:SS
 * @param {number} seconds - Game duration in seconds
 * @returns {string} - Formatted duration
 */
export function formatGameDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get queue type name from queue ID
 * @param {number} queueId - The queue ID
 * @returns {string} - Human-readable queue type
 */
export function getQueueType(queueId: number) {
  const queueTypes: Record<number, string> = {
    420: 'Ranked Solo/Duo',
    440: 'Ranked Flex',
    450: 'ARAM',
    400: 'Normal Draft',
    430: 'Normal Blind',
    700: 'Clash',
    900: 'URF',
    1020: 'One For All',
    1700: 'Arena',
  };

  return queueTypes[queueId] || 'Unknown Queue';
}

/**
 * Extract player stats from a match
 * @param {Object} match - Full match data
 * @param {string} puuid - Player's PUUID
 * @returns {Object} - Player's stats for that match
 */
export function extractPlayerStats(match: any, puuid: string) {
  const participant = match.info.participants.find((p: any) => p.puuid === puuid);

  if (!participant) {
    throw new Error('Player not found in match');
  }

  return {
    matchId: match.metadata.matchId,
    gameCreation: new Date(match.info.gameCreation),
    gameDuration: match.info.gameDuration,
    gameMode: match.info.gameMode,
    queueId: match.info.queueId,
    queueType: getQueueType(match.info.queueId),
    champion: participant.championName,
    championId: participant.championId,
    win: participant.win,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    kda: calculateKDA(participant.kills, participant.deaths, participant.assists),
    gold: participant.goldEarned,
    cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
    csPerMinute: (
      (participant.totalMinionsKilled + participant.neutralMinionsKilled) /
      (match.info.gameDuration / 60)
    ).toFixed(1),
    damage: participant.totalDamageDealtToChampions,
    damagePerMinute: Math.round(
      participant.totalDamageDealtToChampions / (match.info.gameDuration / 60)
    ),
    visionScore: participant.visionScore,
    wardsPlaced: participant.wardsPlaced,
    wardsKilled: participant.wardsKilled,
    visionWardsBoughtInGame: participant.visionWardsBoughtInGame,
    detectorWardsPlaced: participant.detectorWardsPlaced,
    visionScorePerMinute: participant.challenges.visionScorePerMinute,
    controlWardsPlaced: participant.challenges.controlWardsPlaced,
    wardTakedowns: participant.challenges.wardTakedowns,
    wardTakedownsBefore20M: participant.challenges.wardTakedownsBefore20M,
    items: [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6,
    ].filter((item) => item !== 0),
    summonerSpells: [participant.summoner1Id, participant.summoner2Id],
    primaryRune: participant.perks?.styles[0]?.selections[0]?.perk,
    secondaryRune: participant.perks?.styles[1]?.style,
  };
}
