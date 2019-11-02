import { SymbolKind } from './SymbolTable';
import { Segment } from './VMWriter';
import * as uuid from 'uuid';

export const convertKeywordToSymbolKind = (keyword: string): SymbolKind => {
  switch (keyword) {
    case '':
      return SymbolKind.Arg;
    case 'field':
      return SymbolKind.Field;
    case 'static':
      return SymbolKind.Static;
    case 'var':
      return SymbolKind.Var;
    default:
      return SymbolKind.None;
  }
};

export const convertSymbolKindToSegment = (kind: SymbolKind): Segment => {
  switch (kind) {
    case SymbolKind.Arg: {
      return Segment.Arg;
    }
    case SymbolKind.Field: {
      return Segment.This;
    }
    case SymbolKind.Static: {
      return Segment.Static;
    }
    case SymbolKind.Var: {
      return Segment.Local;
    }
    case SymbolKind.None:
    default: {
      throw new Error(`Cannot convert symbolKind: "${kind}"`);
    }
  }
};

export const generateLabel = () => `l-${uuid.v4()}`;
