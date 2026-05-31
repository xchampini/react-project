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
        <div key={date}>
          <h3>{date}</h3>
          <ul>
            {matches.map((match) => (
              <li key={match.matchId} className={match.win ? styles.win : styles.loss}>
                <div>
                  <span>
                    {match.queueType} - {match.champion} - {match.win ? 'Win' : 'Loss'} - KDA:{' '}
                    {match.kills}/{match.deaths}/{match.assists} -{' '}
                    {new Date(match.gameCreation).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
