'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/src/components/layout/Navbar'
import { AuthInitializer } from '../components/auth/AuthInitializer'
import { LoginModal } from '@/src/components/auth/LoginModal'
import { Button } from '@/src/components/ui/Button'

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sims-purple/10 to-sims-pink/10">
      <AuthInitializer />
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            The Ultimate Sims 4 Legacy Challenge Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your Legacy Challenge across 10 generations
            with built-in scoring, family trees, and goal management.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:opacity-90 text-white px-8 py-6 text-lg rounded-3xl shadow-lg">
                Start Your Legacy
              </Button>
            </Link>
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              size="lg" 
              variant="outline"
              className="border-2 border-brand-500 text-brand-500 hover:bg-brand-50/10 px-8 py-6 text-lg rounded-3xl shadow-lg"
            >
              Sign In
            </Button>
          </div>
        </section>

        {/* Legacy Challenge Features */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for the Perfect Legacy
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 border border-brand-500/10">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2 text-brand-500">Family Management</h3>
              <p className="text-gray-600">
                Track heirs, spouses, and children across all 10 generations with clear family trees
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 border border-brand-500/10">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2 text-brand-500">Automatic Scoring</h3>
              <p className="text-gray-600">
                Built-in point calculation across all 11 categories for accurate legacy scoring
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 border border-brand-500/10">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-brand-500">Goal Tracking</h3>
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
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
                1
              </div>
              <h4 className="font-semibold mb-2 text-brand-500">Create Challenge</h4>
              <p className="text-sm text-gray-600">Set up your legacy with custom rules and expansion packs</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
                2
              </div>
              <h4 className="font-semibold mb-2 text-brand-500">Add Your Sims</h4>
              <p className="text-sm text-gray-600">Create founder and track family members through generations</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
                3
              </div>
              <h4 className="font-semibold mb-2 text-brand-500">Complete Goals</h4>
              <p className="text-sm text-gray-600">Mark achievements and track detailed completion methods</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-md">
                4
              </div>
                <h4 className="font-semibold mb-2 text-brand-500">Watch Score Grow</h4>
              <p className="text-sm text-gray-600">See your legacy score increase as you hit milestones</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-20 text-center bg-white rounded-3xl shadow-lg p-8 border border-brand-500/10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your Legacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Simmers who have already discovered the joy of organized legacy tracking.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:opacity-90 text-white px-8 py-6 text-lg rounded-3xl shadow-lg">
                Create Your Legacy
              </Button>
            </Link>
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              size="lg" 
              variant="outline"
              className="border-2 border-brand-500 text-brand-500 hover:bg-brand-50/10 px-8 py-6 text-lg rounded-3xl shadow-lg"
            >
              Sign In
            </Button>
          </div>
        </section>
      </main>
      
      {/* Modal for sign in */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  )
}