const moduleExports = (() => {
  const a = b =>
      "object" == typeof b
        ? null === b
          ? { type: "null" }
          : Array.isArray(b)
          ? { type: "array", elementType: l(b) }
          : {
              type: "object",
              properties: Object.assign(
                {},
                ...Object.keys(b).map(c => ({ [c]: a(b[c]) }))
              )
            }
        : { type: typeof b },
    b = a => c => {
      if (a.type !== c.type) return !1;
      const { type: d } = a;
      if (!["object", "array", "or"].includes(d)) return !0;
      if ("array" === d) return b(a.elementType)(c.elementType);
      if ("object" === d) {
        const d = Object.keys(a.properties),
          e = Object.keys(c.properties);
        return (
          d.length === e.length &&
          !!d.every(a => e.includes(a)) &&
          d.every(d => b(a.properties[d])(c.properties[d]))
        );
      }
      if ("or" === d) {
        const { variants: d } = a,
          { variants: e } = c;
        return d.length === e.length && !d.some(a => !e.find(b(a)));
      }
      return !1;
    },
    c = ({ properties: a }, { properties: b }) => {
      const c = [...new Set([...Object.keys(a), ...Object.keys(b)])],
        d = Object.assign(
          ...c.map(c => {
            const d = a[c] || { type: "undefined" },
              e = b[c] || { type: "undefined" };
            return { [c]: j(d, e) };
          })
        );
      return { type: "object", properties: d };
    },
    d = ({ elementType: a }, { elementType: b }) => ({
      type: "array",
      elementType: j(a, b)
    }),
    e = a => JSON.parse(JSON.stringify(a)),
    f = a => {
      const c = [];
      for (let d = 0; d < a.length; d++) {
        const e = a[d];
        c.some(b(e)) || c.push(e);
      }
      return (
        c.sort((a, b) =>
          a.type === b.type
            ? 0
            : "undefined" === a.type && "null" === b.type
            ? 1
            : "null" === a.type && "undefined" === b.type
            ? -1
            : "undefined" === a.type
            ? 1
            : "null" === a.type
            ? 1
            : -1
        ),
        e(c)
      );
    },
    g = a => (0 >= a.length ? [] : [a.reduce(d)]),
    h = a => (0 >= a.length ? [] : [a.reduce(c)]),
    i = a => {
      const b = a.filter(({ type: a }) => "object" === a),
        c = a.filter(({ type: a }) => "array" === a),
        d = a.filter(({ type: a }) => "array" !== a && "object" !== a);
      return [...d, ...g(c), ...h(b)];
    },
    j = (a, b) => {
      if ("empty" === a.type) return e(b);
      if ("empty" === b.type) return e(a);
      if (a.type !== b.type) {
        const c = [];
        return (
          "or" === a.type && c.push(...a.variants),
          "or" === b.type && c.push(...b.variants),
          "or" !== a.type && c.push(a),
          "or" !== b.type && c.push(b),
          { type: "or", variants: i(f(c)) }
        );
      }
      const { type: g } = a;
      return "object" === g
        ? c(a, b)
        : "array" === g
        ? d(a, b)
        : "or" === g
        ? { type: "or", variants: i(f([...a.variants, ...b.variants])) }
        : "empty" === g
        ? { type: "empty" }
        : JSON.parse(JSON.stringify(a));
    },
    k = a => a.reduce(j, { type: "empty" }),
    l = b => {
      const c = b.map(a);
      return k(c);
    },
    m = a => {
      const b = ["{"],
        c = "  ";
      for (let [d, e] of Object.entries(a.properties)) {
        const a = q(e),
          [f, ...g] = a.split("\n");
        b.push(`${c}${d}: ${f}`), b.push(...g.map(a => `${c + a}`));
      }
      return b.push("}"), b.join("\n");
    },
    n = a => 1 < a.split(/\s/).length,
    o = a => {
      const { elementType: b } = a,
        c = q(b);
      return n(c) ? `(${c})[]` : `${c}[]`;
    },
    p = a => {
      const { variants: b } = a,
        c = b.map(a => {
          const b = q(a);
          return n(b) ? `(${b})` : b;
        });
      return c.join(" | ");
    },
    q = a => {
      const { type: b } = a;
      return "object" === b
        ? m(a)
        : "array" === b
        ? o(a)
        : "or" === b
        ? p(a)
        : "empty" === b
        ? "empty"
        : b;
    };
  return { getTypeDefinition: (...a) => q(l(a)), getTypeofValues: l };
})();

