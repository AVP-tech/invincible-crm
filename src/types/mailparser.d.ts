declare module "mailparser" {
  export function simpleParser(input: string | Buffer): Promise<any>;
}
