import { getChampionIconUrl } from '../../api/dataDragonApi';
import type { DataDragonAssetCache } from '../../types/dataDragon';
import type { MatchHistoryResponse, RecentMatch } from '../../types/riot';
import styles from './SummonerCalendar.module.css';

type SummonerCalendarProps = {
  summonerData: MatchHistoryResponse;
  dataDragonAssets: DataDragonAssetCache | null;
};

function SummonerCalendar({ summonerData, dataDragonAssets }: SummonerCalendarProps) {
  const matchesByDate: Record<string, RecentMatch[]> = {};

  summonerData.recentMatches.forEach((match) => {
    const date = new Date(match.gameCreation).toLocaleDateString();
    matchesByDate[date] = matchesByDate[date] || [];
    matchesByDate[date].push(match);
  });

  const getMatchChampionIconUrl = (match: RecentMatch) => {
    if (!dataDragonAssets) {
      return null;
    }

    const champion = Object.values(dataDragonAssets.champions).find(
      (championAsset) => Number(championAsset.key) === match.championId,
    );

    return champion
      ? getChampionIconUrl(dataDragonAssets.version, champion.image.full)
      : null;
  };

  return (
    <>
      {Object.entries(matchesByDate).map(([date, matches]) => (
        <div key={date} className={styles['day-block']}>
          <h2>
            {date} - Total Games: {matches.length}
          </h2>
          <div className={styles['day-summary']}>
            <span>Wins: {matches.filter((m) => m.win).length}</span>
            <span>Losses: {matches.filter((m) => !m.win).length}</span>
          </div>

          <ul>
            {matches.map((match) => {
              const championIconUrl = getMatchChampionIconUrl(match);

              return (
                <li key={match.matchId} className={match.win ? styles.win : styles.loss}>
                  <div className={styles['match-row']}>
                    {championIconUrl && (
                      <img
                        className={styles['champion-icon']}
                        src={championIconUrl}
                        alt={`${match.champion} icon`}
                      />
                    )}
                    <div className={styles['match-details']}>
                      <span>{match.queueType}</span>
                      <div>
                        {new Date(match.gameCreation).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <span>
                        {match.champion} - KDA: {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export default SummonerCalendar;
