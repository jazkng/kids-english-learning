# 交接｜Claude Code — 课程语音（家庭自用）

已完成：
- 车主 2026-11-15 决定：只限家庭自用，用自己的 ElevenLabs 免费账户，声音选 Lily（英式女声，premade `pFZP5JQG7iQjIQuC4Bku`），模型 `eleven_flash_v2_5`，语速 0.85；570 句台词一次生成完。
- ElevenLabs 没有给出儿童产品的书面批准。`content/policy-approvals.json` 的 `status` 仍是 `blocked`，只另外加了一条 `ownerFamilyUseDecision` 记录车主的决定（`allowsRelease: false`）。
- `content/scripts/generate-audio.mjs`：重复运行结果不变；只处理 draft 台词，台词文字没变且文件已存在的会跳过；遇到额度或权限错误就停下，不会浪费剩余额度。key 由会话的网络代理注入，不进仓库，也不放环境变量。
- 校验：有了车主决定，draft 状态的 ElevenLabs 台词可以通过开发检查；`check:release` 和 approved 状态仍然会被拦住。draft 音频也会核对文件大小和 SHA256。
- 运行时：打包进 App 的 draft 音频可以在 APK/PWA 里播放（家庭自用范围）。

未完成：大人试听审核（发音、停顿、Z 读 zed 等）、手机实机有声离线测试。
运行方式：`NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt node content/scripts/generate-audio.mjs`（这里的 Node 22 自带的 fetch 默认不走代理）。
风险 / 注意：免费版只能非商业使用，并且可能要求注明 ElevenLabs。如果将来公开发布，必须先拿到 #5 的书面批准，或者重新录音。
