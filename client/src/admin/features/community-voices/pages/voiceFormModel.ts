export type VoiceForm = {
  grade: string;
  imagePath: string;
  isActive: boolean;
  showOnHome: boolean;
  name: string;
  quote: string;
  role: string;
  homeSortOrder: string;
  sortOrder: string;
};

export const VOICE_ROLE_OPTIONS = ['Parent', 'Student', 'Teacher', 'Staff', 'Alumni', 'Community'];

export const emptyVoiceForm: VoiceForm = {
  grade: '',
  imagePath: '',
  isActive: true,
  showOnHome: false,
  name: '',
  quote: '',
  role: VOICE_ROLE_OPTIONS[0],
  homeSortOrder: '0',
  sortOrder: '0',
};
