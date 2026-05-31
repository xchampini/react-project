import { getProfileIconUrl } from '../../api/dataDragonApi';
import type { DataDragonAssetCache } from '../../types/dataDragon';
import type { MatchHistoryResponse } from '../../types/riot';
import SummonerCalendar from '../summoner-calendar/SummonerCalendar';
import styles from './SummonerDetail.module.css';

type SummonerDetailProps = {
  summonerData: MatchHistoryResponse;
  dataDragonAssets: DataDragonAssetCache | null;
};

function SummonerDetail({ summonerData, dataDragonAssets }: SummonerDetailProps) {
  const profileIconUrl = dataDragonAssets
    ? getProfileIconUrl(dataDragonAssets.version, summonerData.summoner.profileIconId)
    : null;

  return (
    <>
      {profileIconUrl && <img src={profileIconUrl} alt="Profile Icon" />}
      <h1 className={styles['profile-name']}>
        {summonerData.summoner.gameName}{' '}
        <span className={styles['tagline']}>#{summonerData.summoner.tagLine}</span>
      </h1>
      <p>Level: {summonerData.summoner.summonerLevel}</p>

      <SummonerCalendar summonerData={summonerData} dataDragonAssets={dataDragonAssets} />
    </>
  );
}

export default SummonerDetail;
