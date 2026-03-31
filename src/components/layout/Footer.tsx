export function Footer() {
  return (
    <footer className="bg-surface-muted dark:bg-warmGray-900 border-t border-brand-100 dark:border-warmGray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-warmGray-300">
              © 2024 Sims Challenge Tracker. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-warmGray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-warmGray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 dark:text-warmGray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-warmGray-700">
          <p className="text-xs text-gray-400 dark:text-warmGray-500 text-center">
            Made with ❤️ for Sims 4 players everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
