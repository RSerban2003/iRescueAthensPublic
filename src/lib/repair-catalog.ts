/**
 * Repair issue types offered in the booking flow.
 * Labels translated from the original Greek:
 * - "Επισκευή Οθόνης" -> Screen repair
 * - "Αντικατάσταση Μπαταρίας" -> Battery replacement
 * - "Επισκευή Κάμερας" -> Camera repair
 * - "Επισκευή Θύρας Φόρτισης" -> Charging port repair
 * - "Πίσω καπάκι / πλαίσιο" -> Back cover / frame
 */
export const REPAIR_ISSUES = [
  { key: "screen", label: "Screen repair" },
  { key: "battery", label: "Battery replacement" },
  { key: "camera", label: "Camera repair" },
  { key: "charging", label: "Charging port repair" },
  { key: "backCover", label: "Back cover / frame" },
  { key: "other", label: "Something else" },
] as const;

export type RepairIssueKey = (typeof REPAIR_ISSUES)[number]["key"];

export interface PhoneModelPricing {
  /** Model name, e.g. "iPhone 13 Pro" */
  model: string;
  /** Price in EUR per issue; omit issues with no listed price */
  prices: Partial<Record<Exclude<RepairIssueKey, "other">, number>>;
}

/**
 * Repair price list in EUR. Extracted from the original booking flow;
 * demo data — adjust to real prices before production use.
 *
 * Notes on the source data:
 * - Screen prices use the first listed option per model ("hq" for Apple,
 *   "original" for Samsung/Xiaomi), matching the original page's behavior.
 * - Issues priced 0 in the source (treated as "contact us") are omitted.
 * - Samsung had no camera prices; older iPhones had no back-cover prices;
 *   Xiaomi only listed screen and battery prices.
 */
