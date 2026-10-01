import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Amaliyot to'plamidagi rasmlar questionSets/{setId}/images/{imageId}
// hujjatlarida saqlanadi, savolda esa faqat "img:{imageId}" havolasi.
// Sabab: Firestore hujjati ≤ 1 MiB — base64 rasmlar asosiy hujjatda
// bo'lsa, bir necha rasmli savoldan keyin to'plamni saqlab bo'lmaydi.
const REF = "img:";

const imagesCol = (setId) => collection(db, "questionSets", setId, "images");
const isRef = (image) => typeof image === "string" && image.startsWith(REF);

const mapQuestions = (sections, fn) =>
  (sections || []).map((sec) => ({ ...sec, questions: (sec.questions || []).map(fn) }));

// Savollardagi data URL rasmlarni alohida hujjatlarga yozadi va ularni
// havolaga almashtiradi. Bir xil rasm qayta yuklanmaydi. `removeUnused`
// — asosiy hujjat saqlangandan keyin chaqiriladi (endi ishlatilmaydigan
// rasmlarni o'chiradi).
export async function storeSetImages(setId, sections) {
  const hasNewImages = (sections || []).some((sec) =>
    (sec.questions || []).some((q) => typeof q.image === "string" && q.image.startsWith("data:"))
  );
  let snap;
  try {
    snap = await getDocs(imagesCol(setId));
  } catch (err) {
    // Yangi rasm bo'lmasa, rasm kolleksiyasiga kirish shart emas
    // (masalan, rules hali yangilanmagan) — to'plam baribir saqlansin.
    if (hasNewImages) throw err;
    return { sections, removeUnused: async () => {} };
  }
  const idByData = new Map(snap.docs.map((d) => [d.data().data, d.id]));
  const used = new Set();
  const uploads = [];

  const stored = mapQuestions(sections, (q) => {
    if (isRef(q.image)) {
      used.add(q.image.slice(REF.length));
      return q;
    }
    if (typeof q.image !== "string" || !q.image.startsWith("data:")) return q;
    let id = idByData.get(q.image);
    if (!id) {
      const ref = doc(imagesCol(setId));
      id = ref.id;
      idByData.set(q.image, id);
      uploads.push(setDoc(ref, { data: q.image }));
    }
    used.add(id);
    return { ...q, image: REF + id };
  });

  await Promise.all(uploads);
  const unused = snap.docs.filter((d) => !used.has(d.id));
  return {
    sections: stored,
    removeUnused: () => Promise.all(unused.map((d) => deleteDoc(d.ref))),
  };
}

// "img:" havolalarni rasmning o'ziga (data URL) almashtiradi. Havola
// bo'lmasa (eski to'plamlar) hech narsa yuklanmaydi.
export async function loadSetImages(setId, sections) {
  const needsImages = (sections || []).some((sec) => (sec.questions || []).some((q) => isRef(q.image)));
  if (!needsImages) return sections;
  const snap = await getDocs(imagesCol(setId));
  const dataById = new Map(snap.docs.map((d) => [d.id, d.data().data]));
  return mapQuestions(sections, (q) =>
    isRef(q.image) ? { ...q, image: dataById.get(q.image.slice(REF.length)) || null } : q
  );
}

export async function deleteSetImages(setId) {
  const snap = await getDocs(imagesCol(setId));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
