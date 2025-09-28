'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import AccountStep from '@/src/components/ui/AccountStep'
import PacksStep from '@/src/components/ui/PacksStep'
import StarterStep from '@/src/components/ui/StarterStep'

const STEPS = ['Account', 'Packs', 'Welcome']

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const progress = ((step + 1) / STEPS.length) * 100

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)) }
  function back() { setStep((s) => Math.max(s - 1, 0)) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        {/* Progress Header */}
        <div className="text-center space-y-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-center space-x-4">
            {STEPS.map((stepName, index) => {
              const isActive = index === step
              const isCompleted = index < step
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`relative w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white'
                      : isActive 
                        ? 'bg-white border-purple-500 text-purple-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`font-semibold ${isActive ? 'text-purple-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {stepName}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-6 h-1 w-16 rounded-full transition-all duration-300 ${
                      index < step ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Step {step + 1} of {STEPS.length} • {Math.round(progress)}% Complete
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
          <CardHeader className="pb-0">
            <div className="text-center">
              {step === 0 && (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Create Your Account
                  </h2>
                  <p className="text-gray-600 text-lg">Join the Sims community and start tracking your challenges</p>
                </div>
              )}
              
              {step === 1 && (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Your Expansion Packs
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Select the packs you own to unlock content and features. You can change this anytime in your profile.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    Welcome to SimTracker!
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    You're all set up! Ready to start tracking your Sims challenges and building your legacy.
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="mx-auto w-full max-w-md space-y-6">
                <AccountStep onSuccess={next} />
              </div>
            )}
            
            {/* Step 1: Packs */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800">Base Game Included</h3>
                      <p className="text-emerald-600">The Sims 4 base game is always available with core features</p>
                    </div>
                  </div>
                </div>
                <PacksStep onBack={back} onNext={next} />
              </div>
            )}
            
            {/* Step 2: Welcome */}
            {step === 2 && (
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200">
                  <h3 className="text-2xl font-bold text-purple-800 mb-4">What's Next?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Create Your First Challenge</h4>
                      <p className="text-gray-600">Start with a Legacy Challenge, Not So Berry, or create your own custom challenge.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Add Your First Sim</h4>
                      <p className="text-gray-600">Create your founder and start building your Sims family tree and achievements.</p>
                    </div>
                  </div>
                </div>
                <StarterStep onBack={back} />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button 
                variant="ghost" 
                onClick={back} 
                disabled={step === 0}
                className="text-lg px-6 py-3"
              >
                {step > 0 && '← Back'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}