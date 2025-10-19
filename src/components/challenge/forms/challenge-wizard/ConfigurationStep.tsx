'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { legacyConfigSchema, type LegacyConfigData } from '@/src/lib/validations/challenge'
import { STARTING_OPTIONS, LEGACY_RULES } from '@/src/data/legacy-rules'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/src/components/ui/Collapsible'

interface ConfigurationStepProps {
    challengeType: string
    data: LegacyConfigData | Record<string, any> | undefined
    onNext: (data: any) => void
    onBack: () => void
}

// Main component that handles different challenge types
export function ConfigurationStep({ challengeType, data, onNext, onBack }: ConfigurationStepProps) {
    if (challengeType === 'legacy') {
        return <LegacyConfigurationStep data={data as LegacyConfigData} onNext={onNext} onBack={onBack} />
    }
    // Add other challenge configuration components here in the future
    return null
}

// Legacy-specific configuration component
function LegacyConfigurationStep({
    data,
    onNext,
    onBack
}: {
    data: LegacyConfigData | undefined
    onNext: (data: LegacyConfigData) => void
    onBack: () => void
}) {
    const {
        register,
        handleSubmit,
        watch,
    } = useForm<LegacyConfigData>({
        resolver: zodResolver(legacyConfigSchema),
        defaultValues: {
            start_type: data?.start_type || 'regular',
            gender_law: data?.gender_law || 'traditional',
            bloodline_law: data?.bloodline_law || 'strict_traditional',
            heir_selection: data?.heir_selection || 'first_born',
            species_rule: data?.species_rule || 'human_only',
            lifespan: data?.lifespan || 'normal',
        },
    })

    const watchedValues = watch()

    const onSubmit = (formData: LegacyConfigData) => {
        onNext(formData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Legacy Challenge Configuration</h2>

                {/* Starting Difficulty */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Starting Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {STARTING_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        watchedValues.start_type === option.value
                                            ? 'border-brand-500 bg-brand-500/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        {...register('start_type')}
                                        value={option.value}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                                            option.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                            option.difficulty === 'Hard' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {option.difficulty}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">{option.description}</div>
                                        <div className="text-xs text-gray-500">{option.detail}</div>
                                        {option.bonus > 0 && (
                                            <div className="text-xs text-brand-600 font-medium mt-2">
                                                +{option.bonus} bonus point{option.bonus > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Succession Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle>Succession Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Gender Law */}
                        <Collapsible defaultOpen>
                            <CollapsibleTrigger className="text-base font-medium">
                                Gender Law
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {LEGACY_RULES.genderLaw.map((law) => (
                                        <label key={law.value} className={`p-3 border rounded-xl cursor-pointer transition-all ${
                                            watchedValues.gender_law === law.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                {...register('gender_law')}
                                                value={law.value}
                                                className="sr-only"
                                            />
                                            <div className="font-medium text-gray-900 mb-1">{law.label}</div>
                                            <div className="text-sm text-gray-600">{law.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Bloodline Law */}
                        <Collapsible>
                            <CollapsibleTrigger className="text-base font-medium">
                                Bloodline Law
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {LEGACY_RULES.bloodlineLaw.map((law) => (
                                        <label key={law.value} className={`p-3 border rounded-xl cursor-pointer transition-all ${
                                            watchedValues.bloodline_law === law.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                {...register('bloodline_law')}
                                                value={law.value}
                                                className="sr-only"
                                            />
                                            <div className="font-medium text-gray-900 mb-1">{law.label}</div>
                                            <div className="text-sm text-gray-600">{law.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Heir Selection */}
                        <Collapsible>
                            <CollapsibleTrigger className="text-base font-medium">
                                Heir Selection Method
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    {LEGACY_RULES.heirSelection.map((method) => (
                                        <label key={method.value} className={`p-3 border rounded-xl cursor-pointer transition-all ${
                                            watchedValues.heir_selection === method.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                {...register('heir_selection')}
                                                value={method.value}
                                                className="sr-only"
                                            />
                                            <div className="font-medium text-gray-900 mb-1">{method.label}</div>
                                            <div className="text-sm text-gray-600">{method.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Species Rule */}
                        <Collapsible>
                            <CollapsibleTrigger className="text-base font-medium">
                                Species Rule
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                    {LEGACY_RULES.speciesRule.map((rule) => (
                                        <label key={rule.value} className={`p-3 border rounded-xl cursor-pointer transition-all ${
                                            watchedValues.species_rule === rule.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                {...register('species_rule')}
                                                value={rule.value}
                                                className="sr-only"
                                            />
                                            <div className="font-medium text-gray-900 mb-1">{rule.label}</div>
                                            <div className="text-sm text-gray-600">{rule.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Lifespan */}
                        <Collapsible>
                            <CollapsibleTrigger className="text-base font-medium">
                                Lifespan Setting
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                    {LEGACY_RULES.lifespan.map((lifespan) => (
                                        <label key={lifespan.value} className={`p-3 border rounded-xl cursor-pointer transition-all ${
                                            watchedValues.lifespan === lifespan.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                {...register('lifespan')}
                                                value={lifespan.value}
                                                className="sr-only"
                                            />
                                            <div className="font-medium text-gray-900 mb-1">{lifespan.label}</div>
                                            <div className="text-sm text-gray-600">{lifespan.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                    </CardContent>
                </Card>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary" type="submit">
                    Next: Expansion Packs
                </Button>
            </div>
        </form>
    )
}