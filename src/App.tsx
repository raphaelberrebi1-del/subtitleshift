import { FileUpload } from './components/FileUpload';
import { TimestampShifter } from './components/TimestampShifter';
import { FindReplace } from './components/FindReplace';
import { SubtitleEditor } from './components/SubtitleEditor';
import { ExportPanel } from './components/ExportPanel';
import { useSubtitleStore } from './store/subtitleStore';

function App() {
  const { entries, fileName } = useSubtitleStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SubtitleShift
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fix subtitle timing in 30 seconds ⚡
              </p>
            </div>

            {/* File Info or New File Button */}
            {entries.length > 0 && (
              <button
                onClick={() => useSubtitleStore.setState({ entries: [], fileName: '', isDirty: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                         bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                         transition-colors"
              >
                Load New File
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {entries.length === 0 ? (
          // Show file upload when no file is loaded
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Upload your subtitle file to begin editing
              </p>
            </div>
            <FileUpload />

            {/* Features List */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Timestamp Adjuster</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shift all subtitles forward or backward by any amount - the killer feature
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✏️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Inline Editing</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click any subtitle to edit text directly - simple and fast
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Find & Replace</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fix repeated errors across all subtitles in one click
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">100% Private</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All processing happens in your browser - files never leave your device
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Show subtitle editor when file is loaded
          <div className="max-w-6xl mx-auto">
            {/* File Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {fileName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {entries.length} subtitle{entries.length !== 1 ? 's' : ''} loaded
                  </p>
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <TimestampShifter />
              <FindReplace />
            </div>

            {/* Export Panel */}
            <ExportPanel />

            {/* Subtitle Editor */}
            <SubtitleEditor />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            100% client-side - Your files never leave your browser • Made with ❤️ for content creators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
