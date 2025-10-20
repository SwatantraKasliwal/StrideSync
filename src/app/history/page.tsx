"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  googleFitService,
  type GoogleFitHistoryData,
} from "@/lib/google-fit-service";

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<GoogleFitHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if authenticated
        if (!googleFitService.isAuthenticated()) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch history for last 30 days
        const data = await googleFitService.getHistoryData(30);
        setHistoryData(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load history data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
            Activity <span className="text-primary">History</span>
          </h1>
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Past Activity</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? "Your Google Fit activity history for the last 30 days"
                : "Connect to Google Fit to view your activity history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading your activity history...
                </span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !isAuthenticated ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Not Connected to Google Fit
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Please connect to Google Fit from the dashboard to view your
                  activity history
                </p>
                <Link href="/">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Activity Data</p>
                <p className="text-sm text-muted-foreground">
                  No activity data found for the last 30 days. Start walking to
                  track your steps!
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {historyData.map((data) => (
                    <div
                      key={data.date}
                      className="rounded-lg border p-4 text-sm"
                    >
                      <div className="flex justify-between font-medium text-base mb-2">
                        {formatDate(data.date)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Steps:</span>
                          <span className="font-medium">
                            {data.steps.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Calories:
                          </span>
                          <span className="font-medium">
                            {data.calories.toLocaleString()} kcal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Distance:
                          </span>
                          <span className="font-medium">
                            {(data.distance / 1000).toFixed(2)} km
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Steps</TableHead>
                      <TableHead className="text-right">Calories</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.map((data) => (
                      <TableRow key={data.date}>
                        <TableCell className="font-medium">
                          {formatDate(data.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.steps.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.calories.toLocaleString()} kcal
                        </TableCell>
                        <TableCell className="text-right">
                          {(data.distance / 1000).toFixed(2)} km
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {historyData
                        .reduce((sum, d) => sum + d.steps, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Steps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {historyData
                        .reduce((sum, d) => sum + d.calories, 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Calories (kcal)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {(
                        historyData.reduce((sum, d) => sum + d.distance, 0) /
                        1000
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Distance (km)
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
