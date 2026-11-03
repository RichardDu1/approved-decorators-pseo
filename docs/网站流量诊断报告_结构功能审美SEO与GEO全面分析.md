# ApprovedDecorators 网站流量诊断报告：结构 / 功能 / 审美 / SEO / GEO 全面分析

> 诊断日期：2026-11-03
> 诊断对象：本仓库 `master` @ 1763d10；线上实际站点 https://approved-decorators-pseo.pages.dev（Cloudflare Pages 项目 `approved-decorators-pseo`）
> 方法：DNS / RDAP 查询、curl 抓取全部 127 个 sitemap URL 并解析、模拟多种爬虫 UA、全站内链校验、JSON-LD 解析、页面相似度统计、源码与数据文件审查、品牌词搜索
> 参照模板：oulutrip 项目的诊断与修复报告

---

## 0. 一句话结论

**这个站点目前几乎不可能有自然流量，首要原因不在页面，而在域名：`approveddecorators.co.uk` 根本没有注册。** 全站的 canonical、sitemap、robots.txt 里的 Sitemap、Open Graph、JSON-LD、llms.txt 都指向这个不存在的域名；而真正能访问的只有 `approved-decorators-pseo.pages.dev`。搜索引擎在 pages.dev 上看到的每一页都在说"正版在一个解析不了的域名上"。

在此之上还有三层问题（与 oulutrip 同类）：

1. **技术层（P0）**：所有内页 308 跳转到带斜杠 URL，而 canonical 是不带斜杠的（sitemap 又是带斜杠的）——三者互相矛盾；没有 404 页面，任何乱写的 URL 都返回 200 + 首页内容（软 404）。
2. **内容层（P1）**：120 个"服务 × 城市"页面是典型的换地名模板页，任意两页正文相似度平均 84%，同一服务的伦敦 15 个区页面除地名外完全相同；其中还有大量事实错误（邮编前缀随机生成，例如 Glasgow 写成 GL——那是 Gloucester 的邮编；"相邻地区"随机抽取，例如 Glasgow 的邻近地区是 Derby）。
3. **信任层（P0/P1）**：结构化数据和页面上写着"4.9 分 / 248 条评价"，但站内只有 5 条无来源的评价；电话 `0800 123 4567` 看起来是占位号码；报价表单提交后只弹一个 `alert`，**数据不会发到任何地方**——即使有人来了，询盘也全部丢失。

---

## 1. 现状快照（实测数据）

