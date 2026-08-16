const stageOrder = ['profile', 'survey', 'review'];

export function stageIndex(screen) {
  return stageOrder.indexOf(screen);
}

export function canNavigateToStage(currentScreen, targetStage) {
  const currentIndex = stageIndex(currentScreen);
  const targetIndex = stageIndex(targetStage);
  return currentScreen !== 'complete'
    && currentIndex >= 0
    && targetIndex >= 0
    && targetIndex < currentIndex;
}

export function topicIsAvailable(index, currentIndex, reviewedIds, factorId) {
  return index <= currentIndex || reviewedIds.includes(factorId);
}
