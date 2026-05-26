import type {
  DataDragonAssetCache,
  DataDragonChampion,
  DataDragonItem,
  DataDragonProfileIcon,
  DataDragonResponse,
  DataDragonRuneStyle,
  DataDragonSummonerSpell,
} from '../types/dataDragon';

const DATA_DRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
const DATA_DRAGON_LANGUAGE = 'en_AU';
const CACHE_KEY = 'league-match-tracker:data-dragon-assets';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let dataDragonAssetsPromise: Promise<DataDragonAssetCache> | null = null;

const readCachedAssets = (): DataDragonAssetCache | null => {
  const cachedValue = localStorage.getItem(CACHE_KEY);

  if (!cachedValue) {
    return null;
  }

  try {
    return JSON.parse(cachedValue) as DataDragonAssetCache;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const writeCachedAssets = (assets: DataDragonAssetCache) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(assets));
};

const isCacheFresh = (assets: DataDragonAssetCache) => Date.now() - assets.cachedAt < CACHE_TTL_MS;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Data Dragon request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const getLatestVersion = async () => {
  const versions = await fetchJson<string[]>(`${DATA_DRAGON_BASE_URL}/api/versions.json`);
  const latestVersion = versions[0];

  if (!latestVersion) {
    throw new Error('Data Dragon did not return any versions');
  }

  return latestVersion;
};

const fetchAssetsForVersion = async (version: string): Promise<DataDragonAssetCache> => {
  const dataUrl = `${DATA_DRAGON_BASE_URL}/cdn/${version}/data/${DATA_DRAGON_LANGUAGE}`;
  const [champions, items, profileIcons, summonerSpells, runeStyles] = await Promise.all([
    fetchJson<DataDragonResponse<DataDragonChampion>>(`${dataUrl}/champion.json`),
    fetchJson<DataDragonResponse<DataDragonItem>>(`${dataUrl}/item.json`),
    fetchJson<DataDragonResponse<DataDragonProfileIcon>>(`${dataUrl}/profileicon.json`),
    fetchJson<DataDragonResponse<DataDragonSummonerSpell>>(`${dataUrl}/summoner.json`),
    fetchJson<DataDragonRuneStyle[]>(`${dataUrl}/runesReforged.json`),
  ]);

  return {
    version,
    cachedAt: Date.now(),
    champions: champions.data,
    items: items.data,
    profileIcons: profileIcons.data,
    summonerSpells: summonerSpells.data,
    runeStyles,
  };
};

const loadDataDragonAssets = async (): Promise<DataDragonAssetCache> => {
  const cachedAssets = readCachedAssets();

  if (cachedAssets && isCacheFresh(cachedAssets)) {
    return cachedAssets;
  }

  const latestVersion = await getLatestVersion();

  if (cachedAssets?.version === latestVersion) {
    const refreshedAssets = {
      ...cachedAssets,
      cachedAt: Date.now(),
    };
    writeCachedAssets(refreshedAssets);
    return refreshedAssets;
  }

  const freshAssets = await fetchAssetsForVersion(latestVersion);
  writeCachedAssets(freshAssets);
  return freshAssets;
};

export const getDataDragonAssets = async (): Promise<DataDragonAssetCache> => {
  if (!dataDragonAssetsPromise) {
    dataDragonAssetsPromise = loadDataDragonAssets().catch((error) => {
      dataDragonAssetsPromise = null;

      const cachedAssets = readCachedAssets();
      if (cachedAssets) {
        return cachedAssets;
      }

      throw error;
    });
  }

  return dataDragonAssetsPromise;
};

export const getChampionIconUrl = (version: string, imageName: string) =>
  `${DATA_DRAGON_BASE_URL}/cdn/${version}/img/champion/${imageName}`;

export const getItemIconUrl = (version: string, itemId: number | string) =>
  `${DATA_DRAGON_BASE_URL}/cdn/${version}/img/item/${itemId}.png`;

export const getProfileIconUrl = (version: string, profileIconId: number | string) =>
  `${DATA_DRAGON_BASE_URL}/cdn/${version}/img/profileicon/${profileIconId}.png`;

export const getSummonerSpellIconUrl = (version: string, imageName: string) =>
  `${DATA_DRAGON_BASE_URL}/cdn/${version}/img/spell/${imageName}`;