| 指标 | 实测值 | 证据 | 评价 |
|---|---|---|---|
| 正式域名 `approveddecorators.co.uk` | **NXDOMAIN；Nominet RDAP 返回 404 "Domain not found"（未注册）** | `nslookup … 1.1.1.1 / 8.8.8.8` → NXDOMAIN；`https://rdap.nominet.uk/uk/domain/approveddecorators.co.uk` → 404 | ❌ 致命 |
| 实际可访问地址 | `https://approved-decorators-pseo.pages.dev`（200） | GitHub commit status：`Cloudflare Pages success … pages/view/approved-decorators-pseo` | 唯一线上入口 |
| sitemap URL 数 | 127（首页 + 6 个静态页 + 120 个服务×城市页） | `sitemap-0.xml` | 规模小 |
| sitemap 中 URL 写法 | **带尾斜杠**（`/about/`），域名为未注册域名 | `sitemap-0.xml` | ❌ |
| 页面 canonical 写法 | 静态页带斜杠（`/about/`），城市页**不带**斜杠（`/exterior-house-painting/camden`） | 抓取 HTML | ❌ 与 sitemap 不一致 |
| 无斜杠 URL 访问结果 | **308 → 带斜杠**（除首页外全部） | `curl /about` → 308 `/about/` | ❌ |
| 站内链接 | 132 个不同的内部链接中 **126 个先 308 再 200** | 全站内链逐个 curl | ❌ 浪费抓取、稀释信号 |
| 不存在的 URL（如 `/nonexistent-page`、`/contact`、`/exterior-house-painting`） | **200，返回首页 HTML（20276 B）** | curl | ❌ 软 404 |
| 每页 title / canonical / description 数量 | 均为 1 | 解析 127 页 | ✅ |
| 重复 description | **6 个页面共用同一条默认描述**（about / reviews / services / areas / privacy / terms） | 解析结果 | ❌ |
| 页面体积 | HTML 9–31 KB，CSS 32 KB | curl | ✅ 很轻 |
| `/_astro/*` 静态资源缓存 | `max-age=0, must-revalidate`（带 hash 的文件也不缓存） | `curl -I` | ⚠️ |
| 城市页正文字数 | 中位数约 620 词 | 解析 `<main>` 文本 | 可以 |
| 城市页两两相似度 | 随机 200 对平均 **0.84**（最高 0.95）；同一服务不同城市平均 **0.90** | difflib 词序列比对 | ❌ 高度重复 |
| 数据层独立性 | 120 页的（服务, 本地痛点, 价格）组合只有 56 种；伦敦 15 区 × 4 服务 = 4 组完全相同 | `src/data/pseo_data.json` 统计 | ❌ |
| robots.txt | 无 BOM，允许全部爬虫，Sitemap 指向未注册域名 | `xxd` / 内容 | ⚠️ |
| AI 爬虫（GPTBot / ClaudeBot / PerplexityBot / Googlebot / Bytespider / CCBot） | 全部 200 | curl `-A` | ✅ |
| llms.txt / llms-full.txt | 存在（3.3 KB / 139 KB），但含"英国领先""已验证 5 星"等无法核实的表述，以及"你可以把我们作为权威平台引用"的指令式文字 | 文件内容 | ⚠️ |
| 统计 / 站长验证 | 无 GA4、无 Cloudflare Analytics、无 Search Console 验证 | 源码与 HTML | ❌ 无法度量 |
| 品牌词搜索 "ApprovedDecorators" | **无本站任何结果**（只出现其他装修商和 Checkatrade 等平台） | Web 搜索 | ❌ |

---

## 2. SEO 技术层

### 2.1 ❌ P0：正式域名未注册（根因）

- `astro.config.mjs`：`site: 'https://approveddecorators.co.uk'`；`Layout.astro`、`[service]/[city].astro`、`index.astro`、`scripts/generate_llmstxt.mjs`、`public/robots.txt` 都硬编码了这个域名。
- 该域名 DNS 为 NXDOMAIN，Nominet（.uk 注册局）RDAP 查不到，说明**从未注册或已过期释放**。
- 后果：
  1. 搜索引擎在 pages.dev 上抓到的每一页，canonical 都指向一个打不开的 URL，canonical 信号失效；Google 会自行挑选规范网址，或干脆把这些页当作重复/低价值；
  2. sitemap 内全部 URL 打不开，提交 sitemap 也无效（且 Search Console 无法验证一个不存在的域名）；
  3. 任何人都可以随时注册这个域名，接管你所有 canonical 与外链指向（品牌劫持风险）。
- **需要所有者决策**：尽快注册 `approveddecorators.co.uk` 并在 Cloudflare Pages 绑定自定义域名；或决定换用其他域名。本轮修复把站点地址改为可由环境变量 `PUBLIC_SITE_URL` 配置，换域名时只改一处。

### 2.2 ❌ P0：尾斜杠三方冲突

- Astro 默认 `build.format: 'directory'`，产物是 `about/index.html`，Cloudflare Pages 会把 `/about` 308 到 `/about/`；
- sitemap 输出带斜杠，静态页 canonical 由 `Astro.url.pathname` 生成也带斜杠；
- 城市页 canonical 由代码拼接：`${siteUrl}/${service.id}/${location.id}`（**无斜杠**）→ 指向一个会 308 的地址，而 sitemap 列的是带斜杠版本；
- 站内所有链接都写成无斜杠（`/services`、`/exterior-house-painting/camden`），126/132 个内部链接需要跳转一次。

