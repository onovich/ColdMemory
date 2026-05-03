export const BLOCKER_CONFIG = {
  'cold-start': [
    { type: 'distance', value: 100 },
    { type: 'all-normal-revealed' }
  ],
  quarantine: [
    { type: 'distance', value: 260 },
    { type: 'all-normal-revealed' }
  ],
  'echo-contamination': [
    { type: 'distance', value: 520 },
    { type: 'all-normal-revealed' }
  ],
  'mother-split': [
    { type: 'distance', value: 900 },
    { type: 'all-normal-revealed' },
    { type: 'upgrade-level', upgradeId: 'archiveRelay', level: 1 }
  ],
  'return-window': [
    { type: 'distance', value: 1360 },
    { type: 'all-normal-revealed' },
    { type: 'upgrade-level', upgradeId: 'salvageArray', level: 1 }
  ],
  'cold-memory': [
    { type: 'distance', value: 1800 },
    { type: 'all-normal-revealed' },
    { type: 'upgrade-level', upgradeId: 'decodeCache', level: 1 }
  ]
};

export function getStageBlockerConditions(stage) {
  return BLOCKER_CONFIG[stage.id] ?? [
    { type: 'distance', value: stage.triggerDistance },
    { type: 'all-normal-revealed' }
  ];
}
