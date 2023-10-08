import axios from 'axios';

export abstract class BaseAPI {
  constructor(private readonly BASE_URL: string) {}

  protected get<T>(path: string): Promise<T> {
    return axios.get<T>(this.BASE_URL + path).then((res) => res.data);
  }
}
