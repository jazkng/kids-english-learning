# Module map

| 业务模块 | 入口 / navigation | 主要组件（计划） | 相关服务 | 读写数据 |
|---|---|---|---|---|
| 课程选择 | home / subject（history 栈） | app/App; features/home/Home（Home、LessonList）；services/navigation 验证和恢复 app 内页面 | services/content（import.meta.glob 注册表）与 lesson-order（数字目标递增） | content/catalog、lessons |
| 卡通老师 | lesson | features/teacher/Teacher（原创猫头鹰 SVG） | features/lesson/engine.teacherState | idle/speaking/waiting/celebrating（内存） |
| 引导学习及点选 | lesson / review / done | features/lesson/LessonPlayer、Visual | features/lesson/engine（纯状态机、稳定洗牌）；services/choice-practice（按年龄补足 3/4 个选项，复用原音频） | lessons、audio manifest |
| 本地语音 | replay / pause / back | LessonPlayer 控制栏 | services/audio（单一 HTMLAudioElement + session token） | public/audio；内存播放状态 |
| 学习进度 | lesson 完成 | App | services/progress | 本机 localStorage kids-english-learning.progress.v1 |
| 家长区域 | ⚙︎ 长按 3 秒 | features/parent/ParentArea（ParentGate、Modal） | progress、services/pwa | 声音、动画、重置、离线/更新状态；长按/焦点保护、后台重新锁定 |
| 离线与原生 | app startup | main、services/pwa、VitePWA、Capacitor | scripts/precache-policy 构建遗漏拒绝；services/offline 精确版本缓存核验 / service worker / native bundle | offline-package.json、shell cache、静态媒体 |
| 单词（Words） | home → Words → 字母词组；4–5 岁“First letters”看图找首字母 | features/lesson/LessonPlayer、Visual('word') | services/activities | content/activities/words.json（emoji 图）、audio manifest `words.*` |
| 加减法（Math） | home → Math | features/lesson/LessonPlayer、Visual('sum') | services/activities | content/activities/math.json、audio manifest `math.*` |
| 测验（Quiz） | 各科列表右上 ⭐ Quiz | LessonPlayer | services/activities.buildQuiz（按 run 种子随机 5 题，不计入完成数） | 复用各科点选题和已有语音 |

#2 已实现上述学习运行时；Android 原生工程见 #6。
