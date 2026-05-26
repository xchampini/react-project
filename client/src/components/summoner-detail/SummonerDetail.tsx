import { getProfileIconUrl } from '../../api/dataDragonApi';
import type { DataDragonAssetCache } from '../../types/dataDragon';
import type { MatchHistoryResponse } from '../../types/riot';

type SummonerDetailProps = {
  summonerData: MatchHistoryResponse;
  dataDragonAssets: DataDragonAssetCache | null;
};

function SummonerDetail({ summonerData, dataDragonAssets }: SummonerDetailProps) {
  const profileIconUrl = dataDragonAssets
    ? getProfileIconUrl(dataDragonAssets.version, summonerData.summoner.profileIconId)
    : null;

  return (
    <div>
      {profileIconUrl && <img src={profileIconUrl} alt="Profile Icon" />}
      <h1>{summonerData.summoner.gameName}</h1>
      <p>Tag: {summonerData.summoner.tagLine}</p>
      <p>Level: {summonerData.summoner.summonerLevel}</p>
    </div>
  );
}

export default SummonerDetail;
