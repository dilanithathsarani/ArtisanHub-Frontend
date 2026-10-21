import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/navBar";
import Footer from "../components/footer";

const getImages = (product) => {
    if (!Array.isArray(product?.images)) {
        return [];
    }

    return [
        ...new Set(
            product.images.filter(
                (image) => typeof image === "string" && image.trim()
            )
        ),
    ].slice(0, 5);
};

const formatPrice = (amount) =>
    `LKR ${Number(amount || 0).toLocaleString("en-LK")}`;

function ProductDetailsPage() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchProductDetails = async () => {
            setLoading(true);
            setProduct(null);
            setSimilarProducts([]);
            setActiveImage(0);
            setQuantity(1);

            try {
                const apiUrl =
                    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

                const [productResponse, productsResponse] = await Promise.all([
                    axios.get(`${apiUrl}/products/${id}`),
                    axios.get(`${apiUrl}/products`).catch(() => null),
                ]);

                const responseData = productResponse.data;

                const productData =
                    responseData?.product ||
                    responseData?.data?.product ||
                    responseData?.data ||
                    responseData;

                if (!productData || typeof productData !== "object" || !productData._id) {
                    throw new Error("Invalid product data received from the server.");
                }

                if (cancelled) return;

                setProduct(productData);

                if (productsResponse) {
                    const listData = productsResponse.data;

                    const productList = Array.isArray(listData)
                        ? listData
                        : listData?.products ||
                        listData?.data?.products ||
                        listData?.data ||
                        [];

                    if (Array.isArray(productList)) {
                        const currentCategory =
                            typeof productData.category === "object"
                                ? productData.category?._id
                                : productData.category;

                        const related = productList
                            .filter((item) => {
                                if (!item?._id || item._id === productData._id) {
                                    return false;
                                }

                                const itemCategory =
                                    typeof item.category === "object"
                                        ? item.category?._id
                                        : item.category;

                                return (
                                    currentCategory &&
                                    itemCategory &&
                                    String(currentCategory) === String(itemCategory)
                                );
                            })
                            .slice(0, 4);

                        setSimilarProducts(related);
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching product details:", error);
                    toast.error(
                        error.response?.data?.message ||
                        "Unable to load product details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProductDetails();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const images = getImages(product);
    const name = product?.name || "Handmade Craft";
    const price = Number(product?.price || 0);
    const compareAt = Number(product?.compareAt || 0);

    const hasDiscount = compareAt > price;
    const discountPercent = hasDiscount
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;

    const materials = Array.isArray(product?.materials)
        ? product.materials
        : [];

    const stock = Number(product?.stock || 0);
    const outOfStock = !product?.isActive || product?.status !== "approved" || stock <= 0;

    const handleQuantityChange = (change) => {
        setQuantity((current) =>
            Math.min(stock, Math.max(1, current + change))
        );
    };

    return (
        <main className="min-h-screen bg-[#fffdf9] text-stone-800">
            <Navbar />

            <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8b5e3c] transition hover:text-[#70472c]"
                >
                    ← Back to shopping
                </Link>

                {loading ? (
                    <div className="py-24 text-center text-stone-500">
                        Loading product details...
                    </div>
                ) : !product ? (
                    <div className="py-24 text-center">
                        <h1 className="text-2xl font-bold">Product not found</h1>
                        <p className="mt-3 text-stone-500">
                            This product may no longer be available.
                        </p>
                        <Link
                            to="/"
                            className="mt-6 inline-block rounded-lg bg-[#8b5e3c] px-6 py-3 text-white transition hover:bg-[#70472c]"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
                            {/* Product gallery */}
                            <div>
                                <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#f4eadb] sm:min-h-[480px]">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[activeImage]}
                                            alt={name}
                                            className="h-[320px] w-full object-contain sm:h-[480px]"
                                        />
                                    ) : (
                                        <div className="flex h-[320px] w-full items-center justify-center text-stone-500 sm:h-[480px]">
                                            Image unavailable
                                        </div>
                                    )}

                                    {hasDiscount && (
                                        <span className="absolute left-4 top-4 rounded-full bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white">
                                            {discountPercent}% OFF
                                        </span>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                                        {images.map((image, index) => (
                                            <button
                                                key={`${image}-${index}`}
                                                type="button"
                                                onClick={() => setActiveImage(index)}
                                                aria-label={`View product image ${index + 1}`}
                                                aria-pressed={activeImage === index}
                                                className={`overflow-hidden rounded-xl border-2 bg-[#f4eadb] ${activeImage === index
                                                        ? "border-[#8b5e3c]"
                                                        : "border-transparent hover:border-[#d6b99c]"
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${name} view ${index + 1}`}
                                                    className="h-20 w-full object-cover sm:h-24"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                            </div>

                            {/* Product information */}
                            <div className="flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#94633d]">
                                    HANDMADE COLLECTION
                                </p>

                                <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                                    {name}
                                </h1>

                                {/* Pricing and discount */}
                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <span className="text-2xl font-bold text-[#8b5e3c]">
                                        {formatPrice(price)}
                                    </span>

                                    {hasDiscount && (
                                        <>
                                            <span className="text-base text-stone-400 line-through">
                                                {formatPrice(compareAt)}
                                            </span>

                                            <span className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
                                                Save {formatPrice(compareAt - price)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-amber-500">
                                        ★ {Number(product.averageRating || 0).toFixed(1)}
                                    </span>
                                    <span className="text-stone-500">
                                        ({Number(product.reviewCount || 0)} reviews)
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="mt-7 border-y border-stone-200 py-6">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                                        Product description
                                    </h2>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Materials */}
                                {materials.length > 0 && (
                                    <div className="mt-6">
                                        <h2 className="text-sm font-semibold">Materials</h2>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {materials.map((material, index) => (
                                                <span
                                                    key={`${material}-${index}`}
                                                    className="rounded-full bg-[#f4eadb] px-3 py-1.5 text-sm text-[#805537]"
                                                >
                                                    {material}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Customization */}
                                <div className="mt-5 text-sm text-stone-600">
                                    <span className="font-medium text-stone-800">
                                        Customization:
                                    </span>{" "}
                                    {product.customizationAvailable
                                        ? "Available"
                                        : "Not available"}
                                </div>

                                {/* Stock */}
                                <p className="mt-4 text-sm text-stone-600">
                                    Availability:{" "}
                                    <span
                                        className={`font-semibold ${outOfStock ? "text-red-600" : "text-green-700"
                                            }`}
                                    >
                                        {outOfStock
                                            ? "Currently unavailable"
                                            : `${stock} available`}
                                    </span>
                                </p>

                                {/* Quantity and cart */}
                                <div className="mt-7 flex flex-wrap items-center gap-4">
                                    <div className="flex items-center rounded-lg border border-stone-200">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1 || outOfStock}
                                            aria-label="Decrease quantity"
                                            className="px-4 py-3 text-lg disabled:opacity-40"
                                        >
                                            −
                                        </button>

                                        <span className="min-w-10 text-center">{quantity}</span>

                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={outOfStock || quantity >= stock}
                                            aria-label="Increase quantity"
                                            className="px-4 py-3 text-lg disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={outOfStock}
                                        onClick={() =>{
                                            const cart = JSON.parse(
                                            localStorage.getItem("artisanhub-cart") || "[]"
                                        );

                                            const existingItem = cart.find(
                                                (item) => item.productId === product._id
                                            );

                                            if (existingItem) {
                                                existingItem.quantity += quantity;
                                            } else {
                                                cart.push({
                                                    productId: product._id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: images[0] || "",
                                                    quantity,
                                                });
                                            }

                                            localStorage.setItem("artisanhub-cart", JSON.stringify(cart));
                                            window.dispatchEvent(new Event("cartUpdated"));

                                            toast("Product added to cart successfully!");
                                        }}
                                        className="flex-1 rounded-lg bg-[#8b5e3c] px-6 py-3 font-semibold text-white transition hover:bg-[#70472c] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Similar products */}
                        {similarProducts.length > 0 && (
                            <section className="mt-20 border-t border-stone-200 pt-12">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#94633d]">
                                        YOU MAY ALSO LIKE
                                    </p>
                                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                                        Similar Handmade Crafts
                                    </h2>
                                    <p className="mt-2 text-sm text-stone-500">
                                        Discover more creations from our collection.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {similarProducts.map((item) => {
                                        const relatedImage = getImages(item)[0];
                                        const relatedName = item.name || "Handmade Craft";

                                        return (
                                            <Link
                                                key={item._id}
                                                to={`/products/${item._id}`}
                                                className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                                            >
                                                {relatedImage ? (
                                                    <img
                                                        src={relatedImage}
                                                        alt={relatedName}
                                                        loading="lazy"
                                                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 items-center justify-center bg-[#f4eadb] text-sm text-stone-500">
                                                        Handmade Craft
                                                    </div>
                                                )}

                                                <div className="p-4">
                                                    <h3 className="truncate font-semibold group-hover:text-[#8b5e3c]">
                                                        {relatedName}
                                                    </h3>
                                                    <p className="mt-2 font-bold text-[#8b5e3c]">
                                                        {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </section>

            <Footer />
        </main>
    );
}

export default ProductDetailsPage;