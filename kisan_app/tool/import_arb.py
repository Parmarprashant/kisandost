"""Convert the web app's next-intl messages into Flutter ARB files.

The Next.js app keeps its translations in
`kisan-dost/ventureHack/kisan-next/messages/{en,hi,gu,mr}.json` as nested
objects. Flutter's gen_l10n wants flat ARB files with `{placeholder}` metadata.

This script flattens the nested keys with underscores
(`Dashboard.healthStatus.healthy` -> `dashboard_healthStatus_healthy`), keeps
only the namespaces the mobile app actually uses, and writes the placeholder
metadata gen_l10n needs.

English is the template: a key missing from another locale is simply left out
of that locale's ARB, and Flutter falls back to English at runtime.

Usage (from the kisan_app directory):
    python tool/import_arb.py
"""

import io
import json
import os
import re

MESSAGES_DIR = os.path.join(
    "..", "kisan-dost", "ventureHack", "kisan-next", "messages"
)
OUT_DIR = os.path.join("lib", "l10n")
LOCALES = ["en", "hi", "gu", "mr"]

# Namespaces the mobile app uses. The marketing namespaces from the web landing
# page (Index, Hero, Footer, FarmingFeature, Services, HomeCropCare,
# TrustSection) are deliberately excluded.
NAMESPACES = [
    "Navigation",
    "Navbar",
    "Dashboard",
    "WeatherPage",
    "WeatherTips",
    "Products",
    "ProductsPage",
    "Communities",
    "ChatWidget",
    "myCrop",
    "Fertilizer",
    "DiseasesPage",
    "Crops",
    "YieldPredictor",
    "ProfitPredictor",
    "CropSuggestion",
]

PLACEHOLDER_RE = re.compile(r"\{(\w+)\}")

# Strings the mobile app needs that the web app never had — mostly offline and
# failure states, which a mobile client hits far more often than a browser on
# a desk. These are merged in after the import so re-running this script does
# not lose them. Add new app-only copy here, not by editing the ARB by hand.
APP_EXTRAS = {
    "en": {
        "appOffline": "You are offline. Showing saved information.",
        "appSlow": "This is taking longer than usual. Please wait.",
        "appError": "Something went wrong.",
        "appRetry": "Try again",
        "appLastUpdated": "Updated {time}",
        "appLanguage": "Language",
        "navDiagnose": "Diagnose",
        "navFarm": "My Farm",
        "navInsights": "Insights",
        "navMore": "More",
        "comingSoon": "Coming soon",
    },
    "hi": {
        "appOffline": "आप ऑफ़लाइन हैं। सहेजी गई जानकारी दिखा रहे हैं।",
        "appSlow": "इसमें सामान्य से अधिक समय लग रहा है। कृपया प्रतीक्षा करें।",
        "appError": "कुछ गड़बड़ हो गई।",
        "appRetry": "फिर कोशिश करें",
        "appLastUpdated": "{time} को अपडेट किया गया",
        "appLanguage": "भाषा",
        "navDiagnose": "जाँच",
        "navFarm": "मेरा खेत",
        "navInsights": "जानकारी",
        "navMore": "और",
        "comingSoon": "जल्द आ रहा है",
    },
    "gu": {
        "appOffline": "તમે ઑફલાઇન છો. સાચવેલી માહિતી બતાવી રહ્યા છીએ.",
        "appSlow": "આમાં સામાન્ય કરતાં વધુ સમય લાગી રહ્યો છે. કૃપા કરીને રાહ જુઓ.",
        "appError": "કંઈક ખોટું થયું.",
        "appRetry": "ફરી પ્રયાસ કરો",
        "appLastUpdated": "{time} એ અપડેટ થયું",
        "appLanguage": "ભાષા",
        "navDiagnose": "તપાસ",
        "navFarm": "મારું ખેતર",
        "navInsights": "માહિતી",
        "navMore": "વધુ",
        "comingSoon": "ટૂંક સમયમાં",
    },
    "mr": {
        "appOffline": "तुम्ही ऑफलाइन आहात. जतन केलेली माहिती दाखवत आहोत.",
        "appSlow": "यास नेहमीपेक्षा जास्त वेळ लागत आहे. कृपया प्रतीक्षा करा.",
        "appError": "काहीतरी चूक झाली.",
        "appRetry": "पुन्हा प्रयत्न करा",
        "appLastUpdated": "{time} रोजी अद्यतनित",
        "appLanguage": "भाषा",
        "navDiagnose": "तपासणी",
        "navFarm": "माझे शेत",
        "navInsights": "माहिती",
        "navMore": "अधिक",
        "comingSoon": "लवकरच येत आहे",
    },
}


