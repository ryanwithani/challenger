'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { expansionPackSchema, type ExpansionPackData } from '@/src/lib/validations/challenge'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { PACKS } from '@/src/components/profile/Packs'
import { PackDef } from '@/src/components/profile/Packs'
import { PackIcon } from '@/src/components/ui/PackIcon'
import { calculateLegacyScoring } from '@/src/lib/utils/legacy-scoring'

interface ExpansionPackStepProps {
    data: ExpansionPackData | undefined
    onNext: (data: ExpansionPackData) => void
    onBack: () => void
    isLegacyChallenge?: boolean
}

export function ExpansionStep({
    data,
    onNext,
    onBack,
    isLegacyChallenge = false
}: ExpansionPackStepProps) {
    const { preferences, loading: preferencesLoading, fetchPreferences, updateExpansionPacks } = useUserPreferencesStore()
    const [selectedPacks, setSelectedPacks] = useState<string[]>([])

    useEffect(() => {
        fetchPreferences()
    }, [fetchPreferences])

    const {
        register,
        handleSubmit,
        reset,
        watch,
    } = useForm<ExpansionPackData>({
        resolver: zodResolver(expansionPackSchema),
        defaultValues: {
            base_game: true,
            ...data,
        },
    })

    useEffect(() => {
        if (preferences?.expansion_packs && !data) {
            reset({
                ...preferences.expansion_packs,
                base_game: true,
            })
        }
    }, [preferences, data, reset])

    const watchedValues = watch()
    useEffect(() => {
        const selected = Object.entries(watchedValues)
            .filter(([key, value]) => key !== 'base_game' && value === true)
            .map(([key]) => key)
        setSelectedPacks(selected)
    }, [watchedValues])

    const scoringInfo = isLegacyChallenge ? calculateLegacyScoring(selectedPacks) : null

    const onSubmit = async (formData: ExpansionPackData) => {
        try {
            await updateExpansionPacks(formData)
            onNext(formData)
        } catch (error) {
            console.error('Failed to save expansion pack preferences:', error)
            onNext(formData)
        }
    }

    if (preferencesLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Expansion Packs</h2>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    <span className="ml-3 text-gray-600">Loading your preferences...</span>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Expansion Packs</h2>

                {isLegacyChallenge && scoringInfo && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>📊</span>
                                Legacy Challenge Scoring Impact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Different expansion packs unlock careers, skills, and collections that contribute to your Legacy Challenge score.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900">{scoringInfo.careers}</div>
                                    <div className="text-sm text-gray-600">Careers Available</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900">{scoringInfo.skills}</div>
                                    <div className="text-sm text-gray-600">Skills Available</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900">{scoringInfo.collections}</div>
                                    <div className="text-sm text-gray-600">Collections Available</div>
                                </div>
                                <div className="text-center p-3 bg-brand-500 text-white rounded-xl">
                                    <div className="text-2xl font-bold">~{scoringInfo.estimatedPoints.total}/100</div>
                                    <div className="text-sm opacity-90">Est. Max Points</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Base Game */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={true}
                                disabled
                                className="h-5 w-5 text-brand-500 border-gray-300 rounded"
                            />
                            <PackIcon packKey="base_game" size="md" />
                            <div className="flex-1">
                                <span className="font-medium text-gray-900">The Sims 4 (Base Game)</span>
                                {isLegacyChallenge && (
                                    <div className="text-sm text-gray-500">
                                        23 careers • 15 skills • 13 collections
                                    </div>
                                )}
                            </div>
                        </label>
                    </CardContent>
                </Card>

                {/* Expansion Packs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expansion Packs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PACKS.map((pack: PackDef) => (
                                <label
                                    key={pack.key}
                                    className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        {...register(pack.key as keyof ExpansionPackData)}
                                        className="h-5 w-5 text-brand-500 border-gray-300 rounded"
                                    />
                                    <PackIcon packKey={pack.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{pack.name}</span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {pack.category}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {isLegacyChallenge && selectedPacks.length === 0 && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-amber-500">⚠️</span>
                            <div>
                                <p className="font-medium text-amber-800">Base Game Only</p>
                                <p className="text-sm text-amber-700">
                                    You'll be able to earn approximately 60-70 out of 100 possible Legacy Challenge points.
                                    Consider adding expansion packs to unlock more scoring opportunities!
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary">
                    Next: Review
                </Button>
            </div>
        </form>
    )
}