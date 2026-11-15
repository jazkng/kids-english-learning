# 任务清单

| Issue | 负责人 | 当前状态 | 前置条件 / 产出 |
|---|---|---|---|
| [#1 初始化](https://github.com/jazkng/kids-english-learning/issues/1) | Codex | 初始化 PR | 架构、共享规范、契约、样例、检查、并行计划 |
| [#2 学习运行时](https://github.com/jazkng/kids-english-learning/issues/2) | CC | PR #9 已合并 | 真实音频及实机验收仍待完成 |
| [#3 课程及台词](https://github.com/jazkng/kids-english-learning/issues/3) | CC（接手） | 等 CC 实际读取；无 Gemini 远端产出 | 小样先交 PR，再分 ABC/Numbers/Colors 补全 |
| [#4 测试与审核](https://github.com/jazkng/kids-english-learning/issues/4) | Codex | 后续开发 | 契约、覆盖、离线和发布验收 |
| [#5 ElevenLabs 审批](https://github.com/jazkng/kids-english-learning/issues/5) | Codex / 负责人 | BLOCKED pending evidence | 书面儿童产品批准、声音/分发许可及费用决定 |
| [#6 APK 与预览](https://github.com/jazkng/kids-english-learning/issues/6) | CC | PR #10 已合并；APK CI 成功 | 家庭设备安装验收未完成；暂不公开部署 |
| [#7 音频制作及集成](https://github.com/jazkng/kids-english-learning/issues/7) | Gemini / CC / Codex | BLOCKED by #5 | 获批后样本试听→批量→完整离线包 |

## 第一版完成定义

- [ ] 三类课程覆盖齐全、分层短课、全英文台词人工复核。
- [ ] 老师引导与点选练习能完整完成，失败后可重试，无惩罚和无尽奖励循环。
- [ ] 所有正式音频授权、审批、哈希、时长齐备。
- [ ] PWA 完整安装后离线冷启动；APK 新安装在飞行模式完成整课。
- [ ] 设备返回键、后台/恢复、重播/切课、防串音、窄屏和平板验收。
- [ ] 无收费服务擅自启用、无儿童信息上传、无前端密钥。
- [ ] Codex 审核、CI 和 release 数据检查通过；部署和设备结果分开记录。

Issue 是执行状态正本；此表是依赖导航。AI 名称为工作负责人，不是假设存在对应 GitHub 用户账号。
