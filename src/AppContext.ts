import { createContext } from "react";
import { ServerContext } from "wghub-rust-web";

export interface AppContextData {
  server?: ServerContext
}

export const AppContext = createContext<AppContextData>({})