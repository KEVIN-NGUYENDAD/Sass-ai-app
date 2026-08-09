# interaction_checker.py
#
# Small curated drug-drug interaction lookup. This is NOT a clinical
# database (no DrugBank/RxNav data here — see README for why, and how to
# swap in a real API later) — it's a fixed list of well-known interactions
# a pharmacy student would be expected to recognize, meant to flag an
# obvious risk when a question mentions two interacting drugs together,
# not to be an exhaustive or authoritative interaction check.

import json
import os
import re

_DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "drug_interactions.json")

_interactions = None


def _load_interactions():
    global _interactions

    if _interactions is None:
        with open(_DATA_PATH, "r", encoding="utf-8") as f:
            _interactions = json.load(f)

    return _interactions


def _any_term_mentioned(text_lower, terms):
    return any(re.search(r"\b" + re.escape(term) + r"\b", text_lower) for term in terms)


def check_interactions(question):
    """
    Look for known drug pairs both mentioned in the question.
    Returns a list of matching interaction records (empty if none).
    """
    if not question:
        return []

    question_lower = question.lower()
    matches = []

    for record in _load_interactions():
        a_hit = _any_term_mentioned(question_lower, record["drug_a"])
        b_hit = _any_term_mentioned(question_lower, record["drug_b"])

        if a_hit and b_hit:
            matches.append(record)

    return matches
