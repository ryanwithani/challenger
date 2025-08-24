'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/Button'
import { Modal } from '@/src/components/ui/Modal'
import { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']
type Sim = Database['public']['Tables']['sims']['Row']

interface GoalCompletionModalProps {
    isOpen: boolean
    onClose: () => void
    goal: Goal | null
    sims: Sim[]
    onComplete: (goalId: string, simId: string, method: string, notes?: string) => Promise<void>
}

// Define completion methods for different goal types
const COMPLETION_METHODS = {
    memorialize: [
        { value: 'painting', label: 'Portrait Painting', icon: '🎨' },
        { value: 'song', label: 'Song/Music', icon: '🎵' },
        { value: 'book', label: 'Book/Biography', icon: '📚' },
        { value: 'photograph', label: 'Photograph', icon: '📸' },
        { value: 'sculpture', label: 'Sculpture', icon: '🗿' },
        { value: 'other', label: 'Other Creative Work', icon: '✨' }
    ],
    creative_aspiration: [
        { value: 'painter_extraordinaire', label: 'Painter Extraordinaire', icon: '🎨' },
        { value: 'bestselling_author', label: 'Bestselling Author', icon: '📚' },
        { value: 'musical_genius', label: 'Musical Genius', icon: '🎵' },
        { value: 'master_actor', label: 'Master Actor', icon: '🎭' },
        { value: 'world_famous_celebrity', label: 'World-Famous Celebrity', icon: '⭐' },
        { value: 'other', label: 'Other Creative Aspiration', icon: '✨' }
    ],
    skill_maxed: [
        { value: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
        { value: 'painting', label: 'Painting', icon: '🎨' },
        { value: 'writing', label: 'Writing', icon: '✍️' },
        { value: 'programming', label: 'Programming', icon: '💻' },
        { value: 'fitness', label: 'Fitness', icon: '💪' },
        { value: 'charisma', label: 'Charisma', icon: '🗣️' },
        { value: 'logic', label: 'Logic', icon: '🧠' },
        { value: 'rocket_science', label: 'Rocket Science', icon: '🚀' },
        { value: 'video_gaming', label: 'Video Gaming', icon: '🎮' },
        { value: 'guitar', label: 'Guitar', icon: '🎸' },
        { value: 'piano', label: 'Piano', icon: '🎹' },
        { value: 'violin', label: 'Violin', icon: '🎻' },
        { value: 'gardening', label: 'Gardening', icon: '🌱' },
        { value: 'fishing', label: 'Fishing', icon: '🎣' },
        { value: 'photography', label: 'Photography', icon: '📷' },
        { value: 'other', label: 'Other Skill', icon: '⭐' }
    ],
    collection: [
        { value: 'fossils', label: 'Fossils', icon: '🦕' },
        { value: 'crystals', label: 'Crystals', icon: '💎' },
        { value: 'elements', label: 'Elements', icon: '⚗️' },
        { value: 'postcards', label: 'Postcards', icon: '📮' },
        { value: 'space_prints', label: 'Space Prints', icon: '🌌' },
        { value: 'frogs', label: 'Frogs', icon: '🐸' },
        { value: 'fish', label: 'Fish', icon: '🐟' },
        { value: 'plants', label: 'Plants', icon: '🌿' },
        { value: 'insects', label: 'Insects', icon: '🦋' },
        { value: 'other', label: 'Other Collection', icon: '📦' }
    ],
    aspiration: [
        { value: 'fortune', label: 'Fortune (Fabulously Wealthy)', icon: '💰' },
        { value: 'popularity', label: 'Popularity (Friend of the World)', icon: '👥' },
        { value: 'creativity', label: 'Creativity (Renaissance Sim)', icon: '🎨' },
        { value: 'knowledge', label: 'Knowledge (Nerd Brain)', icon: '🤓' },
        { value: 'family', label: 'Family (Big Happy Family)', icon: '👨‍👩‍👧‍👦' },
        { value: 'food', label: 'Food (Master Chef)', icon: '👨‍🍳' },
        { value: 'nature', label: 'Nature (Freelance Botanist)', icon: '🌱' },
        { value: 'athletic', label: 'Athletic (Bodybuilder)', icon: '💪' },
        { value: 'other', label: 'Other Aspiration', icon: '⭐' }
    ]
}

// Determine which completion method category to use based on goal
function getCompletionMethodsForGoal(goal: Goal) {
    const goalTitle = goal.title.toLowerCase()
    const goalDescription = goal.description?.toLowerCase() || ''

    if (goalTitle.includes('memorialize') || goalDescription.includes('memorialize')) {
        return COMPLETION_METHODS.memorialize
    }

    if (goalTitle.includes('creative aspiration') || goalDescription.includes('creative aspiration')) {
        return COMPLETION_METHODS.creative_aspiration
    }

    if (goalTitle.includes('skill') && (goalTitle.includes('max') || goalDescription.includes('max'))) {
        return COMPLETION_METHODS.skill_maxed
    }

    if (goalTitle.includes('collection') || goalDescription.includes('collection')) {
        return COMPLETION_METHODS.collection
    }

    if (goalTitle.includes('aspiration') || goalDescription.includes('aspiration')) {
        return COMPLETION_METHODS.aspiration
    }

    // Default to generic methods
    return [
        { value: 'completed', label: 'Completed', icon: '✅' },
        { value: 'achieved', label: 'Achieved', icon: '🏆' },
        { value: 'other', label: 'Other', icon: '✨' }
    ]
}

export function GoalCompletionModal({
    isOpen,
    onClose,
    goal,
    sims,
    onComplete
}: GoalCompletionModalProps) {
    const [selectedSim, setSelectedSim] = useState<string>('')
    const [selectedMethod, setSelectedMethod] = useState<string>('')
    const [notes, setNotes] = useState<string>('')
    const [loading, setLoading] = useState(false)

    // Reset form when modal opens/closes or goal changes
    useEffect(() => {
        if (isOpen && goal) {
            setSelectedSim('')
            setSelectedMethod('')
            setNotes('')
        }
    }, [isOpen, goal])

    if (!goal) return null

    const completionMethods = getCompletionMethodsForGoal(goal)
    const needsSimSelection = goal.title.toLowerCase().includes('memorialize') ||
        goal.description?.toLowerCase().includes('heir') ||
        goal.description?.toLowerCase().includes('spouse')

    // Filter sims based on goal requirements
    const getEligibleSims = () => {
        if (goal.title.toLowerCase().includes('memorialize')) {
            // For memorialize goals, show heirs and spouses
            return sims.filter(sim => sim.is_heir || sim.relationship_to_heir === 'spouse')
        }

        // For other goals, show all sims
        return sims
    }

    const eligibleSims = getEligibleSims()

    const handleSubmit = async () => {
        if (!selectedMethod) return
        if (needsSimSelection && !selectedSim) return

        setLoading(true)
        try {
            await onComplete(goal.id, selectedSim, selectedMethod, notes || undefined)
            onClose()
        } catch (error) {
            console.error('Error completing goal:', error)
            // You might want to show an error message here
        } finally {
            setLoading(false)
        }
    }

    const selectedMethodData = completionMethods.find(m => m.value === selectedMethod)

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Goal">
            <div className="space-y-6">
                {/* Goal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                    <div className="text-sm text-sims-green font-medium mt-2">
                        +{goal.point_value} points
                    </div>
                </div>

                {/* Sim Selection (if needed) */}
                {needsSimSelection && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Which Sim accomplished this?
                        </label>
                        <select
                            value={selectedSim}
                            onChange={(e) => setSelectedSim(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                            required
                        >
                            <option value="">Select a Sim...</option>
                            {eligibleSims.map((sim) => (
                                <option key={sim.id} value={sim.id}>
                                    {sim.name} {sim.is_heir && '(Heir)'} {sim.relationship_to_heir === 'spouse' && '(Spouse)'}
                                    {sim.generation && ` - Gen ${sim.generation}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Method Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        How was this accomplished?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {completionMethods.map((method) => (
                            <button
                                key={method.value}
                                onClick={() => setSelectedMethod(method.value)}
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${selectedMethod === method.value
                                    ? 'border-sims-green bg-sims-green/10 text-sims-green'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <span className="text-lg">{method.icon}</span>
                                <span className="font-medium">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom input for "Other" option */}
                {selectedMethod === 'other' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please specify:
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="How did you complete this goal?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        />
                    </div>
                )}

                {/* Optional Notes */}
                {selectedMethod && selectedMethod !== 'other' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional details about this achievement..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        />
                    </div>
                )}

                {/* Summary */}
                {selectedMethod && (
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                        <div className="text-sm text-blue-800">
                            {needsSimSelection && selectedSim && (
                                <div>
                                    <strong>Sim:</strong> {eligibleSims.find(s => s.id === selectedSim)?.name}
                                </div>
                            )}
                            <div>
                                <strong>Method:</strong> {selectedMethodData?.icon} {selectedMethodData?.label}
                            </div>
                            {notes && (
                                <div>
                                    <strong>Notes:</strong> {notes}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedMethod || (needsSimSelection && !selectedSim) || loading}
                    >
                        {loading ? 'Completing...' : 'Complete Goal'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}