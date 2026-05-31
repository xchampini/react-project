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

  const getRankedInfo = (queueType: string) => {
    const rankedInfo = summonerData.ranked.find((queue) => queue.queueType === queueType);
    return rankedInfo;
  };

  const rankIconUrl = (tier: string) => {
    const normalizedTier = tier.toLowerCase().replace(' ', '-');
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${normalizedTier}.png`;
  };

  return (
    <>
      <div className={styles['profile-header']}>
        {profileIconUrl && <img src={profileIconUrl} alt="Profile Icon" />}
        <span className={styles['summoner-level']}>{summonerData.summoner.summonerLevel}</span>
      </div>

      <h1 className={styles['profile-name']}>
        {summonerData.summoner.gameName}{' '}
        <span className={styles['tagline']}>#{summonerData.summoner.tagLine}</span>
      </h1>

      <div className={styles['ranked-stats']}>
        <img
          className={styles['ranked-icon']}
          src={rankIconUrl(getRankedInfo('RANKED_SOLO_5x5')?.tier || 'UNRANKED')}
          alt="Rank Icon"
        />
        <p>{getRankedInfo('RANKED_SOLO_5x5')?.tier}</p>
        <p>{getRankedInfo('RANKED_SOLO_5x5')?.leaguePoints} LP</p>
      </div>

      <SummonerCalendar summonerData={summonerData} dataDragonAssets={dataDragonAssets} />
    </>
  );
}

export default SummonerDetail;
