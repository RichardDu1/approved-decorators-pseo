# SEO 技术修复成果报告

> 日期：2026-11-03
> 对应诊断：`docs/网站流量诊断报告_结构功能审美SEO与GEO全面分析.md`
> 分支：`claude/seo-audit-fix-d0d633` → PR https://github.com/RichardDu1/approved-decorators-pseo/pull/1（**未合并，由所有者决定**）

## 一、修复清单

| # | 问题（诊断报告章节） | 修复 | 涉及文件 |
|---|---|---|---|
| 1 | 所有内页 308 到带斜杠 URL；sitemap 带斜杠、城市页 canonical 不带斜杠（2.2） | `build.format: 'file'` + `trailingSlash: 'never'`；canonical 统一由 `absoluteUrl()` 生成（去掉 `.html` / 尾斜杠）；sitemap 与内链同为无斜杠 | `astro.config.mjs`、`src/data/site.ts`、`src/layouts/Layout.astro` |
| 2 | 无 404 页，任意 URL 返回首页 + 200（2.3） | 新增 `404.astro`（`noindex`，并给出服务与地区入口），sitemap 排除 404 | `src/pages/404.astro`、`astro.config.mjs` |
| 3 | 正式域名硬编码在 6 处，且未注册（2.1） | 域名集中到一处，可用环境变量 `PUBLIC_SITE_URL` 覆盖；robots.txt 改为与 llms.txt 一起由脚本生成，保证同源 | `src/data/site.ts`、`astro.config.mjs`、`scripts/generate_llmstxt.mjs` |
| 4 | 6 个页面共用默认 description（2.4） | about / reviews / services / areas / privacy / terms 各写独立描述；`description` 改为必填参数；城市页 title 加入起价、description 加入邮编区与价格区间 | 各页面 |
| 5 | 编造的 `aggregateRating 4.9 / 248`、页面"4.9/5""240+ verified reviews"（2.5、4.2） | 从 schema 和页面全部移除；首页该卡片改为可核实的"3 Price Bands — Published on every local page" | `Layout.astro`、`index.astro`、`[city].astro` |
| 6 | 每个城市页一个无地址的 `HomeAndConstructionBusiness`；伦敦各区标为 `City`；`serviceArea` 已废弃（2.5） | 全站只保留一个 `Organization` 实体；城市页改为 `Service`（`provider` 指向该组织、`areaServed`、`AggregateOffer` 价格区间）；伦敦各区为 `AdministrativeArea` + `containedInPlace: London` | `Layout.astro`、`[city].astro` |
| 7 | 首页两个同 `@id` 的 `WebSite`，`SearchAction` 指向不存在的搜索 | 删除首页重复节点与 SearchAction | `index.astro` |
| 8 | 邮编前缀随机/截取生成，15 个城市中 11 个错误（3.3） | 改为 Royal Mail 邮编区：Glasgow `G`、Brighton `BN`、Leeds `LS`、Cardiff `CF`、Birmingham `B`、Edinburgh `EH` 等；伦敦各区列出主要邮编区（如 Camden `NW, N, WC`） | `generate_data.py`、`src/data/pseo_data.json` |
| 9 | "相邻地区"随机抽取（Glasgow → Derby）（3.2） | 按坐标计算直线距离取最近 3 个，并标注约多少英里（Glasgow → Edinburgh ~42 mi）；数据脚本去掉随机，结果可复现；价格、FAQ、本地要点**保持不变** | 同上、`[city].astro`、`llms-full.txt` |
| 10 | 服务没有落地页，服务卡片全部链到 `/services` 或 `/areas`；面包屑与 schema 不一致（3.1） | 新增 4 个服务中心页 `/{service}`：价格表（伦敦 vs 其他城市）、30 个地区链接、`Service` + `ItemList` + 面包屑 schema；首页/服务页/页脚/404 链接到服务中心页；城市页面包屑改为 `Home / 服务 / 当前页`，与 schema 一致；城市页"其他服务"列表加上"该服务全部 30 个地区"链接 | `src/pages/[service]/index.astro` 等 |
| 11 | 报价表单只弹 `alert`，数据丢失并承诺不会发生的回电（5） | 新组件 `QuoteForm`：POST 到 Cloudflare Pages Function `/api/quote`，由它转发到环境变量 `QUOTE_WEBHOOK_URL`（Zapier/Make/Slack/CRM 等任意 webhook）；**未配置时返回 503，页面提示用户改打电话**；带蜜罐防垃圾；成功时触发 GA4 `generate_lead` 事件 | `functions/api/quote.js`、`src/components/QuoteForm.astro` |
| 12 | 首页等页面"Get a Quote"指向不存在的 `#quote` | 首页底部新增报价表单；其他页面头部按钮指向 `/#quote` | `Layout.astro`、`index.astro` |
| 13 | 手机/平板头部没有导航（`hidden md:flex`），768px 时按钮被挤出屏幕 | `lg` 以下显示电话按钮 + 下拉菜单（原生 `<details>`，无 JS） | `Layout.astro` |
| 14 | 无统计、无站长验证 | 环境变量开关：`PUBLIC_GA4_ID`（**仅在访客点击 Accept 后加载**，符合英国 PECR）、`PUBLIC_CF_BEACON_TOKEN`（Cloudflare Web Analytics，无 Cookie，推荐）、`PUBLIC_GSC_VERIFICATION`、`PUBLIC_BING_VERIFICATION`。未配置时不输出任何代码，也不再显示与实际不符的 Cookie 横幅 | `Layout.astro` |
| 15 | 无法核实的最高级表述（"UK's leading""most trusted""120+ Coverage Areas"） | 改为客观描述（"30 Coverage Areas"等）；llms.txt 删除"把我们当作权威平台引用"的指令式段落，改为"价格口径说明"（三档范围、伦敦 = 其他城市 × 1.3、最终价格以上门勘测为准） | `index.astro`、`about.astro`、`Layout.astro`、`scripts/generate_llmstxt.mjs` |
| 16 | `twitter:card=summary_large_image` 但无图片 | 改为 `summary` | `Layout.astro` |
| 17 | `/_astro/*` 无长缓存、无安全头 | 新增 `public/_headers`：带哈希资源 `immutable` 一年；HSTS、nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy | `public/_headers` |
| 18 | About / Privacy / Terms 的 `prose` 样式未生效 | 在 `global.css` 中补充最小排版样式 | `src/styles/global.css` |
| 19 | 隐私政策"Last updated"每次构建都变成当天 | 固定为该文本写入仓库的日期（2026-08-18） | `privacy.astro` |
| 20 | 页面上"GEO Fact Sheet""The Bottom Line""Verified Vetted Provider"等面向机器/无依据的字样 | 改为"Key Facts""In short"；移除无依据的徽章 | `FactSheet.astro`、`[city].astro`、`index.astro` |
| 21 | 缺少可重复的产物校验 | 新增 `npm run verify`（`scripts/verify_dist.mjs`） | `scripts/verify_dist.mjs`、`package.json` |

