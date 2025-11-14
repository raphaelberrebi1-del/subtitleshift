import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSubtitleStore } from '../store/subtitleStore';
import { millisecondsToSRTTime } from '../utils/timestampCalculator';

interface TimelineProps {
  className?: string;
}

type ZoomLevel = 1 | 2 | 5 | 10;

export function Timeline({ className = '' }: TimelineProps) {
  const { entries, playbackTime, setPlaybackTime, updateEntry, videoUrl } = useSubtitleStore();
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [draggedEntry, setDraggedEntry] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Constants
  const TIMELINE_HEIGHT = 120;
  const SUBTITLE_HEIGHT = 30;
  const PIXELS_PER_SECOND = 50 * zoom; // Base 50px/sec scaled by zoom
  const TIME_MARKER_INTERVAL = zoom >= 5 ? 1 : 5; // Every 1s at high zoom, 5s otherwise

  // Calculate timeline dimensions
  const maxTime = useMemo(() => {
    if (entries.length === 0) return 60000; // Default 60s
    const lastEntry = entries[entries.length - 1];
    return Math.max(lastEntry.endTime + 10000, 60000); // Add 10s buffer
  }, [entries]);

  const timelineWidth = (maxTime / 1000) * PIXELS_PER_SECOND;

  // Convert time to X position
  const timeToX = (timeMs: number) => {
    return (timeMs / 1000) * PIXELS_PER_SECOND;
  };

  // Convert X position to time
  const xToTime = (x: number) => {
    return (x / PIXELS_PER_SECOND) * 1000;
  };

  // Get color based on subtitle duration
  const getDurationColor = (startTime: number, endTime: number) => {
    const duration = (endTime - startTime) / 1000;
    if (duration < 2) return '#EF4444'; // Red - too short
    if (duration > 5) return '#F59E0B'; // Orange - too long
    return '#10B981'; // Green - optimal
  };

  // Handle subtitle block click - seek video to that time
  const handleSubtitleClick = (startTime: number) => {
    setPlaybackTime(startTime);
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, entryId: string, startTime: number) => {
    e.stopPropagation();
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setDraggedEntry(entryId);
    setDragStartX(x);
    setDragStartTime(startTime);
  };

  // Handle dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedEntry || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const deltaX = currentX - dragStartX;
    const deltaTime = xToTime(deltaX);

    const newStartTime = Math.max(0, dragStartTime + deltaTime);

    // Update the entry (this will update both start and end time proportionally)
    const entry = entries.find(e => e.id === draggedEntry);
    if (entry) {
      const duration = entry.endTime - entry.startTime;
      updateEntry(draggedEntry, {
        startTime: Math.round(newStartTime),
        endTime: Math.round(newStartTime + duration),
      });
    }
  };

  // Handle drag end
  const handleMouseUp = () => {
    setDraggedEntry(null);
  };

  // Handle timeline click - seek to position
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (draggedEntry) return; // Don't seek if we're dragging
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = xToTime(x);

    setPlaybackTime(Math.max(0, Math.min(time, maxTime)));
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (zoom < 10) {
      const newZoom = zoom === 1 ? 2 : zoom === 2 ? 5 : 10;
      setZoom(newZoom as ZoomLevel);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 1) {
      const newZoom = zoom === 10 ? 5 : zoom === 5 ? 2 : 1;
      setZoom(newZoom as ZoomLevel);
    }
  };

  // Auto-scroll to playhead
  useEffect(() => {
    if (!timelineRef.current) return;
    const playheadX = timeToX(playbackTime);
    const containerWidth = timelineRef.current.clientWidth;
    const scrollLeft = timelineRef.current.scrollLeft;

    // Keep playhead in view
    if (playheadX < scrollLeft || playheadX > scrollLeft + containerWidth) {
      timelineRef.current.scrollLeft = playheadX - containerWidth / 2;
    }
  }, [playbackTime, zoom]);

  if (!videoUrl) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          Load a video to see the timeline
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header with zoom controls */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Visual Timeline
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            Zoom: {zoom}x
          </span>
          <motion.button
            onClick={handleZoomOut}
            disabled={zoom === 1}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
            whileHover={zoom !== 1 ? { scale: 1.1 } : {}}
            whileTap={zoom !== 1 ? { scale: 0.9 } : {}}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </motion.button>
          <motion.button
            onClick={handleZoomIn}
            disabled={zoom === 10}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
            whileHover={zoom !== 10 ? { scale: 1.1 } : {}}
            whileTap={zoom !== 10 ? { scale: 0.9 } : {}}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Timeline SVG */}
      <div
        ref={timelineRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ height: TIMELINE_HEIGHT }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width={timelineWidth}
          height={TIMELINE_HEIGHT}
          className="cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Time markers */}
          {Array.from({ length: Math.ceil(maxTime / 1000 / TIME_MARKER_INTERVAL) + 1 }).map((_, i) => {
            const time = i * TIME_MARKER_INTERVAL * 1000;
            const x = timeToX(time);
            return (
              <g key={`marker-${i}`}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={TIMELINE_HEIGHT}
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-600"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <text
                  x={x}
                  y={15}
                  fontSize="10"
                  fill="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  textAnchor="middle"
                >
                  {millisecondsToSRTTime(time).split(',')[0]}
                </text>
              </g>
            );
          })}

          {/* Subtitle blocks */}
          {entries.map((entry) => {
            const x = timeToX(entry.startTime);
            const width = timeToX(entry.endTime) - x;
            const color = getDurationColor(entry.startTime, entry.endTime);
            const isDragging = draggedEntry === entry.id;

            return (
              <g key={entry.id}>
                {/* Subtitle block */}
                <rect
                  x={x}
                  y={40}
                  width={Math.max(width, 2)} // Minimum 2px width
                  height={SUBTITLE_HEIGHT}
                  fill={color}
                  opacity={isDragging ? 0.7 : 0.8}
                  rx="4"
                  className="cursor-move hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => handleMouseDown(e as any, entry.id, entry.startTime)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubtitleClick(entry.startTime);
                  }}
                />
                {/* Subtitle text (if width allows) */}
                {width > 50 && (
                  <text
                    x={x + 5}
                    y={57}
                    fontSize="10"
                    fill="white"
                    className="pointer-events-none select-none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {entry.text.length > 20 ? entry.text.substring(0, 20) + '...' : entry.text}
                  </text>
                )}
              </g>
            );
          })}

          {/* Playhead */}
          <line
            x1={timeToX(playbackTime)}
            y1={0}
            x2={timeToX(playbackTime)}
            y2={TIMELINE_HEIGHT}
            stroke="#3B82F6"
            strokeWidth="2"
            className="pointer-events-none"
          />
          <circle
            cx={timeToX(playbackTime)}
            cy={10}
            r="6"
            fill="#3B82F6"
            className="pointer-events-none"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Optimal (2-5s)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Too Short (&lt;2s)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span className="text-gray-600 dark:text-gray-400">Too Long (&gt;5s)</span>
        </div>
        <div className="flex-1"></div>
        <span className="text-gray-500 dark:text-gray-400 italic">
          Drag subtitles to adjust timing • Click to seek video
        </span>
      </div>
    </div>
  );
}
