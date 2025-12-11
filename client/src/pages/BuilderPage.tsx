import React, { useState } from 'react';
import { ProjectProvider } from '../context/ProjectContext';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Preview } from '../components/Preview';
import { Chatbot } from '../components/Chatbot';
import AiResultModal from '../components/AiResultModal';

export default function BuilderPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Topbar 
          onPreview={() => setIsPreviewOpen(true)}
          onGenerated={(result) => {
            setGeneratedResult(result);
            setShowResultModal(true);
          }}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
          <PropertiesPanel />
        </div>
        <Chatbot />
        {isPreviewOpen && (
          <Preview onClose={() => setIsPreviewOpen(false)} />
        )}
        <AiResultModal open={showResultModal} result={generatedResult} onClose={() => setShowResultModal(false)} />
      </div>
    </ProjectProvider>
  );
}