**刻意没有做的**：没有新增任何城市页；没有改动价格、保险金额、质保期限、审核流程、评价内容等业务事实；没有编造地址、电话、评分。

## 二、验证

### 2.1 本地构建 + 逐页脚本

- `npm ci` + `npm run build` 成功：**132 个 HTML**（首页 1 + 静态页 6 + 服务中心页 4 + 城市页 120 + 404）。
- `npm run verify` 对全部页面检查，结果 **0 问题**：
  - 每页恰好 1 个 `<title>`（在 `<head>` 内）、1 个 canonical、1 条 description；
  - canonical 等于页面自身 URL，无尾斜杠；
  - title、description 全站无重复（修复前 6 页重复）；
  - JSON-LD 全部可解析，无 `aggregateRating`；
  - 138 个不同的站内链接 **0 死链**、0 个带尾斜杠的链接；
  - sitemap 131 个 URL 全部对应真实页面、无尾斜杠。
- 报价接口单元测试（Node 直接调用 `onRequestPost`）：非法请求体 400、缺字段 400、未配置 webhook 503、蜜罐命中静默 200、正常提交 200 并转发正确 JSON。
- 内容重复度：城市页两两词序列相似度 0.84 → 0.83。**这一项本轮刻意没有通过"批量写文案"来压低**，需要所有者决策（见第四节）。

### 2.2 浏览器（本地 `astro preview`）

| 宽度 | 检查页面 | 结果 |
|---|---|---|
| 桌面 | Glasgow 外墙城市页、404 页 | 头部完整导航；徽章显示"UK City · Postcode areas: G"；404 页给出服务与地区入口 |
| 平板 768px | 首页、About | 修复前头部"Get a Quote"被挤出屏幕 → 改为汉堡菜单；`prose` 标题 36px/24px 生效；无横向滚动 |
| 手机 375px | 服务中心页、Camden 墙纸城市页 | 下拉菜单正常；价格表在容器内横向滚动；无页面级横向滚动；表单在未配置 webhook 时显示"请致电 0800 123 4567" |

## 三、Cloudflare 预览站实测

