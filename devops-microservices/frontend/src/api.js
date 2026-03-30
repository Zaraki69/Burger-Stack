const API = {
  auth: "http://localhost:3001",
  user: "http://localhost:3002",
  product: "http://localhost:3003",
  order: "http://localhost:3004"
};

export async function login() {
  const res = await fetch(`${API.auth}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "test",
      password: "1234"
    })
  });
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API.product}/products`);
  return res.json();
}

export async function createOrder() {
  const res = await fetch(`${API.order}/orders`, {
    method: "POST"
  });
  return res.text();
}