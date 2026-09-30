// ------------------------------------------------------------------
// IELTS Academic Mock Test 1 — Prepzone uchun yozilgan ORIGINAL material
// (Cambridge / British Council / IDP materiallaridan olinmagan).
//
// Listening: har bir part'da `audioUrl` bo'lsa o'sha audio ijro etiladi,
// bo'lmasa `script` brauzer ovozi (speechSynthesis) bilan o'qiladi.
// Savol guruhi turlari:
//   gap      — yozma javob (accept: qabul qilinadigan variantlar)
//   mcq      — har bir savolda o'z variantlari (A/B/C/D)
//   tfng     — TRUE / FALSE / NOT GIVEN
//   ynng     — YES / NO / NOT GIVEN
//   match    — guruh uchun umumiy `options` ro'yxatidan harf tanlash
//   headings — paragraf sarlavhalari (rim raqamlari)
// ------------------------------------------------------------------

const listening = {
  parts: [
    {
      id: 1,
      title: "Part 1",
      intro: "You will hear a woman phoning a leisure centre to ask about membership.",
      audioUrl: null,
      speakers: { Man: "m", Woman: "f" },
      script: [
        { speaker: "Man", text: "Good morning, Riverside Leisure Centre, Tom speaking. How can I help?" },
        { speaker: "Woman", text: "Oh, hello. I've just moved to the area and I'd like to join the centre, if that's possible." },
        { speaker: "Man", text: "Of course. I can start a membership form for you now over the phone. Could I have your name, please?" },
        { speaker: "Woman", text: "Yes, it's Emma Thornbury." },
        { speaker: "Man", text: "Could you spell your surname for me?" },
        { speaker: "Woman", text: "Sure. T, H, O, R, N, B, U, R, Y." },
        { speaker: "Man", text: "Thank you. And your address?" },
        { speaker: "Woman", text: "It's fourteen Castle Road. That's Castle, like the building." },
        { speaker: "Man", text: "Fourteen Castle Road. And the postcode?" },
        { speaker: "Woman", text: "B, R, three, seven, L, N." },
        { speaker: "Man", text: "B R three, seven L N. Lovely. And a contact phone number?" },
        { speaker: "Woman", text: "My mobile is oh seven nine four five, three one eight, two oh six." },
        { speaker: "Man", text: "Let me read that back. Oh seven nine four five, three one eight, two oh six." },
        { speaker: "Woman", text: "That's right." },
        { speaker: "Man", text: "Now, we have three types of membership. Full membership lets you use everything at any time and costs forty-five pounds a month. Then there's off-peak, which means you can come on weekdays before four in the afternoon and at weekends." },
        { speaker: "Woman", text: "I work from home, so off-peak would actually suit me very well. How much is that?" },
        { speaker: "Man", text: "It was twenty-nine pounds last year, but it went up in January, so it's now thirty-two pounds a month." },
        { speaker: "Woman", text: "That's fine. I'll take the off-peak one." },
        { speaker: "Man", text: "Great. And what are you mainly interested in using? We have the gym, the tennis courts and the pool." },
        { speaker: "Woman", text: "I used to play tennis, but these days it's mostly swimming. I try to go three or four times a week." },
        { speaker: "Man", text: "The pool's just been refurbished, so you'll enjoy it. Are you interested in any of our classes as well?" },
        { speaker: "Woman", text: "I was hoping to do yoga on Wednesday mornings." },
        { speaker: "Man", text: "I'm afraid that class is completely full at the moment. But there are still a few places in pilates, which is at the same time." },
        { speaker: "Woman", text: "Oh, OK. I'll try pilates then." },
        { speaker: "Man", text: "I'll put you down for that. When you come in for the first time, you'll need to bring some proof of address, like a bank statement, and a passport-sized photo for your membership card." },
        { speaker: "Woman", text: "Do I need to bring any identification?" },
        { speaker: "Man", text: "No, the proof of address is enough. You'll also need to attend an induction day, where a trainer shows you how to use the equipment safely. The next one is on Tuesday, but that's already booked up." },
        { speaker: "Woman", text: "Is there another one soon?" },
        { speaker: "Man", text: "Yes, there's one on Thursday at ten a.m." },
        { speaker: "Woman", text: "Thursday is perfect. Thank you so much." },
      ],
      groups: [
        {
          type: "gap",
          wordLimit: 2,
          instructions: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          title: "Riverside Leisure Centre — New Membership Form",
          questions: [
            { n: 1, text: "Surname: ___", accept: ["Thornbury"] },
            { n: 2, text: "Address: 14 ___ Road", accept: ["Castle"] },
            { n: 3, text: "Postcode: ___", accept: ["BR3 7LN", "BR37LN"] },
            { n: 4, text: "Mobile number: ___", accept: ["07945 318 206", "07945318206", "07945 318206"] },
            { n: 5, text: "Type of membership: ___", accept: ["off-peak", "off peak", "offpeak"] },
            { n: 6, text: "Monthly cost: £___", accept: ["32", "32.00"] },
            { n: 7, text: "Main activity: ___", accept: ["swimming", "swim"] },
            { n: 8, text: "Class on Wednesday mornings: ___", accept: ["pilates"] },
            { n: 9, text: "Must bring: proof of address and a passport-sized ___", accept: ["photo", "photograph"] },
            { n: 10, text: "Induction day: ___ at 10 a.m.", accept: ["Thursday"] },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Part 2",
      intro: "You will hear a guide talking to visitors at a museum that has recently reopened.",
      audioUrl: null,
      speakers: { Guide: "f" },
      script: [
        { speaker: "Guide", text: "Good morning, everyone, and welcome to the Harbour Museum. As many of you know, the museum has only just reopened after a long period of renovation. When we closed, the work was expected to take eighteen months, but in the end it took two full years, so we're especially pleased to see you all here today." },
        { speaker: "Guide", text: "People often assume the renovation was about repairing the roof. We did replace the roof while the building was closed, but the main purpose of the project was to give us more exhibition space. For years, we could only display around a fifth of our collection. Now, with the new galleries, we can show almost half of it. We've also improved access throughout, with new lifts to every floor." },
        { speaker: "Guide", text: "A quick practical point. You'll notice there are now two entrances. The main entrance on Harbour Street is fully open, but we recommend using the new entrance by the car park, because the queues there are usually much shorter, especially at weekends." },
        { speaker: "Guide", text: "We offer free guided tours every day. They used to start at ten thirty, but from this month they begin at eleven o'clock, and there's a second tour at two thirty in the afternoon. They leave from the information desk and last about an hour." },
        { speaker: "Guide", text: "You're welcome to take photographs in all of our permanent galleries, and you can use flash if you wish. The only exception is the special exhibition, where photography of any kind is not permitted, because many of the objects have been lent to us by private collectors." },
        { speaker: "Guide", text: "Now let me tell you where to find things. Here on the ground floor, as well as the café, you'll find the gift shop, just to the left of the main stairs. Families with young children should head to the discovery zone, which is also on this floor, at the back of the building. It's full of hands-on activities." },
        { speaker: "Guide", text: "The first floor is where you'll find our new temporary exhibition space. The current exhibition is about the history of lighthouses, and it runs until the end of the summer." },
        { speaker: "Guide", text: "Finally, the second floor houses two of our most popular collections. There's the map room, with charts of the coastline going back four hundred years, and next to it, our famous collection of ship models, which many visitors say is the highlight of the museum. Right, if you'd like to follow me, we'll begin our tour." },
      ],
      groups: [
        {
          type: "mcq",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 11,
              text: "How long was the museum closed for renovation?",
              options: [
                { key: "A", text: "eighteen months" },
                { key: "B", text: "two years" },
                { key: "C", text: "three years" },
              ],
              answer: "B",
            },
            {
              n: 12,
              text: "What was the main purpose of the renovation?",
              options: [
                { key: "A", text: "to repair the roof" },
                { key: "B", text: "to install new lifts" },
                { key: "C", text: "to create more exhibition space" },
              ],
              answer: "C",
            },
            {
              n: 13,
              text: "Visitors are advised to use the new entrance because",
              options: [
                { key: "A", text: "there is less waiting time." },
                { key: "B", text: "it leads directly to the café." },
                { key: "C", text: "the main entrance is being repaired." },
              ],
              answer: "A",
            },
            {
              n: 14,
              text: "The first free guided tour of the day now starts at",
              options: [
                { key: "A", text: "10.30 a.m." },
                { key: "B", text: "11.00 a.m." },
                { key: "C", text: "2.30 p.m." },
              ],
              answer: "B",
            },
            {
              n: 15,
              text: "What does the guide say about photography?",
              options: [
                { key: "A", text: "It is allowed everywhere in the museum." },
                { key: "B", text: "It is not allowed in the special exhibition." },
                { key: "C", text: "Flash may not be used in the permanent galleries." },
              ],
              answer: "B",
            },
          ],
        },
        {
          type: "match",
          instructions: "Which floor is each of the following on? Choose the correct letter, A, B or C.",
          options: [
            { key: "A", text: "ground floor" },
            { key: "B", text: "first floor" },
            { key: "C", text: "second floor" },
          ],
          questions: [
            { n: 16, text: "discovery zone", answer: "A" },
            { n: 17, text: "ship models", answer: "C" },
            { n: 18, text: "temporary exhibition", answer: "B" },
            { n: 19, text: "gift shop", answer: "A" },
            { n: 20, text: "map room", answer: "C" },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Part 3",
      intro: "You will hear two students, Maya and Daniel, discussing their research project with their tutor.",
      audioUrl: null,
      speakers: { Tutor: "m", Maya: "f", Daniel: "m" },
      script: [
        { speaker: "Tutor", text: "So, Maya, Daniel, how is the project on urban green spaces coming along? Remind me why you chose this topic." },
        { speaker: "Maya", text: "Well, I spent last summer volunteering at a community garden, and I got really interested in how people use shared spaces in the city. Daniel was keen too, so we decided to go for it, even though there isn't a huge amount written about it." },
        { speaker: "Tutor", text: "Good. And how did the first survey go?" },
        { speaker: "Daniel", text: "Not brilliantly, to be honest. We actually got plenty of responses, more than a hundred, but when we looked at the answers, it was obvious that people had misunderstood some of the questions. The wording just wasn't clear enough." },
        { speaker: "Maya", text: "So we rewrote them and tested them on a few friends first." },
        { speaker: "Tutor", text: "That's sensible. Have you thought about how you'll collect the rest of your data? You could interview the park managers, of course, but I think you'd get a much fuller picture if you observed each park yourselves at different times of day. Early morning and evening can be very different from lunchtime." },
        { speaker: "Daniel", text: "That's a good idea. We could do that next week." },
        { speaker: "Tutor", text: "What has surprised you so far?" },
        { speaker: "Daniel", text: "For me, it was that people care much more about peace and quiet than about facilities. We expected them to want more benches, better toilets and so on, but most people said the thing they valued most was simply a quiet place to sit." },
        { speaker: "Maya", text: "I'd assumed older people would use the parks less, but actually they were among the most regular visitors." },
        { speaker: "Tutor", text: "Interesting. And have you thought about the presentation?" },
        { speaker: "Maya", text: "We talked about starting with a short video, but Daniel thought it might take too long to make." },
        { speaker: "Daniel", text: "Yes, I think we should open with a map showing the three parks, so the audience knows where they are. Then we can move on to the statistics." },
        { speaker: "Maya", text: "OK, I agree, a map is the best way to begin." },
        { speaker: "Tutor", text: "Good. So what are your next steps?" },
        { speaker: "Daniel", text: "First, we need figures for how many people visit each park. The local council collects that information, so we'll contact them this week." },
        { speaker: "Tutor", text: "You should also read the article by Hartman. It's about noise in cities, and I think it'll help explain your finding about quiet spaces." },
        { speaker: "Maya", text: "We'll read that. Then I think we need to put all our results into a table, so we can compare the three parks side by side." },
        { speaker: "Tutor", text: "Yes, that would make things much clearer. And remember, the presentation must be under fifteen minutes, including time for questions." },
        { speaker: "Daniel", text: "Under fifteen minutes. Got it. When do you need the draft?" },
        { speaker: "Tutor", text: "Could you send it to me by Friday? That gives me the weekend to read it." },
        { speaker: "Maya", text: "Friday is fine. Thank you." },
      ],
      groups: [
        {
          type: "mcq",
          instructions: "Choose the correct letter, A, B or C.",
          questions: [
            {
              n: 21,
              text: "Why did the students choose this topic?",
              options: [
                { key: "A", text: "because of Maya's volunteering experience" },
                { key: "B", text: "because their tutor suggested it" },
                { key: "C", text: "because many sources were available" },
              ],
              answer: "A",
            },
            {
              n: 22,
              text: "What was the main problem with the first survey?",
              options: [
                { key: "A", text: "There were too few responses." },
                { key: "B", text: "Some questions were unclear." },
                { key: "C", text: "It was carried out in the wrong place." },
              ],
              answer: "B",
            },
            {
              n: 23,
              text: "What does the tutor recommend?",
              options: [
                { key: "A", text: "interviewing park managers" },
                { key: "B", text: "putting the questionnaire online" },
                { key: "C", text: "observing the parks at different times" },
              ],
              answer: "C",
            },
            {
              n: 24,
              text: "What surprised Daniel most?",
              options: [
                { key: "A", text: "Older people visited the parks less often." },
                { key: "B", text: "People valued quiet more than facilities." },
                { key: "C", text: "Children rarely used the playgrounds." },
              ],
              answer: "B",
            },
            {
              n: 25,
              text: "The students agree that the presentation should begin with",
              options: [
                { key: "A", text: "a map." },
                { key: "B", text: "a short video." },
                { key: "C", text: "some statistics." },
              ],
              answer: "A",
            },
          ],
        },
        {
          type: "gap",
          wordLimit: 1,
          instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
          title: "Next steps",
          questions: [
            { n: 26, text: "Contact the local ___ for visitor numbers", accept: ["council"] },
            { n: 27, text: "Read Hartman's article about ___ in cities", accept: ["noise"] },
            { n: 28, text: "Put the results into a ___ to compare the parks", accept: ["table"] },
            { n: 29, text: "Presentation must be under fifteen ___", accept: ["minutes"] },
            { n: 30, text: "Send the draft to the tutor by ___", accept: ["Friday"] },
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Part 4",
      intro: "You will hear part of a lecture about bioluminescence in living organisms.",
      audioUrl: null,
      speakers: { Lecturer: "m" },
      script: [
        { speaker: "Lecturer", text: "Today I'd like to talk about bioluminescence, which is the ability of living organisms to produce their own light. It's far more common than most people realise. In the deep ocean, it's estimated that around three quarters of all animals can produce light in some way." },
        { speaker: "Lecturer", text: "So how does it work? The light comes from a chemical reaction. A molecule called luciferin reacts with oxygen, and this reaction is controlled by an enzyme, usually called luciferase. The energy released by the reaction is given off as light rather than heat, which is why it's sometimes described as cold light." },
        { speaker: "Lecturer", text: "In the ocean, the most common colour of bioluminescent light is blue. There's a simple reason for this: blue light travels furthest through sea water, while red light is absorbed very quickly. In fact, many deep-sea animals cannot see red light at all." },
        { speaker: "Lecturer", text: "Organisms use light for a variety of purposes. Some squid, for example, use it for camouflage. They produce light on their underside that matches the faint light coming from the surface, so a predator looking up from below doesn't see a dark shadow. The anglerfish, on the other hand, uses a glowing lure on its head to attract prey towards its mouth." },
        { speaker: "Lecturer", text: "One of the most beautiful examples is found in tiny single-celled organisms called dinoflagellates. These flash with light whenever the water around them is disturbed, for instance by a boat or a swimmer, which is why some beaches appear to glow at night. Scientists believe this flashing acts as a kind of burglar alarm. When a small predator starts feeding on the dinoflagellates, the light attracts larger fish, which then eat the predator." },
        { speaker: "Lecturer", text: "Bioluminescence isn't limited to the sea. On land, the best-known example is the firefly, where each species has its own pattern of flashes. These patterns are used to find a mate, rather like a signal in code." },
        { speaker: "Lecturer", text: "Bioluminescence has also become an important tool in medicine. Researchers can insert the genes for luciferase into cells, so that those cells glow. This allows scientists to track the growth of cancer cells inside living tissue without having to operate." },
        { speaker: "Lecturer", text: "Studying bioluminescent animals in their natural habitat is extremely difficult, since many live thousands of metres below the surface. Most of our knowledge now comes from remote-controlled robots fitted with sensitive cameras. However, there's a serious problem. The bright lights on this equipment can disturb or even harm the animals, and researchers are increasingly concerned about light pollution in the deep sea. Some teams are now experimenting with red lights, which, as I mentioned, most deep-sea creatures cannot detect." },
      ],
      groups: [
        {
          type: "gap",
          wordLimit: 1,
          instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
          title: "Bioluminescence",
          questions: [
            { n: 31, text: "Luciferin reacts with oxygen; the reaction is controlled by an ___", accept: ["enzyme"] },
            { n: 32, text: "Most common colour in the ocean: ___, because it travels furthest in water", accept: ["blue"] },
            { n: 33, text: "Some squid use light for ___, so they cast no shadow", accept: ["camouflage"] },
            { n: 34, text: "Anglerfish use a glowing lure to attract ___", accept: ["prey"] },
            { n: 35, text: "Dinoflagellates flash when the water is ___", accept: ["disturbed"] },
            { n: 36, text: "The light attracts larger ___ that eat the predator", accept: ["fish"] },
            { n: 37, text: "Fireflies use flash patterns to find a ___", accept: ["mate"] },
            { n: 38, text: "In medicine, luciferase genes help track the growth of ___ cells", accept: ["cancer"] },
            { n: 39, text: "Deep-sea research mostly uses remote-controlled ___", accept: ["robots"] },
            { n: 40, text: "Researchers are concerned about light ___ in the deep sea", accept: ["pollution"] },
          ],
        },
      ],
    },
  ],
};

const reading = {
  parts: [
    {
      id: 1,
      title: "Part 1",
      passageTitle: "The Return of the Urban Beekeeper",
      intro: "You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1.",
      paragraphs: [
        { label: "A", text: "Twenty years ago, anyone keeping bees on a city rooftop would have been regarded as an eccentric. Today, hives can be found on the roofs of hotels, office blocks and even opera houses in cities from London to Tokyo. In Paris alone, the number of registered urban hives is estimated to have grown from around 300 in 2010 to more than 2,000 a decade later. The movement has been driven partly by alarm at reports of falling bee populations and partly by a wider enthusiasm for locally produced food." },
        { label: "B", text: "At first glance, cities seem an unlikely refuge for honeybees. Yet urban environments offer several advantages. Gardens, parks, balconies and roadside verges contain a remarkable variety of flowering plants, many of them ornamental species that bloom at different times of year. Unlike the vast farms of the countryside, where a single crop may flower for only two or three weeks, a city can provide nectar almost continuously from early spring until late autumn. Urban bees are also exposed to fewer agricultural pesticides, which have been linked to declines in insect health. Some beekeepers claim that city hives produce more honey than rural ones, although this has not been confirmed by systematic research." },
        { label: "C", text: "However, the rapid growth of urban beekeeping has worried some ecologists. Honeybees are just one of many pollinating insects, and in Britain alone there are more than 250 species of wild bee. Most of these are solitary insects that nest in the ground or in hollow stems, and they depend on the same flowers as honeybees. A study carried out in London in 2019 found that areas with the highest density of hives also showed the lowest numbers of wild bees. The researchers argued that when too many hives are placed in a small area, honeybees, which forage in colonies of tens of thousands, can simply outcompete their wild relatives for food." },
        { label: "D", text: "There are also concerns about disease. Honeybee colonies can carry parasites such as the varroa mite, as well as viral infections, and these can spread to other bee species when they visit the same flowers. Experienced keepers inspect their hives regularly and treat them when necessary, but newcomers to the hobby may lack the knowledge to recognise early signs of illness. For this reason, several beekeeping associations now require members to complete a training course before they are allowed to install a hive." },
        { label: "E", text: "In response to these concerns, some cities have begun to change their approach. Rather than encouraging more hives, planners are focusing on increasing the amount of food available to all pollinators. In the Dutch city of Utrecht, the roofs of more than 300 bus shelters have been covered with sedum, a low-growing plant that attracts bees and butterflies. Elsewhere, councils have stopped cutting the grass on roadside verges during the summer months, allowing wildflowers to seed themselves. Such schemes are relatively cheap and also bring other benefits, such as absorbing rainwater and reducing the temperature of city streets." },
        { label: "F", text: "For individual citizens who want to help, experts increasingly suggest alternatives to keeping honeybees. Planting a range of native flowers, leaving a corner of the garden uncut, or putting up a simple 'bee hotel' made from bundles of hollow canes can all support wild species. As one ecologist puts it, 'Keeping honeybees to save bees is a bit like keeping chickens to save wild birds.' Urban beekeeping, it seems, is not in itself harmful, but it works best as one part of a broader effort to make cities places where many kinds of insect can thrive." },
      ],
      groups: [
        {
          type: "tfng",
          instructions: "Do the following statements agree with the information given in Reading Passage 1? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          questions: [
            { n: 1, text: "The number of registered urban hives in Paris rose more than sixfold in about ten years.", answer: "TRUE" },
            { n: 2, text: "Research has proved that city hives produce more honey than rural hives.", answer: "FALSE" },
            { n: 3, text: "Most species of wild bee in Britain live in large colonies.", answer: "FALSE" },
            { n: 4, text: "The 2019 London study was paid for by a beekeeping association.", answer: "NOT GIVEN" },
            { n: 5, text: "Some beekeeping associations insist that new members receive training.", answer: "TRUE" },
            { n: 6, text: "The bus shelter roofs in Utrecht were originally designed to reduce traffic noise.", answer: "NOT GIVEN" },
          ],
        },
        {
          type: "gap",
          wordLimit: 2,
          instructions: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          title: "Bees in the city",
          questions: [
            { n: 7, text: "Urban bees benefit from a wide variety of flowers and come into contact with fewer ___ than bees on farms.", accept: ["pesticides", "agricultural pesticides"] },
            { n: 8, text: "Where hives are concentrated, honeybees may ___ wild bees for food.", accept: ["outcompete"] },
            { n: 9, text: "Honeybees can pass on ___ such as the varroa mite to other species.", accept: ["parasites"] },
            { n: 10, text: "Some planners now try to increase the food available to all ___.", accept: ["pollinators"] },
            { n: 11, text: "In Utrecht, bus shelter roofs have been planted with ___.", accept: ["sedum"] },
            { n: 12, text: "Some councils no longer cut the grass on ___ in summer.", accept: ["roadside verges", "verges"] },
            { n: 13, text: "Individuals can support wild species by putting up a ___ made from hollow canes.", accept: ["bee hotel"] },
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Part 2",
      passageTitle: "Finding Longitude at Sea",
      intro: "You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2.",
      paragraphs: [
        { label: "A", text: "For most of human history, sailors could work out how far north or south they were with reasonable accuracy. By measuring the angle of the sun at noon, or of the Pole Star at night, a navigator could calculate the ship's latitude. Determining longitude – the position east or west – was an entirely different matter. Because the Earth rotates, there is no fixed point in the sky that reveals how far a ship has travelled around the globe, and for centuries even the most experienced captains were forced to rely on guesswork." },
        { label: "B", text: "The consequences of this uncertainty were often disastrous. Ships regularly missed their destinations, ran short of food and water on voyages that lasted weeks longer than planned, or struck rocks that navigators believed to be many miles away. In 1707, four British warships sank off the Isles of Scilly, south-west of England, with the loss of around 1,400 sailors. The fleet's officers had believed they were safely to the west of the French coast. The tragedy caused a public outcry and persuaded many that a solution was urgently needed." },
        { label: "C", text: "In 1714, the British Parliament passed the Longitude Act, which offered a prize of £20,000 – a vast sum at the time – to anyone who could find a practical method of determining longitude at sea to within half a degree. A committee, later known as the Board of Longitude, was set up to judge proposals. Many of the ideas it received were unworkable, and some were simply absurd. One suggestion involved wounded dogs that would supposedly yelp at a particular time each day when a special powder was applied to a knife at home in London." },
        { label: "D", text: "Scientists, however, understood the principle behind a serious solution. Since the Earth turns through 360 degrees in 24 hours, each hour of difference between local time and the time at a reference point corresponds to 15 degrees of longitude. Local time could be found from the position of the sun. The difficulty lay in knowing the time at the home port while in the middle of the ocean. Astronomers favoured the 'lunar distance' method, in which the position of the moon against the background stars would act as a kind of clock in the sky. But the calculations required were long and complex, and accurate tables of the moon's movements did not yet exist." },
        { label: "E", text: "The alternative was to carry the home port's time on board in a mechanical clock. The problem was that no clock of the period could keep accurate time on a ship. Pendulum clocks were useless on a rolling deck, and changes in temperature and humidity caused metal parts to expand, contract and rust. An error of just a few seconds a day would, over a long voyage, lead to a mistake of many miles." },
        { label: "F", text: "John Harrison, a carpenter from the north of England with no formal education, devoted more than forty years to this challenge. His first marine timekeeper, completed in 1735, was a large and heavy machine that performed well on a trial voyage to Lisbon. Harrison, a perfectionist, was not satisfied and spent the following decades building two further versions. His breakthrough came with a fourth design, completed in 1759, which looked like a large pocket watch just 13 centimetres across. On a voyage to Jamaica in 1761, it lost only five seconds in more than two months at sea." },
        { label: "G", text: "Despite this success, the Board of Longitude was reluctant to award Harrison the full prize. Some of its members were astronomers who continued to favour the lunar method, and they demanded further trials and detailed explanations of how the watch was made. It was only after the intervention of King George III that Parliament awarded Harrison a substantial payment in 1773, when he was eighty years old. Marine chronometers based on his principles eventually became standard equipment on ships, although for many years they were too expensive for most merchant vessels, which continued to rely on the lunar method well into the nineteenth century." },
      ],
      groups: [
        {
          type: "headings",
          instructions: "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.",
          options: [
            { key: "i", text: "The difference between two navigational measurements" },
            { key: "ii", text: "A reward for a practical answer" },
            { key: "iii", text: "Why ordinary timepieces could not be used" },
            { key: "iv", text: "A disaster that demanded action" },
            { key: "v", text: "A long delay in recognition" },
            { key: "vi", text: "How astronomers mapped the stars" },
            { key: "vii", text: "Calculating position from a difference in time" },
            { key: "viii", text: "The persistence of one craftsman" },
            { key: "ix", text: "Early attempts to build clocks on land" },
            { key: "x", text: "Trade routes that changed history" },
          ],
          questions: [
            { n: 14, text: "Paragraph A", answer: "i" },
            { n: 15, text: "Paragraph B", answer: "iv" },
            { n: 16, text: "Paragraph C", answer: "ii" },
            { n: 17, text: "Paragraph D", answer: "vii" },
            { n: 18, text: "Paragraph E", answer: "iii" },
            { n: 19, text: "Paragraph F", answer: "viii" },
            { n: 20, text: "Paragraph G", answer: "v" },
          ],
        },
        {
          type: "mcq",
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              n: 21,
              text: "The 1707 disaster happened because the officers",
              options: [
                { key: "A", text: "ignored warnings from local sailors." },
                { key: "B", text: "were mistaken about the fleet's position." },
                { key: "C", text: "had run out of food and water." },
                { key: "D", text: "chose to sail during a storm." },
              ],
              answer: "B",
            },
            {
              n: 22,
              text: "Why was the lunar distance method difficult to use at first?",
              options: [
                { key: "A", text: "The moon was not visible every night." },
                { key: "B", text: "The instruments needed were too expensive." },
                { key: "C", text: "Reliable data about the moon's movements was not available." },
                { key: "D", text: "Astronomers disagreed about how it worked." },
              ],
              answer: "C",
            },
            {
              n: 23,
              text: "What does the writer say about Harrison's fourth timekeeper?",
              options: [
                { key: "A", text: "It was the first to be tested at sea." },
                { key: "B", text: "It was much smaller than his earlier machines." },
                { key: "C", text: "It took more than forty years to build." },
                { key: "D", text: "It lost five minutes on the voyage to Jamaica." },
              ],
              answer: "B",
            },
          ],
        },
        {
          type: "gap",
          wordLimit: 2,
          instructions: "Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
          questions: [
            { n: 24, text: "Each hour of time difference is equivalent to ___ of longitude.", accept: ["15 degrees", "fifteen degrees"] },
            { n: 25, text: "Changes in ___ and humidity affected the metal parts of clocks.", accept: ["temperature"] },
            { n: 26, text: "For many years, chronometers were too ___ for most merchant vessels.", accept: ["expensive"] },
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Part 3",
      passageTitle: "The Surprising Science of Boredom",
      intro: "You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3.",
      paragraphs: [
        { label: "A", text: "Boredom has long had a poor reputation. Philosophers have described it as a form of spiritual emptiness, and parents routinely try to protect children from it with a constant supply of activities and screens. Yet until surprisingly recently, psychologists paid little attention to boredom at all. It was considered too vague and too ordinary to be worth studying. Over the past two decades, however, a growing body of research has begun to reveal what boredom is, why we experience it, and whether it might serve a useful purpose." },
        { label: "B", text: "One of the first challenges was simply to define the experience. Researchers now generally agree that boredom is not the same as having nothing to do. People can feel bored in a busy meeting, and entirely content while sitting alone on a train. Instead, boredom appears to arise when we want to engage in satisfying activity but are unable to do so. One research team has described it as 'the unpleasant experience of wanting, but being unable, to engage'. Crucially, the problem lies in attention: bored people report finding it hard to concentrate, and they often perceive time as passing unusually slowly." },
        { label: "C", text: "Laboratory studies have shown how unpleasant this state can be. In one widely reported experiment conducted in 2014, participants were asked to sit alone in an empty room for fifteen minutes with nothing to do but think. They had previously been given the option of pressing a button to give themselves a mild electric shock, which most had said they would pay money to avoid. Nevertheless, a quarter of the women and two-thirds of the men chose to shock themselves at least once during the period. For many people, it seems, almost any stimulation is preferable to being left alone with their thoughts." },
        { label: "D", text: "Some researchers argue that this discomfort is precisely what makes boredom valuable. According to this view, boredom functions like pain or hunger: it is a signal that something needs to change. Just as hunger prompts us to look for food, boredom pushes us to abandon unrewarding activities and seek out goals that are more meaningful. Seen in this way, a person who never feels bored might actually be at a disadvantage, lacking an important internal warning system." },
        { label: "E", text: "There is also some evidence that boredom can encourage creativity. In one British study, a group of participants spent fifteen minutes copying numbers from a telephone directory before being asked to think of as many uses as possible for a pair of plastic cups. They produced more ideas, on average, than a control group who went straight to the creative task. The researchers suggested that the tedious activity had caused participants' minds to wander, allowing them to make unusual connections. However, the study was small, and later attempts to repeat the findings have produced mixed results." },
        { label: "F", text: "Not all boredom is harmless. People who are bored very frequently – a trait psychologists call 'boredom proneness' – are more likely to report depression, anxiety and problems with self-control, including overeating and gambling. It is not clear whether boredom causes these difficulties or whether people who struggle with them are simply more easily bored. What does seem clear is that the way people respond to boredom matters. Those who treat it as a prompt to find a new challenge tend to fare better than those who try to escape it through quick distractions." },
        { label: "G", text: "This may have implications for modern life. Smartphones now allow us to fill every spare moment, whether waiting for a bus or standing in a queue. Some psychologists worry that by never allowing ourselves to be bored, we lose the chance to reflect, daydream and reconsider our priorities. Others are less concerned, pointing out that people have always found ways to avoid tedium. Still, the research suggests that occasional boredom need not be feared. Rather than rushing to eliminate it, we might do better to listen to what it is telling us." },
      ],
      groups: [
        {
          type: "ynng",
          instructions: "Do the following statements agree with the claims of the writer in Reading Passage 3? Choose YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          questions: [
            { n: 27, text: "Psychologists have studied boredom in depth for over a century.", answer: "NO" },
            { n: 28, text: "Being alone always causes people to feel bored.", answer: "NO" },
            { n: 29, text: "Bored people tend to feel that time is passing slowly.", answer: "YES" },
            { n: 30, text: "Participants in the 2014 experiment were paid for taking part.", answer: "NOT GIVEN" },
            { n: 31, text: "A person who never feels bored may lack a useful warning signal.", answer: "YES" },
            { n: 32, text: "Smartphone use has been proved to reduce creativity.", answer: "NOT GIVEN" },
          ],
        },
        {
          type: "match",
          instructions: "Reading Passage 3 has seven paragraphs, A–G. Which paragraph contains the following information? Choose the correct letter, A–G.",
          options: ["A", "B", "C", "D", "E", "F", "G"].map((k) => ({ key: k, text: `Paragraph ${k}` })),
          questions: [
            { n: 33, text: "a comparison between boredom and a physical sensation", answer: "D" },
            { n: 34, text: "a reason why researchers once ignored boredom", answer: "A" },
            { n: 35, text: "a finding that has been difficult to reproduce", answer: "E" },
            { n: 36, text: "a description of what boredom is not", answer: "B" },
          ],
        },
        {
          type: "gap",
          wordLimit: 2,
          instructions: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          questions: [
            { n: 37, text: "In the 2014 experiment, a higher proportion of ___ than women gave themselves a shock.", accept: ["men"] },
            { n: 38, text: "In the creativity study, participants copied numbers from a ___.", accept: ["telephone directory"] },
            { n: 39, text: "Psychologists describe people who are bored very often as showing 'boredom ___'.", accept: ["proneness"] },
            { n: 40, text: "People who respond to boredom by looking for a new ___ tend to do better.", accept: ["challenge"] },
          ],
        },
      ],
    },
  ],
};

const writing = {
  task1: {
    minWords: 150,
    recommendedMinutes: 20,
    prompt:
      "The graph below shows the main method of travel to work used by residents of the city of Westbridge between 2000 and 2020.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    chart: {
      type: "line",
      title: "Main method of travel to work, Westbridge (2000–2020)",
      unit: "%",
      categories: ["2000", "2005", "2010", "2015", "2020"],
      yMax: 60,
      series: [
        { name: "Car", values: [58, 55, 49, 44, 38] },
        { name: "Public transport", values: [30, 31, 34, 36, 39] },
        { name: "Bicycle", values: [7, 9, 12, 15, 19] },
        { name: "Walking", values: [5, 5, 5, 5, 4] },
      ],
    },
    keywords: ["car", "public transport", "bicycle", "cycling", "walking", "2000", "2020", "percentage", "proportion"],
  },
  task2: {
    minWords: 250,
    recommendedMinutes: 40,
    prompt:
      "Some people believe that governments should spend money on improving public transport rather than building new roads.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
    keywords: ["government", "public transport", "roads", "traffic", "money", "spend", "invest", "congestion", "pollution", "cars"],
  },
};

const test1 = {
  id: "ielts-academic-1",
  title: "IELTS Academic Mock Test 1",
  description: "Listening · Reading · Writing — to'liq Academic formatdagi original test",
  listening,
  reading,
  writing,
};

export default test1;
