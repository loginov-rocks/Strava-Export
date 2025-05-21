export class App {
  constructor({ apiClient, redirectUri }) {
    this.apiClient = apiClient;
    this.redirectUri = redirectUri;

    this.isAuthorized = false;

    this.onAuthorizeClick = this.onAuthorizeClick.bind(this);
    this.onLogoutClick = this.onLogoutClick.bind(this);
    this.onSyncClick = this.onSyncClick.bind(this);
  }

  async onAuthorizeClick() {
    const response = await this.apiClient.getAuthStrava(this.redirectUri);

    window.location.href = response.url;
  }

  async onLogoutClick() {
    if (!this.isAuthorized) {
      return alert('User is already logged out!');
    }

    await this.apiClient.postAuthLogout();

    this.isAuthorized = false;
    alert('Logged out!');
  }

  async onSyncClick() {
    if (!this.isAuthorized) {
      return alert('User is logged out!');
    }

    await this.apiClient.postSyncJob();

    alert('Sync scheduled!');
  }

  async start() {
    try {
      await this.apiClient.getAuth();

      this.isAuthorized = true;
    } catch {
      this.isAuthorized = false;
    }

    if (!this.isAuthorized) {
      const urlSearchParams = new URLSearchParams(window.location.search);

      const code = urlSearchParams.get('code');
      const scope = urlSearchParams.has('scope') ? urlSearchParams.get('scope').split(',') : null;
      const state = urlSearchParams.get('state');

      if (code) {
        await this.apiClient.postAuthToken(code, scope, state);

        this.isAuthorized = true;
        alert('Authorized!');
      }
    }
  }
}
