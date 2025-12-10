import React, { useState } from 'react';
import { ProjectProvider } from '../context/ProjectContext';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Preview } from '../components/Preview';

export default function BuilderPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Topbar onPreview={() => setIsPreviewOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
          <PropertiesPanel />
        </div>
        {isPreviewOpen && (
          <Preview onClose={() => setIsPreviewOpen(false)} />
        )}
      </div>
    </ProjectProvider>
  );
}
