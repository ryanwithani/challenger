'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { PackIcon } from '@/src/components/ui/PackIcon'
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
                        <span className="text-2xl">{template?.icon}</span>
                        Challenge Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Template</dt>
                            <dd className="text-lg font-semibold text-gray-900">{template?.label}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                            <dd className="text-lg font-semibold text-gray-900">{data.basicInfo?.name}</dd>
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

            {/* Expansion Packs */}
            {data.expansionPacks && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <span>📦</span>
                            Your Expansion Packs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center gap-2 px-3 py-2 bg-brand-500 text-white rounded-xl">
                                <PackIcon packKey="base_game" size="sm" />
                                <span className="text-sm font-medium">Base Game</span>
                            </div>
                            {PACKS
                                .filter((pack) => data.expansionPacks?.[pack.key as keyof ExpansionPackData])
                                .map((pack) => (
                                    <div key={pack.key} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                                        <PackIcon packKey={pack.key} size="sm" />
                                        <span className="text-sm font-medium">{pack.name}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Legacy Scoring */}
                        {isLegacyChallenge && legacyScoring && (
                            <div className="border-t pt-6">
                                <h4 className="font-medium text-gray-900 mb-4">Legacy Challenge Scoring Potential</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <div className="text-xl font-bold text-gray-900">{legacyScoring.careers}</div>
                                        <div className="text-xs text-gray-500">Careers Available</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <div className="text-xl font-bold text-gray-900">{legacyScoring.skills}</div>
                                        <div className="text-xs text-gray-500">Skills Available</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <div className="text-xl font-bold text-gray-900">{legacyScoring.collections}</div>
                                        <div className="text-xs text-gray-500">Collections Available</div>
                                    </div>
                                    <div className="text-center p-3 bg-brand-500 text-white rounded-xl">
                                        <div className="text-xl font-bold">~{legacyScoring.estimatedPoints.total}/100</div>
                                        <div className="text-xs opacity-90">Est. Max Points</div>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        <span className="font-medium">Knowledge Category:</span> ~{legacyScoring.estimatedPoints.knowledge}/20 points
                                    </p>
                                    <p>
                                        <span className="font-medium">Other Categories:</span> ~60/80 points (Family, Fortune, Creative, Love, Athletic)
                                    </p>
                                    <p className="text-xs">
                                        <span className="font-medium">Note:</span> Actual scoring depends on gameplay achievements
                                    </p>
                                </div>

                                {selectedPacks.length === 0 && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <span className="text-amber-500">⚠️</span>
                                            <div>
                                                <p className="font-medium text-amber-800">Base Game Only</p>
                                                <p className="text-sm text-amber-700">
                                                    You'll have access to limited scoring opportunities. Consider expansion packs to unlock more careers, skills, and collections!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Legacy Tips */}
            {isLegacyChallenge && (
                <Card className="border-brand-200 bg-brand-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-brand-700">
                            <span>🎯</span>
                            Ready to Begin Your Legacy!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-brand-700">
                            <p><span className="font-medium">Setup:</span> Follow the starting instructions for your chosen difficulty level</p>
                            <p><span className="font-medium">Tracking:</span> Use the Legacy tracker to monitor your progress across all scoring categories</p>
                            <p><span className="font-medium">Goal:</span> Build a successful family legacy across 10 generations while maximizing your score</p>
                            {(data.configuration as any)?.start_type !== 'regular' && (
                                <p><span className="font-medium">Bonus:</span> Complete your chosen difficulty for extra points toward your final score</p>
                            )}
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