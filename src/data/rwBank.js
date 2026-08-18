// ------------------------------------------------------------------
// Reading and Writing savollar banki.
// Har modulda aniq 27 ta savol (real Digital SAT R&W moduli bilan
// bir xil son). Har biri qo'lda yozilgan.
// ------------------------------------------------------------------

let uid = 1;
const q = (passage, prompt, choices, correctAnswer) => ({
  id: uid++,
  passage,
  prompt,
  choices: choices.map((text, i) => ({ label: "ABCD"[i], text })),
  correctAnswer,
});

// ===================== MODULE 1 (o'rtacha, 27 ta) =====================
export function buildRWModule1() {
  uid = 1;
  return [
    q(
      "Although critics believed that customers would never agree to pay to pick their own produce on farms, such concerns didn't _____ Booker T. Whatley's efforts to promote the practice. Thanks in part to Whatley's advocacy, farms that allow visitors to pick their own produce can be found throughout the United States.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["enhance", "hinder", "misrepresent", "aggravate"],
      "B"
    ),
    q(
      "The oceanographer's data revealed that the coral reef's recovery, while _____, was nonetheless a promising sign after years of decline.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["rapid", "gradual", "irreversible", "conclusive"],
      "B"
    ),
    q(
      "Historian Amelia Cruz argues that the diaries of nineteenth-century mill workers offer a rare glimpse into daily labor conditions, one that official company records, written to satisfy investors, rarely provide.",
      "Which choice best describes the function of the underlined portion in the text as a whole?",
      [
        "It contrasts two sources of historical evidence.",
        "It summarizes the diaries' main argument.",
        "It questions the reliability of Cruz's research.",
        "It introduces a counterexample to Cruz's claim.",
      ],
      "A"
    ),
    q(
      "The novelist's prose is often praised for its restraint: rather than describing a character's emotion directly, she lets small physical details imply it.",
      "According to the text, what technique does the novelist use to convey emotion?",
      [
        "Direct narration of a character's feelings",
        "Dialogue between multiple characters",
        "Physical details that imply feeling",
        "Extended metaphor",
      ],
      "C"
    ),
    q(
      "Researchers studying bat echolocation found that some species adjust the frequency of their calls depending on the density of vegetation, sending higher-frequency calls in cluttered forest environments.",
      "Which finding, if true, would most directly support the researchers' conclusion?",
      [
        "Bats in open fields use lower-frequency calls than bats in dense forests.",
        "All bat species use the same call frequency regardless of habitat.",
        "Bats rely primarily on vision rather than echolocation.",
        "Vegetation density has no effect on sound wave travel.",
      ],
      "A"
    ),
    q(
      "The committee's report, though thorough, failed to address the most pressing concern raised by residents: the lack of affordable housing near the new transit line.",
      "Which choice best states the main purpose of the text?",
      [
        "To praise the committee's report",
        "To point out a gap in the committee's report",
        "To describe a new transit line",
        "To summarize resident complaints in detail",
      ],
      "B"
    ),
    q(
      "Because the ancient manuscript had been copied by hand multiple times, scholars _____ that minor transcription errors accumulated over the centuries.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["doubt", "suspect", "deny", "dismiss"],
      "B"
    ),
    q(
      "The city's new bike-share program has been praised for reducing traffic congestion; _____, some residents argue it has made sidewalks more crowded with parked bicycles.",
      "Which choice completes the text with the most logical transition?",
      ["similarly", "for example", "however", "therefore"],
      "C"
    ),
    q(
      "The engineer's proposal was rejected not because it was technically flawed but because it exceeded the project's budget by nearly forty percent.",
      "Which choice best states the main idea of the text?",
      [
        "The proposal had serious technical flaws.",
        "The proposal was rejected for financial, not technical, reasons.",
        "The project had no budget at all.",
        "The engineer refused to revise the proposal.",
      ],
      "B"
    ),
    q(
      "Marine biologist Dr. Elena Sato spent three years tracking a single pod of orcas, documenting behaviors that had never before been recorded in the wild.",
      "Which choice best describes the function of this sentence in the passage as a whole?",
      [
        "It introduces the scope and significance of Sato's research.",
        "It summarizes the conclusions of Sato's study.",
        "It criticizes previous research on orcas.",
        "It explains why orcas are difficult to study.",
      ],
      "A"
    ),
    q(
      "The museum's curators debated whether to display the fragile textile at all, given that even brief exposure to light could cause irreversible fading. The curators' final decision reflected a _____ between public access and preservation.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["compromise", "rejection", "disagreement", "coincidence"],
      "A"
    ),
    q(
      "Despite initial skepticism from investors, the startup's slow-but-steady growth strategy ultimately proved more sustainable than its competitors' rapid expansion plans.",
      "Which choice best states the main idea of the text?",
      [
        "Investors were right to be skeptical of the startup.",
        "Rapid expansion is always more effective than slow growth.",
        "The startup's cautious approach proved more sustainable.",
        "The startup's competitors avoided all risk.",
      ],
      "C"
    ),
    q(
      "The chef's tasting menu changes weekly, _____ on whatever produce is freshest at the local farmers' market.",
      "Which choice completes the text with the most logical word or phrase?",
      ["depending", "insisting", "arguing", "complaining"],
      "A"
    ),
    q(
      "A recent study found that students who took short breaks during long study sessions retained more information than those who studied continuously without pause.",
      "Which choice, if true, would most directly weaken the study's conclusion?",
      [
        "Students who took breaks also slept more on average.",
        "Students who studied continuously had less prior knowledge of the material.",
        "The study included only students from one university.",
        "Both groups reported similar levels of motivation.",
      ],
      "A"
    ),
    q(
      "The playwright's early works were dismissed by critics as overly sentimental; her later plays, however, earned acclaim for their unflinching realism.",
      "Which choice best describes the relationship between the two ideas in the text?",
      [
        "A shift in critical reception over the course of a career",
        "A comparison between two different critics",
        "An explanation of why sentimentality is undesirable",
        "A summary of the playwright's entire body of work",
      ],
      "A"
    ),
    q(
      "The volunteers, who spent their weekend clearing invasive plants from the riverbank, were surprised to find a rare species of orchid growing beneath the overgrowth.",
      "Which choice best states what the volunteers discovered?",
      ["A previously unknown river", "A rare orchid species", "A new invasive plant", "An abandoned garden"],
      "B"
    ),
    q(
      "The company's quarterly earnings exceeded analysts' expectations, yet its stock price fell sharply the following day. The drop, analysts explained, _____ reflected concerns about future growth rather than the quarter's actual results.",
      "Which choice completes the text with the most logical transition?",
      ["instead", "likewise", "consequently", "nevertheless"],
      "A"
    ),
    q(
      "The linguist's fieldwork focused on a dialect spoken by fewer than two hundred people, all of them elderly residents of a single remote village.",
      "Which choice best describes the significance of the underlined detail?",
      [
        "It suggests the dialect may soon disappear entirely.",
        "It proves the dialect is spoken widely elsewhere.",
        "It shows the linguist's fieldwork was poorly planned.",
        "It indicates the village has no other languages.",
      ],
      "A"
    ),
    q(
      "The architect insisted that the renovation preserve the building's original facade, even though doing so would significantly increase the project's cost.",
      "Which choice best states the main idea of the text?",
      [
        "The architect prioritized historical preservation over cost.",
        "The renovation was ultimately canceled.",
        "The building had no original facade to preserve.",
        "Cost was not a factor in the renovation.",
      ],
      "A"
    ),
    q(
      "The astronomer's team detected a faint radio signal that, after months of analysis, turned out to originate from a distant pulsar rather than an artificial source.",
      "Which choice best describes what the team ultimately concluded about the signal?",
      [
        "It came from an artificial source.",
        "It came from a natural astronomical object.",
        "It could not be identified at all.",
        "It was caused by equipment malfunction.",
      ],
      "B"
    ),
    q(
      "The town's only bookstore has survived for decades _____ competition from large online retailers, largely by hosting community events that big-box stores cannot replicate.",
      "Which choice completes the text with the most logical word or phrase?",
      ["despite", "because of", "regardless", "in favor of"],
      "A"
    ),
    q(
      "The two economists agree that inflation slowed last quarter but disagree sharply about which policy deserves credit for the change.",
      "Which choice best describes the relationship between the economists' views?",
      [
        "They agree on the outcome but disagree on the cause.",
        "They disagree on the outcome but agree on the cause.",
        "They agree on both the outcome and the cause.",
        "They disagree on both the outcome and the cause.",
      ],
      "A"
    ),
    q(
      "The novel's unreliable narrator withholds key information from the reader for most of the book, revealing the truth only in the final chapter.",
      "Which choice best describes the narrative technique described in the text?",
      [
        "A delayed revelation that creates suspense",
        "A straightforward chronological retelling",
        "A narrator who is fully honest throughout",
        "A story told from multiple narrators' perspectives",
      ],
      "A"
    ),
    q(
      "The city council's proposal to convert the old railway into a public park received unanimous support, a rare outcome for such a divided body.",
      "Which choice best describes the function of the underlined portion of the text?",
      [
        "It emphasizes how unusual the council's agreement was.",
        "It criticizes the council for its divisiveness.",
        "It explains why the railway was built.",
        "It describes the park's planned features.",
      ],
      "A"
    ),
    q(
      "The committee members, along with the newly elected chair, _____ scheduled to meet next Tuesday.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["is", "are", "was", "has been"],
      "B"
    ),
    q(
      "Neither the manager nor the employees _____ aware of the policy change until this morning.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["was", "were", "is", "has been"],
      "B"
    ),
    q(
      "The report, which took the team six months to complete, _____ presented at the annual conference.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["were", "was", "are", "have been"],
      "B"
    ),
  ];
}

