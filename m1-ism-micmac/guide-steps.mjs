const welcomeSteps = [
  { screen: 'welcome', target: '.hero-button', title: 'guideWelcomeTitle', text: 'guideWelcomeText' },
  { screen: 'profile', target: '.profile-form [name="code"]', title: 'guideCodeTitle', text: 'guideCodeText' },
  { screen: 'profile', target: '.profile-form [name="role"]', title: 'guideRoleTitle', text: 'guideRoleText' },
  { screen: 'profile', target: '.profile-form .primary-button', title: 'guideStartTitle', text: 'guideStartText' },
  { screen: 'survey', target: '.source-topic', title: 'guideIfTitle', text: 'guideIfText' },
  { screen: 'survey', target: '.target-fieldset', title: 'guideThenTitle', text: 'guideThenText' },
  { screen: 'survey', target: '.topic-notes', title: 'guideNotesTitle', text: 'guideNotesText' },
  { screen: 'survey', target: '.topic-actions .primary-button', title: 'guideNextTitle', text: 'guideNextText' },
  { screen: 'review', target: '.review-actions .primary-button', title: 'guideSubmitTitle', text: 'guideSubmitText' },
];

const completeStep = {
  screen: 'complete',
  target: '.complete-actions',
  title: 'guideCompleteTitle',
  text: 'guideCompleteText',
};

const localSteps = {
  profile: welcomeSteps.filter((step) => step.screen === 'profile'),
  survey: welcomeSteps.filter((step) => step.screen === 'survey'),
  review: welcomeSteps.filter((step) => step.screen === 'review'),
  complete: [completeStep],
};

export function guideStepsForScreen(screen) {
  if (screen === 'welcome') return welcomeSteps;
  return localSteps[screen] || [];
}
