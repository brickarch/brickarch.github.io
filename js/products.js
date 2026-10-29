const productGrid = document.getElementById("product-grid");
const productCount = document.getElementById("product-count");
const statusMessage = document.getElementById("status-message");

function getProductUrl(product) {
  const candidate = product.affiliated_link || product.link;

  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function createProductCard(product) {
  const url = getProductUrl(product);
  const card = document.createElement(url ? "a" : "article");
  card.className = `product-card${url ? "" : " unavailable"}`;

  if (url) {
    card.href = url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute(
      "aria-label",
      `${product.name}, view product details (opens in a new tab)`,
    );
  }

  const art = document.createElement("div");
  art.className = "card-art";
  art.setAttribute("aria-hidden", "true");

  const initial = document.createElement("span");
  initial.textContent = product.name.trim().charAt(0) || "B";
  art.append(initial);

  const copy = document.createElement("div");
  copy.className = "card-copy";

  const details = document.createElement("div");
  const name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = product.name;

  const category = document.createElement("p");
  category.className = "card-category";
  category.textContent = product.category;
  details.append(name, category);

  const action = document.createElement("span");
  action.className = "card-action";
  action.textContent = url ? "↗" : "Coming soon";
  action.setAttribute("aria-hidden", "true");
  copy.append(details, action);
  card.append(art, copy);

  return card;
}

async function loadProducts() {
  if (window.location.protocol === "file:") {
    statusMessage.textContent =
      "Product data cannot load from a file:// URL. Open BrickArc with the VS Code 'Open BrickArc' launch configuration or serve this folder over HTTP.";
    return;
  }

  try {
    const response = await fetch("resources/products.json");
    if (!response.ok) {
      throw new Error(`Product data request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.products)) {
      throw new Error("Product data must contain a products array");
    }

    const products = data.products.filter(
      (product) =>
        product &&
        typeof product.name === "string" &&
        typeof product.category === "string",
    );

    if (products.length === 0) {
      statusMessage.textContent = "No products are available right now.";
      return;
    }

    productGrid.append(...products.map(createProductCard));
    productCount.textContent = `${products.length} architecture models`;
    statusMessage.hidden = true;
  } catch (error) {
    console.error("Unable to load products:", error);
    statusMessage.textContent = "Products could not be loaded. Please try again later.";
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
loadProducts();
