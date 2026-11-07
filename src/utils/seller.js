export const shopFields = {
  shopName: 'Shop name', bio: 'About your craft', city: 'City', district: 'District',
  country: 'Country', contactEmail: 'Contact email', contactPhone: 'Contact phone',
  logo: 'Logo image URL', bannerImage: 'Banner image URL', website: 'Website',
  facebook: 'Facebook', instagram: 'Instagram',
};

export function shopDraft(profile = {}) {
  return Object.fromEntries(Object.keys(shopFields).map(key => [key,
    typeof profile[key] === 'string' ? profile[key] : key === 'country' ? 'Sri Lanka' : '',
  ]));
}

export function validateShop(draft) {
  const errors = {};
  for (const key of ['shopName', 'bio', 'city', 'district', 'country', 'contactEmail', 'contactPhone']) {
    if (!draft[key]?.trim()) errors[key] = `${shopFields[key]} is required.`;
  }
  if (draft.shopName?.trim().length > 100) errors.shopName = 'Use at most 100 characters.';
  if (draft.bio?.trim().length > 1000) errors.bio = 'Use at most 1,000 characters.';
  if (draft.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())) errors.contactEmail = 'Enter a valid email address.';
  for (const key of ['logo', 'bannerImage', 'website', 'facebook', 'instagram']) {
    if (!draft[key]?.trim()) continue;
    try {
      if (!['http:', 'https:'].includes(new URL(draft[key].trim()).protocol)) throw new Error();
    } catch { errors[key] = 'Enter a complete HTTP or HTTPS URL.'; }
  }
  return errors;
}
