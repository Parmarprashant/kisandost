#!/usr/bin/env python
"""Add one localisation key to all four locales at once.

Adding a string by hand means editing app_en.arb, app_hi.arb, app_gu.arb and
app_mr.arb, keeping them in sync, and remembering to run gen-l10n. Miss one
file and the app falls back to English visibly for that locale; miss the
codegen and the build fails on an undefined getter.

It is also the reason UI work on this app cannot be parallelised: every
screen touches the same four files, so two agents working at once collide on
every commit. Adding keys through one command, in one place, keeps those
edits small and adjacent instead of scattered.

Usage:

    python tools/add_l10n_key.py schemesEmpty \\
        --en "No schemes match your farm yet" \\
        --hi "..." --gu "..." --mr "..."

    # a string with placeholders needs their types, and only in the template
    python tools/add_l10n_key.py schemeCount \\
        --en "{count} schemes" --hi "..." --gu "..." --mr "..." \\
        --placeholder count=String

A key lands at top level, next to whichever neighbours it sorts against.
These files are only locally sorted — there are runs of `auth*`, `login*`,
`chatWidget*` in no particular order — so the exact position varies. What is
guaranteed is that it lands at the top level of all four files, that only the
template carries the @-metadata, and that nothing is written unless the
result parses. Run `flutter gen-l10n` afterwards, or pass --gen.
"""

import argparse
import io
import json
import os
import re
import subprocess
import sys

LOCALES = ("en", "hi", "gu", "mr")
L10N_DIR = os.path.join("lib", "l10n")


def arb_path(locale):
    return os.path.join(L10N_DIR, "app_%s.arb" % locale)


def insert_key(locale, key, value, meta=None):
    path = arb_path(locale)
    if not os.path.exists(path):
        sys.exit("missing %s — run this from kisan_app/" % path)

    text = io.open(path, encoding="utf-8").read()
    if '"%s"' % key in text:
        print("  %s: already has %s, skipped" % (locale, key))
        return False

    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    block = ['  "%s": "%s",' % (key, escaped)]
    if meta:
        block.append('  "@%s": %s,' % (key, json.dumps(meta, ensure_ascii=False)))

    lines = text.split("\n")
    out = []
    placed = False
    depth = 0
    for line in lines:
        # Only top-level keys are candidates. An @-metadata entry opens a
        # nested object whose own keys ("placeholders", "type") sort like any
        # other string — matching one of those inserts the new key *inside*
        # that object, which is valid JSON and completely wrong.
        if not placed and depth == 1:
            match = re.match(r'\s*"([A-Za-z0-9_]+)"\s*:', line)
            if match and match.group(1) > key:
                out.extend(block)
                placed = True
        depth += line.count("{") - line.count("}")
        out.append(line)

    if not placed:
        # Nothing sorts after it, so it goes last — and the last entry in a
        # JSON object carries no trailing comma.
        tail = list(block)
        tail[-1] = tail[-1].rstrip(",")
        for i in range(len(out) - 1, -1, -1):
            if out[i].strip() == "}":
                out[i - 1] = out[i - 1].rstrip()
                if not out[i - 1].endswith(","):
                    out[i - 1] += ","
                out[i:i] = tail
                break

    updated = "\n".join(out)

    # Validate before writing: a half-written .arb fails at codegen with a
    # far less obvious message than this one, and leaves the tree dirty.
    try:
        json.loads(updated)
    except ValueError as error:
        sys.exit("would break %s: %s (nothing written)" % (path, error))

    io.open(path, "w", encoding="utf-8", newline="\n").write(updated)
    print("  %s: added" % locale)
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Add one l10n key to every locale.",
    )
    parser.add_argument("key", help="the key, lowerCamelCase")
    for locale in LOCALES:
        parser.add_argument("--%s" % locale, required=True, help="%s text" % locale)
    parser.add_argument(
        "--placeholder",
        action="append",
        default=[],
        metavar="NAME=TYPE",
        help="for {placeholders}; repeatable. Template file only.",
    )
    parser.add_argument(
        "--gen",
        action="store_true",
        help="run flutter gen-l10n when done",
    )
    args = parser.parse_args()

    meta = None
    if args.placeholder:
        fields = {}
        for item in args.placeholder:
            if "=" not in item:
                sys.exit("--placeholder wants NAME=TYPE, got %r" % item)
            name, kind = item.split("=", 1)
            fields[name] = {"type": kind}
        meta = {"placeholders": fields}

    print("adding %s" % args.key)
    for locale in LOCALES:
        # Metadata belongs only in the template locale.
        insert_key(locale, args.key, getattr(args, locale), meta if locale == "en" else None)

    if args.gen:
        print("running flutter gen-l10n")
        # shell=True on Windows: `flutter` there is flutter.bat, which
        # CreateProcess will not resolve from a bare name.
        code = subprocess.call(
            "flutter gen-l10n",
            shell=(os.name == "nt"),
        ) if os.name == "nt" else subprocess.call(["flutter", "gen-l10n"])
        if code != 0:
            sys.exit("gen-l10n failed — the keys are written, rerun it yourself")
    else:
        print("\nnow run: flutter gen-l10n")

    if args.placeholder:
        print(
            "\nnote: gen_l10n orders placeholder parameters ALPHABETICALLY,\n"
            "not in the order they appear in the string."
        )


if __name__ == "__main__":
    main()
