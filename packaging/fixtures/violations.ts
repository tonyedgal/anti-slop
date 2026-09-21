// These violations are intentional. Run with packaging/manual.config.mjs.
export const value = Reflect.get({ name: "example" }, "name");

export const kind = typeof value;