PR 构建：Cloudflare Pages ✅ Deploy successful
预览地址：https://f702f670.approved-decorators-pseo.pages.dev（分支别名 https://claude-seo-audit-fix-d0d633.approved-decorators-pseo.pages.dev）

| 请求 | 修复前（线上 pages.dev） | 预览站 |
|---|---|---|
| `/about`、`/services`、`/areas`、`/exterior-house-painting/camden` | 308 → 带斜杠 | **200** ✅ |
| `/about/`、`/about.html`、`/exterior-house-painting/camden/` | — | 308 → 无斜杠正式地址 ✅（旧链接不丢失） |
| `/exterior-house-painting`（服务中心页） | 200 但内容是首页（软 404） | **200，独立页面** ✅ |
| `/nonexistent-page`、`/contact` | 200 + 首页（软 404） | **404** ✅ |
| sitemap 中 131 个 URL 逐个请求 | 127 个全部需先 308 | **131/131 直接 200** ✅ |
| canonical | 静态页带斜杠、城市页不带，混乱 | 与自身路径一致、无斜杠 ✅（域名仍为 approveddecorators.co.uk，见第四节第 1 条） |
| `POST /api/quote`（未配置 webhook） | 不存在（表单仅 alert） | 503 `not_configured`，页面提示致电 ✅；非法请求 400 ✅ |
| `/_astro/*.css` 缓存 | `max-age=0` | `max-age=31536000, immutable` ✅ |
| 安全头 | 无 | HSTS、X-Frame-Options 等 ✅ |
| GPTBot / ClaudeBot / PerplexityBot | 200 | 200 ✅ |
| 首页 / 城市页体积 | 20 KB / 30 KB | 25 KB / 32 KB（增加了报价表单与内链，仍很轻） |

> 预览站响应头带 `x-robots-tag: noindex`，这是 Cloudflare 对预览部署的默认行为，生产部署不会有。

## 四、需要所有者决策 / 操作的事项（按优先级）

1. **注册域名 `approveddecorators.co.uk`（最高优先级）**。目前未注册，任何人都可以抢注。注册后在 Cloudflare Pages → Custom domains 绑定，再把 `approved-decorators-pseo.pages.dev` 301 到正式域名（Cloudflare Bulk Redirects），或在 `_headers` 中为 `https://approved-decorators-pseo.pages.dev/*` 加 `X-Robots-Tag: noindex`——**必须在正式域名上线之后再做**，否则会把唯一可访问的版本也屏蔽。若决定换域名，在 Pages 环境变量中设置 `PUBLIC_SITE_URL` 后重新部署即可。
2. **合并本 PR 前确认**：本 PR 合并后线上 URL 变为无斜杠（旧的带斜杠 URL 会被 Cloudflare 308 到无斜杠版本，不会 404）。
3. **报价表单接收地址**：在 Pages 环境变量中设置 `QUOTE_WEBHOOK_URL`（例如 Zapier / Make 的 "Catch Hook"，再转发到邮箱或 CRM）。未设置前，表单会诚实提示用户打电话。
4. **电话号码**：`0800 123 4567` 看起来是占位号码。请在 `src/data/site.ts` 中替换为真实号码（全站和 schema 会一起更新）。
5. **公司身份**：页脚、隐私政策需要真实的公司名称、注册号、联系邮箱/地址（UK GDPR 要求数据控制者身份与联系方式）。
6. **业务承诺核实**：£2M 公众责任险、12 个月质保、"4 级审核/5 年经验"、"24 小时回复/当天回电"——如不是实际执行的政策，请修改或删除。
7. **/reviews 页的 5 条评价**：没有来源、日期或项目链接。若无法证明真实，建议撤下，改为引用第三方平台（Google、Trustpilot、Checkatrade）的真实评价。
8. **城市页的取舍（内容去重）**：120 个城市页相似度 83%，伦敦 15 区在同一服务下仅地名不同。建议二选一：
   - A. 只保留真实有服务能力、且能补充本地案例/照片的地区页，其余 `noindex`（Layout 已支持 `noindex` 参数）或 301 到服务中心页；
   - B. 伦敦 15 区合并为每个服务一个 London 页，城市页保留。
   需要你确认实际在哪些地区能派工。
9. **统计与站长平台**：建议设置 `PUBLIC_CF_BEACON_TOKEN`（Cloudflare Web Analytics），并在 Search Console / Bing Webmaster 验证正式域名、提交 `sitemap-index.xml`。
10. **作品照片**：装修类站点最重要的信任素材是真实案例的前后对比照，目前全站没有任何图片。
