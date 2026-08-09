# 💊 Hương Pharmacy AI Copilot

AI-powered Pharmacy Assistant built with Flask and Groq API.

## Features

✅ Drug Information

✅ Drug Interaction Analysis

✅ Medication Counseling

✅ Patient Education

✅ Vietnamese & English Responses

## Search & interaction checking

- **Semantic search**: PDF content is indexed with TF-IDF and matched by cosine similarity, so paraphrased questions ("thuốc sinh học tương tự" vs "biosimilar") match better than exact keyword overlap.
- **Drug interaction checker** (`interaction_checker.py` + `drug_interactions.json`): a small curated list of well-known interactions (warfarin+NSAIDs, MAOI+SSRI, statin+grapefruit, etc.). If a question mentions two drugs from a known pair, a warning is prepended to the answer. This is **not** a clinical database — it only covers the pairs listed in `drug_interactions.json`. Swap in a live source (e.g. RxNav) if broader/authoritative coverage is needed.

## Example Questions

- What is Metformin?
- Check interaction between Aspirin and Warfarin.
- Explain Atorvastatin.
- How should a patient take Amoxicillin?

## Author

Hương
``