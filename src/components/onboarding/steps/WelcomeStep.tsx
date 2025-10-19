'use client'

import { Button } from '@/src/components/ui/Button'

interface WelcomeStepProps {
  onComplete: () => void
  userName?: string
}

export default function WelcomeStep({ onComplete, userName = 'there' }: WelcomeStepProps) {
  return (
    <div className="p-8 md:p-12">
      {/* Celebration Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          You're all set, {userName}!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your account is ready. Let's start tracking your Sims 4 challenges and see how far you can go!
        </p>
      </div>

      {/* Quick Start Options */}
      <div className="max-w-2xl mx-auto space-y-4 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          What would you like to do first?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Start a Challenge */}
          <div className="group border-2 border-gray-200 rounded-xl p-6 hover:border-brand-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-brand-50">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Challenge</h3>
            <p className="text-sm text-gray-600">
              Begin your first legacy, 100 Baby Challenge, or create a custom challenge to track your progress.
            </p>
          </div>

          {/* Create a Sim */}
          <div className="group border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-purple-50">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a Sim</h3>
            <p className="text-sm text-gray-600">
              Add your first Sim to track their aspirations, careers, traits, and achievements throughout their life.
            </p>
          </div>
        </div>

        {/* Or explore dashboard */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-sm text-gray-600">
            Or explore your dashboard to see all available features
          </p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-2xl mx-auto mb-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          What you can do with Challenger
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Track Goals</p>
            <p className="text-xs text-gray-500">Monitor your challenge progress</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Manage Sims</p>
            <p className="text-xs text-gray-500">Track families across generations</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Earn Points</p>
            <p className="text-xs text-gray-500">Complete goals and achievements</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          className="min-w-[200px]"
        >
          Go to Dashboard
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          You can customize your profile and settings anytime
        </p>
      </div>
    </div>
  )
}