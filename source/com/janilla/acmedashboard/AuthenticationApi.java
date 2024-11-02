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
package com.janilla.acmedashboard;

import java.util.Map;
import java.util.Properties;

import com.janilla.json.Jwt;
import com.janilla.persistence.Persistence;
import com.janilla.web.Handle;

public class AuthenticationApi {

	public Properties configuration;

	public Persistence persistence;

	@Handle(method = "POST", path = "/api/authentication")
	public void create(User user, CustomExchange exchange) {
		var uc = persistence.crud(User.class);
		var u = uc.read(uc.find("email", user.email()));
		if (!u.password().equals(user.password()))
			throw new RuntimeException();
		var h = Map.of("alg", "HS256", "typ", "JWT");
		var p = Map.of("loggedInAs", u.email());
		var t = Jwt.generateToken(h, p, configuration.getProperty("acmedashboard.jwt.key"));
		exchange.setSessionCookie(t);
	}

	@Handle(method = "GET", path = "/api/authentication")
	public User read(CustomExchange exchange) {
		return exchange.getSessionUser();
	}

	@Handle(method = "DELETE", path = "/api/authentication")
	public void delete(User user, CustomExchange exchange) {
		exchange.setSessionCookie(null);
	}
}