#!/usr/bin/env python3
import io
import json
import sys
import traceback

__doc__ = """build an HTML index on STDOUT
Usage: %s PROJECTS TEMPLATE"""

def build_index(*projects):
    __doc__ = "build an index of projects"
    print("\t\t<div class = \"index\">")

    for project in projects:
        build_index_entry(**project)
    print("\t\t</div>")

def build_index_entry(**kwargs):
    __doc__ = "build an index entry for a project"
    print("\t\t\t<a class = \"index-entry\" href = \"%s\">"
            % kwargs.get("repository", ""))
    print("\t\t\t\t<span class = \"title\">%s</span>"
            % kwargs.get("title", ""))
    print("\t\t\t\t<span class = \"description\">%s</span>"
            % kwargs.get("description", ""))
    print("\t\t\t\t<img class = \"logo\" src = \"%s\"></img>"
            % kwargs.get("logo", ""))
    print("\t\t\t</a>")

def help(name):
    print(__doc__ % name, file = sys.stderr)

def main(argv):
    if not len(argv) == 3:
        help(argv[0])
        return 1

    try:
        with open(argv[1]) as fp:
            projects = json.load(fp)
    except (IOError, OSError):
        traceback.print_exc()
        return 1

    if not isinstance(projects, list):
        print("Expected a list of projects.", file = sys.stderr)
        help(argv[0])
        return 1

    try:
        with open(argv[2]) as fp:
            template = fp.read()
    except (IOError, OSError):
        traceback.print_exc()
        return 1
    stdout = sys.stdout
    stringio = io.StringIO()
    sys.stdout = stringio
    build_index(*projects)
    sys.stdout = stdout
    print(template % stringio.getvalue().rstrip('\n'), end = "")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))

