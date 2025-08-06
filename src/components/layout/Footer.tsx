export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm text-gray-600">
              © 2024 Sims Challenge Tracker. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-sims-green transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-sims-green transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-sims-green transition-colors"
            >
              Support
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Made with ❤️ for Sims 4 players everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
