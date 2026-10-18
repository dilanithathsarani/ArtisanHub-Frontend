import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Navbar from "../components/navBar";
import Footer from "../components/footer";
import atelierHeroImage from "../assets/about1.jpg";
import atelierPanoramImage from "../assets/about2.jpg";

function AboutPage() {
  const materials = [
    {
      code: "MAT-01",
      name: "Riverbed Terracotta & Raw Silica",
      source: "Kegalle & Kelani River Basin",
      process: "Wheel-thrown, sun-cured, and wood-kiln fired without synthetic glazes.",
    },
    {
      code: "MAT-02",
      name: "Hand-spun Cotton & Wild Silk",
      source: "Central Highlands & Kandy Weaving Villages",
      process: "Woven on wooden pit looms and tinted with botanical root dyes.",
    },
    {
      code: "MAT-03",
      name: "Reclaimed Teak & Mara Hardwood",
      source: "Galle Historic Timber Offcuts",
      process: "Carved with hand gouges and hand-rubbed with raw unrefined beeswax.",
    },
    {
      code: "MAT-04",
      name: "Beaten Brass & Sand-Cast Bronze",
      source: "Pilimathalawa Coppersmith Guilds",
      process: "Forged over charcoal embers and hand-burnished for lasting patina.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#221c17] selection:bg-[#85451e] selection:text-white">
      <Navbar />


      {/* Editorial Split Hero */}
      <section className="grid min-h-[720px] border-b border-[#221c17]/10 lg:min-h-[820px] lg:grid-cols-[48%_52%]">
        {/* Large Visual Section */}
        <div className="relative min-h-[460px] overflow-hidden bg-[#1c1815] lg:min-h-[820px]">
          <img
            src={atelierHeroImage}
            alt="An artisan working in a creative studio"
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

          {/* Exhibition Plate Label */}
          <div className="absolute left-6 top-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#e6ded5] sm:left-10 sm:top-8">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c28457]" />
            <span>PLATE 01 — THE LIVING ATELIER</span>
          </div>

          {/* Pottery Hallmark & Quote */}
          <div className="absolute bottom-8 left-6 right-6 text-[#f7f3ee] sm:bottom-12 sm:left-10 sm:right-10">
            <div className="mb-4 inline-flex items-center gap-2 border border-white/20 bg-black/40 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#d9c7b4] backdrop-blur-md">
              <span>Authentic Handwork</span>
            </div>

            <p className="max-w-md font-serif text-3xl font-normal italic leading-snug sm:text-4xl">
              “We do not mass produce; we give tangible form to human patience.”
            </p>

            <div className="mt-4 flex items-center gap-3 border-t border-white/20 pt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#c9b7a7]">
              <span>Master Artisan Collective</span>
              <span>·</span>
              <span>Central Sri Lanka</span>
            </div>
          </div>
        </div>

        {/* Editorial Content Broadsheet */}
        <div className="flex flex-col justify-between px-6 py-10 sm:px-12 sm:py-14 lg:px-[10%] lg:py-16">
          {/* Index Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#221c17]/10 pb-5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#806f60]">
            <div className="flex items-center gap-5">
              <a href="#our-story" className="transition hover:text-[#85451e]">
                01 Story
              </a>
              <a href="#manifesto" className="transition hover:text-[#85451e]">
                02 Manifesto
              </a>
              <a href="#materials" className="transition hover:text-[#85451e]">
                03 Matière
              </a>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-[#85451e] transition hover:gap-2.5"
            >
              Browse Guild Works
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* Main Title & Story */}
          <div id="our-story" className="my-auto py-12 lg:py-16">
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-xs text-[#85451e]">[01]</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#85451e]">
                An Antithesis to the Disposable
              </p>
            </div>

            <h1 className="font-serif text-6xl font-normal leading-[0.92] tracking-[-0.05em] text-[#221c17] sm:text-7xl lg:text-[clamp(4.5rem,6.5vw,7.8rem)]">
              About
              <br />
              us<span className="text-[#85451e]">.</span>
            </h1>

            <div className="mt-12 grid gap-8 sm:grid-cols-[1fr_1.1fr] sm:gap-12">
              <div>
                <p className="font-serif text-xl font-normal leading-relaxed text-[#221c17] sm:text-2xl">
                  ArtisanHub was established to safeguard the irreplaceable
                  touch of human hands.
                </p>
                <div className="mt-6 h-0.5 w-12 bg-[#85451e]" />
              </div>

              <div className="space-y-5 text-xs leading-[2] text-[#6b584a] sm:text-[13px]">
                <p>
                  In a commercial landscape inundated by identical factory
                  output, true craftsmanship carries an irreplaceable soul.
                  Every vessel turned on a wheel, every warp threaded on a loom,
                  and every mortise hand-chiseled into hardwood represents hours
                  of quiet devotion.
                </p>

                <p>
                  We built ArtisanHub not as a conventional marketplace, but as a
                  dignified guild connecting independent generational makers
                  directly with collectors who recognize the value of slow,
                  ethical creation.
                </p>

                <div className="pt-2">
                  <Link
                    to="/shop"
                    className="group inline-flex items-center gap-2 border-b border-[#221c17] pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#221c17] transition hover:border-[#85451e] hover:text-[#85451e]"
                  >
                    <span>View Handcrafted Archive</span>
                    <ArrowDownRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between border-t border-[#221c17]/10 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#806f60]">
            <span>Vol. I · The Philosophy</span>
            <span>01 / 04</span>
          </div>
        </div>
      </section>

      {/* The Artisan Manifesto (Bespoke Typographic Breakout) */}
      <section id="manifesto" className="border-b border-[#221c17]/10 bg-[#221c17] px-6 py-20 text-[#f7f3ee] sm:px-12 sm:py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c28457]">
            <span>[02]</span>
            <span>The Artisan Manifesto</span>
          </div>

          <h2 className="mt-8 font-serif text-3xl font-light leading-snug tracking-tight sm:text-5xl lg:text-6xl">
            “We reject the anonymity of conveyor belts. An object made by hand
            carries the indelible pulse of the maker&apos;s breath, the resistance
            of raw earth, and the dignity of time well spent.”
          </h2>

          <div className="mt-14 grid gap-8 border-t border-white/15 pt-10 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c28457]">
                01 / Tactile Provenance
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#c9b7a7]">
                Every creation is traceable directly to an individual artisan,
                workshop, and regional tradition.
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c28457]">
                02 / Generational Livelihood
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#c9b7a7]">
                Direct remuneration guarantees that ancestral knowledge remains
                economically viable for youth to inherit.
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c28457]">
                03 / Heirloom Endurance
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#c9b7a7]">
                Designed not for obsolescence, but to acquire character, patina,
                and emotional weight across decades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Panoramic Photographic Interlude */}
      <section className="border-b border-[#221c17]/10 px-6 py-12 sm:px-12 sm:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden bg-[#1c1815]">
          <div className="relative h-[340px] sm:h-[460px] lg:h-[540px]">
            <img
              src={atelierPanoramImage}
              alt="Handmade objects and creative materials in atelier"
              className="h-full w-full object-cover opacity-85 transition-transform duration-1000 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            {/* Curatorial Plate Inset */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-col justify-between gap-6 text-[#f7f3ee] md:flex-row md:items-end">
              <div className="max-w-xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c28457]">
                  Plate 02 · Material Sanctum
                </span>
                <h3 className="mt-3 font-serif text-2xl font-normal leading-tight text-white sm:text-4xl">
                  Every imperfection is an authentic proof of life.
                </h3>
              </div>

              <div className="border-l border-white/20 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9c7b4]">
                <p>Natural Clays · Unbleached Fiber</p>
                <p>Reclaimed Native Hardwoods</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matière & Provenance Catalog Ledger */}
      <section id="materials" className="border-b border-[#221c17]/10 px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 border-b border-[#221c17]/10 pb-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#85451e]">[03]</span>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#85451e]">
                  Materiality & Guild Disciplines
                </p>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-normal text-[#221c17] sm:text-5xl">
                The Anatomy of Handwork
              </h2>
            </div>

            <p className="max-w-sm text-xs leading-relaxed text-[#786657]">
              We source directly from native geography, respecting seasonal
              harvests, riverbed silt, and sustainable woodland practices.
            </p>
          </div>

          <div className="divide-y divide-[#221c17]/10">
            {materials.map((mat, idx) => (
              <div
                key={idx}
                className="group grid grid-cols-1 gap-4 py-8 transition-colors duration-300 hover:bg-[#efe9e1]/50 sm:grid-cols-[12%_32%_26%_30%] sm:items-center sm:px-4"
              >
                <span className="font-mono text-xs font-semibold text-[#85451e]">
                  {mat.code}
                </span>

                <div>
                  <h3 className="font-serif text-xl font-normal text-[#221c17] transition-colors group-hover:text-[#85451e]">
                    {mat.name}
                  </h3>
                </div>

                <div className="font-mono text-[11px] uppercase tracking-wider text-[#786657]">
                  {mat.source}
                </div>

                <div className="text-xs leading-relaxed text-[#5e4f43]">
                  {mat.process}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision (Architectural Dual Columns) */}
      <section className="border-b border-[#221c17]/10 px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:gap-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#85451e]">[04]</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#85451e]">
                Our Calling
              </p>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-[#221c17] sm:text-4xl">
              Rescuing the vanishing lineages of the human hand.
            </h2>
            <p className="mt-6 text-xs leading-[2.1] text-[#6b584a] sm:text-sm">
              Across villages and historic craft settlements, generations of
              master potters, weavers, and wood sculptors are facing the pressure
              to abandon their heritage for urban factory jobs. ArtisanHub exists
              to prove that handmade craftsmanship is a vital, sustainable, and
              deeply respected profession.
            </p>
          </div>

          <div className="border-t border-[#221c17]/10 pt-10 md:border-l md:border-t-0 md:pl-20 md:pt-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#85451e]">[05]</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#85451e]">
                Our Horizon
              </p>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-[#221c17] sm:text-4xl">
              Homes grounded in meaning, character, and truth.
            </h2>
            <p className="mt-6 text-xs leading-[2.1] text-[#6b584a] sm:text-sm">
              We envision living spaces filled with objects of consequence.
              When an item in your home carries a human name, a geographical
              origin, and marks of physical shaping, your relationship with
              material culture is elevated from passive consumer to mindful
              custodian.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Dialogue & Invitation */}
      <section className="bg-[#efe9e1] px-6 py-20 text-center sm:px-12 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#85451e]">
            An Invitation to Mindful Living
          </p>

          <h2 className="mt-6 font-serif text-4xl font-normal leading-tight text-[#221c17] sm:text-5xl lg:text-6xl">
            To acquire handmade is to become a custodian of human memory.
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-[#786657] sm:text-sm">
            Whether welcoming an heirloom vessel into your living space or
            submitting your workshop for guild evaluation, our door is open.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-[#221c17] px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#f7f3ee] transition hover:bg-[#85451e]"
            >
              <span>Explore The Archive</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border border-[#221c17]/30 bg-transparent px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#221c17] transition hover:bg-[#fffdf9]"
            >
              Apply as a Maker
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
