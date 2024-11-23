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
import { loadTemplate, removeAllChildren } from "./utils.js";

export default class CustomersPage extends HTMLElement {

	static get observedAttributes() {
		return ["data-query", "slot"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("CustomersPage.connectedCallback");

		this.addEventListener("input", this.handleInput);
		this.requestUpdate();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// console.log("CustomersPage.attributeChangedCallback", "name", name, "oldValue", oldValue, "newValue", newValue);

		if (newValue !== oldValue)
			this.requestUpdate();
	}

	requestUpdate() {
		// console.log("CustomersPage.requestUpdate");

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);

		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("CustomersPage.update");

		if (!this.slot) {
			removeAllChildren(this);
			return;
		}

		await this.render();
		if (this.state)
			return;

		const u = new URL("/api/customers", location.href);
		const q = this.dataset.query;
		if (q)
			u.searchParams.append("query", q);
		this.state = await (await fetch(u)).json();
		history.replaceState(this.state, "");
		await this.render();
	}

	async render() {
		console.log("CustomersPage.render");

		const t = await loadTemplate("customers-page");
		const tt = t.content.querySelectorAll("template");
		const d = {
			rows: this.state
				? this.state.map(x => interpolate(tt[1].content.cloneNode(true), x))
				: Array.from({ length: 6 }).map(_ => interpolate(tt[0].content.cloneNode(true)))
		};

		if (!this.hasChildNodes()) {
			this.appendChild(interpolate(t.content.cloneNode(true), d));
			const q = this.dataset.query;
			if (q)
				this.querySelector('[type="text"]').value = q;
		} else
			this.querySelector("tbody").replaceWith(
				interpolate(t.content.querySelector("tbody").cloneNode(true), d));
	}

	handleInput = event => {
		console.log("CustomersPage.handleInput", event);

		if (typeof this.inputTimeout === "number")
			clearTimeout(this.inputTimeout);

		const q = event.target.value;
		this.inputTimeout = setTimeout(() => {
			this.inputTimeout = undefined;
			const u = new URL("/dashboard/customers", location.href);
			if (q)
				u.searchParams.append("query", q);
			history.pushState({}, "", u.pathname + u.search);
			dispatchEvent(new CustomEvent("popstate"));
		}, 1000);
	}
}
