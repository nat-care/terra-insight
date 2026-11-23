// ข้อมูล mock + ฟังก์ชันคำนวณของหน้าเปรียบเทียบเขต — คะแนนแต่ละด้านเป็น 1–5
export const FEATURES = [
  { key: "transport", label: "การเดินทาง" },
  { key: "hospital", label: "โรงพยาบาล" },
  { key: "school", label: "โรงเรียน" },
  { key: "green", label: "พื้นที่สีเขียว" },
  { key: "shopping", label: "ของกินของใช้" },
  { key: "leisure", label: "สถานที่บันเทิง" },
];

export const mockDistricts = [
  {
    id: "bangkhen",
    name: "บางเขน",
    cluster: "Cluster 2",
    summary: "ย่านตอนเหนือ มีมหาวิทยาลัยและโรงเรียนเยอะ เชื่อมรถไฟฟ้าสายสีเขียวและสายสีชมพู",
    scores: { transport: 5, hospital: 4, school: 5, green: 3, shopping: 4, leisure: 3 },
  },
  {
    id: "ladprao",
    name: "ลาดพร้าว",
    cluster: "Cluster 2",
    summary: "ย่านที่อยู่อาศัยหนาแน่น ของกินเยอะ เดินทางสะดวกด้วยรถไฟฟ้าหลายสาย",
    scores: { transport: 5, hospital: 4, school: 4, green: 3, shopping: 5, leisure: 4 },
  },
  {
    id: "laksi",
    name: "หลักสี่",
    cluster: "Cluster 2",
    summary: "ย่านศูนย์ราชการ มีรถไฟฟ้าสายสีชมพูและสายสีแดง",
    scores: { transport: 4, hospital: 4, school: 4, green: 3, shopping: 3, leisure: 2 },
  },
  {
    id: "chatuchak",
    name: "จตุจักร",
    cluster: "Cluster 1",
    summary: "มีสวนสาธารณะขนาดใหญ่ ใกล้โรงพยาบาล และเป็นจุดเชื่อมต่อการเดินทาง",
    scores: { transport: 5, hospital: 5, school: 5, green: 5, shopping: 5, leisure: 4 },
  },
  {
    id: "huaikhwang",
    name: "ห้วยขวาง",
    cluster: "Cluster 1",
    summary: "ใกล้ย่านสำนักงาน ร้านอาหารและสถานบันเทิงเยอะ",
    scores: { transport: 5, hospital: 5, school: 4, green: 2, shopping: 5, leisure: 5 },
  },
  {
    id: "bangna",
    name: "บางนา",
    cluster: "Cluster 3",
    summary: "ย่านช้อปปิ้งขนาดใหญ่ ติดรถไฟฟ้าสายสีเขียว",
    scores: { transport: 4, hospital: 4, school: 4, green: 3, shopping: 5, leisure: 4 },
  },
  {
    id: "phasicharoen",
    name: "ภาษีเจริญ",
    cluster: "Cluster 3",
    summary: "ย่านที่อยู่อาศัยฝั่งธน มีรถไฟฟ้าสายสีน้ำเงิน ตลาดและห้างใกล้บ้าน",
    scores: { transport: 4, hospital: 4, school: 4, green: 3, shopping: 4, leisure: 3 },
  },
  {
    id: "bangkhae",
    name: "บางแค",
    cluster: "Cluster 3",
    summary: "ย่านชุมชนฝั่งธน ค่าครองชีพไม่สูง มีตลาดและห้างใหญ่",
    scores: { transport: 4, hospital: 4, school: 4, green: 3, shopping: 4, leisure: 2 },
  },
  {
    id: "talingchan",
    name: "ตลิ่งชัน",
    cluster: "Cluster 3",
    summary: "ย่านสวนฝั่งธน บรรยากาศสงบ พื้นที่สีเขียวเยอะ",
    scores: { transport: 2, hospital: 4, school: 4, green: 4, shopping: 3, leisure: 3 },
  },
];

// ["ก", "ข", "ค"] → "ก ข และค"
function joinThai(words) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(" ")} และ${words.at(-1)}`;
}

export function findDistrict(id) {
  return mockDistricts.find((d) => d.id === id);
}

// แบ่งแต่ละด้านเป็น เหมือนกัน / ดีกว่า / ด้อยกว่า (มองจากเขตที่เลือก เทียบกับต้นแบบ)
function splitFeatures(base, other) {
  const same = [];
  const better = [];
  const worse = [];

  for (const f of FEATURES) {
    const b = base.scores[f.key];
    const o = other.scores[f.key];
    const note = `${other.name} ${o}/5 · ${base.name} ${b}/5`;

    if (o === b) same.push({ ...f, note: `ทั้งคู่ได้ ${b}/5` });
    else if (o > b) better.push({ ...f, note });
    else worse.push({ ...f, note });
  }

  return { same, better, worse };
}

function similarityScore(a, b) {
  const totalDiff = FEATURES.reduce(
    (sum, f) => sum + Math.abs(a.scores[f.key] - b.scores[f.key]),
    0
  );
  const maxDiff = FEATURES.length * 4; // คะแนน 1–5 ต่างกันได้มากสุด 4
  return Math.round((1 - totalDiff / maxDiff) * 100);
}

function similarityLabel(score) {
  if (score >= 85) return "คล้ายมาก";
  if (score >= 70) return "คล้าย";
  return "คล้ายบ้าง";
}

export function getBaseTags(district) {
  return FEATURES.filter((f) => district.scores[f.key] >= 4).map(
    (f) => `เด่นเรื่อง${f.label}`
  );
}

export function findSimilarDistricts(base, sameClusterOnly, limit = 5) {
  return mockDistricts
    .filter((d) => d.id !== base.id)
    .filter((d) => !sameClusterOnly || d.cluster === base.cluster)
    .map((d) => {
      const score = similarityScore(base, d);
      const { same } = splitFeatures(base, d);

      return {
        ...d,
        score,
        label: similarityLabel(score),
        reason: same.length
          ? `เหมือนกันเรื่อง${joinThai(same.slice(0, 3).map((f) => f.label))}`
          : "ภาพรวมใกล้เคียงกัน",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function compareDistricts(base, other) {
  const groups = splitFeatures(base, other);
  const labels = (list) => joinThai(list.map((f) => f.label));
  const parts = [];

  if (groups.same.length) parts.push(`${other.name}คล้าย${base.name}เรื่อง${labels(groups.same)}`);
  else parts.push(`${other.name}ต่างจาก${base.name}ในทุกด้าน`);
  if (groups.better.length) parts.push(`มี${labels(groups.better)}ดีกว่า`);
  if (groups.worse.length) parts.push(`แต่${labels(groups.worse)}ด้อยกว่า`);

  return { summary: parts.join(" "), ...groups };
}