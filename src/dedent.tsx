import { assert } from "./assert.js";

/**
 * Template literal tag that strips spaces from the beginning of all lines.
 *
 * The first and last line must be empty. The last line defines the indentation
 * that is stripped from all previous lines. Indentation must use spaces, tabs
 * are not supported.
 *
 * If the template string contains multiline subsitutions, the template line may
 * only contain spaces in that line before the substitution. These spaces are
 * prepended to all lines in the substitution.
 */
export function dedent(chunks: TemplateStringsArray, ...args: any[]) {
  const { strings, indent } = stripFirstAndLastLine(chunks);
  const text = concatArgs(strings, args);

  return text
    .split("\n")
    .map((line, i) => {
      assert(
        line === "" || line.startsWith(indent),
        `Insufficient indentation in line ${i + 1}.`,
      );
      return line.substring(indent.length);
    })
    .join("\n");
}

function stripFirstAndLastLine([...strings]: TemplateStringsArray) {
  assert(strings[0].startsWith("\n"), "Content must start on a new line.");
  strings[0] = strings[0].substring(1);

  const last = strings.at(-1)!;
  const lfIndex = last.lastIndexOf("\n");
  assert(lfIndex !== -1, "Closing delimiter must appear on a new line.");
  strings[strings.length - 1] = last.substring(0, lfIndex);

  const indent = last.substring(lfIndex + 1);
  assert(spaceOnlyPattern.test(indent), "Last line may only contain spaces.");

  return { strings, indent };
}

function concatArgs(strings: readonly string[], args: readonly any[]) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];
    result += string;
    if (i === args.length) continue;

    const arg = String(args[i]).split("\n");
    if (arg.length === 1) {
      result += arg[0];
      continue;
    }

    const indent = string.substring(string.lastIndexOf("\n") + 1);
    assert(
      indent !== string && spaceOnlyPattern.test(indent),
      `Substitution ${i + 1} is a multiline string. The template may contain ` +
        `only space characters before the substitution.`,
    );
    result += arg.join(`\n${indent}`);
  }

  return result;
}

const spaceOnlyPattern = /^ *$/;
