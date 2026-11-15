# 三 AI 并行开发计划

## 启动和分支

先读取中央 memory/START_HERE.md、catalog、相关共用记忆，再读取本项目 AGENTS、PROJECT_MEMORY、此文和任务 Issue/评论。获取最新 main 后，各自开分支；保留现有未提交修改。每位 AI 自己开 PR，不直接改 main、不操作别人的分支。不能把“任务已写入”当作 CC/Gemini 已读取或开始执行。

| AI | 首个分支 / Issue | 允许主要编辑 | 避免编辑 |
|---|---|---|---|
| Codex | codex/quality-gates / #4 | schemas、src/contracts、scripts、tests、CI、架构及验收规范 | CC 运行时、Gemini 课程正文 |
| Claude Code | claude/learning-runtime / #2 | src/app、src/features、src/services、src/styles、public/icons | content、schemas |
| Gemini | gemini/curriculum-v1 / #3 | content/lessons、content/scripts、content/audio/manifest.json、docs/content | src、schemas、package/lockfile |

Android 后续由 CC 用 claude/android-preview / #6 编辑 android、Capacitor 配置与部署文档。实际音频 #7 分两次 PR：Gemini 脚本/元数据审稿，CC 打包/播放器；不能同时修改 manifest。public/audio 文件先由 CC 统一集成。

## 依赖与合并顺序

- 第一阶段（本次 #1）：Codex 合并骨架、冻结契约 v1，建立样例与检查。源代码 main 没有自动部署。
- 第二阶段（同时开始）：CC 用 draft 样例开发纵向流程；Gemini 先交 A–C/0–3/三色小样，再写完整课程；Codex 增补自动测试并准备 #5 审批材料。CC 无需等正式音频即可用开发态占位测试；不能声称有声离线已完成。
- 第三阶段（串行集成）：先合并 Gemini 小样，再合并 CC 兼容流程，再合并其余课程。Codex 审核契约/英文内容/测试。新字段先请求契约 PR，然后内容和运行时跟进。
- 第四阶段：#5 真实书面批准、声音权利/分发许可和费用决定齐备后，才解除 ElevenLabs #7 阻塞。先做少量成人试听，再批量制作。审批未过可继续开发，不能擅自用其他服务绕开授权要求。
- 第五阶段：CC #6 调试 APK、成人测试预览；Codex 验证离线与发布门槛。儿童分发/上架需完整音频、隐私/商店检查、真实设备和用户验收。

## 共同文件协调

package.json、package-lock.json、AGENTS.md、PROJECT_MEMORY.md 和 policy-approvals.json 由 Codex 串行协调；CC 如需加依赖先在 Issue 说明并由集成人合并锁文件变更。每个 PR 先写自己的 docs/handoffs/<date>-<agent>-<task>.md；集成人在合并前按稳定 ID 更新 PROJECT_MEMORY，保留其他记录。不要各自用完整文件覆盖记忆。

每个 Issue 留中文交接：已完成、未完成、改动文件、如何验收、风险/注意，签 AI 名。PR 链接 Issue、列出实际验证证据、未验证项目及网络/费用影响。检查失败不合并；审批阻塞不是让人直接跳过校验的理由。

## 可直接交给 CC

接手 jazkng/kids-english-learning，读取 AGENTS、PROJECT_MEMORY、docs/PARALLEL_PLAN、ARCHITECTURE、COURSE_DATA_SPEC、TEST_PLAN 和 #2 全部评论。拉最新 main，在 claude/learning-runtime 开发 #2；先用 draft 课程跑通老师讲解→示范→点选→反馈→复习，离线音频走本地适配器。不要改 Gemini 课程或 Codex 契约。之后用独立 PR 处理 #6 Android 调试 APK/零新增费用预览部署。不得开通收费或调用 ElevenLabs；审批见 #5。完成开 PR 并中文交接，区分构建/部署/实机结果。

## 可直接交给 Gemini

接手 jazkng/kids-english-learning，读取 AGENTS、PROJECT_MEMORY、docs/PARALLEL_PLAN、COURSE_DATA_SPEC 和 #3 评论。在 gemini/curriculum-v1 按 JSON Schema 编写全英文课程与语音脚本，先交 A–C、0–3、red/blue/yellow 小样供 CC 集成，再覆盖 A–Z、0–100、12 色。所有台词保存在 audio manifest，发音/停顿另存 delivery，不修改 src/schema/package 文件。保持 draft 交人工审稿；只准备脚本，不生成音频、不上传儿童录音、不启用收费。跑校验和测试，开 PR 并中文交接。