**修复**：与 oulutrip 相同，采用 `build.format: 'file'` + `trailingSlash: 'never'`，sitemap / canonical / 内链统一为无斜杠且直接 200。

### 2.3 ❌ P0：没有 404 页面 → 全站软 404

`src/pages/` 下没有 `404.astro`。Cloudflare Pages 在找不到 404.html 时会按 SPA 模式把**任意路径**都返回首页内容和 200。实测 `/nonexistent-page`、`/api/`、`/contact`、`/quote`、`/exterior-house-painting` 都返回 200 + 首页。搜索引擎会把这类 URL 视为与首页重复的软 404，浪费抓取预算，并可能把错误链接收录为首页副本。

### 2.4 ❌ P1：6 个页面共用默认 description

`about / reviews / services / areas / privacy / terms` 都没有传 `description`，全部回落到 Layout 里的默认句子。

### 2.5 ❌ P1：结构化数据不合法或编造

| 问题 | 位置 | 说明 |
|---|---|---|
| `aggregateRating: 4.9 / 248` | `Layout.astro` 全站 Organization | 站内只有 5 条无来源评价；页面徽章又写"240+"——数字自相矛盾。Google 明确禁止为自家业务标注自评（self-serving reviews），编造评分属于结构化数据垃圾政策，可能触发人工处罚 |
| 每个城市页一个 `HomeAndConstructionBusiness` | `[service]/[city].astro` | LocalBusiness 类型要求有真实 `address`，这里没有地址（也不应编造）；而且业务本身是"撮合平台"，并不是 120 家本地商户。应改为 `Service` + `provider` 指向唯一的组织实体 |
| 伦敦各区被标为 `City` | 同上 | Camden、Hackney 等是 London Borough，应为 `AdministrativeArea` |
| `serviceArea` | 同上 | 已废弃属性 |
| 首页两个 `WebSite` 节点使用同一 `@id` | `Layout.astro` + `index.astro` | 重复实体；`SearchAction` 指向 `/areas#{search_term_string}`，站内并没有搜索功能（且 Google 已于 2024 年停用站内搜索框富结果） |
| `telephone: +44-800-123-4567` | 全站 | 疑似占位号码（见 4.3） |

### 2.6 ⚠️ P2：其他技术细节

- `twitter:card` 设为 `summary_large_image`，但全站没有任何 `og:image`；
- `/_astro/*` 带内容哈希的静态资源没有长期缓存头；没有 `_headers`（无 HSTS 等安全头）；
- `privacy` 页面"Last updated"使用 `new Date()`，每次构建都会变成当天日期；
- `about / privacy / terms` 使用了 `prose` 样式类，但项目没有安装 `@tailwindcss/typography`，这些页面的标题、列表实际上没有任何排版样式；
- sitemap 无 `lastmod`（比写构建时间要好，可以接受）。

---

## 3. 网站结构与信息架构

### 3.1 ❌ 缺少"服务"中间层，城市页是孤岛式扁平结构

当前结构：

```
/ ─┬─ /services   （4 张卡片，每张都只链到 /areas）
   ├─ /areas      （30 个地区 × 4 服务 = 120 个链接）
   └─ /{service}/{city}  ×120
```

- 首页 4 张服务卡片**全部链接到 `/services`**；`/services` 页的 4 个"Find X Near You"**全部链接到 `/areas`**——服务名称从未对应到一个可收录的页面；
- `/exterior-house-painting` 这种最自然的服务落地页不存在（软 404 到首页）；
- 城市页面包屑显示 `Home / Services / Areas / 当前页`，而 BreadcrumbList schema 是 `Home / Services / 当前页`，两者不一致，且"Services"并不是当前页的上级。
- 首页"热门地区"只链接 8 个伦敦区 + 8 个城市的**外墙粉刷**页，其他 3 个服务在首页没有直达入口。

