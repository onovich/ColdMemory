export const STORY_STAGES = [
  {
    id: 'awakening',
    chapter: 'CHAPTER 01',
    title: '冷冻苏醒',
    summary: '冷冻仓异常开启，先驱者-04号上只剩一个醒着的人。',
    unlockEvaAtLine: 4,
    triggerDistance: 100,
    combatClearTarget: 10,
    content: [
      '2044年11月12日。我从深低温休眠仓中醒来，肺部像灌满了碎玻璃。',
      '警报声在走廊里回荡，那是某种旧时代的机械警报，令人心烦意乱。',
      '米色塑料面板与厚重的物理按键让整艘船像一件被遗忘的八十年代工业遗物。',
      '控制台上的铭牌写着：先驱者-04号。为什么只有我一个人。',
      '如果不手动清理推进器附近的漂浮残骸，我就没法继续航行。',
      '系统提示：EVA 外部扫描协议已解锁。进入外部终端，清理航道。'
    ]
  },
  {
    id: 'corridor',
    chapter: 'CHAPTER 02',
    title: '空寂的走廊',
    summary: '母亲 AI 不再回应，舰体深处开始传来抓挠声。',
    triggerDistance: 300,
    combatClearTarget: 12,
    content: [
      '航路暂时清空了。飞船再次加速，引擎的震动通过甲板传到我的脚心。',
      '我在生活区找到了半瓶波本威士忌，标签上印着苏维埃联盟的标志。那不该存在。',
      '飞船的 AI 母亲始终沉默。但每当我转头，总觉得摄像头在重新对焦。',
      '那种抓挠声又响起了，就在隔壁的舱壁里。是宇宙射线，还是别的什么。',
      '前方空间碎片越来越密集。真相似乎就在这段迷雾之后。'
    ]
  },
  {
    id: 'price',
    chapter: 'FINAL CHAPTER',
    title: '幸存的代价',
    summary: '真相不是航行尽头，而是反复重启的记忆程序。',
    triggerDistance: 1000,
    combatClearTarget: 14,
    content: [
      '真相就在那扇密封舱门后。我知道为什么飞船会维持这种复古风格了。',
      '这不是探索船。这是一个 1984 年发射的、基于错误物理理论的时间锚点。',
      '我不是幸存者。我是第 1024 个克隆体，任务是永无止境地读这本日记。',
      '外面没有星星。我们从未离开过地面。只有这一台永恒运作的终端。',
      '欢迎醒来，克隆体 1025 号。重启程序吧。'
    ]
  }
];

export const EVA_RECOVERY = 25;
export const AUTO_DRIVE_DISTANCE_PER_TICK = 0.45;
export const AUTO_DRIVE_ENERGY_PER_TICK = 0.05;
export const DECODE_DURATION_MS = 2200;
export const DECODE_TICK_MS = 20;