export const REPAIR_CATALOG: Record<string, PhoneModelPricing[]> = {
  Apple: [
    { model: "iPhone 15 Pro", prices: { screen: 319, battery: 79, camera: 179, charging: 179, backCover: 169 } },
    { model: "iPhone 15 Pro Max", prices: { screen: 369, battery: 79, camera: 179, charging: 189, backCover: 179 } },
    { model: "iPhone 15", prices: { screen: 249, battery: 79, camera: 149, charging: 159, backCover: 149 } },
    { model: "iPhone 15 Plus", prices: { screen: 279, battery: 79, camera: 149, charging: 169, backCover: 159 } },
    { model: "iPhone 14 Pro", prices: { screen: 299, battery: 69, camera: 259, charging: 85, backCover: 299 } },
    { model: "iPhone 14 Pro Max", prices: { screen: 339, battery: 69, camera: 259, charging: 85, backCover: 319 } },
    { model: "iPhone 14", prices: { screen: 199, battery: 69, camera: 249, charging: 89, backCover: 139 } },
    { model: "iPhone 14 Plus", prices: { screen: 219, battery: 69, camera: 249, charging: 79, backCover: 129 } },
    { model: "iPhone 13 Pro", prices: { screen: 249, battery: 55, camera: 219, charging: 89, backCover: 219 } },
    { model: "iPhone 13 Pro Max", prices: { screen: 279, battery: 55, camera: 169, charging: 89, backCover: 179 } },
    { model: "iPhone 13", prices: { screen: 179, battery: 55, camera: 239, charging: 79, backCover: 199 } },
    { model: "iPhone 13 Mini", prices: { screen: 169, battery: 55, camera: 119, charging: 79, backCover: 149 } },
    { model: "iPhone 12 Pro", prices: { screen: 189, battery: 49, camera: 99, charging: 69, backCover: 159 } },
    { model: "iPhone 12 Pro Max", prices: { screen: 219, battery: 55, camera: 159, charging: 69, backCover: 179 } },
    { model: "iPhone 12", prices: { screen: 189, battery: 49, camera: 99, charging: 69, backCover: 149 } },
    { model: "iPhone 12 Mini", prices: { screen: 149, battery: 49, camera: 159, charging: 69, backCover: 139 } },
    { model: "iPhone 11 Pro", prices: { screen: 129, battery: 55, camera: 109, charging: 69, backCover: 119 } },
    { model: "iPhone 11 Pro Max", prices: { screen: 159, battery: 55, camera: 109, charging: 69, backCover: 139 } },
    { model: "iPhone 11", prices: { screen: 69, battery: 49, camera: 69, charging: 49, backCover: 99 } },
    { model: "iPhone XR", prices: { screen: 79, battery: 49, camera: 69, charging: 49 } },
    { model: "iPhone X", prices: { screen: 99, battery: 49, camera: 69, charging: 49 } },
    { model: "iPhone XS", prices: { screen: 109, battery: 49, camera: 79, charging: 49 } },
    { model: "iPhone XS Max", prices: { screen: 119, battery: 49, camera: 79, charging: 49 } },
    { model: "iPhone 8", prices: { screen: 59, battery: 39, camera: 59, charging: 49 } },
    { model: "iPhone 8 Plus", prices: { screen: 59, battery: 39, camera: 69, charging: 49 } },
    { model: "iPhone 7", prices: { screen: 49, battery: 39, camera: 59, charging: 49 } },
    { model: "iPhone 7 Plus", prices: { screen: 59, battery: 39, camera: 79, charging: 49 } },
    { model: "iPhone 6", prices: { screen: 49, battery: 39, camera: 39, charging: 39 } },
    { model: "iPhone 6 Plus", prices: { screen: 55, battery: 39, camera: 39, charging: 39 } },
    { model: "iPhone 6s", prices: { screen: 59, battery: 39, camera: 39, charging: 39 } },
    { model: "iPhone 6s Plus", prices: { screen: 59, battery: 39, camera: 39, charging: 39 } },
    { model: "iPhone SE 2020", prices: { screen: 59, battery: 59, camera: 69, charging: 69 } },
    { model: "iPhone SE 2022", prices: { screen: 59, battery: 59, camera: 69, charging: 69 } },
  ],
  Samsung: [
    { model: "S24 Ultra", prices: { screen: 420, battery: 89, charging: 79, backCover: 75 } },
    { model: "S24 Plus", prices: { screen: 259, battery: 79, charging: 79, backCover: 70 } },
    { model: "S24", prices: { screen: 229, battery: 79, charging: 79, backCover: 70 } },
    { model: "S23 Ultra", prices: { screen: 439, battery: 89, charging: 79, backCover: 79 } },
    { model: "S23 Plus", prices: { screen: 239, battery: 79, charging: 75, backCover: 69 } },
    { model: "S23", prices: { screen: 229, battery: 79, charging: 69, backCover: 69 } },
    { model: "S22 Ultra", prices: { screen: 310, battery: 79, charging: 69, backCover: 79 } },
    { model: "S22 Plus", prices: { screen: 215, battery: 69, charging: 69, backCover: 69 } },
    { model: "S22", prices: { screen: 209, battery: 69, charging: 65, backCover: 69 } },
    { model: "S21 Ultra", prices: { screen: 349, battery: 69, charging: 65, backCover: 79 } },
    { model: "S21 Plus", prices: { screen: 229, battery: 69, charging: 60, backCover: 59 } },
    { model: "S21", prices: { screen: 219, battery: 65, charging: 60, backCover: 69 } },
    { model: "S21 FE", prices: { screen: 179, battery: 69, charging: 60, backCover: 59 } },
    { model: "S20 Ultra", prices: { screen: 269, battery: 69, charging: 65, backCover: 69 } },
    { model: "S20 Plus", prices: { screen: 249, battery: 69, charging: 65, backCover: 69 } },
    { model: "S20", prices: { screen: 249, battery: 69, charging: 59, backCover: 65 } },
    { model: "S20 FE 4G", prices: { screen: 149, battery: 59, charging: 59, backCover: 65 } },
    { model: "S20 FE 5G", prices: { screen: 149, battery: 59, charging: 59, backCover: 65 } },
    { model: "S10", prices: { screen: 219, battery: 60, charging: 69, backCover: 49 } },
    { model: "S10 5G", prices: { screen: 249, battery: 65, charging: 69, backCover: 49 } },
    { model: "S10 Plus", prices: { screen: 259, battery: 69, charging: 79, backCover: 59 } },
    { model: "S10 Lite", prices: { screen: 169, battery: 65, charging: 69, backCover: 59 } },
    { model: "S10 e", prices: { screen: 189, battery: 65, charging: 69, backCover: 59 } },
    { model: "S9", prices: { screen: 200, battery: 59, charging: 69, backCover: 59 } },
    { model: "S9 Plus", prices: { screen: 219, battery: 59, charging: 79, backCover: 59 } },
    { model: "S8", prices: { screen: 189, battery: 59, charging: 59, backCover: 59 } },
    { model: "S8 Plus", prices: { screen: 209, battery: 59, charging: 59, backCover: 59 } },
    { model: "Note 20 Ultra", prices: { screen: 339, battery: 69, charging: 55, backCover: 59 } },
    { model: "Note20", prices: { screen: 229, battery: 69, charging: 55, backCover: 59 } },
    { model: "Note 10 lite", prices: { screen: 200, battery: 65, charging: 55, backCover: 59 } },
    { model: "Note 10 Plus", prices: { screen: 310, battery: 65, charging: 55, backCover: 59 } },
    { model: "Note 10", prices: { screen: 259, battery: 60, charging: 55, backCover: 59 } },
    { model: "Note 9", prices: { screen: 249, battery: 60, charging: 59, backCover: 49 } },
    { model: "Note 8", prices: { screen: 239, battery: 60, charging: 69, backCover: 49 } },
    { model: "Galaxy A(2015)", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Galaxy A(2016)", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Galaxy A(2017)", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Galaxy A(2018)", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax0", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax1", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax2", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax3", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax4", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax5", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Ax6", prices: { screen: 160, battery: 70, charging: 70, backCover: 70 } },
    { model: "Z Flip 4", prices: { screen: 480, battery: 89, charging: 79, backCover: 79 } },
    { model: "Z Flip 5", prices: { screen: 480, battery: 89, charging: 79, backCover: 79 } },
    // Z Fold screens: source listed "original" (used here) and a cheaper
    // "with frame" option (Fold 4: 210, Fold 5: 180) that is not representable
    // in this single-price schema.
    { model: "Z Fold 4", prices: { screen: 699, battery: 89, charging: 79, backCover: 79 } },
    { model: "Z Fold 5", prices: { screen: 669, battery: 89, charging: 79, backCover: 79 } },
  ],
  Xiaomi: [
    { model: "Redmi Note 8 Pro", prices: { screen: 79, battery: 59 } },
    { model: "Redmi Note 9 Pro", prices: { screen: 79, battery: 49 } },
    { model: "Redmi Note 9", prices: { screen: 79, battery: 49 } },
    { model: "Redmi Note 10 Pro 5G", prices: { screen: 110, battery: 49 } },
    { model: "Redmi Note 10 5G", prices: { screen: 89, battery: 69 } },
    { model: "Redmi Note 11 Pro 5G", prices: { screen: 105, battery: 69 } },
    { model: "Redmi Note 11 4G", prices: { screen: 89, battery: 59 } },
    { model: "Redmi Note 11s 4G", prices: { screen: 110, battery: 59 } },
    { model: "Redmi Note 12 Pro 5G", prices: { screen: 89, battery: 59 } },
    { model: "Redmi Note 13 5G", prices: { screen: 89, battery: 49 } },
    { model: "Redmi Note 13 Pro 5G", prices: { screen: 110, battery: 69 } },
    { model: "Redmi Note 14 Pro+", prices: { screen: 129, battery: 69 } },
    { model: "Poco C65", prices: { screen: 69, battery: 55 } },
    { model: "Poco F5 5G", prices: { screen: 99, battery: 59 } },
    { model: "Poco X6 5G", prices: { screen: 159, battery: 59 } },
    { model: "Poco X6 Pro 5G", prices: { screen: 129, battery: 69 } },
    { model: "Poco M6 Pro 5G", prices: { screen: 119, battery: 69 } },
    { model: "Poco X5 Pro 5G", prices: { screen: 119, battery: 59 } },
    { model: "Poco M5s", prices: { screen: 99, battery: 59 } },
    // Present in the source pricing data (not in the model selector); all
    // prices were marked 0 ("contact us"), so none are listed.
    { model: "Mi 13 Pro", prices: {} },
  ],
};

export const REPAIR_BRANDS = Object.keys(REPAIR_CATALOG);
