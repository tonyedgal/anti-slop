const normalized = new WeakSet();

/** Add node offsets when ESLint supplies only ranges. */
function addPositions(sourceCode) {
  const { ast, visitorKeys } = sourceCode;

  if (normalized.has(ast)) return;

  const pending = [ast, ...sourceCode.getAllComments()];
  const visited = new WeakSet();

  while (pending.length > 0) {
    const node = pending.pop();

    if (node === undefined || visited.has(node)) continue;
    visited.add(node);

    if (Array.isArray(node.range)) {
      node.start ??= node.range[0];
      node.end ??= node.range[1];
    }

    for (const key of visitorKeys[node.type] ?? []) {
      const child = node[key];

      if (Array.isArray(child)) {
        for (const item of child) if (item !== null) pending.push(item);
      } else if (child !== null && child !== undefined) {
        pending.push(child);
      }
    }
  }

  normalized.add(ast);
}

/** Supply node positions to the rules when ESLint provides only ranges. */
export function withPositions(plugin) {
  return {
    ...plugin,
    rules: Object.fromEntries(
      Object.entries(plugin.rules).map(([name, rule]) => [
        name,
        {
          ...rule,
          create(context) {
            addPositions(context.sourceCode);

            return rule.create(context);
          },
        },
      ]),
    ),
  };
}