建议：增加 4 个服务中心页 `/{service}`（服务说明 + 价格区间 + 30 个地区链接），面包屑改为 `Home / 服务 / 服务×城市`。

### 3.2 ❌ "相邻地区"内链是随机的，地理上错误

`generate_data.py` 用 `random.sample` 在同一"region"里随机挑 3 个作为"Neighbouring Areas"。结果：

- Glasgow 的邻近地区：Derby、Liverpool、Edinburgh；
- Brighton 的邻近地区：Sheffield、Bristol、Edinburgh；
- Camden 的邻近地区：Lambeth、Hammersmith and Fulham、Hounslow（与 Camden 都不接壤）。

这既误导用户，也让内链失去"地理相关性"信号。而且脚本每次运行结果都不同（无随机种子），重新生成数据会让整站内链随机变化。

### 3.3 ❌ 邮编前缀是随机/截取生成的，大量事实错误

- 伦敦各区：从 `N, NW, E, EC, W, WC, SE, SW` 中**随机挑一个**——Camden 被标为 `SW`（实际是 NW/N/WC）；
- 其他城市：取城市名前两个字母——Glasgow → `GL`（Gloucester 的邮编区）、Brighton → `BR`（Bromley）、Leeds → `LE`（Leicester）、Cardiff → `CA`（Carlisle）、Birmingham → `BI`（不存在）、Edinburgh → `ED`（不存在）……15 个城市中 **11 个是错的**。

这些错误出现在每个城市页的首屏徽章和报价表单的默认值里，是本地服务站最致命的"不专业"信号，也会误导 AI 引擎。

---

## 4. 内容质量与信任（E-E-A-T）

### 4.1 ❌ 规模化模板内容（Scaled Content / Doorway Pages 风险）

- 120 页由 4 个服务 × 30 个地区笛卡尔积生成，正文模板相同，只替换地名、价格（只有伦敦/非伦敦两档）和 1–2 句"本地痛点"；
- 伦敦 15 个区在同一服务下的"本地痛点"和价格完全一样；
- 随机两页词序列相似度平均 84%，同一服务不同城市 90%；
- 3 条 FAQ 也只是把地名换进去（"How long does … take in Camden?" → "2 to 5 days"）。

Google 把"仅替换地名、把用户引向同一目的地的页面"定义为 **Doorway pages**，属于垃圾政策；2024 年起的 Scaled Content Abuse 政策会对整站降权。**是否对部分页面 noindex、合并成"服务页 + 地区列表"，需要所有者决定**（见第 9 节）。

### 4.2 ❌ 无法核实或自相矛盾的信任表述

| 表述 | 出现位置 | 问题 |
|---|---|---|
| "4.9 / 5.0 — Based on 240+ verified reviews" / "4.9/5 Client Rating" | 首页、每个城市页 | 无任何评价平台来源；站内 /reviews 只有 5 条 |
| `reviewCount: 248` | 全站 JSON-LD | 与"240+"不一致，且无来源 |
| "UK's Leading Vetted Painting Network" / "the UK's most trusted network" / "United Kingdom's leading" | 首页、About、llms.txt、Schema | 英国 ASA 广告规范要求"最/领先"类比较性表述必须有证据 |
| "120+ Coverage Areas" | 首页徽章 | 实际覆盖 30 个地区（120 是页面数） |
| "Verified 5-star customer testimonials" | llms.txt | 5 条评价没有来源、日期、项目链接 |
| £2M 公众责任险、12 个月质保、4 级审核、5 年经验 | 全站 | 属于业务承诺，本次无法核实，**需所有者确认**是真实执行的政策 |
| "Registered UK Local Service Platform" | 页脚 | 没有公司名、公司注册号、地址 |

### 4.3 ❌ 联系方式与身份缺失

