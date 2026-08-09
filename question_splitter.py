# question_splitter.py
#
# Users sometimes paste several unrelated questions in one message (seen in
# real testing: "Paracetamol dùng để làm gì? Tác dụng phụ của Amoxicillin
# là gì? Omeprazole nên uống trước hay sau ăn?..." all in a single input).
# Treating that whole blob as one search query dilutes relevance - the
# resulting single "best page" can't actually answer five different
# things. Splitting it into separate questions and answering each one
# individually gives a real answer (or an honest "not found") per question
# instead of one diluted, likely-irrelevant answer for the whole blob.

import re

MIN_FRAGMENT_LEN = 5


def split_questions(text):
    """
    Split a block of text into individual question/statement fragments on
    sentence-ending punctuation (. ? !), while protecting decimal numbers
    like "38.5" from being mistaken for a sentence break.
    Returns a list with at least one element (the original text, stripped,
    if no split points were found).
    """
    if not text or not text.strip():
        return [text]

    # Protect "38.5"-style decimals: swap the decimal point for a
    # placeholder character that never occurs in normal text and that
    # re.split's punctuation pattern won't match, then restore it after
    # splitting. (A plain space would collide with every other space in
    # the sentence and corrupt them all back into periods.)
    placeholder = "\x00"
    protected = re.sub(r"(?<=\d)\.(?=\d)", placeholder, text)

    fragments = re.split(r"(?<=[.?!])\s+", protected)
    fragments = [f.replace(placeholder, ".").strip() for f in fragments]
    fragments = [f for f in fragments if len(f) >= MIN_FRAGMENT_LEN]

    return fragments if fragments else [text.strip()]
