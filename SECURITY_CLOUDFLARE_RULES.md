# Cloudflare WAF & Anti-Bot Setup Guide for Portfolio

Follow these steps in your Cloudflare dashboard to implement Edge-level protection against scrapers, AI crawlers, and automated harvesters:

---

## 1. Enable Bot Fight Mode
1. Log in to **Cloudflare Dashboard** -> Select your domain.
2. Go to **Security** -> **Bots**.
3. Toggle **Bot Fight Mode** to **ON**.
4. *(If on Pro/Business)* Enable **Super Bot Fight Mode**:
   - **Definitely automated**: `Block`
   - **Likely automated**: `Managed Challenge`
   - **AI Scrapers and Crawlers**: `Block`

---

## 2. Cloudflare Custom WAF Rules

Go to **Security** -> **WAF** -> **Custom rules** -> Click **Create rule**:

### Rule A: Block AI Crawlers & Automated Harvesters
- **Rule Name**: `Block AI Scrapers and Harvesters`
- **Action**: `Block`
- **Expression**:
```text
(http.user_agent contains "GPTBot") or 
(http.user_agent contains "ChatGPT") or 
(http.user_agent contains "ClaudeBot") or 
(http.user_agent contains "anthropic-ai") or 
(http.user_agent contains "CCBot") or 
(http.user_agent contains "Google-Extended") or 
(http.user_agent contains "Applebot-Extended") or 
(http.user_agent contains "Bytespider") or 
(http.user_agent contains "PerplexityBot") or 
(http.user_agent contains "YouBot") or 
(http.user_agent contains "cohere-ai") or 
(http.user_agent contains "FacebookBot") or 
(http.user_agent contains "Meta-ExternalAgent") or 
(http.user_agent contains "Diffbot") or 
(http.user_agent contains "Scrapy") or 
(http.user_agent contains "AhrefsBot") or 
(http.user_agent contains "SemrushBot") or 
(http.user_agent eq "")
```

---

### Rule B: Managed Challenge for Suspicious Client Signatures
- **Rule Name**: `Challenge Low Reputation & Non-Browser Traffic`
- **Action**: `Managed Challenge`
- **Expression**:
```text
(cf.client.bot) or 
(cf.threat_score gt 20) or 
(not any(http.request.headers.names[*] == "accept-language") and not http.request.uri.path contains ".")
```

---

### Rule C: Block Scraping Cloud Data Center Networks (ASNs)
Scrapers typically execute from cloud VMs (AWS, DigitalOcean, OVH, Hetzner, etc.):
- **Rule Name**: `Block Hosting Provider Scraper Networks`
- **Action**: `Block` or `Managed Challenge`
- **Expression**:
```text
(ip.geoip.asnum in {16509 14618 14061 24940 16276 51167 396982})
```
*Note: 16509/14618 = Amazon AWS, 14061 = DigitalOcean, 24940 = Hetzner, 16276 = OVH.*

---

## 3. Cloudflare Rate Limiting Rules

Go to **Security** -> **WAF** -> **Rate limiting rules** -> **Create rule**:
- **Rule 1 (General Pages)**:
  - Match: `http.request.uri.path matches "^/"`
  - Limit: `30 requests per 1 minute`
  - Action: `Block (429)` or `Managed Challenge`
- **Rule 2 (Contact API)**:
  - Match: `http.request.uri.path eq "/api/contact"`
  - Limit: `5 requests per 1 minute`
  - Action: `Block (429)`
