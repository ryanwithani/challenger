'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Textarea } from '@/src/components/ui/Textarea'
import { FormField } from '@/src/components/ui/FormField'
import { basicInfoSchema, type BasicInfoData } from '@/src/lib/validations/challenge'
import { CHALLENGE_TEMPLATES } from '@/src/data/challenge-templates'

interface BasicInfoStepProps {
    data: BasicInfoData | undefined
    onNext: (data: BasicInfoData) => void
    onCancel: () => void
}

export function BasicInfoStep({ data, onNext, onCancel }: BasicInfoStepProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        trigger, // Add trigger for manual validation
    } = useForm<BasicInfoData>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            name: data?.name || '',
            description: data?.description || '',
            challenge_type: data?.challenge_type || 'legacy',
        },
        mode: 'onBlur', // Validate on blur for better UX
    })

    const templateType = watch('challenge_type')
    const description = watch('description')
    const name = watch('name')

    const onSubmit = async (formData: BasicInfoData) => {
        // Validate all fields before submitting
        const isValid = await trigger()
        if (!isValid) {
            return
        }
        onNext(formData)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Challenge</h2>

                {/* Show form-level errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="text-amber-800 font-semibold mb-2">
                                    Please fix the following errors:
                                </p>
                                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                                    {errors.challenge_type && (
                                        <li>{errors.challenge_type.message}</li>
                                    )}
                                    {errors.name && <li>{errors.name.message}</li>}
                                    {errors.description && <li>{errors.description.message}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Selection */}
                <FormField 
                    label="Challenge Template" 
                    className="mb-6"
                    error={errors.challenge_type?.message}
                    required
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CHALLENGE_TEMPLATES.map((template) => {
                            const isDisabled = template.value !== 'legacy'
                            const isSelected = templateType === template.value
                            
                            return (
                                <label
                                    key={template.value}
                                    className={`relative flex rounded-2xl border-2 p-6 transition-all ${
                                        isDisabled 
                                            ? 'cursor-not-allowed opacity-50 bg-gray-50 border-gray-200' 
                                            : isSelected
                                                ? 'cursor-pointer border-brand-500 bg-brand-500/5 shadow-lg'
                                                : errors.challenge_type
                                                    ? 'cursor-pointer border-red-300 hover:border-red-400'
                                                    : 'cursor-pointer border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        {...register('challenge_type')}
                                        value={template.value}
                                        disabled={isDisabled}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start space-x-4 w-full">
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold mb-1 ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                                <div className="flex items-start gap-2">
                                                    <span className="flex-1 leading-tight">{template.label}</span>
                                                    {isDisabled && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5">Coming Soon</span>}
                                                </div>
                                            </div>
                                            <div className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {template.description}
                                            </div>
                                        </div>
                                        {isSelected && !isDisabled && (
                                            <svg className="h-6 w-6 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                </FormField>

                {/* Challenge Name with character counter */}
                <FormField 
                    label="Challenge Name" 
                    error={errors.name?.message} 
                    required 
                    className="mb-4"
                    description={name ? `${name.length}/100 characters` : ''}
                >
                    <Input
                        {...register('name')}
                        placeholder={
                            templateType === 'legacy'
                                ? 'The Smith Legacy'
                                : templateType === 'not_so_berry'
                                    ? 'My Not So Berry Challenge'
                                    : templateType === '100_baby'
                                        ? 'The 100 Baby Challenge'
                                        : 'My Custom Challenge'
                        }
                        className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                        maxLength={100}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                        <p id="name-error" className="sr-only">{errors.name.message}</p>
                    )}
                </FormField>

                {/* Description with character counter */}
                <FormField
                    label="Description (Optional)"
                    error={errors.description?.message}
                    description={`${description?.length || 0}/500 characters`}
                >
                    <Textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Describe your challenge goals, rules, or story..."
                        className={errors.description ? 'border-red-300 focus:border-red-500' : ''}
                        maxLength={500}
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? 'description-error' : undefined}
                    />
                    {errors.description && (
                        <p id="description-error" className="sr-only">{errors.description.message}</p>
                    )}
                </FormField>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button 
                    variant="outline" 
                    onClick={onCancel}
                    type="button"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    loadingText="Validating..."
                >
                    Next: {CHALLENGE_TEMPLATES.find(t => t.value === templateType)?.needsConfiguration ? 'Configuration' : 'Review'}
                </Button>
            </div>
        </form>
    )
}