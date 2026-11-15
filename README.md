# Kids English Learning

面向 2–5 岁儿童的全英文、卡通老师引导式互动学习 App。技术：React + TypeScript + Vite + Capacitor + PWA。

**当前按家庭自用推进，先给家长验收。** CC 的老师引导、课程播放器和本地进度已实现，Android 工程与云端 debug APK 构建已完成；课程仍只有 A、0、red 三份 draft，完整课程、正式音频和实机验收待完成。暂不公开部署、上架或商用。源码仓库的公开状态与 App 部署不同，不存放家庭隐私或录音。

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

Android 由 CC 在具备 Android Studio/SDK/JDK 的环境继续：`npm run android:add` → `npm run android:sync` → `npm run android:open`。Android 工程已建立，debug APK 构建见 [成功的构建运行](https://github.com/jazkng/kids-english-learning/actions/runs/43663563490)；实机安装仍待验收。appId 为开发占位值，正式签名前确认。

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
