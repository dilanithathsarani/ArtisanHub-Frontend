
import { formatCurrency } from "../utils/formatCurrency";

function ProductCard({ product, onAddToCart }) {
  const image =
    product.images?.[0]?.url ||
    product.image?.url ||
    product.image ||
    "";

  const name = product.name || product.title || "Handmade Craft";

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden bg-[#f4eadb]">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-stone-500">
            Image unavailable
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="truncate text-lg font-semibold text-stone-800">
          {name}
        </h3>

        <p className="mt-2 min-h-10 line-clamp-2 text-sm leading-5 text-stone-500">
          {product.description || "A unique creation made with care."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-bold text-[#8b5e3c]">
            {formatCurrency(product.price)}
          </p>

          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="rounded-lg bg-[#8b5e3c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#70472c]"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
