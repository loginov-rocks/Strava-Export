# Strava Export

Create own API Application here: https://www.strava.com/settings/api

Copy `api/.env.example` to `api/.env` and use `Client ID` and `Client Secret` from Strava.

Run database: `docker compose up`, Express UI available at `http://localhost:3002`, Redis UI at `http://localhost:3003`.

Use `npm start` command to start both `api` and `web-app`, then go to `http://localhost:3000`.

Use `npm run start:worker` to start worker.

## Reference

* https://developers.strava.com/docs/authentication/
* https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
* https://developers.strava.com/docs/reference/#api-Activities-getActivityById
