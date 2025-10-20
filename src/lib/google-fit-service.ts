/**
 * Google Fit API Service for StrideSync
 * Integrates with Google Fit to retrieve real step count data
 */

export interface GoogleFitData {
  steps: number;
  calories: number;
  distance: number; // in meters
  timestamp: number;
}

export interface GoogleFitHistoryData {
  date: string;
  steps: number;
  calories: number;
  distance: number;
}

export interface GoogleFitAuth {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
  } | null;
}

export interface IGoogleFitService {
  authenticate(): Promise<GoogleFitAuth>;
  setAccessToken(token: string): void;
  getTodaySteps(): Promise<number>;
  getFitnessData(): Promise<GoogleFitData>;
  getHistoryData(days?: number): Promise<GoogleFitHistoryData[]>;
  isAuthenticated(): boolean;
  signOut(): void;
  startStepMonitoring(callback: (steps: number) => void): () => void;
}

export class GoogleFitService implements IGoogleFitService {
  private accessToken: string | null = null;
  private clientId: string;
  private scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.location.read",
  ];

  constructor() {
    // You need to set up Google Cloud Console project and get OAuth 2.0 credentials
    // Replace this with your actual Client ID from Google Cloud Console
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  }

  /**
   * Initialize Google Sign-In and request Fit API permissions
   */
  async authenticate(): Promise<GoogleFitAuth> {
    try {
      if (typeof window === "undefined") {
        throw new Error("Google Fit authentication only works in browser");
      }

      if (!this.clientId) {
        throw new Error(
          "Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file"
        );
      }

      // Load Google Identity Services library
      await this.loadGoogleIdentityServices();

      // Wait a bit for the library to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if Google library is loaded
      if (!(window as any).google?.accounts?.oauth2) {
        throw new Error(
          "Google Identity Services failed to load. Please check your internet connection."
        );
      }

      return new Promise((resolve, reject) => {
        try {
          const client = (window as any).google.accounts.oauth2.initTokenClient(
            {
              client_id: this.clientId,
              scope: this.scopes.join(" "),
              callback: async (response: any) => {
                if (response.error) {
                  reject(new Error(response.error));
                  return;
                }

                this.accessToken = response.access_token;

                // Get user info
                const userInfo = await this.getUserInfo();

                resolve({
                  isAuthenticated: true,
                  user: userInfo,
                });
              },
              error_callback: (error: any) => {
                reject(new Error(error.message || "Authentication failed"));
              },
            }
          );

          // Request access token with popup
          client.requestAccessToken({ prompt: "consent" });
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error("Google Fit authentication failed:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to authenticate with Google Fit");
    }
  }

  /**
   * Load Google Identity Services library dynamically
   */
  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        // Wait for it to load
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Google Identity Services"))
        );
        return;
      }

      // Create and load the script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Identity Services loaded successfully");
        resolve();
      };
      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
        reject(new Error("Failed to load Google Identity Services"));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Set access token (used when signing in via separate component)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get user information from Google
   */
  private async getUserInfo(): Promise<{ email: string; name: string } | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to get user info");

      const data = await response.json();
      return {
        email: data.email,
        name: data.name,
      };
    } catch (error) {
      console.error("Failed to get user info:", error);
      return null;
    }
  }

  /**
   * Get today's step count from Google Fit
   */
  async getTodaySteps(): Promise<number> {
    if (!this.accessToken) {
      throw new Error("Not authenticated. Please call authenticate() first.");
    }

    try {
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const response = await fetch(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
                dataSourceId:
                  "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startOfDay.getTime(),
            endTimeMillis: now,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract step count from response
      let totalSteps = 0;
      if (data.bucket && data.bucket.length > 0) {
        for (const bucket of data.bucket) {
          if (bucket.dataset && bucket.dataset.length > 0) {
            for (const dataset of bucket.dataset) {
              if (dataset.point && dataset.point.length > 0) {
                for (const point of dataset.point) {
                  if (point.value && point.value.length > 0) {
                    totalSteps += point.value[0].intVal || 0;
                  }
                }
              }
            }
          }
        }
      }

      return totalSteps;
    } catch (error) {
      console.error("Failed to get steps from Google Fit:", error);
      throw new Error("Failed to retrieve step data from Google Fit");
    }
  }

  /**
   * Get comprehensive fitness data from Google Fit
   */
  async getFitnessData(): Promise<GoogleFitData> {
    if (!this.accessToken) {
      throw new Error("Not authenticated. Please call authenticate() first.");
    }

    try {
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const response = await fetch(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
              },
              {
                dataTypeName: "com.google.calories.expended",
              },
              {
                dataTypeName: "com.google.distance.delta",
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startOfDay.getTime(),
            endTimeMillis: now,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse the response
      let steps = 0;
      let calories = 0;
      let distance = 0;

      if (data.bucket && data.bucket.length > 0) {
        for (const bucket of data.bucket) {
          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset.forEach((dataset: any, index: number) => {
              if (dataset.point && dataset.point.length > 0) {
                dataset.point.forEach((point: any) => {
                  if (point.value && point.value.length > 0) {
                    const value =
                      point.value[0].intVal || point.value[0].fpVal || 0;

                    // Determine which metric this is based on dataset index
                    if (index === 0) steps += value;
                    else if (index === 1) calories += value;
                    else if (index === 2) distance += value;
                  }
                });
              }
            });
          }
        }
      }

      return {
        steps,
        calories,
        distance,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to get fitness data from Google Fit:", error);
      throw new Error("Failed to retrieve fitness data from Google Fit");
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Sign out and clear access token
   */
  signOut(): void {
    this.accessToken = null;
  }

  /**
   * Get historical fitness data for the past N days
   */
  async getHistoryData(days: number = 7): Promise<GoogleFitHistoryData[]> {
    if (!this.accessToken) {
      throw new Error("Not authenticated. Please call authenticate() first.");
    }

    try {
      const endTime = new Date();
      endTime.setHours(23, 59, 59, 999);

      const startTime = new Date();
      startTime.setDate(startTime.getDate() - days);
      startTime.setHours(0, 0, 0, 0);

      const response = await fetch(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: "com.google.step_count.delta",
                dataSourceId:
                  "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
              },
              {
                dataTypeName: "com.google.calories.expended",
              },
              {
                dataTypeName: "com.google.distance.delta",
              },
            ],
            bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
            startTimeMillis: startTime.getTime(),
            endTimeMillis: endTime.getTime(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.statusText}`);
      }

      const data = await response.json();
      const historyData: GoogleFitHistoryData[] = [];

      if (data.bucket && data.bucket.length > 0) {
        for (const bucket of data.bucket) {
          let daySteps = 0;
          let dayCalories = 0;
          let dayDistance = 0;

          if (bucket.dataset && bucket.dataset.length > 0) {
            bucket.dataset.forEach((dataset: any, index: number) => {
              if (dataset.point && dataset.point.length > 0) {
                dataset.point.forEach((point: any) => {
                  if (point.value && point.value.length > 0) {
                    const value =
                      point.value[0].intVal || point.value[0].fpVal || 0;

                    // Determine which metric based on dataset index
                    if (index === 0) daySteps += value;
                    else if (index === 1) dayCalories += value;
                    else if (index === 2) dayDistance += value;
                  }
                });
              }
            });
          }

          // Convert timestamp to date string
          // bucket.startTimeMillis is a string, need to convert to number
          const timestamp = parseInt(bucket.startTimeMillis, 10);

          // Validate timestamp
          if (!isNaN(timestamp) && timestamp > 0) {
            const date = new Date(timestamp);

            // Double check the date is valid
            if (!isNaN(date.getTime())) {
              const dateString = date.toISOString().split("T")[0];

              historyData.push({
                date: dateString,
                steps: Math.round(daySteps),
                calories: Math.round(dayCalories),
                distance: Math.round(dayDistance * 100) / 100, // Round to 2 decimals
              });
            }
          }
        }
      }

      // Sort by date descending (most recent first)
      return historyData.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error("Failed to get history data from Google Fit:", error);
      throw new Error("Failed to retrieve history data from Google Fit");
    }
  }

  /**
   * Start real-time step monitoring (polls every 30 seconds)
   */
  startStepMonitoring(callback: (steps: number) => void): () => void {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchSteps = async () => {
      try {
        const steps = await this.getTodaySteps();
        callback(steps);
      } catch (error) {
        console.error("Error fetching steps:", error);
      }
    };

    // Fetch immediately
    fetchSteps();

    // Then fetch every 30 seconds
    intervalId = setInterval(fetchSteps, 30000);

    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

// Create singleton instance
let googleFitServiceInstance: GoogleFitService | null = null;

export const googleFitService: IGoogleFitService = (() => {
  if (typeof window === "undefined") {
    // Return mock service for SSR
    return {
      authenticate: async () => ({ isAuthenticated: false, user: null }),
      setAccessToken: () => {},
      getTodaySteps: async () => 0,
      getFitnessData: async () => ({
        steps: 0,
        calories: 0,
        distance: 0,
        timestamp: 0,
      }),
      getHistoryData: async () => [],
      isAuthenticated: () => false,
      signOut: () => {},
      startStepMonitoring: () => () => {},
    } as IGoogleFitService;
  }

  if (!googleFitServiceInstance) {
    googleFitServiceInstance = new GoogleFitService();
  }

  return googleFitServiceInstance;
})();
