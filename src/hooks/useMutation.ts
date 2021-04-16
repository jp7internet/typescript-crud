import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Record } from '../interfaces/RecordEntities';

export type Action = (record?: any) => Promise<void>;

export const useMutation = <T extends Record>(
  path: string,
  callback?: Function
) => {
  const [processing, setProcesing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>();
  const [error, setError] = useState<AxiosError>();

  const url = `${process.env.REACT_APP_API}/${path}`;

  const wrap = (fn: Function) => {
    return async (record?: T) => {
      setProcesing(true);
      setSuccess(undefined);
      setError(undefined);
      fn(record)
        .then(() => {
          setSuccess(true);
          if (callback) {
            callback();
          }
        })
        .catch((error: Error) => {
          setProcesing(false);
          setSuccess(false);
          setError(error as AxiosError);
        })
        .finally(() => {
          setProcesing(false);
        });
    };
  };

  const create: Action = wrap(async (record: T) => {
    await axios.post(url, record);
  });

  const update: Action = wrap(async (record: T) => {
    await axios.put(`${url}/${record.id}`, record);
  });

  const remove: Action = wrap(async (record: T) => {
    await axios.delete(`${url}/${record.id}`);
  });

  return {
    create,
    update,
    remove,
    processing,
    success,
    error,
    setError,
  };
};
