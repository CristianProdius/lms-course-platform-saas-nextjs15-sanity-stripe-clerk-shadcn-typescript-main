"use client";

import {
  FileText,
  Download,
  File,
  FileSpreadsheet,
  FileVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Resource {
  _key: string;
  title: string | null;
  description?: string | null;
  file: {
    _type: string;
    asset: {
      _id: string;
      _type: string;
      url?: string | null;
      originalFilename?: string | null;
      extension?: string | null;
      size?: number | null;
    } | null;
  } | null;
  fileType: "pdf" | "doc" | "ppt" | "xls" | "txt" | "other" | null;
}

interface LessonResourcesProps {
  resources: Resource[];
  projectId: string;
  dataset: string;
}

export function LessonResources({
  resources,
  projectId,
  dataset,
}: LessonResourcesProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "doc":
        return <File className="h-5 w-5" />;
      case "xls":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "ppt":
        return <FileVideo className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getFileUrl = (resource: Resource) => {
    // Check if file and asset exist
    if (!resource.file?.asset) {
      return null;
    }

    // If the asset has a url property, use it directly
    if (resource.file.asset.url) {
      return resource.file.asset.url;
    }

    // Otherwise, construct the URL from the asset ID
    const assetId = resource.file.asset._id;
    // Asset IDs are in format: file-{id}-{extension}
    const parts = assetId.split("-");
    const id = parts.slice(1, -1).join("-");
    const extension = parts[parts.length - 1];

    return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = async (resource: Resource) => {
    const url = getFileUrl(resource);
    if (!url) {
      console.error("Unable to get file URL");
      return;
    }

    const filename =
      resource.file?.asset?.originalFilename ||
      `${resource.title || "file"}.${resource.fileType || "pdf"}`;

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Lesson Resources
        </CardTitle>
        <CardDescription>
          Download additional materials for this lesson
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resources.map((resource) => {
            // Skip resources without files
            if (!resource.file?.asset) return null;

            return (
              <div
                key={resource._key}
                className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 text-muted-foreground">
                    {getFileIcon(resource.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">
                      {resource.title || "Untitled Resource"}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {(resource.fileType || "FILE").toUpperCase()}
                      </span>
                      {resource.file.asset.size && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(resource.file.asset.size)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resource)}
                  className="ml-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
