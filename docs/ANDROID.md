# Android 调试 APK 与测试部署（#6）

## 当前状态
- `android/` 由 `npx cap add android`（Capacitor 8.6.2，锁定依赖）生成；minSdk 24、compile/target SDK 36。
- appId `com.example.kidsenglishlearning` 仍是**开发占位值**；正式签名前须由 Jake 确认最终包名。签名材料（*.jks/*.keystore）已在 .gitignore，禁止入库。
- `MainActivity` 让硬件返回键先走 WebView 历史（课程→列表→首页），首页再退出；`onPause` 停止所有音频。
- capacitor.config.ts 无 `server.url`；CI 会检查同步后的原生配置中没有远程 url。原生端不注册 Service Worker（src/main.tsx）。

## 构建 APK
本地需要：Node 24、JDK 21、Android SDK（platform 36 + build-tools）。
```
npm ci
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# 输出 android/app/build/outputs/apk/debug/app-debug.apk
sha256sum android/app/build/outputs/apk/debug/app-debug.apk
```
云端：GitHub Actions `Android debug APK`（`.github/workflows/android-debug.yml`），公共仓库标准 runner 免费；PR 或手动触发，产物为 APK + SHA256SUMS.txt（保留 14 天）。只给成人测试，不签正式包、不上传商店。

## 设备验收（尚未执行）
按 docs/TEST_PLAN.md 第 5 项：全新安装 → 首次启动前开飞行模式 → 完成一课；后台暂停/回到前台点 ▶ 继续；返回键逐层返回；竖/横屏、刘海安全区；杀进程后重开进度仍在。需要获准音频后才能验收“有声离线”。

## 测试部署评估：Cloudflare Pages（推荐）
| 项目 | 结论 |
|---|---|
| 费用 | Free 计划：静态请求与带宽不限、每月 500 次构建、单文件 ≤25 MiB、≤20,000 文件；无需绑卡。须 Jake 在自己的 Cloudflare 账户核实当前额度后再建项目。 |
| HTTPS | 自带 `*.pages.dev` HTTPS，满足 PWA 安装与离线要求。 |
| 接入方式 | Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git → 选本仓库；Build command `npm run build`，Output `dist`，环境变量 `NODE_VERSION=24`。仓库内不放任何 Cloudflare token。 |
| PR 预览 | 每个 PR 自动生成独立预览 URL，适合成人验收。 |
| 缓存 | `public/_headers`：sw.js / index.html 不缓存，assets 长缓存；全站 `noindex`。 |
| 回滚 | 控制台 Deployments → 选旧部署 → Rollback；或 `git revert <sha>` 后推 main 重新构建。 |
| 备选 | GitHub Pages（免费，但无 PR 预览、无法设 headers）。 |

首次部署只面向成人开发验收；首页已显示 “Development preview for adults” 草稿标示。未通过 `npm run check:release` 与设备门槛前不得分发给儿童或上架。

## 未完成 / 阻塞
- 本会话环境无法下载 Android SDK（dl.google.com 被网络策略拦截），APK 只能由上述 GitHub Actions 构建。
- 实机验收、Cloudflare 项目创建（需 Jake 本人账户）均未执行。
