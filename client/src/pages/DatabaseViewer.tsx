import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, ExternalLink, Users, Folder } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface ProjectData {
  id: string;
  name?: string;
  layout?: any;
  generated?: any;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface UserData {
  id: string;
  projects?: { [key: string]: ProjectData };
  [key: string]: any;
}

export default function DatabaseViewer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch projects from MongoDB via API
      const response = await axios.get('/api/projects');
      const projectsData = response.data || [];
      
      // Group projects by user if available
      const usersMap = new Map<string, UserData>();
      const allProjects: ProjectData[] = [];
      
      projectsData.forEach((project: any) => {
        allProjects.push({
          id: project._id || project.id,
          name: project.name,
          layout: project.layout,
          userId: project.userId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        });
        
        if (project.userId && !usersMap.has(project.userId)) {
          usersMap.set(project.userId, {
            id: project.userId,
            projects: {},
          });
        }
      });

      setUsers(Array.from(usersMap.values()));
      setProjects(allProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data from MongoDB');
      console.error('Error fetching MongoDB data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return String(timestamp);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              MongoDB Database Viewer
            </h1>
            <p className="text-muted-foreground mt-2">
              View your MongoDB collections and documents
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/builder')}
            >
              Back to Builder
            </Button>
            <Button
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading database...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Users Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users Collection
                  <Badge variant="secondary">{users.length} users</Badge>
                </CardTitle>
                <CardDescription>
                  All users in the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-muted-foreground py-4">No users found in the database.</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id} className="border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">User ID: {user.id}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                            {JSON.stringify(user, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Projects Collection
                  <Badge variant="secondary">{projects.length} projects</Badge>
                </CardTitle>
                <CardDescription>
                  All projects stored in Firestore
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-muted-foreground py-4">No projects found in the database.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {project.name || `Project ${project.id}`}
                            </CardTitle>
                            {project.userId && (
                              <Badge variant="outline">User: {project.userId}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Project ID:</span> {project.id}
                            </div>
                            {project.createdAt && (
                              <div>
                                <span className="font-semibold">Created:</span> {formatDate(project.createdAt)}
                              </div>
                            )}
                            {project.updatedAt && (
                              <div>
                                <span className="font-semibold">Updated:</span> {formatDate(project.updatedAt)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Full Data:</p>
                            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-96">
                              {JSON.stringify(project, null, 2)}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

