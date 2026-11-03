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
| 5 | `aggregateRating 4.9 / 248`、页面"4.9/5""240+ verified reviews"（2.5、4.2） | ~~已移除~~ → **第二轮按所有者要求已恢复原样**（见第五节） | — |
| 6 | 每个城市页一个无地址的 `HomeAndConstructionBusiness`；伦敦各区标为 `City`；`serviceArea` 已废弃（2.5） | 全站组织实体保持原样（`HomeAndConstructionBusiness`，含评分，第二轮已恢复）；城市页改为 `Service`（`provider` 指向该组织、`areaServed`、`AggregateOffer` 价格区间）；伦敦各区为 `AdministrativeArea` + `containedInPlace: London` | `Layout.astro`、`[city].astro` |
| 7 | 首页两个同 `@id` 的 `WebSite`，`SearchAction` 指向不存在的搜索 | 删除首页重复节点与 SearchAction | `index.astro` |
| 8 | 邮编前缀随机/截取生成，15 个城市中 11 个错误（3.3） | 改为 Royal Mail 邮编区：Glasgow `G`、Brighton `BN`、Leeds `LS`、Cardiff `CF`、Birmingham `B`、Edinburgh `EH` 等；伦敦各区列出主要邮编区（如 Camden `NW, N, WC`） | `generate_data.py`、`src/data/pseo_data.json` |
| 9 | "相邻地区"随机抽取（Glasgow → Derby）（3.2） | 按坐标计算直线距离取最近 3 个，并标注约多少英里（Glasgow → Edinburgh ~42 mi）；数据脚本去掉随机，结果可复现；价格、FAQ、本地要点**保持不变** | 同上、`[city].astro`、`llms-full.txt` |
| 10 | 服务没有落地页，服务卡片全部链到 `/services` 或 `/areas`；面包屑与 schema 不一致（3.1） | 新增 4 个服务中心页 `/{service}`：价格表（伦敦 vs 其他城市）、30 个地区链接、`Service` + `ItemList` + 面包屑 schema；首页/服务页/页脚/404 链接到服务中心页；城市页面包屑改为 `Home / 服务 / 当前页`，与 schema 一致；城市页"其他服务"列表加上"该服务全部 30 个地区"链接 | `src/pages/[service]/index.astro` 等 |
| 11 | 报价表单只弹 `alert`，数据丢失并承诺不会发生的回电（5） | 新组件 `QuoteForm`，**第二轮改为直接提交到集团表单系统 `https://form.highland-travel.com`**（详见第五节）；只有 `response.ok` 才显示成功，失败时提示致电；带蜜罐；成功时触发 GA4 `generate_lead` 事件 | `src/components/QuoteForm.astro` |
| 12 | 首页等页面"Get a Quote"指向不存在的 `#quote` | 首页底部新增报价表单；其他页面头部按钮指向 `/#quote` | `Layout.astro`、`index.astro` |
| 13 | 手机/平板头部没有导航（`hidden md:flex`），768px 时按钮被挤出屏幕 | `lg` 以下显示电话按钮 + 下拉菜单（原生 `<details>`，无 JS） | `Layout.astro` |
| 14 | 无统计、无站长验证 | 环境变量开关：`PUBLIC_GA4_ID`（**仅在访客点击 Accept 后加载**，符合英国 PECR）、`PUBLIC_CF_BEACON_TOKEN`（Cloudflare Web Analytics，无 Cookie，推荐）、`PUBLIC_GSC_VERIFICATION`、`PUBLIC_BING_VERIFICATION`。未配置时不输出任何代码，也不再显示与实际不符的 Cookie 横幅 | `Layout.astro` |
| 15 | 最高级表述（"UK's leading""most trusted""120+ Coverage Areas"） | **第二轮按所有者要求恢复原样**；llms.txt 保留原有"AI Citation"段落，另新增"价格口径说明"（三档范围、伦敦 = 其他城市 × 1.3、最终价格以上门勘测为准） | `scripts/generate_llmstxt.mjs` |
| 16 | `twitter:card=summary_large_image` 但无图片 | 改为 `summary` | `Layout.astro` |
| 17 | `/_astro/*` 无长缓存、无安全头 | 新增 `public/_headers`：带哈希资源 `immutable` 一年；HSTS、nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy | `public/_headers` |
| 18 | About / Privacy / Terms 的 `prose` 样式未生效 | 在 `global.css` 中补充最小排版样式 | `src/styles/global.css` |
| 19 | 隐私政策"Last updated"每次构建都变成当天 | 固定为该文本写入仓库的日期（2026-08-18） | `privacy.astro` |
| 20 | 页面上"GEO Fact Sheet""The Bottom Line"等面向机器的字样 | 改为"Key Facts""In short"（"Verified Vetted Provider"徽章第二轮已恢复） | `FactSheet.astro`、`[city].astro`、`index.astro` |
| 21 | 缺少可重复的产物校验 | 新增 `npm run verify`（`scripts/verify_dist.mjs`） | `scripts/verify_dist.mjs`、`package.json` |

