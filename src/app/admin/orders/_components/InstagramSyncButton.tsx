"use client";

import { useState } from "react";
import {
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { api } from "~/trpc/react";

export default function InstagramSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const syncPhotos = api.instagram.syncInstagramPhotos.useMutation({
    onSuccess: (data) => {
      setResult({
        success: true,
        message: `Successfully synced ${data.totalPhotos} photos (${data.parentPhotos} parents, ${data.childPhotos} children)`,
      });
      setIsLoading(false);
    },
    onError: (error) => {
      setResult({
        success: false,
        message: `Failed to sync photos: ${error.message}`,
      });
      setIsLoading(false);
    },
  });

  const getSyncStatus = api.instagram.getSyncStatus.useQuery();

  const handleSync = () => {
    setIsLoading(true);
    setResult(null);
    syncPhotos.mutate();
  };

  const clearPhotos = api.instagram.clearStoredPhotos.useMutation({
    onSuccess: () => {
      setResult({
        success: true,
        message: "All stored photos cleared successfully",
      });
      void getSyncStatus.refetch();
    },
    onError: (error) => {
      setResult({
        success: false,
        message: `Failed to clear photos: ${error.message}`,
      });
    },
  });

  const handleClear = () => {
    void clearPhotos.mutate();
  };

  return (
    <Box className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-sm">
      <Typography variant="h6" className="mb-4 text-white">
        Instagram Photo Management
      </Typography>

      {getSyncStatus.data && (
        <Box className="mb-4 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
          <Typography variant="body2" className="text-emerald-200">
            Current Status: {getSyncStatus.data.totalPhotos} photos stored (
            {getSyncStatus.data.parentPhotos} parents,{" "}
            {getSyncStatus.data.childPhotos} children)
          </Typography>
          {getSyncStatus.data.lastSyncTime && (
            <Typography variant="caption" className="text-emerald-300">
              Last sync:{" "}
              {new Date(getSyncStatus.data.lastSyncTime).toLocaleString()}
            </Typography>
          )}
        </Box>
      )}

      <Box className="mb-4 flex gap-3">
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <CloudUpload />
          }
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? "Syncing..." : "Sync Instagram Photos"}
        </Button>

        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={isLoading || clearPhotos.isPending}
          className="border-red-600 text-red-400 hover:bg-red-900/20"
        >
          Clear All Photos
        </Button>
      </Box>

      {result && (
        <Alert
          severity={result.success ? "success" : "error"}
          className={
            result.success
              ? "border-green-600/30 bg-green-900/30"
              : "border-red-600/30 bg-red-900/30"
          }
        >
          <Typography
            variant="body2"
            className={result.success ? "text-green-200" : "text-red-200"}
          >
            {result.message}
          </Typography>
        </Alert>
      )}

      <Typography variant="caption" className="mt-3 block text-emerald-300">
        This will fetch all photos from Instagram and upload them to UploadThing
        for faster loading. Child photos will be tagged with their parent&apos;s
        ID for proper modal display.
      </Typography>
    </Box>
  );
}
