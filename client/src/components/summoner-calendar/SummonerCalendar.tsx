import type { MatchHistoryResponse, RecentMatch } from '../../types/riot';

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
              <li key={match.matchId}>
                {match.gameMode} - {match.champion} - {match.win ? 'Win' : 'Loss'} - KDA:{' '}
                {match.kills}/{match.deaths}/{match.assists}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export default SummonerCalendar;
