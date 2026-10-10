export type CommandCategory = 'Navigation' | 'Scrolling' | 'Selection' | 'Tabs' | 'Text Input';

export interface VoiceCommand {
  phrase: string;
  action: string;
  category: CommandCategory;
  example?: string;
  confirm?: boolean;
}

export const commandCategories: CommandCategory[] = ['Navigation', 'Scrolling', 'Selection', 'Tabs', 'Text Input'];

export const voiceCommands: VoiceCommand[] = [
  { phrase: 'Go back', action: 'Return to the previous page', category: 'Navigation' },
  { phrase: 'Go forward', action: 'Go to the next page in history', category: 'Navigation' },
  { phrase: 'Reload page', action: 'Refresh the current page', category: 'Navigation' },
  { phrase: 'Open [site]', action: 'Open a website in this tab', category: 'Navigation', example: 'Open wikipedia.org' },
  { phrase: 'Go home', action: 'Open your home page', category: 'Navigation' },
  { phrase: 'Scroll down', action: 'Move one screen down', category: 'Scrolling' },
  { phrase: 'Scroll up', action: 'Move one screen up', category: 'Scrolling' },
  { phrase: 'Scroll to top', action: 'Jump to the start of the page', category: 'Scrolling' },
  { phrase: 'Scroll to bottom', action: 'Jump to the end of the page', category: 'Scrolling' },
  { phrase: 'Scroll slowly', action: 'Start a gentle continuous scroll', category: 'Scrolling' },
  { phrase: 'Stop', action: 'Stop scrolling or cancel the current action', category: 'Scrolling' },
  { phrase: 'Show targets', action: 'Number every clickable element', category: 'Selection' },
  { phrase: 'Click [number]', action: 'Select the numbered target', category: 'Selection', example: 'Click 2' },
  { phrase: 'Hide targets', action: 'Remove the number labels', category: 'Selection' },
  { phrase: 'Select', action: 'Click whatever is under the pointer', category: 'Selection' },
  { phrase: 'Right click', action: 'Open the context menu under the pointer', category: 'Selection' },
  { phrase: 'New tab', action: 'Open a blank tab', category: 'Tabs' },
  { phrase: 'Close tab', action: 'Close the current tab', category: 'Tabs', confirm: true },
  { phrase: 'Next tab', action: 'Switch to the tab on the right', category: 'Tabs' },
  { phrase: 'Previous tab', action: 'Switch to the tab on the left', category: 'Tabs' },
  { phrase: 'Switch to tab [number]', action: 'Jump to a tab by position', category: 'Tabs', example: 'Switch to tab 3' },
  { phrase: 'Start dictation', action: 'Type into the focused field by speaking', category: 'Text Input' },
  { phrase: 'Delete last word', action: 'Remove the most recent word', category: 'Text Input' },
  { phrase: 'New line', action: 'Insert a line break', category: 'Text Input' },
  { phrase: 'Submit text', action: 'Review dictated text, then insert it', category: 'Text Input' },
  { phrase: 'Send form', action: 'Submit the current form', category: 'Text Input', confirm: true },
];

export const cheatSheet = [
  { phrase: 'Scroll down', action: 'Move one screen down' },
  { phrase: 'Go back', action: 'Previous page' },
  { phrase: 'Show targets', action: 'Number every clickable item' },
  { phrase: 'Click 2', action: 'Select target number 2' },
  { phrase: 'New tab', action: 'Open a blank tab' },
  { phrase: 'Start dictation', action: 'Type by speaking' },
];

export const voiceDemoPhrases = [
  { heard: 'scroll down', match: 'Scroll down', result: 'Scrolled one screen down' },
  { heard: 'show targets', match: 'Show targets', result: 'Numbered 18 clickable targets' },
  { heard: 'click twelve', match: 'Click 12', result: 'Opened “Accessibility guidelines”' },
  { heard: 'clack the blue one', match: null, result: 'Not understood' },
  { heard: 'go back', match: 'Go back', result: 'Returned to the previous page' },
];

export const recentVoiceCommands = [
  { id: 'v1', time: '10:42', heard: 'show targets', match: 'Show targets', confidence: 0.97, status: 'executed' as const, suggestions: [] as string[] },
  { id: 'v2', time: '10:42', heard: 'click seven', match: 'Click 7', confidence: 0.93, status: 'executed' as const, suggestions: [] as string[] },
  { id: 'v3', time: '10:43', heard: 'scroll dawn', match: null, confidence: 0.41, status: 'missed' as const, suggestions: ['Scroll down', 'Scroll up'] },
  { id: 'v4', time: '10:44', heard: 'close tab', match: 'Close tab', confidence: 0.95, status: 'confirm' as const, suggestions: [] as string[] },
  { id: 'v5', time: '10:45', heard: 'go back', match: 'Go back', confidence: 0.98, status: 'executed' as const, suggestions: [] as string[] },
];

export const dictationSample = {
  field: 'Message',
  site: 'mail.example.com',
  text: 'Hi Sam, meet you at the library at four. I will bring the notes.',
  suggestion: { from: 'at four', to: 'at 4 pm' },
};