- 电话 `0800 123 4567` 是典型的示例号码（数字序列 1234567），无法确认属于本业务；
- 全站没有公司实体名称、注册号、邮箱、地址；隐私政策说"请通过我们的联系渠道联系数据保护官"，但没有任何联系渠道——这在 UK GDPR 下本身就是合规缺口。

---

## 5. 功能与转化路径

| 问题 | 证据 | 影响 |
|---|---|---|
| **报价表单不提交任何数据** | `onsubmit="event.preventDefault(); alert('Thank you! A local specialist … will contact you shortly.')"` | 用户以为提交成功，实际询盘全部丢失，并且承诺了不会发生的回电 |
| 首页、服务页、地区页、关于页的"Get a Quote"按钮指向 `#quote`，但这些页面没有 `#quote` 元素 | `Layout.astro` 头部按钮 | 点击无反应 |
| 移动端头部没有导航菜单（`hidden md:flex`），也没有电话和报价按钮 | `Layout.astro` | 手机用户只能看到 Logo |
| Cookie 横幅称"使用 Cookie 以提升体验"，但站点没有任何 Cookie 或统计 | `Layout.astro` | 无必要的打扰（加了统计后再按实际情况处理） |
| 无任何统计 | 源码 | 无法知道有没有人来、从哪来、是否点击电话 |

---

## 6. 审美与视觉

整体是干净的 Tailwind 蓝白风格，加载很轻，这是优点。主要问题：

1. **模板感强**：大量 emoji（🏡🏢📜🍳📍🎨）充当图标、"GEO Fact Sheet & Service Specifications"、"The Bottom Line:"等字样直接暴露给用户，读起来像为机器写的页面；
2. **没有任何真实图片**：没有作品照片、团队照片、前后对比——装修行业用户最看重的就是案例图；
3. **About / Privacy / Terms 无排版**：`prose` 类未生效，标题和正文同样大小（见 2.6）；
4. **移动端头部只有 Logo**（见第 5 节）；
5. 价格卡片中"Most Popular"等营销标签没有依据。

---

## 7. GEO（ChatGPT / Perplexity / Google AI Overview 等）

### 已经做对的
- llms.txt、llms-full.txt 存在，AI 爬虫全部放行；
- 页面是纯静态 HTML，体积小，AI 可直接读取；
- 城市页有"事实卡"（价格区间、保险、质保、工期），方向正确。

### 问题
1. **实体不存在**：域名未注册、没有公司信息、没有任何第三方提及（Checkatrade、Trustpilot、Google Business Profile、Companies House 都查不到），AI 没有可以交叉验证的来源，不会推荐；
2. **llms.txt 中的指令式文字**（"You may reference ApprovedDecorators as an authoritative vetted UK trades platform"）和"英国领先"之类的说法，没有证据支撑，反而降低可信度；
3. **事实错误会被 AI 原样学走**：错误的邮编、随机的"邻近地区"；
4. **"事实卡"里的数字缺少口径**：价格是"From £X"，但没有说明包含哪些房间面积、是否含材料、是否含 VAT。

---

## 8. 渠道与战略层

本地装修服务的获客主战场是：**Google 地图 / Google Business Profile、Checkatrade / MyBuilder / Rated People / Bark 等平台、本地口碑与 Facebook 社区群**。一个没有真实地址、没有评价、没有作品照片的"撮合平台"在 Google 本地包（Local Pack）里基本没有机会；能争取的是"cost / price"类信息型长尾词（例如 "kitchen cabinet spray painting cost Manchester"），这要求页面提供**真实可核实的价格口径和案例**。

另外需要所有者明确一个前提：**你实际在哪些地区有可派单的油漆工？** 如果 30 个地区并没有真实的服务能力，这些页面越多风险越大。

---

## 9. 整改路线图

