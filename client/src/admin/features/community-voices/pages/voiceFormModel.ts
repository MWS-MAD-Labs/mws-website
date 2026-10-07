export type VoiceForm = {
  grade: string;
  imagePath: string;
  isActive: boolean;
  name: string;
  quote: string;
  role: string;
  sortOrder: string;
};

export const VOICE_ROLE_OPTIONS = ['Parent', 'Student', 'Teacher', 'Staff', 'Alumni', 'Community'];

export const emptyVoiceForm: VoiceForm = {
  grade: '',
  imagePath: '',
  isActive: true,
  name: '',
  quote: '',
  role: VOICE_ROLE_OPTIONS[0],
  sortOrder: '0',
};
