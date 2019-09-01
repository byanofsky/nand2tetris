const lineTypes = {
  empty: 'empty',
  label: 'label',
  aCommand: 'a-command',
  cCommand: 'c-command'
};

const parseLine = _line => {
  const line = removeWhiteSpaceAndComments(_line);
  if (!line.length) {
    return { type: lineTypes.empty };
  }
  if (line[0] === '@') {
    return { type: lineTypes.aCommand, value: line.slice(1) };
  }
  if (line[0] === '(') {
    return { type: lineTypes.label, value: line.slice(1, line.length - 1) };
  }
  return parseCCommand(line);
};

const parseCCommand = line => {
  let dest;
  let comp;
  let jump;
  if (line.includes('=')) {
    [dest, comp] = line.split('=');
  }
  if (line.includes(';')) {
    [comp, jump] = line.split(';');
  }
  return {
    type: lineTypes.cCommand,
    value: {
      dest: dest || null,
      comp,
      jump: jump || null
    }
  };
};

const removeWhiteSpaceAndComments = line => {
  const noWhiteSpace = removeWhiteSpace(line);
  return removeComments(noWhiteSpace);
};
const removeWhiteSpace = line => {
  return line.replace(/ /g, '');
};
const removeComments = line => {
  return line.split('//')[0];
};
const shouldIncLineCount = symbol => {
  return symbol.type !== lineTypes.empty;
};
const isInstruction = symbol => {
  return (
    symbol.type === lineTypes.aCommand || symbol.type === lineTypes.cCommand
  );
};
const isLabel = symbol => {
  return symbol.type === lineTypes.label;
};
const isEmpty = symbol => {
  return symbol.type === lineTypes.empty;
};

module.exports = {
  lineTypes,
  parseLine,
  removeWhiteSpaceAndComments,
  removeWhiteSpace,
  removeComments,
  shouldIncLineCount,
  isLabel,
  isEmpty,
  isInstruction
};