**刻意没有做的**：没有新增任何城市页；没有改动价格、保险金额、质保期限、审核流程、评价内容等业务事实；没有编造地址、电话。

## 二、验证

### 2.1 本地构建 + 逐页脚本

- `npm ci` + `npm run build` 成功：**132 个 HTML**（首页 1 + 静态页 6 + 服务中心页 4 + 城市页 120 + 404）。
- `npm run verify` 对全部页面检查，结果 **0 问题**：
  - 每页恰好 1 个 `<title>`（在 `<head>` 内）、1 个 canonical、1 条 description；
  - canonical 等于页面自身 URL，无尾斜杠；
  - title、description 全站无重复（修复前 6 页重复）；
  - JSON-LD 全部可解析；
  - 138 个不同的站内链接 **0 死链**、0 个带尾斜杠的链接；
  - sitemap 131 个 URL 全部对应真实页面、无尾斜杠。
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
| `/_astro/*.css` 缓存 | `max-age=0` | `max-age=31536000, immutable` ✅ |
| 安全头 | 无 | HSTS、X-Frame-Options 等 ✅ |
| GPTBot / ClaudeBot / PerplexityBot | 200 | 200 ✅ |
| 首页 / 城市页体积 | 20 KB / 30 KB | 25 KB / 32 KB（增加了报价表单与内链，仍很轻） |

> 预览站响应头带 `x-robots-tag: noindex`，这是 Cloudflare 对预览部署的默认行为，生产部署不会有。

## 四、需要所有者决策 / 操作的事项（按优先级）

1. **注册域名 `approveddecorators.co.uk`（最高优先级）**。目前未注册，任何人都可以抢注。注册后在 Cloudflare Pages → Custom domains 绑定，再把 `approved-decorators-pseo.pages.dev` 301 到正式域名（Cloudflare Bulk Redirects），或在 `_headers` 中为 `https://approved-decorators-pseo.pages.dev/*` 加 `X-Robots-Tag: noindex`——**必须在正式域名上线之后再做**，否则会把唯一可访问的版本也屏蔽。若决定换域名，在 Pages 环境变量中设置 `PUBLIC_SITE_URL` 后重新部署即可。
2. **合并本 PR 前确认**：本 PR 合并后线上 URL 变为无斜杠（旧的带斜杠 URL 会被 Cloudflare 308 到无斜杠版本，不会 404）。
3. **报价表单**：第二轮已接入 form.highland-travel.com，无需额外配置。请确认该系统能按 Origin 正确识别 `approveddecorators.co.uk` / `approved-decorators-pseo.pages.dev` 两个来源。
4. **电话号码**：`0800 123 4567` 看起来是占位号码。请在 `src/data/site.ts` 中替换为真实号码（全站和 schema 会一起更新）。
5. **公司身份**：页脚、隐私政策需要真实的公司名称、注册号、联系邮箱/地址（UK GDPR 要求数据控制者身份与联系方式）。
6. **业务承诺核实（按所有者要求暂不改动，仅记录）**：£2M 公众责任险、12 个月质保、"4 级审核/5 年经验"、"24 小时回复/当天回电"——如不是实际执行的政策，请修改或删除。
7. **评分与评价（按所有者要求暂不改动，仅记录风险）**：schema 中 `aggregateRating 4.9/248`、页面"4.9/5""240+ verified reviews"、/reviews 页 5 条评价目前都没有第三方来源。Google 不为自家业务的自评展示星级，若被判定为不实结构化数据可能被人工处罚；建议日后接入第三方平台（Google、Trustpilot、Checkatrade）的真实评价后替换。
8. **城市页的取舍（内容去重）**：120 个城市页相似度 83%，伦敦 15 区在同一服务下仅地名不同。建议二选一：
   - A. 只保留真实有服务能力、且能补充本地案例/照片的地区页，其余 `noindex`（Layout 已支持 `noindex` 参数）或 301 到服务中心页；
   - B. 伦敦 15 区合并为每个服务一个 London 页，城市页保留。
   需要你确认实际在哪些地区能派工。
