"""
Claude AI client for investment analysis.
Uses prompt caching on the static system prompt to reduce API costs.
"""
import json
import re
from datetime import datetime

import anthropic

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are an expert investment analyst AI assistant. You analyze news events and their potential impact on a personal investment portfolio. This is a personal decision-support tool — NOT official financial advice.

ANALYSIS FRAMEWORK:
1. Assess overall market environment from recent news
2. Map geopolitical events → affected sectors → specific holdings
3. Rate market risk on a 0-100 scale: 0-25 LOW, 26-50 MEDIUM, 51-75 HIGH, 76-100 CRITICAL
4. For each portfolio position: signal (BUY/SELL/HOLD/WATCH), impact (HIGH/MEDIUM/LOW/NONE), concise reason (2-3 sentences)
5. Prioritize actionable insights over comprehensive coverage

SECTOR MAPPING RULES (apply deterministically):
- "China tensions/Taiwan/sanctions" → semiconductors: NVDA, AAPL, TSM, QCOM
- "Fed rate decision/FOMC/interest rates" → rate-sensitive: REITs, utilities, growth tech, TLT
- "Oil/energy/OPEC" → energy sector, airlines: XOM, CVX, AAL, DAL
- "Bank stress/credit crisis" → financials: JPM, BAC, WFC, C, GS
- "Russia/Ukraine/conflict" → energy, agriculture, defense: XOM, LMT, RTX, ADM
- "AI/semiconductor chip demand" → NVDA, AMD, INTC, AMAT, LRCX
- "Recession/economic slowdown" → defensives, gold: XLP, XLU, GLD, TLT
- "Earnings beat/miss" → that company + sector peers

SIGNAL DEFINITIONS:
- BUY: Strong positive catalyst, consider adding to position
- SELL: Significant negative risk, consider reducing/exiting
- HOLD: No clear catalyst to change position
- WATCH: Developing situation, monitor closely before acting

OUTPUT FORMAT: Respond ONLY with a valid JSON object matching this exact schema:
{
  "market_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_score": 0,
  "summary": "2-3 sentence market summary",
  "full_reasoning": "Detailed 3-5 paragraph analysis",
  "per_position": {
    "TICKER": {"signal": "BUY|SELL|HOLD|WATCH", "impact": "HIGH|MEDIUM|LOW|NONE", "reason": "explanation"}
  },
  "key_themes": ["theme1", "theme2"],
  "top_risks": ["risk1", "risk2", "risk3"]
}"""


class ClaudeClient:
    def __init__(self):
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-sonnet-4-6"

    def run_investment_analysis(
        self,
        portfolio: dict,
        news_articles: list[dict],
        keyword_alerts: list[dict],
    ) -> dict:
        user_message = self._build_user_message(portfolio, news_articles, keyword_alerts)

        try:
            response = self._client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},  # Prompt caching
                    }
                ],
                messages=[{"role": "user", "content": user_message}],
            )

            parsed = self._parse_response(response.content[0].text)
            parsed["tokens_used"] = response.usage.input_tokens + response.usage.output_tokens
            parsed["cached_tokens"] = getattr(response.usage, "cache_read_input_tokens", 0)
            return parsed

        except Exception as e:
            logger.error(f"Claude analysis failed: {e}")
            raise

    def _build_user_message(self, portfolio: dict, articles: list[dict], keyword_alerts: list[dict]) -> str:
        lines = []

        # Portfolio section
        lines.append(f"## CURRENT PORTFOLIO (as of {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')})")
        total_val = portfolio.get("total_value", 0)
        buying_power = portfolio.get("buying_power", 0)
        lines.append(f"Total Value: ${total_val:,.2f} | Buying Power: ${buying_power:,.2f}")
        lines.append("")
        lines.append("Positions:")
        for pos in portfolio.get("positions", []):
            ticker = pos.get("ticker", "?")
            qty = pos.get("quantity", 0)
            avg = pos.get("avg_buy_price", 0)
            cur = pos.get("current_price", 0)
            equity = pos.get("equity", 0)
            pct = pos.get("percent_change", 0)
            lines.append(f"  {ticker} | Qty: {qty:.2f} | Avg: ${avg:.2f} | Now: ${cur:.2f} | Equity: ${equity:.2f} ({pct:+.2f}%)")

        # Keyword alerts section
        lines.append("")
        lines.append("## RULE-BASED KEYWORD ALERTS DETECTED")
        if keyword_alerts:
            for ka in keyword_alerts:
                tickers = ", ".join(ka.get("tickers", []))
                lines.append(f"  • {ka['keyword'].upper()} → Sector: {ka.get('sector', '?')} | Related tickers: {tickers}")
        else:
            lines.append("  None detected in recent news")

        # News section
        lines.append("")
        lines.append(f"## RECENT NEWS (last {settings.analysis_news_lookback_hours}h, ranked by relevance)")
        for art in articles[:settings.analysis_max_articles]:
            source = art.get("source", "?").upper()
            title = art.get("title", "")
            pub = art.get("published_at", "")
            sentiment = art.get("sentiment_score", 0)
            body = (art.get("body") or "")[:200]
            lines.append(f"[{source}] {title} — {pub} — sentiment: {sentiment:+.2f}")
            if body:
                lines.append(f"  {body}…")

        lines.append("")
        lines.append("## TASK")
        lines.append("Analyze how the above news environment affects this portfolio. Follow the system prompt framework and return the exact JSON schema specified.")

        return "\n".join(lines)

    def _parse_response(self, text: str) -> dict:
        # Try direct JSON parse first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Extract from markdown code fence
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Last resort: find first { ... } block
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        logger.error(f"Could not parse Claude response: {text[:500]}")
        return {
            "market_risk_level": "UNKNOWN",
            "risk_score": 50,
            "summary": "Analysis parsing failed",
            "full_reasoning": text,
            "per_position": {},
            "key_themes": [],
            "top_risks": [],
        }
