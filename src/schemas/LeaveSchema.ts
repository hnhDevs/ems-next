import { z } from 'zod';

// --- Leave Zod Schema ---
export const LeaveSchema = z.object({
  user: z.string().min(1, 'User is required'),
  leaveType: z.enum([
    'Annual',
    'Sick',
    'Maternity',
    'Paternity',
    'Unpaid',
    'Casual',
    'Compensatory',
    'Bereavement',
    'Marriage',
    'Study',
    'Sabbatical',
    'Other'
  ]),
  fromDate: z.coerce.date({ required_error: 'From date is required' }),
  toDate: z.coerce.date({ required_error: 'To date is required' }),
  reason: z.string().min(10, 'Reason is required'),
  document: z.string().optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  createdAt: z.date().default(() => new Date()),
});

export type LeaveType = z.infer<typeof LeaveSchema>;
