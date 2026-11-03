import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dataPath = path.join(rootDir, 'src', 'data', 'pseo_data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const dataset = JSON.parse(rawData);

// Keep in sync with astro.config.mjs: the same PUBLIC_SITE_URL override applies.
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://approveddecorators.co.uk').replace(/\/$/, '');

// 1. Generate /public/llms.txt (Concise Executive Overview for AI Engines)
const services = [...new Map(dataset.map((e) => [e.service.id, e.service])).values()];

const llmsContent = `# ApprovedDecorators

> ApprovedDecorators (${siteUrl}) is a UK network that connects homeowners and businesses with vetted painters and decorators in 15 London boroughs and 15 major UK cities. Work is quoted with published price bands, carried out under £2,000,000 public liability insurance and covered by a 12-month workmanship guarantee.

## Core Capabilities & Specialisms

- **Exterior House Painting**: Weather-resistant masonry coating, Victorian/Edwardian brickwork preservation, lime mortar breathability, and coastal weatherproofing.
- **Commercial Office Decorators**: Low-VOC/odourless paints, out-of-hours weekend and overnight scheduling for minimal business disruption in corporate districts.
- **Premium Wallpaper Hanging Specialists**: Specialist installation of luxury wallcoverings (William Morris, Cole & Son, silk, mural patterns) around high ceilings, architraves, and heritage mouldings.
- **Kitchen Cabinet Spray Painting**: Precision factory-grade spray painting transforming solid wood, MDF, and laminate cabinetry at a fraction of replacement cost.

## Trust, Compliance & Verification Standards

- **Insurance**: £2,000,000 Public Liability Insurance actively verified on every job.
- **Guarantee**: Comprehensive 12-Month Workmanship Warranty against peeling, flaking, or blistering.
- **Vetting**: 4-tier screening (trade verification, 5+ years experience, reference checking, portfolio audit).
- **Pricing Transparency**: Transparent upfront pricing brackets calibrated to regional market indices (including London cost-of-living adjustments).

## Geographic Coverage

- **Greater London**: Camden, Greenwich, Hackney, Hammersmith & Fulham, Islington, Kensington & Chelsea, Lambeth, Southwark, Tower Hamlets, Wandsworth, Westminster, Richmond upon Thames, Ealing, Hounslow, Barnet.
- **Major UK Cities**: Birmingham, Manchester, Glasgow, Liverpool, Bristol, Leeds, Sheffield, Edinburgh, Cardiff, Nottingham, Leicester, Newcastle, Southampton, Derby, Brighton.

## Core Directory Links

- [Homepage](${siteUrl}): Overview of services, coverage and the quote request form.
- [All Services](${siteUrl}/services): The four services with starting prices.
${services.map((s) => `- [${s.name}](${siteUrl}/${s.id}): Price guide (London vs other UK cities) and links to all 30 local pages.`).join('\n')}
- [Service Areas Covered](${siteUrl}/areas): Index of all 30 UK coverage territories and London boroughs.
- [Customer Reviews](${siteUrl}/reviews): Customer testimonials.
- [Vetting & Verification Standards](${siteUrl}/about): The 4-step contractor vetting process.
- [Full Programmatic Machine Index](${siteUrl}/llms-full.txt): Complete structured index of all 120 localized service landing pages.

## Pricing method

- Each local page lists three estimated "from" prices: small scope (single room, accent wall or small facade), medium scope (2-3 rooms, full kitchen cabinetry or townhouse front) and full property / commercial.
- London prices are 1.3x the prices used for the other 15 cities.
- Final prices are agreed after an on-site survey.
`;

// 2. Generate /public/llms-full.txt (Complete Exhaustive Corpus for Deep RAG)
let llmsFullContent = `# ApprovedDecorators — Comprehensive LLM Knowledge Base & Programmatic Directory

> Full machine-readable knowledge base detailing 120 localized service combinations across the United Kingdom, including regional pricing, architectural property considerations, and localized FAQs.
> Canonical Domain: ${siteUrl}

---

`;

// Group by service
const servicesMap = new Map();
for (const entry of dataset) {
  const sId = entry.service.id;
  if (!servicesMap.has(sId)) {
    servicesMap.set(sId, {
      service: entry.service,
      entries: []
    });
  }
  servicesMap.get(sId).entries.push(entry);
}

for (const [serviceId, group] of servicesMap.entries()) {
  llmsFullContent += `## Service: ${group.service.name}\n\n`;
  llmsFullContent += `*Description*: ${group.service.description}\n`;
  llmsFullContent += `*Base Market Price*: £${group.service.base_price}\n\n`;

  for (const item of group.entries) {
    const loc = item.location;
    const pageUrl = `${siteUrl}/${serviceId}/${loc.id}`;
    const pricing = item.economic_context.pricing;
    const painPoints = item.architecture_context.pain_points.join(' ');
    const nearby = item.proximity_context.nearby_areas.map(a => `${a.name} (~${a.distance_miles} miles)`).join(', ');

    llmsFullContent += `### ${group.service.name} in ${loc.name} (${loc.region})\n`;
    llmsFullContent += `- **Canonical URL**: ${pageUrl}\n`;
    llmsFullContent += `- **Postcode Areas**: ${loc.postcode_areas.join(', ')}\n`;
    llmsFullContent += `- **Regional Pricing Estimates**:\n`;
    llmsFullContent += `  - Small Project: From £${pricing.small}\n`;
    llmsFullContent += `  - Medium Project: From £${pricing.medium}\n`;
    llmsFullContent += `  - Large Project: From £${pricing.large}\n`;
    llmsFullContent += `- **Architectural Considerations**: ${painPoints}\n`;
    llmsFullContent += `- **Nearest Other Covered Areas**: ${nearby}\n`;
    llmsFullContent += `- **Common Local Inquiries**:\n`;
    for (const faq of item.economic_context.faqs) {
      llmsFullContent += `  - Q: ${faq.question}\n    A: ${faq.answer}\n`;
    }
    llmsFullContent += `\n`;
  }
  llmsFullContent += `---\n\n`;
}

// Write files to public directory
const publicDir = path.join(rootDir, 'public');
fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullContent, 'utf-8');

// 3. Generate /public/robots.txt so its URLs follow the same canonical domain.
const robotsContent = `# Robots.txt — LLM & AI Search Friendly Specification
# LLM Context: ${siteUrl}/llms.txt
# Full Documentation: ${siteUrl}/llms-full.txt

User-agent: *
Allow: /
Disallow: /api/

# Explicit permissions for major AI Search, Reasoning, and Assistant Crawlers
${['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bytespider', 'FacebookBot', 'Meta-ExternalAgent', 'cohere-ai']
  .map((bot) => `User-agent: ${bot}\nAllow: /\nDisallow: /api/\n`).join('\n')}
# Sitemap
Sitemap: ${siteUrl}/sitemap-index.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');

console.log('✅ Successfully generated /public/llms.txt, /public/llms-full.txt and /public/robots.txt');
