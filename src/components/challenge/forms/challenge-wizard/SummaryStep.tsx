'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { calculateLegacyScoring } from '@/src/lib/utils/legacy-scoring'
import { formatConfigValue, getDifficultyColor } from '@/src/lib/utils/format'
import { CHALLENGE_TEMPLATES } from '@/src/data/challenge-templates'
import { PACKS } from '@/src/components/profile/Packs'
import type { BasicInfoData, LegacyConfigData, ExpansionPackData } from '@/src/lib/validations/challenge'

interface WizardData {
    basicInfo?: BasicInfoData
    configuration?: LegacyConfigData | Record<string, any>
    expansionPacks?: ExpansionPackData
}

interface SummaryStepProps {
    data: WizardData
    onSubmit: (data: WizardData) => void | Promise<void>
    onBack: () => void
    loading?: boolean
}

export function SummaryStep({ data, onSubmit, onBack, loading }: SummaryStepProps) {
    const template = CHALLENGE_TEMPLATES.find(t => t.value === data.basicInfo?.challenge_type)
    const isLegacyChallenge = data.basicInfo?.challenge_type === 'legacy'

    const selectedPacks = data.expansionPacks ?
        Object.entries(data.expansionPacks)
            .filter(([key, value]) => key !== 'base_game' && value === true)
            .map(([key]) => key) : []

    const legacyScoring = isLegacyChallenge ? calculateLegacyScoring(selectedPacks) : null

    const handleSubmit = () => {
        onSubmit(data)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Challenge</h2>

            {/* Challenge Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        Challenge Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Template</dt>
                            <dd className="text-gray-900">{template?.label}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="text-gray-900">{data.basicInfo?.name}</dd>
                        </div>
                        {data.basicInfo?.description && (
                            <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="text-gray-900 mt-1">{data.basicInfo.description}</dd>
                            </div>
                        )}
                    </dl>
                </CardContent>
            </Card>

            {/* Legacy Configuration */}
            {data.configuration && isLegacyChallenge && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <span>⚙️</span>
                            Legacy Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 mb-2">Starting Difficulty</dt>
                                <dd className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor((data.configuration as any).start_type || 'regular')
                                        }`}>
                                        {formatConfigValue((data.configuration as any).start_type || 'regular')}
                                    </span>
                                    {(data.configuration as any).start_type === 'extreme' && (
                                        <span className="text-xs text-brand-600 font-medium">+1 bonus point</span>
                                    )}
                                    {(data.configuration as any).start_type === 'ultra_extreme' && (
                                        <span className="text-xs text-brand-600 font-medium">+2 bonus points</span>
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Gender Law</dt>
                                <dd className="text-gray-900">{formatConfigValue((data.configuration as any).gender_law || '')}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Bloodline Law</dt>
                                <dd className="text-gray-900">{formatConfigValue((data.configuration as any).bloodline_law || '')}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Heir Selection</dt>
                                <dd className="text-gray-900">{formatConfigValue((data.configuration as any).heir_selection || '')}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Species Rule</dt>
                                <dd className="text-gray-900">{formatConfigValue((data.configuration as any).species_rule || '')}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Lifespan</dt>
                                <dd className="text-gray-900">{formatConfigValue((data.configuration as any).lifespan || '')}</dd>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}             

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    loadingText="Creating Challenge..."
                    variant="primary"
                >
                    Create Challenge
                </Button>
            </div>
        </div>
    )
}