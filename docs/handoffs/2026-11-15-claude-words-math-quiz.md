# 交接｜Claude Code — 单词、加减法、测验

已完成：
- 单词（Words）26 课：每个字母配 2–3 个带图的单词（用 emoji，不需要图片文件，离线可用）。每个词先讲解再点选，最后复习。X 的单词说 "ends with X"。
- 加减法（Math）10 课：2–3 岁组是 5 以内的加法；4–5 岁组是 10 以内和 20 以内的加法、减法。每课第一题由老师示范怎么数点，减法会把拿走的点画成淡色加斜线。
- 测验：每个科目列表右上角有 ⭐ Quiz，从这一科的点选题里随机出 5 题，答错不扣分，并且不计入“完成课数”。ABC、数字、颜色的测验直接复用已有的 Lily 语音。
- 新台词共 245 句、8,654 个字符，全部是 draft、没有音频文件（播放时显示字幕）。下个月 ElevenLabs 额度重置后运行 `content/scripts/generate-audio.mjs` 补 Lily 语音，约需 4,330 积分。
- 为了不和 Codex 的难度分级改动冲突，新内容放在 `content/activities/` 和 `content/scripts/activities-v1.mjs`，没有改 lesson schema。引擎只是把参数类型放宽成结构类型（PlayableLesson）。

未完成：新内容的语音、大人试听审核、手机实测。
如何验收：`npm run check && npm run build`；在首页依次点 Words / Math / 任意科目的 Quiz。
风险 / 注意：emoji 的样子取决于手机系统，旧版 Android 可能显示不出 🪁（kite）、🪀（yo-yo）。navigation.ts 新增了 words/math 两个 subject。
