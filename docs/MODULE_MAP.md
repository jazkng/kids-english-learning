# Module map

| 业务模块 | 入口 / navigation | 主要组件（计划） | 相关服务 | 读写数据 |
|---|---|---|---|---|
| 课程选择 | home / subject | app/App; features/subject-picker | course registry | content/catalog、lessons |
| 卡通老师 | lesson | features/teacher | lesson controller | step、teacher state（内存） |
| 引导学习及点选 | lesson / review | features/lesson-player | audio controller | lessons、audio manifest |
| 本地语音 | replay / pause | features/audio-controls | services/audio | public/audio；内存播放状态 |
| 学习进度 | resume | features/progress | services/progress | 本机 ProgressV1（待开发） |
| 家长区域 | parent | features/parent-area | progress/cache adapters | 声音、动画、重置、安装状态 |
| 离线与原生 | app startup | main、VitePWA、Capacitor | service worker / native bundle | shell cache、静态媒体 |

只有 App 静态开发首页、契约及构建配置已经初始化；表中 features/services 是 CC 的开发边界，不代表已实现。
