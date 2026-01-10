import express from 'express';
import {
  getSummoner,
  getSummonerByPuuidController,
  getMatchIds,
  getMatch,
  getMatchHistory,
} from '../controllers/matchController.js';

const router = express.Router();

// Get account by Riot ID (Game Name + Tag Line)
// Example: GET /api/summoner/Faker/KR1?region=asia
router.get('/summoner/:gameName/:tagLine', getSummoner);

// Get summoner details by PUUID
// Example: GET /api/summoner/by-puuid/abc123?platform=na1
router.get('/summoner/by-puuid/:puuid', getSummonerByPuuidController);

// Get match IDs for a player
// Example: GET /api/matches/abc123?region=americas&start=0&count=20
router.get('/matches/:puuid', getMatchIds);

// Get single match details
// Example: GET /api/match/NA1_1234567890?region=americas
router.get('/match/:matchId', getMatch);

// Main aggregator endpoint - Get full match history with stats
// Example: GET /api/match-history/Doublelift/NA1?region=americas&platform=na1&count=10
router.get('/match-history/:gameName/:tagLine', getMatchHistory);

export default router;