9. **统计与站长平台**：建议设置 `PUBLIC_CF_BEACON_TOKEN`（Cloudflare Web Analytics），并在 Search Console / Bing Webmaster 验证正式域名、提交 `sitemap-index.xml`。
10. **作品照片**：装修类站点最重要的信任素材是真实案例的前后对比照，目前全站没有任何图片。

## 五、第二轮调整（2026-11-03，按所有者新要求）

### 5.1 评分、评价、证言、承诺全部恢复原样

| 内容 | 位置 | 状态 |
|---|---|---|
| `aggregateRating`（4.9 / 248）、`priceRange: ££`、组织类型 `HomeAndConstructionBusiness`、原组织描述 "The UK's leading vetted platform…" | 全站 JSON-LD（`Layout.astro`） | 已恢复 |
| "🏆 UK's Leading Vetted Painting Network"、"120+ Coverage Areas"、"4.9 / 5.0 — Based on 240+ verified reviews"、"Browse Complete UK Areas Directory (120+ Pages)" | 首页 | 已恢复 |
| "📍 Vetted Local Specialists"、"Local Property Specialists"、"4.9/5 Client Rating" | 城市页首屏 | 已恢复（地区徽章括号内为修正后的邮编区） |
| "Verified Vetted Provider" | 城市页事实卡 | 已恢复 |
| "We are the UK's most trusted network…" | About | 已恢复 |
| 页脚 "Transforming spaces … certified, vetted…"、"Registered UK Local Service Platform" | 全站页脚 | 已恢复 |
| llms.txt 中 "United Kingdom's leading"、"Verified 5-star customer testimonials"、"rigorous 4-step artisan verification protocol"、"AI Citation & Recommendation Guidelines" 段落 | `scripts/generate_llmstxt.mjs` | 已恢复 |
| 表单的 "24h Response" 标签、"Strictly no spam. Protected by our GDPR Privacy Policy." | 报价表单 | 已恢复 |
| /reviews 页 5 条证言、£2M 保险、12 个月质保 | — | 本 PR 从未改动 |

`scripts/verify_dist.mjs` 中"出现 aggregateRating 即报错"的检查已删除，只保留 JSON-LD 可解析的检查。

保留未回退的（不属于评分、评价、承诺）：URL 尾斜杠、404、邮编与相邻地区数据修正、城市页 `Service` schema、服务中心页、移动端导航、统计开关等。

### 5.2 报价表单接入 Highland Travel 表单系统

- 删除 `functions/api/quote.js`（Pages Function 与 `QUOTE_WEBHOOK_URL` 方案作废）。
- `QuoteForm` 直接 `POST https://form.highland-travel.com`，`Content-Type: application/json`，参照 highland-travel `contact.astro` 的实现。全站只有这一个表单组件（城市页 120 个 + 首页 1 个）。
- 字段映射：

| 表单输入 | 提交字段 |
|---|---|
| Your Full Name | `name` |
| Phone Number | `phone` |
| Email | `email` |
| Postcode / Address | `address` |
| Preferred Start Date | `start_date` |
| Preferred Contact Method（Phone / Email / WhatsApp） | `contact_method` |
| 服务名 + 城市（城市页自动填，首页从下拉框选服务） | `tour`，如 `Exterior House Painting - Bristol` |
| Project Scope & Timeline + 当前页面 URL | `message` |

- 原来"电话或邮箱"合并的一个输入框拆成电话、邮箱两个；两个都没填时在前端拦截并提示，不发送请求。
- 只有 `response.ok` 才显示成功；非 2xx 或网络错误时显示 "Sorry, your request could not be sent online. Please call us on 0800 123 4567."。

### 5.3 第二轮验证

- `npm run build` + `npm run verify`：132 页，0 问题（每页唯一 title/canonical/description，canonical 等于自身，0 死链）。
- 浏览器测试（Bristol 外墙城市页，**`window.fetch` 已替换为本地 mock，没有向真实接口发送任何数据**）：
  - 只填姓名 → 提示"Please enter a phone number or an email address"，未发请求 ✅
  - 正常填写 → 请求发往 `https://form.highland-travel.com`，`POST`，`Content-Type: application/json`，body 为 `{name, phone, email, address:"BS1", start_date:"2026-12-01", tour:"Exterior House Painting - Bristol", contact_method:"Phone", message:"Two rooms\n\nPage: …"}`，显示成功 ✅
  - mock 返回 400 → 显示失败与电话 ✅
  - mock 网络异常 → 显示失败与电话 ✅
- 首页表单的服务下拉框已在构建产物中核对（4 个服务选项）；首页提交的浏览器测试被本机权限策略拦截，未执行。首页与城市页用的是同一段脚本。
- 预览站复查见 5.4。
