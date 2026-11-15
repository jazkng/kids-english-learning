# 交接｜Claude Code — #2 学习运行时

已完成：
- 课程选择 → 老师讲解(teach) → 示范(demo) → 点选(choice) → 温和反馈/提示重试 → 复习(review) → 完成页；ABC/Numbers/Colors，按 2–3 / 4–5 岁分组显示。
- 原创卡通猫头鹰老师（内联 SVG，离线），状态 idle/speaking/waiting/celebrating 跟随状态机；减少动画（系统设置或家长开关）。
- 纯状态机 `src/features/lesson/engine.ts`：token 防旧音频回调、暂停保留步骤、恢复须明确点击、答错不扣分并高亮正确答案、选择题不可跳过、选项轮换位置。
- 本地音频 `services/audio.ts`：单一播放器串行播放；重播/后退/切课/离开/进入后台都会停止旧音轨；play() 被拒显示“点 ↻”；生产版仅播放 approved 文件；无浏览器 TTS 兜底。
- 缺音频：可见“Audio not ready — adult, please read”字幕和闪烁的 Next；该课不记为完成。家长关闭声音时可由大人朗读并正常完成。
- 进度 `services/progress.ts`：防御解析、存储被拒/超额不崩溃，仅在课程结束写一次。
- 家长区（长按 3 秒）：声音、减少动画、完成数、离线安装状态、PWA 更新（只在家长区应用，不打断课程）、清除进度（应用内确认弹窗）。
- history 导航：浏览器/Android 返回键逐层返回。

未完成：
- 真实课程音频（等 #5/#7），APK（#6），实机/儿童验收。

改动文件：src/app、src/features/*、src/services/*、src/main.tsx、src/styles/app.css、tests/runtime.test.mjs（新增）、tsconfig.json（allowImportingTsExtensions，供 Node 测试直接导入 .ts）、docs/MODULE_MAP.md。未改 content/、schemas/。

如何验收：`npm ci && npm run check && npm run build && npm run preview`，按 docs/TEST_PLAN.md 第 1–3、7、8 项走。

风险 / 注意：
- tests/、tsconfig.json 属 Codex 范围，本 PR 只做新增，请 Codex 审核。
- 当前所有音频 file=null，因此预览全程为“无声 + 字幕”模式；有声路径仅用临时本地 WAV（未提交）验证。
- 家长门只是防儿童误触，不是身份验证。
