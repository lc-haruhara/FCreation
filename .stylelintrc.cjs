module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recess-order"
  ],
  plugins: ["stylelint-order"],
  customSyntax: "postcss-scss",

  rules: {
    // "order/properties-order": null,
    // "order/properties-alphabetical-order": null,

    // 順序ルール
    "order/order": [
      "custom-properties",
      "declarations"
    ],

    // 命名ルールゆるめる
    "scss/dollar-variable-pattern": null,
    "scss/at-mixin-pattern": null,
    "keyframes-name-pattern": null,

    // ベンダープレフィックス許可
    "property-no-vendor-prefix": null,
    "selector-no-vendor-prefix": null,

    // コメント系ゆるめる
    "scss/comment-no-empty": null,
    "scss/double-slash-comment-whitespace-inside": null,

    // 色・表記系ゆるめる
    "color-function-notation": null,
    "alpha-value-notation": null,
    "hue-degree-notation": null,

    // import周り
    "import-notation": null,

    // 改行ルールオフ
    "declaration-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "rule-empty-line-before": null,

    // 属性のクオート強制オフ
    "selector-attribute-quotes": null,

    // class命名ルールオフ
    "selector-class-pattern": null,

    // その他うるさい系
    "block-no-empty": null,
    "no-invalid-position-declaration": null,
    "font-family-no-missing-generic-family-keyword": null,
    "property-no-deprecated": null,

    // コメント系
    "scss/double-slash-comment-empty-line-before": null,
    "comment-empty-line-before": null,
    "comment-whitespace-inside": null,

    // 色系
    "color-hex-length": null,
    "color-function-alias-notation": null,

    // 値系
    "value-keyword-case": null,
    "length-zero-no-unit": null,

    // shorthand系
    "declaration-block-no-redundant-longhand-properties": null,
    "shorthand-property-no-redundant-values": null,

    // mixin呼び出し
    "scss/at-mixin-argumentless-call-parentheses": null,

    // url()
    "function-url-quotes": null,

    "selector-id-pattern": null,
    "scss/at-extend-no-missing-placeholder": null,
    "scss/operator-no-unspaced": null
  },

  overrides: [
    {
      files: ["**/*.astro"],
      customSyntax: "postcss-html"
    }
  ]
};