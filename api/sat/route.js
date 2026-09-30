// POST /api/sat/route — Module 1 javoblaridan Module 2 yo'nalishini
// (oson/qiyin) aniqlaydi. Hech narsa yozmaydi.
//   body: { testId, sectionId, module1Answers }  ->  { route }
import { requireUser, HttpError } from "../../server/firebaseAdmin.js";
import { handle, json, readJson } from "../../server/http.js";
import { getStaticSections, routeFor } from "../../server/satScoring.js";

export const POST = handle(async (request) => {
  await requireUser(request, { verified: false });
  const { testId, sectionId, module1Answers } = await readJson(request);
  const data = getStaticSections(testId);
  const section = data?.sections.find((s) => s.id === sectionId);
  if (!section) throw new HttpError(404, "Test topilmadi");
  return json({ route: routeFor(section, module1Answers) });
});
