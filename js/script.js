! function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).CSSDoodle = t()
}(this, (function() {
    "use strict";
    const e = [":", ";", ",", "(", ")", "[", "]", "{", "}", "\u03c0", "\xb1", "+", "-", "*", "/", "%", '"', "'", "`", "@", "=", "^"],
        t = {
            escape: e => "\\" == e,
            space: e => /[\r\n\t\s]/.test(e),
            digit: e => /^[0-9]$/.test(e),
            sign: e => /^[+-]$/.test(e),
            dot: e => "." == e,
            quote: e => /^["'`]$/.test(e),
            symbol: t => e.includes(t),
            hexNum: e => /^[0-9a-f]$/i.test(e),
            hex: (e, n, r) => "0" == e && t.letter(n, "x") && t.hexNum(r),
            expWithSign: (e, n, r) => t.letter(e, "e") && t.sign(n) && t.digit(r),
            exp: (e, n) => t.letter(e, "e") && t.digit(n),
            dots: (e, n) => t.dot(e) && t.dot(n),
            letter: (e, t) => String(e).toLowerCase() == String(t).toLowerCase(),
            comment: (e, t) => "/" == e && "*" == t,
            inlineComment: (e, t) => "/" == e && "/" === t,
            selfClosedTag: (e, t) => "/" == e && ">" == t,
            closedTag: (e, t) => "<" == e && "/" == t
        };
    class n {
        constructor({
            type: e,
            value: t,
            pos: n,
            status: r
        }) {
            this.type = e, this.value = t, this.pos = n, r && (this.status = r)
        }
        isSymbol(...e) {
            let t = "Symbol" == this.type;
            return e.length ? e.some((e => e === this.value)) : t
        }
        isSpace() {
            return "Space" == this.type
        }
        isNumber() {
            return "Number" == this.type
        }
        isWord() {
            return "Word" == this.type
        }
    }

    function r(e) {
        let t = -1,
            n = e.length,
            r = -1,
            i = 0;
        return {
            curr: (n = 0) => e[t + n],
            next(n = 1) {
                let s = e[t += n];
                return "\n" === s ? (i++, r = 0) : r += n, s
            },
            end: () => t >= n,
            get: () => ({
                prev: e[t - 1],
                curr: e[t + 0],
                next: e[t + 1],
                next2: e[t + 2],
                next3: e[t + 3],
                pos: [r, i]
            })
        }
    }

    function i(e) {
        for (; e.next();) {
            let {
                curr: n,
                prev: r
            } = e.get();
            if (t.comment(n, r)) break
        }
    }

    function s(e) {
        for (; e.next() && "\n" !== e.curr(););
    }

    function o(e) {
        return [":", ";", ",", "{", "}", "(", ")", "[", "]"].includes(e)
    }

    function l(e) {
        let n = "";
        for (; !e.end();) {
            let {
                curr: r,
                next: i
            } = e.get();
            n += r;
            let s = t.symbol(i) || t.space(i) || t.digit(i);
            if (n.length && s && !t.closedTag(r, i)) break;
            e.next()
        }
        return n.trim()
    }

    function a(e) {
        let n = "";
        for (; !e.end();) {
            let {
                curr: r,
                next: i
            } = e.get();
            if (n += r, !t.space(i)) break;
            e.next()
        }
        return n
    }

    function u(e) {
        let n = "",
            r = !1;
        for (; !e.end();) {
            let {
                curr: i,
                next: s,
                next2: o,
                next3: l
            } = e.get();
            if (n += i, r && t.dot(s)) break;
            if (t.dot(i) && (r = !0), t.dots(s, o)) break;
            if (t.expWithSign(s, o, l)) n += e.next() + e.next();
            else if (t.exp(s, o)) n += e.next();
            else if (!t.digit(s) && !t.dot(s)) break;
            e.next()
        }
        return n
    }

    function c(e) {
        let n = "0x";
        for (e.next(2); !e.end();) {
            let {
                curr: r,
                next: i
            } = e.get();
            if (n += r, !t.hexNum(i)) break;
            e.next()
        }
        return n
    }

    function h(e) {
        return e[e.length - 1]
    }

    function p(e, p = {}) {
        let f = r(String(e).trim()),
            m = [],
            d = [];
        for (; f.next();) {
            let {
                prev: e,
                curr: r,
                next: g,
                next2: v,
                pos: y
            } = f.get();
            if (t.comment(r, g)) i(f);
            else if (p.ignoreInlineComment && t.inlineComment(r, g)) s(f);
            else if (t.hex(r, g, v)) {
                let e = c(f);
                m.push(new n({
                    type: "Number",
                    value: e,
                    pos: y
                }))
            } else if (t.digit(r) || t.digit(g) && t.dot(r) && !t.dots(e, r)) {
                let e = u(f);
                m.push(new n({
                    type: "Number",
                    value: e,
                    pos: y
                }))
            } else if (t.symbol(r) && !t.selfClosedTag(r, g)) {
                let e = h(m),
                    i = t.digit(g) || t.dot(g) && t.digit(v);
                if ("-" === r && i && (!e || !e.isNumber())) {
                    let e = u(f);
                    m.push(new n({
                        type: "Number",
                        value: e,
                        pos: y
                    }));
                    continue
                }
                let s = {
                    type: "Symbol",
                    value: r,
                    pos: y
                };
                if (d.length && t.escape(e.value)) {
                    m.pop();
                    let e = l(f);
                    e.length && m.push(new n({
                        type: "Word",
                        value: e,
                        pos: y
                    }))
                } else {
                    if (t.quote(r)) {
                        h(d) == r ? (d.pop(), s.status = "close") : (d.push(r), s.status = "open")
                    }
                    m.push(new n(s))
                }
            } else if (t.space(r)) {
                let e = a(f),
                    t = h(m),
                    {
                        next: i
                    } = f.get();
                if (!d.length && t) {
                    let n = t.value,
                        s = o(n) && ")" !== n,
                        l = o(i) && "(" !== i;
                    if (s || l) continue;
                    e = p.preserveLineBreak ? r : " "
                }
                m.length && i && i.trim() && m.push(new n({
                    type: "Space",
                    value: e,
                    pos: y
                }))
            } else {
                let e = l(f);
                e.length && m.push(new n({
                    type: "Word",
                    value: e,
                    pos: y
                }))
            }
        }
        let g = h(m);
        return g && g.isSpace() && (m.length = m.length - 1), m
    }

    function f(e) {
        let t = [];
        for (; e.next();) {
            let {
                curr: n,
                next: r
            } = e.get();
            if ("var" === n.value) {
                if (r && r.isSymbol("(")) {
                    e.next();
                    let n = m(e);
                    g(n.name) && t.push(n)
                }
            } else if (t.length && !n.isSymbol(",")) break
        }
        return t
    }

    function m(e) {
        let t = {},
            n = [];
        for (; e.next();) {
            let {
                curr: r,
                next: i
            } = e.get();
            if (r.isSymbol(")", ";") && !t.name) {
                t.name = d(n);
                break
            }
            r.isSymbol(",") ? (void 0 === t.name && (t.name = d(n), n = []), t.name && (t.fallback = f(e))) : n.push(r)
        }
        return t
    }

    function d(e) {
        return e.map((e => e.value)).join("")
    }

    function g(e) {
        return void 0 !== e && (!(e.length <= 2) && (!e.substr(2).startsWith("-") && !!e.startsWith("--")))
    }

    function v(e, t, n) {
        return e = Number(e) || 0, Math.max(t, Math.min(n, e))
    }

    function y(e, t, n) {
        let r = 0,
            i = e,
            s = e => e > 0 && e < 1 ? .1 : 1,
            o = arguments.length;
        1 == o && ([e, t] = [s(e), e]), o < 3 && (n = s(e));
        let l = [];
        for (;
            (n >= 0 && e <= t || n < 0 && e > t) && (l.push(e), e += n, !(r++ >= 65535)););
        return l.length || l.push(i), l
    }

    function x(e, t) {
        for (let [n, r] of Object.entries(t)) e[n] = e[r];
        return e
    }

    function b(e) {
        return /^[a-zA-Z]$/.test(e)
    }

    function _(e) {
        return null == e
    }

    function w(e) {
        return _(e) || Number.isNaN(e)
    }

    function $(e) {
        return _(e) || "" === e
    }

    function k(e) {
        let t = t => (...n) => e(t, ...n);
        return t.lazy = !0, t
    }

    function S(e, t, n) {
        return "c-" + e + "-" + t + "-" + n
    }

    function j(e) {
        let t = e;
        for (; t && !_(t.value);) t = t.value;
        return _(t) ? "" : t
    }

    function A(e, t, n = 0) {
        let r = new Image;
        r.crossOrigin = "anonymous", r.src = e, r.onload = function() {
            setTimeout(t, n)
        }
    }

    function T() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    }

    function E(e) {
        let t = document.createElement("textarea");
        return t.innerHTML = e, t.value
    }

    function R(e, t = 0) {
        let n = 3735928559 ^ t,
            r = 1103547991 ^ t;
        for (let t, i = 0; i < e.length; i++) t = e.charCodeAt(i), n = Math.imul(n ^ t, 2654435761), r = Math.imul(r ^ t, 1597334677);
        return n = Math.imul(n ^ n >>> 16, 2246822507) ^ Math.imul(r ^ r >>> 13, 3266489909), r = Math.imul(r ^ r >>> 16, 2246822507) ^ Math.imul(n ^ n >>> 13, 3266489909), 4294967296 * (2097151 & r) + (n >>> 0)
    }

    function N(e) {
        return (t, ...n) => {
            let r = (i = t, _(i) ? [] : Array.isArray(i) ? i : [i]).reduce(((e, t, r) => {
                return e + t + (_(i = n[r]) ? "" : i);
                var i
            }), "");
            var i;
            return e(r)
        }
    }

    function z() {
        let e = 0;
        return (t = "") => `${t}-${++e}`
    }

    function P(e, t, n) {
        return t + e * (n - t)
    }

    function C(e = "") {
        return e + Math.random().toString(32).substr(2)
    }

    function M(e, t = {
        symbol: ",",
        noSpace: !1,
        verbose: !1
    }) {
        let n = [],
            i = [],
            s = [],
            o = [],
            l = "";
        if ($(e)) return n;
        let a = r(p(e));

        function u(e) {
            let n = t.symbol || [","];
            return Array.isArray(n) || (n = [n]), t.noSpace ? e.isSymbol(...n) : e.isSymbol(...n) || e.isSpace()
        }

        function c(e) {
            let r = function(e) {
                return e.map((e => e.value)).join("")
            }(e);
            t.verbose ? (l.length || r.length) && n.push({
                group: l,
                value: r
            }) : n.push(r)
        }
        for (; a.next();) {
            let {
                prev: e,
                curr: n,
                next: r
            } = a.get();
            n.isSymbol("(") && s.push(n.value), n.isSymbol(")") && s.pop(), "open" === n.status && o.push(n.value), "close" === n.status && o.pop();
            let h = !s.length && !o.length;
            if (h) {
                let i = t.noSpace && n.isSpace() && u(r),
                    s = t.noSpace && n.isSpace() && u(e);
                if (i || s) continue
            }
            h && u(n) ? (c(i), l = n.value, i = []) : i.push(n)
        }
        return i.length && c(i), n
    }

    function O(e, t) {
        let n, r = [],
            i = [],
            s = [];
        for (; e.next();) {
            let {
                curr: t,
                next: o
            } = e.get();
            t.isSymbol("(") && !i.length ? s.push(t) : t.isSymbol(")") && !i.length && s.pop();
            let l = !i.length && !s.length && (!o || t.isSymbol(";") || o.isSymbol("}"));
            if (t.isSymbol("'", '"') && ("open" === t.status ? i.push(t) : i.pop(), o && o.isSymbol("}") && !i.length && (l = !0)), !s.length && !i.length && t.isSymbol("{")) {
                let t = F(r);
                if (!t.length) continue;
                let i = t.pop(),
                    s = H(...t, i);
                for (n = D(I(e, q(i, {
                        type: "block",
                        inline: !0,
                        name: i,
                        value: []
                    })), s); i = t.pop();) n = D(q(i, {
                    type: "block",
                    name: i,
                    value: [n]
                }), s);
                break
            }
            if (r.push(t), l) break
        }
        return r.length && !n ? (t._valueTokens = r, t.value = U(r)) : n && (t.value = n), t.origin && (t.origin.value = t.value), t
    }

    function L(e) {
        let t = [],
            n = [];
        for (; e.next();) {
            let {
                curr: r
            } = e.get();
            if (r.isSymbol("{")) t.push(r.value);
            else if (r.isSymbol("}")) {
                if (!t.length) break;
                t.pop()
            }
            n.push(r.value)
        }
        return n.join("")
    }

    function I(e, t) {
        let n = [],
            r = [],
            i = t && t.type || "",
            s = [];
        for (; e.next();) {
            let {
                prev: o,
                curr: l,
                next: a
            } = e.get();
            l.isSymbol("(") && s.push(l.value), l.isSymbol(")") && s.pop();
            let u = !a || l.isSymbol("}");
            if (Y(i) && u) {
                if (!a && n.length && !l.isSymbol("}")) {
                    "string" == typeof n[n.length - 1].value && (n[n.length - 1].value += ";" + l.value)
                }
                t.value = n;
                break
            }
            if (l.isSymbol("{")) {
                let i = F(r);
                if (!i.length) continue;
                H(t.name) && (i = [U(r)]);
                let s = i.pop(),
                    o = H(...i, t.name, s);
                if ("style" === s) n.push({
                    type: "block",
                    name: s,
                    value: L(e)
                });
                else {
                    let t = D(I(e, q(s, {
                        type: "block",
                        name: s,
                        value: []
                    })), o);
                    for (; s = i.pop();) t = D(q(s, {
                        type: "block",
                        name: s,
                        value: [t]
                    }), o);
                    n.push(t)
                }
                r = []
            } else if (l.isSymbol(":") && !s.length && !W(o, a) && r.length) {
                let s = B(r, (e => e.isSymbol(","))),
                    o = {
                        type: "statement",
                        name: "unkown",
                        value: ""
                    };
                s.length > 1 && (o.origin = {
                    name: s
                });
                let l = O(e, o),
                    a = M(l.value),
                    u = s.length > 1 && a.length === s.length;
                s.forEach(((e, t) => {
                    let r = Object.assign({}, l, {
                        name: e
                    });
                    /^\-\-/.test(e) && (r.variable = !0), u && (r.value = a[t]), /viewBox/i.test(e) && (r.detail = X(r.value, r._valueTokens)), delete r._valueTokens, n.push(r)
                })), Y(i) && (t.value = n), r = []
            } else l.isSymbol(";") ? n.length && r.length && (n[n.length - 1].value += ";" + U(r), r = []) : r.push(l)
        }
        return n.length && Y(i) && (t.value = n), i ? t : n
    }

    function W(e, t) {
        let n = e && e.value,
            r = t && t.value;
        return ["xlink:actuate", "xlink:arcrole", "xlink:href", "xlink:role", "xlink:show", "xlink:title", "xlink:type", "xml:base", "xml:lang", "xml:space"].includes(n + ":" + r)
    }

    function U(e) {
        return e.filter(((t, n) => !t.isSymbol(";", "}") || n !== e.length - 1)).map((e => e.value)).join("")
    }

    function D(e, t) {
        let n = e.name || "",
            [r, ...i] = n.split(/#/),
            s = i[i.length - 1];
        return r && s && !t && (e.name = r, e.value.push({
            type: "statement",
            name: "id",
            value: s
        })), e
    }

    function B(e, t) {
        let n = [],
            r = [];
        return e.forEach((e => {
            t(e) ? (n.push(U(r)), r = []) : r.push(e)
        })), r.length && n.push(U(r)), n
    }

    function F(e) {
        let t, n = [],
            i = r(e);
        for (; i.next();) {
            let {
                prev: e,
                curr: r,
                next: s
            } = i.get(), o = e && s && "x" === r.value && e.isNumber() && s.isNumber();
            !r.isWord() || t || o ? n[n.length - 1] = (n[n.length - 1] + r.value).trim() : n.push(r.value.trim()), r.isSymbol() ? t = !0 : r.isSpace() || (t = !1)
        }
        return n
    }

    function X(e, t) {
        const n = {
            value: []
        };
        let r;
        if (!Array.isArray(t)) return n;
        for (let e of t) e.isSpace() || e.isSymbol(",", ";") || (n.value.length < 4 && e.isNumber() ? n.value.push(Number(e.value)) : e.isNumber() && r ? (n[r] = Number(e.value), r = null) : e.isWord() && (r = e.value));
        return n
    }

    function q(e, t) {
        let n = Object.assign({}, t);
        if (/\*\s*[0-9]/.test(e)) {
            let [t, r] = e.split("*");
            r && (n.times = r.trim(), n.pureName = t.trim())
        }
        return n
    }

    function H(...e) {
        return e.some((e => "style" === e))
    }

    function Y(e) {
        return "block" === e
    }

    function V(e, t) {
        return function(e) {
            let t, n = [];
            for (let r of e.value) "svg" === r.name && (t = r), r.variable && n.push(r);
            return t ? (t.value.push(...n), t) : e
        }(I(r(p(e)), t || {
            type: "block",
            name: "svg",
            value: []
        }))
    }

    function Z(e, t) {
        let n = "";
        if ("block" === e.type) {
            let t = Array.isArray(e.value) && e.value[0] && e.value[0].inline;
            if (e.times ? n += "@M" + e.times + "(" + e.pureName + "{" : n += e.name + (t ? " " : "{"), "style" === e.name) n += e.value;
            else if (Array.isArray(e.value) && e.value.length) {
                let t = "";
                for (let r of e.value) n += Z(r, t), r.origin && (t = r.origin.name.join(","))
            }
            e.times ? n += "})" : t || (n += "}")
        } else if ("statement" === e.type) {
            let r = e.origin && t === e.origin.name.join(","),
                i = e.origin ? e.origin.name.join(",") : e.name,
                s = e.origin ? e.origin.value : e.value;
            r || (n += s && s.type ? i + ":" + Z(s) : i + ":" + s + ";")
        }
        return n
    }

    function G(e) {
        return Z(e).trim()
    }

    function J(e) {
        return _(e) ? [] : Array.isArray(e) ? e : [e]
    }

    function K(e, t = "\n") {
        return (e || []).join(t)
    }

    function Q(e, t = 1) {
        return _(e) ? "" : e[e.length - t]
    }

    function ee(e) {
        return e[0]
    }

    function te(e, t) {
        return Array.prototype.flatMap ? e.flatMap(t) : e.reduce(((e, n) => e.concat(t(n))), [])
    }
    const ne = {
            func: (e = "") => ({
                type: "func",
                name: e,
                arguments: []
            }),
            argument: () => ({
                type: "argument",
                value: []
            }),
            text: (e = "") => ({
                type: "text",
                value: e
            }),
            pseudo: (e = "") => ({
                type: "pseudo",
                selector: e,
                styles: []
            }),
            cond: (e = "") => ({
                type: "cond",
                name: e,
                styles: [],
                arguments: []
            }),
            rule: (e = "") => ({
                type: "rule",
                property: e,
                value: []
            }),
            keyframes: (e = "") => ({
                type: "keyframes",
                name: e,
                steps: []
            }),
            step: (e = "") => ({
                type: "step",
                name: e,
                styles: []
            })
        },
        re = {
            white_space: e => /[\s\n\t]/.test(e),
            line_break: e => /\n/.test(e),
            number: e => !isNaN(e),
            pair: e => ['"', "(", ")", "'"].includes(e),
            pair_of: (e, t) => ({
                '"': '"',
                "'": "'",
                "(": ")"
            } [e] == t)
        },
        ie = {
            \u03c0: Math.PI,
            "\u220f": Math.PI
        };

    function se(e) {
        return ["@canvas", "@shaders", "@doodle"].includes(e)
    }

    function oe(e = "") {
        let t = 0,
            n = 1,
            r = 1;
        return {
            curr: (n = 0) => e[t + n],
            end: () => e.length <= t,
            info: () => ({
                index: t,
                col: n,
                line: r
            }),
            index: e => void 0 === e ? t : t = e,
            range: (t, n) => e.substring(t, n),
            next() {
                let i = e[t++];
                return "\n" == i ? (r++, n = 0) : n++, i
            }
        }
    }

    function le(e, {
        col: t,
        line: n
    }) {
        console.warn(`(at line ${n}, column ${t}) ${e}`)
    }

    function ae(e) {
        return function(t, n) {
            let r = t.index(),
                i = "";
            for (; !t.end();) {
                let n = t.next();
                if (e(n)) break;
                i += n
            }
            return n && t.index(r), i
        }
    }

    function ue(e, t) {
        return ae((e => /[^\w@]/.test(e)))(e, t)
    }

    function ce(e) {
        return ae((e => /[\s\{]/.test(e)))(e)
    }

    function he(e, t) {
        return ae((e => re.line_break(e) || "{" == e))(e, t)
    }

    function pe(e, t) {
        let n, r = ne.step();
        for (; !e.end() && "}" != (n = e.curr());)
            if (re.white_space(n)) e.next();
            else {
                if (r.name.length) {
                    if (r.styles.push(Te(e, t)), "}" == e.curr()) break
                } else r.name = Se(e);
                e.next()
            } return r
    }

    function fe(e, t) {
        const n = [];
        let r;
        for (; !e.end() && "}" != (r = e.curr());) re.white_space(r) || n.push(pe(e, t)), e.next();
        return n
    }

    function me(e, t) {
        let n, r = ne.keyframes();
        for (; !e.end() && "}" != (n = e.curr());)
            if (r.name.length) {
                if ("{" == n || "{" == e.curr(-1)) {
                    e.next(), r.steps = fe(e, t);
                    break
                }
                e.next()
            } else if (ue(e), r.name = ce(e), !r.name.length) {
            le("missing keyframes name", e.info());
            break
        }
        return r
    }

    function de(e, t = {}) {
        for (e.next(); !e.end();) {
            let n = e.curr();
            if (t.inline) {
                if ("\n" == n) break
            } else if ("*" == (n = e.curr()) && "/" == e.curr(1)) break;
            e.next()
        }
        t.inline || (e.next(), e.next())
    }

    function ge(e) {
        for (e.next(); !e.end();) {
            if (">" == e.curr()) break;
            e.next()
        }
    }

    function ve(e) {
        let t, n = "";
        for (; !e.end() && ":" != (t = e.curr());) re.white_space(t) || (n += t), e.next();
        return n
    }

    function ye(e, t, n) {
        let r, i = [],
            s = [],
            o = [],
            l = "",
            a = "";
        for (; !e.end();) {
            r = e.curr();
            let h = e.curr(-1),
                p = e.curr(1),
                f = e.index();
            if (/[\('"`]/.test(r) && "\\" !== h) o.length ? ("(" !== r && "(" === Q(o) && o.pop(), "(" != r && r === Q(o) ? o.pop() : o.push(r)) : o.push(r), l += r;
            else if (("@" == r || "." === h && t) && !n) s.length || (l = l.trimLeft()), l.length && (s.push(ne.text(l)), l = ""), s.push($e(e));
            else if (n && /[)]/.test(r) || !n && /[,)]/.test(r))
                if (o.length) ")" == r && "(" === Q(o) && o.pop(), l += r;
                else {
                    if (l.length && (s.length ? /\S/.test(l) && s.push(ne.text(l)) : s.push(ne.text((c = l).trim().length ? re.number(+c) ? +c : c.trim() : c)), l.startsWith("\xb1") && !n)) {
                        let e = l.substr(1),
                            t = (u = s, JSON.parse(JSON.stringify(u)));
                        Q(t).value = "-" + e, i.push(be(t)), Q(s).value = e
                    }
                    if (i.push(be(s)), [s, l] = [
                            [], ""
                        ], ")" == r) break
                }
            else ie[r] && !/[0-9]/.test(e.curr(-1)) && (r = ie[r]), l += r;
            if (!(!t || ")" != p && ";" != p && /[0-9a-zA-Z_\-.]/.test(e.curr()) || o.length)) {
                s.length && i.push(be(s));
                break
            }
            a += e.range(f, e.index() + 1), e.next()
        }
        var u, c;
        return [xe(i), a]
    }

    function xe(e) {
        let t = Q(e[0]);
        return t && "text" === t.type && !String(t.value).trim().length && (e[0] = e[0].slice(0, -1)), e
    }

    function be(e) {
        let t = e.map((e => {
                if ("text" == e.type && "string" == typeof e.value) {
                    let t = String(e.value);
                    t.includes("`") && (e.value = t = t.replace(/`/g, '"')), e.value = t
                }
                return e
            })),
            n = ee(t) || {},
            r = Q(t) || {};
        if ("text" == n.type && "text" == r.type) {
            let e = ee(n.value),
                i = Q(r.value);
            "string" == typeof n.value && "string" == typeof r.value && re.pair_of(e, i) && (n.value = n.value.slice(1), r.value = r.value.slice(0, r.value.length - 1), t.cluster = !0)
        }
        return t
    }

    function _e(e) {
        let t = JSON.stringify(e);
        return t.includes("pureName") && t.includes("times")
    }

    function we(e) {
        return /^@svg$/i.test(e)
    }

    function $e(e) {
        let t, n = ne.func(),
            r = e.curr(),
            i = !1;
        for ("@" === r ? e.next() : r = "@"; !e.end();) {
            t = e.curr();
            let s = e.curr(1),
                o = "." == t && ("@" == s || /[a-zA-Z]/.test(s));
            if ("(" == t || o) {
                i = !0, e.next();
                let [t, s] = ye(e, o, se(r));
                if (we(r) && /\d\s*{/.test(s)) {
                    let e = V(s);
                    if (_e(e)) {
                        let n = G(e);
                        n += ")", t = ye(oe(n), o, se(r))[0]
                    }
                }
                n.arguments = t;
                break
            }
            if (/[0-9a-zA-Z_\-.]/.test(t) && (r += t), !i && "(" !== s && !/[0-9a-zA-Z_\-.]/.test(s)) break;
            e.next()
        }
        let {
            fname: s,
            extra: o
        } = function(e) {
            let t = "",
                n = "";
            if (/\D$/.test(e) && !/\d+[x-]\d+/.test(e) || Math[e.substr(1)]) return {
                fname: e,
                extra: n
            };
            for (let r = e.length - 1; r >= 0; r--) {
                let i = e[r],
                    s = e[r - 1],
                    o = e[r + 1];
                if (!(/[\d.]/.test(i) || ("x" == i || "-" == i) && /\d/.test(s) && /\d/.test(o))) {
                    t = e.substring(0, r + 1);
                    break
                }
                n = i + n
            }
            return {
                fname: t,
                extra: n
            }
        }(r);
        return n.name = s, o.length && n.arguments.unshift([{
            type: "text",
            value: o
        }]), n.position = e.info().index, n
    }

    function ke(e) {
        let t, n = ne.text(),
            r = 0,
            i = !0;
        const s = [];
        s[r] = [];
        let o = [],
            l = [];
        for (; !e.end();)
            if (t = e.curr(), i && re.white_space(t)) e.next();
            else {
                if (i = !1, "\n" != t || re.white_space(e.curr(-1)))
                    if ("," != t || o.length) {
                        if (/[;}<]/.test(t) && !l.length) {
                            n.value.length && (s[r].push(n), n = ne.text());
                            break
                        }
                        if ("@" == t && /\w/.test(e.curr(1))) n.value.length && (s[r].push(n), n = ne.text()), s[r].push($e(e));
                        else if ('"' === t || "'" === t) {
                            t === Q(l) ? l.pop() : l.length || l.push(t), n.value += t
                        } else re.white_space(t) && re.white_space(e.curr(-1)) || ("(" == t && o.push(t), ")" == t && o.pop(), ie[t] && !/[0-9]/.test(e.curr(-1)) && (t = ie[t]), n.value += t)
                    } else n.value.length && (s[r].push(n), n = ne.text()), s[++r] = [], i = !0;
                else n.value += " ";
                if (";" === e.curr() || "}" == e.curr()) break;
                e.next()
            } return n.value.length && s[r].push(n), s
    }

    function Se(e) {
        let t, n = "";
        for (; !e.end() && "{" != (t = e.curr());) re.white_space(t) || (n += t), e.next();
        return n
    }

    function je(e) {
        let t, n = {
            name: "",
            arguments: []
        };
        for (; !e.end();) {
            if ("(" == (t = e.curr())) e.next(), n.arguments = ye(e)[0];
            else {
                if (/[){]/.test(t)) break;
                re.white_space(t) || (n.name += t)
            }
            e.next()
        }
        return n
    }

    function Ae(e, t) {
        let n, r = ne.pseudo();
        for (; !e.end();) {
            if (n = e.curr(), "/" == n && "*" == e.curr(1)) de(e);
            else {
                if ("}" == n) break;
                if (re.white_space(n)) {
                    e.next();
                    continue
                }
                if (r.selector) {
                    let n = Te(e, t);
                    if ("@use" == n.property ? r.styles = r.styles.concat(n.value) : r.styles.push(n), "}" == e.curr()) break
                } else r.selector = Se(e)
            }
            e.next()
        }
        return r
    }

    function Te(e, t) {
        let n, r = ne.rule(),
            i = e.index();
        for (; !e.end();) {
            if (n = e.curr(), "/" == n && "*" == e.curr(1)) de(e);
            else {
                if (";" == n) break;
                if (r.property.length) {
                    r.value = ke(e);
                    break
                }
                if (r.property = ve(e), "@use" == r.property) {
                    r.value = ze(e, t);
                    break
                }
            }
            e.next()
        }
        let s = e.index();
        return r.raw = () => e.range(i, s).trim(), r
    }

    function Ee(e, t) {
        let n, r = ne.cond();
        for (; !e.end();) {
            if (n = e.curr(), "/" == n && "*" == e.curr(1)) de(e);
            else {
                if ("}" == n) break;
                if (r.name.length)
                    if (":" == n) {
                        let t = Ae(e);
                        t.selector && r.styles.push(t)
                    } else if ("@" != n || he(e, !0).includes(":")) {
                    if (!re.white_space(n)) {
                        let n = Te(e, t);
                        if (n.property && r.styles.push(n), "}" == e.curr()) break
                    }
                } else r.styles.push(Ee(e));
                else Object.assign(r, je(e))
            }
            e.next()
        }
        return r
    }

    function Re(e, t) {
        let n = "";
        return e && e.get_variable && (n = e.get_variable(t)), n
    }

    function Ne(e, t) {
        e.forEach && e.forEach((e => {
            if ("text" == e.type && e.value) {
                let n = f(r(p(e.value)));
                e.value = n.reduce(((e, n) => {
                    let r, i = "",
                        s = "";
                    i = Re(t, n.name), !i && n.fallback && n.fallback.every((e => {
                        if (s = Re(t, e.name), s) return i = s, !1
                    }));
                    try {
                        r = Pe(i, t)
                    } catch (e) {}
                    return r && e.push.apply(e, r), e
                }), [])
            }
            "func" == e.type && e.arguments && e.arguments.forEach((e => {
                Ne(e, t)
            }))
        }))
    }

    function ze(e, t) {
        return e.next(), (ke(e) || []).reduce(((e, n) => {
            Ne(n, t);
            let [r] = n;
            return r.value && r.value.length && e.push(...r.value), e
        }), [])
    }

    function Pe(e, t) {
        const n = oe(e),
            r = [];
        for (; !n.end();) {
            let e = n.curr();
            if (re.white_space(e)) n.next();
            else {
                if ("/" == e && "*" == n.curr(1)) de(n);
                else if (":" == e) {
                    let e = Ae(n, t);
                    e.selector && r.push(e)
                } else if ("@" == e && "@keyframes" === ue(n, !0)) {
                    let e = me(n, t);
                    r.push(e)
                } else if ("@" != e || he(n, !0).includes(":")) {
                    if ("<" == e) ge(n);
                    else if (!re.white_space(e)) {
                        let e = Te(n, t);
                        e.property && r.push(e)
                    }
                } else {
                    let e = Ee(n, t);
                    e.name.length && r.push(e)
                }
                n.next()
            }
        }
        return r
    }

    function Ce(e, t = 64) {
        const [n, r, i] = [1, t, t * t];
        let [s, o, l] = (e + "").replace(/\s+/g, "").replace(/[,\uff0cxX]+/g, "x").split("x").map((e => parseInt(e)));
        const a = 1 == s || 1 == o ? i : r,
            u = 1 == s && 1 == o ? i : n,
            c = {
                x: v(s || n, 1, a),
                y: v(o || s || n, 1, a),
                z: v(l || n, 1, u)
            };
        return Object.assign({}, c, {
            count: c.x * c.y * c.z,
            ratio: c.x / c.y
        })
    }

    function Me(e) {
        return /^texture\w*$|^(fragment|vertex)$/.test(e)
    }

    function Oe() {
        return new n({
            type: "LineBreak",
            value: "\n"
        })
    }

    function Le(e) {
        let t = e[0],
            n = e[e.length - 1];
        for (; t && t.isSymbol("(") && n && n.isSymbol(")");) t = (e = e.slice(1, e.length - 1))[0], n = e[e.length - 1];
        return e
    }

    function Ie(e) {
        return Le(e).map((e => e.value)).join("")
    }

    function We(e, t) {
        return `url("data:image/svg+xml;utf8,${encodeURIComponent(e)+(t?`#${t}`:"")}")`
    }

    function Ue(e) {
        const t = 'xmlns="http://www.w3.org/2000/svg"',
            n = 'xmlns:xlink="http://www.w3.org/1999/xlink"';
        return e.includes("<svg") || (e = `<svg ${t} ${n}>${e}</svg>`), e.includes("xmlns") || (e = e.replace(/<svg([\s>])/, `<svg ${t} ${n}$1`)), e
    }
    const De = z();
    class Be {
        constructor(e, t = "") {
            if (!e) throw new Error("Tag name is required");
            this.name = e, this.body = [], this.attrs = {}, this.isTextNode() && (this.body = t)
        }
        isTextNode() {
            return "text-node" === this.name
        }
        find(e) {
            let t = e.attrs.id,
                n = e.name;
            if (Array.isArray(this.body) && void 0 !== t) return this.body.find((e => e.attrs.id === t && e.name === n))
        }
        append(e) {
            this.isTextNode() || this.body.push(e)
        }
        merge(e) {
            for (let [t, n] of Object.entries(e.attrs)) this.attrs[t] = n;
            Array.isArray(e.body) && this.body.push(...e.body)
        }
        attr(e, t) {
            if (!this.isTextNode()) return void 0 === t ? this.attrs[e] : this.attrs[e] = t
        }
        toString() {
            if (this.isTextNode()) return Fe(this.body);
            let e = [""],
                t = [];
            for (let [t, n] of Object.entries(this.attrs)) n = Fe(n), e.push(`${t}="${n}"`);
            for (let e of this.body) t.push(e.toString());
            return `<${this.name}${e.join(" ")}>${t.join("")}</${this.name}>`
        }
    }

    function Fe(e) {
        let t = (e = String(e)).startsWith('"') && e.endsWith('"'),
            n = e.startsWith("'") && e.endsWith("'");
        return t || n ? e.substring(1, e.length - 1) : e
    }

    function Xe(e, t, n, r) {
        let i;
        if (t || (t = new Be("root")), "block" === e.type)
            if ("style" === e.name) {
                let n = new Be("style");
                n.append(e.value), t.append(n)
            } else {
                let n = new Be(e.name);
                r || (r = n).attr("xmlns", "http://www.w3.org/2000/svg");
                for (let t of e.value) {
                    let s = Xe(t, n, e, r);
                    s && (i = s)
                }
                if (e.inline) {
                    let t = e.value.find((e => "statement" === e.type && "id" === e.name));
                    t ? i = t.value : (i = De(e.name), n.attr("id", i))
                }
                let s = r.find(n);
                s ? s.merge(n) : t.append(n)
            } if ("statement" === e.type && !e.variable)
            if ("content" === e.name) {
                let n = new Be("text-node", e.value);
                t.append(n)
            } else if (e.name.startsWith("style ")) {
            let n = (e.name.split("style ")[1] || "").trim();
            if (n.length) {
                let r = t.attr("style") || "";
                t.attr("style", r + function(e, t) {
                    return `${e}:${t};`
                }(n, e.value))
            }
        } else {
            let n = e.value;
            if (n && "block" === n.type) {
                let t = Xe(e.value, r, e, r);
                n = `url(#${t})`, "xlink:href" !== e.name && "href" !== e.name || (n = `#${t}`)
            }
            /viewBox/i.test(e.name) ? (n = function(e) {
                let t = e.detail.value,
                    n = e.detail.padding || e.detail.expand;
                if (!t.length) return "";
                let [r, i, s, o] = t;
                return n && ([r, i, s, o] = [r - n, r - n, s + 2 * n, o + 2 * n]), `${r} ${i} ${s} ${o}`
            }(e), n && t.attr(e.name, n)) : t.attr(e.name, n), e.name.includes("xlink:") && r.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        }
        return n ? i : r.toString()
    }

    function qe(e) {
        return Xe(e)
    }

    function He(e) {
        let t = r(p(e)),
            n = {},
            i = !1;
        for (; t.next();) {
            let {
                prev: e,
                curr: r,
                next: s
            } = t.get(), o = i && (r.isWord() || r.isSymbol()) && e && e.isNumber() && !s;
            if (r.isNumber()) n.value = Number(r.value), i = !0;
            else {
                if (!o) break;
                n.unit = r.value
            }
        }
        return n
    }

    function Ye(e) {
        return (...t) => {
            let n = [],
                r = [];
            for (let e of t) {
                let {
                    unit: t,
                    value: i
                } = He(e);
                void 0 !== t && n.push(t), void 0 !== i && r.push(i)
            }
            let i = e(...r),
                s = n.find((e => void 0 !== e));
            return void 0 === s ? i : Array.isArray(i) ? i.map((e => e + s)) : i + s
        }
    }

    function Ve(e) {
        return (...t) => {
            let n = t.map((e => String(e).charCodeAt(0))),
                r = e(...n);
            return Array.isArray(r) ? r.map((e => String.fromCharCode(e))) : String.fromCharCode(r)
        }
    }
    const Ze = {
            \u03c0: Math.PI,
            gcd: (e, t) => {
                for (; t;)[e, t] = [t, e % t];
                return e
            }
        },
        Ge = {
            "^": 7,
            "*": 6,
            "/": 6,
            "\xf7": 6,
            "%": 6,
            "&": 5,
            "|": 5,
            "+": 4,
            "-": 4,
            "<": 3,
            "<<": 3,
            ">": 3,
            ">>": 3,
            "=": 3,
            "==": 3,
            "\u2264": 3,
            "<=": 3,
            "\u2265": 3,
            ">=": 3,
            "\u2260": 3,
            "!=": 3,
            "\u2227": 2,
            "&&": 2,
            "\u2228": 2,
            "||": 2,
            "(": 1,
            ")": 1
        };

    function Je(e, t, n = []) {
        let r = [];
        for (; e.length;) {
            let {
                name: s,
                value: o,
                type: l
            } = e.shift();
            if ("variable" === l) {
                let e = t[o];
                w(e) && (e = Math[o]), w(e) && (e = et(o, t)), w(e) && /^\-\D/.test(o) && (e = et("-1" + o.substr(1), t)), void 0 === e && (e = 0), "number" != typeof e && (n.push(e), (i = n)[0] == i[2] && i[1] == i[3] ? (e = 0, n = []) : e = Je(Ke(e), t, n)), r.push(e)
            } else if ("function" === l) {
                let e = !1;
                /^\-/.test(s) && (e = !0, s = s.substr(1));
                let n, i = o.map((e => Je(e, t))),
                    l = s.split(".");
                for (; n = l.pop();) {
                    if (!n) continue;
                    let e = t[n] || Math[n];
                    i = "function" == typeof e ? Array.isArray(i) ? e(...i) : e(i) : 0
                }
                e && (i *= -1), r.push(i)
            } else if (/\d+/.test(o)) r.push(o);
            else {
                let e = r.pop(),
                    t = r.pop();
                r.push(Qe(o, Number(t), Number(e)))
            }
        }
        var i;
        return Number(r[0]) || 0
    }

    function Ke(e) {
        let t = function(e) {
            let t = String(e),
                n = [],
                r = "";
            for (let e = 0; e < t.length; ++e) {
                let i = t[e];
                if (Ge[i]) {
                    let s = Q(n);
                    if ("=" == i && s && /^[!<>=]$/.test(s.value)) s.value += i;
                    else if (/^[|&<>]$/.test(i) && s && s.value == i) s.value += i;
                    else if ("-" == i && "e" == t[e - 1]) r += i;
                    else if (n.length || r.length || !/[+-]/.test(i)) {
                        let {
                            type: e,
                            value: t
                        } = s || {};
                        "operator" == e && !r.length && /[^()]/.test(i) && /[^()]/.test(t) ? r += i : (r.length && (n.push({
                            type: "number",
                            value: r
                        }), r = ""), n.push({
                            type: "operator",
                            value: i
                        }))
                    } else r += i
                } else /\S/.test(i) && ("," == i ? (n.push({
                    type: "number",
                    value: r
                }), r = "", n.push({
                    type: "comma",
                    value: i
                })) : "!" == i ? (n.push({
                    type: "number",
                    value: r
                }), n.push({
                    type: "operator",
                    value: i
                }), r = "") : r += i)
            }
            return r.length && n.push({
                type: "number",
                value: r
            }), n
        }(e);
        const n = [],
            r = [];
        for (let e = 0; e < t.length; ++e) {
            let {
                type: i,
                value: s
            } = t[e], o = t[e + 1] || {};
            if ("number" == i)
                if ("(" == o.value && /[^\d.\-]/.test(s)) {
                    let n = "",
                        i = [],
                        o = [];
                    for (e += 1; void 0 !== t[e++];) {
                        let r = t[e];
                        if (void 0 === r) break;
                        let s = r.value;
                        if (")" == s) {
                            if (!i.length) break;
                            i.pop(), n += s
                        } else if ("(" == s && i.push(s), "," != s || i.length) n += s;
                        else {
                            let e = Ke(n);
                            e.length && o.push(e), n = ""
                        }
                    }
                    n.length && o.push(Ke(n)), r.push({
                        type: "function",
                        name: s,
                        value: o
                    })
                } else /[^\d.\-]/.test(s) ? r.push({
                    type: "variable",
                    value: s
                }) : r.push({
                    type: "number",
                    value: s
                });
            else if ("operator" == i)
                if ("(" == s) n.push(s);
                else if (")" == s) {
                for (; n.length && "(" != Q(n);) r.push({
                    type: "operator",
                    value: n.pop()
                });
                n.pop()
            } else {
                for (; n.length && Ge[Q(n)] >= Ge[s];) {
                    let e = n.pop();
                    /[()]/.test(e) || r.push({
                        type: "operator",
                        value: e
                    })
                }
                n.push(s)
            }
        }
        for (; n.length;) r.push({
            type: "operator",
            value: n.pop()
        });
        return r
    }

    function Qe(e, t, n) {
        switch (e) {
            case "+":
                return t + n;
            case "-":
                return t - n;
            case "*":
                return t * n;
            case "%":
                return t % n;
            case "|":
                return t | n;
            case "&":
                return t & n;
            case "<":
                return t < n;
            case ">":
                return t > n;
            case "^":
                return Math.pow(t, n);
            case "\xf7":
            case "/":
                return t / n;
            case "=":
            case "==":
                return t == n;
            case "\u2264":
            case "<=":
                return t <= n;
            case "\u2265":
            case ">=":
                return t >= n;
            case "\u2260":
            case "!=":
                return t != n;
            case "\u2227":
            case "&&":
                return t && n;
            case "\u2228":
            case "||":
                return t || n;
            case "<<":
                return t << n;
            case ">>":
                return t >> n
        }
    }

    function et(e, t) {
        let [n, r, i] = e.match(/([\d.\-]+)(.*)/) || [], s = t[i];
        return void 0 === s ? s : "number" == typeof s ? Number(r) * s : r * Je(Ke(s), t)
    }

    function tt(e, t) {
        return Je(Ke(e), Object.assign({}, Ze, t))
    }
    var nt = new class {
        constructor() {
            this.cache = {}
        }
        clear() {
            this.cache = {}
        }
        set(e, t) {
            if (_(e)) return "";
            let n = this.getKey(e);
            return this.cache[n] = t
        }
        get(e) {
            let t = this.getKey(e);
            return this.cache[t]
        }
        getKey(e) {
            return R("string" == typeof e ? e : JSON.stringify(e))
        }
    };

    function rt(e, t) {
        return (...n) => {
            let r = e + n.join("-");
            return nt.get(r) || nt.set(r, t(...n))
        }
    }

    function it(e, t) {
        return {
            type: e,
            value: t
        }
    }
    const st = rt("build_range", (e => {
        let t = function(e) {
            let t = String(e),
                n = [],
                r = [];
            if (!t.startsWith("[") || !t.endsWith("]")) return n;
            for (let e = 1; e < t.length - 1; ++e) {
                let i = t[e];
                if ("-" != i || "-" != t[e - 1])
                    if ("-" != i)
                        if ("-" != Q(r)) r.length && n.push(it("char", r.pop())), r.push(i);
                        else {
                            r.pop();
                            let e = r.pop();
                            n.push(e ? it("range", [e, i]) : it("char", i))
                        }
                else r.push(i)
            }
            return r.length && n.push(it("char", r.pop())), n
        }(e);
        return te(t, (({
            type: e,
            value: t
        }) => {
            if ("char" == e) return t;
            let [n, r] = t, i = !1;
            n > r && ([n, r] = [r, n], i = !0);
            let s = Ve(y)(n, r);
            return i && s.reverse(), s
        }))
    }));

    function ot(e) {
        return (...t) => e(...te(t, (e => String(e).startsWith("[") ? st(e) : e)))
    }
    class lt {
        constructor(e) {
            this.prev = this.next = null, this.data = e
        }
    }
    class at {
        constructor(e = 20) {
            this._limit = e, this._size = 0
        }
        push(e) {
            this._size >= this._limit && (this.root = this.root.next, this.root.prev = null);
            let t = new lt(e);
            this.root ? (t.prev = this.tail, this.tail.next = t, this.tail = t) : this.root = this.tail = t, this._size++
        }
        last(e = 1) {
            let t = this.tail;
            for (; --e && t.prev;) t = t.prev;
            return t.data
        }
    }
    class ut {
        constructor(e) {
            var t;
            this.p = (t = e([151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]), [].concat(t, t))
        }
        grad(e, t, n, r) {
            let i = 15 & e,
                s = i < 8 ? t : n,
                o = i < 4 ? n : 12 == i || 14 == i ? t : r;
            return (0 == (1 & i) ? s : -s) + (0 == (2 & i) ? o : -o)
        }
        noise(e, t, n) {
            let {
                p: r,
                grad: i
            } = this, [s, o, l] = [e, t, n].map((e => 255 & Math.floor(e)));
            [e, t, n] = [e, t, n].map((e => e - Math.floor(e)));
            let [a, u, c] = [e, t, n].map((e => e * e * e * (e * (6 * e - 15) + 10))), h = r[s] + o, p = r[h] + l, f = r[h + 1] + l, m = r[s + 1] + o, d = r[m] + l, g = r[m + 1] + l;
            return P(c, P(u, P(a, i(r[p], e, t, n), i(r[d], e - 1, t, n)), P(a, i(r[f], e, t - 1, n), i(r[g], e - 1, t - 1, n))), P(u, P(a, i(r[p + 1], e, t, n - 1), i(r[d + 1], e - 1, t, n - 1)), P(a, i(r[f + 1], e, t - 1, n - 1), i(r[g + 1], e - 1, t - 1, n - 1))))
        }
    }

    function ct(e, t) {
        let n = {},
            r = !0;
        for (let i = 0; i < e.length; ++i) {
            let s = e[i],
                o = t[i];
            if (/=/.test(s)) {
                let [e, i] = M(s, {
                    symbol: "=",
                    noSpace: !0
                });
                void 0 !== i ? (t.includes(e) && (n[e] = i), r = !1) : n[o] = s
            } else r && (n[o] = s)
        }
        return n
    }

    function ht(e) {
        let t, n = r(p(e)),
            i = {},
            s = [],
            o = !1;
        for (; n.next();) {
            let {
                prev: e,
                curr: r,
                next: l
            } = n.get();
            if (r.isSymbol(":") && !t) t = ft(s), s = [];
            else if (r.isSymbol(";") && t) i[t] = pt(t, ft(s), o), s = [], t = null, o = !1;
            else if (!r.isSymbol(";")) {
                let n = e && e.isSymbol("-"),
                    i = l && l.isSymbol("-"),
                    a = r.isSymbol("-");
                t || s.length || !a || n || i || l && l.isSymbol(":") ? s.push(r) : o = !0
            }
        }
        return s.length && t && (i[t] = pt(t, ft(s), o)), i
    }

    function pt(e, t, n) {
        return ["fill-rule", "fill"].includes(e) ? t : n ? `-1 * (${t})` : t
    }

    function ft(e) {
        return e.map((e => e.value)).join("")
    }
    const mt = ["auto", "reverse"],
        dt = ["deg", "rad", "grad", "turn"];

    function gt(e) {
        let t = r(p(e)),
            n = !1,
            i = "",
            s = {
                direction: "",
                angle: ""
            };
        for (; t.next();) {
            let {
                prev: e,
                curr: r,
                next: o
            } = t.get();
            if (r.isWord() && mt.includes(r.value)) s.direction = r.value, n = !0;
            else if (r.isNumber()) s.angle = Number(r.value), n = !0;
            else if (r.isWord() && e && e.isNumber() && dt.includes(r.value)) i = r.value;
            else if (r.isSpace() && "" !== s.direction && "" !== s.angle) break
        }
        return n || (s.direction = "auto"),
            function(e, t) {
                let {
                    angle: n
                } = e;
                "" === n && (n = 0);
                "rad" === t && (n /= Math.PI / 180);
                "grad" === t && (n *= .9);
                "turn" === t && (n *= 360);
                return Object.assign({}, e, {
                    angle: n
                })
            }(s, i)
    }
    const {
        cos: vt,
        sin: yt,
        abs: xt,
        atan2: bt,
        PI: _t
    } = Math, wt = N((e => At(ht(e), {
        min: 3,
        max: 3600
    }))), $t = {
        circle: () => wt`split:180;scale:.99`,
        triangle: () => wt`rotate:30;scale:1.1;move:0 .2`,
        pentagon: () => wt`split:5;rotate:54`,
        hexagon: () => wt`split:6;rotate:30;scale:.98`,
        octagon: () => wt`split:8;rotat:22.5;scale:.99`,
        star: () => wt`split:10;r:cos(5t);rotate:-18;scale:.99`,
        infinity: () => wt`split:180;scale:.99;x:cos(t)*.99 / (sin(t)^2 + 1);y:x * sin(t)`,
        heart: () => wt`split:180;rotate:180;a:cos(t)*13/18 - cos(2t)*5/18;b:cos(3t)/18 + cos(4t)/18;x:(.75 * sin(t)^3) * 1.2;y:(a - b + .2) * -1.1`,
        bean: () => wt`split:180;r:sin(t)^3 + cos(t)^3;move:-.35 .35;`,
        bicorn: () => wt`split:180;x:cos(t);y:sin(t)^2 / (2 + sin(t)) - .5`,
        drop: () => wt`split:180;rotate:90;scale:.95;x:sin(t);y:(1 + sin(t)) * cos(t) / 1.6`,
        fish: () => wt`split:240;x:cos(t) - sin(t)^2 / sqrt(2) - .04;y:sin(2t)/2`,
        whale: () => wt`split:240;rotate:180;R:3.4 * (sin(t)^2 - .5) * cos(t);x:cos(t) * R + .75;y:sin(t) * R * 1.2`,
        windmill: () => wt`split:18;R:seq(.618, 1, 0);T:seq(t-.55, t, t);x:R * cos(T);y:R * sin(T)`,
        vase: () => wt`split:240;scale:.3;x:sin(4t) + sin(t) * 1.4;y:cos(t) + cos(t) * 4.8 + .3`,
        clover: (e = 3) => (4 == (e = v(e, 3, 5)) && (e = 2), wt`split:240;r:cos(${e}t);scale:.98`),
        hypocycloid: (e = 3) => (e = v(e, 3, 5), wt`split:240;scale:${[0,0,0,.34,.25,.19][e]};k:${e};x:(k-1)*cos(t) + cos((k-1)*t);y:(k-1)*sin(t) - sin((k-1)*t)`),
        bud: (e = 3) => (e = v(e, 3, 10), wt`split:240;scale:.8;r:1 + .2 * cos(${e}t)`)
    };
    class kt {
        constructor(e, t, n) {
            this.x = e, this.y = t, this.extra = n
        }
        valueOf() {
            return this.x + " " + this.y
        }
        toString() {
            return this.valueOf()
        }
    }

    function St(e, t, n, r, i) {
        let s = 180 * bt(t + r, e - n) / _t;
        return "reverse" === i.direction && (s -= 180), i.direction || (s = 90), i.angle && (s += i.angle), s
    }

    function jt(e, t, n) {
        let [r, i = r] = M(n).map(Number);
        return [e * r, t * i]
    }

    function At(e, {
        min: t,
        max: n
    }) {
        let r = v(parseInt(e.vertices || e.points || e.split) || 0, t, n),
            i = $(e.x) ? "cos(t)" : e.x,
            s = $(e.y) ? "sin(t)" : e.y,
            o = $(e.r) ? "" : e.r,
            {
                unit: l,
                value: a
            } = He(o);
        return l && !e[l] && "t" !== l && ($(e.unit) && (e.unit = l), o = e.r = a), e.degree && (e.rotate = e.degree), e.origin && (e.move = e.origin),
            function(e, t) {
                "function" == typeof arguments[0] && (t = e, e = {}), t || (t = e => [vt(e), yt(e)]);
                let n, r, i = e.split || 180,
                    s = e.turn || 1,
                    o = e.frame,
                    l = e.fill || e["fill-rule"],
                    a = gt(e.direction || e.dir || ""),
                    u = e.unit,
                    c = 2 * _t * s / i,
                    h = [],
                    p = void 0 === e.scale ? 1 : e.scale,
                    f = ([e, t, n = 0, r = 0]) => {
                        if ("evenodd" == e || "nonzero" == e) return h.push(new kt(e, "", ""));
                        let [i, s] = jt(e, -t, p), [o, l] = jt(n, -r, p), c = St(i, s, o, l, a);
                        void 0 !== u && "%" !== u ? "none" !== u && (i += u, s += u) : (i = 50 * (i + 1) + "%", s = 50 * (s + 1) + "%"), h.push(new kt(i, s, c))
                    };
                "nonzero" != l && "evenodd" != l || f([l, "", ""]);
                for (let e = 0; e < i; ++e) {
                    let r = t(c * e, e);
                    e || (n = r), f(r)
                }
                if (void 0 !== o) {
                    f(n);
                    let e = o / 100;
                    s > 1 && (e *= 2), 0 == e && (e = .002);
                    for (let n = 0; n < i; ++n) {
                        let i = -c * n,
                            [s, o, l = 0, a = 0] = t(i, n),
                            u = bt(o + a, s - l),
                            h = [s - e * vt(u), o - e * yt(u)];
                        n || (r = h), f(h)
                    }
                    f(r), f(n)
                }
                return h
            }(Object.assign({}, e, {
                split: r
            }), ((t, n) => {
                let l = Object.assign({}, e, {
                        t,
                        \u03b8: t,
                        i: n + 1,
                        seq: (...e) => e.length ? e[n % e.length] : "",
                        range: (e, t = 0) => ((e = Number(e) || 0) > (t = Number(t) || 0) && ([e, t] = [t, e]), e + xt(t - e) / (r - 1) * n)
                    }),
                    a = tt(i, l),
                    u = tt(s, l),
                    c = 0,
                    h = 0;
                if (o) {
                    let e = tt(o, l);
                    0 == e && (e = 1e-5), a = e * vt(t), u = e * yt(t)
                }
                return e.rotate && ([a, u] = function(e, t, n) {
                    let r = -_t / 180 * n;
                    return [e * vt(r) - t * yt(r), t * vt(r) + e * yt(r)]
                }(a, u, Number(e.rotate) || 0)), e.move && ([a, u, c, h] = function(e, t, n) {
                    let [r, i = r] = M(n).map(Number);
                    return [e + (r || 0), t - (i || 0), r, i]
                }(a, u, e.move)), [a, u, c, h]
            }))
    }

    function Tt(e) {
        let t = r(p(e)),
            n = {},
            i = {
                commands: [],
                valid: !0
            };
        for (; t.next();) {
            let {
                curr: e
            } = t.get();
            if (!e.isSpace() && !e.isSymbol(","))
                if (e.isWord()) n.name && (i.commands.push(n), n = {}), n.name = e.value, n.value = [], "MmLlHhVvCcSsQqTtAaZz".includes(e.value) ? "mlhvcsqtaz".includes(e.value) ? n.type = "relative" : n.type = "absolute" : (n.type = "unknown", i.valid = !1);
                else if (n.value) {
                let t = e.value;
                e.isNumber() && (t = Number(e.value)), n.value.push(t)
            } else n.name || (i.valid = !1)
        }
        return n.name && i.commands.push(n), i
    }
    const Et = {
        name: "cssd-uniform-time",
        "animation-name": "cssd-uniform-time-animation",
        "animation-duration": 31536e6,
        "animation-iteration-count": "infinite",
        "animation-delay": "0s",
        "animation-direction": "normal",
        "animation-fill-mode": "none",
        "animation-play-state": "running",
        "animation-timing-function": "linear"
    };
    Et.animation = `\n ${Et["animation-duration"]}ms\n ${Et["animation-timing-function"]} ${Et["animation-delay"]} ${Et["animation-iteration-count"]} ${Et["animation-name"]}`;
    const Rt = {
            name: "cssd-uniform-mousex"
        },
        Nt = {
            name: "cssd-uniform-mousey"
        },
        zt = {
            name: "cssd-uniform-width"
        },
        Pt = {
            name: "cssd-uniform-height"
        };
    var Ct = Object.freeze({
        __proto__: null,
        uniform_time: Et,
        uniform_mousex: Rt,
        uniform_mousey: Nt,
        uniform_width: zt,
        uniform_height: Pt
    });

    function Mt(e) {
        return k(((t, n, ...r) => {
            if (!r || !n) return "";
            let i = j(n()),
                s = i;
            /\D/.test(i) && !/\d+[x-]\d+/.test(i) && (s = tt(i), 0 === s && (s = i));
            let o = Math.random();
            return function(e, t) {
                let [n, r = 1] = String(e).split(/[x-]/), [i, s] = [Math.ceil(n), Math.ceil(r)];
                w(i) && (i = 1), w(s) && (s = 1), n = v(i, 0, 65536), r = v(s, 0, 65536);
                let o = n * r,
                    l = [],
                    a = 1;
                if (/x/.test(e))
                    for (let e = 1; e <= r; ++e)
                        for (let i = 1; i <= n; ++i) l.push(t(a++, i, e, o, n, r, a));
                else if (/-/.test(e))
                    if (o = Math.abs(n - r) + 1, n <= r)
                        for (let e = n; e <= r; ++e) l.push(t(e, e, 1, o, o, 1, a++));
                    else
                        for (let e = n; e >= r; --e) l.push(t(e, e, 1, o, o, 1, a++));
                else
                    for (let e = 1; e <= n; ++e) l.push(t(e, e, 1, n, n, 1, a++));
                return l
            }(s, ((...e) => r.map((t => j(t(...e, o)))).join(","))).join(e)
        }))
    }

    function Ot(e, t, n) {
        return e[t] || (e[t] = new at), e[t].push(n), n
    }

    function Lt(e) {
        return -1 * e
    }

    function It(e) {
        return t => {
            if ($(t) || $(e)) return e;
            if (/^[+*-\/%][.\d\s]/.test(t)) {
                let n = t[0],
                    r = Number(t.substr(1).trim()) || 0;
                switch (n) {
                    case "+":
                        return e + r;
                    case "-":
                        return e - r;
                    case "*":
                        return e * r;
                    case "/":
                        return e / r;
                    case "%":
                        return e % r
                }
            } else if (/[+*-\/%]$/.test(t)) {
                let n = t.substr(-1),
                    r = Number(t.substr(0, t.length - 1).trim()) || 0;
                switch (n) {
                    case "+":
                        return r + e;
                    case "-":
                        return r - e;
                    case "*":
                        return r * e;
                    case "/":
                        return r / e;
                    case "%":
                        return r % e
                }
            }
            return e + (Number(t) || 0)
        }
    }
    const Wt = x({
            i: ({
                count: e
            }) => It(e),
            y: ({
                y: e
            }) => It(e),
            x: ({
                x: e
            }) => It(e),
            z: ({
                z: e
            }) => It(e),
            I: ({
                grid: e
            }) => It(e.count),
            Y: ({
                grid: e
            }) => It(e.y),
            X: ({
                grid: e
            }) => It(e.x),
            Z: ({
                grid: e
            }) => It(e.z),
            id: ({
                x: e,
                y: t,
                z: n
            }) => r => S(e, t, n),
            dx: ({
                x: e,
                grid: t
            }) => n => (n = Number(n) || 0, e - .5 - n - t.x / 2),
            dy: ({
                y: e,
                grid: t
            }) => n => (n = Number(n) || 0, e - .5 - n - t.y / 2),
            n({
                extra: e
            }) {
                let t = Q(e);
                return t ? It(t[0]) : "@n"
            },
            nx({
                extra: e
            }) {
                let t = Q(e);
                return t ? It(t[1]) : "@nx"
            },
            ny({
                extra: e
            }) {
                let t = Q(e);
                return t ? It(t[2]) : "@ny"
            },
            N({
                extra: e
            }) {
                let t = Q(e);
                return t ? It(t[3]) : "@N"
            },
            m: Mt(","),
            M: Mt(" "),
            \u00b5: Mt(""),
            p: ({
                context: e,
                pick: t
            }) => ot(((...n) => {
                n.length || (n = e.last_pick_args || []);
                let r = t(n);
                return e.last_pick_args = n, Ot(e, "last_pick", r)
            })),
            P({
                context: e,
                pick: t,
                position: n
            }) {
                let r = "P-counter" + n;
                return ot(((...n) => {
                    let i = !0;
                    n.length || (n = e.last_pick_args || [], i = !1);
                    let s = e.last_pick,
                        o = s ? s.last(1) : "";
                    if (i && (e[r] || (e[r] = {}), o = e[r].last_pick), n.length > 1) {
                        let e = n.findIndex((e => e === o)); - 1 !== e && n.splice(e, 1)
                    }
                    let l = t(n);
                    return e.last_pick_args = n, i && (e[r].last_pick = l), Ot(e, "last_pick", l)
                }))
            },
            pl({
                context: e,
                extra: t,
                position: n
            }) {
                let r = Q(t),
                    i = "pl-counter" + n + (r ? Q(r) : "");
                return ot(((...t) => {
                    e[i] || (e[i] = 0), e[i] += 1;
                    let n = t.length,
                        s = r && r[6];
                    _(s) && (s = e[i]);
                    let o = t[(s - 1) % n];
                    return Ot(e, "last_pick", o)
                }))
            },
            pr({
                context: e,
                extra: t,
                position: n
            }) {
                let r = Q(t),
                    i = "pr-counter" + n + (r ? Q(r) : "");
                return ot(((...t) => {
                    e[i] || (e[i] = 0), e[i] += 1;
                    let n = t.length,
                        s = r && r[6];
                    _(s) && (s = e[i]);
                    let o = t[n - (s - 1) % n - 1];
                    return Ot(e, "last_pick", o)
                }))
            },
            pd({
                context: e,
                extra: t,
                position: n,
                shuffle: r
            }) {
                let i = Q(t),
                    s = i ? Q(i) : "",
                    o = "pd-counter" + n + s,
                    l = "pd-values" + n + s;
                return ot(((...t) => {
                    e[o] || (e[o] = 0), e[o] += 1, e[l] || (e[l] = r(t || []));
                    let n = t.length,
                        s = i && i[6];
                    _(s) && (s = e[o]);
                    let a = (s - 1) % n,
                        u = e[l][a];
                    return Ot(e, "last_pick", u)
                }))
            },
            lp: ({
                context: e
            }) => (t = 1) => {
                let n = e.last_pick;
                return n ? n.last(t) : ""
            },
            r: ({
                context: e,
                rand: t
            }) => (...n) => {
                let r = (n.every(b) ? Ve : Ye)(t)(...n);
                return Ot(e, "last_rand", r)
            },
            rn({
                x: e,
                y: t,
                context: n,
                position: r,
                grid: i,
                extra: s,
                shuffle: o
            }) {
                let l = "noise-2d" + r,
                    [a, u, c, h, p, f] = Q(s) || [],
                    m = a && h;
                return (...r) => {
                    let {
                        from: s = 0,
                        to: a = s,
                        frequency: h = 1,
                        amplitude: d = 1
                    } = ct(r, ["from", "to", "frequency", "amplitude"]);
                    1 == r.length && ([s, a] = [0, s]), n[l] || (n[l] = new ut(o)), h = v(h, 0, 1 / 0), d = v(d, 0, 1 / 0);
                    let g = [s, a].every(b) ? Ve : Ye,
                        y = m ? n[l].noise((u - 1) / p * h, (c - 1) / f * h, 0) : n[l].noise((e - 1) / i.x * h, (t - 1) / i.y * h, 0),
                        x = g(((e, t) => function(e, t, n, r = 1) {
                            let i = Math.sqrt(.5) * r,
                                [s, o] = [-i, i];
                            return P((e - s) / (o - s), t * r, n * r)
                        }(y * d, e, t, d))),
                        _ = x(s, a);
                    return Ot(n, "last_rand", _)
                }
            },
            lr: ({
                context: e
            }) => (t = 1) => {
                let n = e.last_rand;
                return n ? n.last(t) : ""
            },
            noise({
                context: e,
                grid: t,
                position: n,
                shuffle: r,
                ...i
            }) {
                let s = {
                    i: i.count,
                    I: t.count,
                    x: i.x,
                    X: t.x,
                    y: i.y,
                    Y: t.y,
                    z: i.z,
                    Z: t.z
                };
                return (t, i, o = 0) => {
                    let l = "raw-noise-2d" + n;
                    return e[l] || (e[l] = new ut(r)), e[l].noise(tt(t, s), tt(i, s), tt(o, s))
                }
            },
            stripe: () => (...e) => {
                let t, n = e.map(j),
                    r = n.length,
                    i = 0,
                    s = [];
                if (!r) return "";
                n.forEach((e => {
                    let [t, n] = M(e);
                    void 0 !== n ? s.push(n) : i += 1
                }));
                let o = s.length ? `(100% - ${s.join(" - ")}) / ${i}` : `100% / ${r}`;
                return n.map(((e, n) => {
                    if (s.length) {
                        let [n, r] = M(e);
                        return t = (t ? t + " + " : "") + (void 0 !== r ? r : o), `${n} 0 calc(${t})`
                    }
                    return `${e} 0 ${100/r*(n+1)}%`
                })).join(",")
            },
            calc: () => e => tt(j(e)),
            hex: () => e => parseInt(j(e)).toString(16),
            svg: k(((e, ...t) => {
                let n = t.map((e => j(e()))).join(",");
                if (!n.startsWith("<")) {
                    n = qe(V(n))
                }
                return We(Ue(n))
            })),
            Svg: k(((e, ...t) => {
                let n = t.map((e => j(e()))).join(",");
                if (!n.startsWith("<")) {
                    n = qe(V(n))
                }
                return Ue(n)
            })),
            filter: k(((e, ...t) => {
                let n = t.map((e => j(e()))),
                    r = n.join(","),
                    i = C("filter-");
                if (n.every((e => /^[\d.]/.test(e) || /^(\w+)/.test(e) && !/[{}<>]/.test(e)))) {
                    let {
                        frequency: t,
                        scale: i = 1,
                        octave: s,
                        seed: o = e.seed,
                        blur: l,
                        erode: a,
                        dilate: u
                    } = ct(n, ["frequency", "scale", "octave", "seed", "blur", "erode", "dilate"]);
                    if (r = "\n x:-20%;y:-20%;width:140%;height:140%;", _(u) || (r += `\n feMorphology{operator:dilate;radius:${u};}`), _(a) || (r += `\n feMorphology{operator:erode;radius:${a};}`), _(l) || (r += `\n feGaussianBlur{stdDeviation:${l};}`), !_(t)) {
                        let [e, n = e] = M(t);
                        s = s ? `numOctaves:${s};` : "", r += `\n feTurbulence{type:fractalNoise;baseFrequency:${e} ${n};seed:${o};${s}} feDisplacementMap{in:SourceGraphic;scale:${i};}`
                    }
                }
                if (!r.startsWith("<")) {
                    r = qe(V(r, {
                        type: "block",
                        name: "filter"
                    }))
                }
                return We(Ue(r).replace(/<filter([\s>])/, `<filter id="${i}"$1`), i)
            })),
            "svg-pattern": k(((e, ...t) => We(qe(V(`\n viewBox:0 0 1 1;preserveAspectRatio:xMidYMid slice;rect{width, height:100%;fill:defs pattern{${t.map((e=>j(e()))).join(",")}}}`))))),
            var: () => e => `var(${j(e)})`,
            ut: () => e => `var(--${Et.name})`,
            uw: () => e => `var(--${zt.name})`,
            uh: () => e => `var(--${Pt.name})`,
            ux: () => e => `var(--${Rt.name})`,
            uy: () => e => `var(--${Nt.name})`,
            plot({
                count: e,
                context: t,
                extra: n,
                position: r,
                grid: i
            }) {
                let s = "offset-points" + r,
                    o = Q(n);
                return n => {
                    let [r = e, l, a, u = i.count] = o || [];
                    if (!t[s]) {
                        let e = ht(n);
                        delete e.fill, delete e["fill-rule"], delete e.frame, e.points = u, t[s] = At(e, {
                            min: 1,
                            max: 65536
                        })
                    }
                    return t[s][r - 1]
                }
            },
            Plot({
                count: e,
                context: t,
                extra: n,
                position: r,
                grid: i
            }) {
                let s = "Offset-points" + r,
                    o = Q(n);
                return n => {
                    let [r = e, l, a, u = i.count] = o || [];
                    if (!t[s]) {
                        let e = ht(n);
                        delete e.fill, delete e["fill-rule"], delete e.frame, e.points = u, e.unit = e.unit || "none", t[s] = At(e, {
                            min: 1,
                            max: 65536
                        })
                    }
                    return t[s][r - 1]
                }
            },
            shape: () => rt("shape-function", ((e = "", ...t) => {
                let n = [];
                if ((e = String(e).trim()).length)
                    if ("function" == typeof $t[e]) n = $t[e](t);
                    else {
                        let r = e,
                            i = t.join(",");
                        i.length && (r = e + "," + i), n = At(ht(r), {
                            min: 3,
                            max: 3600
                        })
                    } return `polygon(${n.join(",")})`
            })),
            doodle: () => e => e,
            shaders: () => e => e,
            canvas: () => e => e,
            pattern: () => e => e,
            invert: () => e => {
                let t = Tt(e);
                return t.valid ? t.commands.map((({
                    name: e,
                    value: t
                }) => {
                    switch (e) {
                        case "v":
                            return "h" + t.join(" ");
                        case "V":
                            return "H" + t.join(" ");
                        case "h":
                            return "v" + t.join(" ");
                        case "H":
                            return "V" + t.join(" ");
                        default:
                            return e + t.join(" ")
                    }
                })).join(" ") : e
            },
            flipH: () => e => {
                let t = Tt(e);
                return t.valid ? t.commands.map((({
                    name: e,
                    value: t
                }) => {
                    switch (e) {
                        case "h":
                        case "H":
                            return e + t.map(Lt).join(" ");
                        default:
                            return e + t.join(" ")
                    }
                })).join(" ") : e
            },
            flipV: () => e => {
                let t = Tt(e);
                return t.valid ? t.commands.map((({
                    name: e,
                    value: t
                }) => {
                    switch (e) {
                        case "v":
                        case "V":
                            return e + t.map(Lt).join(" ");
                        default:
                            return e + t.join(" ")
                    }
                })).join(" ") : e
            },
            flip(...e) {
                let t = Wt.flipH(...e),
                    n = Wt.flipV(...e);
                return e => n(t(e))
            },
            reverse: () => (...e) => {
                let t = e.map(j),
                    n = Tt(t.join(","));
                if (n.valid) {
                    let e = [];
                    for (let t = n.commands.length - 1; t >= 0; --t) {
                        let {
                            name: r,
                            value: i
                        } = n.commands[t];
                        e.push(r + i.join(" "))
                    }
                    return e.join(" ")
                }
                return t.reverse()
            },
            cycle: () => (...e) => {
                let t, n = [];
                1 == e.length ? (t = " ", n = M(e[0], {
                    symbol: t
                })) : (t = ",", n = M(e.map(j).join(t), {
                    symbol: t
                }));
                let r = n.length - 1,
                    i = [n.join(t)];
                for (let e = 0; e < r; ++e) {
                    let e = n.pop();
                    n.unshift(e), i.push(n.join(t))
                }
                return i
            },
            mirror: () => (...e) => {
                for (let t = e.length - 1; t >= 0; --t) e.push(e[t]);
                return e
            },
            Mirror: () => (...e) => {
                for (let t = e.length - 2; t >= 0; --t) e.push(e[t]);
                return e
            },
            unicode: () => (...e) => e.map((e => String.fromCharCode(e)))
        }, {
            index: "i",
            col: "x",
            row: "y",
            depth: "z",
            rand: "r",
            pick: "p",
            pn: "pl",
            pnr: "pr",
            stripes: "stripe",
            strip: "stripe",
            patern: "pattern",
            flipv: "flipV",
            fliph: "flipH",
            t: "ut",
            "svg-filter": "filter",
            "last-rand": "lr",
            "last-pick": "lp",
            multiple: "m",
            multi: "m",
            rep: "\xb5",
            repeat: "\xb5",
            ms: "M",
            s: "I",
            size: "I",
            sx: "X",
            "size-x": "X",
            "size-col": "X",
            "max-col": "X",
            sy: "Y",
            "size-y": "Y",
            "size-row": "Y",
            "max-row": "Y",
            sz: "Z",
            "size-z": "Z",
            "size-depth": "Z",
            "pick-by-turn": "pl",
            "pick-n": "pl",
            "pick-d": "pd",
            offset: "plot",
            Offset: "Plot",
            point: "plot",
            Point: "Plot",
            paint: "canvas"
        }),
        Ut = {
            "4a0": [1682, 2378],
            "2a0": [1189, 1682],
            a0: [841, 1189],
            a1: [594, 841],
            a2: [420, 594],
            a3: [297, 420],
            a4: [210, 297],
            a5: [148, 210],
            a6: [105, 148],
            a7: [74, 105],
            a8: [52, 74],
            a9: [37, 52],
            a10: [26, 37],
            b0: [1e3, 1414],
            b1: [707, 1e3],
            b2: [500, 707],
            b3: [353, 500],
            b4: [250, 353],
            b5: [176, 250],
            b6: [125, 176],
            b7: [88, 125],
            b8: [62, 88],
            b9: [44, 62],
            b10: [31, 44],
            b11: [22, 32],
            b12: [16, 22],
            c0: [917, 1297],
            c1: [648, 917],
            c2: [458, 648],
            c3: [324, 458],
            c4: [229, 324],
            c5: [162, 229],
            c6: [114, 162],
            c7: [81, 114],
            c8: [57, 81],
            c9: [40, 57],
            c10: [28, 40],
            c11: [22, 32],
            c12: [16, 22],
            d0: [764, 1064],
            d1: [532, 760],
            d2: [380, 528],
            d3: [264, 376],
            d4: [188, 260],
            d5: [130, 184],
            d6: [92, 126],
            letter: [216, 279],
            postcard: [100, 148],
            poster: [390, 540]
        },
        Dt = {
            portrait: "p",
            pt: "p",
            p: "p",
            landscape: "l",
            ls: "l",
            l: "l"
        };
    let Bt = [];

    function Ft(e) {
        if (!Bt.length) {
            let e = new Set;
            if ("undefined" != typeof document)
                for (let t in document.head.style) t.startsWith("-") || e.add(t.replace(/[A-Z]/g, "-$&").toLowerCase());
            e.has("grid-gap") || e.add("grid-gap"), Bt = Array.from(e)
        }
        return e instanceof RegExp ? Bt.filter((t => e.test(t))) : Bt
    }

    function Xt(e) {
        let t = new RegExp(`\\-?${e}\\-?`);
        return Ft(t).map((e => e.replace(t, ""))).reduce(((e, t) => (e[t] = t, e)), {})
    }
    const qt = Xt("webkit"),
        Ht = Xt("moz");

    function Yt(e, t) {
        return qt[e] ? `-webkit-${t} ${t}` : Ht[e] ? `-moz-${t} ${t}` : t
    }
    const Vt = {
            center: "50%",
            left: "0%",
            right: "100%",
            top: "50%",
            bottom: "50%"
        },
        Zt = {
            center: "50%",
            top: "0%",
            bottom: "100%",
            left: "50%",
            right: "50%"
        };
    var Gt = x({
        size(e, {
            is_special_selector: t,
            grid: n
        }) {
            let [r, i = r, s] = M(e);
            Ut[r] && ([r, i] = function(e, t) {
                e = String(e).toLowerCase();
                let [n, r] = Ut[e] || [];
                return "p" == Dt[t] && ([r, n] = [n, r]), [r, n].map((e => e + "mm"))
            }(r, i));
            let o = `\n width:${r};height:${i};`;
            return "auto" !== r && "auto" !== i || (s && (/^\(.+\)$/.test(s) ? s = s.substring(1, s.length - 1) : /^calc/.test(s) || (s = `calc(${s})`), t || (o += `aspect-ratio:${s};`)), t && (o += `aspect-ratio:${s||n.ratio};`)), t || (o += `\n --internal-cell-width:${r};--internal-cell-height:${i};`), o
        },
        place(e, {
            extra: t
        }) {
            let [n, r = "50%"] = M(e);
            n = Vt[n] || n, r = Zt[r] || r;
            const i = "var(--internal-cell-width, 25%)",
                s = "var(--internal-cell-height, 25%)";
            return `\n position:absolute;left:${n};top:${r};width:${i};height:${s};margin-left:calc(${i} / -2);margin-top:calc(${s} / -2);grid-area:unset;--plot-angle:${t||0};rotate:${t||0}deg;`
        },
        grid(e, t) {
            let n = {
                clip: !0
            };
            /no\-*clip/i.test(e) && (n.clip = !1, e = e.replace(/no\-*clip/i, ""));
            let r = M(e, {
                symbol: ["/", "+", "*", "|", "-"],
                noSpace: !0,
                verbose: !0
            });
            for (let {
                    group: e,
                    value: i
                }
                of r) "+" === e && (n.scale = i), "*" === e && (n.rotate = i), "/" === e && (void 0 === n.size ? n.size = this.size(i, t) : n.fill = i), "|" !== e && "-" != e && "" != e || n.grid || (n.grid = Ce(i, t.max_grid), "|" === e && (n.flexColumn = !0), "-" === e && (n.flexRow = !0));
            return n
        },
        gap: e => e,
        seed: e => e,
        shape: rt("shape-property", (e => {
            let [t, ...n] = M(e);
            if ("function" != typeof $t[t]) return "";
            let r = "clip-path";
            return Yt(r, `${r}:polygon(${$t[t](...n).join(",")});`) + "overflow:hidden;"
        })),
        use(e) {
            if (e.length > 2) return e
        },
        content: e => e
    }, {
        "place-cell": "place",
        offset: "place",
        position: "place"
    });
    const Jt = {
        even: e => !(e % 2),
        odd: e => !!(e % 2)
    };

    function Kt(e, t, n) {
        for (let r = 0; r <= n; ++r)
            if (tt(e, {
                    n: r
                }) == t) return !0
    }
    var Qt = {
            at: ({
                x: e,
                y: t
            }) => (n, r) => e == n && t == r,
            nth: ({
                count: e,
                grid: t
            }) => (...n) => n.some((n => Jt[n] ? Jt[n](e) : Kt(n, e, t.count))),
            row: ({
                y: e,
                grid: t
            }) => (...n) => n.some((n => Jt[n] ? Jt[n](e) : Kt(n, e, t.y))),
            col: ({
                x: e,
                grid: t
            }) => (...n) => n.some((n => Jt[n] ? Jt[n](e) : Kt(n, e, t.x))),
            even: ({
                count: e,
                grid: t,
                x: n,
                y: r
            }) => e => Jt.odd(n + r),
            odd: ({
                count: e,
                grid: t,
                x: n,
                y: r
            }) => e => Jt.even(n + r),
            random: ({
                random: e,
                count: t,
                x: n,
                y: r,
                grid: i
            }) => (s = .5) => /\D/.test(s) ? e() < tt("(" + s + ")", {
                x: n,
                X: i.x,
                y: r,
                Y: i.y,
                i: t,
                I: i.count,
                random: e
            }) : e() < s,
            match: ({
                count: e,
                grid: t,
                x: n,
                y: r,
                random: i
            }) => s => !!tt("(" + s + ")", {
                x: n,
                X: t.x,
                y: r,
                Y: t.y,
                i: e,
                I: t.count,
                random: i
            })
        },
        en = globalThis,
        tn = Math,
        nn = [],
        rn = 256,
        sn = tn.pow(rn, 6),
        on = tn.pow(2, 52),
        ln = 2 * on,
        an = 255;

    function un(e, t, n) {
        var r = [],
            i = fn(pn((t = 1 == t ? {
                entropy: !0
            } : t || {}).entropy ? [e, mn(nn)] : null == e ? function() {
                try {
                    var e;
                    return e = new Uint8Array(rn), (en.crypto || en.msCrypto).getRandomValues(e), mn(e)
                } catch (e) {
                    var t = en.navigator,
                        n = t && t.plugins;
                    return [+new Date, en, n, en.screen, mn(nn)]
                }
            }() : e, 3), r),
            s = new cn(r),
            o = function() {
                for (var e = s.g(6), t = sn, n = 0; e < on;) e = (e + n) * rn, t *= rn, n = s.g(1);
                for (; e >= ln;) e /= 2, t /= 2, n >>>= 1;
                return (e + n) / t
            };
        return o.int32 = function() {
            return 0 | s.g(4)
        }, o.quick = function() {
            return s.g(4) / 4294967296
        }, o.double = o, fn(mn(s.S), nn), (t.pass || n || function(e, t, n, r) {
            return r && (r.S && hn(r, s), e.state = function() {
                return hn(s, {})
            }), n ? (tn.random = e, t) : e
        })(o, i, "global" in t ? t.global : this == tn, t.state)
    }

    function cn(e) {
        var t, n = e.length,
            r = this,
            i = 0,
            s = r.i = r.j = 0,
            o = r.S = [];
        for (n || (e = [n++]); i < rn;) o[i] = i++;
        for (i = 0; i < rn; i++) o[i] = o[s = an & s + e[i % n] + (t = o[i])], o[s] = t;
        (r.g = function(e) {
            for (var t, n = 0, i = r.i, s = r.j, o = r.S; e--;) t = o[i = an & i + 1], n = n * rn + o[an & (o[i] = o[s = an & s + t]) + (o[s] = t)];
            return r.i = i, r.j = s, n
        })(rn)
    }

    function hn(e, t) {
        return t.i = e.i, t.j = e.j, t.S = e.S.slice(), t
    }

    function pn(e, t) {
        var n, r = [],
            i = typeof e;
        if (t && "object" == i)
            for (n in e) try {
                r.push(pn(e[n], t - 1))
            } catch (e) {}
        return r.length ? r : "string" == i ? e : e + "\0"
    }

    function fn(e, t) {
        for (var n, r = e + "", i = 0; i < r.length;) t[an & i] = an & (n ^= 19 * t[an & i]) + r.charCodeAt(i++);
        return mn(t)
    }

    function mn(e) {
        return String.fromCharCode.apply(0, e)
    }

    function dn(e) {
        return /^\:(host|doodle)/.test(e)
    }

    function gn(e) {
        return /^\:(container|parent)/.test(e)
    }

    function vn(e) {
        return dn(e) || gn(e)
    }
    fn(tn.random(), nn);
    const yn = {};
    for (let e of Object.getOwnPropertyNames(Math)) yn[e] = () => (...t) => "number" == typeof Math[e] ? Math[e] : (t = t.map((e => tt(j(e)))), Math[e](...t));
    class xn {
        constructor(e) {
            this.tokens = e, this.rules = {}, this.props = {}, this.keyframes = {}, this.grid = null, this.seed = null, this.is_grid_defined = !1, this.coords = [], this.doodles = {}, this.canvas = {}, this.pattern = {}, this.shaders = {}, this.reset(), this.custom_properties = {}, this.uniforms = {}, this.content = {}
        }
        reset() {
            this.styles = {
                host: "",
                container: "",
                cells: "",
                keyframes: ""
            }, this.coords = [], this.doodles = {}, this.canvas = {}, this.pattern = {}, this.shaders = {}, this.content = {};
            for (let e in this.rules) e.startsWith("#c") && delete this.rules[e]
        }
        add_rule(e, t) {
            let n = this.rules[e];
            n || (n = this.rules[e] = []), n.push.apply(n, J(t))
        }
        pick_func(e) {
            return Wt[e] || yn[e]
        }
        apply_func(e, t, n) {
            let r = e(...J(t)),
                i = [];
            return n.forEach((e => {
                let t = typeof e.value,
                    n = "number" === t || "string" === t;
                if (!e.cluster && n) i.push(...M(e.value, {
                    noSpace: !0
                }));
                else if ("function" == typeof e) i.push(e);
                else if (!_(e.value)) {
                    let t = j(e.value);
                    i.push(t)
                }
            })), i = i.filter((e => !_(e) && String(e).trim().length)), r(...J(i))
        }
        compose_aname(...e) {
            return e.join("-")
        }
        compose_selector({
            x: e,
            y: t,
            z: n
        }, r = "") {
            return `#${S(e,t,n)}${r}`
        }
        is_composable(e) {
            return ["doodle", "shaders", "canvas", "pattern"].includes(e)
        }
        read_var(e, t) {
            let n = t.count,
                r = Object.assign({}, this.custom_properties.host, this.custom_properties.container, this.custom_properties[n]);
            if (void 0 !== r[e]) {
                let t = String(r[e]).trim();
                if ("(" == t[0]) {
                    ")" === t[t.length - 1] && (t = t.substring(1, t.length - 1))
                }
                return t.replace(/;+$/g, "")
            }
            return e
        }
        compose_argument(e, t, n = [], r) {
            t.extra || (t.extra = []), t.extra.push(n);
            let i = e.map((e => {
                if ("text" === e.type) return /^\-\-\w/.test(e.value) ? r && "@var" === r.name ? e.value : this.read_var(e.value, t) : e.value;
                if ("func" === e.type) {
                    let r = e.name.substr(1),
                        i = this.pick_func(r);
                    if ("function" == typeof i) {
                        if (this.check_uniforms(r), this.is_composable(r)) {
                            let n = j((e.arguments[0] || [])[0]);
                            if (!_(n)) switch (r) {
                                case "doodle":
                                    return this.compose_doodle(this.inject_variables(n, t.count));
                                case "shaders":
                                    return this.compose_shaders(n, t);
                                case "canvas":
                                    return this.compose_canvas(n, e.arguments.slice(1));
                                case "pattern":
                                    return this.compose_pattern(n, t)
                            }
                        }
                        t.position = e.position;
                        let s = e.arguments.map((r => i.lazy ? (...n) => this.compose_argument(r, t, n, e) : this.compose_argument(r, t, n, e)));
                        return this.apply_func(i, t, s)
                    }
                    return e.name
                }
            }));
            return t.extra.pop(), {
                cluster: e.cluster,
                value: i.length >= 2 ? {
                    value: i.join("")
                } : i[0]
            }
        }
        compose_doodle(e) {
            let t = C("doodle");
            return this.doodles[t] = e, "${" + t + "}"
        }
        compose_shaders(e, {
            x: t,
            y: n,
            z: r
        }) {
            let i = C("shader");
            return this.shaders[i] = {
                id: "--" + i,
                shader: e,
                cell: S(t, n, r)
            }, "${" + i + "}"
        }
        compose_pattern(e, {
            x: t,
            y: n,
            z: r
        }) {
            let i = C("pattern");
            return this.pattern[i] = {
                id: "--" + i,
                code: e,
                cell: S(t, n, r)
            }, "${" + i + "}"
        }
        compose_canvas(e, t = []) {
            let n = e,
                r = t.map((e => j(e[0]))).join(",");
            r.length && (n = e + "," + r);
            let i = C("canvas");
            return this.canvas[i] = {
                code: n
            }, "${" + i + "}"
        }
        check_uniforms(e) {
            switch (e) {
                case "ut":
                case "t":
                    this.uniforms.time = !0;
                    break;
                case "ux":
                    this.uniforms.mousex = !0;
                    break;
                case "uy":
                    this.uniforms.mousey = !0;
                    break;
                case "uw":
                    this.uniforms.width = !0;
                    break;
                case "uh":
                    this.uniforms.height = !0
            }
        }
        inject_variables(e, t) {
            let n = Object.assign({}, this.custom_properties.host, this.custom_properties.container, this.custom_properties[t]),
                r = [];
            for (let [e, t] of Object.entries(n)) r.push(`${e}:${t};`);
            return r = r.join(""), r.length ? `:doodle{${r}}` + e : e
        }
        compose_value(e, t) {
            if (!Array.isArray(e)) return {
                value: "",
                extra: ""
            };
            let n = "";
            return {
                value: e.reduce(((e, r) => {
                    switch (r.type) {
                        case "text":
                            e += r.value;
                            break;
                        case "func": {
                            let i = r.name.substr(1),
                                s = this.pick_func(i);
                            if ("function" == typeof s)
                                if (this.check_uniforms(i), this.is_composable(i)) {
                                    let n = j((r.arguments[0] || [])[0]);
                                    if (!_(n)) switch (i) {
                                        case "doodle":
                                            e += this.compose_doodle(this.inject_variables(n, t.count));
                                            break;
                                        case "shaders":
                                            e += this.compose_shaders(n, t);
                                            break;
                                        case "pattern":
                                            e += this.compose_pattern(n, t);
                                            break;
                                        case "canvas":
                                            e += this.compose_canvas(n, r.arguments.slice(1))
                                    }
                                } else {
                                    t.position = r.position;
                                    let i = r.arguments.map((e => s.lazy ? (...n) => this.compose_argument(e, t, n, r) : this.compose_argument(e, t, [], r))),
                                        o = this.apply_func(s, t, i);
                                    _(o) || (e += o, o.extra && (n = o.extra))
                                }
                            else e += r.name
                        }
                    }
                    return e
                }), ""),
                extra: n
            }
        }
        add_grid_style({
            fill: e,
            clip: t,
            rotate: n,
            scale: r,
            flexRow: i,
            flexColumn: s
        }) {
            e && this.add_rule(":host", `background-color:${e};`), t || this.add_rule(":host", "contain:none;"), n && this.add_rule(":container", `rotate:${n};`), r && this.add_rule(":container", `scale:${r};`), i && (this.add_rule(":container", "display:flex"), this.add_rule("cell", "flex:1")), s && (this.add_rule(":container", "display:flex;flex-direction:column;"), this.add_rule("cell", "flex:1"))
        }
        compose_rule(e, t, n) {
            let r, i = Object.assign({}, t),
                s = e.property;
            if ("@seed" === s) return "";
            let o = e.value.reduce(((e, t) => {
                    let n = this.compose_value(t, i);
                    return n && (n.value && e.push(n.value), n.extra && (r = n.extra)), e
                }), []),
                l = o.join(", ");
            if (/^animation(\-name)?$/.test(s)) {
                if (this.props.has_animation = !0, dn(n)) {
                    let e = Et[s];
                    e && l && (l = e + "," + l)
                }
                if (i.count > 1) {
                    let {
                        count: e
                    } = i;
                    switch (s) {
                        case "animation-name":
                            l = o.map((t => this.compose_aname(t, e))).join(", ");
                            break;
                        case "animation":
                            l = o.map((t => {
                                let n = (t || "").split(/\s+/);
                                return n[0] = this.compose_aname(n[0], e), n.join(" ")
                            })).join(", ")
                    }
                }
            }
            "content" === s && (/["']|^none$|^(var|counter|counters|attr|url)\(/.test(l) || (l = `'${l}'`)), "transition" === s && (this.props.has_transition = !0);
            let a = `${s}:${l};`;
            if (a = Yt(s, a), "clip-path" === s && (a += ";overflow:hidden;"), "width" !== s && "height" !== s || vn(n) || (a += `--internal-cell-${s}:${l};`), /^(background|background\-image)$/.test(s) && /\$\{(canvas|shader|pattern)/.test(l) && (a += "background-size:100% 100%;"), /^\-\-/.test(s)) {
                let e = t.count;
                gn(n) && (e = "container"), dn(n) && (e = "host"), this.custom_properties[e] || (this.custom_properties[e] = {}), this.custom_properties[e][s] = l
            }
            if (/^@/.test(s) && Gt[s.substr(1)]) {
                let t = s.substr(1),
                    o = Gt[t](l, {
                        is_special_selector: vn(n),
                        grid: i.grid,
                        max_grid: i.max_grid,
                        extra: r
                    });
                switch (t) {
                    case "grid":
                        dn(n) ? (a = o.size || "", this.add_grid_style(o)) : (a = "", this.is_grid_defined || (o = Gt[t](l, {
                            is_special_selector: !0,
                            grid: i.grid,
                            max_grid: i.max_grid
                        }), this.add_rule(":host", o.size || ""), this.add_grid_style(o))), this.grid = i.grid, this.is_grid_defined = !0;
                        break;
                    case "gap":
                        a = "", this.add_rule(":container", `gap:${o};`);
                    case "content":
                        a = "", void 0 === o || /\:before|\:after/.test(n) || gn(n) || (this.content[this.compose_selector(i)] = o);
                    case "seed":
                        a = "";
                        break;
                    case "place-cell":
                    case "place":
                    case "position":
                    case "offset":
                        dn(n) || (a = o);
                        break;
                    case "use":
                        e.value.length && this.compose(i, e.value), a = "";
                        break;
                    default:
                        a = o
                }
            }
            return a
        }
        get_raw_value(e) {
            let t = e.raw();
            _(t) && (t = "");
            let [n, ...r] = t.split(e.property);
            return r = r.join(e.property).replace(/^\s*:\s*/, "").replace(/[;}<]$/, "").trim().replace(/[;}<]$/, ""), r
        }
        pre_compose_rule(e, t) {
            let n = Object.assign({}, t),
                r = e.property;
            switch (r) {
                case "@grid": {
                    let i = e.value.reduce(((e, t) => {
                            let r = this.compose_value(t, n);
                            return r && r.value && e.push(r.value), e
                        }), []).join(", "),
                        s = r.substr(1),
                        o = Gt[s](i, {
                            max_grid: t.max_grid
                        });
                    this.grid = o.grid;
                    break
                }
                case "@use":
                    e.value.length && this.pre_compose(n, e.value)
            }
        }
        pre_compose(e, t) {
            _(this.seed) && ((t || this.tokens).forEach((e => {
                if ("rule" === e.type && "@seed" === e.property && (this.seed = this.get_raw_value(e)), "pseudo" === e.type && dn(e.selector))
                    for (let t of J(e.styles)) "rule" === t.type && "@seed" === t.property && (this.seed = this.get_raw_value(t))
            })), _(this.seed) ? this.seed = e.seed_value : e.update_random(this.seed)), (t || this.tokens).forEach((t => {
                switch (t.type) {
                    case "rule":
                        this.pre_compose_rule(t, e);
                        break;
                    case "pseudo":
                        dn(t.selector) && (t.styles || []).forEach((t => {
                            this.pre_compose_rule(t, e)
                        }))
                }
            }))
        }
        compose(e, t, n) {
            this.coords.push(e), (t || this.tokens).forEach(((t, r) => {
                if (t.skip) return !1;
                if (n && this.grid) return !1;
                switch (t.type) {
                    case "rule":
                        this.add_rule(this.compose_selector(e), this.compose_rule(t, e));
                        break;
                    case "pseudo": {
                        t.selector.startsWith(":doodle") && (t.selector = t.selector.replace(/^\:+doodle/, ":host"));
                        let n = vn(t.selector);
                        n && (t.skip = !0), t.selector.split(",").forEach((r => {
                            let i = t.styles.map((t => this.compose_rule(t, e, r))),
                                s = n ? r : this.compose_selector(e, r);
                            this.add_rule(s, i)
                        }));
                        break
                    }
                    case "cond": {
                        let n = Qt[t.name.substr(1)];
                        if (n) {
                            let r = t.arguments.map((t => this.compose_argument(t, e)));
                            this.apply_func(n, e, r) && this.compose(e, t.styles)
                        }
                        break
                    }
                    case "keyframes":
                        this.keyframes[t.name] || (this.keyframes[t.name] = e => `\n ${K(t.steps.map((t=>`\n ${t.name}{${K(t.styles.map((t=>this.compose_rule(t,e))))}}`)))}`)
                }
            }))
        }
        output() {
            for (let [e, t] of Object.entries(this.rules))
                if (gn(e)) this.styles.container += `\n .container{${K(t)}}`;
                else {
                    let n = dn(e) ? "host" : "cells",
                        r = K(t).trim(),
                        i = "host" === n ? `${e}, .host` : e;
                    this.styles[n] += `${i}{${r}}`
                } return this.uniforms.time && (this.styles.container += `\n:host, .host{animation:${Et.animation};}`, this.styles.keyframes += `\n @keyframes ${Et["animation-name"]}{from{--${Et.name}:0} to{--${Et.name}:${Et["animation-duration"]/10}}}`), this.coords.forEach(((e, t) => {
                for (let [i, s] of Object.entries(this.keyframes)) {
                    let o = this.compose_aname(i, e.count);
                    this.styles.keyframes += `\n ${n=0===t,r=`@keyframes ${i}{${s(e)}}`,n?"function"==typeof r?r():r:""} @keyframes ${o}{${s(e)}}`
                }
                var n, r
            })), {
                props: this.props,
                styles: this.styles,
                grid: this.grid,
                seed: this.seed,
                random: this.random,
                doodles: this.doodles,
                shaders: this.shaders,
                canvas: this.canvas,
                pattern: this.pattern,
                uniforms: this.uniforms,
                content: this.content
            }
        }
    }

    function bn(e, t, n, r, i) {
        let s = new xn(e),
            o = i || un(String(n)),
            l = {};

        function a(e = 0, t) {
            return 1 == arguments.length && ([e, t] = [0, e]), P(o(), e, t)
        }

        function u(...e) {
            let t = e.reduce(((e, t) => e.concat(t)), []);
            return t[~~(o() * t.length)]
        }

        function c(e) {
            let t = [...e],
                n = e.length;
            for (; n;) {
                let e = ~~(o() * n--),
                    r = t[n];
                t[n] = t[e], t[e] = r
            }
            return t
        }
        s.pre_compose({
            x: 1,
            y: 1,
            z: 1,
            count: 1,
            context: {},
            grid: {
                x: 1,
                y: 1,
                z: 1,
                count: 1
            },
            random: o,
            rand: a,
            pick: u,
            shuffle: c,
            max_grid: r,
            update_random: function(e) {
                o = un(String(e))
            },
            seed_value: n
        });
        let {
            grid: h,
            seed: p
        } = s.output();
        if (h && (t = h), p ? (p = String(p), o = un(p)) : p = n, _(p) && (p = Date.now(), o = un(p)), p = String(p), s.seed = p, s.random = o, s.reset(), 1 == t.z)
            for (let e = 1, n = 0; e <= t.y; ++e)
                for (let i = 1; i <= t.x; ++i) s.compose({
                    x: i,
                    y: e,
                    z: 1,
                    count: ++n,
                    grid: t,
                    context: l,
                    rand: a,
                    pick: u,
                    shuffle: c,
                    random: o,
                    seed: p,
                    max_grid: r
                });
        else
            for (let e = 1, n = 0; e <= t.z; ++e) s.compose({
                x: 1,
                y: 1,
                z: e,
                count: ++n,
                grid: t,
                context: l,
                rand: a,
                pick: u,
                shuffle: c,
                random: o,
                seed: p,
                max_grid: r
            });
        return s.output()
    }

    function _n(e, t, n) {
        let r = e.createShader(t);
        return e.shaderSource(r, n), e.compileShader(r), r
    }

    function wn(e, t) {
        return e.includes(t) ? e : t + "\n" + e
    }

    function $n(e, t, n, r) {
        let i = nt.get(e);
        if (i) return Promise.resolve(i);
        let s = document.createElement("canvas"),
            o = window.devicePixelRatio || 1;
        t *= o, n *= o, s.width = t, s.height = n;
        let l = s.getContext("webgl2", {
            preserveDrawingBuffer: !0
        });
        if (!l) return Promise.resolve("");
        let a = wn(e.fragment || "", "uniform vec2 u_resolution;");
        a = wn(a, "uniform float u_time;"), a = wn(a, "uniform float u_timeDelta;"), a = wn(a, "uniform int u_frameIndex;"), a = wn(a, "uniform vec2 u_seed;"), e.textures.forEach((e => {
            let t = `uniform sampler2D ${e.name};`;
            a = wn(a, t)
        }));
        /(^|[^\w\_])void\s+mainImage\(\s*out\s+vec4\s+fragColor,\s*in\s+vec2\s+fragCoord\s*\)/gm.test(a) && (a = `// https://www.shadertoy.com/howto\n\n#define iResolution vec3(u_resolution, 0)\n#define iTime u_time\n#define iTimeDelta u_timeDelta\n#define iFrame u_frameIndex\n\n${e.textures.map(((e,t)=>`#define iChannel${t} ${e.name}`)).join("\n")}\n${a}\nvoid main(){mainImage(FragColor, gl_FragCoord.xy);}`);
        let u = function(e, t, n) {
                let r = _n(e, e.VERTEX_SHADER, t),
                    i = _n(e, e.FRAGMENT_SHADER, n),
                    s = e.createProgram();
                return e.attachShader(s, r), e.attachShader(s, i), e.linkProgram(s), e.getProgramParameter(s, e.LINK_STATUS) || (console.warn("Link failed:" + e.getProgramInfoLog(s)), console.warn("vs info-log:" + e.getShaderInfoLog(r)), console.warn("fs info-log:" + e.getShaderInfoLog(i))), s
            }(l, e.vertex || "#version 300 es\n in vec4 position;void main(){gl_Position = position;}", "#version 300 es\n precision highp float;out vec4 FragColor;" + a),
            c = l.getAttribLocation(u, "position"),
            h = l.createBuffer();
        l.bindBuffer(l.ARRAY_BUFFER, h);
        l.bufferData(l.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1]), l.STATIC_DRAW), l.enableVertexAttribArray(c), l.vertexAttribPointer(c, 2, l.FLOAT, !1, 0, 0), l.viewport(0, 0, l.drawingBufferWidth, l.drawingBufferHeight), l.clearColor(0, 0, 0, 0), l.clear(l.COLOR_BUFFER_BIT), l.useProgram(u);
        const p = l.getUniformLocation(u, "u_resolution");
        l.uniform2fv(p, [t, n]), e.textures.forEach(((e, t) => {
            ! function(e, t, n) {
                const r = e.createTexture();
                e.activeTexture(e["TEXTURE" + n]), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !0), e.bindTexture(e.TEXTURE_2D, r), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR)
            }(l, e.value, t), l.uniform1i(l.getUniformLocation(u, e.name), t)
        }));
        const f = l.getUniformLocation(u, "u_seed");
        f && l.uniform2f(f, R(r) / 1e16, Math.random());
        const m = l.getUniformLocation(u, "u_time"),
            d = l.getUniformLocation(u, "u_frameIndex"),
            g = l.getUniformLocation(u, "u_timeDelta");
        if (m || g || d) {
            let t = 0,
                n = 0;
            return Promise.resolve(nt.set(e, (e => (l.clear(l.COLOR_BUFFER_BIT), m && l.uniform1f(m, e / 1e3), d && l.uniform1i(d, t++), g && (l.uniform1f(g, (n - e) / 1e3), n = e), l.drawArrays(l.TRIANGLES, 0, 6), s.toDataURL()))))
        }
        return l.drawArrays(l.TRIANGLES, 0, 6), Promise.resolve(nt.set(e, s.toDataURL()))
    }

    function kn(e, t) {
        let n = [];
        for (; e.next();) {
            let {
                curr: t,
                next: r
            } = e.get(), i = !r || t.isSymbol(";") || r.isSymbol("}");
            if (n.push(t), i) break
        }
        return n.length && (t.value = jn(n)), t
    }

    function Sn(e, t) {
        let n = [],
            r = [],
            i = t && t.type || "",
            s = [];
        for (; e.next();) {
            let {
                prev: o,
                curr: l,
                next: a
            } = e.get(), u = !a || l.isSymbol("}");
            if ("block" === i && u) {
                a || !n.length || l.isSymbol("}") || (n[n.length - 1].value += ";" + l.value), t.value = n;
                break
            }
            if (l.isSymbol("{") && r.length && !s.length) {
                let t = An(r);
                if (!t.length) continue;
                let i = Sn(e, {
                    type: "block",
                    name: "unkown",
                    value: []
                });
                t.forEach((e => {
                    let t = Object.assign({}, i, {
                        name: e.name,
                        args: e.args
                    });
                    n.push(t)
                })), r = []
            } else if (l.isSymbol(":") && r.length && !s.length) {
                let s = jn(r);
                n.push(kn(e, {
                    type: "statement",
                    name: s,
                    value: ""
                })), "block" == i && (t.value = n), r = []
            } else l.isSymbol(";") ? n.length && r.length && (n[n.length - 1].value += ";" + jn(r), r = []) : (l.isSymbol("(") && s.push(l), l.isSymbol(")") && s.pop(), r.push(l))
        }
        return n.length && "block" == i && (t.value = n), i ? t : n
    }

    function jn(e) {
        return e.filter(((t, n) => !t.isSymbol(";") || n !== e.length - 1)).map((e => e.value)).join("")
    }

    function An(e) {
        let t = r(e),
            n = [],
            i = "",
            s = [],
            o = [],
            l = [];
        for (; t.next();) {
            let {
                curr: e,
                next: r
            } = t.get();
            !i.length && e.isWord() ? i = e.value : e.isSymbol("(") ? (l.length && o.push(e.value), l.push(e)) : e.isSymbol(")") ? (l.pop(), l.length ? o.push(e.value) : o.length && (s.push(o.join("")), o = [])) : e.isSymbol(",") ? l.length ? (s.push(o.join("")), o = []) : (o.length && (s.push(o.join("")), o = []), i && (n.push({
                name: i,
                args: s
            }), i = "", s = [], o = [])) : o.push(e.value)
        }
        return i && n.push({
            name: i,
            args: s
        }), n.filter(((e, t, n) => n.findIndex((t => t.name === e.name && e.args.join("") == t.args.join(""))) === t))
    }

    function Tn(e) {
        return Sn(r(p(e)))
    }

    function En(e, t) {
        if ("fill" === e.name) {
            let {
                r: n,
                g: r,
                b: i,
                a: s
            } = t.get_rgba_color(e.value);
            return {
                type: "statement",
                value: `\ncolor = vec4(${Rn(n/255)}, ${Rn(r/255)}, ${Rn(i/255)}, ${Rn(s)});`
            }
        }
        return "grid" == e.name ? {
            type: "grid",
            value: e.value
        } : {
            type: "statement",
            value: ""
        }
    }

    function Rn(e) {
        return String(e).includes(".") ? e : e + ".0"
    }

    function Nn(e, t) {
        let n = Tn(e),
            r = [],
            i = {
                x: 1,
                y: 1
            };
        return n.forEach((e => {
                if ("statement" === e.type) {
                    let n = En(e, t);
                    "statement" == n.type && r.push(n.value), "grid" === n.type && (i = function(e) {
                        let [t, n = t] = String(e + "").replace(/\s+/g, "").replace(/[,\uff0cxX]+/g, "x").split("x").map((e => parseInt(e)));
                        return (!t || t < 1) && (t = 1), (!n || n < 1) && (n = 1), {
                            x: t,
                            y: n
                        }
                    }(n.value))
                } else "block" === e.type && r.push(function(e, t) {
                    if ("match" === e.name) {
                        let n = e.args[0],
                            r = [];
                        return e.value.forEach((e => {
                            let n = En(e, t);
                            "statement" == n.type && r.push(n.value)
                        })), `\n if (${n}){${r.join("")}}`
                    }
                    return ""
                }(e, t))
            })),
            function(e, t) {
                return `\n vec3 mapping(vec2 uv, vec2 grid){vec2 _grid = 1.0/grid;float x = ceil(uv.x/_grid.x);float y = ceil(grid.y - uv.y/_grid.y);float i = x + (y - 1.0) * y;return vec3(x, y, i);} vec4 getColor(float x, float y, float i, float I, float X, float Y, float t){vec4 color = vec4(0, 0, 0, 0);${e} return color;} void main(){vec2 uv = gl_FragCoord.xy/u_resolution.xy;vec2 grid = vec2(${t.x}, ${t.y});vec3 p = mapping(uv, grid);FragColor = getColor(p.x, p.y, p.z, grid.x * grid.y, grid.x, grid.y, u_time);}`
            }(r.join(""), i)
    }
    const zn = z();

    function Pn(e) {
        let t = nt.get(e);
        if (t) return Promise.resolve(t);
        let n = zn("css-doodle-paint"),
            r = function(e, t) {
                (t = E(t)).includes("paint(") || (t = `\n paint(ctx,{width, height}, props){${t}}`);
                return `\n registerPaint('${e}', class{${t}})\n`
            }(n, e),
            i = new Blob([r], {
                type: "text/javascript"
            });
        try {
            CSS.paintWorklet && CSS.paintWorklet.addModule(URL.createObjectURL(i))
        } catch (e) {}
        return Promise.resolve(nt.set(e, `paint(${n})`))
    }

    function Cn(e) {
        if ("undefined" == typeof getComputedStyle) return "";
        let t = {};
        if (e.computedStyleMap)
            for (let [n, r] of e.computedStyleMap()) n.startsWith("--") && (t[n] = r[0][0]);
        else {
            let n = getComputedStyle(e);
            for (let e of n) e.startsWith("--") && (t[e] = n.getPropertyValue(e))
        }
        return function(e) {
            let t = [];
            for (let [n, r] of Object.entries(e)) t.push(n + ":" + r);
            return t.join(";")
        }(t)
    }
    const Mn = 1e3 / 60;
    if ("undefined" != typeof customElements) {
        class e extends HTMLElement {
            constructor() {
                super(), this.doodle = this.attachShadow({
                    mode: "open"
                }), this.animations = [], this.extra = {
                    get_variable: e => function(e, t) {
                        return "undefined" == typeof getComputedStyle ? "" : getComputedStyle(e).getPropertyValue(t).trim().replace(/^\(|\)$/g, "")
                    }(this, e),
                    get_rgba_color: e => function(e, t) {
                        let n = e.querySelector("#defs");
                        return n ? (n.style.color = t, function(e) {
                            let [t, n, r, i = 1] = e.replace(/rgba?\((.+)\)/, ((e, t) => t)).split(/,\s*/);
                            return {
                                r: t,
                                g: n,
                                b: r,
                                a: i
                            }
                        }(getComputedStyle(n).color)) : {
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 1
                        }
                    }(this.shadowRoot, e)
                }
            }
            connectedCallback(e) {
                this.innerHTML ? this.load(e) : setTimeout((() => this.load(e)))
            }
            disconnectedCallback() {
                this.cleanup()
            }
            cleanup() {
                nt.clear();
                for (let e of this.animations) e.cancel();
                this.animations = []
            }
            update(e) {
                this.cleanup(), e || (e = E(this.innerHTML)), this.innerHTML !== e && (this.innerHTML = e), this.grid_size || (this.grid_size = this.get_grid());
                const {
                    x: t,
                    y: n,
                    z: r
                } = this.grid_size, i = this.get_use();
                let s = "";
                this.compiled && (s = this.compiled.content);
                const o = this.generate(Pe(i + e, this.extra));
                let l = o.grid || this.get_grid(),
                    {
                        x: a,
                        y: u,
                        z: c
                    } = l,
                    h = !this.shadowRoot.innerHTML || t !== a || n !== u || r !== c || JSON.stringify(s) !== JSON.stringify(o.content);
                if (Object.assign(this.grid_size, l), h) return o.grid ? this.build_grid(o, l) : this.build_grid(this.generate(Pe(i + e, this.extra)), l);
                let p = this.replace(o);
                this.set_content(".style-keyframes", p(o.styles.keyframes)), o.props.has_animation && (this.set_content(".style-cells", ""), this.set_content(".style-container", "")), setTimeout((() => {
                    this.set_content(".style-container", p(Ln(this.grid_size) + o.styles.host + o.styles.container)), this.set_content(".style-cells", p(o.styles.cells))
                }))
            }
            get grid() {
                return Object.assign({}, this.grid_size)
            }
            set grid(e) {
                this.attr("grid", e), this.connectedCallback(!0)
            }
            get seed() {
                return this._seed_value
            }
            set seed(e) {
                this.attr("seed", e), this.connectedCallback(!0)
            }
            get use() {
                return this.attr("use")
            }
            set use(e) {
                this.attr("use", e), this.connectedCallback(!0)
            }
            get_max_grid() {
                return this.hasAttribute("experimental") ? 256 : 64
            }
            get_grid() {
                return Ce(this.attr("grid"), this.get_max_grid())
            }
            get_use() {
                let e = String(this.attr("use") || "").trim();
                return /^var\(/.test(e) && (e = `@use:${e};`), e
            }
            attr(e, t) {
                return 1 === arguments.length ? this.getAttribute(e) : 2 === arguments.length ? (this.setAttribute(e, t), t) : void 0
            }
            generate(e) {
                let t = this.get_grid(),
                    n = this.attr("seed") || this.attr("data-seed");
                _(n) && (n = Date.now());
                let r = this.compiled = bn(e, t, n, this.get_max_grid());
                return this._seed_value = r.seed, this._seed_random = r.random, r
            }
            doodle_to_image(e, t, n) {
                "function" == typeof t && (n = t, t = null);
                let r = Pe(e = ":doodle{width:100%;height:100%}" + e, this.extra),
                    i = Ce(""),
                    s = bn(r, i, this._seed_value, this.get_max_grid(), this._seed_random),
                    o = s.grid ? s.grid : i;
                const {
                    keyframes: l,
                    host: a,
                    container: u,
                    cells: c
                } = s.styles;
                let h = this.replace(s),
                    p = Un(o, s.content);
                h(`\n<svg ${t&&t.width&&t.height?`width="${t.width}" height="${t.height}"`:""} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><foreignObject width="100%" height="100%"><div class="host" xmlns="http://www.w3.org/1999/xhtml"><style>${On()} ${Ln(o)} ${a} ${u} ${c} ${l}</style><svg id="defs" xmlns="http://www.w3.org/2000/svg" style="width:0;height:0"></svg>${p}</div></foreignObject></svg>`).then((e => {
                    let t = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(e)))}`;
                    T() && A(t), n(t)
                }))
            }
            pattern_to_image({
                code: e,
                cell: t,
                id: n
            }, r) {
                let i = Nn(e, this.extra);
                this.shader_to_image({
                    shader: i,
                    cell: t,
                    id: n
                }, r)
            }
            canvas_to_image({
                code: e
            }, t) {
                Pn(e).then(t)
            }
            pause() {
                this.setAttribute("cssd-paused-animation", !0);
                for (let e of this.animations) e.pause()
            }
            resume() {
                this.removeAttribute("cssd-paused-animation");
                for (let e of this.animations) e.resume()
            }
            shader_to_image({
                shader: e,
                cell: t,
                id: n
            }, i) {
                let s = "string" == typeof e ? function(e) {
                        let t, n, i = r(Le(p(e, {
                                preserveLineBreak: !0,
                                ignoreInlineComment: !0
                            }))),
                            s = [],
                            o = [],
                            l = {
                                textures: []
                            };
                        for (; i.next();) {
                            let {
                                curr: e,
                                next: r
                            } = i.get();
                            if (e.isSymbol("{")) {
                                if (s.length) o.push(e);
                                else {
                                    let n = Ie(o);
                                    Me(n) ? (t = n, o = []) : o.push(e)
                                }
                                s.push("{")
                            } else if (e.isSymbol("}"))
                                if (s.pop(), !s.length && t) {
                                    let e = Ie(o);
                                    t && e.length && (t.startsWith("texture") ? l.textures.push({
                                        name: t,
                                        value: e
                                    }) : l[t] = e, o = []), t = null
                                } else o.push(e);
                            else $(n) || n == e.pos[1] || (o.push(Oe()), n = null), e.isWord() && e.value.startsWith("#") && (o.push(Oe()), n = r.pos[1]), o.push(e)
                        }
                        return $(l.fragment) && (l.fragment = Ie(o), l.textures = l.textures || []), l
                    }(e) : e,
                    o = this.doodle.getElementById(t);
                const l = this.seed,
                    a = e => {
                        o.style.setProperty(n, `url(${e})`)
                    },
                    u = e => {
                        if ("function" == typeof e) {
                            let t = function(e) {
                                let t, n = 0,
                                    r = 0,
                                    i = 0,
                                    s = !1;

                                function o(s) {
                                    n || (n = s), e(n);
                                    let l = s - r;
                                    l < Mn && (l = Mn), l > 1e3 && (l = i || 1e3), r && (n += l), i = l, r = s, t = requestAnimationFrame(o)
                                }
                                return t = requestAnimationFrame(o), {
                                    resume() {
                                        t && s && (s = !1, t = requestAnimationFrame(o))
                                    },
                                    pause() {
                                        t && (cancelAnimationFrame(t), s = !0)
                                    },
                                    cancel() {
                                        t && (s = !1, cancelAnimationFrame(t), t = null)
                                    }
                                }
                            }((t => {
                                a(e(t))
                            }));
                            return this.animations.push(t), ""
                        }
                        a(e)
                    };
                let {
                    width: c,
                    height: h
                } = o && o.getBoundingClientRect() || {
                    width: 0,
                    height: 0
                }, f = window.devicePixelRatio || 1;
                if (!s.textures.length || s.ticker) $n(s, c, h, l).then(u).then(i);
                else {
                    let e = s.textures.map((e => new Promise((t => {
                        this.doodle_to_image(e.value, {
                            width: c,
                            height: h
                        }, (n => {
                            let r = new Image;
                            r.width = c * f, r.height = h * f, r.onload = () => t({
                                name: e.name,
                                value: r
                            }), r.src = n
                        }))
                    }))));
                    Promise.all(e).then((e => {
                        s.textures = e, $n(s, c, h, l).then(u).then(i)
                    }))
                }
            }
            load(e) {
                this.cleanup();
                let t = Pe(this.get_use() + E(this.innerHTML), this.extra),
                    n = this.generate(t);
                e || this.hasAttribute("click-to-update") && this.addEventListener("click", (e => this.update())), this.grid_size = n.grid ? n.grid : this.get_grid(), this.build_grid(n, this.grid_size)
            }
            replace({
                doodles: e,
                shaders: t,
                canvas: n,
                pattern: r
            }) {
                let i = Object.keys(e),
                    s = Object.keys(t),
                    o = Object.keys(n),
                    l = Object.keys(r),
                    a = i.length + o.length + s.length + l.length;
                return u => {
                    if (!a) return Promise.resolve(u);
                    let c = [].concat(i.map((t => u.includes(t) ? new Promise((n => {
                        this.doodle_to_image(e[t], (e => n({
                            id: t,
                            value: e
                        })))
                    })) : Promise.resolve(""))), s.map((e => u.includes(e) ? new Promise((n => {
                        this.shader_to_image(t[e], (t => n({
                            id: e,
                            value: t
                        })))
                    })) : Promise.resolve(""))), o.map((e => u.includes(e) ? new Promise((t => {
                        this.canvas_to_image(n[e], (n => t({
                            id: e,
                            value: n
                        })))
                    })) : Promise.resolve(""))), l.map((e => u.includes(e) ? new Promise((t => {
                        this.pattern_to_image(r[e], (n => t({
                            id: e,
                            value: n
                        })))
                    })) : Promise.resolve(""))));
                    return Promise.all(c).then((e => {
                        for (let {
                                id: t,
                                value: n
                            }
                            of e) {
                            let e = `url(${n})`;
                            /^canvas/.test(t) && (e = n), /^shader|^pattern/.test(t) && (e = `var(--${t})`), u = u.replaceAll("${" + t + "}", e)
                        }
                        return u
                    }))
                }
            }
            build_grid(e, t) {
                const {
                    has_transition: n,
                    has_animation: r
                } = e.props;
                let i = n || r;
                const {
                    keyframes: s,
                    host: o,
                    container: l,
                    cells: a
                } = e.styles;
                let u = Ln(t) + o + l,
                    c = i ? "" : a;
                const {
                    uniforms: h,
                    content: p
                } = e;
                let f = this.replace(e);
                this.doodle.innerHTML = `\n<style>${On()}</style><style class="style-keyframes">${s}</style><style class="style-container">${u}</style><style class="style-cells">${c}</style><svg id="defs" xmlns="http://www.w3.org/2000/svg" style="width:0;height:0"></svg>${Un(t,p)}`, this.set_content(".style-container", f(u)), i ? setTimeout((() => {
                    this.set_content(".style-cells", f(a))
                }), 50) : this.set_content(".style-cells", f(a)), h.time && this.register_uniform_time(), h.mousex || h.mousey ? this.register_uniform_mouse(h) : this.remove_uniform_mouse(), h.width || h.height ? this.register_uniform_resolution(h) : this.remove_uniform_resolution()
            }
            register_uniform_mouse(e) {
                if (!this.uniform_mouse_callback) {
                    let {
                        uniform_mousex: t,
                        uniform_mousey: n
                    } = Ct;
                    this.uniform_mouse_callback = r => {
                        let i = r.detail || r;
                        e.mousex && this.style.setProperty("--" + t.name, i.offsetX), e.mousey && this.style.setProperty("--" + n.name, i.offsetY)
                    }, this.addEventListener("pointermove", this.uniform_mouse_callback);
                    let r = new CustomEvent("pointermove", {
                        detail: {
                            offsetX: 0,
                            offsetY: 0
                        }
                    });
                    this.dispatchEvent(r)
                }
            }
            remove_uniform_mouse() {
                if (this.uniform_mouse_callback) {
                    let {
                        uniform_mousex: e,
                        uniform_mousey: t
                    } = Ct;
                    this.style.removeProperty("--" + e.name), this.style.removeProperty("--" + t.name), this.removeEventListener("pointermove", this.uniform_mouse_callback), this.uniform_mouse_callback = null
                }
            }
            register_uniform_resolution(e) {
                if (!this.uniform_resolution_observer) {
                    let {
                        uniform_width: t,
                        uniform_height: n
                    } = Ct;
                    const r = () => {
                        let r = this.getBoundingClientRect();
                        e.width && this.style.setProperty("--" + t.name, r.width), e.height && this.style.setProperty("--" + n.name, r.height)
                    };
                    r(), this.uniform_resolution_observer = new ResizeObserver((e => {
                        for (let t of e) {
                            (t.contentBoxSize || t.contentRect) && r()
                        }
                    })), this.uniform_resolution_observer.observe(this)
                }
            }
            remove_uniform_resolution() {
                if (this.uniform_resolution_observer) {
                    let {
                        uniform_width: e,
                        uniform_height: t
                    } = Ct;
                    this.style.removeProperty("--" + e.name), this.style.removeProperty("--" + t.name), this.uniform_resolution_observer.unobserve(this), this.uniform_resolution_observer = null
                }
            }
            register_uniform_time() {
                if (!window.CSS || !window.CSS.registerProperty) return !1;
                if (!this.is_uniform_time_registered) {
                    let {
                        uniform_time: e
                    } = Ct;
                    try {
                        CSS.registerProperty({
                            name: "--" + e.name,
                            syntax: "<number>",
                            initialValue: 0,
                            inherits: !0
                        })
                    } catch (e) {}
                    this.is_uniform_time_registered = !0
                }
            }
            export ({
                scale: e,
                name: t,
                download: n,
                detail: r
            } = {}) {
                return new Promise(((i, s) => {
                    let o = Cn(this),
                        l = this.doodle.innerHTML,
                        {
                            width: a,
                            height: u
                        } = this.getBoundingClientRect(),
                        c = a * (e = parseInt(e) || 1),
                        h = u * e,
                        p = `\n<svg xmlns="http://www.w3.org/2000/svg"\n preserveAspectRatio="none"\n viewBox="0 0 ${a} ${u}"\n ${T()?"":`width="${c}px" height="${h}px"`}><foreignObject width="100%" height="100%"><div\n class="host"\n xmlns="http://www.w3.org/1999/xhtml"\n style="width:${a}px;height:${u}px;"\n><style>.host{${f=o,f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}}</style>${l}</div></foreignObject></svg>`;
                    var f;
                    n || r ? function(e, t, n, r) {
                        return new Promise(((i, s) => {
                            let o = `data:image/svg+xml;utf8,${encodeURIComponent(e)}`;

                            function l() {
                                let e = new Image;
                                e.crossOrigin = "anonymous", e.src = o, e.onload = () => {
                                    let l = document.createElement("canvas"),
                                        a = l.getContext("2d"),
                                        u = window.devicePixelRatio || 1;
                                    1 != r && (u = 1), l.width = t * u, l.height = n * u, a.drawImage(e, 0, 0, l.width, l.height);
                                    try {
                                        l.toBlob((e => {
                                            i({
                                                blob: e,
                                                source: o,
                                                url: URL.createObjectURL(e)
                                            })
                                        }))
                                    } catch (e) {
                                        s(e)
                                    }
                                }
                            }
                            T() ? A(o, l, 200) : l()
                        }))
                    }(p, c, h, e).then((({
                        source: e,
                        url: r,
                        blob: s
                    }) => {
                        if (i({
                                width: c,
                                height: h,
                                svg: p,
                                blob: s,
                                source: e
                            }), n) {
                            let e = document.createElement("a");
                            e.download = function(e) {
                                return (_(e) ? Date.now() : String(e).replace(/\/.png$/g, "")) + ".png"
                            }(t), e.href = r, e.click()
                        }
                    })).catch((e => {
                        s(e)
                    })) : i({
                        width: c,
                        height: h,
                        svg: p
                    })
                }))
            }
            set_content(e, t) {
                if (t instanceof Promise) t.then((t => {
                    this.set_content(e, t)
                }));
                else {
                    const n = this.shadowRoot.querySelector(e);
                    n && (n.styleSheet ? n.styleSheet.cssText = t : n.innerHTML = t)
                }
            }
        }
        customElements.get("css-doodle") || customElements.define("css-doodle", e)
    }

    function On() {
        let {
            uniform_time: e
        } = Ct;
        const t = Ft(/grid/).map((e => `${e}:inherit;`)).join("");
        return `\n *, *::after, *::before{box-sizing:border-box;animation-play-state:var(--cssd-animation-play-state) !important\n}:host, .host{display:block;visibility:visible;width:auto;height:auto;contain:content;--${e.name}:0\n}:host([hidden]), .host[hidden]{display:none\n} .container{position:relative;width:100%;height:100%;display:grid;${t}} cell{position:relative;display:grid;place-items:center\n} svg{position:absolute;width:100%;height:100%\n}:host([cssd-paused-animation]){--cssd-animation-play-state:paused;animation-play-state:paused !important\n}`
    }

    function Ln(e) {
        let {
            x: t,
            y: n
        } = e || {};
        return `\n:host, .host{grid-template-rows:repeat(${n}, 1fr);grid-template-columns:repeat(${t}, 1fr);}`
    }

    function In(e) {
        return _(e) ? "" : e
    }

    function Wn(e, t, n, r, i = "") {
        let s = S(e, t, n);
        return `<cell id="${s}">${In(r["#"+s])}${In(i)}</cell>`
    }

    function Un(e, t) {
        let {
            x: n,
            y: r,
            z: i
        } = e || {}, s = "";
        if (1 == i)
            for (let e = 1; e <= r; ++e)
                for (let r = 1; r <= n; ++r) s += Wn(r, e, 1, t);
        else {
            let e = "";
            for (let n = i; n >= 1; n--) {
                e = Wn(1, 1, n, t, e)
            }
            s = e
        }
        return `<grid class="container">${s}</grid>`
    }
    return N((e => {
        if ("undefined" != typeof document) {
            let t = document.createElement("css-doodle");
            return t.update && t.update(e), t
        }
    }))

    
}));

