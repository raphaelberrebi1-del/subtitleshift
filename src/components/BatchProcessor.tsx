import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import srtParser2 from 'srt-parser-2';
import { v4 as uuidv4 } from 'uuid';
import type { SubtitleEntry, ParsedSRTEntry } from '../types/subtitle.types';
import { formatToSRT } from '../utils/srtFormatter';
import { shiftTimestamp } from '../utils/timestampCalculator';
import toast from 'react-hot-toast';

interface BatchFile {
  id: string;
  name: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  processedContent?: string;
}

interface BatchProcessorProps {
  className?: string;
}

type BatchOperation = 'timestamp-shift' | 'find-replace' | 'none';

export function BatchProcessor({ className = '' }: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [operation, setOperation] = useState<BatchOperation>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  // Timestamp shift parameters
  const [shiftAmount, setShiftAmount] = useState<string>('0');
  const [shiftDirection, setShiftDirection] = useState<'forward' | 'backward'>('forward');

  // Find & Replace parameters
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const srtFiles = droppedFiles.filter(file =>
      file.name.toLowerCase().endsWith('.srt')
    );

    if (srtFiles.length === 0) {
      toast.error('Please drop .srt files only');
      return;
    }

    // Read all files
    Promise.all(
      srtFiles.map(file =>
        new Promise<BatchFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              content,
              status: 'pending',
            });
          };
          reader.readAsText(file);
        })
      )
    ).then((newFiles) => {
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s)`);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Clear all files
  const clearAll = () => {
    setFiles([]);
    setOperation('none');
  };

  // Process files with timestamp shift
  const processTimestampShift = async (file: BatchFile): Promise<string> => {
    // Parse SRT content
    const parser = new srtParser2();
    const parsedEntries: ParsedSRTEntry[] = parser.fromSrt(file.content);

    // Convert to SubtitleEntry format
    const entries: SubtitleEntry[] = parsedEntries.map((entry, index) => ({
      id: uuidv4(),
      index: index + 1,
      startTime: entry.startSeconds * 1000,
      endTime: entry.endSeconds * 1000,
      text: entry.text,
      originalStartTime: entry.startSeconds * 1000,
      originalEndTime: entry.endSeconds * 1000,
    }));

    // Shift timestamps
    const amount = parseFloat(shiftAmount) * 1000; // Convert to ms
    const offset = shiftDirection === 'forward' ? amount : -amount;
    const shiftedEntries = entries.map((entry) => ({
      ...entry,
      startTime: shiftTimestamp(entry.startTime, offset),
      endTime: shiftTimestamp(entry.endTime, offset),
    }));

    // Format back to SRT
    return formatToSRT(shiftedEntries);
  };

  // Process files with find & replace
  const processFindReplace = async (file: BatchFile): Promise<string> => {
    // Parse SRT content
    const parser = new srtParser2();
    const parsedEntries: ParsedSRTEntry[] = parser.fromSrt(file.content);

    // Convert to SubtitleEntry format
    const entries: SubtitleEntry[] = parsedEntries.map((entry, index) => ({
      id: uuidv4(),
      index: index + 1,
      startTime: entry.startSeconds * 1000,
      endTime: entry.endSeconds * 1000,
      text: entry.text,
      originalStartTime: entry.startSeconds * 1000,
      originalEndTime: entry.endSeconds * 1000,
    }));

    // Apply find & replace
    entries.forEach(entry => {
      if (useRegex) {
        try {
          const regex = new RegExp(findText, caseSensitive ? 'g' : 'gi');
          entry.text = entry.text.replace(regex, replaceText);
        } catch (err) {
          throw new Error(`Invalid regex pattern: ${findText}`);
        }
      } else {
        const searchText = caseSensitive ? findText : findText.toLowerCase();
        const targetText = caseSensitive ? entry.text : entry.text.toLowerCase();

        if (targetText.includes(searchText)) {
          if (caseSensitive) {
            entry.text = entry.text.split(findText).join(replaceText);
          } else {
            // Case-insensitive replacement
            const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            entry.text = entry.text.replace(regex, replaceText);
          }
        }
      }
    });

    // Format back to SRT
    return formatToSRT(entries);
  };

  // Process all files
  const processBatch = async () => {
    if (files.length === 0) {
      toast.error('No files to process');
      return;
    }

    if (operation === 'none') {
      toast.error('Please select an operation');
      return;
    }

    // Validate parameters
    if (operation === 'timestamp-shift') {
      const amount = parseFloat(shiftAmount);
      if (isNaN(amount) || amount === 0) {
        toast.error('Please enter a valid shift amount');
        return;
      }
    } else if (operation === 'find-replace') {
      if (!findText) {
        toast.error('Please enter text to find');
        return;
      }
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    // Process files sequentially
    for (const file of files) {
      try {
        // Update status to processing
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'processing' as const } : f
        ));

        // Process based on operation type
        let processedContent: string;
        if (operation === 'timestamp-shift') {
          processedContent = await processTimestampShift(file);
        } else if (operation === 'find-replace') {
          processedContent = await processFindReplace(file);
        } else {
          throw new Error('Invalid operation');
        }

        // Update status to completed
        setFiles(prev => prev.map(f =>
          f.id === file.id
            ? { ...f, status: 'completed' as const, processedContent }
            : f
        ));
        successCount++;
      } catch (err) {
        // Update status to error
        setFiles(prev => prev.map(f =>
          f.id === file.id
            ? {
                ...f,
                status: 'error' as const,
                error: err instanceof Error ? err.message : 'Processing failed'
              }
            : f
        ));
        errorCount++;
      }
    }

    setIsProcessing(false);

    if (errorCount === 0) {
      toast.success(`Successfully processed ${successCount} file(s)!`);
    } else {
      toast.error(`Processed ${successCount} file(s), ${errorCount} failed`);
    }
  };

  // Export as ZIP
  const exportZip = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.processedContent);

    if (completedFiles.length === 0) {
      toast.error('No processed files to export');
      return;
    }

    try {
      const zip = new JSZip();

      completedFiles.forEach(file => {
        zip.file(file.name, file.processedContent!);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(blob, `subtitleshift-batch-${timestamp}.zip`);

      toast.success(`Exported ${completedFiles.length} file(s) to ZIP`);
    } catch (err) {
      toast.error('Failed to create ZIP file');
      console.error(err);
    }
  };

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Batch Processor
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Process multiple subtitle files at once
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }
          `}
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drop .srt files here
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            or click to browse
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Files ({files.length})
              </h4>
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                >
                  {getStatusIcon(file.status)}
                  <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                  {file.error && (
                    <span className="text-xs text-red-500" title={file.error}>
                      Error
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Progress Summary */}
            {(completedCount > 0 || errorCount > 0) && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {completedCount > 0 && <span className="text-green-600 dark:text-green-400">{completedCount} completed</span>}
                {completedCount > 0 && errorCount > 0 && <span className="mx-1">•</span>}
                {errorCount > 0 && <span className="text-red-600 dark:text-red-400">{errorCount} failed</span>}
              </div>
            )}
          </div>
        )}

        {/* Operation Selector */}
        {files.length > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as BatchOperation)}
                disabled={isProcessing}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="none">Select operation...</option>
                <option value="timestamp-shift">Timestamp Shift</option>
                <option value="find-replace">Find & Replace</option>
              </select>
            </div>

            {/* Timestamp Shift Controls */}
            {operation === 'timestamp-shift' && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timestamp Shift Settings
                </h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Amount (seconds)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={shiftAmount}
                      onChange={(e) => setShiftAmount(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500
                               rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Direction
                    </label>
                    <select
                      value={shiftDirection}
                      onChange={(e) => setShiftDirection(e.target.value as 'forward' | 'backward')}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500
                               rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      <option value="forward">Forward (+)</option>
                      <option value="backward">Backward (−)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Find & Replace Controls */}
            {operation === 'find-replace' && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Find & Replace Settings
                </h4>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Find
                  </label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Text to find..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500
                             rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Replace with
                  </label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Replacement text..."
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500
                             rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      disabled={isProcessing}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Case sensitive</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => setUseRegex(e.target.checked)}
                      disabled={isProcessing}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Use regex</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={processBatch}
                disabled={isProcessing || operation === 'none'}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isProcessing ? 'Processing...' : 'Process Batch'}
              </button>
              <button
                onClick={exportZip}
                disabled={completedCount === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Export ZIP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