// ===================== MODULE 2 — OSON (27 ta) =====================
export function buildRWModule2Easy() {
  uid = 1;
  return [
    q(
      "The bakery on Elm Street has become popular not because of clever advertising but because of the consistent quality of its bread.",
      "Which choice best states the main idea of the text?",
      [
        "The bakery relies mainly on advertising.",
        "The bakery's success comes from consistent quality.",
        "The bakery is located on Elm Street.",
        "The bakery sells only bread.",
      ],
      "B"
    ),
    q(
      "After the rain stopped, the children ran outside, eager to jump in the puddles that had formed along the sidewalk.",
      "Which choice best describes the children's reaction to the rain stopping?",
      ["They were disappointed.", "They were eager to play outside.", "They stayed indoors.", "They were afraid of the puddles."],
      "B"
    ),
    q(
      "The library extended its hours because so many students _____ studying there during exam week.",
      "Which choice completes the text with the most logical word or phrase?",
      ["avoided", "enjoyed", "forgot", "criticized"],
      "B"
    ),
    q(
      "The coach reminded the team that practice, not talent alone, was the reason for their recent winning streak.",
      "Which choice best states the coach's main point?",
      [
        "Talent matters more than practice.",
        "Practice, not talent alone, explains the team's success.",
        "The team has not been winning recently.",
        "The coach is unhappy with the team.",
      ],
      "B"
    ),
    q(
      "The garden club planted sunflowers along the fence because they grow quickly and add color to the neighborhood.",
      "Which choice best states why the garden club chose sunflowers?",
      ["They are difficult to grow.", "They grow quickly and add color.", "They require no sunlight.", "They are the club's only option."],
      "B"
    ),
    q(
      "Maria was nervous before her first piano recital, but she felt calmer once she saw her family smiling in the audience.",
      "Which choice best describes what helped Maria feel calmer?",
      ["Practicing one more time backstage", "Seeing her family in the audience", "Skipping the recital entirely", "Playing a different song"],
      "B"
    ),
    q(
      "The new traffic light at the intersection has reduced accidents significantly _____ the city installed it last spring.",
      "Which choice completes the text with the most logical word or phrase?",
      ["since", "unless", "although", "despite"],
      "A"
    ),
    q(
      "The museum's new exhibit on ancient pottery attracted more visitors in its first week than any other exhibit that year.",
      "Which choice best states the main idea of the text?",
      [
        "The pottery exhibit was unpopular.",
        "The pottery exhibit drew a large number of visitors.",
        "The museum closed the exhibit early.",
        "Visitors preferred other exhibits instead.",
      ],
      "B"
    ),
    q(
      "The farmer rotates his crops each season _____ keep the soil healthy and productive.",
      "Which choice completes the text with the most logical word or phrase?",
      ["to", "despite", "unless", "although"],
      "A"
    ),
    q(
      "The soccer team's captain encouraged her teammates before the final match, reminding them how far they had come all season.",
      "Which choice best describes the captain's purpose?",
      [
        "To criticize her teammates' performance",
        "To motivate her teammates before the match",
        "To cancel the final match",
        "To explain the rules of soccer",
      ],
      "B"
    ),
    q(
      "The new app lets users track their daily water intake, sending a gentle reminder if they haven't logged a glass in several hours.",
      "Which choice best states the main function of the app?",
      ["It tracks daily water intake and sends reminders.", "It only works once per day.", "It replaces the need to drink water.", "It tracks sleep instead of water."],
      "A"
    ),
    q(
      "Although the hike was longer than expected, the group agreed the view from the summit was worth every tiring step.",
      "Which choice best describes the group's overall feeling about the hike?",
      ["They regretted going on the hike.", "They felt the view justified the effort.", "They turned back before reaching the summit.", "They found the hike too easy."],
      "B"
    ),
    q(
      "The teacher assigned a group project _____ students could learn to work together and share ideas.",
      "Which choice completes the text with the most logical word or phrase?",
      ["so that", "even though", "in spite of", "unless"],
      "A"
    ),
    q(
      "The volunteers spent the afternoon painting the community center, transforming its faded walls into a bright mural.",
      "Which choice best states what the volunteers accomplished?",
      ["They tore down the community center.", "They painted a bright mural on the walls.", "They built a new community center.", "They planted flowers outside."],
      "B"
    ),
    q(
      "The chef added extra spice to the dish _____ several customers had requested a spicier version the week before.",
      "Which choice completes the text with the most logical word or phrase?",
      ["because", "unless", "although", "despite"],
      "A"
    ),
    q(
      "The small town's annual festival draws visitors from nearby cities, mainly because of its famous fireworks display.",
      "Which choice best states the main reason visitors attend the festival?",
      ["The town's small size", "The fireworks display", "The lack of other festivals nearby", "The cost of admission"],
      "B"
    ),
    q(
      "The scientist repeated the experiment three times to make sure her results were consistent before publishing them.",
      "Which choice best states why the scientist repeated the experiment?",
      ["To waste time", "To confirm consistent results", "Because the first attempt failed completely", "Because she forgot the first results"],
      "B"
    ),
    q(
      "Every student in the class _____ required to submit the form by Friday.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["is", "are", "were", "have been"],
      "A"
    ),
    q(
      "The dog, along with its two puppies, _____ sleeping in the yard.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["were", "is", "are", "have"],
      "B"
    ),
    q(
      "The library's book club meets every other Thursday to discuss a new novel chosen by its members.",
      "Which choice best states how often the book club meets?",
      ["Every Thursday", "Every other Thursday", "Once a month", "Only in summer"],
      "B"
    ),
    q(
      "The new bridge shortened the commute for thousands of residents, cutting travel time nearly in half.",
      "Which choice best states the main effect of the new bridge?",
      ["It lengthened residents' commutes.", "It significantly reduced travel time.", "It had no effect on traffic.", "It closed an older road permanently."],
      "B"
    ),
    q(
      "The photographer waited two hours in the cold, hoping the fog would lift long enough for a clear shot of the mountain.",
      "Which choice best describes what the photographer was waiting for?",
      ["Warmer weather", "The fog to lift", "Other photographers to leave", "The mountain to be closed"],
      "B"
    ),
    q(
      "The recipe calls for fresh basil, _____ dried basil can be used in a smaller amount if fresh is unavailable.",
      "Which choice completes the text with the most logical transition?",
      ["although", "similarly", "therefore", "because"],
      "A"
    ),
    q(
      "The town's recycling program doubled participation after officials began offering small rewards for consistent recycling.",
      "Which choice best states why participation in the program increased?",
      ["Officials removed the program's requirements.", "Officials began offering rewards.", "The program was canceled and restarted.", "Fewer residents lived in the town."],
      "B"
    ),
    q(
      "The orchestra's youngest member, only twelve years old, played the solo flawlessly despite her nerves.",
      "Which choice best describes the young musician's performance?",
      ["She made several mistakes.", "She performed the solo without errors.", "She refused to play the solo.", "She was replaced by another musician."],
      "B"
    ),
    q(
      "The two scientists, working independently, _____ reached the same conclusion.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["has", "have", "having", "had been"],
      "B"
    ),
    q(
      "The city planted new trees along the main avenue to provide shade and improve air quality for residents.",
      "Which choice best states the purpose of planting the new trees?",
      ["To block the view of buildings", "To provide shade and improve air quality", "To replace the sidewalks", "To reduce the number of parking spaces"],
      "B"
    ),
  ];
}

