import { useState, useEffect } from "react";
import "./app.css";

const API = {
  auth: "/auth",
  user: "/user",
  product: "/product",
  order: "/order"
};

const MOCK_PRODUCTS = [
  { id: 1, name: "Classic Smash Burger", price: 8.99, emoji: "🍔", desc: "Double smash patty, american cheese, special sauce" },
  { id: 2, name: "Crispy Chicken Burger", price: 9.49, emoji: "🍗", desc: "Fried chicken thigh, pickles, sriracha mayo" },
  { id: 3, name: "BBQ Bacon Stack", price: 10.99, emoji: "🥓", desc: "Beef patty, streaky bacon, BBQ glaze, onion rings" },
  { id: 4, name: "Mushroom Swiss", price: 9.99, emoji: "🍄", desc: "Beef patty, sautéed mushrooms, swiss cheese" },
  { id: 5, name: "Veggie Royale", price: 8.49, emoji: "🌱", desc: "Black bean patty, avocado, tomato, jalapeño" },
  { id: 6, name: "Truffle Deluxe", price: 13.99, emoji: "✨", desc: "Wagyu beef, truffle aioli, caramelized onions" },
];

function ServiceStatus({ name, url, color }) {
  const [status, setStatus] = useState("idle");
  const [latency, setLatency] = useState(null);

  const check = async () => {
    setStatus("checking");
    setLatency(null);
    const start = Date.now();
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
      const ms = Date.now() - start;
      if (res.ok) { setStatus("online"); setLatency(ms); }
      else setStatus("error");
    } catch {
      setStatus("offline");
    }
  };

  const dot = { idle: "#444", checking: "#f59e0b", online: "#22c55e", error: "#ef4444", offline: "#ef4444" }[status];
  const label = { idle: "—", checking: "Pinging…", online: `${latency}ms`, error: "Error", offline: "Offline" }[status];

  return (
    <div className="service-card" style={{ "--accent": color }}>
      <div className="service-left">
        <span className="service-dot" style={{ background: dot }} />
        <div>
          <div className="service-name">{name}</div>
          <div className="service-url">{url}</div>
        </div>
      </div>
      <div className="service-right">
        <span className="service-latency" style={{ color: status === "online" ? "#22c55e" : status === "offline" || status === "error" ? "#ef4444" : "#888" }}>{label}</span>
        <button className="btn-ping" onClick={check} disabled={status === "checking"}>
          {status === "checking" ? "…" : "Ping"}
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, inCart }) {
  return (
    <div className={`product-card ${inCart ? "in-cart" : ""}`}>
      <div className="product-emoji">{product.emoji}</div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.desc}</div>
      </div>
      <div className="product-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button className={`btn-cart ${inCart ? "btn-cart-active" : ""}`} onClick={() => onAddToCart(product)}>
          {inCart ? "✓ Added" : "+ Add"}
        </button>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{type === "success" ? "✓" : "✕"} {message}</div>;
}

