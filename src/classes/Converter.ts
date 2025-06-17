import { Client } from "./Client.js";

export interface IConverter {
  client: Client;
  convert(input: string): any;
}
