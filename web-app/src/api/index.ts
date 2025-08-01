import { ApiClient } from './ApiClient';

export default new ApiClient({
  baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3001'
    : 'https://stravaholics-api.up.railway.app',
});
