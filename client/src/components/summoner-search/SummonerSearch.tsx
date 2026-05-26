import { useState } from 'react';
import styles from './SummonerSearch.module.css';

function SummonerSearch({
  onSubmit,
}: {
  onSubmit: (data: {
    gameName: string;
    gameTag: string;
    platform: string;
    region: string;
    matches: number;
  }) => void;
}) {
  const [gameName, setGameName] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [platform, setPlatform] = useState('oc1');
  const [region, setRegion] = useState('americas');
  const [matches, setMatches] = useState(1);
  //   TODO: setup Loading, errors and summoner state
  //   const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState<string | null>(null);
  //   const [summoner, setSummoner] = useState<SummonerDTO | null>(null);
  const submitForm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onSubmit({ gameName, gameTag, platform, region, matches });
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.inputGroupContainer}>
          <div className={styles.inputContainer}>
            <label htmlFor="gameName">Game Name</label>
            <input
              id="gameName"
              placeholder="In game name"
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
            ></input>
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="gameTag">Game Tag</label>
            <input
              id="gameTag"
              placeholder="In game tag"
              value={gameTag}
              onChange={(event) => setGameTag(event.target.value)}
            ></input>
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="platformSelect">Platform</label>
            <select
              id="platformSelect"
              name="platform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              <option value="">--Select platform--</option>
              <option value="na1">Americas</option>
              <option value="oc1">Australia</option>
            </select>
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="regionSelect">Region</label>
            <select
              id="regionSelect"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="">--Select region--</option>
              <option value="americas">Americas</option>
            </select>
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="matchCount">Matches</label>
            <input
              id="matchCount"
              type="number"
              placeholder="Number of matches"
              min={1}
              max={20}
              value={matches}
              onChange={(event) => setMatches(Number(event.target.value))}
            ></input>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={(event) => submitForm(event)}>Submit</button>
        </div>
      </div>
    </>
  );
}

export default SummonerSearch;
