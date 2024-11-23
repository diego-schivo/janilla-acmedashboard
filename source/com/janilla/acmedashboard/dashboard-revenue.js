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
import { compileNode, loadTemplate } from "./utils.js";

export default class DashboardRevenue extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		// console.log("DashboardRevenue.connectedCallback");

		this.requestUpdate();
	}

	requestUpdate() {
		// console.log("DashboardRevenue.requestUpdate");

		if (typeof this.updateTimeout === "number")
			clearTimeout(this.updateTimeout);

		this.updateTimeout = setTimeout(async () => {
			this.updateTimeout = undefined;
			await this.update();
		}, 1);
	}

	async update() {
		console.log("DashboardRevenue.update");

		await this.render();
		if (this.state)
			return;

		this.state = await (await fetch("/api/dashboard/revenue")).json();
		await this.render();
	}

	async render() {
		console.log("DashboardRevenue.render");

		if (!this.interpolate) {
			const c = (await loadTemplate("dashboard-revenue")).content.cloneNode(true);
			const cc = [...c.querySelectorAll("template")].map(x => x.content);
			this.interpolate = [compileNode(c), compileNode(cc[0])];
		}

		const k = this.state?.length ? Math.ceil(Math.max(...this.state.map(x => x.revenue)) / 1000) : undefined;
		this.appendChild(this.interpolate[0]({
			k,
			content: this.state?.flatMap(x => this.interpolate[1]({
				...x,
				style: `height: ${x.revenue / (1000 * k) * 100}%`,
			}).cloneNode(true))
		}));
	}
}