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
      <h1>{summonerData.summoner.gameName}</h1>
      <p>Tag: {summonerData.summoner.tagLine}</p>
      <p>Level: {summonerData.summoner.summonerLevel}</p>

      <h2>Recent Matches</h2>
      <ul>
        {summonerData.recentMatches.map((match) => (
          <li key={match.matchId} className={match.win ? styles.win : styles.loss}>
            {match.gameMode} - {match.champion} - {match.win ? 'Win' : 'Loss'} - KDA: {match.kills}/
            {match.deaths}/{match.assists}
          </li>
        ))}
      </ul>
      <SummonerCalendar summonerData={summonerData} />
    </>
  );
}

export default SummonerDetail;
