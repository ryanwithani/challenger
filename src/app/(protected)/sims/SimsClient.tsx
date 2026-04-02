'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { SimCard } from '@/src/components/sim/SimCard'
import { PageShell } from '@/src/components/layout/GridPageShell'
import { Button } from '@/src/components/ui/Button'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { SIMS_TABS, type SimsTabId, type SimSortKey } from '@/src/lib/constants'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import SimsToolbar from '@/src/components/sim/SimsToolbar'
import SimDetailPanel from '@/src/components/sim/SimDetailPanel'
import BulkActionBar from '@/src/components/sim/BulkActionBar'
import ByChallengeView from '@/src/components/sim/ByChallengeView'
import FamilyTreeView from '@/src/components/sim/FamilyTreeView'

type Sim = Database['public']['Tables']['sims']['Row']

interface SimsClientProps {
  initialSims: Sim[]
}

interface SimFilters {
  heirs: boolean
  hasTraits: boolean
  challengeId: string | null
}

const DEFAULT_FILTERS: SimFilters = {
  heirs: false,
  hasTraits: false,
  challengeId: null,
}

const DEFAULT_TAB: SimsTabId = 'all'
const DEFAULT_SORT: SimSortKey = 'newest'

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function sortSims(sims: Sim[], key: SimSortKey): Sim[] {
  const sorted = [...sims]
  switch (key) {
    case 'name-asc':
      return sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    case 'name-desc':
      return sorted.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''))
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime(),
      )
    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime(),
      )
    case 'generation-asc':
      return sorted.sort((a, b) => (a.generation ?? 999) - (b.generation ?? 999))
    case 'generation-desc':
      return sorted.sort((a, b) => (b.generation ?? 0) - (a.generation ?? 0))
    default:
      return sorted
  }
}

function matchesSearch(sim: Sim, query: string): boolean {
  if (!query) return true
  const haystack = `${sim.name ?? ''} ${sim.career ?? ''} ${sim.aspiration ?? ''}`.toLowerCase()
  return haystack.includes(query)
}

function passesFilters(sim: Sim, filters: SimFilters): boolean {
  if (filters.heirs && sim.is_heir !== true) return false
  if (filters.hasTraits) {
    const traits = sim.traits as unknown as string[] | null
    if (!Array.isArray(traits) || traits.length === 0) return false
  }
  if (filters.challengeId && sim.challenge_id !== filters.challengeId) return false
  return true
}

// ---------------------------------------------------------------------------
// Inline helper components
// ---------------------------------------------------------------------------

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-warmGray-200 dark:bg-warmGray-700 h-56"
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 border border-dashed rounded-lg border-brand-200 dark:border-warmGray-700">
      <p className="text-sm text-warmGray-500 dark:text-warmGray-400 mb-3">
        No sims yet. Add your first sim to start tracking your legacy.
      </p>
      <Link href="/dashboard/new/sim">
        <Button size="sm">Add Sim</Button>
      </Link>
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <p className="text-sm text-warmGray-500 dark:text-warmGray-400 mb-3">
        No sims match your filters.
      </p>
      <button
        onClick={onClear}
        className="text-sm text-brand-500 hover:text-brand-600 font-medium"
      >
        Clear filters
      </button>
    </div>
  )
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4 flex items-center justify-between">
      <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>
      <button
        onClick={onRetry}
        className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline"
      >
        Retry
      </button>
    </div>
  )
}

