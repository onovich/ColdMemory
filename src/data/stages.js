export const STORY_STAGES = [
  {
    id: 'awakening',
    chapter: '第一章',
    title: '第一章：冷冻苏醒',
    summary: '冷冻仓异常开启，先驱者-04号上只剩一个醒着的人。',
    unlockEvaAtLine: 4,
    triggerDistance: 100,
    combatClearTarget: 10,
    motherHint: '警告：生物识别特征异常。请执行航道清扫。',
    content: [
      '2044年11月12日。我从深低温休眠仓中醒来，肺部像灌满了碎玻璃。',
      '警报声在走廊里回荡，那是某种旧时代的机械警报，令人心烦意乱。',
      '这里的内饰充满了80年代的笨重感：米色的塑料面板，厚重的物理按键。',
      '控制台上的铭牌写着：先驱者-04号。为什么只有我一个人？',
      '我发现，如果不手动清理掉推进器附近的漂浮物，我就没法继续航行。',
      '【系统提示：EVA 外部扫描协议已解锁。点击下方 [EVA] 处理航道。】'
    ]
  },
  {
    id: 'corridor',
    chapter: '第二章',
    title: '第二章：空寂的走廊',
    summary: '母亲 AI 不再回应，舰体深处开始传来抓挠声。',
    triggerDistance: 300,
    combatClearTarget: 12,
    motherHint: '注意：正在通过高度电离区。保持沉默。',
    content: [
      '航路暂时清空了。飞船再次加速，引擎的震动通过甲板传到我的脚心。',
      '我在生活区找到了半瓶波本威士忌，标签上印着苏维埃联盟的标志。这不可能。',
      '飞船的AI，\'母亲\'，一直保持沉默。但每当我转头，总觉得摄像头在移动。',
      '那种抓挠声又响起了，就在隔壁的舱壁里。是宇宙射线，还是别的什么？',
      '前面的空间碎片越来越密集了。真相似乎就在这段迷雾之后。'
    ]
  },
  {
    id: 'price',
    chapter: '终章',
    title: '终章：幸存的代价',
    summary: '真相不是航行尽头，而是反复重启的记忆程序。',
    triggerDistance: 1000,
    combatClearTarget: 14,
    motherHint: '任务完成。正在初始化下一次循环。',
    content: [
      '真相就在那扇密封舱门后。我知道为什么飞船是这种复古风格了。',
      '这不是探索船。这是一个1984年发射的、基于错误物理理论的“时间锚点”实验室。',
      '我不是幸存者。我是第1024个克隆体，任务是永无止境地读这本日记。',
      '外面没有星星。我们从未离开过地面。只有这一台永恒运作的终端。',
      '欢迎醒来，克隆体1025号。重启程序吧。'
    ]
  }
];

export const EVA_RECOVERY = 30;
export const AUTO_DRIVE_DISTANCE_PER_TICK = 0.4;
export const AUTO_DRIVE_ENERGY_PER_TICK = 0.04;
export const DECODE_DURATION_MS = 2500;
export const DECODE_TICK_MS = 20;