(() => {
  try {
    const gl = window || global || module.exports;
    gl.getTypeDefinition = moduleExports.getTypeDefinition;
    gl.getTypeofValues = moduleExports.getTypeofValues;
  } catch (err) {}
})();

function h(e){var k=0;return function(){return k<e.length?{done:!1,value:e[k++]}:{done:!0}}}function l(e){var k="undefined"!=typeof Symbol&&Symbol.iterator&&e[Symbol.iterator];return k?k.call(e):{next:h(e)}}function r(e){for(var k,m=[];!(k=e.next()).done;)m.push(k.value);return m}function z(e){return e instanceof Array?e:r(l(e))}
module.f=function(){function e(a){var b=a.type;"object"===b?a=m(a):"array"===b?(a=e(a.c),a=1<a.split(/\s/).length?"("+a+")[]":a+"[]"):a="or"===b?k(a):"empty"===b?"empty":b;return a}function k(a){return a.b.map(function(b){b=e(b);return 1<b.split(/\s/).length?"("+b+")":b}).join(" | ")}function m(a){var b=["{"];a=l(Object.entries(a.a));for(var c=a.next();!c.done;c=a.next()){var d=l(c.value);c=d.next().value;d=d.next().value;d=e(d);var g=l(d.split("\n"));d=g.next().value;g=r(g);b.push("  "+c+": "+d);
b.push.apply(b,z(g.map(function(f){return"  "+f})))}return b.push("}"),b.join("\n")}function p(a){return a.map(t).reduce(q,{type:"empty"})}function q(a,b){if("empty"===a.type)return JSON.parse(JSON.stringify(b));if("empty"===b.type)return JSON.parse(JSON.stringify(a));if(a.type!==b.type){var c=[];return"or"===a.type&&c.push.apply(c,z(a.b)),"or"===b.type&&c.push.apply(c,z(b.b)),"or"!==a.type&&c.push(a),"or"!==b.type&&c.push(b),{type:"or",b:u(v(c))}}c=a.type;return"object"===c?w(a,b):"array"===c?x(a,
b):"or"===c?{type:"or",b:u(v([].concat(z(a.b),z(b.b))))}:"empty"===c?{type:"empty"}:JSON.parse(JSON.stringify(a))}function u(a){var b=a.filter(function(d){return"object"===d.type}),c=a.filter(function(d){return"array"===d.type});a=a.filter(function(d){d=d.type;return"array"!==d&&"object"!==d});return[].concat(z(a),z(0>=c.length?[]:[c.reduce(x)]),z(0>=b.length?[]:[b.reduce(w)]))}function v(a){for(var b=[],c=0;c<a.length;c++){var d=a[c];b.some(n(d))||b.push(d)}return b.sort(function(g,f){return g.type===
f.type?0:"undefined"===g.type&&"null"===f.type?1:"null"===g.type&&"undefined"===f.type?-1:"undefined"===g.type?1:"null"===g.type?1:-1}),JSON.parse(JSON.stringify(b))}function x(a,b){return{type:"array",c:q(a.c,b.c)}}function w(a,b){var c=a.a,d=b.a,g=[].concat(z(new Set([].concat(z(Object.keys(c)),z(Object.keys(d))))));return{type:"object",a:Object.assign.apply(Object,z(g.map(function(f){var y={};return y[f]=q(c[f]||{type:"undefined"},d[f]||{type:"undefined"}),y})))}}function n(a){return function(b){if(a.type!==
b.type)return!1;var c=a.type;if(!["object","array","or"].includes(c))return!0;if("array"===c)return n(a.c)(b.c);if("object"===c){c=Object.keys(a.a);var d=Object.keys(b.a);return c.length===d.length&&!!c.every(function(f){return d.includes(f)})&&c.every(function(f){return n(a.a[f])(b.a[f])})}if("or"===c){c=a.b;var g=b.b;return c.length===g.length&&!c.some(function(f){return!g.find(n(f))})}return!1}}function t(a){return"object"==typeof a?null===a?{type:"null"}:Array.isArray(a)?{type:"array",c:p(a)}:
{type:"object",a:Object.assign.apply(Object,[{}].concat(z(Object.keys(a).map(function(b){var c={};return c[b]=t(a[b]),c}))))}:{type:typeof a}}return{g:function(a){for(var b=[],c=0;c<arguments.length;++c)b[c-0]=arguments[c];return e(p(b))},h:p}}();