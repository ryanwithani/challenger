import Link from 'next/link'
import { Header } from '@/src/components/layout/Header'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sims-green/10 to-sims-blue/10">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Track Your Sims 4 Challenges
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Say goodbye to spreadsheets! Track your Legacy, Not So Berry, 100 Baby, 
            and custom challenges with our purpose-built tracker.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </section>
        
        <section className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card text-center">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">Legacy Challenge</h3>
            <p className="text-gray-600">
              Track 10 generations of your Sim family with built-in rules and goals
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🍓</div>
            <h3 className="text-xl font-semibold mb-2">Not So Berry</h3>
            <p className="text-gray-600">
              Follow each generation's color theme and complete unique objectives
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">👶</div>
            <h3 className="text-xl font-semibold mb-2">100 Baby Challenge</h3>
            <p className="text-gray-600">
              Keep track of all 100 babies and their unique traits
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}