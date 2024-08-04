export class AuthManager {
  private static instance: AuthManager;
  private accessToken: string = "";

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setAccessToken(token: string): void {
    console.log("Setting token:", token);
    this.accessToken = token;

    console.log("Token set:", this.accessToken); 
  }

  public getAccessToken(): string {
    console.log("Getting token:", this.accessToken);
    return this.accessToken;
  }
}

