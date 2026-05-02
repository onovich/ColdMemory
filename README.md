# COLD MEMORY / 冷记忆

COLD MEMORY 是一个太空惊悚题材的放置点击游戏原型。当前仓库提供一个可以直接部署到 GitHub Pages 的静态 Web 版本，后续会以此为基础移植到 Unity。

## 当前玩法原型

- 自动巡航：持续推进航程并消耗能源。
- 记忆解析：点击恢复章节文本，逐步拼出叙事真相。
- EVA 清障：通过轻量射击清理残骸，解除剧情阻塞或回收能源。
- 章节推进：航程、文本解锁和 EVA 作业共同组成主循环。

## 项目结构

```text
.
├── docs/
│   ├── GAME_DESIGN.md
│   ├── PROJECT_REVIEW.md
│   └── ROADMAP.md
├── src/
│   ├── data/
│   ├── logic/
│   └── ui/
├── index.html
├── index.js
└── styles.css
```

## 本地运行

这是一个无构建依赖的静态项目，可直接用任意静态服务器运行，例如：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

## GitHub Pages

仓库已按静态站点结构整理。推送到 GitHub 后，可在仓库设置中将 GitHub Pages 指向默认分支根目录。

## 后续方向

- 扩展资源系统、事件系统和长期成长数值。
- 将章节脚本升级为可配置的内容管线。
- 将当前 Web 原型整理为 Unity 中的 UI 流程、状态机和配置表。