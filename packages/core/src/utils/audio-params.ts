function getParam<T extends string & {}>(node: AudioWorkletNode, name: T) {
  const param = node.parameters.get(name);
  if (!param) throw new Error(`Missing AudioParam "${name}"`);
  return param;
}

export { getParam };
