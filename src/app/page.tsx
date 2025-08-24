import Link from 'next/link'
import { Navbar } from '@/src/components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sims-green/10 to-sims-blue/10">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Ultimate Sims 4 Legacy Challenge Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Say goodbye to spreadsheets! Track your Legacy Challenge across 10 generations
            with built-in scoring, family trees, and goal management.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Your Legacy
            </Link>
          </div>
        </section>

        {/* Legacy Challenge Features */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for the Perfect Legacy
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2">Family Management</h3>
              <p className="text-gray-600">
                Track heirs, spouses, and children across all 10 generations with clear family trees
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Automatic Scoring</h3>
              <p className="text-gray-600">
                Built-in point calculation across all 11 categories for accurate legacy scoring
              </p>
            </div>

            <div className="card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
              <p className="text-gray-600">
                Complete and track memorializations, aspirations, skills, and more with detailed logs
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-sims-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Create Challenge</h4>
              <p className="text-sm text-gray-600">Set up your legacy with custom rules and expansion packs</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-sims-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Add Your Sims</h4>
              <p className="text-sm text-gray-600">Create founder and track family members through generations</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-sims-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Complete Goals</h4>
              <p className="text-sm text-gray-600">Mark achievements and track detailed completion methods</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-sims-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Watch Score Grow</h4>
              <p className="text-sm text-gray-600">See your legacy score increase as you hit milestones</p>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-20">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              More Challenges Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              Legacy Challenge is just the beginning! We're working on support for other popular challenges.
            </p>

            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🌈</span>
                <span>Not So Berry Challenge</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">👶</span>
                <span>100 Baby Challenge</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                <span>Custom Challenges</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your Legacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Simmers who have already discovered the joy of organized legacy tracking.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Create Your Legacy
            </Link>
            <Link href="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}