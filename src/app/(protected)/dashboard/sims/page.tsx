// app/sims/page.tsx (or wherever your Sims list route lives)
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Database } from '@/src/types/database.types'
import { SimCard } from '@/src/components/sim/SimCard'
import { Traits } from '@/src/components/sim/TraitsCatalog'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

type ViewTab = 'all' | 'by_challenge'

export default function SimsPage() {
  const supabase = createSupabaseBrowserClient()

  // ---------- UI State ----------
  const [tab, setTab] = useState<ViewTab>('by_challenge')
  const [search, setSearch] = useState('')
  const [heirsOnly, setHeirsOnly] = useState(false)
  const [hasTraitsOnly, setHasTraitsOnly] = useState(false)

  // ---------- Data ----------
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sims, setSims] = useState<Sim[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])

  // Group sims by challenge_id directly
  const simsByChallenge = useMemo(() => {
    const groups = new Map<string, Sim[]>()
    for (const sim of sims) {
      if (!sim.challenge_id) continue
      const arr = groups.get(sim.challenge_id) ?? []
      arr.push(sim)
      groups.set(sim.challenge_id, arr)
    }
    return groups
  }, [sims])

  const unassignedSims = useMemo(
    () => sims.filter(s => !s.challenge_id),
    [sims]
  )

  const challengeById = useMemo(() => {
    const m = new Map<string, Challenge>()
    challenges.forEach(c => m.set(c.id, c))
    return m
  }, [challenges])

  // ---------- Fetch ----------
  useEffect(() => {
    let mounted = true
      ; (async () => {
        setLoading(true); setError(null)
        try {
          // pull sims
          const { data: simsData, error: simsErr } = await supabase
            .from('sims')
            .select('*')
            .order('created_at', { ascending: false })
          if (simsErr) throw simsErr

          // pull all challenges for this user (or visible)
          const { data: chData, error: chErr } = await supabase
            .from('challenges')
            .select('*')
            .order('created_at', { ascending: false })
          if (chErr) throw chErr

          if (!mounted) return
          setSims(simsData ?? [])
          setChallenges(chData ?? [])
        } catch (e: unknown) {
          if (!mounted) return
          setError(e instanceof Error ? e.message : 'Failed to load Sims')
        } finally {
          if (!mounted) return
          setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [supabase])

  // ---------- Derived: search & chips filters ----------
  const normalizedQuery = search.trim().toLowerCase()
  function passesSearch(sim: Sim) {
    if (!normalizedQuery) return true
    const hay = `${sim.name} ${sim.career ?? ''} ${sim.aspiration ?? ''}`.toLowerCase()
    return hay.includes(normalizedQuery)
  }
  function passesHeir(sim: Sim) {
    if (!heirsOnly) return true
    return !!sim.is_heir
  }
  function passesTraits(sim: Sim) {
    if (!hasTraitsOnly) return true
    return Array.isArray(sim.traits) && (sim.traits as unknown as string[]).length > 0
  }

  const filteredUnassigned = useMemo(
    () => unassignedSims.filter(s => passesSearch(s) && passesHeir(s) && passesTraits(s)),
    [unassignedSims, passesHeir, passesTraits, normalizedQuery]
  )

  const filteredGroups = useMemo(() => {
    const out: Array<{ challenge: Challenge; sims: Sim[] }> = []
    for (const [challengeId, list] of Array.from(simsByChallenge.entries())) {
      const ch = challengeById.get(challengeId)
      if (!ch) continue
      const simsFiltered = list.filter((s: Sim) => passesSearch(s) && passesHeir(s) && passesTraits(s))
      if (simsFiltered.length) out.push({ challenge: ch, sims: simsFiltered })
    }
    // sort groups by challenge created_at desc
    out.sort((a, b) => (b.challenge.created_at ?? '').localeCompare(a.challenge.created_at ?? ''))
    return out
  }, [simsByChallenge, challengeById, passesHeir, passesTraits, normalizedQuery])

  // ---------- Actions: link/unlink (lightweight) ----------
  async function linkToChallenge(sim: Sim, challengeId: string) {
    const { data, error } = await supabase
      .from('sims')
      .update({ challenge_id: challengeId })
      .eq('id', sim.id)
      .select()
      .single()
    if (error) { console.error(error); return }
    setSims(prev => prev.map(s => s.id === sim.id ? data : s))
  }

  async function unlinkFromChallenge(sim: Sim) {
    const { error } = await supabase
      .from('sims')
      .update({ challenge_id: null })
      .eq('id', sim.id)
    if (error) { console.error(error); return }
    setSims(prev => prev.map(s => s.id === sim.id ? { ...s, challenge_id: null } : s))
  }

  // ---------- Render ----------
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b bg-white/90 dark:bg-warmGray-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Sims</h1>
            <span className="text-sm text-gray-500">({sims.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <nav className="rounded-lg border border-gray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-900 p-1 text-sm">
              <button
                className={clsx('rounded-md px-3 py-1', tab === 'by_challenge' ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-warmGray-300 hover:bg-gray-100 dark:hover:bg-warmGray-800')}
                onClick={() => setTab('by_challenge')}
              >
                By Challenge
              </button>
              <button
                className={clsx('rounded-md px-3 py-1', tab === 'all' ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-warmGray-300 hover:bg-gray-100 dark:hover:bg-warmGray-800')}
                onClick={() => setTab('all')}
              >
                All Sims
              </button>
            </nav>

            {/* Search */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, career, aspiration…"
              className="w-64 rounded-md border border-gray-300 dark:border-warmGray-700 px-3 py-1.5 text-sm bg-white dark:bg-warmGray-900 text-gray-900 dark:text-warmGray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />

            {/* Add Sim */}
            <Link href="/sims/new" className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600">
              Add Sim
            </Link>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={clsx(
                'rounded-full border px-3 py-1 text-xs',
                heirsOnly ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => setHeirsOnly(v => !v)}
              title="Show only current heirs"
            >
              Heirs only
            </button>
            <button
              className={clsx(
                'rounded-full border px-3 py-1 text-xs',
                hasTraitsOnly ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => setHasTraitsOnly(v => !v)}
              title="Show Sims that have traits"
            >
              Has traits
            </button>

            {(heirsOnly || hasTraitsOnly || search) && (
              <button
                className="ml-2 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                onClick={() => { setHeirsOnly(false); setHasTraitsOnly(false); setSearch('') }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
        ) : sims.length === 0 ? (
          <EmptyState />
        ) : tab === 'all' ? (
          <Section title="All Sims">
            <SimGrid
              sims={sims.filter(s => passesSearch(s) && passesHeir(s) && passesTraits(s))}
              challengesMap={challengeById}
              onLinkToChallenge={(sim) => {
                // Quick link: choose the most recent challenge (or pop a dialog in your real app)
                const latest = challenges[0]
                if (latest) linkToChallenge(sim, latest.id)
              }}
              onUnlinkFromChallenge={unlinkFromChallenge}
            />
          </Section>
        ) : (
          <>
            {/* Unassigned first */}
            {filteredUnassigned.length > 0 && (
              <Section title="Unassigned Sims" subtitle="Not linked to any challenge">
                <SimGrid
                  sims={filteredUnassigned}
                  challengesMap={challengeById}
                  onLinkToChallenge={(sim) => {
                    const latest = challenges[0]
                    if (latest) linkToChallenge(sim, latest.id)
                  }}
                  onUnlinkFromChallenge={unlinkFromChallenge}
                />
              </Section>
            )}

            {/* Groups by challenge */}
            {filteredGroups.map(({ challenge, sims }) => (
              <Section
                key={challenge.id}
                title={challenge.challenge_type ?? ''}
                subtitle={challenge.description ?? undefined}
                action={<Link className="text-sm text-brand-600 dark:text-brand-400 hover:underline" href={`/challenges/${challenge.id}`}>Open</Link>}
              >
                <SimGrid
                  sims={sims}
                  challenge={challenge}
                  challengesMap={challengeById}
                  onLinkToChallenge={(sim) => linkToChallenge(sim, challenge.id)}
                  onUnlinkFromChallenge={unlinkFromChallenge}
                />
              </Section>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- Small Presentational Bits ---------- */

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-warmGray-700 p-10 text-center">
      <h3 className="text-base font-semibold text-gray-900 dark:text-warmGray-100">No Sims yet</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-warmGray-400">Create your first Sim to get started.</p>
      <div className="mt-4">
        <Link href="/sims/new" className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          Add Sim
        </Link>
      </div>
    </div>
  )
}

function SimGrid({
  sims,
  challenge,
  challengesMap,
  onLinkToChallenge,
  onUnlinkFromChallenge,
}: {
  sims: Sim[]
  challenge?: Challenge | null
  challengesMap: Map<string, Challenge>
  onLinkToChallenge: (sim: Sim) => void
  onUnlinkFromChallenge: (sim: Sim) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sims.map(sim => (
        <SimCard
          key={sim.id}
          sim={sim}
          challenge={challenge ?? null}
          traitCatalog={Traits}
          onEdit={(s) => { window.location.href = `/sim/${s.id}` }}
          onLinkToChallenge={onLinkToChallenge}
          onUnlinkFromChallenge={onUnlinkFromChallenge}
          compact={false}
        />
      ))}
    </div>
  )
}
