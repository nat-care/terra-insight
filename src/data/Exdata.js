export const summaryCards = [
  { title: "จำนวนเขตทั้งหมด", unit: "เขต" },
  { title: "จำนวน Cluster", unit: "กลุ่ม" },
  { title: "จำนวนประชากร", unit: "คน" },
  { title: "จำนวนสถานที่สำคัญ", unit: "แห่ง" },
];

export const mapLayers = ["ภาพรวม", "รถไฟฟ้า", "พื้นที่สีเขียว", "ความหนาแน่น"];

export const districtPreview = [
  { name: "เขตตัวอย่าง A", population: 90000, area: 20 },
  { name: "เขตตัวอย่าง B", population: 120000, area: 10 },
  { name: "เขตตัวอย่าง C", population: 96000, area: 16 },
];

export const sampleAreas = [
  {
    name: "เขตบางเขน",
    cluster: "Cluster 2",
    distance: 4,
    factors: { safety: 4, hospital: 5, school: 5, shopping: 4, park: 3, transport: 5 },
    reasons: ["ใกล้สถานศึกษาและมหาวิทยาลัย", "เดินทางสะดวก มีรถไฟฟ้า"],
  },
  {
    name: "เขตลาดพร้าว",
    cluster: "Cluster 2",
    distance: 5,
    factors: { safety: 4, hospital: 4, school: 4, shopping: 5, park: 4, transport: 5 },
    reasons: ["มีห้างสรรพสินค้าและตลาด", "เชื่อมต่อระบบขนส่งหลายรูปแบบ"],
  },
  {
    name: "เขตจตุจักร",
    cluster: "Cluster 1",
    distance: 6,
    factors: { safety: 4, hospital: 5, school: 5, shopping: 5, park: 5, transport: 5 },
    reasons: ["มีสวนสาธารณะขนาดใหญ่", "ใกล้โรงพยาบาลและรถไฟฟ้า"],
  },
  {
    name: "เขตบางนา",
    cluster: "Cluster 3",
    distance: 8,
    factors: { safety: 4, hospital: 4, school: 4, shopping: 5, park: 3, transport: 5 },
    reasons: ["มีแหล่งช้อปปิ้งขนาดใหญ่", "เชื่อมต่อรถไฟฟ้าสายสีเขียว"],
  },
  {
    name: "เขตห้วยขวาง",
    cluster: "Cluster 1",
    distance: 7,
    factors: { safety: 3, hospital: 5, school: 4, shopping: 5, park: 3, transport: 5 },
    reasons: ["ใกล้แหล่งงานและสำนักงาน", "มีระบบขนส่งสาธารณะ"],
  },
];
