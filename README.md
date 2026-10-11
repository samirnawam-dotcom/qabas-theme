# قبس · Qabas

A Salla Twilight theme for **digital-goods stores** — game cards, in-game top-ups,
subscriptions and prepaid vouchers.

Built around one promise: **the code arrives in seconds.**

---

## Why this is not a general store theme

Almost every assumption in a normal e-commerce theme is wrong for digital goods.
Qabas replaces them:

| Normal theme | Qabas |
|---|---|
| Quantity is the main control | **Denomination** is the main control |
| Shipping address + delivery estimate | Removed entirely — replaced by the delivery promise |
| Stock = warehouse count | Stock = code availability, shown honestly |
| Checkout ends at a receipt | Checkout ends at a **designed code-delivery page** |
| Browse by category | **Search-first**, because buyers arrive knowing the product |
| Region is a variant | Region is a **store-wide selector + pre-purchase warning** |

The region warning matters commercially: a KSA card on a UAE account is the single
biggest source of refund requests in this category.

---

## The code-delivery page

`src/views/pages/thank-you.twig` is the most important screen in the theme — the
thirty seconds the buyer actually came for. It renders the voucher large in
monospace, with a QR, a copy button and a direct redeem action.

It reads codes from Salla's native digital-product fields:

- `order.items[].codes[]` — voucher codes
- `order.links[]` where `type == 'digital'` — digital file links

If no code is present yet, it shows an honest pending state rather than an empty box.

---

## Denominations

Denominations use **Salla's native product options** — no custom data model.

The merchant creates a product with an option (e.g. `الفئة`) whose details are
`25`, `50`, `100`, `200`, each with its own `additional_price`. Salla renders this
through `<salla-product-options>`; Qabas styles it as large tiles when
`qabas_denom_tiles` is on.

The first option's details also surface as chips on the product card.

## Region

Set `metadata.region` on a product (e.g. `KSA`, `UAE`, `GLOBAL`). The theme then:

1. shows it as a badge on the product card,
2. renders the pre-purchase compatibility warning on the product page.

The header selector stores the viewer's own region preference (localStorage only)
and emits a `qabas:region` DOM event. Filtering the catalogue by it is the
merchant's own integration — the theme does not fake server-side filtering.

---

## Theme settings

31 settings across six groups: identity (4 palettes × 3 densities), the delivery
promise, region and compatibility, the product page, the code-delivery page, and
general.

**Trust figures are merchant-authored.** The numbers in the metrics strip
(codes delivered, success rate) are settings, never hardcoded — the theme must not
ship claims on a merchant's behalf.

---

## Palettes

| Key | Look |
|---|---|
| `ember` | gold on near-black (default) |
| `ink` | silver on charcoal |
| `palm` | emerald on near-black |
| `dawn` | gold on light |

`dawn` is a true light design, not an inversion. Arabic diacritics and thin
letterforms punish low contrast, so contrast was raised deliberately in all four.

---

## Structure

```
twilight.json              manifest: features, 31 settings, 3 home components
public/qabas.css           design system — plain CSS, no build step
public/qabas.js            region selector, copy, QR, sticky buy bar
src/locales/{ar,en}.json   45 keys each, in parity
src/views/
  layouts/master.twig
  components/header/header.twig
  components/footer/footer.twig
  components/product/card.twig
  components/home/qabas-hero.twig
  components/home/qabas-metrics.twig
  components/home/qabas-sla.twig
  pages/index.twig
  pages/product/single.twig
  pages/thank-you.twig       ← the code-delivery page
```

**No build pipeline.** Twig themes publish directly from the repository, so
`public/` is committed as plain CSS and ES5-safe JS. A push is live immediately.

---

## Marketplace note

Ships with **no third-party branding**. No PlayStation, Xbox, Steam, iTunes or
Google Play names, logos or card artwork — that IP belongs to those companies and
cannot be redistributed in a theme sold to other merchants. Every merchant uploads
their own product imagery.

---

## Still to do

- [ ] `cart.twig` and remaining customer pages
- [ ] Category/listing page with region filter chips
- [ ] Recapture marketplace screenshots from a live preview draft (1600×1200, 4 minimum)
- [ ] Decide price (public themes: 250–50,000 SAR)
