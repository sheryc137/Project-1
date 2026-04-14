from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer: SentimentIntensityAnalyzer | None = None


def _get_analyzer() -> SentimentIntensityAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = SentimentIntensityAnalyzer()
    return _analyzer


def score_text(text: str) -> float:
    """Return compound sentiment score in [-1.0, 1.0]."""
    if not text:
        return 0.0
    result = _get_analyzer().polarity_scores(text)
    return round(result["compound"], 4)
