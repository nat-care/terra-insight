// ฟังก์ชันคำนวณของหน้าเปรียบเทียบเขต — ใช้ผลจากโมเดล Terra Insight เป็นหลัก
//
// ข้อมูลแต่ละเขต (มาจาก backend) มี
// - population        ประชากรทั้งเขต (ฟีเจอร์ population ของโมเดล)
// - nearby_average    ค่าเฉลี่ยจำนวนสถานที่ในรัศมี 1 กม. ของทุกจุดในเขต (ฟีเจอร์ที่เหลือของโมเดล)
// - group_shares      สัดส่วนจุดในเขตที่ Random Forest จัดให้อยู่แต่ละกลุ่ม (0–9)
// - dominant_group    กลุ่มที่มีสัดส่วนมากที่สุด

// ชื่อและคำอธิบายของฟีเจอร์ — key ต้องตรงกับ feature_columns ของโมเดล
export const FEATURES = [
  { key: "population", label: "ประชากร", unit: "คน", tag: "ประชากรมาก" },
  { key: "temples", label: "วัด", unit: "แห่ง", tag: "วัดเยอะ" },
  { key: "malls", label: "ห้างสรรพสินค้า", unit: "แห่ง", tag: "ใกล้ห้าง" },
  { key: "health", label: "ศูนย์บริการสาธารณสุข", unit: "แห่ง", tag: "ใกล้ศูนย์สาธารณสุข" },
  { key: "risk", label: "จุดเสี่ยงที่มีการบันทึก", unit: "จุด", tag: "จุดเสี่ยงเยอะ" },
  { key: "schools", label: "โรงเรียน", unit: "แห่ง", tag: "โรงเรียนเยอะ" },
  { key: "universities", label: "มหาวิทยาลัย", unit: "แห่ง", tag: "ใกล้มหาวิทยาลัย" },
];

// ชื่อกลุ่มภาษาไทย — ผูกกับชื่ออังกฤษใน GROUP_NAMES ของ train_and_save_model.py
// ถ้าโมเดลถูกเทรนใหม่แล้วชื่อกลุ่มเปลี่ยน จะแสดงชื่ออังกฤษจากโมเดลแทน เพื่อไม่ให้ชื่อไทยผิดกลุ่ม
const GROUP_LABELS_TH = {
  0: ["School and Temple Areas", "ย่านโรงเรียนและวัด"],
  1: ["Temple Areas with Many Recorded Risk Points", "ย่านวัดที่มีจุดเสี่ยงบันทึกไว้มาก"],
  2: ["Populous Districts with Nearby Health Centers", "เขตประชากรมาก ใกล้ศูนย์สาธารณสุข"],
  3: ["Mall and University Areas", "ย่านห้างและมหาวิทยาลัย"],
  4: ["Populous Districts with Few Nearby Schools", "เขตประชากรมาก โรงเรียนใกล้ ๆ น้อย"],
  5: ["Health Center Areas with Few Recorded Risk Points", "ย่านศูนย์สาธารณสุข จุดเสี่ยงน้อย"],
  6: ["Areas with Few Nearby Schools and Temples", "ย่านที่โรงเรียนและวัดใกล้ ๆ น้อย"],
  7: ["Temple-Heavy Areas with Several Schools", "ย่านวัดหนาแน่น มีโรงเรียนหลายแห่ง"],
  8: ["University and School Areas", "ย่านมหาวิทยาลัยและโรงเรียน"],
  9: ["Mall Areas with Few Nearby Schools", "ย่านห้าง โรงเรียนใกล้ ๆ น้อย"],
};

// ต่างกันไม่ถึง 0.25 SD (เทียบทุกเขต) ถือว่าเหมือนกัน — เกณฑ์เดียวกับ train_random_forest.py
const SAME_THRESHOLD_SD = 0.25;
// สูงกว่าค่าเฉลี่ยทุกเขตเกิน 0.5 SD ถือว่าเป็นจุดเด่นของเขต
const TAG_THRESHOLD_SD = 0.5;

const formatNumber = (n, digits = 0) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: digits });