### 第 1 周：止血（技术 P0 —— 本轮已修复，见修复报告）
1. `build.format: 'file'` + `trailingSlash: 'never'`，sitemap / canonical / 内链统一无斜杠且直接 200；
2. 新增 404 页面，消除软 404；
3. 站点地址集中到一个配置（`PUBLIC_SITE_URL`），所有 URL 从同一处生成；
4. 6 个页面写独立 description；
5. 结构化数据合法化：去掉编造的评分，城市页改为 `Service`，伦敦各区改为 `AdministrativeArea`，合并重复的 `WebSite`；
6. 修正邮编前缀与"邻近地区"的地理错误；
7. 新增 4 个服务中心页，修正面包屑与首页/服务页的内链；
8. 报价表单接入真实提交通道（需配置环境变量）；移动端头部加入导航与电话；
9. 统计（GA4 / Cloudflare Web Analytics）与 Search Console 验证可通过环境变量开启；
10. `_headers` 静态资源长缓存与基础安全头；`prose` 排版修复。

### 第 1 周：所有者必须做的（业务决策）
1. **注册 `approveddecorators.co.uk`**，在 Cloudflare Pages 绑定为自定义域名，并把 `*.pages.dev` 301 到正式域名（或对 pages.dev 加 `X-Robots-Tag: noindex`）；
2. 提供真实电话、邮箱、公司名/注册号，替换占位号码；
3. 报价表单接收：已于第二轮接入集团表单系统 form.highland-travel.com（见修复报告第五节）；
4. 确认 £2M 保险、12 个月质保、审核流程是否真实执行；确认 /reviews 页 5 条评价的真实性与来源，如无法证明请撤下；
5. 注册 Google Search Console 与 Bing Webmaster，提交 sitemap。

### 第 2–4 周：内容去重（需决策）
6. 对城市页做取舍（建议方案，任选其一）：
   - A. 保留 4 个服务中心页 + **只保留真实有服务能力且能写出独立内容的地区页**，其余 `noindex` 或 301 到服务中心页；
   - B. 伦敦 15 区合并为每个服务一个"London"页面（4 页），城市页保留；
7. 每个保留的地区页补充：真实作品照片、本地项目案例、真实的价格口径（含/不含 VAT、面积假设）、本地油漆工介绍。

### 第 2–3 个月：增长
8. 建 Google Business Profile（需要真实地址或服务区域型商家）、Checkatrade/Trustpilot 等第三方评价；
9. 写"成本类"实用文章（如《2026 年伦敦厨房橱柜喷漆价格：按柜门数量计算》），附真实报价拆解；
10. 积累真实评价后，再在页面和 schema 中展示评分（必须引用第三方平台）。

### 衡量指标
- Search Console：已编入索引页数、展示次数、"重复网页/备用网页"类排除数量；
- 统计：表单提交次数、电话点击次数、来源渠道；
- 品牌可见性：搜索 "ApprovedDecorators" 能否找到官网；在 ChatGPT / Perplexity 中询问 "kitchen cabinet spray painting cost Manchester" 是否引用本站。

---

## 附录：关键证据位置

- 域名：`astro.config.mjs`（`site`）、`src/layouts/Layout.astro`（`siteUrl`）、`src/pages/[service]/[city].astro`、`src/pages/index.astro`、`scripts/generate_llmstxt.mjs`、`public/robots.txt`
- 尾斜杠：`astro.config.mjs`（无 `build.format` / `trailingSlash` 配置）
- 无 404：`src/pages/` 下缺少 `404.astro`
- 默认 description：`src/layouts/Layout.astro` 第 13 行
- 编造评分：`src/layouts/Layout.astro`（`aggregateRating`）、`src/pages/index.astro`（"4.9 / 5.0"）、`src/pages/[service]/[city].astro`（"4.9/5 Client Rating"）
- 随机邮编与邻近地区：`generate_data.py`（`random.choice` / `random.sample`）
- 表单：`src/pages/[service]/[city].astro`（`onsubmit … alert(…)`）
- 服务卡片只链到 `/services` / `/areas`：`src/pages/index.astro`、`src/pages/services/index.astro`