function SimsGrid({
  sims,
  traitCatalog,
  onOpenPanel,
  isBulkMode,
  selectedSimIds,
  onSelect,
}: {
  sims: Sim[]
  traitCatalog: typeof Traits
  onOpenPanel: (id: string) => void
  isBulkMode: boolean
  selectedSimIds: Record<string, true>
  onSelect?: (id: string) => void
}) {
  const router = useRouter()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sims.map(sim => (
        <SimCard
          key={sim.id}
          sim={sim}
          traitCatalog={traitCatalog}
          onOpenPanel={() => onOpenPanel(sim.id)}
          onEdit={() => router.push(`/sim/${sim.id}`)}
          isSelected={!!selectedSimIds[sim.id]}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// InlineToolbar removed — using SimsToolbar component

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SimsClient({ initialSims }: SimsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Store hooks
  const { familyMembers: allSims, setSims, loading, error, fetchAllSims, assignToChallenge, unassignFromChallenge, deleteSim } = useSimStore()
  const { challenges, fetchChallenges } = useChallengeStore()

  // URL-persisted state
  const activeTab = (searchParams.get('tab') as SimsTabId) || DEFAULT_TAB
  const sortBy = (searchParams.get('sort') as SimSortKey) || DEFAULT_SORT

  // Ephemeral state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSimIds, setSelectedSimIds] = useState<Record<string, true>>({})
  const [activePanelSimId, setActivePanelSimId] = useState<string | null>(null)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [filters, setFilters] = useState<SimFilters>(DEFAULT_FILTERS)

  // ---------------------------------------------------------------------------
  // On mount: seed stores
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setSims(initialSims)
    fetchChallenges()
  }, [initialSims, setSims, fetchChallenges])

  // ---------------------------------------------------------------------------
  // URL param helper
  // ---------------------------------------------------------------------------
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key)
        else params.set(key, value)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const normalizedQuery = searchQuery.toLowerCase()

  const filteredSims = useMemo(() => {
    const filtered = allSims.filter(
      sim => matchesSearch(sim, normalizedQuery) && passesFilters(sim, filters),
    )
    return sortSims(filtered, sortBy)
  }, [allSims, normalizedQuery, filters, sortBy])

  const { groupedSims, unassignedSims } = useMemo(() => {
    const grouped = new Map<string, Sim[]>()
    const unassigned: Sim[] = []

    for (const sim of filteredSims) {
      if (sim.challenge_id) {
        const existing = grouped.get(sim.challenge_id) ?? []
        existing.push(sim)
        grouped.set(sim.challenge_id, existing)
      } else {
        unassigned.push(sim)
      }
    }

    return { groupedSims: grouped, unassignedSims: unassigned }
  }, [filteredSims])

  const panelNav = useMemo(() => {
    if (!activePanelSimId) return null
    const index = filteredSims.findIndex(s => s.id === activePanelSimId)
    if (index === -1) return null
    return {
      index,
      prevId: index > 0 ? filteredSims[index - 1].id : null,
      nextId: index < filteredSims.length - 1 ? filteredSims[index + 1].id : null,
      total: filteredSims.length,
    }
  }, [filteredSims, activePanelSimId])

  // ---------------------------------------------------------------------------
  // Mutual exclusion callbacks
  // ---------------------------------------------------------------------------
  const openPanel = useCallback((simId: string) => {
    setIsBulkMode(false)
    setSelectedSimIds({})
    setActivePanelSimId(simId)
  }, [])

  const enterBulkMode = useCallback(() => {
    setActivePanelSimId(null)
    setIsBulkMode(true)
  }, [])

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false)
    setSelectedSimIds({})
  }, [])

  const toggleSelect = useCallback((simId: string) => {
    setSelectedSimIds(prev => {
      const next = { ...prev }
      if (next[simId]) {
        delete next[simId]
      } else {
        next[simId] = true
      }
      return next
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Bulk operation handlers
  // ---------------------------------------------------------------------------
  const handleBulkAssign = useCallback(
    async (challengeId: string) => {
      const ids = Object.keys(selectedSimIds)
      for (const id of ids) {
        await assignToChallenge(id, challengeId)
      }
      exitBulkMode()
    },
    [selectedSimIds, assignToChallenge, exitBulkMode],
  )

  const handleBulkUnassign = useCallback(async () => {
    const ids = Object.keys(selectedSimIds)
    for (const id of ids) {
      await unassignFromChallenge(id)
    }
    exitBulkMode()
  }, [selectedSimIds, unassignFromChallenge, exitBulkMode])

  const handleBulkDelete = useCallback(async () => {
    const ids = Object.keys(selectedSimIds)
    for (const id of ids) {
      await deleteSim(id)
    }
    exitBulkMode()
  }, [selectedSimIds, deleteSim, exitBulkMode])

  // ---------------------------------------------------------------------------
  // Clear all filters
  // ---------------------------------------------------------------------------
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters(DEFAULT_FILTERS)
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <PageShell
      title="Sims"
      actions={
        <Link href="/dashboard/new/sim">
          <Button size="sm">Add Sim</Button>
        </Link>
      }
    >
    <div className="space-y-6">
      {/* Toolbar */}
      <SimsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={s => updateParams({ sort: s })}
        heirsOnly={filters.heirs}
        hasTraitsOnly={filters.hasTraits}
        challengeIdFilter={filters.challengeId}
        challenges={challenges}
        onFilterChange={f => setFilters(prev => ({ ...prev, ...f }))}
        isBulkMode={isBulkMode}
        onToggleBulkMode={() => (isBulkMode ? exitBulkMode() : enterBulkMode())}
      />

      {/* Tabs */}
      <div
        className="flex items-center gap-1 rounded-xl bg-cozy-sand dark:bg-warmGray-850 p-1"
        role="tablist"
        aria-label="Sims views"
      >
        {SIMS_TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => updateParams({ tab: tab.id })}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-warmGray-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-cozy-clay dark:text-warmGray-400 hover:text-brand-700 dark:hover:text-warmGray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {loading && <SkeletonGrid />}
        {error && <ErrorBanner message={error} onRetry={fetchAllSims} />}

        {!loading && !error && activeTab === 'all' && (
          allSims.length === 0
            ? <EmptyState />
            : filteredSims.length === 0
              ? <NoResultsState onClear={clearFilters} />
              : (
                <SimsGrid
                  sims={filteredSims}
                  traitCatalog={Traits}
                  onOpenPanel={openPanel}
                  isBulkMode={isBulkMode}
                  selectedSimIds={selectedSimIds}
                  onSelect={isBulkMode ? toggleSelect : undefined}
                />
              )
        )}

        {!loading && !error && activeTab === 'by-challenge' && (
          <ByChallengeView
            groupedSims={groupedSims}
            unassigned={unassignedSims}
            challenges={challenges}
            traitCatalog={Traits}
            onOpenPanel={openPanel}
            isBulkMode={isBulkMode}
            selectedSimIds={selectedSimIds}
            onSelect={isBulkMode ? toggleSelect : undefined}
          />
        )}

        {!loading && !error && activeTab === 'family-tree' && (
          <FamilyTreeView
            allSims={filteredSims}
            challenges={challenges}
            onOpenPanel={openPanel}
          />
        )}
      </div>

      {/* Detail panel */}
      {activePanelSimId && panelNav && (
        <SimDetailPanel
          simId={activePanelSimId}
          allSims={filteredSims}
          panelNav={panelNav}
          onClose={() => setActivePanelSimId(null)}
          onNavigate={openPanel}
        />
      )}

      {/* Bulk action bar */}
      {isBulkMode && Object.keys(selectedSimIds).length > 0 && (
        <BulkActionBar
          selectedCount={Object.keys(selectedSimIds).length}
          selectedIds={Object.keys(selectedSimIds)}
          challenges={challenges}
          onAssign={handleBulkAssign}
          onUnassign={handleBulkUnassign}
          onDelete={handleBulkDelete}
          onDeselect={exitBulkMode}
        />
      )}
    </div>
    </PageShell>
  )
}
