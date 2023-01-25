import axios from 'axios';

const { VITE_HOST } = import.meta.env;

const xapi = axios.create({
  baseURL: `${VITE_HOST}`,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain',
  },
});

interface iX {
  [index: string]: any;
}

interface idX {
  [index: string]: any;
  id?: number;
}

export const Store = {
  finds<T extends iX>(model: string, params?: {}) {
    return () => this.fetches<T>(model, params);
  },

  async fetches<T extends iX>(model: string, params?: {}) {
    const url =
      params && Object.keys(params).length
        ? `${model}?${new URLSearchParams(params)}`
        : `${model}`;
    const res = await this.get<T>(url);
    return res.data;
  },

  save<T extends iX>(model: string, data: T) {
    try {
      return this.set<T>(model, data);
    } catch (Err) {
      console.log('Error on Store.save>>', Err);
      throw Err;
    }
  },

  async set<T extends idX>(model: string, data: T) {
    try {
      const res = await xapi.post(`${model}`, JSON.stringify(data));
      return res.data;
    } catch (Err) {
      console.log('Error on Store.save>>', Err);
      throw Err;
    }
  },

  get<T>(uri: string) {
    return xapi.get<T>(uri);
  },
};
