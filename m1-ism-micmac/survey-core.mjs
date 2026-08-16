const RELATION_DIRECTIONS = {
  V: [1, 0],
  A: [0, 1],
  X: [1, 1],
  O: [0, 0],
};

const DIRECTIONS_RELATION = {
  '1,0': 'V',
  '0,1': 'A',
  '1,1': 'X',
  '0,0': 'O',
};

function factorId(factor) {
  return typeof factor === 'string' ? factor : factor.id;
}

function factorLabel(factor) {
  if (typeof factor === 'string') return factor;
  if (typeof factor.label === 'string') return factor.label;
  return factor.labels?.en || factor.id;
}

function factorDescription(factor) {
  if (!factor || typeof factor === 'string') return '';
  if (typeof factor.description === 'string') return factor.description;
  return factor.descriptions?.en || '';
}

export function createPairs(factors) {
  const pairs = [];

  for (let leftIndex = 0; leftIndex < factors.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < factors.length; rightIndex += 1) {
      const leftId = factorId(factors[leftIndex]);
      const rightId = factorId(factors[rightIndex]);
      pairs.push({
        id: `${leftId}__${rightId}`,
        leftId,
        rightId,
      });
    }
  }

  return pairs;
}

export function relationDirections(relation) {
  return RELATION_DIRECTIONS[relation] || [0, 0];
}

export function applySourceSelections(answers = {}, pairs = [], sourceId, targetIds = []) {
  const selectedTargets = new Set(targetIds);
  const nextAnswers = { ...answers };

  pairs.forEach((pair) => {
    const sourceIsLeft = pair.leftId === sourceId;
    const sourceIsRight = pair.rightId === sourceId;
    if (!sourceIsLeft && !sourceIsRight) return;

    const targetId = sourceIsLeft ? pair.rightId : pair.leftId;
    const [currentLeftToRight, currentRightToLeft] = relationDirections(
      nextAnswers[pair.id]?.relation,
    );
    const leftToRight = sourceIsLeft
      ? Number(selectedTargets.has(targetId))
      : currentLeftToRight;
    const rightToLeft = sourceIsRight
      ? Number(selectedTargets.has(targetId))
      : currentRightToLeft;

    nextAnswers[pair.id] = {
      ...(nextAnswers[pair.id] || {}),
      relation: DIRECTIONS_RELATION[`${leftToRight},${rightToLeft}`],
    };
  });

  return nextAnswers;
}

export function selectedTargetsForSource(answers = {}, pairs = [], sourceId) {
  return pairs.flatMap((pair) => {
    if (pair.leftId === sourceId) {
      return relationDirections(answers[pair.id]?.relation)[0] ? [pair.rightId] : [];
    }
    if (pair.rightId === sourceId) {
      return relationDirections(answers[pair.id]?.relation)[1] ? [pair.leftId] : [];
    }
    return [];
  });
}

export function tryWriteStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeFilenamePart(value) {
  return String(value || '')
    .trim()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildDirectMatrix(factors, answers = {}) {
  const ids = factors.map(factorId);
  const indexById = new Map(ids.map((id, index) => [id, index]));
  const matrix = factors.map((_, rowIndex) => (
    factors.map((__, columnIndex) => (rowIndex === columnIndex ? 1 : 0))
  ));

  createPairs(factors).forEach((pair) => {
    const leftIndex = indexById.get(pair.leftId);
    const rightIndex = indexById.get(pair.rightId);
    const relation = answers[pair.id]?.relation;

    if (!RELATION_DIRECTIONS[relation]) {
      matrix[leftIndex][rightIndex] = null;
      matrix[rightIndex][leftIndex] = null;
      return;
    }

    const [leftToRight, rightToLeft] = relationDirections(relation);
    matrix[leftIndex][rightIndex] = leftToRight;
    matrix[rightIndex][leftIndex] = rightToLeft;
  });

  return matrix;
}

export function buildSubmission({
  studyId,
  locale,
  participant,
  factors,
  answers = {},
  submittedAt = new Date().toISOString(),
}) {
  const factorsById = new Map(factors.map((factor) => [factorId(factor), factor]));
  const pairs = createPairs(factors);
  const responses = pairs.map((pair) => {
    const answer = answers[pair.id] || {};
    const [leftToRight, rightToLeft] = relationDirections(answer.relation);

    return {
      pairId: pair.id,
      leftId: pair.leftId,
      leftLabel: factorLabel(factorsById.get(pair.leftId)),
      rightId: pair.rightId,
      rightLabel: factorLabel(factorsById.get(pair.rightId)),
      relation: RELATION_DIRECTIONS[answer.relation] ? answer.relation : null,
      leftToRight: answer.relation ? leftToRight : null,
      rightToLeft: answer.relation ? rightToLeft : null,
      note: String(answer.note || '').trim(),
    };
  });
  const answered = responses.filter((response) => response.relation !== null).length;
  const initialReachabilityMatrix = buildDirectMatrix(factors, answers);
  const directInfluenceMatrix = initialReachabilityMatrix.map((row, rowIndex) => (
    row.map((value, columnIndex) => (rowIndex === columnIndex ? 0 : value))
  ));

  return {
    schemaVersion: 1,
    studyId,
    locale,
    submittedAt,
    participant: { ...participant },
    progress: {
      answered,
      total: pairs.length,
      complete: answered === pairs.length,
    },
    factors: factors.map((factor) => ({
      id: factorId(factor),
      label: factorLabel(factor),
      description: factorDescription(factor),
    })),
    responses,
    initialReachabilityMatrix,
    directInfluenceMatrix,
  };
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function submissionToCsv(submission) {
  const header = [
    'study_id',
    'factor_version',
    'locale',
    'participant_code',
    'role_code',
    'experience_code',
    'submitted_at',
    'pair_id',
    'factor_i_id',
    'factor_i',
    'factor_j_id',
    'factor_j',
    'relation_code',
    'i_to_j',
    'j_to_i',
    'note',
  ];
  const rows = submission.responses.map((response) => [
    submission.studyId,
    submission.study?.factorVersion,
    submission.locale,
    submission.participant?.code,
    submission.participant?.roleCode,
    submission.participant?.experienceCode,
    submission.submittedAt,
    response.pairId,
    response.leftId,
    response.leftLabel,
    response.rightId,
    response.rightLabel,
    response.relation,
    response.leftToRight,
    response.rightToLeft,
    response.note,
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