// ===================== MODULE 2 — QIYIN (27 ta) =====================
export function buildRWModule2Hard() {
  uid = 1;
  return [
    q(
      "Critics who dismiss the poet's late work as derivative overlook the way she repurposes earlier conventions: what appears to be imitation is, on closer inspection, a deliberate critique of the tradition she inherited.",
      "Which choice best describes the function of the text as a whole?",
      [
        "It defends the poet's late work against a common criticism.",
        "It agrees that the poet's late work is derivative.",
        "It traces the historical origins of a poetic convention.",
        "It compares two critics' opinions of the poet.",
      ],
      "A"
    ),
    q(
      "Economists have long debated whether consumer confidence drives spending or whether spending itself generates the sense of confidence that surveys measure; the causal arrow, in other words, remains _____.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["irrelevant", "ambiguous", "predictable", "obsolete"],
      "B"
    ),
    q(
      "The study's authors caution that their sample, drawn entirely from urban clinics, may not generalize to rural populations, where access to care and reporting practices differ substantially.",
      "Which choice best describes the purpose of the caution mentioned in the text?",
      [
        "To dismiss the study's findings entirely",
        "To limit the claimed scope of the study's conclusions",
        "To argue that rural populations were misrepresented",
        "To criticize the clinics used in the sample",
      ],
      "B"
    ),
    q(
      "Although the architect's design was celebrated for its minimalism, the underlying structural engineering was in fact remarkably intricate, involving load calculations rarely attempted at that scale.",
      "Which choice best describes the relationship between the two ideas presented in the text?",
      [
        "A visible simplicity conceals underlying complexity.",
        "A structural flaw undermines an otherwise elegant design.",
        "Two engineers disagree about a design's feasibility.",
        "An early design was later simplified for safety.",
      ],
      "A"
    ),
    q(
      "The philosopher's argument hinges on a distinction between knowledge and mere true belief, a distinction that, while intuitive, has proven remarkably difficult to formalize without circularity.",
      "Which choice best states the main idea of the text?",
      [
        "The distinction between knowledge and true belief is easy to formalize.",
        "A seemingly intuitive distinction resists precise formal definition.",
        "Philosophers have abandoned the study of knowledge entirely.",
        "True belief is identical to knowledge in all cases.",
      ],
      "B"
    ),
    q(
      "Proponents of the merger emphasize projected cost savings, while skeptics point to the historical tendency of such savings to be overstated in initial projections and rarely realized in practice.",
      "Which choice best describes how the skeptics' view relates to the proponents' view?",
      [
        "It questions the reliability of the proponents' central claim.",
        "It fully supports the proponents' projections.",
        "It focuses on an unrelated aspect of the merger.",
        "It agrees that savings are always understated.",
      ],
      "A"
    ),
    q(
      "The composer's late symphonies, once considered inaccessible, are now regarded by many scholars as the culmination of a lifelong preoccupation with dissonance as a structural, rather than merely decorative, device.",
      "Which choice best describes how the underlined portion functions in the text?",
      [
        "It clarifies the significance scholars now attribute to dissonance in the works.",
        "It criticizes scholars for misunderstanding the composer's intent.",
        "It summarizes the composer's early career.",
        "It argues that the symphonies remain inaccessible today.",
      ],
      "A"
    ),
    q(
      "Despite the algorithm's impressive accuracy on the training data, its performance degraded sharply when applied to a dataset drawn from a different population, a phenomenon researchers attribute to overfitting rather than any flaw in the underlying model architecture.",
      "Which choice best states the researchers' explanation for the algorithm's degraded performance?",
      [
        "The model architecture itself was fundamentally flawed.",
        "The algorithm overfit to characteristics of the training data.",
        "The training data was too small to be useful.",
        "The new dataset contained no usable information.",
      ],
      "B"
    ),
    q(
      "The novelist's use of an unreliable narrator does not merely obscure the plot's central mystery; it implicates the reader in the very acts of interpretation and misjudgment the novel goes on to critique.",
      "Which choice best describes the function of the unreliable narrator, according to the text?",
      [
        "It only serves to confuse readers unnecessarily.",
        "It draws readers into the interpretive errors the novel examines.",
        "It reveals the mystery immediately to avoid confusion.",
        "It has no thematic significance beyond plot mechanics.",
      ],
      "B"
    ),
    q(
      "While the treaty's signatories publicly praised its terms as a diplomatic triumph, internal correspondence later revealed considerable private reservations about its long-term enforceability.",
      "Which choice best describes the relationship between the public statements and the private correspondence?",
      [
        "The public statements and private views were in tension with each other.",
        "The private correspondence fully confirmed the public praise.",
        "Both sources expressed identical concerns.",
        "The private correspondence was written before the treaty was signed.",
      ],
      "A"
    ),
    q(
      "The anthropologist's fieldwork complicates a widely held assumption: that ritual practices, once established, remain static across generations rather than evolving in response to changing social conditions.",
      "Which choice best states the main idea of the text?",
      [
        "Ritual practices are always static across generations.",
        "The anthropologist's research challenges the assumption that rituals stay unchanged.",
        "Social conditions never affect ritual practices.",
        "The fieldwork confirmed that rituals never evolve.",
      ],
      "B"
    ),
    q(
      "Though the drug demonstrated statistically significant benefits in the trial, the effect size was small enough that researchers cautioned against overstating its clinical significance to patients. The researchers' caution reflects a broader concern about conflating statistical significance with _____ importance.",
      "Which choice completes the text with the most logical and precise word or phrase?",
      ["clinical", "theoretical", "historical", "linguistic"],
      "A"
    ),
    q(
      "The historian's revisionist account does not deny the traditional narrative's basic facts so much as it reframes their significance, arguing that what was once read as decline was in fact a period of quiet institutional consolidation.",
      "Which choice best describes what the historian's account does?",
      [
        "It disputes the traditional narrative's factual accuracy entirely.",
        "It reinterprets the meaning of an accepted set of facts.",
        "It ignores the traditional narrative altogether.",
        "It argues that no consolidation occurred at all.",
      ],
      "B"
    ),
    q(
      "Skeptics of the proposed carbon tax argue that its regressive burden on low-income households would outweigh its environmental benefits; _____, supporters counter that revenue-neutral rebate structures can offset this burden entirely.",
      "Which choice completes the text with the most logical transition?",
      ["however", "similarly", "for instance", "in short"],
      "A"
    ),
    q(
      "The manuscript's marginalia, long dismissed by editors as irrelevant scribbles, have recently been reexamined by scholars who argue they constitute a parallel, unofficial commentary on the main text.",
      "Which choice best describes the shift in scholarly attitude described in the text?",
      [
        "Marginalia once ignored are now treated as a meaningful commentary.",
        "Marginalia were always considered essential to the text.",
        "Scholars have stopped studying the manuscript entirely.",
        "The main text has been declared less important than the marginalia.",
      ],
      "A"
    ),
    q(
      "The corporation's sustainability report cites a reduction in emissions per unit produced, a metric that, critics note, can improve even as total emissions rise if production volume grows fast enough.",
      "Which choice best describes the critics' concern?",
      [
        "The metric used could mask an overall increase in emissions.",
        "The corporation reduced its total production.",
        "The report contains no data on emissions at all.",
        "Emissions per unit is an irrelevant metric in all contexts.",
      ],
      "A"
    ),
    q(
      "The playwright's decision to set the entire drama in a single room, over a single evening, was less a budgetary constraint than a deliberate strategy to intensify the claustrophobic tension between the characters.",
      "Which choice best describes the function of the underlined portion?",
      [
        "It clarifies that the setting choice was primarily artistic, not financial.",
        "It argues the setting choice was purely accidental.",
        "It criticizes the playwright for a lack of ambition.",
        "It explains why the play was never performed.",
      ],
      "A"
    ),
    q(
      "The findings, along with the accompanying data set, _____ made publicly available to encourage independent verification.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["was", "were", "has been", "is"],
      "B"
    ),
    q(
      "Neither the committee's initial recommendation nor its subsequent revisions _____ fully address the community's concerns.",
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
      ["has", "have", "was", "is"],
      "B"
    ),
    q(
      "The theory's explanatory power lies not in its ability to predict specific outcomes but in its capacity to unify previously disconnected observations under a single coherent framework.",
      "Which choice best states the main idea of the text?",
      [
        "The theory is valuable mainly for predicting exact outcomes.",
        "The theory's strength is unifying disparate observations, not prediction.",
        "The theory has no explanatory value whatsoever.",
        "The theory contradicts all previous observations.",
      ],
      "B"
    ),
    q(
      "The diplomat's memoir, published decades after the negotiations it describes, offers a perspective that is candid precisely because it is no longer constrained by the political sensitivities of the time.",
      "Which choice best describes why the memoir is described as candid?",
      [
        "It was written during the negotiations themselves.",
        "Enough time had passed that political sensitivities no longer applied.",
        "The diplomat was never involved in the negotiations.",
        "The memoir avoids discussing the negotiations at all.",
      ],
      "B"
    ),
    q(
      "The geneticist's model accounts for the observed variation not by invoking a single dominant gene but by aggregating the small, cumulative effects of hundreds of individual genetic variants.",
      "Which choice best states how the geneticist's model explains the observed variation?",
      [
        "Through the combined small effects of many genetic variants",
        "Through a single gene with a large, dominant effect",
        "Through environmental factors exclusively",
        "Through random chance with no genetic basis",
      ],
      "A"
    ),
    q(
      "The court's ruling, while narrow in its immediate legal effect, established a precedent that subsequent cases would invoke to justify far broader interpretations of the same statute.",
      "Which choice best describes the relationship between the ruling's immediate effect and its later influence?",
      [
        "A narrow decision led to much broader legal consequences over time.",
        "The ruling had no influence on any later cases.",
        "Later cases narrowed the ruling's original scope.",
        "The ruling was immediately overturned by a higher court.",
      ],
      "A"
    ),
    q(
      "The curator's exhibition deliberately juxtaposes works from opposing artistic movements, inviting viewers to notice continuities that a chronological arrangement would have obscured.",
      "Which choice best describes the curator's purpose, according to the text?",
      [
        "To highlight similarities that a traditional arrangement would hide",
        "To emphasize strict chronological order",
        "To exclude opposing artistic movements from the exhibition",
        "To confuse viewers intentionally",
      ],
      "A"
    ),
    q(
      "The economist's forecast proved accurate not because it correctly anticipated the specific shock that triggered the downturn, but because its underlying model correctly identified the economy's underlying fragility.",
      "Which choice best states why the economist's forecast is described as accurate?",
      [
        "It predicted the exact event that caused the downturn.",
        "Its model correctly captured a structural vulnerability, even without predicting the trigger.",
        "It predicted continued economic growth.",
        "It was based entirely on luck rather than analysis.",
      ],
      "B"
    ),
    q(
      "The linguist argues that the dialect's apparent simplicity is illusory, masking a system of grammatical distinctions more intricate, in some respects, than that of the standard language it is often compared unfavorably to.",
      "Which choice best states the main idea of the text?",
      [
        "The dialect is objectively simpler than the standard language in every respect.",
        "The dialect's seeming simplicity hides considerable grammatical complexity.",
        "The standard language has no grammatical distinctions at all.",
        "The linguist agrees the dialect is inferior to the standard language.",
      ],
      "B"
    ),
    q(
      "The panel's dissenting member conceded the majority's factual findings but rejected their legal conclusion, arguing that the same facts, properly analyzed, supported the opposite outcome.",
      "Which choice best describes the dissenting member's position?",
      [
        "Disagreement with the facts and the legal conclusion alike",
        "Agreement with the facts but disagreement with the legal conclusion",
        "Agreement with both the facts and the legal conclusion",
        "Refusal to consider the facts at all",
      ],
      "B"
    ),
  ];
}
