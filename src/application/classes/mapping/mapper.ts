import { Either, left, right } from '../../../core';
import { MappingError } from './errors';
import { MappingParams, MappingScheme } from './interfaces';
import { MappingFunction } from './types';

export class Mapper {
  static map<R = any, D = any>(data: D, scheme: MappingScheme): Either<MappingError, R> {
    if (!data || !scheme) {
      return left(new MappingError('No data or scheme is provided.', data, scheme));
    }
    let dataObjects: any[];
    if (Array.isArray(data)) {
      dataObjects = data;
    } else {
      dataObjects = [data];
    }
    const mappedObjects: any[] = [];
    dataObjects.forEach((dataObject: any) => {
      if (typeof dataObject !== 'object' || Array.isArray(dataObject)) {
        return left(
          new MappingError('Data is not an object or array of objects and cannot be mapped.', data, scheme)
        );
      }
      const mappedObject: any = {};
      let keys: string[] = Object.keys(dataObject);
      const schemeKeys: string[] = Object.keys(scheme);
      schemeKeys.forEach((key: string) => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
      keys = keys.sort((a: string, b: string) => a.localeCompare(b));
      keys.forEach((key: string) => {
        const mappingData:
          | 'ignore'
          | MappingFunction
          | MappingScheme
          | [MappingScheme]
          | MappingParams
          | undefined = scheme[key];
        if (mappingData === 'ignore') {
          return;
        }
        let mappingFunctionOrScheme: MappingFunction | MappingScheme | [MappingScheme] | undefined;
        let mappedKey: string = key;
        if (typeof mappingData === 'object' && (mappingData as MappingParams).fieldName) {
          const mappingParams: MappingParams = mappingData as MappingParams;
          mappedKey = mappingParams.fieldName;
          mappingFunctionOrScheme = mappingParams.mapping;
        } else {
          mappingFunctionOrScheme = mappingData as
            | MappingFunction
            | MappingScheme
            | [MappingScheme]
            | undefined;
        }

        if (mappingFunctionOrScheme) {
          if (typeof mappingFunctionOrScheme === 'function') {
            const mappingFunction: MappingFunction = mappingFunctionOrScheme as MappingFunction;
            const mappingResult: Either<MappingError, any> = mappingFunction({
              value: dataObject[key],
              self: dataObject,
            });
            if (mappingResult.isLeft()) {
              return left(mappingResult.value);
            }
            mappedObject[mappedKey] = mappingResult.value;
          } else {
            const mappingScheme: MappingScheme = Array.isArray(mappingFunctionOrScheme)
              ? mappingFunctionOrScheme[0]
              : mappingFunctionOrScheme;
            const mappingResult: Either<MappingError, any> = Mapper.map(dataObject[key], mappingScheme);
            if (mappingResult.isLeft()) {
              return left(mappingResult.value);
            }
            mappedObject[mappedKey] = mappingResult.value;
          }
        } else {
          mappedObject[mappedKey] = dataObject[key];
        }
        if (mappedObject[mappedKey] === undefined) {
          delete mappedObject[mappedKey];
        }
      });
      mappedObjects.push(mappedObject);
    });
    if (Array.isArray(data)) {
      return right(mappedObjects as any);
    } else {
      return right(mappedObjects[0]);
    }
  }

  static dtoFromPartial<T = any>(data: Partial<T>): T {
    return data as T;
  }
}
