enum SymbolKind {
  Static = 'static',
  Field = 'field',
  Arg = 'arg',
  Var = 'var'
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

  startSubrouting() {
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

  kindOf(name: string): SymbolKind | undefined {
    const props = this.getByName(name);
    return props && props.kind;
  }

  typeOf(name: string): string | undefined {
    const props = this.getByName(name);
    return props && props.type;
  }

  indexOf(name: string): number | undefined {
    const props = this.getByName(name);
    return props && props.index;
  }

  private getByName(name: string): IdentifierProperties | undefined {
    if (this.subroutineTable.has(name)) {
      return this.subroutineTable.get(name);
    }
    if (this.classTable.has(name)) {
      return this.classTable.get(name);
    }
    return undefined;
  }

  private isSubroutineKind(kind: SymbolKind): boolean {
    return kind === SymbolKind.Arg || kind === SymbolKind.Var;
  }
}

export default SymbolTable;
