import React, { useState, useEffect } from 'react';
import { Cpu, FileCode, Copy, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { GenerationResult } from '@/services/api';
import { toast } from 'sonner';

export default function AiResultModal({
  open,
  result,
  onClose,
}: {
  open: boolean;
  result: GenerationResult | null;
  onClose: () => void;
}) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [modifiedResult, setModifiedResult] = useState(result);

  // Sync modifiedResult when result prop changes
  useEffect(() => {
    setModifiedResult(result);
    setActiveFileIndex(0);
  }, [result]);

  if (!open) return null;

  // Calculate modal size based on code content length
  const currentCode = modifiedResult?.files[activeFileIndex]?.content || '';
  const lineCount = currentCode.split('\n').length;
  
  // Dynamically set height: smaller files = smaller modal, larger files = larger modal
  let modalHeight = 'max-h-[85vh]'; // default
  let modalWidth = 'max-w-[95vw]'; // almost full screen width
  
  if (lineCount > 100) {
    modalHeight = 'max-h-[90vh]'; // very large file
    modalWidth = 'max-w-[95vw]';
  } else if (lineCount > 50) {
    modalHeight = 'max-h-[88vh]'; // large file
    modalWidth = 'max-w-[95vw]';
  } else if (lineCount > 20) {
    modalHeight = 'max-h-[85vh]'; // medium file
    modalWidth = 'max-w-[95vw]';
  }

  const copyToClipboard = async () => {
    const content = result?.files[activeFileIndex]?.content;
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAll = async () => {
    if (!modifiedResult) return;
    const all = modifiedResult.files.map((f) => `// ${f.name}\n\n${f.content}`).join('\n\n');
    await navigator.clipboard.writeText(all);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const currentContent = modifiedResult?.files[activeFileIndex]?.content;
      if (!currentContent) return;

      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);
      
      // Update the modified result state with optimized code
      if (modifiedResult && modifiedResult.files[activeFileIndex]) {
        const updatedFiles = [...modifiedResult.files];
        updatedFiles[activeFileIndex] = {
          ...updatedFiles[activeFileIndex],
          content: data.optimizedCode,
        };
        setModifiedResult({
          ...modifiedResult,
          files: updatedFiles,
        });
      }
      
      toast.success("Code Optimized", {
        description: data.notes || "Code has been optimized successfully.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Optimize error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to optimize code", {
        duration: 3000,
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <>
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - removed pointer-events-none from parent */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full flex flex-col bg-zinc-950 border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden rounded-lg transition-all duration-300 ${modalHeight} ${modalWidth}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="text-primary flex items-center gap-2 text-lg font-semibold">
                <Cpu size={20} /> AI Generation Result
              </div>
              <div className="text-zinc-400 text-sm">{modifiedResult?.notes || 'Code generation complete.'}</div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded transition-colors flex-shrink-0"
              type="button"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* File Explorer Sidebar */}
            <div className="w-48 bg-zinc-900 border-r border-white/10 p-3 overflow-y-auto flex-shrink-0">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Generated Files</h3>
              <div className="space-y-1">
                {modifiedResult?.files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`w-full text-left px-2 py-2 rounded text-xs flex items-center gap-2 transition-colors ${
                      activeFileIndex === idx ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FileCode size={12} />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
              <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#252526]">
                <span className="text-xs text-zinc-400 font-mono">{modifiedResult?.files[activeFileIndex]?.name}</span>
                <button
                  onClick={copyToClipboard}
                  className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-white/10 px-2 rounded transition-colors flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                {modifiedResult && (
                  <SyntaxHighlighter
                    language={modifiedResult.files[activeFileIndex].language === 'jsx' ? 'javascript' : 'css'}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                    showLineNumbers={true}
                  >
                    {modifiedResult.files[activeFileIndex].content}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
              type="button"
            >
              Close
            </button>
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="px-4 py-2 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isOptimizing ? 'Optimizing...' : 'Optimize Code'}
            </button>
            <button
              onClick={copyAll}
              className="px-4 py-2 rounded bg-primary text-black hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            >
              <Copy size={14} /> Copy All Files
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
