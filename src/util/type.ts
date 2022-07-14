type Stringable = string | number | bigint | boolean | null | undefined;

export type Join<T extends Stringable> = `${T}-${T}` | `${T}`;
