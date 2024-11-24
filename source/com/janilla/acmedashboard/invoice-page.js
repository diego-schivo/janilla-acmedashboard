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
import { buildInterpolator } from "./dom.js";
import { SlottableElement } from "./web-components.js";
import { loadTemplate } from "./utils.js";

export default class InvoicePage extends SlottableElement {

	static get observedAttributes() {
		return ["data-id", "slot"];
	}

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("InvoicePage.connectedCallback");
		super.connectedCallback();

		this.addEventListener("submit", this.handleSubmit);
	}

	async computeState() {
		console.log("InvoicePage.computeState");

		const [nn, i] = await Promise.all([
			fetch("/api/customers/names").then(x => x.json()),
			this.dataset.id ? fetch(`/api/invoices/${this.dataset.id}`).then(x => x.json()) : undefined
		]);
		this.state = {
			customers: nn,
			...i
		}
		history.replaceState(this.state, "");
	}

	async render() {
		console.log("InvoicePage.render");

		this.interpolators ??= loadTemplate("invoice-page").then(t => {
			const c = t.content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			return [buildInterpolator(c), buildInterpolator(cc[0])];
		});
		const ii = await this.interpolators;

		this.appendChild(ii[0]({
			...this.dataset,
			customerOptions: this.state?.customers.map(x => ii[1](x).cloneNode(true))
		}));

		const f = this.querySelector("form");
		[...new Set(Array.from(f.elements).filter(x => x.matches("input, select")).map(x => x.name))]
			.forEach(x => f[x].value = this.state?.[x] ?? "");
	}

	handleSubmit = async event => {
		console.log("InvoicePage.handleSubmit", event);

		event.preventDefault();
		const i = Object.fromEntries(new FormData(event.target));
		const mm = {
			customerId: i.customerId ? "" : "Please select a customer.",
			amount: i.amount ? "" : "Please enter an amount greater than $0.",
			status: i.status ? "" : "Please select an invoice status."
		};
		Object.entries(mm).forEach(([k, v]) => this.querySelector(`.${k}-error`).innerHTML = v.length ? `<p>${v}</p>` : "");
		const v = Object.values(mm).every(x => !x.length);
		this.querySelector(".error").innerHTML = v ? "" : `<p>Missing Fields. Failed to ${this.dataset.title}.</p>`;
		if (!v)
			return;

		const r = await fetch(this.dataset.id ? `/api/invoices/${this.dataset.id}` : "/api/invoices", {
			method: this.dataset.id ? "PUT" : "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(i)
		});
		if (r.ok) {
			history.pushState({}, "", "/dashboard/invoices");
			dispatchEvent(new CustomEvent("popstate"));
		} else {
			const t = await r.text();
			this.querySelector(".error").innerHTML = `<p>${t}</p>`;
		}
	}
}
