export interface IResponseMapping {
    dataPath?: string;
    totalPath?: string;
}
 
export interface IServerOptionsConfig {
    endpoint: string;
    service: string;
    dependencies?: string[];
    method?: "GET" | "POST";
    params?: Record<string, string | number | boolean>;
    responseMapping?: IResponseMapping;
}
 