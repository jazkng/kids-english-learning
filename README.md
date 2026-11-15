# Kids English Learning

面向 2–5 岁儿童的全英文、卡通老师引导式互动学习 App。技术：React + TypeScript + Vite + Capacitor + PWA。

**当前是开发骨架，供成人开发验收；不是完整课程、可用有声产品或已部署 APK。** 初始 A、0、red 示例均为 draft，音频未生成，ElevenLabs 接入被阻止。

## 本机运行

Node 24 LTS；使用提交的 npm lockfile。

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

`npm run check` 校验类型、课程与跨文件引用并执行测试。`npm run check:release` 要求正式课程覆盖与获批音频；初始化阶段**应失败**，不能为通过检查而删掉门槛。

Android 由 CC 在具备 Android Studio/SDK/JDK 的环境继续：`npm run android:add` → `npm run android:sync` → `npm run android:open`。当前未生成 android/ 或 APK；appId 为开发占位值，正式签名前确认。

## 开发入口

| 文档 | 用途 |
|---|---|
| [AGENTS.md](AGENTS.md) | 中央共享规则和项目规则 |
| [PROJECT_MEMORY.md](PROJECT_MEMORY.md) | 已验证进度和决定 |
| [架构](docs/ARCHITECTURE.md) | 模块、流程、离线边界 |
| [课程契约](docs/COURSE_DATA_SPEC.md) | Gemini 和 CC 共用数据规范 |
| [并行计划](docs/PARALLEL_PLAN.md) | 分支、文件归属、合并顺序 |
| [任务清单](docs/TASKS.md) | GitHub Issues 和依赖 |
| [测试计划](docs/TEST_PLAN.md) | 自动检查及实机验收 |
| [ElevenLabs 审批](docs/ELEVENLABS_POLICY_GATE.md) | 儿童产品使用前置条件 |

MVP：ABC A–Z；Numbers 0–100（分段渐进）；Colors（建议 12 色）；2–3 / 4–5 岁分层。首版不含账号、广告、排行榜、开放式 AI 对话、录音或云端儿童资料。

不允许未经批准开通收费服务。源代码合并不代表部署；部署不代表设备或儿童使用验收。当前没有自动部署工作流；保留共享模板的 GitHub 源码自动 Release，它不分发 APK 或代表儿童发布验收。
