import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, ExternalLink, Users, Folder, Play } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { initializeFirestoreClient } from '@/services/firestore-init';

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
      // Fetch all users
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData: UserData[] = [];
      
      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });

      // Fetch all projects from each user
      const allProjects: ProjectData[] = [];
      
      for (const user of usersData) {
        if (user.projects) {
          Object.entries(user.projects).forEach(([projectId, project]) => {
            allProjects.push({
              ...(project as ProjectData),
              id: projectId,
              userId: user.id,
            });
          });
        } else {
          // Try to fetch projects subcollection
          try {
            const projectsRef = collection(db, `users/${user.id}/projects`);
            const projectsSnapshot = await getDocs(projectsRef);
            projectsSnapshot.forEach((doc) => {
              allProjects.push({
                id: doc.id,
                userId: user.id,
                ...doc.data()
              });
            });
          } catch (err) {
            // Subcollection might not exist, continue
          }
        }
      }

      setUsers(usersData);
      setProjects(allProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data from Firestore');
      console.error('Error fetching Firestore data:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    setError(null);
    try {
      // Try server-side initialization first
      try {
        const response = await axios.post('/api/db/init');
        toast({
          title: "Database Initialized",
          description: response.data.message || "Database has been initialized successfully!",
        });
      } catch (serverError: any) {
        // If server-side fails, try client-side initialization
        console.log('Server-side initialization failed, trying client-side...', serverError);
        await initializeFirestoreClient();
        toast({
          title: "Database Initialized",
          description: "Database has been initialized successfully using client SDK!",
        });
      }
      // Refresh data after initialization
      await fetchData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize database';
      setError(errorMessage);
      toast({
        title: "Initialization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              Firebase Database Viewer
            </h1>
            <p className="text-muted-foreground mt-2">
              View your Firestore database collections and documents
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
              onClick={initializeDatabase}
              disabled={initializing}
              className="bg-primary text-black hover:bg-primary/90"
            >
              <Play className={`h-4 w-4 mr-2 ${initializing ? 'animate-spin' : ''}`} />
              {initializing ? 'Initializing...' : 'Initialize Database'}
            </Button>
            <Button
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://console.firebase.google.com/project/hackathon-2e5ff/firestore', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firebase Console
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

