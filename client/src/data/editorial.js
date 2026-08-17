const img = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const heroImage = img("photo-1490481651871-ab68de25d43d", 2000);

export const categoryTiles = [
  {
    label: "Women",
    href: "/shop/women",
    image: img("photo-1483985988355-763728e1935b"),
  },
  {
    label: "Men",
    href: "/shop/men",
    image: img("photo-1516257984-b1b4d707412e"),
  },
  {
    label: "Accessories",
    href: "/shop/accessories",
    image: img("photo-1524592094714-0f0654e20314"),
  },
];

export const storyImage = img("photo-1509631179647-0177331693ae", 1800);

export const campaignImage = img("photo-1490114538077-0a7f8cb49889", 2000);

export const galleryImages = [
  img("photo-1445205170230-053b83016050"),
  img("photo-1487222477894-8943e31ef7b2"),
  img("photo-1509631179647-0177331693ae"),
  img("photo-1552374196-c4e7ffc6e126"),
  img("photo-1483985988355-763728e1935b"),
];

export const whyVeloraItems = [
  {
    index: "01",
    title: "Premium Materials",
    description:
      "Sourced from long-standing mills across Europe — natural fibers, considered weight, built to soften with age rather than wear out.",
    image: img("photo-1445205170230-053b83016050"),
  },
  {
    index: "02",
    title: "Thoughtful Design",
    description:
      "Every silhouette is developed over multiple fittings, refined until the line is quiet and the proportions feel inevitable.",
    image: img("photo-1490481651871-ab68de25d43d"),
  },
  {
    index: "03",
    title: "Easy Returns",
    description:
      "30 days to live with a piece before deciding. Free returns, no restocking fee, no questions.",
    image: img("photo-1441986300917-64674bd600d8"),
  },
  {
    index: "04",
    title: "Worldwide Shipping",
    description:
      "Dispatched from our studio within 48 hours, with tracked delivery to more than 40 countries.",
    image: img("photo-1483985988355-763728e1935b"),
  },
];

export const testimonials = [
  {
    quote:
      "The quality exceeded my expectations. The fit is perfect and the fabric feels incredible.",
    author: "Sarah M.",
    rating: 5,
  },
  {
    quote:
      "Every piece I've ordered has become something I reach for constantly. Considered, quiet, well made.",
    author: "Daniel R.",
    rating: 5,
  },
  {
    quote:
      "Shipping was fast and the packaging alone felt like a luxury unboxing. The coat is stunning in person.",
    author: "Amara K.",
    rating: 5,
  },
  {
    quote:
      "I was skeptical about ordering tailoring online, but the sizing guide was spot on. Fits beautifully.",
    author: "Leo T.",
    rating: 5,
  },
];
