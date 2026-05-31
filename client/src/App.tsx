import { useEffect, useState } from 'react';
import { riotApi } from './api/riotClientApi';
import { getDataDragonAssets } from './api/dataDragonApi';
import './App.css';
import SummonerSearch from './components/summoner-search/SummonerSearch';
import type { MatchHistoryResponse } from './types/riot';
import type { DataDragonAssetCache } from './types/dataDragon';
import SummonerDetail from './components/summoner-detail/SummonerDetail';

function App() {
  const [summonerData, setSummonerData] = useState<MatchHistoryResponse | null>(null);
  const [dataDragonAssets, setDataDragonAssets] = useState<DataDragonAssetCache | null>(null);

  useEffect(() => {
    getDataDragonAssets()
      .then(setDataDragonAssets)
      .catch((error) => {
        console.error('Error caching Data Dragon assets:', error);
      });
  }, []);

  async function handleSummonerSearch({
    gameName,
    gameTag,
    platform,
    region,
    matches,
  }: {
    gameName: string;
    gameTag: string;
    platform: string;
    region: string;
    matches: number;
  }) {
    try {
      const data = await riotApi.getMatchHistory(gameName, gameTag, platform, region, matches);
      console.log(data);
      setSummonerData(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch summoner';
      console.log(message);
      throw error;
    }
  }

  return (
    <>
      <SummonerSearch onSubmit={handleSummonerSearch}></SummonerSearch>
      {summonerData && (
        <div className="summoner-detail-container">
          <SummonerDetail
            summonerData={summonerData}
            dataDragonAssets={dataDragonAssets}
          ></SummonerDetail>
        </div>
      )}
    </>
  );
}

export default App;
