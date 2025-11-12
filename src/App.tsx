import { FileUpload } from './components/FileUpload';
import { useSubtitleStore } from './store/subtitleStore';

function App() {
  const { entries, fileName } = useSubtitleStore();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SubtitleShift
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fix subtitle timing in 30 seconds
              </p>
            </div>

            {/* Dark Mode Toggle - TODO: Implement */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {entries.length === 0 ? (
          // Show file upload when no file is loaded
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your subtitle file to begin editing
              </p>
            </div>
            <FileUpload />
          </div>
        ) : (
          // Show subtitle editor when file is loaded
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {fileName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {entries.length} subtitle{entries.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Subtitle List - Simple view for now */}
            <div className="space-y-2">
              {entries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {Math.floor(entry.startTime / 1000)}s - {Math.floor(entry.endTime / 1000)}s
                      </div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {entry.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length > 10 && (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  ... and {entries.length - 10} more
                </div>
              )}
            </div>

            {/* Load another file button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => useSubtitleStore.setState({ entries: [], fileName: '' })}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Load Another File
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            100% client-side - Your files never leave your browser
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
