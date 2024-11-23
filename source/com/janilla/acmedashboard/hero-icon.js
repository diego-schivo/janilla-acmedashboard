/*
 * MIT License
 *
 * Copyright (c) 2024 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const map = new Map();
const parser = new DOMParser();

export default class HeroIcon extends HTMLElement {

	constructor() {
		super();
	}

	async connectedCallback() {
		// console.log("HeroIcon.connectedCallback");

		const n = this.dataset.name;
		if (!n)
			return;

		if (!map.has(n))
			map.set(n, fetch(`/images/heroicons/${n}.svg`).then(x => x.text()).then(x => {
				x = x.replace("#0F172A", "currentColor");
				return parser.parseFromString(x, "image/svg+xml");
			}));
		map.get(n).then(d => this.appendChild(d.firstChild.cloneNode(true)));
	}
}