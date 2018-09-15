const Vue = require("./node_modules/vue/dist/vue");
const types = require("deep-typeof");
const renderjson = require("renderjson");

const typedef = typeName => t => {
  return `@typedef {${types.toJSDocType(t)}} ${typeName}`;
};

const defaultT = `{a: 1}`;
const app = new Vue({
  el: "#app",
  data: {
    inputText: defaultT,
    newTypeName: "newType",
    inputTypesAliases: '{}'
  },
  computed: {
    values () {
      try {
        const valuesText = this.inputText.split("|");
        const values = valuesText.map(e => eval(`(${e})`));
        return values;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    aliases () {
      try {
        const jsCodeOfAliasesDictionary = `(${this.inputTypesAliases})`
        return eval(jsCodeOfAliasesDictionary)
      } catch (err) {
        console.error(err)
        return {}
      }
    },
    calculatedType () {
      return types.concatAll(this.values.map(val => types.getType(val, this.aliases)));
    },
    outputJSON () {
      return this.render(this.calculatedType);
    },
    JSDoc () {
      return typedef(this.newTypeName)(this.calculatedType);
    },
    outputJSDoc () {
      return this.JSDoc;
    },
    valuesOutput () {
      return this.values.map(e => JSON.stringify(e)).join(",\n");
    }
  },
  methods: {
    render(val) {
      const docElem = renderjson.set_icons("", "").set_show_to_level(100)(val);
      return docElem.outerHTML;
    }
  }
});