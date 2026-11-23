// mock ข้อมูลหน้าเปรียบเทียบเขต — คะแนนแต่ละด้านเป็น 1–5
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