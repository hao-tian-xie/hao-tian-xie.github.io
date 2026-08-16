export const studyConfig = {
  id: 'M1-ESG-ISM-MICMAC',
  version: 'factors-v1',
  title: {
    'zh-CN': 'M1 结构关系研究',
    'zh-HK': 'M1 結構關係研究',
    en: 'M1 Structural Relationship Study',
  },
  scope: {
    'zh-CN': '未来三年，供应链企业推进 ESG 实践的过程',
    'zh-HK': '未來三年，供應鏈企業推進 ESG 實踐的過程',
    en: 'ESG implementation in supply-chain enterprises over the next three years',
  },
  factors: [
    {
      id: 'F1',
      name: {
        'zh-CN': '管理层支持',
        'zh-HK': '管理層支持',
        en: 'Leadership support',
      },
      description: {
        'zh-CN': '管理层持续参与、明确授权并推动相关工作。',
        'zh-HK': '管理層持續參與、明確授權並推動相關工作。',
        en: 'Leaders stay involved, give clear authority and move the work forward.',
      },
    },
    {
      id: 'F2',
      name: {
        'zh-CN': '清晰的 ESG 目标',
        'zh-HK': '清晰的 ESG 目標',
        en: 'Clear ESG goals',
      },
      description: {
        'zh-CN': '组织设有明确、可衡量且与业务相关的 ESG 目标。',
        'zh-HK': '組織設有明確、可衡量且與業務相關的 ESG 目標。',
        en: 'The organisation has clear, measurable ESG goals linked to the business.',
      },
    },
    {
      id: 'F3',
      name: {
        'zh-CN': '数据质量',
        'zh-HK': '數據質量',
        en: 'Data quality',
      },
      description: {
        'zh-CN': '所需数据完整、准确、及时，并可追溯来源。',
        'zh-HK': '所需數據完整、準確、及時，並可追溯來源。',
        en: 'Required data is complete, accurate, timely and traceable.',
      },
    },
    {
      id: 'F4',
      name: {
        'zh-CN': '数字系统整合',
        'zh-HK': '數碼系統整合',
        en: 'Digital system integration',
      },
      description: {
        'zh-CN': '不同系统能够连接，并支持统一的数据收集和分析。',
        'zh-HK': '不同系統能夠連接，並支援統一的數據收集和分析。',
        en: 'Systems connect and support consistent data collection and analysis.',
      },
    },
    {
      id: 'F5',
      name: {
        'zh-CN': '团队能力',
        'zh-HK': '團隊能力',
        en: 'Team capability',
      },
      description: {
        'zh-CN': '员工掌握 ESG、数据和执行工作所需的知识与技能。',
        'zh-HK': '員工掌握 ESG、數據和執行工作所需的知識與技能。',
        en: 'Staff have the ESG, data and delivery skills needed for the work.',
      },
    },
    {
      id: 'F6',
      name: {
        'zh-CN': '跨部门协作',
        'zh-HK': '跨部門協作',
        en: 'Cross-team collaboration',
      },
      description: {
        'zh-CN': '业务、运营、技术和 ESG 团队能共同作出决定。',
        'zh-HK': '業務、營運、技術和 ESG 團隊能共同作出決定。',
        en: 'Business, operations, technology and ESG teams make decisions together.',
      },
    },
    {
      id: 'F7',
      name: {
        'zh-CN': '供应商参与',
        'zh-HK': '供應商參與',
        en: 'Supplier participation',
      },
      description: {
        'zh-CN': '供应商愿意提供数据，并配合共同的 ESG 行动。',
        'zh-HK': '供應商願意提供數據，並配合共同的 ESG 行動。',
        en: 'Suppliers share data and take part in joint ESG action.',
      },
    },
    {
      id: 'F8',
      name: {
        'zh-CN': '资源与预算',
        'zh-HK': '資源與預算',
        en: 'Resources and budget',
      },
      description: {
        'zh-CN': '项目获得足够的人员、时间和资金支持。',
        'zh-HK': '項目獲得足夠的人員、時間和資金支援。',
        en: 'The programme has enough people, time and funding.',
      },
    },
  ],
};

export function localisedFactors(locale) {
  return studyConfig.factors.map((factor) => ({
    id: factor.id,
    label: factor.name[locale] || factor.name.en,
    description: factor.description[locale] || factor.description.en,
  }));
}
