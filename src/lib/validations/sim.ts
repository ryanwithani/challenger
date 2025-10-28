import { z } from 'zod';

const careerSchema = z.object({
  label: z.string(),
  value: z.string(),
}).nullable();

export const simWizardSchema = z.object({
  // Step 1
  basicInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
    familyName: z.string().max(50, 'Max 50 characters').optional(),
    age_stage: z.string().min(1, 'Age stage is required'),
    avatar_url: z.string().nullable(),
    challenge_id: z.string().nullable(),
  }),
  // Step 2
  traits: z.array(z.string()).min(0).max(3, 'You can select a maximum of 3 traits'),
  // Step 3
  personality: z.object({
    career: careerSchema,
    aspiration: z.string().nullable(),
  }),
});

export type SimWizardData = z.infer<typeof simWizardSchema>;