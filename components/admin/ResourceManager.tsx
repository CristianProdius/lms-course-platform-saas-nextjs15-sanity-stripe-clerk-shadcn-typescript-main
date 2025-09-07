"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Plus,
  X,
  File,
  FileImage,
  FileVideo,
  Archive
} from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  type: string;
  createdAt: string;
}

interface ResourceManagerProps {
  lessonId: string;
  onClose: () => void;
}

export function ResourceManager({ lessonId, onClose }: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resources
  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/lessons/${lessonId}/resources`);
      const data = await response.json();
      
      if (data.success) {
        setResources(data.resources);
      } else {
        toast.error("Failed to load resources");
      }
    } catch (error) {
      console.error("Error loading resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [lessonId]);

  // Upload resource
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    
    if (!file || !resourceTitle) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', resourceTitle);

      const response = await fetch(`/api/admin/lessons/${lessonId}/resources`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Resource uploaded successfully");
        setResourceTitle("");
        setShowUploadForm(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await loadResources();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast.error("Failed to upload resource");
    } finally {
      setUploading(false);
    }
  };

  // Delete resource
  const handleDelete = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/admin/lessons/${lessonId}/resources?resourceId=${resourceId}`,
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Resource deleted successfully");
        await loadResources();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Lesson Resources</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Upload Form */}
          {showUploadForm ? (
            <Card className="p-4">
              <h3 className="font-medium mb-3">Upload New Resource</h3>
              <form onSubmit={handleUpload} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="resourceTitle">Resource Title *</Label>
                  <Input
                    id="resourceTitle"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="Assignment 1 - Instructions"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileInput">File *</Label>
                  <Input
                    ref={fileInputRef}
                    id="fileInput"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.gif,.mp4,.mov"
                  />
                  <p className="text-xs text-gray-500">
                    Supported: PDF, Word, Text, Images, Videos, Archives
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading} size="sm">
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Resources ({resources.length})</h3>
              <Button
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-600"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          )}

          {/* Resources List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C] mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No resources uploaded yet. Add your first resource above.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                        {getFileIcon(resource.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>{resource.fileName}</span>
                          <span>•</span>
                          <span>{formatFileSize(resource.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="h-8"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(resource.id)}
                        className="h-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}