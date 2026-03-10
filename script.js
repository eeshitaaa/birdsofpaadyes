(() => {
  const ENDPOINT =
    "https://www.birdsofparadyes.com/collections/semi-permanent-hair-color/products.json?limit=250";

  const grid = document.getElementById("grid");
  const cardTemplate = document.getElementById("card-template");
  const count = document.getElementById("count");
  const search = document.getElementById("search");
  const typeFilter = document.getElementById("type-filter");
  const sort = document.getElementById("sort");
  const empty = document.getElementById("empty");

  let products = [];

  function formatMoney(value) {
    const amount = Number(value || 0);
    return `Rs. ${amount.toFixed(2)}`;
  }

  function classifyType(title) {
    const text = (title || "").toLowerCase();
    if (text.includes("timeless")) return "timeless";
    if (text.includes("glossy")) return "glossy";
    return "other";
  }

  function getFilteredProducts() {
    const term = (search.value || "").trim().toLowerCase();
    const type = typeFilter.value;
    const sortValue = sort.value;

    let items = products.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const typeMatch = type === "all" || classifyType(item.title) === type;
      const searchMatch = !term || title.includes(term);
      return typeMatch && searchMatch;
    });

    if (sortValue === "title-asc") {
      items = items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "title-desc") {
      items = items.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortValue === "price-asc") {
      items = items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortValue === "price-desc") {
      items = items.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return items;
  }

  function renderProducts() {
    const items = getFilteredProducts();
    grid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    items.forEach((product) => {
      const node = cardTemplate.content.cloneNode(true);

      const link = node.querySelector(".card-media-link");
      const image = node.querySelector(".card-image");
      const title = node.querySelector(".card-title");
      const type = node.querySelector(".card-type");
      const price = node.querySelector(".price");
      const compare = node.querySelector(".compare-price");

      const productUrl = `https://www.birdsofparadyes.com/products/${product.handle}`;
      const imageUrl = product.images?.[0]?.src || "";

      link.href = productUrl;
      image.src = imageUrl;
      image.alt = product.title;
      title.textContent = product.title;
      type.textContent = product.product_type || "Semi-Permanent Hair Color";
      price.textContent = formatMoney(product.variants?.[0]?.price);

      const compareValue = Number(product.variants?.[0]?.compare_at_price || 0);
      const priceValue = Number(product.variants?.[0]?.price || 0);
      if (compareValue > priceValue) {
        compare.textContent = formatMoney(compareValue);
        compare.classList.remove("is-hidden");
      } else {
        compare.classList.add("is-hidden");
      }

      fragment.appendChild(node);
    });

    grid.appendChild(fragment);
    count.textContent = `${items.length} products`;
    empty.classList.toggle("is-hidden", items.length !== 0);
  }

  async function loadProducts() {
    try {
      const response = await fetch(ENDPOINT);
      if (!response.ok) throw new Error("Failed to load products");
      const payload = await response.json();
      products = (payload.products || []).map((item) => ({
        title: item.title,
        handle: item.handle,
        images: item.images,
        product_type: item.product_type,
        price: item.variants?.[0]?.price,
        variants: item.variants || []
      }));
      renderProducts();
    } catch (error) {
      count.textContent = "Unable to load products right now";
      empty.textContent = "Please refresh in a moment.";
      empty.classList.remove("is-hidden");
    }
  }

  [search, typeFilter, sort].forEach((control) => {
    control.addEventListener("input", renderProducts);
    control.addEventListener("change", renderProducts);
  });

  loadProducts();
})();
