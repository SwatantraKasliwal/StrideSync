"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface GoogleSignInProps {
  onSuccess: (user: { email: string; name: string }) => void;
  onError: (error: string) => void;
}

export default function GoogleSignIn({ onSuccess, onError }: GoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      // Check if already loaded
      if ((window as any).google?.accounts?.oauth2) {
        setIsScriptLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => setIsScriptLoaded(true));
        return;
      }

      // Create new script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Identity Services loaded");
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        setError("Failed to load Google Sign-In. Please check your internet connection.");
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error(
          "Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local"
        );
      }

      if (!isScriptLoaded || !(window as any).google?.accounts?.oauth2) {
        throw new Error(
          "Google Sign-In is not ready yet. Please wait a moment and try again."
        );
      }

      // Wait a bit to ensure library is fully initialized
      await new Promise((resolve) => setTimeout(resolve, 300));

      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.location.read",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
        ].join(" "),
        callback: async (response: any) => {
          if (response.error) {
            setError(response.error);
            onError(response.error);
            setIsLoading(false);
            return;
          }

          try {
            // Get user info
            const userInfoResponse = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                },
              }
            );

            if (!userInfoResponse.ok) {
              throw new Error("Failed to get user information");
            }

            const userInfo = await userInfoResponse.json();

            // Store access token for later use
            if (typeof window !== "undefined") {
              (window as any).__googleFitAccessToken = response.access_token;
            }

            onSuccess({
              email: userInfo.email,
              name: userInfo.name,
            });

            setIsLoading(false);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to get user info";
            setError(errorMsg);
            onError(errorMsg);
            setIsLoading(false);
          }
        },
        error_callback: (error: any) => {
          const errorMsg = error.message || "Authentication failed";
          setError(errorMsg);
          onError(errorMsg);
          setIsLoading(false);
        },
      });

      // Request access token with popup
      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMsg);
      onError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Connect Google Fit</CardTitle>
        <CardDescription className="text-center">
          Sign in with your Google account to sync your fitness data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isScriptLoaded && !error && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Google Sign-In...
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading || !isScriptLoaded}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>By signing in, you grant StrideSync permission to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Read your fitness activity data</li>
              <li>Access your daily step count</li>
              <li>View your profile information</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
