const data = require("./value");

const getType = x => {
  if (typeof x !== "object") return { type: typeof x };
  if (x === null) return { type: "null" };
  if (Array.isArray(x))
    return { type: "array", elementType: getTypeofValues(x) };
  return {
    type: "object",
    properties: Object.assign(
      {},
      ...Object.keys(x).map(key => ({ [key]: getType(x[key]) }))
    )
  };
};

const isTypesEqual = t1 => t2 => {
  if (t1.type !== t2.type) return false;
  const { type } = t1;
  if (!["object", "array", "or"].includes(type)) {
    return true;
  }
  if (type === "array") {
    return isTypesEqual(t1.elementType)(t2.elementType);
  }
  if (type === "object") {
    const props1 = Object.keys(t1.properties);
    const props2 = Object.keys(t2.properties);
    if (props1.length !== props2.length) {
      return false;
    }
    if (!props1.every(prop => props2.includes(prop))) {
      return false;
    }
    return props1.every(property =>
      isTypesEqual(t1.properties[property])(t2.properties[property])
    );
  }
  if (type === "or") {
    const { variants: v1 } = t1;
    const { variants: v2 } = t2;
    if (v1.length !== v2.length) return false;
    if (v1.some(t => !v2.find(isTypesEqual(t)))) return false;
    return true;
  }
  return false;
};

const extendObjs = ({ properties: props1 }, { properties: props2 }) => {
  const keys = [...new Set([...Object.keys(props1), ...Object.keys(props2)])];
  const getPropTypeObj = prop => {
    const t1 = props1[prop] || { type: "undefined" };
    const t2 = props2[prop] || { type: "undefined" };
    return { [prop]: extendType(t1, t2) };
  };
  const newProperties = Object.assign(...keys.map(getPropTypeObj));
  return {
    type: "object",
    properties: newProperties
  };
};
const extendArrs = ({ elementType: et1 }, { elementType: et2 }) => {
  return {
    type: "array",
    elementType: extendType(et1, et2)
  };
};
const clone = value => JSON.parse(JSON.stringify(value));

const uniqTypes = x => {
  const res = [];
  for (let i = 0; i < x.length; i++) {
    const type = x[i];
    if (res.some(isTypesEqual(type))) continue;
    res.push(type);
  }

  res.sort((a1, a2) => {
    if (a1.type === a2.type) return 0;
    if (a1.type === "undefined" && a2.type === "null") return 1;
    if (a1.type === "null" && a2.type === "undefined") return -1;
    if (a1.type === "undefined") return 1;
    if (a1.type === "null") return 1;
    return -1;
  });

  return clone(res);
};

const mergeArrayTypes = arrs => {
  if (arrs.length <= 0) return [];
  return [arrs.reduce(extendArrs)];
};

const mergeObjectTypes = objs => {
  if (objs.length <= 0) return [];
  return [objs.reduce(extendObjs)];
};

const mergeObjectsAndArrs = types => {
  const objectTypes = types.filter(({ type }) => type === "object");
  const arrayTypes = types.filter(({ type }) => type === "array");
  const others = types.filter(
    ({ type }) => type !== "array" && type !== "object"
  );
  return [
    ...others,
    ...mergeArrayTypes(arrayTypes),
    ...mergeObjectTypes(objectTypes)
  ];
};

const extendType = (type1, type2) => {
  if (type1.type === "empty") return clone(type2);
  if (type1.type === "all") return { type: "all" };
  if (type2.type === "all") return { type: "all" };
  if (type2.type === "empty") return clone(type1);

  if (type1.type !== type2.type) {
    const variants = [];
    if (type1.type === "or") {
      variants.push(...type1.variants);
    }
    if (type2.type === "or") {
      variants.push(...type2.variants);
    }
    if (type1.type !== "or") {
      variants.push(type1);
    }
    if (type2.type !== "or") {
      variants.push(type2);
    }

    return {
      type: "or",
      variants: mergeObjectsAndArrs(uniqTypes(variants))
    };
  }
  const { type } = type1;
  switch (type) {
    case "object":
      return extendObjs(type1, type2);
    case "array":
      return extendArrs(type1, type2);
    case "or":
      return {
        type: "or",
        variants: mergeObjectsAndArrs(
          uniqTypes([...type1.variants, ...type2.variants])
        )
      };
    case "all":
      return { type: "all" };
    case "empty":
      return { type: "empty" };
    default:
      return JSON.parse(JSON.stringify(type1));
  }
};

const mergeTypeArray = types => {
  return types.reduce(extendType, { type: "empty" });
};

const getTypeofValues = values => {
  const valuesTypes = values.map(getType);
  return mergeTypeArray(valuesTypes);
};

const renderObjType = t => {
  const lines = [];
  lines.push("{");
  const TAB = "  ";
  for (let [key, propType] of Object.entries(t.properties)) {
    const renderedPropType = renderType(propType);
    const [firstLine, ...others] = renderedPropType.split("\n");
    lines.push(`${TAB}${key}: ${firstLine}`);
    lines.push(...others.map(line => `${TAB + line}`));
  }
  lines.push("}");
  return lines.join("\n");
};
const isNotSimple = rendered => rendered.split(/\s/).length > 1;
const renderArrType = t => {
  const { elementType } = t;
  const renderedElementType = renderType(elementType);
  return isNotSimple(renderedElementType)
    ? `(${renderedElementType})[]`
    : `${renderedElementType}[]`;
};
const renderOrType = t => {
  const { variants } = t;
  const renderVariant = v => {
    const rendered = renderType(v);
    return isNotSimple(rendered) ? `(${rendered})` : rendered;
  };
  const renderedVariants = variants.map(renderVariant);
  return renderedVariants.join(" | ");
};

const renderType = t => {
  const { type } = t;
  switch (type) {
    case "object":
      return renderObjType(t);
    case "array":
      return renderArrType(t);
    case "or":
      return renderOrType(t);
    case "empty":
      return "empty";
    default:
      return type;
  }
};

const type = getTypeofValues([data]);

console.log(renderType(type));
