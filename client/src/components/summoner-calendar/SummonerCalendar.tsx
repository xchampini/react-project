import type { MatchHistoryResponse, RecentMatch } from '../../types/riot';
import styles from './SummonerCalendar.module.css';

function SummonerCalendar({ summonerData }: { summonerData: MatchHistoryResponse }) {
  const matchesByDate: Record<string, RecentMatch[]> = {};

  summonerData.recentMatches.forEach((match) => {
    const date = new Date(match.gameCreation).toLocaleDateString();
    matchesByDate[date] = matchesByDate[date] || [];
    matchesByDate[date].push(match);
  });

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
            {matches.map((match) => (
              <li key={match.matchId} className={match.win ? styles.win : styles.loss}>
                <div>
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export default SummonerCalendar;
