export type DataDragonImage = {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DataDragonChampion = {
  id: string;
  key: string;
  name: string;
  title: string;
  image: DataDragonImage;
};

export type DataDragonItem = {
  name: string;
  description: string;
  plaintext: string;
  image: DataDragonImage;
};

export type DataDragonSummonerSpell = {
  id: string;
  key: string;
  name: string;
  description: string;
  image: DataDragonImage;
};

export type DataDragonProfileIcon = {
  id: number;
  image: DataDragonImage;
};

export type DataDragonRune = {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
};

export type DataDragonRuneStyle = {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: {
    runes: DataDragonRune[];
  }[];
};

export type DataDragonResponse<T> = {
  type: string;
  version: string;
  data: Record<string, T>;
};

export type DataDragonAssetCache = {
  version: string;
  cachedAt: number;
  champions: Record<string, DataDragonChampion>;
  items: Record<string, DataDragonItem>;
  profileIcons: Record<string, DataDragonProfileIcon>;
  summonerSpells: Record<string, DataDragonSummonerSpell>;
  runeStyles: DataDragonRuneStyle[];
};
