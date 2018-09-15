const Vue = require("./node_modules/vue/dist/vue");
const types = require("deep-typeof");
const renderjson = require("renderjson");
const typedef = typeName => t => {
  return `@typedef {${types.toJSDocType(t)}} ${typeName}`;
};
const ONE_OF = "ONE_OF";

const defaultT = `{a: 1}`;
const app = new Vue({
  el: "#app",
  data: {
    inputText: defaultT,
    newTypeName: "newType"
  },
  computed: {
    values() {
      try {
        const valuesText = this.inputText.split("|");
        const values = valuesText.map(e => eval(`(${e})`));
        return values;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    calculatedType() {
      return types.concatAll(this.values.map(val => types.getType(val)));
    },
    outputJSON() {
      return this.render(this.calculatedType);
    },
    JSDoc() {
      return typedef(this.newTypeName)(this.calculatedType);
    },
    outputJSDoc() {
      return this.JSDoc;
    },
    output() {
      return `${this.outputJSON}<hr>${this.outputJSDoc}`;
    },
    valuesOutput() {
      return this.values.map(e => JSON.stringify(e)).join(",\n");
    }
  },
  methods: {
    render(val) {
      const docElem = renderjson.set_icons("", "").set_show_to_level(100)(val);
      return docElem.outerHTML;
    },
    copyJSDOCToClipboard() {}
  }
});