export default function App() {
  const [token, setToken] = useState("");
  const [loginState, setLoginState] = useState("idle");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderMsg, setOrderMsg] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [toast, setToast] = useState(null);
  const [tokenVisible, setTokenVisible] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  const login = async () => {
    setLoginState("loading");
    try {
      const res = await fetch(`${API.auth}/login`, { method: "POST" });
      const data = await res.json();
      setToken(data.token);
      setLoginState("done");
      showToast("Logged in successfully");
    } catch {
      setLoginState("error");
      showToast("Login failed — is auth-service running?", "error");
    }
  };

  const logout = () => { setToken(""); setLoginState("idle"); setCart([]); setOrderMsg(""); showToast("Logged out"); };

  const getProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API.product}/products`);
      const data = await res.json();
      const enriched = data.map((p, i) => ({ ...MOCK_PRODUCTS[i % MOCK_PRODUCTS.length], ...p }));
      setProducts(enriched.length > 0 ? enriched : MOCK_PRODUCTS);
    } catch {
      setProducts(MOCK_PRODUCTS);
      showToast("Using demo products — product-service offline", "error");
    } finally {
      setProductsLoading(false);
    }
  };

  const addToCart = (product) => setCart((prev) =>
    prev.find((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]
  );

  const createOrder = async () => {
    if (!token) { showToast("Please login first", "error"); return; }
    if (cart.length === 0) { showToast("Add items to your order first", "error"); return; }
    setOrderLoading(true);
    try {
      const res = await fetch(`${API.order}/orders`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.text();
      setOrderMsg(data || "Order placed!");
      setCart([]);
      showToast("Order placed! 🍔");
    } catch {
      showToast("Order failed — is order-service running?", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="brand-icon">🍔</span>
          <div>
            <div className="brand-title">BurgerStack</div>
            <div className="brand-sub">Microservices Demo</div>
          </div>
        </div>
        <nav className="header-nav">
          {[
            { id: "menu", label: "🍟 Menu" },
            { id: "services", label: "🔌 Services" },
            { id: "orders", label: cart.length ? `🧾 Orders (${cart.length})` : "🧾 Orders" },
          ].map((tab) => (
            <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="header-auth">
          {token ? (
            <div className="auth-badge">
              <span className="auth-dot" />
              <span className="auth-name">test</span>
              <button className="btn-logout" onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="btn-login" onClick={login} disabled={loginState === "loading"}>
              {loginState === "loading" ? "Logging in…" : "Login"}
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {token && (
          <div className="token-strip">
            <span className="token-label">JWT</span>
            <code className="token-value">{tokenVisible ? token : token.slice(0, 28) + "••••••••••••"}</code>
            <button className="btn-token-toggle" onClick={() => setTokenVisible(!tokenVisible)}>{tokenVisible ? "Hide" : "Show"}</button>
          </div>
        )}

        {activeTab === "menu" && (
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Our Menu</h2>
                <p className="section-sub">Fresh ingredients, stacked to perfection</p>
              </div>
              <button className="btn-primary" onClick={getProducts} disabled={productsLoading}>
                {productsLoading ? "Loading…" : products.length ? "↺ Refresh" : "Load Products"}
              </button>
            </div>
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍔</div>
                <div className="empty-text">Hit "Load Products" to fetch the menu from product-service</div>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} inCart={cart.some((c) => c.id === p.id)} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "services" && (
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Service Health</h2>
                <p className="section-sub">Ping each microservice's <code>/health</code> endpoint</p>
              </div>
            </div>
            <div className="services-list">
              <ServiceStatus name="Auth Service" url={API.auth} color="#f59e0b" />
              <ServiceStatus name="User Service" url={API.user} color="#3b82f6" />
              <ServiceStatus name="Product Service" url={API.product} color="#8b5cf6" />
              <ServiceStatus name="Order Service" url={API.order} color="#22c55e" />
            </div>
            <p className="services-note">Run <code>docker-compose up</code> in <code>devops-microservices/</code> before pinging.</p>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Your Order</h2>
                <p className="section-sub">{token ? "Review and place your order" : "Login required to place orders"}</p>
              </div>
            </div>
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <div className="empty-text">No items yet — go to Menu and add some burgers!</div>
              </div>
            ) : (
              <div className="order-panel">
                <div className="order-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="order-item-emoji">{item.emoji}</span>
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-price">${item.price.toFixed(2)}</span>
                      <button className="order-item-remove" onClick={() => addToCart(item)}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total</span>
                  <span className="order-total-value">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="btn-order" onClick={createOrder} disabled={orderLoading || !token}>
                  {orderLoading ? "Placing…" : !token ? "Login to Order" : "Place Order →"}
                </button>
              </div>
            )}
            {orderMsg && <div className="order-success">✓ {orderMsg}</div>}
          </section>
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}