function joinThai(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(" ")} และ${items.at(-1)}`;
}

function featureValue(district, key) {
  return key === "population" ? district.population : district.nearby[key];
}

function formatFeature(feature, value) {
  if (value == null) return "ไม่มีข้อมูล";
  if (feature.key === "population") return `${formatNumber(value)} ${feature.unit}`;
  return `เฉลี่ย ${formatNumber(value, 1)} ${feature.unit}`;
}

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

/**
 * แปลงข้อมูลจาก API ให้อยู่ในรูปที่หน้าเปรียบเทียบใช้
 * เขตที่ไม่มีจุดข้อมูลเลยจะไม่ถูกนำมาเปรียบเทียบ เพราะโมเดลไม่ได้จัดกลุ่มให้
 */
export function buildCompareModel(data) {
  const modelGroups = new Map(data.meta.groups.map((g) => [Number(g.id), g.name]));
  const features = FEATURES.filter((f) => data.meta.feature_columns.includes(f.key));

  const groups = [...modelGroups].map(([id, name]) => {
    const [expectedName, thai] = GROUP_LABELS_TH[id] ?? [];
    return { id, name: expectedName === name ? thai : name };
  });
  const groupById = new Map(groups.map((g) => [g.id, g]));

  const districts = data.districts
    .filter((d) => d.location_count > 0 && d.dominant_group != null)
    .map((d) => ({
      id: d.id,
      name: d.name,
      population: d.population,
      locationCount: d.location_count,
      nearby: d.nearby_average,
      shares: Object.fromEntries(
        Object.entries(d.group_shares).map(([id, share]) => [Number(id), share])
      ),
      group: groupById.get(Number(d.dominant_group)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "th"));

  // ค่าเฉลี่ยและ SD ของแต่ละฟีเจอร์ข้ามทุกเขต ใช้ตัดสินว่า "เหมือน" หรือ "เด่น"
  const stats = Object.fromEntries(
    features.map((f) => {
      const values = districts.map((d) => featureValue(d, f.key)).filter((v) => v != null);
      return [f.key, { mean: mean(values), sd: standardDeviation(values) || 1 }];
    })
  );

  return {
    districts,
    groups,
    features,
    stats,
    radiusKm: data.meta.nearby_radius_km,
    generatedAt: data.meta.generated_at,
  };
}

export function findDistrict(model, id) {
  return model.districts.find((d) => d.id === id);
}

function standardized(model, district, key) {
  const value = featureValue(district, key);
  const { mean: m, sd } = model.stats[key];
  return value == null ? null : (value - m) / sd;
}

// ความคล้าย = สัดส่วนกลุ่มจากโมเดลที่ทับซ้อนกัน (ผลรวมของค่าน้อยกว่าในแต่ละกลุ่ม)
function groupOverlap(model, a, b) {
  return model.groups.reduce(
    (sum, g) => sum + Math.min(a.shares[g.id] ?? 0, b.shares[g.id] ?? 0),
    0
  );
}

// ใช้แยกลำดับเมื่อสัดส่วนกลุ่มเท่ากัน — ระยะห่างของฟีเจอร์ที่ scale แล้ว
function featureDistance(model, a, b) {
  return Math.sqrt(
    model.features.reduce((sum, f) => {
      const za = standardized(model, a, f.key);
      const zb = standardized(model, b, f.key);
      return za == null || zb == null ? sum : sum + (za - zb) ** 2;
    }, 0)
  );
}

function similarityLabel(score) {
  if (score >= 75) return "คล้ายมาก";
  if (score >= 50) return "คล้าย";
  return "คล้ายบ้าง";
}

function sharedGroups(model, a, b, limit = 2) {
  return model.groups
    .map((g) => ({ ...g, share: Math.min(a.shares[g.id] ?? 0, b.shares[g.id] ?? 0) }))
    .filter((g) => g.share > 0)
    .sort((x, y) => y.share - x.share)
    .slice(0, limit);
}

export function getBaseTags(model, district) {
  return model.features
    .filter((f) => (standardized(model, district, f.key) ?? 0) >= TAG_THRESHOLD_SD)
    .map((f) => f.tag);
}

export function describeBase(model, district) {
  const share = Math.round((district.shares[district.group.id] ?? 0) * 100);
  return `โมเดลจัด ${share}% ของ ${formatNumber(district.locationCount)} จุดในเขตนี้เป็น “${district.group.name}”`;
}

// แบ่งแต่ละฟีเจอร์เป็น เหมือนกัน / มีมากกว่า / มีน้อยกว่า (มองจากเขตที่เลือก เทียบกับต้นแบบ)
function splitFeatures(model, base, other) {
  const same = [];
  const more = [];
  const less = [];

  for (const f of model.features) {
    const zb = standardized(model, base, f.key);
    const zo = standardized(model, other, f.key);
    if (zb == null || zo == null) continue;

    const b = formatFeature(f, featureValue(base, f.key));
    const o = formatFeature(f, featureValue(other, f.key));
    const note = `${other.name} ${o} · ${base.name} ${b}`;

    if (Math.abs(zo - zb) < SAME_THRESHOLD_SD) same.push({ ...f, note });
    else if (zo > zb) more.push({ ...f, note });
    else less.push({ ...f, note });
  }

  return { same, more, less };
}

export function findSimilarDistricts(model, base, sameGroupOnly, limit = 5) {
  return model.districts
    .filter((d) => d.id !== base.id)
    .filter((d) => !sameGroupOnly || d.group.id === base.group.id)
    .map((d) => {
      const score = Math.round(groupOverlap(model, base, d) * 100);
      const shared = sharedGroups(model, base, d);

      return {
        ...d,
        score,
        distance: featureDistance(model, base, d),
        label: similarityLabel(score),
        reason: shared.length
          ? `มีพื้นที่แบบ ${shared.map((g) => `“${g.name}”`).join(" และ ")} เหมือนกัน`
          : "กลุ่มพื้นที่ต่างกัน แต่ใกล้เคียงที่สุดเท่าที่มี",
      };
    })
    .sort((a, b) => b.score - a.score || a.distance - b.distance)
    .slice(0, limit);
}

export function compareDistricts(model, base, other) {
  const groups = splitFeatures(model, base, other);
  const labels = (list) => joinThai(list.map((f) => f.label));
  const parts = [];

  if (base.group.id === other.group.id) {
    parts.push(`ทั้งสองเขตอยู่ในกลุ่ม “${base.group.name}” เป็นหลัก`);
  } else {
    parts.push(
      `${base.name}เป็น “${base.group.name}” เป็นหลัก ส่วน${other.name}เป็น “${other.group.name}”`
    );
  }

  if (groups.same.length) parts.push(`ใกล้เคียงกันเรื่อง${labels(groups.same)}`);
  if (groups.more.length) parts.push(`${other.name}มี${labels(groups.more)}มากกว่า`);
  if (groups.less.length) parts.push(`แต่มี${labels(groups.less)}น้อยกว่า`);

  return { summary: parts.join(" "), ...groups };
}