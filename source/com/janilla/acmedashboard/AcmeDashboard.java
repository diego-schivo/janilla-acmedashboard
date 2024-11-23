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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import java.util.stream.Stream;

import com.janilla.http.HttpHandler;
import com.janilla.http.HttpProtocol;
import com.janilla.io.IO;
import com.janilla.net.Net;
import com.janilla.net.Server;
import com.janilla.persistence.ApplicationPersistenceBuilder;
import com.janilla.persistence.Persistence;
import com.janilla.reflect.Factory;
import com.janilla.util.Util;
import com.janilla.web.ApplicationHandlerBuilder;
import com.janilla.web.Handle;
import com.janilla.web.Render;

@Render("index.html")
public class AcmeDashboard {

	public static void main(String[] args) {
//		Reflection.properties(InvoiceApi.Page2.class);
		try {
			var pp = new Properties();
			try (var is = AcmeDashboard.class.getResourceAsStream("configuration.properties")) {
				pp.load(is);
				if (args.length > 0) {
					var p = args[0];
					if (p.startsWith("~"))
						p = System.getProperty("user.home") + p.substring(1);
					pp.load(Files.newInputStream(Path.of(p)));
				}
			} catch (IOException e) {
				throw new UncheckedIOException(e);
			}
			var a = new AcmeDashboard(pp);
			var hp = a.factory.create(HttpProtocol.class);
			try (var is = Net.class.getResourceAsStream("testkeys")) {
				hp.setSslContext(Net.getSSLContext("JKS", is, "passphrase".toCharArray()));
			} catch (IOException e) {
				throw new UncheckedIOException(e);
			}
			hp.setHandler(a.handler);
			var s = new Server();
			s.setAddress(
					new InetSocketAddress(Integer.parseInt(a.configuration.getProperty("acmedashboard.server.port"))));
			s.setProtocol(hp);
			s.serve();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	public Properties configuration;

	public Factory factory;

	public HttpHandler handler;

	public Persistence persistence;

//	public Iterable<String> templates;

	public AcmeDashboard(Properties configuration) {
		this.configuration = configuration;
		factory = new Factory();
		factory.setTypes(Util.getPackageClasses(getClass().getPackageName()).toList());
		factory.setSource(this);
		handler = factory.create(ApplicationHandlerBuilder.class).build();
		{
			var pb = factory.create(ApplicationPersistenceBuilder.class);
			var p = configuration.getProperty("acmedashboard.database.file");
			if (p.startsWith("~"))
				p = System.getProperty("user.home") + p.substring(1);
			pb.setFile(Path.of(p));
			persistence = pb.build();
		}
//		templates = Stream.of(getClass().getPackageName()).flatMap(p -> IO.getPackageFiles(p).filter(f -> {
//			var n = f.getFileName().toString();
//			return n.endsWith(".html") && !n.equals("AcmeDashboard-Document.html");
//		}).map(f -> {
//			return p.replace('.', '/') + "/" + f.getFileName().toString();
//		})).map(x -> {
//			var l = Thread.currentThread().getContextClassLoader();
//			try (var is = l.getResourceAsStream(x)) {
//				return new String(is.readAllBytes());
//			} catch (IOException e) {
//				throw new UncheckedIOException(e);
//			}
//		}).filter(x -> x.contains("<template id=")).toList();
	}

	@Handle(method = "GET", path = "(/[\\w\\d/-]*)")
	public AcmeDashboard getApplication() {
		return this;
	}
}
