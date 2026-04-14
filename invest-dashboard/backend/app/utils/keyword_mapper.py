"""
Maps news keywords to affected sectors and common ticker symbols.
Used by both the rule-based alert layer and the Claude prompt builder.
"""

KEYWORD_MAP: dict[str, dict] = {
    # Geopolitical
    "china tension": {"sector": "Technology/Semiconductors", "tickers": ["NVDA", "AAPL", "TSM", "QCOM", "AMAT"]},
    "taiwan strait": {"sector": "Technology/Semiconductors", "tickers": ["NVDA", "AAPL", "TSM", "QCOM"]},
    "china sanctions": {"sector": "Technology/Trade", "tickers": ["NVDA", "AAPL", "QCOM", "MU"]},
    "russia ukraine": {"sector": "Energy/Agriculture/Defense", "tickers": ["XOM", "CVX", "LMT", "RTX", "ADM"]},
    "middle east": {"sector": "Energy/Defense", "tickers": ["XOM", "CVX", "OXY", "LMT", "RTX"]},
    "north korea": {"sector": "Defense", "tickers": ["LMT", "RTX", "NOC", "BA"]},
    "iran": {"sector": "Energy/Defense", "tickers": ["XOM", "CVX", "LMT", "RTX"]},

    # Monetary policy
    "fed rate": {"sector": "Rate-Sensitive", "tickers": ["SPY", "QQQ", "VNQ", "TLT", "XLU"]},
    "interest rate": {"sector": "Rate-Sensitive", "tickers": ["SPY", "QQQ", "VNQ", "TLT"]},
    "fomc": {"sector": "Broad Market", "tickers": ["SPY", "QQQ", "TLT", "GLD"]},
    "inflation": {"sector": "Broad Market/Commodities", "tickers": ["GLD", "TIP", "XLE", "SPY"]},
    "recession": {"sector": "Defensive", "tickers": ["XLP", "XLU", "GLD", "TLT"]},

    # Energy
    "opec": {"sector": "Energy", "tickers": ["XOM", "CVX", "OXY", "SLB", "HAL"]},
    "oil price": {"sector": "Energy/Airlines", "tickers": ["XOM", "CVX", "AAL", "DAL", "UAL"]},
    "natural gas": {"sector": "Energy/Utilities", "tickers": ["LNG", "EQT", "XOM", "CVX"]},

    # Financial
    "bank stress": {"sector": "Financials", "tickers": ["JPM", "BAC", "WFC", "C", "GS"]},
    "credit crisis": {"sector": "Financials", "tickers": ["JPM", "BAC", "C", "GS"]},
    "svb": {"sector": "Regional Banks", "tickers": ["JPM", "BAC", "KRE"]},
    "debt ceiling": {"sector": "Broad Market/Treasuries", "tickers": ["TLT", "SPY", "GLD"]},

    # Tech
    "ai chip": {"sector": "Semiconductors/AI", "tickers": ["NVDA", "AMD", "INTC", "QCOM"]},
    "semiconductor": {"sector": "Semiconductors", "tickers": ["NVDA", "AMD", "INTC", "QCOM", "AMAT", "LRCX"]},
    "tech regulation": {"sector": "Big Tech", "tickers": ["GOOGL", "META", "AMZN", "AAPL", "MSFT"]},

    # Commodities
    "gold": {"sector": "Precious Metals", "tickers": ["GLD", "GDX", "NEM", "GOLD"]},
    "copper": {"sector": "Mining/Industrial", "tickers": ["COPX", "FCX", "RIO"]},
    "agriculture": {"sector": "Agriculture", "tickers": ["ADM", "BG", "CORN", "WEAT"]},
}


def find_matches(text: str) -> list[dict]:
    """Return list of keyword matches with sector + tickers for given text."""
    text_lower = text.lower()
    matches = []
    seen_keywords = set()
    for keyword, data in KEYWORD_MAP.items():
        if keyword in text_lower and keyword not in seen_keywords:
            matches.append({"keyword": keyword, **data})
            seen_keywords.add(keyword)
    return matches


def get_affected_tickers(text: str) -> list[str]:
    """Return deduplicated list of potentially affected tickers."""
    tickers: set[str] = set()
    for match in find_matches(text):
        tickers.update(match.get("tickers", []))
    return sorted(tickers)
