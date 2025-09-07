"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Plus, 
 
  Upload, 
  Edit, 
  Trash2,
  GripVertical,
  Play,
  ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";
import { ResourceManager } from "@/components/admin/ResourceManager";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'published';
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  vimeoId?: string;
  duration?: number;
  isFree?: boolean;
  order: number;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  type: string;
}

export default function CourseManagementPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [showResourceManager, setShowResourceManager] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson; moduleId: string } | null>(null);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: ""
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    vimeoId: "",
    duration: "",
    isFree: false
  });

  // Load course data
  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      } else {
        toast.error("Failed to load course");
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course");
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  // Create new module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Module created successfully");
        setModuleForm({ title: "", description: "" });
        setShowModuleForm(false);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("Failed to create module");
    } finally {
      setLoading(false);
    }
  };

  // Create new lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLessonForm) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${showLessonForm}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lessonForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Lesson created successfully");
        setLessonForm({ title: "", description: "", vimeoId: "", duration: "", isFree: false });
        setShowLessonForm(null);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  // Edit module
  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/modules/${editingModule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduleForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Module updated successfully");
        setModuleForm({ title: "", description: "" });
        setEditingModule(null);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setLoading(false);
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? This will also delete all lessons and student progress data.")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module");
    } finally {
      setLoading(false);
    }
  };

  // Edit lesson
  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/lessons/${editingLesson.lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...lessonForm,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Lesson updated successfully");
        setLessonForm({ title: "", description: "", vimeoId: "", duration: "", isFree: false });
        setEditingLesson(null);
        setShowLessonForm(null);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("Failed to update lesson");
    } finally {
      setLoading(false);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This will also delete all student progress data.")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await loadCourse();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Failed to delete lesson");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for editing
  const startEditingModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
    });
    setShowModuleForm(true);
  };

  const startEditingLesson = (lesson: Lesson, moduleId: string) => {
    // Find the most up-to-date lesson data from the current course state
    const currentModule = course?.modules.find(m => m.id === moduleId);
    const currentLesson = currentModule?.lessons.find(l => l.id === lesson.id);
    const lessonToEdit = currentLesson || lesson;
    
    setEditingLesson({ lesson: lessonToEdit, moduleId });
    setLessonForm({
      title: lessonToEdit.title,
      description: lessonToEdit.description,
      vimeoId: lessonToEdit.vimeoUrl || "",
      duration: lessonToEdit.duration?.toString() || "",
      isFree: lessonToEdit.isFree || false,
    });
    setShowLessonForm(moduleId);
  };

  const cancelEditing = () => {
    setEditingModule(null);
    setEditingLesson(null);
    setShowModuleForm(false);
    setShowLessonForm(null);
    setModuleForm({ title: "", description: "" });
    setLessonForm({ title: "", description: "", vimeoId: "", duration: "", isFree: false });
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4A1C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/platform-admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Course Management • {course.modules.length} modules
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            course.status === 'published' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}>
            {course.status}
          </span>
          <Button
            onClick={() => setShowModuleForm(true)}
            className="bg-gradient-to-r from-[#FF4A1C] to-[#2A4666]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Course Info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Price</Label>
            <p className="text-lg font-bold">${course.price}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Modules</Label>
            <p className="text-lg font-bold">{course.modules.length}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Total Lessons</Label>
            <p className="text-lg font-bold">
              {course.modules.reduce((total, module) => total + module.lessons.length, 0)}
            </p>
          </div>
        </div>
        {course.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
          </div>
        )}
      </Card>

      {/* Module Creation Form */}
      {showModuleForm && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {editingModule ? "Edit Module" : "Create New Module"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editingModule ? "Update module information" : "Add a new module to organize course lessons"}
            </p>
          </div>
          
          <form onSubmit={editingModule ? handleEditModule : handleCreateModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleTitle">Module Title *</Label>
              <Input
                id="moduleTitle"
                value={moduleForm.title}
                onChange={(e) => setModuleForm(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Introduction to React"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <textarea
                id="moduleDescription"
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={moduleForm.description}
                onChange={(e) => setModuleForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Module description..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (editingModule ? "Updating..." : "Creating...") : (editingModule ? "Update Module" : "Create Module")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Course Modules</h2>
        
        {course.modules.length === 0 ? (
          <Card className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No modules created yet. Create your first module above.
            </p>
          </Card>
        ) : (
          course.modules.map((module, index) => (
            <Card key={module.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {module.lessons.length} lessons
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowLessonForm(module.id)}
                    className="bg-gradient-to-r from-green-500 to-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lesson
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => startEditingModule(module)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {module.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {module.description}
                </p>
              )}

              {/* Lesson Creation Form */}
              {showLessonForm === module.id && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3">
                    {editingLesson ? "Edit Lesson" : "Add New Lesson"}
                  </h4>
                  <form onSubmit={editingLesson ? handleEditLesson : handleCreateLesson} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="lessonTitle">Lesson Title *</Label>
                        <Input
                          id="lessonTitle"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm(prev => ({
                            ...prev,
                            title: e.target.value
                          }))}
                          placeholder="Component Basics"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vimeoId">Vimeo Video URL or ID</Label>
                        <Input
                          id="vimeoId"
                          value={lessonForm.vimeoId}
                          onChange={(e) => setLessonForm(prev => ({
                            ...prev,
                            vimeoId: e.target.value
                          }))}
                          placeholder="https://player.vimeo.com/video/1115230490?h=4990abe118 or just 1115230490"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={lessonForm.duration}
                          onChange={(e) => setLessonForm(prev => ({
                            ...prev,
                            duration: e.target.value
                          }))}
                          placeholder="30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isFree" className="flex items-center gap-2">
                          <input
                            id="isFree"
                            type="checkbox"
                            checked={lessonForm.isFree}
                            onChange={(e) => setLessonForm(prev => ({
                              ...prev,
                              isFree: e.target.checked
                            }))}
                            className="rounded border-gray-300"
                          />
                          Free Preview Lesson
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lessonDescription">Description</Label>
                      <textarea
                        id="lessonDescription"
                        className="w-full min-h-[60px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Lesson description..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} size="sm">
                        {loading ? (editingLesson ? "Updating..." : "Creating...") : (editingLesson ? "Update Lesson" : "Create Lesson")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lessons List */}
              {module.lessons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Lessons:</h4>
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3 w-3 text-gray-400" />
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded flex items-center justify-center">
                            <span className="text-xs font-semibold text-green-600">
                              {lessonIndex + 1}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lesson.title}</p>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {lesson.vimeoId && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Play className="h-3 w-3" />
                            Video
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 text-xs"
                          onClick={() => setShowResourceManager(lesson.id)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Resources ({lesson.resources.length})
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6"
                          onClick={() => startEditingLesson(lesson, module.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Resource Manager Modal */}
      {showResourceManager && (
        <ResourceManager
          lessonId={showResourceManager}
          onClose={() => setShowResourceManager(null)}
        />
      )}
    </div>
  );
}