def sanitize(segment):
    """Make one key segment a legal Dart identifier fragment.

    gen_l10n requires camelCase names with no punctuation, so `apple-scab`
    becomes `appleScab` and `2025-scheme` becomes `k2025Scheme`.
    """
    parts = [p for p in re.split(r"[^0-9A-Za-z]+", segment) if p]
    if not parts:
        return ""
    head = parts[0]
    tail = "".join(p[0].upper() + p[1:] for p in parts[1:])
    return head + tail


def flatten(node, prefix, out):
    """Flatten nested dicts into underscore-joined keys, skipping non-strings."""
    for key, value in node.items():
        clean = sanitize(key)
        if not clean:
            continue
        name = f"{prefix}_{clean}" if prefix else clean
        if isinstance(value, dict):
            flatten(value, name, out)
        elif isinstance(value, str):
            out[name] = value
        # Lists and numbers have no ARB equivalent; they stay in Dart constants.


def camel_head(name):
    """dashboard_healthStatus -> lower-camel first segment, valid for gen_l10n."""
    name = sanitize(name)
    if not name:
        return name
    name = name[0].lower() + name[1:]
    return name if name[0].isalpha() else "k" + name


def build(locale, wanted_keys=None):
    path = os.path.join(MESSAGES_DIR, f"{locale}.json")
    with io.open(path, encoding="utf-8") as handle:
        data = json.load(handle)

    flat = {}
    for namespace in NAMESPACES:
        if namespace in data and isinstance(data[namespace], dict):
            flatten(data[namespace], camel_head(namespace), flat)

    flat.update(APP_EXTRAS.get(locale, {}))

    if wanted_keys is not None:
        flat = {k: v for k, v in flat.items() if k in wanted_keys}

    arb = {"@@locale": locale}
    for key in sorted(flat):
        value = flat[key]
        arb[key] = value
        names = sorted(set(PLACEHOLDER_RE.findall(value)))
        if names:
            arb[f"@{key}"] = {"placeholders": {n: {"type": "String"} for n in names}}
    return arb, set(flat)


def main():
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    english, english_keys = build("en")
    written = {}

    for locale in LOCALES:
        # Non-English locales carry only keys English also has, so gen_l10n
        # never sees an orphan key with no template entry.
        arb, keys = build(locale, wanted_keys=english_keys)
        if locale != "en":
            # Strip metadata from non-template files; gen_l10n only reads it
            # from the template.
            arb = {k: v for k, v in arb.items() if not k.startswith("@") or k == "@@locale"}
        out_path = os.path.join(OUT_DIR, f"app_{locale}.arb")
        with io.open(out_path, "w", encoding="utf-8") as handle:
            json.dump(arb, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        written[locale] = keys
        print(f"{out_path}: {len(keys)} keys")

    print()
    for locale in LOCALES:
        if locale == "en":
            continue
        missing = len(english_keys - written[locale])
        pct = 100 * (1 - missing / max(len(english_keys), 1))
        print(f"{locale}: {pct:.0f}% translated ({missing} keys fall back to English)")


if __name__ == "__main__":
    main()
