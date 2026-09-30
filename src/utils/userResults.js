import { collection, getCountFromServer, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../firebase/config";

// Userning natijalari (results / ieltsResults), yangidan eskiga, sahifalab.
// Firestore bepul tarifida o'qishlar kuniga 50k — shuning uchun hech qachon
// barcha natijalarni birdaniga yuklamaymiz.
// Composite index kerak: uid ASC + createdAt DESC (firestore.indexes.json).
export async function fetchUserResults(coll, uid, { pageSize = 20, after = null } = {}) {
  const snap = await getDocs(
    query(
      collection(db, coll),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      ...(after ? [startAfter(after)] : []),
      limit(pageSize)
    )
  );
  return {
    items: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    cursor: snap.docs.at(-1) || null,
    hasMore: snap.docs.length === pageSize,
  };
}

// Jami soni — hujjatlarni yuklamasdan (1000 tagacha — 1 o'qish).
export async function countUserResults(coll, uid) {
  const snap = await getCountFromServer(query(collection(db, coll), where("uid", "==", uid)));
  return snap.data().count;
}
