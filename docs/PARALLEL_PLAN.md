# 协作开发计划

## 当前安排（2026-11-15，优先于原三 AI 分工）

用户确认 App 仅给自己儿子家庭使用，暂不公开部署、上架或商用。课程转交 CC：远端未见 Gemini 分支、提交、PR 或交接，不能据此判定 Gemini 私有会话失败，但继续等无可审核产出会阻塞项目。CC 的运行时 PR #9 和 Android PR #10 已合并，APK CI 已成功；真实设备和实际部署仍未验收。

CC 从最新 main 开 `claude/curriculum-v1`，接 #3。先提交 A–C、0–3、red/blue/yellow 的可审核小样 PR，再分科目补全；每批运行校验和测试。保留所有现有内容；若 Gemini 有未推送成果，先导出并按 ID 比对。Gemini 暂停继续写课程，以免双写；Codex 继续 #4 审核/集成。登记任务不等于 CC 已收到或正在运行，本会话无法直接启动其私有会话。

语音的个人试听与家庭 App 用途分开记录。当前查询到的供应商回复不是批准；原先以公开儿童产品描述的申请与家庭自用范围有差别，其适用性待确认，不阻止无服务依赖的开发。不自行标记 provider approval 为 approved。

## 启动和分支

先读取中央 memory/START_HERE.md、catalog、相关共用记忆，再读取本项目 AGENTS、PROJECT_MEMORY、此文和任务 Issue/评论。获取最新 main 后，各自开分支；保留现有未提交修改。每位 AI 自己开 PR，不直接改 main、不操作别人的分支。不能把“任务已写入”当作 CC/Gemini 已读取或开始执行。

| AI | 首个分支 / Issue | 允许主要编辑 | 避免编辑 |
|---|---|---|---|
| Codex | codex/quality-gates / #4 | schemas、src/contracts、scripts、tests、CI、架构及验收规范 | CC 运行时、Gemini 课程正文 |
| Claude Code | claude/curriculum-v1 / #3（#2/#6 工程已合并） | 课程 content、英文脚本、docs/content；运行时另开 PR | schemas、src/contracts、共享 package/记忆文件 |
| Gemini | 暂停课程写入 | 导出并移交已有未提交成果供 CC 比对 | 不继续双写课程或改 CC 分支 |

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

接手 jazkng/kids-english-learning 的 Issue #3，先读 AGENTS、PROJECT_MEMORY、COURSE_DATA_SPEC 和 #3 最新评论。从最新 main 开 claude/curriculum-v1，先交 A–C、0–3、red/blue/yellow 的完整小样 PR，再按科目补全；逐批提交和校验，保持 draft。保留现有样例及可能收到的 Gemini 导出，不改 Codex 契约。项目仅家庭自用，暂不公开部署、上架或做商用；不启用收费或直接接入未经确认的语音服务。#2/#6 工程已合并，真实设备验收仍待完成。

## 可直接交给 Gemini

课程作者已改为 CC。Gemini 若有本地/会话内成果，请先导出全部课程、脚本、错误信息及完成范围，交 CC 按 ID 比对；暂停继续写入。当前没有已推送成果可供 Codex 审核，不能把原启动指令当作仍在执行。
