/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
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
import { FlexibleElement } from "./flexible-element.js";

export default class InvoicesLayout extends FlexibleElement {

	static get templateName() {
		return "invoices-layout";
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		// console.log("InvoicesLayout.connectedCallback");
		super.connectedCallback();
		this.shadowRoot.addEventListener("slotchange", this.handleSlotChange);
	}

	disconnectedCallback() {
		// console.log("InvoicesLayout.disconnectedCallback");
		this.shadowRoot.removeEventListener("slotchange", this.handleSlotChange);
	}

	handleSlotChange = event => {
		// console.log("InvoicesLayout.handleSlotChange", event);
		this.requestUpdate();
	}

	async updateDisplay() {
		// console.log("InvoicesLayout.updateDisplay");
		this.shadowRoot.appendChild(this.interpolateDom({
			$template: "",
			breadcrumbItems: (() => {
				const nn = [];
				for (let n = this.querySelector("[slot]"); n; n = n.previousElementSibling)
					nn.push(n);
				nn.reverse();
				return nn.map((x, i) => ({
					$template: i < nn.length - 1 ? "breadcrumb-link" : "breadcrumb-heading",
					...x.dataset,
					slot: `item-${i}`
				}));
			})()
		}));
		this.shadowRoot.querySelector("breadcrumb-nav").requestUpdate();
	}
}
