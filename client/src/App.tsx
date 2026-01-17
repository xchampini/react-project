import "./App.css";

function App() {
  return (
    <>
      <div className="card">
        <div className="input-group-container">
          <div className="input-container">
            <label htmlFor="gameName">Game Name</label>
            <input id="gameName" placeholder="In game name"></input>
          </div>
          <div className="input-container">
            <label htmlFor="gameTag">Game Tag</label>
            <input id="gameTag" placeholder="In game tag"></input>
          </div>
          <div className="input-container">
            <label htmlFor="platformSelect">Platform</label>
            <select id="platformSelect" name="platform">
              <option value="">--Select platform--</option>
              <option value="na1">Americas</option>
              <option value="oc1">Australia</option>
            </select>
          </div>

          <div className="input-container">
            <label htmlFor="regionSelect">Region</label>
            <select id="regionSelect" name="region">
              <option value="">--Select region--</option>
              <option value="americas">Americas</option>
            </select>
          </div>

          <div className="input-container">
            <label htmlFor="matchCount">Matches</label>
            <input
              id="matchCount"
              type="number"
              placeholder="Number of matches"
              min={1}
              max={20}
            ></input>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
