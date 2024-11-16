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
export default class LoginPage extends HTMLElement {

	constructor() {
		super();
		const sr = this.attachShadow({ mode: "open" });
		const t = document.getElementById("login-page-template");
		sr.appendChild(t.content.cloneNode(true));
		sr.addEventListener("submit", this.handleSubmit);
	}

	handleSubmit = async event => {
		console.log("LoginPage.handleSubmit", event);
		event.preventDefault();
		const fd = new FormData(event.target);
		await fetch("/api/authentication", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(Object.fromEntries(fd))
		});
		history.pushState({}, "", "/dashboard");
		dispatchEvent(new CustomEvent("popstate"));
	}
}
