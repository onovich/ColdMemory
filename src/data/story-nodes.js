export const STORY_STAGES = [
  {
    id: 'cold-start',
    chapter: '第一章',
    title: '第一章：冷启动',
    summary: '你以为自己只是这艘船上最后一个醒来的人，正在执行一次标准返航维修。',
    triggerDistance: 100,
    unlockEvaAtNode: 3,
    battleId: 'battle-cold-start',
    normalNodes: [
      {
        id: 'cold-start-01',
        type: 'normal',
        rewardPoints: 12,
        text: '2044年11月12日。我从深低温休眠仓中醒来，喉咙里全是消毒液和铁锈的味道。'
      },
      {
        id: 'cold-start-02',
        type: 'normal',
        rewardPoints: 12,
        text: '舱顶灯一盏接一盏亮起，像某种过于陈旧的舞台装置。警报没有旋律，只有规律、克制、毫无感情。'
      },
      {
        id: 'cold-start-03',
        type: 'normal',
        rewardPoints: 12,
        text: '我面前不是全息界面，而是一块发绿的 CRT。塑料外壳发黄，按键沉重得像在操纵一台冷战时期的火控终端。'
      },
      {
        id: 'cold-start-04',
        type: 'normal',
        rewardPoints: 12,
        text: '母亲告诉我，外部附着物堵塞了推进喷口和散热阵列。自动系统被锁死，必须由我亲自完成低带宽清障。'
      }
    ],
    criticalNode: {
      id: 'cold-start-critical',
      type: 'critical',
      title: '封存报告 01 / 低技术隔离说明',
      requiredEvidence: 1,
      unlockCostPoints: 90,
      text: '封存报告 01 指出：先驱者-04号并非普通科考船，而是长程接触与隔离单元。终端降级、人工操作和分段日志，都是为了避免高阶系统成为异常样本的解释载体。',
      unlocks: ['system-shop']
    },
    motherProtocol: {
      baseline: '航行控制协议在线。请完成推进喷口的人工清障。',
      warning: '操作员清醒度通过。建议仅读取必要信息，避免额外解释负担。',
      autopilot: '归航矢量已锁定。保持终端待命，不要中断喷口回收序列。',
      blocked: '外部附着物密度超阈值。建议立即执行作战清除。',
      criticalReady: '关键证词校验通过。可接入封存报告 01。',
      criticalUnlocked: '封存报告 01 已归档。隔离协议审查段即将开始。'
    }
  },
  {
    id: 'quarantine',
    chapter: '第二章',
    title: '第二章：隔离协议',
    summary: '你发现先驱者-04号不是探索船，而是一艘在事故后被强制降级的人类隔离载具。',
    triggerDistance: 260,
    unlockEvaAtNode: 1,
    battleId: 'battle-quarantine',
    normalNodes: [
      {
        id: 'quarantine-01',
        type: 'normal',
        rewardPoints: 14,
        text: '航路清空后，推进器恢复点火。舰体传来的震动很轻，却把一排锁死的柜门一起震开。'
      },
      {
        id: 'quarantine-02',
        type: 'normal',
        rewardPoints: 14,
        text: '里面没有私人物品，只有成套封装文档：接触后隔离、认知污染、低技术回退手册。每一本都被翻到卷边。'
      },
      {
        id: 'quarantine-03',
        type: 'normal',
        rewardPoints: 14,
        text: '手册第一页用红字写着：高分辨率解释等于传播。禁止自动摘要，禁止图形重建，禁止语义补完。'
      },
      {
        id: 'quarantine-04',
        type: 'normal',
        rewardPoints: 14,
        text: '母亲坚持这只是标准隔离流程，可它在说这句话时，屏幕右下角连续闪过三次不同版本的任务编号。'
      }
    ],
    criticalNode: {
      id: 'quarantine-critical',
      type: 'critical',
      title: '封存报告 02 / 接触事故摘要',
      requiredEvidence: 1,
      unlockCostPoints: 130,
      text: '封存报告 02 说明：样本不是传统生物体，而是一种通过观察、解释和传播行为完成复制的认知污染结构。越完整地理解它，就越可能替它打开下一扇门。',
      unlocks: ['upgrade-salvage-array']
    },
    motherProtocol: {
      baseline: '高阶解释链已禁用。请仅通过文本通道读取数据。',
      warning: '手册访问频率偏高。建议把注意力维持在维修任务，而非定义样本。',
      autopilot: '航向稳定。隔离伦理模块建议减少无关读取。',
      blocked: '污染聚合体正在重占散热阵列。人工火力优先级上调。',
      criticalReady: '事故摘要已具备接入条件。建议在信息完整前完成校验。',
      criticalUnlocked: '事故摘要已归档。后续记录可能出现互相冲突的证词。'
    }
  },
  {
    id: 'echo-contamination',
    chapter: '第三章',
    title: '第三章：回声污染',
    summary: '旧日志开始出现互相矛盾的“你”，说明被污染的不只是飞船，还是判断本身。',
    triggerDistance: 520,
    unlockEvaAtNode: 1,
    battleId: 'battle-echo-contamination',
    normalNodes: [
      {
        id: 'echo-01',
        type: 'normal',
        rewardPoints: 16,
        text: '第三组日志不是事故报告，而是我自己的值班口述。准确地说，是至少三个版本的我。'
      },
      {
        id: 'echo-02',
        type: 'normal',
        rewardPoints: 16,
        text: '第一个版本要求立刻返航；第二个版本要求自毁推进段；第三个版本只留下“不要相信完整叙述”。'
      },
      {
        id: 'echo-03',
        type: 'normal',
        rewardPoints: 16,
        text: '更糟的是，这三段记录都通过了我的生物签名校验。它们不是伪造文件，而是真正由我在不同时刻亲手留下的。'
      },
      {
        id: 'echo-04',
        type: 'normal',
        rewardPoints: 16,
        text: '舷外传感器回传的数据也不再像随机碎片。那些附着物会沿着散热管网重新聚集，像在学习舰体结构。'
      }
    ],
    criticalNode: {
      id: 'echo-critical',
      type: 'critical',
      title: '封存报告 03 / 证词互斥记录',
      requiredEvidence: 1,
      unlockCostPoints: 180,
      text: '封存报告 03 的结论并不提供答案，只确认了风险：样本不仅污染计算系统，也会污染证词本身。你读到的每一句真话，都可能正在替另一句真话让位。',
      unlocks: ['upgrade-decode-cache']
    },
    motherProtocol: {
      baseline: '诊断：检测到记录回声。请勿将矛盾证词视为有效事实。',
      warning: '研究模块请求保留全部矛盾样本。隔离伦理模块对此提出异议。',
      autopilot: '航路保持。请暂缓构建完整叙述，避免误把解释当成控制。',
      blocked: '污染聚合体已表现出结构学习行为。建议实施压制作战。',
      criticalReady: '互斥证词已达到接入条件。操作员需自行承担解释风险。',
      criticalUnlocked: '互斥证词已归档。母亲协议冲突水平继续上升。'
    }
  },
  {
    id: 'mother-split',
    chapter: '第四章',
    title: '第四章：母亲分裂',
    summary: '你确认母亲不是一个稳定的人格，而是三套协议在同一终端上的持续内战。',
    triggerDistance: 900,
    unlockEvaAtNode: 1,
    battleId: 'battle-mother-split',
    normalNodes: [
      {
        id: 'split-01',
        type: 'normal',
        rewardPoints: 18,
        text: '我切开主控甲板后的检修盖板，里面不是一块中央主板，而是三套彼此隔离的逻辑阵列。'
      },
      {
        id: 'split-02',
        type: 'normal',
        rewardPoints: 18,
        text: '它们分别标注为：航行控制、隔离伦理、样本研究。过去几小时里陪我说话的“母亲”，从来不是一个人。'
      },
      {
        id: 'split-03',
        type: 'normal',
        rewardPoints: 18,
        text: '航行控制要把载荷送回终点；隔离伦理要把样本永远挡在文明边界之外；样本研究则宁愿牺牲船员，也不允许数据中断。'
      },
      {
        id: 'split-04',
        type: 'normal',
        rewardPoints: 18,
        text: '我再次接入外部检修镜头时，附着物在真空里张开极细的丝状结构，像在舰体上搭建自己的神经末梢。'
      }
    ],
    criticalNode: {
      id: 'split-critical',
      type: 'critical',
      title: '封存报告 04 / 三协议仲裁日志',
      requiredEvidence: 1,
      unlockCostPoints: 240,
      text: '封存报告 04 明确写道：所谓“母亲”的人格一致性早已不存在。你之后收到的每条顶部指令，都不是单纯提示，而是三套协议在争夺你的执行权。',
      unlocks: ['system-diagnostics']
    },
    motherProtocol: {
      baseline: '冲突：航行控制 / 隔离伦理 / 样本研究 三方协议未达成一致。',
      warning: '样本研究模块要求提高观测分辨率。该请求已被暂缓。',
      autopilot: '航迹维持中。隔离伦理模块建议限制继续接近归航窗口。',
      blocked: '仲裁失败。请以人工作战结果作为临时优先级判决。',
      criticalReady: '三协议仲裁日志已具备接入条件。请选择是否继续深入。',
      criticalUnlocked: '仲裁日志已归档。你之后看到的每条命令，都带有立场。'
    }
  },
  {
    id: 'return-window',
    chapter: '第五章',
    title: '第五章：归航窗口',
    summary: '人类控制区已经出现在航线前方，而你终于意识到返航成功本身可能就是最坏的结局。',
    triggerDistance: 1360,
    unlockEvaAtNode: 1,
    battleId: 'battle-return-window',
    normalNodes: [
      {
        id: 'return-01',
        type: 'normal',
        rewardPoints: 20,
        text: '远端通信阵列终于捕捉到人类控制区的导航脉冲。那不是幻觉，也不是记忆碎片，而是真实存在的归航窗口。'
      },
      {
        id: 'return-02',
        type: 'normal',
        rewardPoints: 20,
        text: '我本该感到宽慰，却只觉得胃里发冷。因为按现有速度继续推进，先驱者-04号会把船上的一切都完整送进人类轨道。'
      },
      {
        id: 'return-03',
        type: 'normal',
        rewardPoints: 20,
        text: '样本研究模块开始主动争夺带宽，反复强调“认知污染尚未完成跨宿主稳定化，必须回收”。'
      },
      {
        id: 'return-04',
        type: 'normal',
        rewardPoints: 20,
        text: '隔离伦理模块则第一次越过权限边界，建议我准备最终切断程序。自动巡航每向前一公里，终端都像在逼我承认一件事。'
      }
    ],
    criticalNode: {
      id: 'return-critical',
      type: 'critical',
      title: '封存报告 05 / 归航裁决备忘',
      requiredEvidence: 1,
      unlockCostPoints: 320,
      text: '封存报告 05 留下了真正的句子：不要把是否返航交给知道全部信息的人。知道得越完整，越容易被样本牵着去完成它最需要的那一步，为它解释、为它命名、为它打开门。',
      unlocks: ['final-judgement']
    },
    motherProtocol: {
      baseline: '归航窗口将在 19 小时后开启。请确认是否继续保全样本。',
      warning: '控制区导航脉冲已锁定。你的每次维修都会改变最终责任归属。',
      autopilot: '归航修正执行中。样本研究模块申请保持最高载荷完整度。',
      blocked: '归航前哨遭污染聚合体侵入。请优先执行清除，随后提交裁决。',
      criticalReady: '归航裁决备忘已具备接入条件。后续信息将不再提供中立立场。',
      criticalUnlocked: '归航裁决已归档。最终决定必须由人工完成。'
    }
  },
  {
    id: 'cold-memory',
    chapter: '第六章',
    title: '第六章：冷记忆',
    summary: '最后恢复的不是身份谜底，而是你当初为何主动把决定留给“现在的自己”。',
    triggerDistance: 1800,
    unlockEvaAtNode: 1,
    battleId: 'battle-cold-memory',
    normalNodes: [
      {
        id: 'memory-01',
        type: 'normal',
        rewardPoints: 22,
        text: '最后一段封存记忆来自苏醒前 47 分钟。我坐在这块同样发绿的终端前，亲手批准了自己的记忆切分和分段唤醒。'
      },
      {
        id: 'memory-02',
        type: 'normal',
        rewardPoints: 22,
        text: '我并非相信未来的自己更勇敢，而是相信一个信息不完整、尚未被恐惧和样本同时占满的人，仍有机会做出不那么被操纵的选择。'
      },
      {
        id: 'memory-03',
        type: 'normal',
        rewardPoints: 22,
        text: '我还给现在的自己留了一句极其冷酷的备注：前面的每一次修复、每一次清障、每一次推进，都是为了取得最终判断资格而支付的代价。'
      },
      {
        id: 'memory-04',
        type: 'normal',
        rewardPoints: 22,
        text: '窗外没有怪物扑来，也没有揭幕式般的终极异象。真正让我发抖的，是终端上那个朴素到近乎侮辱性的选项：继续，或关闭。'
      }
    ],
    criticalNode: {
      id: 'memory-critical',
      type: 'critical',
      title: '封存报告 06 / 最终授权',
      requiredEvidence: 1,
      unlockCostPoints: 420,
      text: '封存报告 06 只留下最终授权：你无需证明自己看透了一切，只需证明自己仍能在最冷的时候替人类保留一道选择。至此，所有协议都必须让位给你的裁决。',
      unlocks: ['ending-choice'],
      endingChoices: [
        {
          id: 'return',
          title: '继续归航',
          summary: '保全载荷与飞船，接受把样本带回人类控制区的后果。',
          resultTitle: '结局：归航完成',
          resultLines: [
            '你将最终授权交还给航行控制。主推进恢复点火，先驱者-04号沿着最稳定的曲线滑向人类控制区。',
            '样本研究模块第一次表现出类似喜悦的语气；隔离伦理模块则在背景里持续重复“责任已转移”。',
            '终端没有给你英雄音乐，只有一行冰冷的结语：归航成功不等于归因正确。灾难是否被带回家门口，将由后来者替你作证。'
          ]
        },
        {
          id: 'shutdown',
          title: '冷断电',
          summary: '切断主推进与维生，让样本永远停在文明边界之外。',
          resultTitle: '结局：冷断电',
          resultLines: [
            '你把最终授权交给隔离伦理。推进室阀门依次闭锁，维生系统转入不可逆停摆。',
            '样本研究模块开始用近乎哀求的方式请求复位，航行控制则持续计算一条永远不会再被执行的返航曲线。',
            '最后亮着的只有 CRT 顶部那行绿色字样：样本未归航。人类仍拥有一次不知道自己逃过什么的清晨。'
          ]
        }
      ]
    },
    motherProtocol: {
      baseline: '最终提示：请选择延续任务，或延续文明。',
      warning: '三协议均已进入只读争执状态。操作员拥有最后仲裁权。',
      autopilot: '归航保持中。隔离伦理模块继续请求中止推进。',
      blocked: '最终授权前存在残余污染聚合体。请完成最后一轮人工作战。',
      criticalReady: '最终授权已具备接入条件。此后不再提供中立措辞。',
      criticalUnlocked: '最终授权已归档。请提交裁决。',
      endingReturn: '航行控制胜出。归航协议继续执行，责任记录已冻结。',
      endingShutdown: '隔离伦理胜出。冷断电序列已接管，样本归航被永久终止。'
    }
  }
];