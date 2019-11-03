export enum SymbolKind {
  Static = 'static',
  Field = 'field',
  Arg = 'arg',
  Var = 'var',
  None = 'none'
}

interface IdentifierProperties {
  type: string;
  kind: SymbolKind;
  index: number;
}

type SymbolsMap = Map<string, IdentifierProperties>;

class SymbolTable {
  classTable: SymbolsMap = new Map();
  subroutineTable: SymbolsMap = new Map();

  startSubroutine() {
    this.subroutineTable = new Map();
  }

  define(name: string, type: string, kind: SymbolKind) {
    const props: IdentifierProperties = {
      type,
      kind,
      index: this.varCount(kind)
    };
    if (this.isSubroutineKind(kind)) {
      this.subroutineTable.set(name, props);
    } else {
      this.classTable.set(name, props);
    }
  }

  varCount(kind: SymbolKind): number {
    const tableToCount = this.isSubroutineKind(kind)
      ? this.subroutineTable
      : this.classTable;
    let count = 0;
    tableToCount.forEach(props => {
      if (props.kind === kind) {
        count++;
      }
    });
    return count;
  }

  kindOf(name: string): SymbolKind {
    return this.getByName(name).kind;
  }

  typeOf(name: string): string {
    return this.getByName(name).type;
  }

  indexOf(name: string): number {
    return this.getByName(name).index;
  }

  has(name: string): boolean {
    return this.subroutineTable.has(name) || this.classTable.has(name);
  }

  private getByName(name: string): IdentifierProperties {
    if (this.subroutineTable.has(name)) {
      return this.subroutineTable.get(name) as IdentifierProperties;
    }
    if (this.classTable.has(name)) {
      return this.classTable.get(name) as IdentifierProperties;
    }
    throw new Error(
      `Identifier not recognized: "${name}". May not be declared.`
    );
  }

  private isSubroutineKind(kind: SymbolKind): boolean {
    return kind === SymbolKind.Arg || kind === SymbolKind.Var;
  }
}

export default SymbolTable;
