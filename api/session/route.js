// POST /api/session/route — admin sessiyasida Module 1 javoblaridan
// Module 2 yo'nalishini aniqlaydi.
//   body: { sessionId, sectionId, module1Answers } -> { route }
import { requireUser, HttpError } from "../../server/firebaseAdmin.js";
import { handle, json, readJson } from "../../server/http.js";
import { routeFor } from "../../server/satScoring.js";
import { loadSessionSections, requireParticipant } from "../../server/sessionContent.js";

export const POST = handle(async (request) => {
  const user = await requireUser(request);
  const { sessionId, sectionId, module1Answers } = await readJson(request);
  await requireParticipant(sessionId, user.uid);
  const { sections } = await loadSessionSections(sessionId);
  const section = sections.find((s) => s.id === sectionId);
  if (!section) throw new HttpError(404, "Bo'lim topilmadi");
  return json({ route: routeFor(section, module1Answers) });
});
