
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users } from "lucide-react";

const ArtisanCard = ({ artisan }) => {
 const profile = artisan.sellerProfile || {};

const id = artisan._id || artisan.id;
const name = artisan.name || "Local Artisan";
const shopName = profile.shopName || "";

const bio =
  profile.bio ||
  "Creating unique handmade pieces with care and creativity.";

const location = [
  profile.city,
  profile.district,
  profile.country,
]
  .filter(Boolean)
  .join(", ");

const specialty =
  profile.craftCategories
    ?.map((category) => category.name)
    .filter(Boolean)
    .join(", ") || "Handmade Crafts";

const slug = profile.slug || id;

const image =
  profile.logo ||
  artisan.avatar ||
  profile.bannerImage ||
  "";
  
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#eadfd3] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/artisans/${encodeURIComponent(slug || id || "")}`} className="block relative h-64 overflow-hidden bg-[#eee2d1]">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#eee2d1] to-[#c6a486]">
            <Users
              size={64}
              strokeWidth={1}
              className="text-white/80"
            />
          </div>
        )}

        <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#8b5e3c]">
          {specialty}
        </span>
      </Link>

      <div className="p-6">
        <h3 className="text-xl font-bold text-[#493324]">
          <Link
            to={`/artisans/${encodeURIComponent(slug || id || "")}`}
            className="transition hover:text-[#8b5e3c]"
          >
            {shopName || name}
          </Link>
        </h3>

        {shopName && (
          <p className="mt-1 text-sm text-stone-500">{name}</p>
        )}

        {location && (
          <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
            <MapPin size={16} className="shrink-0 text-[#a56d42]" />
            {location}
          </p>
        )}

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">
          {bio}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#f4eadb] pt-4">
          <Link
            to={`/artisans/${encodeURIComponent(slug || id || "")}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8b5e3c] transition hover:text-[#70472c]"
          >
            Visit Studio
            <ArrowRight size={16} />
          </Link>

          <Link
            to={`/shop?artisan=${encodeURIComponent(id || "")}`}
            className="text-xs font-medium text-stone-500 underline transition hover:text-[#8b5e3c]"
          >
            All products
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArtisanCard;
