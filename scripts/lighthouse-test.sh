#!/bin/bash
# Lighthouse Performance Test
# Usage: ./scripts/lighthouse-test.sh [url]

URL=${1:-"http://localhost:3001"}
REPORT_PATH=".planning/lighthouse-$(date +%Y%m%d-%H%M%S)"

echo "🔍 Running Lighthouse audit on $URL..."

lighthouse "$URL" \
  --output=json \
  --output=html \
  --output-path="$REPORT_PATH" \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices \
  2>/dev/null

if [ -f "${REPORT_PATH}.report.json" ]; then
  echo ""
  echo "📊 Results:"
  python3 -c "
import json
with open('${REPORT_PATH}.report.json') as f:
    data = json.load(f)
    cats = data['categories']
    print(f\"  Performance:    {int(cats['performance']['score'] * 100)}%\")
    print(f\"  Accessibility:  {int(cats['accessibility']['score'] * 100)}%\")
    print(f\"  Best Practices: {int(cats['best-practices']['score'] * 100)}%\")

    audits = data['audits']
    print()
    print('  Core Web Vitals:')
    print(f\"    FCP: {audits['first-contentful-paint']['displayValue']}\")
    print(f\"    LCP: {audits['largest-contentful-paint']['displayValue']}\")
    print(f\"    CLS: {audits['cumulative-layout-shift']['displayValue']}\")
    print(f\"    TBT: {audits['total-blocking-time']['displayValue']}\")
"
  echo ""
  echo "📄 Full report: ${REPORT_PATH}.report.html"
else
  echo "❌ Lighthouse failed. Is the server running?"
fi
