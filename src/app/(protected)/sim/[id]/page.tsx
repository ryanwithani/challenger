'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/Button'
import { Modal } from '@/src/components/ui/Modal'
import { SimForm } from '@/src/components/forms/SimForm'
import { SimProfile } from '@/src/components/sim/SimProfile'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'


export default function SimProfilePage() {
    const params = useParams()
    const router = useRouter()
    const simId = params.id as string

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const {
        currentSim,
        simAchievements,
        loading,
        error,
        fetchSim,
        updateSim,
        deleteSim,
        fetchSimAchievements
    } = useSimStore()

    const { currentChallenge } = useChallengeStore()

    useEffect(() => {
        fetchSim(simId)
        fetchSimAchievements(simId)
    }, [simId])

    const handleEditSim = async (data: any) => {
        await updateSim(simId, data)
        setShowEditModal(false)
    }

    const handleDeleteSim = async () => {
        await deleteSim(simId)
        router.push(`/challenge/${currentChallenge?.id}`)
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Loading sim...</p>
            </div>
        )
    }

    if (error || !currentSim) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error loading sim: {error}</p>
                <Button onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{currentSim.name}</h1>
                        <p className="text-gray-600">
                            Generation {currentSim.generation} • {currentSim.age_stage?.replace('_', ' ')}
                            {currentSim.is_heir && (
                                <span className="ml-2 px-2 py-1 bg-sims-yellow/20 text-sims-yellow rounded text-sm font-medium">
                                    Heir
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                    </Button>
                </div>
            </div>

            {/* Sim Profile Component */}
            <SimProfile
                sim={currentSim}
                achievements={simAchievements}
                challenge={currentChallenge}
            />

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={`Edit ${currentSim.name}`}
            >
                <SimForm
                    challengeId={currentSim.challenge_id}
                    onSubmit={handleEditSim}
                    initialData={{
                        name: currentSim.name,
                        age_stage: currentSim.age_stage as any,
                        generation: currentSim.generation,
                        career: currentSim.career || '',
                        aspiration: currentSim.aspiration || '',
                        traits: Array.isArray(currentSim.traits) ? currentSim.traits as string[] : [],
                        is_heir: currentSim.is_heir,
                    }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Sim"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong>{currentSim.name}</strong>?
                        This action cannot be undone and will remove all their achievements and progress.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteSim}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Sim
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}