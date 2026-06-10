"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports2, module2) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports2, module2) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports2, module2) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src = exports2.src = [];
    var safeSrc = exports2.safeSrc = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports2, module2) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports2, module2) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports2, module2) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports2, module2) {
    "use strict";
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports2, module2) {
    "use strict";
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports2, module2) {
    "use strict";
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports2, module2) {
    "use strict";
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compare2 = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare2;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var rcompare = (a, b, loose) => compare2(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var compareLoose = (a, b) => compare2(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var gt = (a, b, loose) => compare2(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var lt3 = (a, b, loose) => compare2(a, b, loose) < 0;
    module2.exports = lt3;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var eq = (a, b, loose) => compare2(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var neq = (a, b, loose) => compare2(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var gte = (a, b, loose) => compare2(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports2, module2) {
    "use strict";
    var compare2 = require_compare();
    var lte = (a, b, loose) => compare2(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports2, module2) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt3 = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt3(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce3 = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module2.exports = coerce3;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports2, module2) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports2, module2) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range5 = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range5;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports2, module2) {
    "use strict";
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range5(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range5(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range5 = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var satisfies2 = (version, range, options) => {
      try {
        range = new Range5(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies2;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var toComparators = (range, options) => new Range5(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range5 = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range5(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range5 = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range5(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range5 = require_range();
    var gt = require_gt();
    var minVersion3 = (range, loose) => {
      range = new Range5(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion3;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var validRange = (range, options) => {
      try {
        return new Range5(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range5 = require_range();
    var satisfies2 = require_satisfies();
    var gt = require_gt();
    var lt3 = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range5(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt3;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt3;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies2(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range5(r1, options);
      r2 = new Range5(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports2, module2) {
    "use strict";
    var satisfies2 = require_satisfies();
    var compare2 = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare2(a, b, options));
      for (const version of v) {
        const included = satisfies2(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies2 = require_satisfies();
    var compare2 = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range5(sub, options);
      dom = new Range5(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt3;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt3 = lowerLT(lt3, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt3) {
        gtltComp = compare2(gt.semver, lt3.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt3.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies2(eq, String(gt), options)) {
          return null;
        }
        if (lt3 && !satisfies2(eq, String(lt3), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies2(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt3 && !options.includePrerelease && lt3.semver.prerelease.length ? lt3.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt3.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies2(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt3) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt3, c, options);
            if (lower === c && lower !== lt3) {
              return false;
            }
          } else if (lt3.operator === "<=" && !satisfies2(lt3.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt3 || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt3 && gtltComp !== 0) {
        return false;
      }
      if (lt3 && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare2(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare2(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports2, module2) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare2 = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt3 = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce3 = require_coerce();
    var Comparator = require_comparator();
    var Range5 = require_range();
    var satisfies2 = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion3 = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare: compare2,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt: lt3,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce: coerce3,
      Comparator,
      Range: Range5,
      satisfies: satisfies2,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion: minVersion3,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode10 = __toESM(require("vscode"));
var path6 = __toESM(require("path"));
var fs5 = __toESM(require("fs"));

// src/engine/scannerEngine.ts
var vscode2 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var fs3 = __toESM(require("fs"));

// src/types/finding.ts
var FindingCategory = /* @__PURE__ */ ((FindingCategory3) => {
  FindingCategory3["Credential"] = "credential";
  FindingCategory3["OWASP"] = "owasp";
  FindingCategory3["Dependency"] = "dependency";
  FindingCategory3["Misconfiguration"] = "misconfiguration";
  FindingCategory3["FileHygiene"] = "filehygiene";
  return FindingCategory3;
})(FindingCategory || {});

// src/engine/scannerRegistry.ts
var ScannerRegistry = class {
  constructor() {
    this.scanners = [];
  }
  register(scanner) {
    this.scanners.push(scanner);
  }
  getAll() {
    return [...this.scanners];
  }
  getByName(name) {
    return this.scanners.find((s) => s.name === name);
  }
};

// src/engine/secretHeuristics.ts
function shannonEntropy(value) {
  if (!value) {
    return 0;
  }
  const freq = /* @__PURE__ */ new Map();
  for (const ch of value) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
var PLACEHOLDER_PATTERNS = [
  /\$\{[^}]*\}/,
  // ${VAR}
  /\$\([^)]*\)/,
  // $(VAR)
  /\{\{[^}]*\}\}/,
  // {{ template }}
  /%[A-Za-z0-9_]+%/,
  // %VAR% (Windows)
  /<[^>]+>/,
  // <your-token>
  /^process\.env\b/i,
  // process.env.X
  /^os\.environ\b/i,
  // os.environ[...]
  /^env\[/i,
  // ENV['X']
  /^System\.getenv\b/i
];
var PLACEHOLDER_SUBSTRINGS = /(example|changeme|change[_-]?me|placeholder|your[_-]?|dummy|redacted|sample|xxxx+|\.\.\.|todo|fixme)/i;
var PLACEHOLDER_WORDS = /* @__PURE__ */ new Set([
  "changeme",
  "password",
  "passwd",
  "secret",
  "apikey",
  "api_key",
  "token",
  "example",
  "placeholder",
  "dummy",
  "test",
  "testing",
  "redacted",
  "sample",
  "none",
  "null",
  "undefined",
  "nil",
  "empty",
  "default",
  "notset",
  "not_set",
  "enter",
  "insert",
  "replace",
  "todo",
  "fixme",
  "foo",
  "bar",
  "baz",
  "qux",
  "admin",
  "root",
  "user",
  "username",
  "abc123",
  "123456",
  "12345678",
  "string",
  "value",
  "mykey",
  "mysecret",
  "mypassword",
  "yourkey",
  "yoursecret"
]);
function isPlaceholder(value) {
  const v = value.trim();
  if (v.length === 0) {
    return true;
  }
  if (/^(.)\1+$/.test(v)) {
    return true;
  }
  for (const re of PLACEHOLDER_PATTERNS) {
    if (re.test(v)) {
      return true;
    }
  }
  if (PLACEHOLDER_WORDS.has(v.toLowerCase())) {
    return true;
  }
  if (PLACEHOLDER_SUBSTRINGS.test(v)) {
    return true;
  }
  return false;
}

// src/engine/ruleEngine.ts
function getCommentMarkers(languageId) {
  switch (languageId) {
    case "python":
    case "ruby":
    case "shellscript":
    case "yaml":
    case "dockerfile":
    case "perl":
    case "r":
    case "powershell":
    case "pip-requirements":
    case "dotenv":
    case "properties":
    case "ini":
    case "toml":
    case "makefile":
      return ["#"];
    case "javascript":
    case "typescript":
    case "javascriptreact":
    case "typescriptreact":
    case "java":
    case "c":
    case "cpp":
    case "csharp":
    case "go":
    case "rust":
    case "swift":
    case "kotlin":
    case "php":
    case "scss":
    case "less":
      return ["//"];
    default:
      return ["//", "#"];
  }
}
function getLineCommentMarker(languageId) {
  return getCommentMarkers(languageId)[0];
}
var SUPPRESS_MARKER = "securescanner-ignore";
function lineSuppresses(ruleId, lineText) {
  const idx = lineText.indexOf(SUPPRESS_MARKER);
  if (idx === -1) {
    return false;
  }
  const rest = lineText.substring(idx + SUPPRESS_MARKER.length).trim();
  if (rest.length === 0) {
    return true;
  }
  return rest.split(/[\s,]+/).includes(ruleId);
}
function getLineText(content, lineOffsets, line) {
  if (line < 0 || line >= lineOffsets.length) {
    return "";
  }
  const start = lineOffsets[line];
  const end = line + 1 < lineOffsets.length ? lineOffsets[line + 1] - 1 : content.length;
  return content.substring(start, end);
}
function normalizeLanguageId(languageId) {
  switch (languageId) {
    case "javascriptreact":
      return "javascript";
    case "typescriptreact":
      return "typescript";
    default:
      return languageId;
  }
}
function buildCommentRanges(content, languageId, lineOffsets) {
  const ranges = [];
  const markers = getCommentMarkers(languageId);
  for (let i = 0; i < lineOffsets.length; i++) {
    const lineStart = lineOffsets[i];
    const lineEnd = i + 1 < lineOffsets.length ? lineOffsets[i + 1] - 1 : content.length;
    const line = content.substring(lineStart, lineEnd);
    for (const marker of markers) {
      const idx = findUnquotedMarker(line, marker);
      if (idx !== -1) {
        ranges.push({ start: lineStart + idx, end: lineEnd });
        break;
      }
    }
  }
  let mlMatch;
  const mlRegex = /\/\*[\s\S]*?\*\//g;
  while ((mlMatch = mlRegex.exec(content)) !== null) {
    ranges.push({ start: mlMatch.index, end: mlMatch.index + mlMatch[0].length });
  }
  const htmlRegex = /<!--[\s\S]*?-->/g;
  while ((mlMatch = htmlRegex.exec(content)) !== null) {
    ranges.push({ start: mlMatch.index, end: mlMatch.index + mlMatch[0].length });
  }
  return ranges;
}
function findUnquotedMarker(line, marker) {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : "";
    if (prev === "\\") {
      continue;
    }
    if (ch === "'" && !inDouble && !inBacktick) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle && !inBacktick) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === "`" && !inSingle && !inDouble) {
      inBacktick = !inBacktick;
      continue;
    }
    if (!inSingle && !inDouble && !inBacktick) {
      if (line.substring(i, i + marker.length) === marker) {
        return i;
      }
    }
  }
  return -1;
}
function isInComment(offset, commentRanges) {
  return commentRanges.some((r) => offset >= r.start && offset < r.end);
}
function buildLineOffsets(content) {
  const offsets = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") {
      offsets.push(i + 1);
    }
  }
  return offsets;
}
function offsetToPosition(offset, lineOffsets) {
  let low = 0;
  let high = lineOffsets.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (lineOffsets[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return { line: low, column: offset - lineOffsets[low] };
}
function executeRule(rule, context, lineOffsets, commentRanges) {
  const findings = [];
  if (context.isTestEnvironment && rule.testEnvironmentSafe) {
    return findings;
  }
  if (rule.languages && rule.languages.length > 0) {
    const contextLanguage = normalizeLanguageId(context.languageId);
    const ruleLanguages = rule.languages.map(normalizeLanguageId);
    if (!ruleLanguages.includes(contextLanguage)) {
      return findings;
    }
  }
  if (rule.filePatterns && rule.filePatterns.length > 0) {
    const fileName = context.filePath.split(/[/\\]/).pop() || "";
    const matches = rule.filePatterns.some((pattern) => {
      if (pattern.includes("*")) {
        const regex2 = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
        return regex2.test(fileName);
      }
      return fileName === pattern;
    });
    if (!matches) {
      return findings;
    }
  }
  const flags = rule.pattern.flags.includes("g") ? rule.pattern.flags : rule.pattern.flags + "g";
  const regex = new RegExp(rule.pattern.source, flags);
  const startTime = Date.now();
  const TIMEOUT_MS = 200;
  let match;
  while ((match = regex.exec(context.content)) !== null) {
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.warn(
        `SecureScanner: rule ${rule.id} exceeded ${TIMEOUT_MS}ms on ${context.filePath}; remaining matches in this file were skipped.`
      );
      break;
    }
    const start = offsetToPosition(match.index, lineOffsets);
    const end = offsetToPosition(match.index + match[0].length, lineOffsets);
    const onLine = getLineText(context.content, lineOffsets, start.line);
    const aboveLine = getLineText(context.content, lineOffsets, start.line - 1);
    if (lineSuppresses(rule.id, onLine) || lineSuppresses(rule.id, aboveLine)) {
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
      continue;
    }
    if (rule.secretGroup !== void 0) {
      const candidate = match[rule.secretGroup] ?? "";
      const tooLowEntropy = rule.minEntropy !== void 0 && shannonEntropy(candidate) < rule.minEntropy;
      if (isPlaceholder(candidate) || tooLowEntropy) {
        continue;
      }
    }
    const location = {
      filePath: context.filePath,
      startLine: start.line,
      startColumn: start.column,
      endLine: end.line,
      endColumn: end.column
    };
    let matchedText = match[0];
    if (rule.category === "credential" && matchedText.length > 8) {
      matchedText = matchedText.substring(0, 4) + "****" + matchedText.substring(matchedText.length - 4);
    }
    const inComment = isInComment(match.index, commentRanges);
    const severity = inComment ? 4 /* Info */ : rule.severity;
    const title = inComment ? `${rule.title} (in comment)` : rule.title;
    findings.push({
      id: rule.id,
      category: rule.category,
      severity,
      title,
      description: rule.description,
      location,
      matchedText,
      cweId: rule.cweId,
      owaspId: rule.owaspId
    });
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }
  return findings;
}
function runRules(rules, context) {
  const lineOffsets = buildLineOffsets(context.content);
  const commentRanges = buildCommentRanges(context.content, context.languageId, lineOffsets);
  const findings = [];
  for (const rule of rules) {
    try {
      const ruleFindings = executeRule(rule, context, lineOffsets, commentRanges);
      findings.push(...ruleFindings);
    } catch {
      console.warn(`SecureScanner: Rule ${rule.id} failed on ${context.filePath}`);
    }
  }
  return findings;
}

// src/rules/credentialRules.ts
var credentialRules = [
  {
    id: "CRED-001",
    title: "AWS Access Key Detected",
    description: "An AWS Access Key ID (long-term AKIA or temporary session ASIA) was found in the code. Move this to environment variables or a secrets manager.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-002",
    title: "AWS Secret Key Detected",
    description: "A potential AWS Secret Access Key was found. Never commit secrets to source control.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi,
    cweId: "CWE-798"
  },
  {
    id: "CRED-003",
    title: "Generic API Key Detected",
    description: "A hardcoded API key was found. Use environment variables or a secrets manager instead.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    // Quotes optional (so .env/shell/YAML match); charset includes - and _.
    pattern: /(?:api[_-]?key|apikey)["']?\s*[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/gi,
    secretGroup: 1,
    minEntropy: 3,
    cweId: "CWE-798"
  },
  {
    id: "CRED-004",
    title: "Private Key Detected",
    description: "A private key was found in the source code. Private keys should never be stored in code.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----/g,
    cweId: "CWE-321"
  },
  {
    id: "CRED-005",
    title: "Hardcoded Password Detected",
    description: "A hardcoded password was found. Use environment variables or a secrets manager.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    // Matches DB_PASSWORD=, userPassword:, etc. Quotes optional; placeholder and
    // low-entropy values are filtered by the engine heuristics.
    pattern: /(?:password|passwd|pwd)["']?\s*[:=]\s*['"]?([^\s'"]{4,})['"]?/gi,
    secretGroup: 1,
    minEntropy: 2.5,
    cweId: "CWE-798"
  },
  {
    id: "CRED-006",
    title: "GitHub Token Detected",
    description: "A GitHub personal access token was found. Rotate this token immediately and use environment variables.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /ghp_[A-Za-z0-9_]{36}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-007",
    title: "GitHub OAuth Token Detected",
    description: "A GitHub OAuth access token was found in the code.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /gho_[A-Za-z0-9_]{36}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-008",
    title: "Slack Token Detected",
    description: "A Slack token was found in the code. Rotate and store securely.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-009",
    title: "Generic Secret Assignment",
    description: "A potential secret was found hardcoded in the source. Move to environment variables.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    // Quotes optional; covers secret/token/auth and the common *_secret/*_token forms.
    pattern: /(?:client[_-]?secret|api[_-]?secret|access[_-]?token|refresh[_-]?token|secret|token|auth)["']?\s*[:=]\s*['"]?([A-Za-z0-9_\-+/=.]{16,})['"]?/gi,
    secretGroup: 1,
    minEntropy: 3,
    cweId: "CWE-798"
  },
  {
    id: "CRED-010",
    title: "Connection String with Credentials",
    description: "A database connection string with embedded credentials was detected.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mariadb|rediss?|amqps?|mssql|sqlserver|https?):\/\/[^:\s/@]+:[^@\s/]+@[^/\s]+/gi,
    cweId: "CWE-798"
  },
  {
    id: "CRED-011",
    title: "Google API Key Detected",
    description: "A Google API key was found. Restrict key usage and use environment variables.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-012",
    title: "Stripe Secret Key Detected",
    description: "A Stripe secret key was found. This grants full API access. Rotate immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-013",
    title: "JWT Token Detected",
    description: "A hardcoded JWT token was found. Tokens should be generated dynamically.",
    severity: 2 /* Medium */,
    category: "credential" /* Credential */,
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-014",
    title: "GitHub Token Detected (server/user/refresh)",
    description: "A GitHub server (ghs_), user-to-server (ghu_) or refresh (ghr_) token was found. Rotate immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bgh[sur]_[A-Za-z0-9]{36}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-015",
    title: "GitHub Fine-Grained PAT Detected",
    description: "A GitHub fine-grained personal access token was found. Rotate immediately and use a secrets manager.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bgithub_pat_[0-9a-zA-Z_]{82}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-016",
    title: "GitLab Personal Access Token Detected",
    description: "A GitLab personal access token (glpat-) was found. Rotate immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bglpat-[0-9a-zA-Z_-]{20}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-017",
    title: "npm Access Token Detected",
    description: "An npm access token (npm_) was found. Rotate it and use an .npmrc with an environment variable.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bnpm_[0-9a-zA-Z]{36}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-018",
    title: "PyPI API Token Detected",
    description: "A PyPI upload token (pypi-) was found. Rotate it on PyPI immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-019",
    title: "Hugging Face Token Detected",
    description: "A Hugging Face access token (hf_) was found. Rotate it in your account settings.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\bhf_[A-Za-z0-9]{34}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-020",
    title: "OpenAI API Key Detected",
    description: "An OpenAI API key was found. Rotate it immediately; it grants billable API access.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bsk-(?:proj-[A-Za-z0-9_-]{40,}|[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20,})\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-021",
    title: "Anthropic API Key Detected",
    description: "An Anthropic API key (sk-ant-) was found. Rotate it immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bsk-ant-[A-Za-z0-9-]{2,}-[A-Za-z0-9_-]{80,}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-022",
    title: "Google OAuth Client Secret Detected",
    description: "A Google OAuth client secret (GOCSPX-) was found. Rotate it in the Google Cloud console.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\bGOCSPX-[A-Za-z0-9_-]{28}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-023",
    title: "Slack Incoming Webhook Detected",
    description: "A Slack incoming webhook URL was found. Anyone with this URL can post to the channel; rotate it.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]{20,}/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-024",
    title: "Stripe Restricted Key Detected",
    description: "A Stripe restricted API key (rk_live_) was found. Rotate it immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\brk_live_[0-9a-zA-Z]{24,}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-025",
    title: "Stripe Webhook Secret Detected",
    description: "A Stripe webhook signing secret (whsec_) was found. Rotate it in the Stripe dashboard.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\bwhsec_[A-Za-z0-9]{32,}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-026",
    title: "SendGrid API Key Detected",
    description: "A SendGrid API key (SG.) was found. Rotate it immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-027",
    title: "Twilio API Key Detected",
    description: "A Twilio API key SID (SK...) was found. Rotate it in the Twilio console.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\bSK[0-9a-fA-F]{32}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-028",
    title: "Sentry DSN Detected",
    description: "A Sentry DSN was found. Treat it as a secret if it includes a private key component.",
    severity: 2 /* Medium */,
    category: "credential" /* Credential */,
    pattern: /https:\/\/[0-9a-f]{32}@(?:[a-z0-9.-]+\.)?(?:ingest\.)?sentry\.io\/[0-9]+/gi,
    cweId: "CWE-798"
  },
  {
    id: "CRED-029",
    title: "DigitalOcean Token Detected",
    description: "A DigitalOcean personal access / OAuth token (do?_v1_) was found. Rotate it immediately.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /\bdo[oprv]_v1_[a-f0-9]{64}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-030",
    title: "Discord Bot Token Detected",
    description: "A Discord bot token was found. Rotate it in the Discord developer portal.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\b[MNO][A-Za-z0-9_-]{23}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-031",
    title: "Telegram Bot Token Detected",
    description: "A Telegram bot token was found. Rotate it via BotFather.",
    severity: 1 /* High */,
    category: "credential" /* Credential */,
    pattern: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g,
    cweId: "CWE-798"
  },
  {
    id: "CRED-032",
    title: "Azure Storage Account Key Detected",
    description: "An Azure Storage account key was found in a connection string. Rotate the key in the Azure portal.",
    severity: 0 /* Critical */,
    category: "credential" /* Credential */,
    pattern: /AccountKey=[A-Za-z0-9+/]{86}==/gi,
    cweId: "CWE-798"
  }
];

// src/scanners/credentialScanner.ts
var CredentialScanner = class {
  constructor() {
    this.name = "CredentialScanner";
  }
  scan(context) {
    return runRules(credentialRules, context);
  }
};

// src/rules/owaspRules.ts
var owaspRules = [
  // A03:2021 - Injection
  {
    id: "OWASP-001",
    title: "Potential SQL Injection",
    description: "String concatenation in SQL query detected. Use parameterized queries instead.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:query|execute|exec)\s*\(\s*['"`](?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s[^'"`]*['"`]\s*\+/gi,
    languages: ["javascript", "typescript", "python", "java", "php"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-002",
    title: "SQL Injection via Template Literal",
    description: "SQL query uses template literal with interpolated values. Use parameterized queries.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:query|execute|exec)\s*\(\s*`(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s[^`]*\$\{/gi,
    languages: ["javascript", "typescript"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-003",
    title: "Use of eval() - Code Injection Risk",
    description: "eval() executes arbitrary code and is a major security risk. Avoid eval entirely.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    // Exclude method calls like model.eval()/df.eval() (PyTorch/pandas) and
    // identifiers ending in eval (e.g. ast.literal_eval handled by the \w guard).
    pattern: /(?<![.\w])eval\s*\(/g,
    languages: ["javascript", "typescript", "python"],
    cweId: "CWE-95",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-004",
    title: "Use of Function() Constructor",
    description: "The Function constructor creates functions from strings, similar to eval(). Avoid it.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /new\s+Function\s*\(/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-95",
    owaspId: "A03:2021"
  },
  // A03:2021 - XSS
  {
    id: "OWASP-005",
    title: "Potential XSS via innerHTML",
    description: "Setting innerHTML with dynamic content can lead to XSS. Use textContent or sanitize input.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /\.innerHTML\s*=/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-79",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-006",
    title: "Potential XSS via document.write",
    description: "document.write() can introduce XSS vulnerabilities. Use DOM manipulation methods instead.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /document\.write\s*\(/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-79",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-007",
    title: "React dangerouslySetInnerHTML",
    description: "dangerouslySetInnerHTML can lead to XSS if not properly sanitized.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /dangerouslySetInnerHTML/g,
    languages: ["javascript", "typescript", "javascriptreact", "typescriptreact"],
    cweId: "CWE-79",
    owaspId: "A03:2021"
  },
  // A08:2021 - Insecure Deserialization
  {
    id: "OWASP-008",
    title: "Insecure Deserialization (pickle)",
    description: "pickle.loads() can execute arbitrary code. Use json or safe alternatives.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /pickle\.loads?\s*\(/g,
    languages: ["python"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  {
    id: "OWASP-009",
    title: "Insecure YAML Loading",
    description: "yaml.load() without SafeLoader can execute arbitrary code. Use yaml.safe_load() instead.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /yaml\.load\s*\((?![^)]*SafeLoader)[^)]*\)/g,
    languages: ["python"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  // A02:2021 - Cryptographic Failures
  {
    id: "OWASP-010",
    title: "Weak Cryptographic Algorithm (MD5)",
    description: "MD5 is cryptographically broken. Use SHA-256 or stronger algorithms.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    // Two shapes: the algorithm is in the function name (hashlib.md5(...),
    // CryptoJS.MD5(...)) or in the argument (createHash('md5'),
    // MessageDigest.getInstance("MD5")).
    pattern: /(?:hashlib\.md5|CryptoJS\.MD5)\s*\(|(?:createHash|MessageDigest\.getInstance)\s*\(\s*['"]md5['"]/gi,
    cweId: "CWE-327",
    owaspId: "A02:2021"
  },
  {
    id: "OWASP-011",
    title: "Weak Cryptographic Algorithm (SHA1)",
    description: "SHA-1 is deprecated for security use. Use SHA-256 or stronger.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /(?:hashlib\.sha1|CryptoJS\.SHA1)\s*\(|(?:createHash|MessageDigest\.getInstance)\s*\(\s*['"]sha-?1['"]/gi,
    cweId: "CWE-327",
    owaspId: "A02:2021"
  },
  // A07:2021 - Command Injection
  {
    id: "OWASP-012",
    title: "Potential Command Injection",
    description: "User input in shell commands can lead to command injection. Use parameterized commands.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:exec|spawn|execSync|spawnSync|system|popen)\s*\(\s*(?:['"`][^'"`]*['"`]\s*\+|`[^`]*\$\{)/g,
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-013",
    title: "Python os.system() Usage",
    description: "os.system() is vulnerable to command injection. Use subprocess with shell=False.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /os\.system\s*\(/g,
    languages: ["python"],
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  // A05:2021 - Security Misconfiguration
  {
    id: "OWASP-014",
    title: "Disabled CSRF Protection",
    description: "CSRF protection appears to be disabled. Ensure CSRF tokens are validated.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:csrf|xsrf)\s*[:=]\s*(?:false|disabled|off)/gi,
    cweId: "CWE-352",
    owaspId: "A05:2021"
  },
  // A01:2021 - Broken Access Control
  {
    id: "OWASP-015",
    title: "Potential Path Traversal",
    description: "File path constructed from user input may allow path traversal attacks.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:readFile|readFileSync|open|createReadStream)\s*\(\s*(?:req\.|request\.|params\.|query\.)/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-22",
    owaspId: "A01:2021"
  },
  {
    id: "OWASP-016",
    title: "SQL Injection via f-string",
    description: "A SQL statement is built with a Python f-string. Use parameterized queries (e.g. cursor.execute(sql, params)).",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:execute|executemany|query|raw)\s*\(\s*f['"](?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b[^'"]*\{/gi,
    languages: ["python"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-017",
    title: "SQL Injection via string formatting",
    description: "A SQL string is interpolated with .format() or the % operator. Use parameterized queries instead.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /['"](?:SELECT|INSERT|UPDATE|DELETE|DROP)\b[^'"]*['"]\s*(?:\.format\s*\(|%\s*[\w([])/gi,
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-018",
    title: "SQL query built by concatenation",
    description: "A SQL statement is assigned to a variable and built with concatenation. Use parameterized queries.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /\b\w*(?:sql|query|stmt)\w*\s*=\s*['"](?:SELECT|INSERT|UPDATE|DELETE|DROP)\b[^'"]*['"]\s*\+/gi,
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  // A10:2021 - Server-Side Request Forgery (SSRF)
  {
    id: "OWASP-019",
    title: "Potential SSRF (Server-Side Request Forgery)",
    description: "An HTTP request is made to a URL derived from user input. Validate and allowlist outbound URLs.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:axios|fetch|got|superagent|needle)\s*(?:\.\s*(?:get|post|put|delete|patch|request|head))?\s*\(\s*[^)]{0,80}(?:req\.|request\.|params\.|query\.|body\.)/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-918",
    owaspId: "A10:2021"
  },
  {
    id: "OWASP-020",
    title: "Potential SSRF (Server-Side Request Forgery)",
    description: "An HTTP request is made to a URL derived from request data. Validate and allowlist outbound URLs.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:requests\.(?:get|post|put|delete|patch|head|request)|urlopen|urllib\.request\.urlopen)\s*\(\s*[^)]{0,80}(?:request\.(?:args|form|values|json|GET|POST)|input\()/g,
    languages: ["python"],
    cweId: "CWE-918",
    owaspId: "A10:2021"
  },
  // A05:2021 - XML External Entity (XXE)
  {
    id: "OWASP-021",
    title: "Potential XXE in XML Parsing",
    description: "XML is parsed without disabling external entities. Use defusedxml or disable entity resolution.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /(?:lxml\.etree|etree)\.(?:parse|fromstring)\s*\(|xml\.sax\.make_parser\s*\(|minidom\.parse(?:String)?\s*\(/g,
    languages: ["python"],
    cweId: "CWE-611",
    owaspId: "A05:2021"
  },
  {
    id: "OWASP-022",
    title: "Potential XXE in XML Parsing",
    description: "XML factory created without disabling external entities. Set features to disallow DOCTYPE/external entities.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /(?:DocumentBuilderFactory|SAXParserFactory|XMLInputFactory|TransformerFactory)\.newInstance\s*\(/g,
    languages: ["java"],
    cweId: "CWE-611",
    owaspId: "A05:2021"
  },
  {
    id: "OWASP-023",
    title: "Potential XXE in XML Parsing",
    description: "XmlDocument/XmlTextReader with default settings may resolve external entities. Set XmlResolver to null.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /new\s+Xml(?:Document|TextReader)\s*\(/g,
    languages: ["csharp"],
    cweId: "CWE-611",
    owaspId: "A05:2021"
  },
  // A05:2021 - Insecure cookies
  {
    id: "OWASP-024",
    title: "Insecure Cookie Configuration",
    description: "A cookie is set with httpOnly or secure disabled, exposing it to theft. Enable both flags.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /(?:httpOnly|secure)\s*[:=]\s*false\b/gi,
    cweId: "CWE-614",
    owaspId: "A05:2021"
  },
  // A01:2021 - Open redirect
  {
    id: "OWASP-025",
    title: "Potential Open Redirect",
    description: "A redirect target is derived from user input. Validate against an allowlist of destinations.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:res|response)\.redirect\s*\(\s*[^)]{0,60}(?:req\.|request\.|params\.|query\.|body\.)/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-601",
    owaspId: "A01:2021"
  },
  {
    id: "OWASP-026",
    title: "Potential Open Redirect",
    description: "A redirect target is derived from request data. Validate against an allowlist of destinations.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:redirect|HttpResponseRedirect)\s*\(\s*[^)]{0,60}request\.(?:args|GET|POST|values|form)/g,
    languages: ["python"],
    cweId: "CWE-601",
    owaspId: "A01:2021"
  },
  // A07:2021 - Identification and Authentication Failures
  {
    id: "OWASP-027",
    title: 'JWT Signature Algorithm "none"',
    description: 'A JWT is configured with algorithm "none", disabling signature verification. Use a strong algorithm.',
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:algorithm|alg)\s*[:=]\s*['"]?none['"]?/gi,
    cweId: "CWE-347",
    owaspId: "A07:2021"
  },
  {
    id: "OWASP-028",
    title: "JWT Signature Verification Disabled",
    description: "A JWT is decoded with signature verification disabled. Always verify the signature.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /jwt\.decode\s*\([^)]{0,120}(?:verify\s*=\s*False|['"]verify_signature['"]\s*:\s*False)/gi,
    languages: ["python"],
    cweId: "CWE-347",
    owaspId: "A07:2021"
  },
  // A02:2021 - TLS verification disabled
  {
    id: "OWASP-029",
    title: "TLS Certificate Verification Disabled",
    description: "TLS certificate verification is disabled (rejectUnauthorized: false), enabling man-in-the-middle attacks.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /rejectUnauthorized\s*:\s*false/gi,
    languages: ["javascript", "typescript"],
    cweId: "CWE-295",
    owaspId: "A02:2021"
  },
  {
    id: "OWASP-030",
    title: "TLS Certificate Verification Disabled",
    description: "TLS verification is disabled (InsecureSkipVerify: true), enabling man-in-the-middle attacks.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /InsecureSkipVerify\s*:\s*true/g,
    languages: ["go"],
    cweId: "CWE-295",
    owaspId: "A02:2021"
  },
  {
    id: "OWASP-031",
    title: "TLS Certificate Verification Disabled",
    description: "cURL peer verification is disabled (CURLOPT_SSL_VERIFYPEER false/0), enabling man-in-the-middle attacks.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /CURLOPT_SSL_VERIFYPEER\s*,\s*(?:false|0)\b/gi,
    languages: ["php"],
    cweId: "CWE-295",
    owaspId: "A02:2021"
  },
  // A09:2021 - Security Logging Failures (logging sensitive data)
  {
    id: "OWASP-032",
    title: "Sensitive Data in Logs",
    description: "A secret-like value is written to logs. Avoid logging passwords, tokens or keys.",
    severity: 2 /* Medium */,
    category: "owasp" /* OWASP */,
    pattern: /(?:console\.(?:log|info|debug|warn|error)|(?:logger|logging)\.(?:info|debug|warning|warn|error)|\bprint|\bprintln|System\.out\.print(?:ln)?|fmt\.Print(?:ln|f)?)\s*\(\s*[^)]{0,80}(?:password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|credit[_-]?card)/gi,
    cweId: "CWE-532",
    owaspId: "A09:2021"
  },
  // A08:2021 - Insecure Deserialization (non-Python)
  {
    id: "OWASP-033",
    title: "Insecure Deserialization (Java)",
    description: "ObjectInputStream.readObject() can execute arbitrary code on untrusted input. Avoid native serialization.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /new\s+ObjectInputStream\b|\.readObject\s*\(\s*\)/g,
    languages: ["java"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  {
    id: "OWASP-034",
    title: "Insecure Deserialization (PHP)",
    description: "unserialize() on untrusted input can lead to object injection. Use json_decode for data.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /\bunserialize\s*\(/g,
    languages: ["php"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  {
    id: "OWASP-035",
    title: "Insecure Deserialization (Ruby)",
    description: "Marshal.load / YAML.load on untrusted input can execute arbitrary code. Use YAML.safe_load / JSON.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /(?:Marshal\.load|YAML\.load|Oj\.load)\s*\(/g,
    languages: ["ruby"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  {
    id: "OWASP-036",
    title: "Insecure Deserialization (.NET)",
    description: "BinaryFormatter and similar serializers are unsafe on untrusted input. Use a safe serializer.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /\b(?:BinaryFormatter|NetDataContractSerializer|LosFormatter|SoapFormatter)\b/g,
    languages: ["csharp"],
    cweId: "CWE-502",
    owaspId: "A08:2021"
  },
  // A03:2021 - Command injection (additional languages)
  {
    id: "OWASP-037",
    title: "Potential Command Injection (PHP)",
    description: "A shell command includes a PHP variable. Use escapeshellarg() or avoid shell execution.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:system|exec|shell_exec|passthru|popen|proc_open)\s*\(\s*[^)]{0,80}\$/g,
    languages: ["php"],
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-038",
    title: "Potential Command Injection (Ruby)",
    description: "A shell command interpolates a variable. Use a parameterized form of system/exec.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:system|exec|spawn)\s*\(?\s*["'][^"'\n]{0,80}#\{|`[^`\n]{0,80}#\{/g,
    languages: ["ruby"],
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-039",
    title: "Potential Command Injection (Go)",
    description: "exec.Command builds an argument via concatenation. Pass arguments separately, never via a shell string.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /exec\.Command\s*\(\s*[^)]{0,80}\+/g,
    languages: ["go"],
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-040",
    title: "Potential Command Injection (.NET)",
    description: "Process.Start builds a command via concatenation. Validate input and avoid shell interpretation.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /Process\.Start\s*\(\s*[^)]{0,80}\+/g,
    languages: ["csharp"],
    cweId: "CWE-78",
    owaspId: "A03:2021"
  },
  // A03:2021 - SQL injection (additional languages)
  {
    id: "OWASP-041",
    title: "Potential SQL Injection (.NET)",
    description: "A SQL command is built with concatenation or string interpolation. Use parameterized queries.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    pattern: /(?:SqlCommand|OleDbCommand|MySqlCommand|ExecuteReader|ExecuteNonQuery|ExecuteScalar)\s*\(\s*(?:[@$]?"[^"]{0,120}"\s*\+|\$"[^"]{0,120}\{)/g,
    languages: ["csharp"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-042",
    title: "Potential SQL Injection (PHP)",
    description: "A SQL query includes a PHP variable directly. Use prepared statements with bound parameters.",
    severity: 0 /* Critical */,
    category: "owasp" /* OWASP */,
    // Require the variable to appear inside the SQL string (double-quote
    // interpolation) or a concatenation, so the mysqli connection arg ($conn)
    // does not trigger a false positive.
    pattern: /(?:mysqli_query|mysql_query|pg_query|->query|->exec)\s*\([^;)]{0,160}(?:"[^"]{0,140}\$|\.\s*\$)/g,
    languages: ["php"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  },
  {
    id: "OWASP-043",
    title: "Potential SQL Injection (Go)",
    description: "A SQL query is built with fmt.Sprintf or concatenation. Use placeholders and pass args separately.",
    severity: 1 /* High */,
    category: "owasp" /* OWASP */,
    pattern: /\.(?:Query|QueryRow|Exec)\s*\(\s*(?:fmt\.Sprintf|[^),]{0,120}\+)/g,
    languages: ["go"],
    cweId: "CWE-89",
    owaspId: "A03:2021"
  }
];

// src/scanners/owaspScanner.ts
var OwaspScanner = class {
  constructor() {
    this.name = "OwaspScanner";
  }
  scan(context) {
    return runRules(owaspRules, context);
  }
};

// src/scanners/dependencyScanner.ts
var semver = __toESM(require_semver2());

// src/rules/dependencyRules.ts
var npmVulnerabilities = [
  {
    package: "lodash",
    vulnerableRange: "<4.17.21",
    fixedVersion: "4.17.21",
    cve: "CVE-2021-23337",
    severity: "high",
    description: "Command injection via template function."
  },
  {
    package: "minimist",
    vulnerableRange: "<1.2.6",
    fixedVersion: "1.2.6",
    cve: "CVE-2021-44906",
    severity: "critical",
    description: "Prototype pollution vulnerability."
  },
  {
    package: "node-fetch",
    vulnerableRange: "<2.6.7",
    fixedVersion: "2.6.7",
    cve: "CVE-2022-0235",
    severity: "high",
    description: "Exposure of sensitive information to unauthorized actor."
  },
  {
    package: "axios",
    vulnerableRange: "<1.6.0",
    fixedVersion: "1.6.0",
    cve: "CVE-2023-45857",
    severity: "medium",
    description: "Cross-Site Request Forgery (CSRF) via cookie exposure."
  },
  {
    package: "express",
    vulnerableRange: "<4.19.2",
    fixedVersion: "4.19.2",
    cve: "CVE-2024-29041",
    severity: "medium",
    description: "Open redirect vulnerability."
  },
  {
    package: "jsonwebtoken",
    vulnerableRange: "<9.0.0",
    fixedVersion: "9.0.0",
    cve: "CVE-2022-23529",
    severity: "high",
    description: "Insecure implementation of key retrieval function."
  },
  {
    package: "tar",
    vulnerableRange: "<6.1.9",
    fixedVersion: "6.1.9",
    cve: "CVE-2021-37712",
    severity: "high",
    description: "Arbitrary file creation/overwrite via insufficient symlink protection."
  },
  {
    package: "shell-quote",
    vulnerableRange: "<1.7.3",
    fixedVersion: "1.7.3",
    cve: "CVE-2021-42740",
    severity: "critical",
    description: "Command injection via specially crafted arguments."
  },
  {
    package: "moment",
    vulnerableRange: "<2.29.4",
    fixedVersion: "2.29.4",
    cve: "CVE-2022-31129",
    severity: "high",
    description: "Path traversal vulnerability in locale file loading."
  },
  {
    package: "qs",
    vulnerableRange: "<6.10.3",
    fixedVersion: "6.10.3",
    cve: "CVE-2022-24999",
    severity: "high",
    description: "Prototype pollution via crafted query strings."
  }
];
var pipVulnerabilities = [
  {
    package: "django",
    vulnerableRange: "<4.2.8",
    fixedVersion: "4.2.8",
    cve: "CVE-2023-46695",
    severity: "medium",
    description: "Denial of service via large file upload handling."
  },
  {
    package: "flask",
    vulnerableRange: "<2.3.2",
    fixedVersion: "2.3.2",
    cve: "CVE-2023-30861",
    severity: "high",
    description: "Session cookie exposure on shared hosts."
  },
  {
    package: "requests",
    vulnerableRange: "<2.31.0",
    fixedVersion: "2.31.0",
    cve: "CVE-2023-32681",
    severity: "medium",
    description: "Unintended leak of Proxy-Authorization header."
  },
  {
    package: "pyyaml",
    vulnerableRange: "<6.0.1",
    fixedVersion: "6.0.1",
    cve: "CVE-2020-14343",
    severity: "critical",
    description: "Arbitrary code execution via full_load/load function."
  },
  {
    package: "pillow",
    vulnerableRange: "<10.0.1",
    fixedVersion: "10.0.1",
    cve: "CVE-2023-44271",
    severity: "high",
    description: "Denial of service via uncontrolled resource consumption."
  },
  {
    package: "cryptography",
    vulnerableRange: "<41.0.6",
    fixedVersion: "41.0.6",
    cve: "CVE-2023-49083",
    severity: "high",
    description: "NULL pointer dereference when loading PKCS7 certificates."
  }
];

// src/scanners/dependencyScanner.ts
var DependencyScanner = class {
  constructor() {
    this.name = "DependencyScanner";
    this.currentNpmVulns = npmVulnerabilities;
    this.currentPipVulns = pipVulnerabilities;
  }
  updateVulnerabilities(npm, pip) {
    this.currentNpmVulns = npm;
    this.currentPipVulns = pip;
  }
  getVulnCounts() {
    return { npm: this.currentNpmVulns.length, pip: this.currentPipVulns.length };
  }
  scan(context) {
    const fileName = context.filePath.split(/[/\\]/).pop() || "";
    if (fileName === "package.json") {
      return this.scanPackageJson(context);
    }
    if (fileName === "requirements.txt") {
      return this.scanRequirementsTxt(context);
    }
    return [];
  }
  scanPackageJson(context) {
    const findings = [];
    try {
      const pkg = JSON.parse(context.content);
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
      for (const [name, versionRange] of Object.entries(allDeps)) {
        const vuln = this.currentNpmVulns.find((v) => v.package === name);
        if (!vuln) {
          continue;
        }
        const cleanVersion = semver.minVersion(versionRange);
        if (!cleanVersion) {
          continue;
        }
        if (semver.satisfies(cleanVersion, vuln.vulnerableRange)) {
          const location = this.findDependencyLocation(context.content, name);
          findings.push({
            id: `DEP-${vuln.cve}`,
            category: "dependency" /* Dependency */,
            severity: this.mapSeverity(vuln.severity),
            title: `Vulnerable dependency: ${name}`,
            description: `${vuln.description} (${vuln.cve}). Update to ${vuln.fixedVersion} or later.`,
            location: {
              filePath: context.filePath,
              ...location
            },
            cweId: "CWE-1035"
          });
        }
      }
    } catch {
    }
    return findings;
  }
  scanRequirementsTxt(context) {
    const findings = [];
    const lines = context.content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) {
        continue;
      }
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*(?:==|>=|<=|~=|!=)\s*([0-9.]+)/);
      if (!match) {
        continue;
      }
      const [, pkgName, version] = match;
      const vuln = this.currentPipVulns.find(
        (v) => v.package.toLowerCase() === pkgName.toLowerCase()
      );
      if (!vuln) {
        continue;
      }
      const cleanVersion = semver.coerce(version);
      const vulnRange = semver.coerce(vuln.fixedVersion);
      if (cleanVersion && vulnRange && semver.lt(cleanVersion, vulnRange)) {
        findings.push({
          id: `DEP-${vuln.cve}`,
          category: "dependency" /* Dependency */,
          severity: this.mapSeverity(vuln.severity),
          title: `Vulnerable dependency: ${pkgName}`,
          description: `${vuln.description} (${vuln.cve}). Update to ${vuln.fixedVersion} or later.`,
          location: {
            filePath: context.filePath,
            startLine: i,
            startColumn: 0,
            endLine: i,
            endColumn: line.length
          },
          cweId: "CWE-1035"
        });
      }
    }
    return findings;
  }
  findDependencyLocation(content, packageName) {
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`"${packageName}"`)) {
        return {
          startLine: i,
          startColumn: 0,
          endLine: i,
          endColumn: lines[i].length
        };
      }
    }
    return { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 };
  }
  mapSeverity(severity) {
    switch (severity) {
      case "critical":
        return 0 /* Critical */;
      case "high":
        return 1 /* High */;
      case "medium":
        return 2 /* Medium */;
      case "low":
        return 3 /* Low */;
      default:
        return 4 /* Info */;
    }
  }
};

// src/rules/misconfigRules.ts
var misconfigRules = [
  {
    id: "MISC-001",
    title: "Insecure HTTP URL",
    description: "Non-localhost HTTP URL detected. Use HTTPS for secure communication.",
    severity: 2 /* Medium */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0|::1|www\.w3\.org\/)[a-zA-Z0-9][a-zA-Z0-9.-]+/g,
    cweId: "CWE-319"
  },
  {
    id: "MISC-002",
    title: "Wildcard CORS Configuration",
    description: "CORS is configured to allow all origins. Restrict to specific trusted domains.",
    severity: 1 /* High */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /(?:cors\(\s*\{\s*origin:\s*['"]?\*['"]?|Access-Control-Allow-Origin:\s*\*)/g,
    cweId: "CWE-942"
  },
  {
    id: "MISC-003",
    title: "TLS Certificate Verification Disabled",
    description: "TLS certificate verification is disabled, allowing man-in-the-middle attacks.",
    severity: 0 /* Critical */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /(?:NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0|rejectUnauthorized\s*:\s*false|verify\s*=\s*False)/g,
    cweId: "CWE-295",
    testEnvironmentSafe: true
  },
  {
    id: "MISC-004",
    title: "Debug Mode Enabled",
    description: "Debug mode appears to be enabled. Ensure this is disabled in production.",
    severity: 2 /* Medium */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /(?:DEBUG\s*[:=]\s*(?:true|True|1|['"]true['"])|app\.debug\s*=\s*True)/g,
    cweId: "CWE-215",
    testEnvironmentSafe: true
  },
  {
    id: "MISC-005",
    title: "Insecure Random Number Generator",
    description: "Math.random() is not cryptographically secure. Use crypto.randomBytes() for security purposes.",
    severity: 2 /* Medium */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /Math\.random\s*\(\)/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-338"
  },
  {
    id: "MISC-006",
    title: "Empty Catch Block",
    description: "Empty catch block silently swallows errors. Log or handle errors appropriately.",
    severity: 3 /* Low */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    cweId: "CWE-390"
  },
  {
    id: "MISC-007",
    title: "Hardcoded IP Address",
    description: "Hardcoded IP address found. Use configuration files or environment variables.",
    severity: 3 /* Low */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /['"](?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)['"]/g,
    cweId: "CWE-547"
  },
  {
    id: "MISC-008",
    title: "Helmet.js Not Used",
    description: "Express app without Helmet security headers middleware detected.",
    severity: 2 /* Medium */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /app\s*=\s*express\s*\(\)/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-693"
  },
  {
    id: "MISC-009",
    title: "Console.log in Production Code",
    description: "console.log statements may leak sensitive information in production.",
    severity: 4 /* Info */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /console\.log\s*\(/g,
    languages: ["javascript", "typescript"],
    cweId: "CWE-532"
  },
  {
    id: "MISC-010",
    title: "Binding to All Interfaces (0.0.0.0)",
    description: "Server is binding to all network interfaces. Consider binding to a specific interface.",
    severity: 2 /* Medium */,
    category: "misconfiguration" /* Misconfiguration */,
    pattern: /(?:listen|bind)\s*\(\s*(?:['"]0\.0\.0\.0['"]|0\.0\.0\.0)/g,
    cweId: "CWE-668"
  }
];

// src/scanners/misconfigScanner.ts
var VERSION_CONTEXT_PATTERN = /(?:version|versie|versienummer|version_?number)\b|(?:^|[\s(,=:])v\d/i;
var MisconfigScanner = class {
  constructor() {
    this.name = "MisconfigScanner";
  }
  scan(context) {
    const findings = runRules(misconfigRules, context);
    return findings.filter((f) => {
      if (f.id !== "MISC-007") {
        return true;
      }
      return !this.isVersionContext(context.content, f.location.startLine);
    });
  }
  /**
   * Check if the line containing the match has version-related context,
   * indicating the matched "IP" is actually a version number.
   */
  isVersionContext(content, lineNumber) {
    const lines = content.split("\n");
    if (lineNumber < 0 || lineNumber >= lines.length) {
      return false;
    }
    return VERSION_CONTEXT_PATTERN.test(lines[lineNumber]);
  }
};

// src/scanners/fileHygieneScanner.ts
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));

// src/rules/fileHygieneRules.ts
var gitignoreRequiredPatterns = [
  {
    id: "FH-001",
    pattern: ".env",
    title: "Missing .env in .gitignore",
    description: "Environment files (.env) often contain secrets, API keys, and database credentials. Add .env and .env.* to .gitignore to prevent accidental commits.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    id: "FH-002",
    pattern: "*.pem",
    title: "Missing *.pem in .gitignore",
    description: "PEM certificate/key files may contain private keys. Add *.pem to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    id: "FH-003",
    pattern: "*.key",
    title: "Missing *.key in .gitignore",
    description: "Key files may contain private cryptographic keys. Add *.key to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    id: "FH-004",
    pattern: "*.p12",
    title: "Missing *.p12 in .gitignore",
    description: "PKCS#12 files contain certificates and private keys. Add *.p12 to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    id: "FH-005",
    pattern: "*.pfx",
    title: "Missing *.pfx in .gitignore",
    description: "PFX files contain certificates and private keys. Add *.pfx to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    id: "FH-006",
    pattern: "*.sqlite",
    title: "Missing database files in .gitignore",
    description: "SQLite database files may contain sensitive data. Add *.sqlite and *.db to .gitignore.",
    severity: 2 /* Medium */,
    cweId: "CWE-540"
  },
  {
    id: "FH-007",
    pattern: "credentials.json",
    title: "Missing credentials.json in .gitignore",
    description: "Credential files (credentials.json, serviceAccountKey.json) contain secrets. Add them to .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    id: "FH-008",
    pattern: "id_rsa",
    title: "Missing SSH keys in .gitignore",
    description: "SSH private keys (id_rsa, id_ed25519) should never be committed. Add id_rsa* and id_ed25519* to .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-321"
  },
  {
    id: "FH-009",
    pattern: ".htpasswd",
    title: "Missing .htpasswd in .gitignore",
    description: ".htpasswd contains hashed passwords for HTTP authentication. Add it to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-540"
  },
  {
    id: "FH-010",
    pattern: "*.keystore",
    title: "Missing keystore files in .gitignore",
    description: "Java keystore files contain certificates and private keys. Add *.keystore and *.jks to .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  }
];
var aiignoreRequiredPatterns = [
  {
    id: "FH-011",
    pattern: ".env",
    title: "Missing .env in .aiignore",
    description: "Environment files contain secrets that AI tools should not access. Add .env and .env.* to .aiignore.",
    severity: 1 /* High */,
    cweId: "CWE-540"
  },
  {
    id: "FH-012",
    pattern: "*.pem",
    title: "Missing *.pem in .aiignore",
    description: "Certificate/key files should not be accessible to AI tools. Add *.pem to .aiignore.",
    severity: 2 /* Medium */,
    cweId: "CWE-321"
  },
  {
    id: "FH-013",
    pattern: "*.key",
    title: "Missing *.key in .aiignore",
    description: "Key files should not be accessible to AI tools. Add *.key to .aiignore.",
    severity: 2 /* Medium */,
    cweId: "CWE-321"
  },
  {
    id: "FH-014",
    pattern: "credentials.json",
    title: "Missing credentials.json in .aiignore",
    description: "Credential files should not be accessible to AI tools. Add credentials.json to .aiignore.",
    severity: 1 /* High */,
    cweId: "CWE-540"
  },
  {
    id: "FH-015",
    pattern: "id_rsa",
    title: "Missing SSH keys in .aiignore",
    description: "SSH private keys should not be accessible to AI tools. Add id_rsa* to .aiignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  }
];
var sensitiveFilePatterns = [
  {
    glob: "**/.env",
    ruleId: "FH-020",
    title: "Sensitive .env file not gitignored",
    description: "An .env file exists in the workspace and is not excluded by .gitignore. This file likely contains secrets and should be gitignored.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    glob: "**/.env.*",
    ruleId: "FH-021",
    title: "Sensitive .env.* file not gitignored",
    description: "An environment variant file (.env.local, .env.production, etc.) exists and is not excluded by .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    glob: "**/*.pem",
    ruleId: "FH-022",
    title: "Certificate/key file not gitignored",
    description: "A .pem file exists in the workspace and is not excluded by .gitignore. It may contain private keys.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    glob: "**/*.key",
    ruleId: "FH-023",
    title: "Private key file not gitignored",
    description: "A .key file exists in the workspace and is not excluded by .gitignore. It likely contains a private key.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    glob: "**/id_rsa",
    ruleId: "FH-024",
    title: "SSH private key not gitignored",
    description: "An SSH private key (id_rsa) exists in the workspace and is not excluded by .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-321"
  },
  {
    glob: "**/credentials.json",
    ruleId: "FH-025",
    title: "Credentials file not gitignored",
    description: "A credentials.json file exists in the workspace and is not excluded by .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    glob: "**/serviceAccountKey.json",
    ruleId: "FH-026",
    title: "Service account key not gitignored",
    description: "A Google service account key file exists in the workspace and is not excluded by .gitignore.",
    severity: 0 /* Critical */,
    cweId: "CWE-540"
  },
  {
    glob: "**/*.sqlite",
    ruleId: "FH-027",
    title: "Database file not gitignored",
    description: "A SQLite database file exists in the workspace and is not excluded by .gitignore. It may contain sensitive data.",
    severity: 2 /* Medium */,
    cweId: "CWE-540"
  },
  {
    glob: "**/*.p12",
    ruleId: "FH-028",
    title: "PKCS#12 certificate not gitignored",
    description: "A .p12 certificate file exists in the workspace and is not excluded by .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  },
  {
    glob: "**/*.pfx",
    ruleId: "FH-029",
    title: "PFX certificate not gitignored",
    description: "A .pfx certificate file exists in the workspace and is not excluded by .gitignore.",
    severity: 1 /* High */,
    cweId: "CWE-321"
  }
];

// src/scanners/fileHygieneScanner.ts
var FileHygieneScanner = class {
  constructor() {
    this.name = "FileHygieneScanner";
  }
  scan(context) {
    const fileName = context.filePath.split(/[/\\]/).pop() || "";
    if (fileName === ".gitignore" && context.isGitProject !== false) {
      return this.scanGitignore(context);
    }
    if (fileName === ".aiignore") {
      return this.scanAiignore(context);
    }
    return [];
  }
  /**
   * Scan the workspace for file hygiene issues that can't be detected
   * from file content alone (missing files, unignored sensitive files).
   * Called separately from the normal per-file scan.
   */
  async scanWorkspace(workspaceRoot, isGitProject = true) {
    const findings = [];
    if (isGitProject) {
      const gitignorePath = path.join(workspaceRoot, ".gitignore");
      if (!fs.existsSync(gitignorePath)) {
        findings.push({
          id: "FH-100",
          category: "filehygiene" /* FileHygiene */,
          severity: 1 /* High */,
          title: "Missing .gitignore file",
          description: "No .gitignore file found in the workspace root. Without a .gitignore, sensitive files like .env, private keys, and credentials may be accidentally committed to version control.",
          location: {
            filePath: workspaceRoot,
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 0
          },
          cweId: "CWE-540"
        });
      }
      const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
      for (const sensitiveFile of sensitiveFilePatterns) {
        if (this.isPatternCovered(sensitiveFile.glob, gitignoreContent)) {
          continue;
        }
        try {
          const files = await vscode.workspace.findFiles(
            sensitiveFile.glob,
            "**/node_modules/**",
            5
          );
          for (const file of files) {
            findings.push({
              id: sensitiveFile.ruleId,
              category: "filehygiene" /* FileHygiene */,
              severity: sensitiveFile.severity,
              title: sensitiveFile.title,
              description: sensitiveFile.description,
              location: {
                filePath: file.fsPath,
                startLine: 0,
                startColumn: 0,
                endLine: 0,
                endColumn: 0
              },
              cweId: sensitiveFile.cweId
            });
          }
        } catch {
        }
      }
    }
    const aiignorePath = path.join(workspaceRoot, ".aiignore");
    if (!fs.existsSync(aiignorePath)) {
      findings.push({
        id: "FH-101",
        category: "filehygiene" /* FileHygiene */,
        severity: 2 /* Medium */,
        title: "Missing .aiignore file",
        description: "No .aiignore file found in the workspace root. Without an .aiignore, AI tools (Copilot, Claude, etc.) may read sensitive files like .env and private keys. Create an .aiignore to control what AI tools can access.",
        location: {
          filePath: workspaceRoot,
          startLine: 0,
          startColumn: 0,
          endLine: 0,
          endColumn: 0
        },
        cweId: "CWE-540"
      });
    }
    return findings;
  }
  scanGitignore(context) {
    const findings = [];
    const content = context.content;
    for (const rule of gitignoreRequiredPatterns) {
      if (!this.isPatternCovered(rule.pattern, content)) {
        const lines = content.split("\n");
        const lastNonEmptyLine = this.findLastNonEmptyLine(lines);
        findings.push({
          id: rule.id,
          category: "filehygiene" /* FileHygiene */,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          location: {
            filePath: context.filePath,
            startLine: lastNonEmptyLine,
            startColumn: 0,
            endLine: lastNonEmptyLine,
            endColumn: lines[lastNonEmptyLine]?.length || 0
          },
          cweId: rule.cweId
        });
      }
    }
    return findings;
  }
  scanAiignore(context) {
    const findings = [];
    const content = context.content;
    for (const rule of aiignoreRequiredPatterns) {
      if (!this.isPatternCovered(rule.pattern, content)) {
        const lines = content.split("\n");
        const lastNonEmptyLine = this.findLastNonEmptyLine(lines);
        findings.push({
          id: rule.id,
          category: "filehygiene" /* FileHygiene */,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          location: {
            filePath: context.filePath,
            startLine: lastNonEmptyLine,
            startColumn: 0,
            endLine: lastNonEmptyLine,
            endColumn: lines[lastNonEmptyLine]?.length || 0
          },
          cweId: rule.cweId
        });
      }
    }
    return findings;
  }
  /**
   * Check if a sensitive pattern is covered by the ignore file content.
   * Handles common gitignore syntaxes:
   * - Exact match: .env
   * - Wildcard: *.pem
   * - Directory patterns: .env.*
   * - Negation awareness: !.env.example should not count as coverage
   */
  isPatternCovered(pattern, ignoreContent) {
    const lines = ignoreContent.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    const normalizedPattern = pattern.replace(/\*\*\//g, "").replace(/^\.\//, "");
    for (const line of lines) {
      if (line.startsWith("!")) {
        continue;
      }
      const normalizedLine = line.replace(/^\//, "");
      if (normalizedLine === normalizedPattern) {
        return true;
      }
      if (normalizedLine === normalizedPattern) {
        return true;
      }
      if (normalizedPattern === ".env") {
        if (normalizedLine === ".env" || normalizedLine === ".env*" || normalizedLine === ".env.*") {
          return true;
        }
      }
      if (normalizedPattern === ".env.*") {
        if (normalizedLine === ".env.*" || normalizedLine === ".env*") {
          return true;
        }
      }
      if (normalizedPattern.startsWith("*.")) {
        const ext = normalizedPattern.substring(1);
        if (normalizedLine === normalizedPattern || normalizedLine === "*" + ext) {
          return true;
        }
      }
      if (normalizedPattern === "id_rsa") {
        if (normalizedLine === "id_rsa" || normalizedLine === "id_rsa*" || normalizedLine === "**/id_rsa") {
          return true;
        }
      }
      if (normalizedPattern === "credentials.json" || normalizedPattern === "serviceAccountKey.json") {
        if (normalizedLine === normalizedPattern || normalizedLine === "**/" + normalizedPattern) {
          return true;
        }
      }
      if (normalizedPattern === ".htpasswd") {
        if (normalizedLine === ".htpasswd" || normalizedLine === "**/.htpasswd") {
          return true;
        }
      }
      if (normalizedPattern === "*.keystore") {
        if (normalizedLine === "*.keystore" || normalizedLine === "*.jks") {
          return true;
        }
      }
      if (normalizedPattern === "*.sqlite") {
        if (normalizedLine === "*.sqlite" || normalizedLine === "*.db") {
          return true;
        }
      }
    }
    return false;
  }
  findLastNonEmptyLine(lines) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().length > 0) {
        return i;
      }
    }
    return 0;
  }
};

// src/engine/dependencyResolver.ts
var semver2 = __toESM(require_semver2());
function findLine(content, needle) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      return i;
    }
  }
  return 0;
}
function parsePackageLock(content, manifestPath) {
  const deps = [];
  let lock;
  try {
    lock = JSON.parse(content);
  } catch {
    return deps;
  }
  if (!lock || typeof lock !== "object") {
    return deps;
  }
  const lockObj = lock;
  const packages = lockObj.packages;
  if (packages) {
    for (const [pkgPath, info] of Object.entries(packages)) {
      if (!pkgPath || !info || info.link || !info.version) {
        continue;
      }
      const marker = "node_modules/";
      const idx = pkgPath.lastIndexOf(marker);
      const name = info.name || (idx >= 0 ? pkgPath.substring(idx + marker.length) : pkgPath);
      if (!name) {
        continue;
      }
      deps.push({
        ecosystem: "npm",
        name,
        version: info.version,
        resolved: true,
        manifestPath,
        line: findLine(content, `"${pkgPath}"`)
      });
    }
    if (deps.length > 0) {
      return deps;
    }
  }
  const walk = (tree) => {
    if (!tree) {
      return;
    }
    for (const [name, info] of Object.entries(tree)) {
      if (info && info.version) {
        deps.push({
          ecosystem: "npm",
          name,
          version: info.version,
          resolved: true,
          manifestPath,
          line: findLine(content, `"${name}"`)
        });
      }
      if (info && info.dependencies) {
        walk(info.dependencies);
      }
    }
  };
  walk(lockObj.dependencies);
  return deps;
}
function parsePackageJson(content, manifestPath) {
  const deps = [];
  let pkg;
  try {
    pkg = JSON.parse(content);
  } catch {
    return deps;
  }
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, range] of Object.entries(all)) {
    if (!range || range.includes(":") || range === "*" || range === "x" || range === "latest") {
      continue;
    }
    const min = semver2.minVersion(range);
    if (!min || min.version === "0.0.0") {
      continue;
    }
    deps.push({
      ecosystem: "npm",
      name,
      version: min.version,
      resolved: false,
      manifestPath,
      line: findLine(content, `"${name}"`)
    });
  }
  return deps;
}
function normalizePyPiName(name) {
  return name.toLowerCase().replace(/[-_.]+/g, "-");
}
function parseRequirementsTxt(content, manifestPath) {
  const deps = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith("#") || line.startsWith("-")) {
      continue;
    }
    line = line.split(" #")[0].split(";")[0].trim();
    const match = line.match(/^([A-Za-z0-9._-]+)\s*(?:\[[^\]]*\])?\s*(==|===|>=|~=)\s*([A-Za-z0-9.*+!-]+)/);
    if (!match) {
      continue;
    }
    const [, rawName, op, version] = match;
    if (version.includes("*")) {
      continue;
    }
    deps.push({
      ecosystem: "PyPI",
      name: normalizePyPiName(rawName),
      version,
      resolved: op === "==" || op === "===",
      manifestPath,
      line: i
    });
  }
  return deps;
}

// src/engine/osvClient.ts
var https = __toESM(require("https"));
var OSV_HOST = "api.osv.dev";
var BATCH_LIMIT = 1e3;
var DETAIL_CONCURRENCY = 8;
function request2(method, path7, body) {
  return new Promise((resolve, reject) => {
    const headers = { "Content-Type": "application/json" };
    if (body !== void 0) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }
    const options = {
      hostname: OSV_HOST,
      path: path7,
      method,
      headers
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`OSV HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(3e4, () => {
      req.destroy();
      reject(new Error("OSV request timeout"));
    });
    if (body !== void 0) {
      req.write(body);
    }
    req.end();
  });
}
async function osvQueryBatch(queries) {
  const out = [];
  for (let offset = 0; offset < queries.length; offset += BATCH_LIMIT) {
    const chunk = queries.slice(offset, offset + BATCH_LIMIT);
    const body = JSON.stringify({
      queries: chunk.map((q) => ({
        version: q.version,
        package: { name: q.name, ecosystem: q.ecosystem }
      }))
    });
    const response = await request2("POST", "/v1/querybatch", body);
    const parsed = JSON.parse(response);
    const results = parsed.results || [];
    for (let i = 0; i < chunk.length; i++) {
      const vulns = results[i]?.vulns || [];
      out.push(vulns.map((v) => v.id));
    }
  }
  return out;
}
async function osvGetVuln(id) {
  const response = await request2("GET", `/v1/vulns/${encodeURIComponent(id)}`);
  return JSON.parse(response);
}
async function osvGetVulns(ids) {
  const unique = [...new Set(ids)];
  const map = /* @__PURE__ */ new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const id = unique[cursor++];
      try {
        map.set(id, await osvGetVuln(id));
      } catch {
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(DETAIL_CONCURRENCY, unique.length) },
    () => worker()
  );
  await Promise.all(workers);
  return map;
}
function osvSeverity(vuln) {
  if (vuln.severity) {
    for (const s of vuln.severity) {
      const score = parseFloat(s.score);
      if (!isNaN(score)) {
        if (score >= 9) {
          return "critical";
        }
        if (score >= 7) {
          return "high";
        }
        if (score >= 4) {
          return "medium";
        }
        return "low";
      }
    }
  }
  const dbSeverity = vuln.database_specific?.severity?.toLowerCase();
  if (dbSeverity === "critical") {
    return "critical";
  }
  if (dbSeverity === "high") {
    return "high";
  }
  if (dbSeverity === "moderate" || dbSeverity === "medium") {
    return "medium";
  }
  if (dbSeverity === "low") {
    return "low";
  }
  return "medium";
}
function osvFixedVersion(vuln, name, ecosystem) {
  if (!vuln.affected) {
    return "";
  }
  for (const affected of vuln.affected) {
    if (!affected.package || affected.package.name.toLowerCase() !== name.toLowerCase() || affected.package.ecosystem.toLowerCase() !== ecosystem.toLowerCase()) {
      continue;
    }
    for (const range of affected.ranges || []) {
      if (range.type === "GIT") {
        continue;
      }
      for (const event of range.events) {
        if (event.fixed) {
          return event.fixed;
        }
      }
    }
  }
  return "";
}

// src/engine/baselineManager.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var BASELINE_FILENAME = ".securescanner-baseline.json";
var BaselineManager = class {
  constructor() {
    this.fingerprints = /* @__PURE__ */ new Set();
    this.loadedRoot = null;
  }
  baselinePath(root) {
    return path2.join(root, BASELINE_FILENAME);
  }
  /** Load the baseline for a workspace root if not already loaded for it. */
  ensureLoaded(root) {
    if (this.loadedRoot === root) {
      return;
    }
    this.load(root);
  }
  load(root) {
    this.loadedRoot = root;
    this.fingerprints.clear();
    try {
      const raw = fs2.readFileSync(this.baselinePath(root), "utf8");
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed.fingerprints;
      if (Array.isArray(list)) {
        for (const fp of list) {
          if (typeof fp === "string") {
            this.fingerprints.add(fp);
          }
        }
      }
    } catch {
    }
  }
  has(fingerprint) {
    return this.fingerprints.has(fingerprint);
  }
  /** Add fingerprints to the baseline for a root and persist the file. */
  add(root, fingerprintsToAdd) {
    this.ensureLoaded(root);
    for (const fp of fingerprintsToAdd) {
      this.fingerprints.add(fp);
    }
    this.save(root);
  }
  save(root) {
    const body = { fingerprints: [...this.fingerprints].sort() };
    fs2.writeFileSync(this.baselinePath(root), JSON.stringify(body, null, 2), "utf8");
  }
};

// src/utils/fingerprint.ts
function fnv1a(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
function basename(filePath) {
  return filePath.split(/[/\\]/).pop() || filePath;
}
function computeFingerprint(ruleId, filePath, snippet) {
  return fnv1a(`${ruleId}|${basename(filePath)}|${snippet}`);
}

// src/utils/glob.ts
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
        if (glob[i + 1] === "/") {
          i++;
          re += "(?:/)?";
        }
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else if ("\\^$.|+()[]{}".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}
function matchesGlob(filePath, glob) {
  const normalized = filePath.replace(/\\/g, "/");
  const target = glob.includes("/") ? normalized : normalized.split("/").pop() || normalized;
  return globToRegExp(glob).test(target);
}
function matchesAnyGlob(filePath, globs) {
  return globs.some((g) => matchesGlob(filePath, g));
}

// src/engine/scannerEngine.ts
var WORKSPACE_FILE_CAP = 5e3;
var ScannerEngine = class {
  constructor() {
    this._onFindingsChanged = new vscode2.EventEmitter();
    this.onFindingsChanged = this._onFindingsChanged.event;
    this.findingsMap = /* @__PURE__ */ new Map();
    // Dependency scanning is async (OSV network query), so it runs outside the
    // synchronous per-file registry loop. Concurrent triggers share one run.
    this.depScanPromise = null;
    this.workspaceScanRunning = false;
    this.baseline = new BaselineManager();
    this.registry = new ScannerRegistry();
    this.registry.register(new CredentialScanner());
    this.registry.register(new OwaspScanner());
    this.dependencyScanner = new DependencyScanner();
    this.registry.register(new MisconfigScanner());
    this.fileHygieneScanner = new FileHygieneScanner();
    this.registry.register(this.fileHygieneScanner);
  }
  loadExternalVulnDb(vulnDbPath) {
    try {
      const data = fs3.readFileSync(vulnDbPath, "utf8");
      const db = JSON.parse(data);
      const npm = Array.isArray(db.npmVulnerabilities) ? db.npmVulnerabilities : null;
      const pip = Array.isArray(db.pipVulnerabilities) ? db.pipVulnerabilities : null;
      if (!npm || !pip) {
        console.warn("SecureScanner: external vulnerability DB malformed, keeping built-in rules");
        return;
      }
      if (npm.length === 0 && pip.length === 0) {
        console.warn("SecureScanner: external vulnerability DB is empty, keeping built-in rules");
        return;
      }
      this.dependencyScanner.updateVulnerabilities(npm, pip);
    } catch {
      console.warn("SecureScanner: Could not load external vulnerability database");
    }
  }
  getConfig() {
    const config = vscode2.workspace.getConfiguration("secureScanner");
    const thresholdStr = config.get("severityThreshold", "Low");
    const severityMap = {
      "Critical": 0 /* Critical */,
      "High": 1 /* High */,
      "Medium": 2 /* Medium */,
      "Low": 3 /* Low */,
      "Info": 4 /* Info */
    };
    return {
      enableOnSave: config.get("enableOnSave", true),
      enableOnOpen: config.get("enableOnOpen", true),
      severityThreshold: severityMap[thresholdStr] ?? 3 /* Low */,
      ignorePaths: config.get("ignorePaths", [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**"
      ]),
      enabledCategories: config.get("enabledCategories", [
        "credential" /* Credential */,
        "owasp" /* OWASP */,
        "dependency" /* Dependency */,
        "misconfiguration" /* Misconfiguration */,
        "filehygiene" /* FileHygiene */
      ]),
      maxFileSizeKB: config.get("maxFileSizeKB", 512),
      projectType: config.get("projectType", "auto"),
      isTestEnvironment: config.get("isTestEnvironment", false),
      excludeFolders: config.get("excludeFolders", "results"),
      pipIndexUrl: config.get("pipIndexUrl", "https://pypi.org/pypi"),
      enableOsvOnlineScan: config.get("enableOsvOnlineScan", true)
    };
  }
  scanDocument(document) {
    const config = this.getConfig();
    const filePath = document.uri.fsPath;
    if (!this.workspaceScanRunning && this.isManifestFile(filePath)) {
      void this.scanDependencies();
    }
    const content = document.getText();
    if (content.length > config.maxFileSizeKB * 1024) {
      return [];
    }
    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders.split(";").map((f) => f.trim()).filter((f) => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }
    if (matchesAnyGlob(filePath, effectiveIgnorePaths)) {
      return [];
    }
    const workspaceFolder = vscode2.workspace.getWorkspaceFolder(document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || "";
    const isGitProject = workspaceRoot ? this.resolveIsGitProject(config.projectType, workspaceRoot) : true;
    const context = {
      filePath,
      content,
      languageId: document.languageId,
      isGitProject,
      isTestEnvironment: config.isTestEnvironment
    };
    const findings = [];
    const scanners = this.registry.getAll();
    for (const scanner of scanners) {
      const scannerFindings = scanner.scan(context);
      const filtered = scannerFindings.filter((f) => {
        if (!config.enabledCategories.includes(f.category)) {
          return false;
        }
        if (f.severity > config.severityThreshold) {
          return false;
        }
        return true;
      });
      findings.push(...filtered);
    }
    const visible = this.applyBaseline(findings);
    this.findingsMap.set(filePath, visible);
    this._onFindingsChanged.fire(this.findingsMap);
    return visible;
  }
  async scanWorkspace(token) {
    this.findingsMap.clear();
    const allFindings = [];
    const config = this.getConfig();
    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders.split(";").map((f) => f.trim()).filter((f) => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }
    const ignorePattern = effectiveIgnorePaths.length > 0 ? "{" + effectiveIgnorePaths.join(",") + "}" : void 0;
    const files = await vscode2.workspace.findFiles(
      "**/*",
      ignorePattern,
      WORKSPACE_FILE_CAP
    );
    if (files.length >= WORKSPACE_FILE_CAP) {
      vscode2.window.showWarningMessage(
        `SecureScanner: workspace has more than ${WORKSPACE_FILE_CAP} files; only the first ${WORKSPACE_FILE_CAP} were scanned. Add folders to "secureScanner.ignorePaths" / "excludeFolders" to narrow the scan.`
      );
    }
    this.workspaceScanRunning = true;
    for (const file of files) {
      if (token?.isCancellationRequested) {
        break;
      }
      try {
        const document = await vscode2.workspace.openTextDocument(file);
        const findings = this.scanDocument(document);
        allFindings.push(...findings);
      } catch {
      }
    }
    this.workspaceScanRunning = false;
    if (config.enabledCategories.includes("dependency" /* Dependency */)) {
      const depFindings = await this.scanDependencies();
      allFindings.push(...depFindings);
    }
    if (config.enabledCategories.includes("filehygiene" /* FileHygiene */)) {
      const workspaceFolders = vscode2.workspace.workspaceFolders;
      if (workspaceFolders) {
        for (const folder of workspaceFolders) {
          const isGit = this.resolveIsGitProject(config.projectType, folder.uri.fsPath);
          const hygieneFindings = await this.fileHygieneScanner.scanWorkspace(folder.uri.fsPath, isGit);
          const filtered = this.applyBaseline(
            hygieneFindings.filter((f) => f.severity <= config.severityThreshold)
          );
          allFindings.push(...filtered);
          this.findingsMap.set(folder.uri.fsPath, filtered);
        }
        this._onFindingsChanged.fire(this.findingsMap);
      }
    }
    return allFindings;
  }
  isManifestFile(filePath) {
    const name = path3.basename(filePath);
    return name === "package.json" || name === "package-lock.json" || name === "requirements.txt";
  }
  /**
   * Scan the workspace's dependencies for known vulnerabilities. Concurrent
   * callers share a single in-flight run so rapid manifest saves do not trigger
   * redundant OSV queries. Findings are merged into the findings map and an
   * onFindingsChanged event is fired when the run completes.
   */
  scanDependencies() {
    if (this.depScanPromise) {
      return this.depScanPromise;
    }
    this.depScanPromise = this.runDependencyScan().finally(() => {
      this.depScanPromise = null;
    });
    return this.depScanPromise;
  }
  async runDependencyScan() {
    const config = this.getConfig();
    if (!config.enabledCategories.includes("dependency" /* Dependency */)) {
      return [];
    }
    const manifests = await this.discoverManifests(config);
    if (manifests.length === 0) {
      return [];
    }
    const { deps, manifestFiles } = this.resolveDependencies(manifests);
    if (deps.length === 0) {
      return [];
    }
    let findings;
    if (config.enableOsvOnlineScan) {
      try {
        findings = await this.scanWithOsv(deps);
      } catch {
        findings = this.scanWithBuiltinRules(manifestFiles);
      }
    } else {
      findings = this.scanWithBuiltinRules(manifestFiles);
    }
    findings = this.applyBaseline(findings.filter((f) => f.severity <= config.severityThreshold));
    this.mergeDependencyFindings(findings);
    this._onFindingsChanged.fire(this.findingsMap);
    return findings;
  }
  async discoverManifests(config) {
    const effectiveIgnorePaths = [...config.ignorePaths];
    const excludeFolders = config.excludeFolders.split(";").map((f) => f.trim()).filter((f) => f.length > 0);
    for (const folder of excludeFolders) {
      effectiveIgnorePaths.push(`**/${folder}/**`);
    }
    if (!effectiveIgnorePaths.some((p) => p.includes("node_modules"))) {
      effectiveIgnorePaths.push("**/node_modules/**");
    }
    const ignorePattern = effectiveIgnorePaths.length > 0 ? "{" + effectiveIgnorePaths.join(",") + "}" : void 0;
    const files = await vscode2.workspace.findFiles(
      "**/{package.json,package-lock.json,requirements.txt}",
      ignorePattern,
      2e3
    );
    const out = [];
    for (const file of files) {
      try {
        const content = fs3.readFileSync(file.fsPath, "utf8");
        out.push({ path: file.fsPath, content, fileName: path3.basename(file.fsPath) });
      } catch {
      }
    }
    return out;
  }
  resolveDependencies(manifests) {
    const byDir = /* @__PURE__ */ new Map();
    const reqFiles = [];
    const manifestFiles = [];
    for (const m of manifests) {
      const dir = path3.dirname(m.path);
      if (m.fileName === "package.json") {
        const entry = byDir.get(dir) || {};
        entry.pkg = m;
        byDir.set(dir, entry);
        manifestFiles.push(m);
      } else if (m.fileName === "package-lock.json") {
        const entry = byDir.get(dir) || {};
        entry.lock = m;
        byDir.set(dir, entry);
      } else if (m.fileName === "requirements.txt") {
        reqFiles.push(m);
        manifestFiles.push(m);
      }
    }
    const deps = [];
    for (const { pkg, lock } of byDir.values()) {
      if (lock) {
        deps.push(...parsePackageLock(lock.content, lock.path));
      } else if (pkg) {
        deps.push(...parsePackageJson(pkg.content, pkg.path));
      }
    }
    for (const req of reqFiles) {
      deps.push(...parseRequirementsTxt(req.content, req.path));
    }
    return { deps, manifestFiles };
  }
  async scanWithOsv(deps) {
    const keyOf = (d) => `${d.ecosystem}|${d.name}|${d.version}`;
    const uniqueQueries = /* @__PURE__ */ new Map();
    for (const d of deps) {
      const k = keyOf(d);
      if (!uniqueQueries.has(k)) {
        uniqueQueries.set(k, { name: d.name, ecosystem: d.ecosystem, version: d.version });
      }
    }
    const queries = [...uniqueQueries.values()];
    const idsPerQuery = await osvQueryBatch(queries);
    const idsByKey = /* @__PURE__ */ new Map();
    queries.forEach((q, i) => idsByKey.set(keyOf(q), idsPerQuery[i] || []));
    const allIds = idsPerQuery.flat();
    if (allIds.length === 0) {
      return [];
    }
    const details = await osvGetVulns(allIds);
    const findings = [];
    const seen = /* @__PURE__ */ new Set();
    for (const d of deps) {
      const ids = idsByKey.get(keyOf(d)) || [];
      for (const id of ids) {
        const dedupKey = `${d.manifestPath}|${d.name}|${id}`;
        if (seen.has(dedupKey)) {
          continue;
        }
        seen.add(dedupKey);
        const detail = details.get(id);
        const severity = detail ? osvSeverity(detail) : "medium";
        const fixed = detail ? osvFixedVersion(detail, d.name, d.ecosystem) : "";
        const summary = detail?.summary || detail?.details?.substring(0, 200) || "Known security vulnerability";
        const fixNote = fixed ? ` Update to ${fixed} or later.` : "";
        const versionNote = d.resolved ? "" : " (declared range lower bound)";
        findings.push({
          id: `DEP-${id}`,
          category: "dependency" /* Dependency */,
          severity: this.mapSeverityString(severity),
          title: `Vulnerable dependency: ${d.name}@${d.version}${versionNote}`,
          description: `${summary} (${id}).${fixNote}`,
          location: {
            filePath: d.manifestPath,
            startLine: d.line,
            startColumn: 0,
            endLine: d.line,
            endColumn: 1e3
          },
          cweId: "CWE-1035"
        });
      }
    }
    return findings;
  }
  scanWithBuiltinRules(manifestFiles) {
    const findings = [];
    for (const m of manifestFiles) {
      const context = {
        filePath: m.path,
        content: m.content,
        languageId: "",
        isTestEnvironment: false
      };
      findings.push(...this.dependencyScanner.scan(context));
    }
    return findings;
  }
  /**
   * Replace dependency findings everywhere with a fresh set, preserving findings
   * from other categories on the same files (e.g. a secret inside package.json).
   */
  mergeDependencyFindings(findings) {
    for (const [filePath, existing] of this.findingsMap) {
      const nonDep = existing.filter((f) => f.category !== "dependency" /* Dependency */);
      if (nonDep.length !== existing.length) {
        this.findingsMap.set(filePath, nonDep);
      }
    }
    const byPath = /* @__PURE__ */ new Map();
    for (const f of findings) {
      const arr = byPath.get(f.location.filePath) || [];
      arr.push(f);
      byPath.set(f.location.filePath, arr);
    }
    for (const [filePath, depFindings] of byPath) {
      const existing = this.findingsMap.get(filePath) || [];
      this.findingsMap.set(filePath, [...existing, ...depFindings]);
    }
  }
  mapSeverityString(severity) {
    switch (severity) {
      case "critical":
        return 0 /* Critical */;
      case "high":
        return 1 /* High */;
      case "medium":
        return 2 /* Medium */;
      case "low":
        return 3 /* Low */;
      default:
        return 4 /* Info */;
    }
  }
  /** True while a workspace scan loop is running (used to gate auto-scan-on-open). */
  isWorkspaceScanRunning() {
    return this.workspaceScanRunning;
  }
  primaryWorkspaceRoot() {
    return vscode2.workspace.workspaceFolders?.[0]?.uri.fsPath;
  }
  /** Assign a stable fingerprint to any finding that lacks one. */
  ensureFingerprints(findings) {
    for (const f of findings) {
      if (!f.fingerprint) {
        const snippet = f.matchedText ?? f.title;
        f.fingerprint = computeFingerprint(f.id, f.location.filePath, snippet);
      }
    }
  }
  /** Drop findings whose fingerprint is in the workspace baseline. */
  applyBaseline(findings) {
    const root = this.primaryWorkspaceRoot();
    if (!root) {
      return findings;
    }
    this.baseline.ensureLoaded(root);
    this.ensureFingerprints(findings);
    return findings.filter((f) => !(f.fingerprint && this.baseline.has(f.fingerprint)));
  }
  /**
   * Add the finding at the given location to the workspace baseline so it is
   * suppressed in future scans, then refresh all diagnostics. Returns false if
   * no matching finding or workspace root is available.
   */
  addToBaseline(filePath, ruleId, startLine) {
    const root = this.primaryWorkspaceRoot();
    if (!root) {
      return false;
    }
    const findings = this.findingsMap.get(filePath) || [];
    const target = findings.find((f) => f.id === ruleId && f.location.startLine === startLine);
    if (!target) {
      return false;
    }
    this.ensureFingerprints([target]);
    if (!target.fingerprint) {
      return false;
    }
    this.baseline.add(root, [target.fingerprint]);
    for (const [p, fs22] of this.findingsMap) {
      this.findingsMap.set(p, this.applyBaseline(fs22));
    }
    this._onFindingsChanged.fire(this.findingsMap);
    return true;
  }
  getAllFindings() {
    return new Map(this.findingsMap);
  }
  clearFindings() {
    this.findingsMap.clear();
    this._onFindingsChanged.fire(this.findingsMap);
  }
  /**
   * Resolve whether this is a git project based on the projectType setting.
   * 'auto' checks for the existence of a .git folder in the workspace root.
   */
  resolveIsGitProject(projectType, workspaceRoot) {
    if (projectType === "git") {
      return true;
    }
    if (projectType === "local") {
      return false;
    }
    return fs3.existsSync(path3.join(workspaceRoot, ".git"));
  }
  dispose() {
    this._onFindingsChanged.dispose();
  }
};

// src/providers/diagnosticsProvider.ts
var vscode4 = __toESM(require("vscode"));

// src/utils/configManager.ts
var vscode3 = __toESM(require("vscode"));
function severityToVscode(severity) {
  switch (severity) {
    case 0 /* Critical */:
    case 1 /* High */:
      return vscode3.DiagnosticSeverity.Error;
    case 2 /* Medium */:
      return vscode3.DiagnosticSeverity.Warning;
    case 3 /* Low */:
      return vscode3.DiagnosticSeverity.Information;
    case 4 /* Info */:
      return vscode3.DiagnosticSeverity.Hint;
  }
}
function severityToLabel(severity) {
  switch (severity) {
    case 0 /* Critical */:
      return "Critical";
    case 1 /* High */:
      return "High";
    case 2 /* Medium */:
      return "Medium";
    case 3 /* Low */:
      return "Low";
    case 4 /* Info */:
      return "Info";
  }
}
function severityToIcon(severity) {
  switch (severity) {
    case 0 /* Critical */:
      return "\u{1F534}";
    case 1 /* High */:
      return "\u{1F7E0}";
    case 2 /* Medium */:
      return "\u{1F7E1}";
    case 3 /* Low */:
      return "\u{1F535}";
    case 4 /* Info */:
      return "\u2139\uFE0F";
  }
}

// src/providers/diagnosticsProvider.ts
var DiagnosticsProvider = class {
  constructor(engine2) {
    this.disposables = [];
    this.diagnosticCollection = vscode4.languages.createDiagnosticCollection("securescanner");
    this.disposables.push(
      engine2.onFindingsChanged((findingsMap) => {
        this.updateDiagnostics(findingsMap);
      })
    );
  }
  updateDiagnostics(findingsMap) {
    this.diagnosticCollection.clear();
    for (const [filePath, findings] of findingsMap) {
      const uri = vscode4.Uri.file(filePath);
      const diagnostics = findings.map((finding) => this.findingToDiagnostic(finding));
      this.diagnosticCollection.set(uri, diagnostics);
    }
  }
  findingToDiagnostic(finding) {
    const range = new vscode4.Range(
      finding.location.startLine,
      finding.location.startColumn,
      finding.location.endLine,
      finding.location.endColumn
    );
    const diagnostic = new vscode4.Diagnostic(
      range,
      `${finding.title}: ${finding.description}`,
      severityToVscode(finding.severity)
    );
    diagnostic.source = "SecureScanner";
    diagnostic.code = finding.id;
    if (finding.cweId) {
      diagnostic.code = {
        value: `${finding.id} (${finding.cweId})`,
        target: vscode4.Uri.parse(`https://cwe.mitre.org/data/definitions/${finding.cweId.replace("CWE-", "")}.html`)
      };
    }
    return diagnostic;
  }
  clear() {
    this.diagnosticCollection.clear();
  }
  dispose() {
    this.diagnosticCollection.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
};

// src/providers/treeViewProvider.ts
var vscode5 = __toESM(require("vscode"));
var path4 = __toESM(require("path"));
var CategoryNode = class extends vscode5.TreeItem {
  constructor(category, count) {
    super(
      `${categoryLabel(category)} (${count})`,
      vscode5.TreeItemCollapsibleState.Expanded
    );
    this.category = category;
    this.count = count;
    this.contextValue = "category";
    this.iconPath = categoryIcon(category);
  }
};
var FindingNode = class extends vscode5.TreeItem {
  constructor(finding) {
    super(
      `[${severityToLabel(finding.severity)}] ${finding.title}`,
      vscode5.TreeItemCollapsibleState.None
    );
    this.finding = finding;
    this.description = `${path4.basename(finding.location.filePath)}:${finding.location.startLine + 1}`;
    this.tooltip = finding.description;
    this.contextValue = "finding";
    this.command = {
      command: "vscode.open",
      title: "Go to Finding",
      arguments: [
        vscode5.Uri.file(finding.location.filePath),
        {
          selection: new vscode5.Range(
            finding.location.startLine,
            finding.location.startColumn,
            finding.location.endLine,
            finding.location.endColumn
          )
        }
      ]
    };
    this.iconPath = severityIcon(finding.severity);
  }
};
function categoryLabel(category) {
  switch (category) {
    case "credential" /* Credential */:
      return "Credentials & Secrets";
    case "owasp" /* OWASP */:
      return "OWASP Top 10";
    case "dependency" /* Dependency */:
      return "Vulnerable Dependencies";
    case "misconfiguration" /* Misconfiguration */:
      return "Misconfigurations";
    case "filehygiene" /* FileHygiene */:
      return "File Hygiene (.gitignore/.aiignore)";
  }
}
function categoryIcon(category) {
  switch (category) {
    case "credential" /* Credential */:
      return new vscode5.ThemeIcon("key");
    case "owasp" /* OWASP */:
      return new vscode5.ThemeIcon("bug");
    case "dependency" /* Dependency */:
      return new vscode5.ThemeIcon("package");
    case "misconfiguration" /* Misconfiguration */:
      return new vscode5.ThemeIcon("gear");
    case "filehygiene" /* FileHygiene */:
      return new vscode5.ThemeIcon("eye");
  }
}
function severityIcon(severity) {
  switch (severity) {
    case 0 /* Critical */:
      return new vscode5.ThemeIcon("error", new vscode5.ThemeColor("errorForeground"));
    case 1 /* High */:
      return new vscode5.ThemeIcon("warning", new vscode5.ThemeColor("editorWarning.foreground"));
    case 2 /* Medium */:
      return new vscode5.ThemeIcon("warning");
    case 3 /* Low */:
      return new vscode5.ThemeIcon("info");
    case 4 /* Info */:
      return new vscode5.ThemeIcon("lightbulb");
  }
}
var FindingsTreeViewProvider = class {
  constructor(engine2) {
    this.engine = engine2;
    this._onDidChangeTreeData = new vscode5.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.disposables = [];
    this.disposables.push(
      engine2.onFindingsChanged(() => {
        this._onDidChangeTreeData.fire(void 0);
      })
    );
  }
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      return this.getCategoryNodes();
    }
    if (element instanceof CategoryNode) {
      return this.getFindingsForCategory(element.category);
    }
    return [];
  }
  getCategoryNodes() {
    const findingsMap = this.engine.getAllFindings();
    const categoryCounts = /* @__PURE__ */ new Map();
    for (const findings of findingsMap.values()) {
      for (const finding of findings) {
        const count = categoryCounts.get(finding.category) || 0;
        categoryCounts.set(finding.category, count + 1);
      }
    }
    const nodes = [];
    for (const category of Object.values(FindingCategory)) {
      const count = categoryCounts.get(category) || 0;
      if (count > 0) {
        nodes.push(new CategoryNode(category, count));
      }
    }
    return nodes;
  }
  getFindingsForCategory(category) {
    const findingsMap = this.engine.getAllFindings();
    const nodes = [];
    for (const findings of findingsMap.values()) {
      for (const finding of findings) {
        if (finding.category === category) {
          nodes.push(new FindingNode(finding));
        }
      }
    }
    nodes.sort((a, b) => a.finding.severity - b.finding.severity);
    return nodes;
  }
  dispose() {
    this._onDidChangeTreeData.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
};

// src/providers/codeActionProvider.ts
var vscode6 = __toESM(require("vscode"));
var SecurityCodeActionProvider = class {
  provideCodeActions(document, range, context) {
    const actions = [];
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== "SecureScanner") {
        continue;
      }
      const code = typeof diagnostic.code === "object" ? diagnostic.code.value : diagnostic.code;
      const codeStr = String(code || "");
      const suppressAction = new vscode6.CodeAction(
        `Suppress: ${codeStr}`,
        vscode6.CodeActionKind.QuickFix
      );
      suppressAction.command = {
        command: "secureScanner.suppressFinding",
        title: "Suppress this finding",
        arguments: [document, diagnostic]
      };
      actions.push(suppressAction);
      const baselineAction = new vscode6.CodeAction(
        `Add ${codeStr} to baseline (ignore permanently)`,
        vscode6.CodeActionKind.QuickFix
      );
      baselineAction.command = {
        command: "secureScanner.addToBaseline",
        title: "Add to baseline",
        arguments: [document, diagnostic]
      };
      actions.push(baselineAction);
      if (codeStr.startsWith("CRED")) {
        const envAction = new vscode6.CodeAction(
          "Move to environment variable",
          vscode6.CodeActionKind.QuickFix
        );
        envAction.diagnostics = [diagnostic];
        envAction.isPreferred = true;
        envAction.command = {
          command: "secureScanner.moveToEnv",
          title: "Move to environment variable",
          arguments: [document, range]
        };
        actions.push(envAction);
      }
      if (codeStr.includes("OWASP-005") || codeStr.includes("OWASP-006")) {
        const fixAction = new vscode6.CodeAction(
          "Use textContent instead",
          vscode6.CodeActionKind.QuickFix
        );
        fixAction.edit = new vscode6.WorkspaceEdit();
        const text = document.getText(diagnostic.range);
        if (text.includes("innerHTML")) {
          fixAction.edit.replace(
            document.uri,
            diagnostic.range,
            text.replace("innerHTML", "textContent")
          );
          fixAction.diagnostics = [diagnostic];
          actions.push(fixAction);
        }
      }
    }
    return actions;
  }
};

// src/providers/hoverProvider.ts
var vscode7 = __toESM(require("vscode"));
var SecurityHoverProvider = class {
  constructor(engine2) {
    this.engine = engine2;
  }
  provideHover(document, position) {
    const findings = this.engine.getAllFindings().get(document.uri.fsPath);
    if (!findings) {
      return void 0;
    }
    for (const finding of findings) {
      const range = new vscode7.Range(
        finding.location.startLine,
        finding.location.startColumn,
        finding.location.endLine,
        finding.location.endColumn
      );
      if (range.contains(position)) {
        const md = new vscode7.MarkdownString();
        md.supportThemeIcons = true;
        md.appendMarkdown(`### $(shield) SecureScanner: ${finding.title}

`);
        md.appendMarkdown(`**Severity:** ${severityToLabel(finding.severity)}

`);
        md.appendMarkdown(`**Category:** ${finding.category}

`);
        md.appendMarkdown(`${finding.description}

`);
        if (finding.cweId) {
          md.appendMarkdown(
            `**Reference:** [${finding.cweId}](https://cwe.mitre.org/data/definitions/${finding.cweId.replace("CWE-", "")}.html)

`
          );
        }
        if (finding.owaspId) {
          md.appendMarkdown(`**OWASP:** ${finding.owaspId}

`);
        }
        md.appendMarkdown(`*Rule: ${finding.id}*`);
        return new vscode7.Hover(md, range);
      }
    }
    return void 0;
  }
};

// src/webview/dashboardPanel.ts
var vscode9 = __toESM(require("vscode"));
var path5 = __toESM(require("path"));
var fs4 = __toESM(require("fs"));

// src/engine/vulnDbUpdater.ts
var https2 = __toESM(require("https"));
var POPULAR_NPM_PACKAGES = [
  "lodash",
  "express",
  "axios",
  "react",
  "webpack",
  "minimist",
  "node-fetch",
  "jsonwebtoken",
  "tar",
  "shell-quote",
  "moment",
  "qs",
  "debug",
  "semver",
  "glob",
  "chalk",
  "commander",
  "yargs",
  "underscore",
  "async",
  "request",
  "body-parser",
  "cookie-parser",
  "cors",
  "dotenv",
  "mongoose",
  "sequelize",
  "passport",
  "bcrypt",
  "helmet",
  "morgan",
  "multer",
  "nodemailer",
  "socket.io",
  "uuid",
  "validator",
  "xml2js",
  "cheerio",
  "handlebars",
  "pug",
  "ejs",
  "marked",
  "highlight.js",
  "jquery",
  "bootstrap",
  "angular",
  "vue",
  "next",
  "nuxt",
  "gatsby",
  "electron",
  "puppeteer",
  "sharp",
  "jimp"
];
var POPULAR_PIP_PACKAGES = [
  "django",
  "flask",
  "requests",
  "pyyaml",
  "pillow",
  "cryptography",
  "numpy",
  "pandas",
  "scipy",
  "matplotlib",
  "tensorflow",
  "torch",
  "jinja2",
  "sqlalchemy",
  "celery",
  "redis",
  "boto3",
  "paramiko",
  "urllib3",
  "certifi",
  "setuptools",
  "pip",
  "wheel",
  "aiohttp",
  "fastapi",
  "uvicorn",
  "gunicorn",
  "werkzeug",
  "lxml",
  "beautifulsoup4"
];
function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };
    const req = https2.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(1e4, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    req.write(data);
    req.end();
  });
}
function mapOsvSeverity(vuln) {
  if (vuln.severity) {
    for (const s of vuln.severity) {
      const score = parseFloat(s.score);
      if (!isNaN(score)) {
        if (score >= 9) {
          return "critical";
        }
        if (score >= 7) {
          return "high";
        }
        if (score >= 4) {
          return "medium";
        }
        return "low";
      }
    }
  }
  const dbSeverity = vuln.database_specific?.severity?.toLowerCase();
  if (dbSeverity === "critical") {
    return "critical";
  }
  if (dbSeverity === "high") {
    return "high";
  }
  if (dbSeverity === "moderate" || dbSeverity === "medium") {
    return "medium";
  }
  if (dbSeverity === "low") {
    return "low";
  }
  return "medium";
}
function parseOsvVulns(vulns, ecosystem) {
  const results = [];
  for (const vuln of vulns) {
    if (!vuln.affected) {
      continue;
    }
    for (const affected of vuln.affected) {
      if (!affected.package || affected.package.ecosystem.toLowerCase() !== ecosystem.toLowerCase()) {
        continue;
      }
      let fixedVersion = "";
      let introducedVersion = "0";
      if (affected.ranges) {
        for (const range of affected.ranges) {
          for (const event of range.events) {
            if (event.fixed) {
              fixedVersion = event.fixed;
            }
            if (event.introduced) {
              introducedVersion = event.introduced;
            }
          }
        }
      }
      if (!fixedVersion) {
        continue;
      }
      results.push({
        package: affected.package.name,
        vulnerableRange: `<${fixedVersion}`,
        fixedVersion,
        cve: vuln.id,
        severity: mapOsvSeverity(vuln),
        description: vuln.summary || vuln.details?.substring(0, 200) || "Security vulnerability"
      });
    }
  }
  return results;
}
async function queryOsv(packageName, ecosystem) {
  const data = JSON.stringify({
    package: { name: packageName, ecosystem }
  });
  try {
    const response = await httpsPost("https://api.osv.dev/v1/query", data);
    const parsed = JSON.parse(response);
    return parsed.vulns || [];
  } catch {
    return [];
  }
}
async function fetchVulnerabilityUpdates(progress) {
  const npmVulns = [];
  const pipVulns = [];
  const totalPackages = POPULAR_NPM_PACKAGES.length + POPULAR_PIP_PACKAGES.length;
  let processed = 0;
  for (const pkg of POPULAR_NPM_PACKAGES) {
    progress?.report({
      message: `Checking npm: ${pkg}...`,
      increment: 1 / totalPackages * 100
    });
    const vulns = await queryOsv(pkg, "npm");
    npmVulns.push(...parseOsvVulns(vulns, "npm"));
    processed++;
  }
  for (const pkg of POPULAR_PIP_PACKAGES) {
    progress?.report({
      message: `Checking PyPI: ${pkg}...`,
      increment: 1 / totalPackages * 100
    });
    const vulns = await queryOsv(pkg, "PyPI");
    pipVulns.push(...parseOsvVulns(vulns, "PyPI"));
    processed++;
  }
  const dedup = (arr) => {
    const seen = /* @__PURE__ */ new Set();
    return arr.filter((v) => {
      const key = `${v.package}:${v.cve}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };
  return {
    npm: dedup(npmVulns),
    pip: dedup(pipVulns)
  };
}

// src/engine/pipUpdateChecker.ts
var vscode8 = __toESM(require("vscode"));
var https3 = __toESM(require("https"));
var http = __toESM(require("http"));
var semver3 = __toESM(require_semver2());
var import_child_process = require("child_process");
function isNexusSearchUrl(indexUrl) {
  return /\/service\/rest\/v[0-9]+\/search\b/i.test(indexUrl);
}
function httpGet(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https3 : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        resolve(null);
        res.resume();
        return;
      }
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => resolve(body));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(1e4, () => {
      req.destroy();
      resolve(null);
    });
  });
}
async function fetchLatestVersionFromNexus(packageName, searchUrl) {
  const baseUrl = searchUrl.replace(/\/+$/, "");
  let allVersions = [];
  let continuationToken = null;
  do {
    const params = new URLSearchParams({
      format: "pypi",
      name: packageName
    });
    if (continuationToken) {
      params.set("continuationToken", continuationToken);
    }
    const url = `${baseUrl}?${params.toString()}`;
    const body = await httpGet(url);
    if (!body) {
      break;
    }
    try {
      const data = JSON.parse(body);
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.version) {
            allVersions.push(item.version);
          }
        }
      }
      continuationToken = data.continuationToken || null;
    } catch {
      break;
    }
  } while (continuationToken);
  if (allVersions.length === 0) {
    return null;
  }
  allVersions.sort((a, b) => {
    const sa = semver3.coerce(a);
    const sb = semver3.coerce(b);
    if (sa && sb) {
      return semver3.compare(sb, sa);
    }
    return 0;
  });
  return allVersions[0];
}
function fetchLatestVersionFromPyPI(packageName, indexUrl) {
  const url = `${indexUrl.replace(/\/+$/, "")}/${encodeURIComponent(packageName)}/json`;
  return new Promise((resolve) => {
    const body = httpGet(url).then((data) => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed.info?.version || null);
      } catch {
        resolve(null);
      }
    });
  });
}
function fetchLatestVersion(packageName, indexUrl) {
  if (isNexusSearchUrl(indexUrl)) {
    return fetchLatestVersionFromNexus(packageName, indexUrl);
  }
  return fetchLatestVersionFromPyPI(packageName, indexUrl);
}
function parseRequirementsTxt2(content) {
  const packages = [];
  const lines = content.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("-")) {
      continue;
    }
    const match = line.match(/^([a-zA-Z0-9_.-]+)\s*(?:==|>=|~=)\s*([0-9][0-9a-zA-Z.*]*)/);
    if (match) {
      packages.push({ name: match[1], version: match[2] });
    }
  }
  return packages;
}
function getInstalledPackages() {
  const commands2 = [
    { cmd: "pip", args: ["list", "--format=json"] },
    { cmd: "pip3", args: ["list", "--format=json"] },
    { cmd: "python", args: ["-m", "pip", "list", "--format=json"] },
    { cmd: "python3", args: ["-m", "pip", "list", "--format=json"] }
  ];
  return tryCommands(commands2, 0);
}
function tryCommands(commands2, index) {
  if (index >= commands2.length) {
    return Promise.resolve([]);
  }
  const { cmd, args } = commands2[index];
  return new Promise((resolve) => {
    (0, import_child_process.execFile)(cmd, args, { timeout: 3e4 }, (error, stdout) => {
      if (error || !stdout) {
        tryCommands(commands2, index + 1).then(resolve);
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        if (Array.isArray(parsed)) {
          resolve(parsed.map((p) => ({
            name: p.name,
            version: p.version
          })));
          return;
        }
      } catch {
      }
      tryCommands(commands2, index + 1).then(resolve);
    });
  });
}
async function checkPipUpdates(indexUrl, progress) {
  const results = [];
  const allPackages = /* @__PURE__ */ new Map();
  progress?.report({ message: "Reading installed packages (pip list)..." });
  const installed = await getInstalledPackages();
  for (const pkg of installed) {
    allPackages.set(pkg.name.toLowerCase(), { version: pkg.version, source: "installed" });
  }
  progress?.report({ message: "Reading requirements.txt files..." });
  const files = await vscode8.workspace.findFiles("**/requirements*.txt", "**/node_modules/**", 50);
  for (const file of files) {
    try {
      const doc = await vscode8.workspace.openTextDocument(file);
      const parsed = parseRequirementsTxt2(doc.getText());
      for (const pkg of parsed) {
        const key = pkg.name.toLowerCase();
        if (!allPackages.has(key)) {
          allPackages.set(key, { version: pkg.version, source: "requirements.txt" });
        }
      }
    } catch {
    }
  }
  if (allPackages.size === 0) {
    return results;
  }
  const total = allPackages.size;
  let processed = 0;
  for (const [name, { version: currentVersion, source }] of allPackages) {
    progress?.report({
      message: `Checking ${name}... (${processed + 1}/${total})`,
      increment: 1 / total * 100
    });
    const latestVersion = await fetchLatestVersion(name, indexUrl);
    if (latestVersion) {
      const current = semver3.coerce(currentVersion);
      const latest = semver3.coerce(latestVersion);
      const updateAvailable = current && latest ? semver3.lt(current, latest) : false;
      if (updateAvailable) {
        results.push({
          name,
          currentVersion,
          latestVersion,
          updateAvailable: true,
          source
        });
      }
    }
    processed++;
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

// src/webview/dashboardPanel.ts
var DashboardPanel = class _DashboardPanel {
  constructor(panel, engine2, extensionUri, globalStorageUri) {
    this.engine = engine2;
    this.extensionUri = extensionUri;
    this.globalStorageUri = globalStorageUri;
    this.disposables = [];
    this.panel = panel;
    this.panel.webview.html = this.getHtmlContent(extensionUri);
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "navigateToFinding":
            this.navigateToFinding(message.finding);
            break;
          case "refresh":
            this.refresh();
            break;
          case "scanWorkspace":
            this.scanWorkspace();
            break;
          case "exportReport":
            this.exportReport();
            break;
          case "updateVulnDb":
            this.updateVulnDb();
            break;
          case "toggleTestEnvironment":
            this.toggleTestEnvironment(message.value);
            break;
          case "checkPipUpdates":
            this.checkPipUpdates();
            break;
          case "updatePipPackage":
            this.updatePipPackage(message.packageName);
            break;
        }
      },
      null,
      this.disposables
    );
    this.disposables.push(
      engine2.onFindingsChanged(() => this.refresh())
    );
    this.refresh();
  }
  static createOrShow(engine2, extensionUri, globalStorageUri) {
    const column = vscode9.window.activeTextEditor ? vscode9.window.activeTextEditor.viewColumn : void 0;
    if (_DashboardPanel.currentPanel) {
      _DashboardPanel.currentPanel.panel.reveal(column);
      _DashboardPanel.currentPanel.refresh();
      return;
    }
    const panel = vscode9.window.createWebviewPanel(
      "secureScanner.dashboard",
      "Security Dashboard",
      column || vscode9.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    _DashboardPanel.currentPanel = new _DashboardPanel(panel, engine2, extensionUri, globalStorageUri);
  }
  refresh() {
    const findingsMap = this.engine.getAllFindings();
    const allFindings = [];
    for (const findings of findingsMap.values()) {
      allFindings.push(...findings);
    }
    const config = this.engine.getConfig();
    this.panel.webview.postMessage({
      type: "findings",
      data: allFindings,
      isTestEnvironment: config.isTestEnvironment
    });
  }
  navigateToFinding(finding) {
    const uri = vscode9.Uri.file(finding.location.filePath);
    const range = new vscode9.Range(
      finding.location.startLine,
      finding.location.startColumn,
      finding.location.endLine,
      finding.location.endColumn
    );
    vscode9.window.showTextDocument(uri, { selection: range });
  }
  async scanWorkspace() {
    this.panel.webview.postMessage({ type: "scanStatus", status: "scanning" });
    await vscode9.window.withProgress(
      {
        location: vscode9.ProgressLocation.Notification,
        title: "SecureScanner: Scanning workspace...",
        cancellable: true
      },
      async (_progress, token) => {
        const findings = await this.engine.scanWorkspace(token);
        this.panel.webview.postMessage({ type: "scanStatus", status: "done", count: findings.length });
        this.refresh();
      }
    );
  }
  async updateVulnDb() {
    this.panel.webview.postMessage({ type: "vulnDbStatus", status: "updating" });
    try {
      const result = await vscode9.window.withProgress(
        {
          location: vscode9.ProgressLocation.Notification,
          title: "SecureScanner: Updating vulnerability database...",
          cancellable: false
        },
        async (progress) => {
          return await fetchVulnerabilityUpdates(progress);
        }
      );
      if (result.npm.length === 0 && result.pip.length === 0) {
        this.panel.webview.postMessage({ type: "vulnDbStatus", status: "error" });
        vscode9.window.showErrorMessage(
          "SecureScanner: Update returned no vulnerabilities \u2014 likely offline or OSV.dev unreachable. Existing rules kept."
        );
        return;
      }
      const globalStoragePath = this.globalStorageUri.fsPath;
      const vulnDbPath = path5.join(globalStoragePath, "vulnDb.json");
      const vulnDbData = {
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        npmVulnerabilities: result.npm,
        pipVulnerabilities: result.pip
      };
      try {
        fs4.mkdirSync(globalStoragePath, { recursive: true });
      } catch {
      }
      fs4.writeFileSync(vulnDbPath, JSON.stringify(vulnDbData, null, 2), "utf8");
      this.engine.loadExternalVulnDb(vulnDbPath);
      this.panel.webview.postMessage({
        type: "vulnDbStatus",
        status: "done",
        npmCount: result.npm.length,
        pipCount: result.pip.length
      });
      vscode9.window.showInformationMessage(
        `SecureScanner: Vulnerability database updated! Found ${result.npm.length} npm + ${result.pip.length} pip vulnerabilities.`
      );
      const rescan = await vscode9.window.showInformationMessage(
        "Re-scan workspace with updated database?",
        "Yes",
        "No"
      );
      if (rescan === "Yes") {
        this.scanWorkspace();
      }
    } catch (err) {
      this.panel.webview.postMessage({ type: "vulnDbStatus", status: "error" });
      vscode9.window.showErrorMessage(
        `SecureScanner: Failed to update vulnerability database. ${err instanceof Error ? err.message : "Check your internet connection."}`
      );
    }
  }
  async exportReport() {
    const findingsMap = this.engine.getAllFindings();
    const allFindings = [];
    for (const findings of findingsMap.values()) {
      allFindings.push(...findings);
    }
    allFindings.sort((a, b) => a.severity - b.severity);
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const workspaceName = vscode9.workspace.workspaceFolders?.[0]?.name || "Unknown Project";
    const severityCounts = {
      critical: allFindings.filter((f) => f.severity === 0 /* Critical */).length,
      high: allFindings.filter((f) => f.severity === 1 /* High */).length,
      medium: allFindings.filter((f) => f.severity === 2 /* Medium */).length,
      low: allFindings.filter((f) => f.severity === 3 /* Low */).length,
      info: allFindings.filter((f) => f.severity === 4 /* Info */).length
    };
    const categoryCounts = {};
    for (const f of allFindings) {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    }
    const categoryLabel2 = (cat) => {
      switch (cat) {
        case "credential" /* Credential */:
          return "Credentials";
        case "owasp" /* OWASP */:
          return "OWASP";
        case "dependency" /* Dependency */:
          return "Dependencies";
        case "misconfiguration" /* Misconfiguration */:
          return "Misconfiguration";
        case "filehygiene" /* FileHygiene */:
          return "File Hygiene";
        default:
          return cat;
      }
    };
    const sevClass = (s) => {
      switch (s) {
        case 0 /* Critical */:
          return "critical";
        case 1 /* High */:
          return "high";
        case 2 /* Medium */:
          return "medium";
        case 3 /* Low */:
          return "low";
        case 4 /* Info */:
          return "info";
      }
    };
    const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const findingsRows = allFindings.map((f) => {
      const relPath = vscode9.workspace.asRelativePath(f.location.filePath);
      const cwe = f.cweId ? `<span class="cwe">CWE: ${escHtml(f.cweId)}</span>` : "";
      return `<tr>
        <td><span class="badge ${sevClass(f.severity)}">${severityToIcon(f.severity)} ${severityToLabel(f.severity)}</span></td>
        <td><strong>${escHtml(f.title)}</strong><br><span class="desc">${escHtml(f.description)}</span></td>
        <td>${escHtml(categoryLabel2(f.category))}</td>
        <td class="file-path">${escHtml(relPath)}:${f.location.startLine}</td>
        <td>${cwe}</td>
      </tr>`;
    }).join("\n");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SecureScanner Report - ${escHtml(workspaceName)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; line-height: 1.6; }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
  header { background: linear-gradient(135deg, #16213e, #0f3460); border-radius: 12px; padding: 32px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; }
  header .logo { font-size: 2.5em; }
  header h1 { font-size: 1.8em; color: #fff; }
  header p { color: #8892b0; font-size: 0.95em; }
  .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .card { background: #16213e; border-radius: 10px; padding: 20px; text-align: center; border: 1px solid #1a1a40; }
  .card .number { font-size: 2.2em; font-weight: 700; }
  .card .label { font-size: 0.85em; color: #8892b0; margin-top: 4px; }
  .card.critical .number { color: #f44336; }
  .card.high .number { color: #ff9800; }
  .card.medium .number { color: #ffc107; }
  .card.low .number { color: #2196f3; }
  .card.info .number { color: #9e9e9e; }
  .card.total .number { color: #fff; }
  .section { background: #16213e; border-radius: 10px; padding: 24px; margin-bottom: 24px; border: 1px solid #1a1a40; }
  .section h2 { font-size: 1.3em; margin-bottom: 16px; color: #fff; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
  th { text-align: left; padding: 10px 12px; background: #0f3460; border-bottom: 2px solid #1a1a40; color: #ccd6f6; font-weight: 600; }
  td { padding: 10px 12px; border-bottom: 1px solid #1a1a40; vertical-align: top; }
  tr:hover { background: rgba(255,255,255,0.03); }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.8em; font-weight: 700; white-space: nowrap; }
  .badge.critical { background: #f44336; color: #fff; }
  .badge.high { background: #ff9800; color: #fff; }
  .badge.medium { background: #ffc107; color: #333; }
  .badge.low { background: #2196f3; color: #fff; }
  .badge.info { background: #9e9e9e; color: #fff; }
  .desc { color: #8892b0; font-size: 0.85em; }
  .cwe { background: #2a2a4a; padding: 2px 8px; border-radius: 3px; font-size: 0.8em; color: #8892b0; }
  .file-path { font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.85em; color: #64ffda; word-break: break-all; }
  .category-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .category-tag { background: #0f3460; padding: 6px 14px; border-radius: 6px; font-size: 0.85em; }
  .category-tag strong { color: #64ffda; }
  footer { text-align: center; padding: 20px; color: #555; font-size: 0.8em; }
  .no-findings { text-align: center; padding: 40px; color: #4caf50; font-size: 1.1em; }
  @media print { body { background: #fff; color: #333; } .container { max-width: 100%; } header { background: #f5f5f5; } .section { background: #fff; border: 1px solid #ddd; } td, th { color: #333; } .desc { color: #666; } .file-path { color: #00695c; } tr:hover { background: transparent; } }
  @media (max-width: 768px) { .summary-cards { grid-template-columns: repeat(2, 1fr); } header { flex-direction: column; text-align: center; } }
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">\u{1F6E1}\uFE0F</div>
    <div>
      <h1>SecureScanner Security Report</h1>
      <p>Project: <strong>${escHtml(workspaceName)}</strong> &mdash; Generated: ${escHtml(dateStr)}</p>
    </div>
  </header>

  <div class="summary-cards">
    <div class="card total"><div class="number">${allFindings.length}</div><div class="label">Total Findings</div></div>
    <div class="card critical"><div class="number">${severityCounts.critical}</div><div class="label">Critical</div></div>
    <div class="card high"><div class="number">${severityCounts.high}</div><div class="label">High</div></div>
    <div class="card medium"><div class="number">${severityCounts.medium}</div><div class="label">Medium</div></div>
    <div class="card low"><div class="number">${severityCounts.low}</div><div class="label">Low</div></div>
    <div class="card info"><div class="number">${severityCounts.info}</div><div class="label">Info</div></div>
  </div>

  <div class="section">
    <h2>Categories</h2>
    <div class="category-bar">
      ${Object.entries(categoryCounts).map(([cat, count]) => `<div class="category-tag"><strong>${count}</strong> ${escHtml(categoryLabel2(cat))}</div>`).join("\n      ")}
    </div>
  </div>

  <div class="section">
    <h2>Findings</h2>
    ${allFindings.length === 0 ? '<div class="no-findings">\u2705 No security findings detected!</div>' : `
    <table>
      <thead><tr><th>Severity</th><th>Finding</th><th>Category</th><th>Location</th><th>CWE</th></tr></thead>
      <tbody>${findingsRows}</tbody>
    </table>`}
  </div>

  <footer>
    Generated by SecureScanner for VS Code &mdash; ${escHtml(now.toISOString())}
  </footer>
</div>
</body>
</html>`;
    const uri = await vscode9.window.showSaveDialog({
      filters: { "HTML Report": ["html"] },
      defaultUri: vscode9.Uri.file("security-report.html")
    });
    if (uri) {
      const content = Buffer.from(html, "utf8");
      await vscode9.workspace.fs.writeFile(uri, content);
      vscode9.window.showInformationMessage(`Report exported to ${uri.fsPath}`);
    }
  }
  async checkPipUpdates() {
    this.panel.webview.postMessage({ type: "pipUpdateStatus", status: "checking" });
    try {
      const config = this.engine.getConfig();
      const results = await vscode9.window.withProgress(
        {
          location: vscode9.ProgressLocation.Notification,
          title: "SecureScanner: Checking pip packages for updates...",
          cancellable: false
        },
        async (progress) => {
          return await checkPipUpdates(config.pipIndexUrl, progress);
        }
      );
      this.panel.webview.postMessage({
        type: "pipUpdateStatus",
        status: "done",
        packages: results,
        indexUrl: config.pipIndexUrl
      });
      if (results.length === 0) {
        vscode9.window.showInformationMessage("SecureScanner: All pip packages are up to date!");
      } else {
        vscode9.window.showInformationMessage(
          `SecureScanner: ${results.length} pip package(s) have updates available.`
        );
      }
    } catch (err) {
      this.panel.webview.postMessage({ type: "pipUpdateStatus", status: "error" });
      vscode9.window.showErrorMessage(
        `SecureScanner: Failed to check pip updates. ${err instanceof Error ? err.message : "Check your internet connection."}`
      );
    }
  }
  async updatePipPackage(packageName) {
    const terminal = vscode9.window.createTerminal({ name: `pip upgrade ${packageName}` });
    terminal.show();
    terminal.sendText(`pip install --upgrade ${packageName}`);
    this.panel.webview.postMessage({
      type: "pipPackageUpdateStarted",
      packageName
    });
    vscode9.window.showInformationMessage(
      `SecureScanner: Upgrading ${packageName} in terminal. Run "Check for Updates" again after installation completes.`
    );
  }
  async toggleTestEnvironment(value) {
    const config = vscode9.workspace.getConfiguration("secureScanner");
    await config.update("isTestEnvironment", value, vscode9.ConfigurationTarget.Workspace);
    this.scanWorkspace();
  }
  getHtmlContent(extensionUri) {
    const nonce = getNonce();
    const shieldUri = this.panel.webview.asWebviewUri(
      vscode9.Uri.joinPath(extensionUri, "media", "shield-only.svg")
    );
    const maatLogoUri = this.panel.webview.asWebviewUri(
      vscode9.Uri.joinPath(extensionUri, "media", "SecureScannerLogo.png")
    );
    return (
      /*html*/
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource}; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src https://api.osv.dev;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Dashboard</title>
  <style nonce="${nonce}">
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 20px;
    }
    .branding-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .branding-header .branding-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .branding-header .branding-title {
      font-size: 1.6em;
      font-weight: bold;
    }
    .branding-header .branding-sub {
      font-size: 0.8em;
      opacity: 0.6;
    }
    .shield-logo {
      position: relative;
      width: 60px;
      height: 69px;
      flex-shrink: 0;
    }
    .shield-logo .shield-bg {
      width: 100%;
      height: 100%;
    }
    .shield-logo .inner-logo {
      position: absolute;
      top: 42%;
      left: 50%;
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      border-radius: 4px;
      transition: transform 0.3s ease;
    }
    .shield-logo.scanning .inner-logo {
      animation: spinLogo 1.5s linear infinite;
    }
    @keyframes spinLogo {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    .disclaimer {
      margin-top: 32px;
      padding: 16px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      font-size: 0.78em;
      line-height: 1.5;
      opacity: 0.75;
    }
    .disclaimer strong { opacity: 1; }
    h1 { font-size: 1.6em; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--vscode-panel-border);
    }
    .card .count { font-size: 2em; font-weight: bold; }
    .card .label { font-size: 0.85em; opacity: 0.8; margin-top: 4px; }
    .card.critical { border-left: 4px solid #f44336; }
    .card.high { border-left: 4px solid #ff9800; }
    .card.medium { border-left: 4px solid #ffc107; }
    .card.low { border-left: 4px solid #2196f3; }
    .card.info { border-left: 4px solid #9e9e9e; }
    .card.total { border-left: 4px solid var(--vscode-focusBorder); }
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    .toolbar select, .toolbar input, .toolbar button {
      padding: 6px 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 0.9em;
    }
    .toolbar button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .toolbar button:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .toolbar button.primary-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      font-weight: bold;
      padding: 8px 16px;
      font-size: 0.95em;
    }
    .toolbar button.primary-btn:hover { background: var(--vscode-button-hoverBackground); }
    .toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    .scanning-indicator {
      display: none;
      align-items: center;
      gap: 8px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .scanning-indicator.active { display: flex; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
    }
    th {
      text-align: left;
      padding: 8px 12px;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      border-bottom: 2px solid var(--vscode-panel-border);
      cursor: pointer;
      user-select: none;
    }
    th:hover { background: var(--vscode-list-hoverBackground); }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    tr:hover { background: var(--vscode-list-hoverBackground); }
    tr.clickable { cursor: pointer; }
    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
    }
    .severity-badge.critical { background: #f44336; color: white; }
    .severity-badge.high { background: #ff9800; color: white; }
    .severity-badge.medium { background: #ffc107; color: #333; }
    .severity-badge.low { background: #2196f3; color: white; }
    .severity-badge.info { background: #9e9e9e; color: white; }
    .update-btn {
      background: #388e3c !important;
      color: white !important;
      font-weight: bold;
    }
    .update-btn:hover { background: #2e7d32 !important; }
    .update-btn:disabled { background: #666 !important; opacity: 0.6; }
    .check-updates-btn {
      background: var(--vscode-button-background) !important;
      color: var(--vscode-button-foreground) !important;
      font-weight: bold;
      font-size: 0.95em;
      padding: 8px 18px !important;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .check-updates-btn:hover { background: var(--vscode-button-hoverBackground) !important; }
    .check-updates-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pkg-update-btn {
      background: #388e3c;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 0.85em;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .pkg-update-btn:hover { background: #2e7d32; }
    .pkg-update-btn:disabled { background: #666; opacity: 0.5; cursor: not-allowed; }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      opacity: 0.6;
    }
    .empty-state h2 { margin-bottom: 8px; }
    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85em;
    }
    .toggle-switch input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 36px;
      height: 20px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-switch input[type="checkbox"]::before {
      content: '';
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--vscode-input-foreground);
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    .toggle-switch input[type="checkbox"]:checked {
      background: var(--vscode-button-background);
      border-color: var(--vscode-button-background);
    }
    .toggle-switch input[type="checkbox"]:checked::before {
      transform: translateX(16px);
    }
    .toggle-switch label {
      cursor: pointer;
      user-select: none;
    }
  </style>
</head>
<body>
  <div class="branding-header">
    <div class="shield-logo" id="shieldLogo">
      <img class="shield-bg" src="${shieldUri}" alt="SecureScanner Shield" />
      <img class="inner-logo" src="${maatLogoUri}" alt="MaatInICT" />
    </div>
    <div class="branding-text">
      <span class="branding-title">SecureScanner</span>
      <span class="branding-sub">Powered by MaatInICT B.V. &mdash; Quality Engineering &amp; Identity Expertise</span>
    </div>
  </div>
  <h1>Security Dashboard</h1>
  <div class="summary-cards" id="summaryCards"></div>
  <div class="toolbar">
    <select id="filterSeverity">
      <option value="all">All Severities</option>
      <option value="0">Critical</option>
      <option value="1">High</option>
      <option value="2">Medium</option>
      <option value="3">Low</option>
      <option value="4">Info</option>
    </select>
    <select id="filterCategory">
      <option value="all">All Categories</option>
      <option value="credential">Credentials</option>
      <option value="owasp">OWASP</option>
      <option value="dependency">Dependencies</option>
      <option value="misconfiguration">Misconfigurations</option>
      <option value="filehygiene">File Hygiene</option>
    </select>
    <input type="text" id="searchInput" placeholder="Search findings...">
    <button id="scanWorkspaceBtn" class="primary-btn">&#128269; Scan Workspace</button>
<button id="refreshBtn">&#8635; Refresh</button>
    <button id="exportBtn">&#128190; Export Report</button>
  </div>
  <div class="toolbar" style="margin-top: -8px; margin-bottom: 16px; border-top: 1px solid var(--vscode-panel-border); padding-top: 8px;">
    <div class="toggle-switch">
      <input type="checkbox" id="testEnvToggle" />
      <label for="testEnvToggle">Test Environment</label>
    </div>
    <span style="opacity: 0.3; margin: 0 4px;">|</span>
    <span style="font-size: 0.85em; opacity: 0.7;">Vulnerability Database:</span>
    <span id="vulnDbInfo" style="font-size: 0.85em; opacity: 0.7;">Built-in rules loaded</span>
    <button id="updateVulnDbBtn" class="update-btn">&#127760; Update CVE Database</button>
    <span id="vulnDbStatusText" style="font-size: 0.85em; display: none;"></span>
  </div>
  <div id="content"></div>

  <div style="margin-top: 24px; border-top: 2px solid var(--vscode-panel-border); padding-top: 16px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <h2 style="margin: 0; font-size: 1.2em;">&#128230; Pip Package Updates</h2>
      <button id="checkPipUpdatesBtn" class="check-updates-btn">&#128269; Check for Updates</button>
      <span id="pipUpdateStatusText" style="font-size: 0.85em; display: none;"></span>
    </div>
    <div id="pipUpdatesContent" style="font-size: 0.85em; opacity: 0.7;">Click "Check for Updates" to scan requirements.txt files for outdated packages.</div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer</strong><br>
    SecureScanner is a free tool provided by <strong>MaatInICT B.V.</strong> on an "as is" basis, without warranties or guarantees of any kind, either express or implied.
    This tool is intended to assist in identifying potential security issues in your codebase, but it does not guarantee the detection of all vulnerabilities nor the absence of false positives.
    By using SecureScanner, you acknowledge and agree that:<br><br>
    &bull; You use this tool entirely at your own risk and responsibility.<br>
    &bull; MaatInICT B.V. shall not be held liable for any damages, losses, security breaches, or other consequences arising from the use of, or reliance on, this tool.<br>
    &bull; This tool does not replace professional security audits, penetration testing, or expert review.<br>
    &bull; Scan results should be validated and verified by qualified personnel before taking action.<br><br>
    &copy; MaatInICT B.V. &mdash; Quality Engineering &amp; Identity Expertise
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let allFindings = [];

    const severityNames = ['Critical', 'High', 'Medium', 'Low', 'Info'];
    const severityClasses = ['critical', 'high', 'medium', 'low', 'info'];

    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderSummary(findings) {
      const cards = document.getElementById('summaryCards');
      const counts = [0, 0, 0, 0, 0];
      findings.forEach(f => counts[f.severity]++);

      let html = '<div class="card total"><div class="count">' + findings.length + '</div><div class="label">Total</div></div>';
      severityNames.forEach((name, i) => {
        html += '<div class="card ' + severityClasses[i] + '"><div class="count">' + counts[i] + '</div><div class="label">' + name + '</div></div>';
      });
      cards.innerHTML = html;
    }

    function renderFindings(findings) {
      const content = document.getElementById('content');

      if (findings.length === 0) {
        content.innerHTML = '<div class="empty-state"><h2>No security issues found</h2><p>Click <strong>"Scan Workspace"</strong> above to scan all files in your project.</p></div>';
        return;
      }

      let html = '<table><thead><tr>';
      html += '<th>Severity</th><th>ID</th><th>Title</th><th>Category</th><th>File</th><th>Line</th>';
      html += '</tr></thead><tbody>';

      findings.forEach((f, idx) => {
        const fileName = f.location.filePath.split(/[\\/\\\\]/).pop();
        html += '<tr class="clickable" data-index="' + idx + '">';
        html += '<td><span class="severity-badge ' + severityClasses[f.severity] + '">' + severityNames[f.severity] + '</span></td>';
        html += '<td>' + esc(f.id) + '</td>';
        html += '<td>' + esc(f.title) + '</td>';
        html += '<td>' + esc(f.category) + '</td>';
        html += '<td>' + esc(fileName) + '</td>';
        html += '<td>' + (f.location.startLine + 1) + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table>';
      content.innerHTML = html;

      document.querySelectorAll('tr.clickable').forEach(row => {
        row.addEventListener('click', () => {
          const idx = parseInt(row.getAttribute('data-index'));
          vscode.postMessage({ command: 'navigateToFinding', finding: findings[idx] });
        });
      });
    }

    function applyFilters() {
      const severity = document.getElementById('filterSeverity').value;
      const category = document.getElementById('filterCategory').value;
      const search = document.getElementById('searchInput').value.toLowerCase();

      let filtered = allFindings;
      if (severity !== 'all') {
        filtered = filtered.filter(f => f.severity === parseInt(severity));
      }
      if (category !== 'all') {
        filtered = filtered.filter(f => f.category === category);
      }
      if (search) {
        filtered = filtered.filter(f =>
          f.title.toLowerCase().includes(search) ||
          f.description.toLowerCase().includes(search) ||
          f.id.toLowerCase().includes(search)
        );
      }

      renderFindings(filtered);
    }

    document.getElementById('filterSeverity').addEventListener('change', applyFilters);
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('scanWorkspaceBtn').addEventListener('click', () => {
      document.getElementById('scanWorkspaceBtn').disabled = true;
      document.getElementById('scanWorkspaceBtn').textContent = 'Scanning...';
      document.getElementById('shieldLogo').classList.add('scanning');
      vscode.postMessage({ command: 'scanWorkspace' });
    });
    document.getElementById('refreshBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });
    document.getElementById('exportBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'exportReport' });
    });
    document.getElementById('testEnvToggle').addEventListener('change', (e) => {
      vscode.postMessage({ command: 'toggleTestEnvironment', value: e.target.checked });
    });
    document.getElementById('checkPipUpdatesBtn').addEventListener('click', () => {
      const btn = document.getElementById('checkPipUpdatesBtn');
      const statusText = document.getElementById('pipUpdateStatusText');
      btn.disabled = true;
      btn.textContent = 'Checking...';
      statusText.style.display = 'inline';
      statusText.textContent = 'Querying package index...';
      statusText.style.color = 'var(--vscode-descriptionForeground)';
      vscode.postMessage({ command: 'checkPipUpdates' });
    });

    document.getElementById('updateVulnDbBtn').addEventListener('click', () => {
      const btn = document.getElementById('updateVulnDbBtn');
      const statusText = document.getElementById('vulnDbStatusText');
      btn.disabled = true;
      btn.textContent = 'Updating...';
      statusText.style.display = 'inline';
      statusText.textContent = 'Fetching latest CVE data from OSV.dev...';
      statusText.style.color = 'var(--vscode-descriptionForeground)';
      vscode.postMessage({ command: 'updateVulnDb' });
    });

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'findings') {
        allFindings = message.data;
        if (message.isTestEnvironment !== undefined) {
          document.getElementById('testEnvToggle').checked = message.isTestEnvironment;
        }
        renderSummary(allFindings);
        applyFilters();
      }
      if (message.type === 'scanStatus') {
        const btn = document.getElementById('scanWorkspaceBtn');
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Scan Workspace';
          document.getElementById('shieldLogo').classList.remove('scanning');
        }
      }
      if (message.type === 'pipUpdateStatus') {
        const btn = document.getElementById('checkPipUpdatesBtn');
        const statusText = document.getElementById('pipUpdateStatusText');
        const content = document.getElementById('pipUpdatesContent');
        if (message.status === 'checking') {
          btn.disabled = true;
          btn.textContent = 'Checking...';
        }
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Check for Updates';
          const packages = message.packages || [];
          if (packages.length === 0) {
            content.innerHTML = '<div style="padding: 12px; opacity: 0.7;">All pip packages are up to date.</div>';
            statusText.style.display = 'inline';
            statusText.textContent = 'All up to date!';
            statusText.style.color = '#4caf50';
          } else {
            let html = '<div style="font-size: 0.85em; opacity: 0.7; margin-bottom: 8px;">Source: ' + esc(message.indexUrl || 'PyPI') + '</div>';
            html += '<table><thead><tr>';
            html += '<th>Package</th><th>Current Version</th><th>Latest Version</th><th>Source</th><th>Action</th>';
            html += '</tr></thead><tbody>';
            packages.forEach(function(pkg) {
              html += '<tr>';
              html += '<td><strong>' + esc(pkg.name) + '</strong></td>';
              html += '<td><span class="severity-badge medium">' + esc(pkg.currentVersion) + '</span></td>';
              html += '<td><span class="severity-badge info" style="background: #4caf50; color: white;">' + esc(pkg.latestVersion) + '</span></td>';
              html += '<td style="opacity: 0.7; font-size: 0.9em;">' + (pkg.source === 'installed' ? '&#128187; pip list' : '&#128196; requirements.txt') + '</td>';
              html += '<td><button class="pkg-update-btn" data-pkg="' + esc(pkg.name) + '">&#11014; Update</button></td>';
              html += '</tr>';
            });
            html += '</tbody></table>';
            content.innerHTML = html;
            content.querySelectorAll('.pkg-update-btn').forEach(function(btn) {
              btn.addEventListener('click', function() {
                var pkgName = btn.getAttribute('data-pkg');
                btn.disabled = true;
                btn.textContent = 'Updating...';
                vscode.postMessage({ command: 'updatePipPackage', packageName: pkgName });
              });
            });
            statusText.style.display = 'inline';
            statusText.textContent = packages.length + ' update(s) available';
            statusText.style.color = '#ff9800';
          }
          setTimeout(function() { statusText.style.display = 'none'; }, 5000);
        }
        if (message.status === 'error') {
          btn.disabled = false;
          btn.innerHTML = '&#128269; Check for Updates';
          statusText.style.display = 'inline';
          statusText.textContent = 'Check failed - verify connection and index URL';
          statusText.style.color = '#f44336';
          content.innerHTML = '<div style="padding: 12px; color: #f44336;">Failed to check for updates. Please verify your internet connection and pip index URL setting.</div>';
        }
      }
      if (message.type === 'pipPackageUpdateStarted') {
        var updatingBtn = document.querySelector('.pkg-update-btn[data-pkg="' + message.packageName + '"]');
        if (updatingBtn) {
          updatingBtn.disabled = true;
          updatingBtn.textContent = 'Opened in terminal';
        }
      }
      if (message.type === 'vulnDbStatus') {
        const btn = document.getElementById('updateVulnDbBtn');
        const statusText = document.getElementById('vulnDbStatusText');
        const infoText = document.getElementById('vulnDbInfo');
        if (message.status === 'done') {
          btn.disabled = false;
          btn.innerHTML = '&#127760; Update CVE Database';
          statusText.style.display = 'inline';
          statusText.textContent = 'Updated successfully!';
          statusText.style.color = '#4caf50';
          infoText.textContent = message.npmCount + ' npm + ' + message.pipCount + ' pip vulnerabilities loaded';
          setTimeout(() => { statusText.style.display = 'none'; }, 5000);
        }
        if (message.status === 'error') {
          btn.disabled = false;
          btn.innerHTML = '&#127760; Update CVE Database';
          statusText.style.display = 'inline';
          statusText.textContent = 'Update failed - check internet connection';
          statusText.style.color = '#f44336';
        }
      }
    });
  </script>
</body>
</html>`
    );
  }
  dispose() {
    _DashboardPanel.currentPanel = void 0;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
};
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// src/utils/debounce.ts
function debounceByKey(fn, delay, keyFn) {
  const timers = /* @__PURE__ */ new Map();
  return (...args) => {
    const key = keyFn(...args);
    const existing = timers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        fn(...args);
      }, delay)
    );
  };
}

// src/extension.ts
var engine;
function activate(context) {
  engine = new ScannerEngine();
  const globalStoragePath = context.globalStorageUri.fsPath;
  const vulnDbPath = path6.join(globalStoragePath, "vulnDb.json");
  if (fs5.existsSync(vulnDbPath)) {
    engine.loadExternalVulnDb(vulnDbPath);
  }
  const diagnosticsProvider = new DiagnosticsProvider(engine);
  const treeViewProvider = new FindingsTreeViewProvider(engine);
  const hoverProvider = new SecurityHoverProvider(engine);
  const codeActionProvider = new SecurityCodeActionProvider();
  const treeView = vscode10.window.createTreeView("secureScanner.findings", {
    treeDataProvider: treeViewProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(
    vscode10.languages.registerHoverProvider({ scheme: "file" }, hoverProvider)
  );
  context.subscriptions.push(
    vscode10.languages.registerCodeActionsProvider(
      { scheme: "file" },
      codeActionProvider,
      { providedCodeActionKinds: [vscode10.CodeActionKind.QuickFix] }
    )
  );
  const debouncedScan = debounceByKey(
    (document) => {
      engine.scanDocument(document);
    },
    300,
    (document) => document.uri.toString()
  );
  context.subscriptions.push(
    vscode10.workspace.onDidSaveTextDocument((document) => {
      const config = vscode10.workspace.getConfiguration("secureScanner");
      if (config.get("enableOnSave", true)) {
        debouncedScan(document);
      }
    })
  );
  context.subscriptions.push(
    vscode10.workspace.onDidOpenTextDocument((document) => {
      if (engine.isWorkspaceScanRunning()) {
        return;
      }
      const config = vscode10.workspace.getConfiguration("secureScanner");
      if (config.get("enableOnOpen", true)) {
        debouncedScan(document);
      }
    })
  );
  context.subscriptions.push(
    vscode10.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && !engine.isWorkspaceScanRunning()) {
        const config = vscode10.workspace.getConfiguration("secureScanner");
        if (config.get("enableOnOpen", true)) {
          debouncedScan(editor.document);
        }
      }
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.scanFile", () => {
      const editor = vscode10.window.activeTextEditor;
      if (editor) {
        const findings = engine.scanDocument(editor.document);
        vscode10.window.showInformationMessage(
          `SecureScanner: Found ${findings.length} issue(s) in ${editor.document.fileName.split(/[/\\]/).pop()}`
        );
      } else {
        vscode10.window.showWarningMessage("SecureScanner: No active file to scan.");
      }
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.scanWorkspace", async () => {
      await vscode10.window.withProgress(
        {
          location: vscode10.ProgressLocation.Notification,
          title: "SecureScanner: Scanning workspace...",
          cancellable: true
        },
        async (_progress, token) => {
          const findings = await engine.scanWorkspace(token);
          if (token.isCancellationRequested) {
            vscode10.window.showInformationMessage("SecureScanner: Workspace scan cancelled.");
          } else {
            vscode10.window.showInformationMessage(
              `SecureScanner: Workspace scan complete. Found ${findings.length} issue(s).`
            );
          }
        }
      );
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.openDashboard", () => {
      DashboardPanel.createOrShow(engine, context.extensionUri, context.globalStorageUri);
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.clearFindings", () => {
      engine.clearFindings();
      diagnosticsProvider.clear();
      vscode10.window.showInformationMessage("SecureScanner: All findings cleared.");
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.suppressFinding", (document, diagnostic) => {
      const edit = new vscode10.WorkspaceEdit();
      const line = document.lineAt(diagnostic.range.start.line);
      const rawCode = typeof diagnostic.code === "object" ? diagnostic.code.value : diagnostic.code;
      const ruleId = String(rawCode ?? "").split(/\s+/)[0];
      const marker = getLineCommentMarker(document.languageId);
      edit.insert(
        document.uri,
        line.range.end,
        ` ${marker} securescanner-ignore ${ruleId}`
      );
      vscode10.workspace.applyEdit(edit);
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.addToBaseline", (document, diagnostic) => {
      const rawCode = typeof diagnostic.code === "object" ? diagnostic.code.value : diagnostic.code;
      const ruleId = String(rawCode ?? "").split(/\s+/)[0];
      const ok = engine.addToBaseline(document.uri.fsPath, ruleId, diagnostic.range.start.line);
      if (ok) {
        vscode10.window.showInformationMessage(
          `SecureScanner: ${ruleId} added to baseline (.securescanner-baseline.json). It will be suppressed in future scans.`
        );
      } else {
        vscode10.window.showWarningMessage("SecureScanner: Could not add finding to baseline (no workspace folder open?).");
      }
    })
  );
  context.subscriptions.push(
    vscode10.commands.registerCommand("secureScanner.moveToEnv", (_document, _range) => {
      vscode10.window.showInformationMessage(
        "SecureScanner: Replace the hardcoded value with process.env.YOUR_VARIABLE_NAME and add the value to your .env file."
      );
    })
  );
  context.subscriptions.push(diagnosticsProvider, treeViewProvider, treeView, engine);
  if (vscode10.window.activeTextEditor) {
    engine.scanDocument(vscode10.window.activeTextEditor.document);
  }
  setTimeout(async () => {
    const config = vscode10.workspace.getConfiguration("secureScanner");
    if (config.get("enableOnOpen", true)) {
      const findings = await engine.scanWorkspace();
      if (findings.length > 0) {
        vscode10.window.showInformationMessage(
          `SecureScanner: Found ${findings.length} security issue(s) in workspace. Click to view.`,
          "Open Dashboard"
        ).then((selection) => {
          if (selection === "Open Dashboard") {
            vscode10.commands.executeCommand("secureScanner.openDashboard");
          }
        });
      }
    }
  }, 2e3);
  const statusBar = vscode10.window.createStatusBarItem(vscode10.StatusBarAlignment.Left, 100);
  statusBar.text = "$(shield) SecureScanner";
  statusBar.command = "secureScanner.openDashboard";
  statusBar.tooltip = "Open Security Dashboard";
  statusBar.show();
  context.subscriptions.push(statusBar);
}
function deactivate() {
  if (engine) {
    engine.dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
