export interface AudioTranscriptLine {
  time: string;
  seconds: number;
  speaker?: string;
  text: string;
}

export interface ListeningQuestionSeed {
  id: string;
  section_id: string;
  question_number: number;
  question_type: 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'MATCHING' | 'TABLE_COMPLETION' | 'FLOWCHART_COMPLETION';
  prompt: string;
  options?: string[];
  correct_answer: string;
  acceptable_answers?: string[];
  explanation_text: string;
  audio_timestamp?: string;
}

export interface ListeningSectionSeed {
  id: string;
  test_id: string;
  title: string;
  section_number: number;
  description: string;
  content_passage: string;
  order_index: number;
  duration_seconds: number;
  transcript_lines: AudioTranscriptLine[];
  questions: ListeningQuestionSeed[];
}

export const IELTS_LISTENING_TEST_1 = {
  test: {
    id: 'test_l1',
    title: 'IELTS Academic Listening Test: Healthy Diet Plan | Stanfield Childcare Centre | Essay Writing | Heliocentrism',
    skill_type: 'LISTENING',
    category: 'ACADEMIC',
    difficulty: 'MEDIUM',
    time_limit_minutes: 30,
  },
  sections: [
    // =========================================================================
    // SECTION 1 (Questions 1 - 10)
    // =========================================================================
    {
      id: 'ts_l1_s1',
      test_id: 'test_l1',
      title: 'SECTION 1: Healthy Eating Plan Discussion',
      section_number: 1,
      order_index: 1,
      duration_seconds: 362, // 06:02
      description: 'You will hear two students, Peter and Mary, discussing their new eating plan.',
      content_passage: `SECTION 1 (Questions 1 - 10)

Questions 1 - 5
Complete the sentences.
Write NO MORE THAN TWO WORDS for each answer.

Example:
Peter consumes far too much soft drink

1. Peter and Mary’s diet will be both sensible and [1] ....................
2. Every two months, they can eat [2] ....................
3. On Saturdays, they will go [3] ....................
4. This coming Saturday, they will go to [4] ....................
5. In every meal, there will be [5] ....................

--------------------------------------------------

Questions 6 - 10
Choose the correct letter, C, I, or B.

Treat Options:
C - Chocolate
I - Ice cream
B - Biscuits

Schedule Table:
• Tuesdays:
  - Peter's opinion: B (Biscuits - Example)
  - Mary's opinion: [6] ....................
• Thursdays:
  - Peter's opinion: [7] ....................
  - Mary's opinion: [8] ....................
• Sundays:
  - Peter's opinion: [9] ....................
  - Mary's opinion: [10] ....................`,
      transcript_lines: [
        { time: '00:00', seconds: 0, speaker: 'Narrator', text: 'Section 1. You will hear two students, Peter and Mary, discussing their new eating plan.' },
        { time: '00:09', seconds: 9, speaker: 'Narrator', text: 'First, you have some time to look at questions 1 to 5.' },
        { time: '00:18', seconds: 18, speaker: 'Narrator', text: 'You will see that there is an example that has been done for you. On this occasion only, the conversation relating to this will be played first.' },
        { time: '00:28', seconds: 28, speaker: 'Peter', text: 'OK, Mary. I know I\'m putting on weight with all my bad eating habits.' },
        { time: '00:34', seconds: 34, speaker: 'Mary', text: 'That\'s right. Chocolate bars, pizzas, and all washed down with liters of soft drink. And with all the sugar in soft drink, I think we can say you\'re definitely overindulging, don\'t you think?' },
        { time: '00:48', seconds: 48, speaker: 'Narrator', text: 'Peter consumes far too much soft drink, so soft drink has been written in the space. Now we shall begin. You should answer the questions as you listen, because you will not hear the recording a second time. Now listen carefully and answer questions 1 to 5.' },
        { time: '01:10', seconds: 70, speaker: 'Peter', text: 'OK, Mary. I know I\'m putting on weight with all my bad eating habits.' },
        { time: '01:15', seconds: 75, speaker: 'Mary', text: 'That\'s right. Chocolate bars, pizzas, and all washed down with liters of soft drink. And with all the sugar in soft drink, I think we can say you\'re definitely overindulging, don\'t you think?' },
        { time: '01:27', seconds: 87, speaker: 'Peter', text: 'I know, I know. I intend to definitely stop drinking that from now on.' },
        { time: '01:33', seconds: 93, speaker: 'Mary', text: 'And that\'s part of the sensible eating plan that we have agreed we need to formulate. One that we can both follow.' },
        { time: '01:40', seconds: 100, speaker: 'Peter', text: 'That\'s right. Sensible and practical. Allowing us to indulge in some sweet foods on occasions.' },
        { time: '01:47', seconds: 107, speaker: 'Mary', text: 'On rare occasions. And we\'re going to cut out all the pizzas and hamburgers.' },
        { time: '01:53', seconds: 113, speaker: 'Peter', text: 'Well, not totally. I thought you said pizzas could be eaten once a week. You know how I like pizzas.' },
        { time: '02:00', seconds: 120, speaker: 'Mary', text: 'No, I said once every two months. Once a week was ice cream, not pizza.' },
        { time: '02:06', seconds: 126, speaker: 'Peter', text: 'Yeah, that\'s because you like ice cream. I prefer pizza.' },
        { time: '02:11', seconds: 131, speaker: 'Mary', text: 'Peter, if you want to lose weight, you need to be disciplined in both what you eat and what you do. Which brings us to the issue of exercise.' },
        { time: '02:20', seconds: 140, speaker: 'Peter', text: 'That\'s right. So jogging twice a week and hiking on Saturdays, right?' },
        { time: '02:27', seconds: 147, speaker: 'Mary', text: 'No, hiking is Sundays, allowing Saturdays for the light walking exercise. I\'ve investigated and discovered there are a lot of walking trails around this suburb, with many beautiful places if you just look around.' },
        { time: '02:40', seconds: 160, speaker: 'Peter', text: 'So what\'s happening this Saturday? A walk around the city?' },
        { time: '02:44', seconds: 164, speaker: 'Mary', text: 'That\'s later in the month. This Saturday we\'ll visit Pine Park.' },
        { time: '02:49', seconds: 169, speaker: 'Peter', text: 'Hill Park is nicer, with great views, too.' },
        { time: '02:52', seconds: 172, speaker: 'Mary', text: 'Yes, but we have to travel too far to reach Hill Park, so I ruled that out. And I love the smell of pines.' },
        { time: '02:59', seconds: 179, speaker: 'Peter', text: 'And what about the weekday meals? Salads every night, I suppose?' },
        { time: '03:05', seconds: 185, speaker: 'Mary', text: 'No, it\'s important to vary the meals so that the food remains interesting and fun. The only common factor is the fruit juice, but otherwise we\'ll have a variety of healthy fare, from salads to fish to lean meat.' },
        { time: '03:18', seconds: 198, speaker: 'Peter', text: 'I\'d rather have meat every night, but you\'re the boss.' },
        { time: '03:22', seconds: 202, speaker: 'Mary', text: 'If you want to lose weight, you\'ll have to accept this program, OK?' },
        { time: '03:26', seconds: 206, speaker: 'Peter', text: 'OK.' },
        { time: '03:30', seconds: 210, speaker: 'Narrator', text: 'Before you hear the rest of the conversation, you have some time to look at questions 6 to 10.' },
        { time: '03:40', seconds: 220, speaker: 'Narrator', text: 'Now listen and answer questions 6 to 10.' },
        { time: '03:45', seconds: 225, speaker: 'Peter', text: 'Now Mary, you said we could have a little treat in our diet plan three times a week, specifically Tuesdays, Thursdays, and Sundays.' },
        { time: '03:54', seconds: 234, speaker: 'Mary', text: 'Yes, a very small treat. But something to reward us for all the discipline shown. Such rewards will motivate us to continue the diet.' },
        { time: '04:03', seconds: 243, speaker: 'Peter', text: 'So on Tuesdays, what can I choose?' },
        { time: '04:06', seconds: 246, speaker: 'Mary', text: 'You have a choice between a small serving of chocolate, ice cream, or biscuits.' },
        { time: '04:11', seconds: 251, speaker: 'Peter', text: 'OK. Well, I\'ll go for the biscuits. I love those crunchy little things with my cup of tea. So do you, right?' },
        { time: '04:19', seconds: 259, speaker: 'Mary', text: 'I do indeed. So I\'ll have them too, saving the ice cream for later.' },
        { time: '04:24', seconds: 264, speaker: 'Peter', text: 'But I know how much you like ice cream, so why don\'t you save it for the end of the week? That will give you the motivation to keep going, and you can have chocolate midweek.' },
        { time: '04:36', seconds: 276, speaker: 'Mary', text: 'That\'s a good idea, but I think the most important thing is for you and I to eat different things on those other two days.' },
        { time: '04:43', seconds: 283, speaker: 'Peter', text: 'Well, if you think that way, I\'ll eat the ice cream on Thursdays, not the chocolate, OK?' },
        { time: '04:49', seconds: 289, speaker: 'Mary', text: 'Well, if you\'re having that, then I can\'t have ice cream. In order to be different, I\'ll have the chocolate.' },
        { time: '04:56', seconds: 296, speaker: 'Peter', text: 'So we can compare our different snacks, and maybe even share a little with each other.' },
        { time: '05:01', seconds: 301, speaker: 'Mary', text: 'Exactly. And the variety and fun involved will take our minds off wanting more.' },
        { time: '05:06', seconds: 306, speaker: 'Peter', text: 'Eating for fun, a good idea.' },
        { time: '05:09', seconds: 309, speaker: 'Mary', text: 'And then you can have the chocolate on Sunday, right?' },
        { time: '05:12', seconds: 312, speaker: 'Peter', text: 'But I like biscuits. Actually, I want biscuits again to have with my cup of tea.' },
        { time: '05:18', seconds: 318, speaker: 'Mary', text: 'But you have the biscuits on Monday, remember? And we can\'t repeat.' },
        { time: '05:22', seconds: 322, speaker: 'Peter', text: 'Oh, come on. This isn\'t fixed in concrete. I can have them again instead of chocolate. You might like variety, but I don\'t. I\'m a creature of habit.' },
        { time: '05:32', seconds: 332, speaker: 'Mary', text: 'Well, the whole point of this was to taste different snacks. But if you want the same thing, OK. I for one am sticking to the original plan, with ice cream to finish the week, and not another dose of chocolate.' },
        { time: '05:47', seconds: 347, speaker: 'Narrator', text: 'That is the end of Section 1. You now have half a minute to check your answers.' }
      ],
      questions: [
        {
          id: 'q_l1_1',
          section_id: 'ts_l1_s1',
          question_number: 1,
          question_type: 'FILL_BLANK',
          prompt: 'Peter and Mary’s diet will be both sensible and 1…………….',
          correct_answer: 'practical',
          acceptable_answers: ['practical'],
          explanation_text: 'Peter: "That\'s right. Sensible and practical. Allowing us to indulge in some sweet foods on occasions."',
          audio_timestamp: '01:40'
        },
        {
          id: 'q_l1_2',
          section_id: 'ts_l1_s1',
          question_number: 2,
          question_type: 'FILL_BLANK',
          prompt: 'Every two months, they can eat 2…………….',
          correct_answer: 'pizzas',
          acceptable_answers: ['pizzas', 'pizza'],
          explanation_text: 'Mary clarifies: "No, I said once every two months. Once a week was ice cream, not pizza."',
          audio_timestamp: '02:00'
        },
        {
          id: 'q_l1_3',
          section_id: 'ts_l1_s1',
          question_number: 3,
          question_type: 'FILL_BLANK',
          prompt: 'On Saturdays, they will go 3…………….',
          correct_answer: 'walking',
          acceptable_answers: ['walking', 'walking exercise', 'for a walk'],
          explanation_text: 'Mary explains: "No, hiking is Sundays, allowing Saturdays for the light walking exercise."',
          audio_timestamp: '02:27'
        },
        {
          id: 'q_l1_4',
          section_id: 'ts_l1_s1',
          question_number: 4,
          question_type: 'FILL_BLANK',
          prompt: 'This coming Saturday, they will go to 4…………….',
          correct_answer: 'Pine Park',
          acceptable_answers: ['Pine Park', 'pine park'],
          explanation_text: 'Mary states: "This Saturday we\'ll visit Pine Park." She ruled Hill Park out because it was too far.',
          audio_timestamp: '02:44'
        },
        {
          id: 'q_l1_5',
          section_id: 'ts_l1_s1',
          question_number: 5,
          question_type: 'FILL_BLANK',
          prompt: 'In every meal, there will be 5…………….',
          correct_answer: 'fruit juice',
          acceptable_answers: ['fruit juice', 'juice'],
          explanation_text: 'Mary notes: "The only common factor is the fruit juice, but otherwise we\'ll have a variety of healthy fare..."',
          audio_timestamp: '03:10'
        },
        {
          id: 'q_l1_6',
          section_id: 'ts_l1_s1',
          question_number: 6,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the correct letter (C, I, or B) for Mary’s opinion on Tuesdays:\nC - Chocolate | I - Ice cream | B - Biscuits',
          options: ['C - Chocolate', 'I - Ice cream', 'B - Biscuits'],
          correct_answer: 'B',
          acceptable_answers: ['B', 'B - Biscuits', 'Biscuits', 'biscuit', 'biscuits'],
          explanation_text: 'Peter chooses biscuits, and Mary responds: "I do indeed. So I\'ll have them too, saving the ice cream for later."',
          audio_timestamp: '04:19'
        },
        {
          id: 'q_l1_7',
          section_id: 'ts_l1_s1',
          question_number: 7,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the correct letter (C, I, or B) for Peter’s opinion on Thursdays:\nC - Chocolate | I - Ice cream | B - Biscuits',
          options: ['C - Chocolate', 'I - Ice cream', 'B - Biscuits'],
          correct_answer: 'I',
          acceptable_answers: ['I', 'I - Ice cream', 'Ice cream', 'ice cream', 'ice-cream'],
          explanation_text: 'Peter says: "Well, if you think that way, I\'ll eat the ice cream on Thursdays, not the chocolate, OK?"',
          audio_timestamp: '04:43'
        },
        {
          id: 'q_l1_8',
          section_id: 'ts_l1_s1',
          question_number: 8,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the correct letter (C, I, or B) for Mary’s opinion on Thursdays:\nC - Chocolate | I - Ice cream | B - Biscuits',
          options: ['C - Chocolate', 'I - Ice cream', 'B - Biscuits'],
          correct_answer: 'C',
          acceptable_answers: ['C', 'C - Chocolate', 'Chocolate', 'chocolate'],
          explanation_text: 'Mary replies: "In order to be different, I\'ll have the chocolate."',
          audio_timestamp: '04:49'
        },
        {
          id: 'q_l1_9',
          section_id: 'ts_l1_s1',
          question_number: 9,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the correct letter (C, I, or B) for Peter’s opinion on Sundays:\nC - Chocolate | I - Ice cream | B - Biscuits',
          options: ['C - Chocolate', 'I - Ice cream', 'B - Biscuits'],
          correct_answer: 'B',
          acceptable_answers: ['B', 'B - Biscuits', 'Biscuits', 'biscuit', 'biscuits'],
          explanation_text: 'Peter insists: "Actually, I want biscuits again to have with my cup of tea... I can have them again instead of chocolate."',
          audio_timestamp: '05:12'
        },
        {
          id: 'q_l1_10',
          section_id: 'ts_l1_s1',
          question_number: 10,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Choose the correct letter (C, I, or B) for Mary’s opinion on Sundays:\nC - Chocolate | I - Ice cream | B - Biscuits',
          options: ['C - Chocolate', 'I - Ice cream', 'B - Biscuits'],
          correct_answer: 'I',
          acceptable_answers: ['I', 'I - Ice cream', 'Ice cream', 'ice cream', 'ice-cream'],
          explanation_text: 'Mary concludes: "I for one am sticking to the original plan, with ice cream to finish the week, and not another dose of chocolate."',
          audio_timestamp: '05:39'
        }
      ]
    },

    // =========================================================================
    // SECTION 2 (Questions 11 - 20)
    // =========================================================================
    {
      id: 'ts_l1_s2',
      test_id: 'test_l1',
      title: 'SECTION 2: Stanfield Childcare Centre Presentation',
      section_number: 2,
      order_index: 2,
      duration_seconds: 312, // 05:12
      description: 'You will hear a childcare worker telling some mothers about the advantages of her centre.',
      content_passage: `SECTION 2 (Questions 11 - 20)

Questions 11 - 16
Complete the table.
Write NO MORE THAN TWO WORDS for each answer.

Advantages of Stanfield Childcare Centre:

• Advantage 1:
  - Detail: Walls are [11] ....................
  - Another Detail: includes the [12] ....................

• Advantage 2:
  - Detail: Teachers are able to teach a [13] ....................
  - Another Detail: There are many special [14] ....................

• Advantage 3:
  - Detail: They [15] .................... surfaces daily.
  - Another Detail: procedures to limit the spread of [16] ....................

--------------------------------------------------

Questions 17 - 20
Choose the correct letter, A, B, or C.
NB You may use a letter more than once.

Staff members:
A - Andrea
B - Bella
C - Cathy

Which childcare worker:
17. has her own children?
18. often sleeps at the center?
19. is good with shy children?
20. is a good cook?`,
      transcript_lines: [
        { time: '00:00', seconds: 0, speaker: 'Narrator', text: 'Section 2. You will hear a childcare worker telling some mothers about the advantages of her centre.' },
        { time: '00:09', seconds: 9, speaker: 'Narrator', text: 'First, you have some time to look at questions 11 to 16.' },
        { time: '00:17', seconds: 17, speaker: 'Narrator', text: 'Now listen carefully and answer questions 11 to 16.' },
        { time: '00:22', seconds: 22, speaker: 'Speaker', text: 'Hello everyone, and welcome to the Stanfield Childcare Centre.' },
        { time: '00:27', seconds: 27, speaker: 'Speaker', text: 'Now I know you\'re all new mothers, and you like to cling to your children. You\'ve certainly spent a lot of time raising them to the age of four, and are perhaps reluctant to leave them here at our centre.' },
        { time: '00:39', seconds: 39, speaker: 'Speaker', text: 'Well, one of the first things you should understand is that here it is safe, very safe.' },
        { time: '00:45', seconds: 45, speaker: 'Speaker', text: 'Look around and you\'ll see that every room has padded walls. Other centres have standard painted walls, but here, we have invested a lot to ensure your children will not hurt themselves when running around and possibly tripping over.' },
        { time: '00:59', seconds: 59, speaker: 'Speaker', text: 'This padding extends around all corners. That is, the areas most likely to bruise and cut your active little child. So, you can rest assured that any accidents of a physical nature are not likely to happen here.' },
        { time: '01:14', seconds: 74, speaker: 'Speaker', text: 'Now, you don\'t want to dump your child at this centre and let them waste their time. You want them to learn, and that\'s one of the greatest assets of our establishment.' },
        { time: '01:25', seconds: 85, speaker: 'Speaker', text: 'Our staff are not only trained childcare workers, but all of them have a special skill which they can impart to your child. Whether it be teaching the ABC, some basic mathematics, artistic skills, or physical education.' },
        { time: '01:40', seconds: 100, speaker: 'Speaker', text: 'We are particularly known for our preschool literacy program, and have a wealth of learning toys specially designed to develop your child\'s potential.' },
        { time: '01:50', seconds: 110, speaker: 'Speaker', text: 'Of course, one concern many mothers have is that, in environments such as these, colds and flus and other viral nasties can be easily spread around. It\'s a very legitimate concern, and one which we take seriously, and we pride ourselves on our precautions.' },
        { time: '02:09', seconds: 129, speaker: 'Speaker', text: 'For a start, unlike most centres which clean with standard detergents, we disinfect every surface at the end of every day using a special disinfectant wash.' },
        { time: '02:21', seconds: 141, speaker: 'Speaker', text: 'Some places just wipe surfaces daily with a damp cloth, but not us, and that\'s just the start. We also physically check your children when they arrive every day, and if we feel your child is sick, we ask him or her to wear a face mask to ensure germs are not transmitted.' },
        { time: '02:40', seconds: 160, speaker: 'Speaker', text: 'If your child is noticeably sick, then we ask you to take them back home to recover. This might sound a little unkind, but we hope parents can understand that these measures are for the benefit of all.' },
        { time: '02:55', seconds: 175, speaker: 'Narrator', text: 'Before you hear the rest of the talk, you have some time to look at questions 17 to 20.' },
        { time: '03:09', seconds: 189, speaker: 'Narrator', text: 'Now listen and answer questions 17 to 20.' },
        { time: '03:14', seconds: 194, speaker: 'Speaker', text: 'Now at Stanfield Childcare Centre, we have excellent childcare officers, and let me briefly introduce them. We have Susan, Andrea, Bella, Cathy, Lisa, and Liz.' },
        { time: '03:29', seconds: 209, speaker: 'Speaker', text: 'They\'re all fully trained and come with some individual assets which make them even better.' },
        { time: '03:35', seconds: 215, speaker: 'Speaker', text: 'Bella, for instance, knows children very well, having worked here for five years. And Cathy has her own family - two little girls. So she can talk to you with first-hand knowledge of what it\'s really like to raise children.' },
        { time: '03:50', seconds: 230, speaker: 'Speaker', text: 'But getting back to Bella, she often relaxes here after work, spending long hours chatting to parents, as does Cathy in fact.' },
        { time: '04:00', seconds: 240, speaker: 'Speaker', text: 'But in terms of hours, nothing can compare to Andrea, who will sometimes spend the night here, staying in our overnight room. Why? Because this centre is very friendly, and simply a great place to be.' },
        { time: '04:15', seconds: 255, speaker: 'Speaker', text: 'Bella, for example, used to be quite shy herself, but now is marvelous with the little kiddies, as outgoing as any of them.' },
        { time: '04:25', seconds: 265, speaker: 'Speaker', text: 'We let Cathy though deal with the particularly quiet and introverted children, since having her own family, she knows what can really bring them out.' },
        { time: '04:35', seconds: 275, speaker: 'Speaker', text: 'Of course, what better way to do this than with yummy home-made cakes, and Cathy often gets these from Bella, who can make some of the best in town.' },
        { time: '04:45', seconds: 285, speaker: 'Speaker', text: 'Yes, everyone here brings something special, which is why we\'re one of the best childcare centres in the business.' },
        { time: '04:54', seconds: 294, speaker: 'Narrator', text: 'That is the end of Section 2. You now have half a minute to check your answers.' }
      ],
      questions: [
        {
          id: 'q_l1_11',
          section_id: 'ts_l1_s2',
          question_number: 11,
          question_type: 'FILL_BLANK',
          prompt: 'Walls are 11…………….',
          correct_answer: 'padded',
          acceptable_answers: ['padded'],
          explanation_text: 'Speaker: "Look around and you\'ll see that every room has padded walls."',
          audio_timestamp: '00:47'
        },
        {
          id: 'q_l1_12',
          section_id: 'ts_l1_s2',
          question_number: 12,
          question_type: 'FILL_BLANK',
          prompt: 'includes the 12…………….',
          correct_answer: 'all corners',
          acceptable_answers: ['all corners', 'corners', 'the corners'],
          explanation_text: 'Speaker: "This padding extends around all corners. That is, the areas most likely to bruise and cut your active little child."',
          audio_timestamp: '01:00'
        },
        {
          id: 'q_l1_13',
          section_id: 'ts_l1_s2',
          question_number: 13,
          question_type: 'FILL_BLANK',
          prompt: 'Teachers are able to teach a 13…………….',
          correct_answer: 'special skill',
          acceptable_answers: ['special skill', 'skill'],
          explanation_text: 'Speaker: "all of them have a special skill which they can impart to your child."',
          audio_timestamp: '01:28'
        },
        {
          id: 'q_l1_14',
          section_id: 'ts_l1_s2',
          question_number: 14,
          question_type: 'FILL_BLANK',
          prompt: 'There are many special 14…………….',
          correct_answer: 'learning toys',
          acceptable_answers: ['learning toys', 'toys'],
          explanation_text: 'Speaker: "and have a wealth of learning toys specially designed to develop your child\'s potential."',
          audio_timestamp: '01:45'
        },
        {
          id: 'q_l1_15',
          section_id: 'ts_l1_s2',
          question_number: 15,
          question_type: 'FILL_BLANK',
          prompt: 'They 15……………. surfaces daily.',
          correct_answer: 'disinfect',
          acceptable_answers: ['disinfect', 'disinfect every'],
          explanation_text: 'Speaker: "we disinfect every surface at the end of every day using a special disinfectant wash."',
          audio_timestamp: '02:14'
        },
        {
          id: 'q_l1_16',
          section_id: 'ts_l1_s2',
          question_number: 16,
          question_type: 'FILL_BLANK',
          prompt: 'procedures to limit the spread of 16…………….',
          correct_answer: 'germs',
          acceptable_answers: ['germs', 'colds and flus', 'infection'],
          explanation_text: 'Speaker: "...we ask him or her to wear a face mask to ensure germs are not transmitted."',
          audio_timestamp: '02:37'
        },
        {
          id: 'q_l1_17',
          section_id: 'ts_l1_s2',
          question_number: 17,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Which childcare worker has her own children?\nA - Andrea | B - Bella | C - Cathy',
          options: ['A - Andrea', 'B - Bella', 'C - Cathy'],
          correct_answer: 'C',
          acceptable_answers: ['C', 'C - Cathy', 'Cathy', 'cathy'],
          explanation_text: 'Speaker: "And Cathy has her own family - two little girls."',
          audio_timestamp: '03:41'
        },
        {
          id: 'q_l1_18',
          section_id: 'ts_l1_s2',
          question_number: 18,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Which childcare worker often sleeps at the center?\nA - Andrea | B - Bella | C - Cathy',
          options: ['A - Andrea', 'B - Bella', 'C - Cathy'],
          correct_answer: 'A',
          acceptable_answers: ['A', 'A - Andrea', 'Andrea', 'andrea'],
          explanation_text: 'Speaker: "nothing can compare to Andrea, who will sometimes spend the night here, staying in our overnight room."',
          audio_timestamp: '04:02'
        },
        {
          id: 'q_l1_19',
          section_id: 'ts_l1_s2',
          question_number: 19,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Which childcare worker is good with shy children?\nA - Andrea | B - Bella | C - Cathy',
          options: ['A - Andrea', 'B - Bella', 'C - Cathy'],
          correct_answer: 'C',
          acceptable_answers: ['C', 'C - Cathy', 'Cathy', 'cathy'],
          explanation_text: 'Speaker: "We let Cathy though deal with the particularly quiet and introverted children, since having her own family, she knows what can really bring them out."',
          audio_timestamp: '04:26'
        },
        {
          id: 'q_l1_20',
          section_id: 'ts_l1_s2',
          question_number: 20,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Which childcare worker is a good cook?\nA - Andrea | B - Bella | C - Cathy',
          options: ['A - Andrea', 'B - Bella', 'C - Cathy'],
          correct_answer: 'B',
          acceptable_answers: ['B', 'B - Bella', 'Bella', 'bella'],
          explanation_text: 'Speaker: "and Cathy often gets these [yummy home-made cakes] from Bella, who can make some of the best in town."',
          audio_timestamp: '04:40'
        }
      ]
    },

    // =========================================================================
    // SECTION 3 (Questions 21 - 30)
    // =========================================================================
    {
      id: 'ts_l1_s3',
      test_id: 'test_l1',
      title: 'SECTION 3: Essay Writing Tutorial with Miss Harris',
      section_number: 3,
      order_index: 3,
      duration_seconds: 357, // 05:57
      description: 'You will hear a student, Eric, talking to his lecturer, Miss Harris, about essay writing.',
      content_passage: `SECTION 3 (Questions 21 - 30)

Questions 21 - 25
Complete the flowchart.
Write ONE WORD ONLY for each answer.

Foundation for Essay Writing:
Decide on [21] .................... you like.
        ↓
Focus on [22] .................... area of interest.
        ↓
Write [23] .................... statement.
        ↓
Create [24] ....................
        ↓
Ensure this [25] .................... clearly

--------------------------------------------------

Questions 26 - 30
Complete the summary.
Write NO MORE THAN TWO WORDS OR A NUMBER for each answer.

There are several [26] .................... involved in producing a good essay. The writer must think independently and give [27] .................... examples as support, each one with a reference (which is a [28] ....................). The formatting must follow the [29] .................... issued by the university, as well as the word count decided by the lecturer, although it can vary by [30] ....................`,
      transcript_lines: [
        { time: '00:00', seconds: 0, speaker: 'Narrator', text: 'Section 3. You will hear a student, Eric, talking to his lecturer, Miss Harris, about essay writing.' },
        { time: '00:10', seconds: 10, speaker: 'Narrator', text: 'First, you have some time to look at questions 21 to 25.' },
        { time: '00:24', seconds: 24, speaker: 'Narrator', text: 'Now listen carefully and answer questions 21 to 25.' },
        { time: '00:30', seconds: 30, speaker: 'Eric', text: 'Hi, Miss Harris. Here we are talking once again.' },
        { time: '00:34', seconds: 34, speaker: 'Miss Harris', text: 'Well, I\'m always willing to help out wherever possible. Is anything troubling you?' },
        { time: '00:39', seconds: 39, speaker: 'Eric', text: 'Well, your advice last week about writing summaries was very useful, and I\'m using these summaries a lot in order to prepare my final Master\'s thesis.' },
        { time: '00:50', seconds: 50, speaker: 'Miss Harris', text: 'But you\'re having problems, right?' },
        { time: '00:52', seconds: 52, speaker: 'Eric', text: 'Yes, I have a few issues to discuss. Obviously, I want a good essay and I want to achieve high marks, but I\'m not sure on the best way to start.' },
        { time: '01:03', seconds: 63, speaker: 'Miss Harris', text: 'That\'s an easy question. Start with a topic, but not one that I necessarily suggest, but one that you want to explore. You will always write better when doing so on a topic you are interested in, not one imposed upon you by others.' },
        { time: '01:18', seconds: 78, speaker: 'Eric', text: 'Well, I\'m interested in management theory.' },
        { time: '01:21', seconds: 81, speaker: 'Miss Harris', text: 'Then pursue that. However, that alone is far too broad. Break it into various current areas of discussion and relevance, then look more carefully at one of them. Say, management and cultural differences, or management and motivation, or other aspects, such as the role of salary, group cohesion, or leadership.' },
        { time: '01:44', seconds: 104, speaker: 'Eric', text: 'I would say I\'m interested in group cohesion, that is, how people interact in the workplace.' },
        { time: '01:51', seconds: 111, speaker: 'Miss Harris', text: 'Well, that\'s a start. But you can\'t then just write planlessly without defining exactly what you intend to do within the area you\'ve chosen. You\'ll have to think of a thesis, and this statement could be of several types.' },
        { time: '02:04', seconds: 124, speaker: 'Eric', text: 'Such as what?' },
        { time: '02:06', seconds: 126, speaker: 'Miss Harris', text: 'Oh, you could argue a point, something that you believe in, or discuss an issue, looking at its various perspectives, or critique the opinions of others, pointing out the pitfalls and flaws. The thesis statement will make that very clear because it will say, in simple terms, what you intend to achieve in your essay.' },
        { time: '02:26', seconds: 146, speaker: 'Eric', text: 'I see. And then I can just begin writing, right?' },
        { time: '02:30', seconds: 150, speaker: 'Miss Harris', text: 'Wrong. Huh? If your essay is going to be clear, it needs to be logical and organized, and this means you\'ll need an outline. This could be written as a flowchart, or spidergraph, that is a series of connected lines. But whatever shape the outline takes, there must be a sense of progress in more or less a straight line towards a goal.' },
        { time: '02:52', seconds: 172, speaker: 'Eric', text: 'And then my essay will be good?' },
        { time: '02:54', seconds: 174, speaker: 'Miss Harris', text: 'With such progression definitely, as long as you do achieve everything that you set out to do, as specified in the beginning, OK?' },
        { time: '03:04', seconds: 184, speaker: 'Narrator', text: 'Before you hear the rest of the conversation, you have some time to look at questions 26 to 30.' },
        { time: '03:19', seconds: 199, speaker: 'Narrator', text: 'Now listen and answer questions 26 to 30.' },
        { time: '03:25', seconds: 205, speaker: 'Eric', text: 'Well, Miss Harris, your advice about essay writing all sounds very useful, solid and step-by-step, so I\'ll certainly follow that. But can you tell me in more general terms what constitutes the best essay?' },
        { time: '03:39', seconds: 219, speaker: 'Miss Harris', text: 'Oh, there are many aspects to consider, but one of the most important is certainly original thinking. The best essays are written by people who think for themselves and not just copy or imitate established views.' },
        { time: '03:53', seconds: 233, speaker: 'Eric', text: 'I think I can do that.' },
        { time: '03:55', seconds: 235, speaker: 'Miss Harris', text: 'But remember, you can\'t just give a list of unsupported assertions. There needs to be support as well. A chain of logic linking each step in your argument.' },
        { time: '04:04', seconds: 244, speaker: 'Eric', text: 'Right.' },
        { time: '04:05', seconds: 245, speaker: 'Miss Harris', text: 'Yet that alone is not enough. Your argument may be logically sound, but is it practically so? For that, you need examples from real life to illustrate your points or sub-points.' },
        { time: '04:17', seconds: 257, speaker: 'Eric', text: 'I\'ve got lots of examples from my course readings. I suppose I could use them.' },
        { time: '04:22', seconds: 262, speaker: 'Miss Harris', text: 'But remember, whenever you use an example, or facts or figures that are not commonly known, you must give a reference. That\'s an academic necessity, without which your writing will automatically fail.' },
        { time: '04:35', seconds: 275, speaker: 'Eric', text: 'So it\'s necessary to give these, right?' },
        { time: '04:39', seconds: 279, speaker: 'Miss Harris', text: 'Absolutely. And with that, your essay will be fine. But always ensure that you format it clearly.' },
        { time: '04:45', seconds: 285, speaker: 'Eric', text: 'What do you mean?' },
        { time: '04:46', seconds: 286, speaker: 'Miss Harris', text: 'I mean the practical considerations, as written in the university style guide, such as leaving appropriate margins, using double spacing, Arial font, and so on. You see, your writing must look good as well as be good.' },
        { time: '05:03', seconds: 303, speaker: 'Eric', text: 'I can certainly do that.' },
        { time: '05:05', seconds: 305, speaker: 'Miss Harris', text: 'And finally, related to the previous point, you need to respect the number of words required. Your individual lecturers will give you a word count figure, so follow what they say, making your essay neither too long nor too short. Perhaps 10% either way should be acceptable. 15% was common when I was younger, but it\'s a lot stricter now, and 20% would be pushing the boundaries just a little too far.' },
        { time: '05:32', seconds: 332, speaker: 'Eric', text: 'I guess I can do all that. Thanks for your advice.' },
        { time: '05:37', seconds: 337, speaker: 'Narrator', text: 'That is the end of Section 3. You now have half a minute to check your answers.' }
      ],
      questions: [
        {
          id: 'q_l1_21',
          section_id: 'ts_l1_s3',
          question_number: 21,
          question_type: 'FILL_BLANK',
          prompt: 'Decide on 21……………. you like.',
          correct_answer: 'topic',
          acceptable_answers: ['topic', 'a topic'],
          explanation_text: 'Miss Harris: "Start with a topic, but not one that I necessarily suggest, but one that you want to explore."',
          audio_timestamp: '01:05'
        },
        {
          id: 'q_l1_22',
          section_id: 'ts_l1_s3',
          question_number: 22,
          question_type: 'FILL_BLANK',
          prompt: 'Focus on 22……………. area of interest.',
          correct_answer: 'one',
          acceptable_answers: ['one', 'specific', 'current'],
          explanation_text: 'Miss Harris: "Break it into various current areas of discussion and relevance, then look more carefully at one of them."',
          audio_timestamp: '01:31'
        },
        {
          id: 'q_l1_23',
          section_id: 'ts_l1_s3',
          question_number: 23,
          question_type: 'FILL_BLANK',
          prompt: 'Write 23……………. statement.',
          correct_answer: 'thesis',
          acceptable_answers: ['thesis', 'a thesis'],
          explanation_text: 'Miss Harris: "You\'ll have to think of a thesis, and this statement could be of several types... The thesis statement will make that very clear..."',
          audio_timestamp: '02:00'
        },
        {
          id: 'q_l1_24',
          section_id: 'ts_l1_s3',
          question_number: 24,
          question_type: 'FILL_BLANK',
          prompt: 'Create 24…………….',
          correct_answer: 'outline',
          acceptable_answers: ['outline', 'an outline'],
          explanation_text: 'Miss Harris: "and this means you\'ll need an outline. This could be written as a flowchart, or spidergraph..."',
          audio_timestamp: '02:37'
        },
        {
          id: 'q_l1_25',
          section_id: 'ts_l1_s3',
          question_number: 25,
          question_type: 'FILL_BLANK',
          prompt: 'Ensure this 25……………. clearly',
          correct_answer: 'progresses',
          acceptable_answers: ['progresses', 'progress', 'proceeds', 'flows', 'progression'],
          explanation_text: 'Miss Harris: "there must be a sense of progress in more or less a straight line towards a goal. With such progression definitely..."',
          audio_timestamp: '02:48'
        },
        {
          id: 'q_l1_26',
          section_id: 'ts_l1_s3',
          question_number: 26,
          question_type: 'FILL_BLANK',
          prompt: 'There are several 26……………. involved in producing a good essay.',
          correct_answer: 'aspects',
          acceptable_answers: ['aspects', 'aspect'],
          explanation_text: 'Miss Harris: "Oh, there are many aspects to consider, but one of the most important is certainly original thinking."',
          audio_timestamp: '03:40'
        },
        {
          id: 'q_l1_27',
          section_id: 'ts_l1_s3',
          question_number: 27,
          question_type: 'FILL_BLANK',
          prompt: 'The writer must think independently and give 27……………. examples as support,',
          correct_answer: 'real life',
          acceptable_answers: ['real life', 'real-life', 'real'],
          explanation_text: 'Miss Harris: "For that, you need examples from real life to illustrate your points or sub-points."',
          audio_timestamp: '04:14'
        },
        {
          id: 'q_l1_28',
          section_id: 'ts_l1_s3',
          question_number: 28,
          question_type: 'FILL_BLANK',
          prompt: 'each one with a reference (which is a 28…………….).',
          correct_answer: 'necessity',
          acceptable_answers: ['necessity', 'academic necessity'],
          explanation_text: 'Miss Harris: "you must give a reference. That\'s an academic necessity, without which your writing will automatically fail."',
          audio_timestamp: '04:31'
        },
        {
          id: 'q_l1_29',
          section_id: 'ts_l1_s3',
          question_number: 29,
          question_type: 'FILL_BLANK',
          prompt: 'The formatting must follow the 29……………. issued by the university,',
          correct_answer: 'style guide',
          acceptable_answers: ['style guide', 'style-guide', 'guide'],
          explanation_text: 'Miss Harris: "I mean the practical considerations, as written in the university style guide, such as leaving appropriate margins..."',
          audio_timestamp: '04:50'
        },
        {
          id: 'q_l1_30',
          section_id: 'ts_l1_s3',
          question_number: 30,
          question_type: 'FILL_BLANK',
          prompt: 'as well as the word count decided by the lecturer, although it can vary by 30…………….',
          correct_answer: '10%',
          acceptable_answers: ['10%', '10 percent', 'ten percent', '10'],
          explanation_text: 'Miss Harris: "making your essay neither too long nor too short. Perhaps 10% either way should be acceptable."',
          audio_timestamp: '05:20'
        }
      ]
    },

    // =========================================================================
    // SECTION 4 (Questions 31 - 40)
    // =========================================================================
    {
      id: 'ts_l1_s4',
      test_id: 'test_l1',
      title: 'SECTION 4: History of Geocentrism vs Heliocentrism Lecture',
      section_number: 4,
      order_index: 4,
      duration_seconds: 357, // 05:57
      description: 'You will hear a lecturer discussing the history of people\'s beliefs regarding whether the sun or the earth is at the centre of the solar system.',
      content_passage: `SECTION 4 (Questions 31 - 40)

Questions 31 - 33
Choose the correct letter, A, B, or C.

31. Geocentrism
A   has a long history.
B   is similar to heliocentrism.
C   took some time to be deduced.

32. Heliocentrism
A   was realised only recently.
B   was not generally accepted.
C   fitted the views of the church.

33. The night sky
A   is relatively simple.
B   remains basically the same.
C   was once used for navigation.

--------------------------------------------------

Questions 34 - 40
Complete the notes.
Write ONE WORD OR A NUMBER for each answer.

Nicolaus Copernicus
• started the Copernican [34] ....................
• his book published the year he was [35] .................... and then passed away
• This book generated little [36] ....................

Other scientists
• Galileo was persecuted.
• [37] .................... was killed.
• even the sun believed to be in [38] ....................

Modern geocentrism
• based on the [39] ....................
• Believers also support creationism.
• [40] .................... of Americans believe in this.`,
      transcript_lines: [
        { time: '00:00', seconds: 0, speaker: 'Lecturer', text: 'Section 4. You will hear a lecturer discussing the history of people\'s beliefs regarding whether the sun or the earth is at the centre of the solar system.' },
        { time: '00:13', seconds: 13, speaker: 'Lecturer', text: 'First, you have some time to look at questions 31 to 33.' },
        { time: '00:23', seconds: 23, speaker: 'Lecturer', text: 'Now listen carefully and answer questions 31 to 33.' },
        { time: '00:28', seconds: 28, speaker: 'Lecturer', text: 'In the night sky, the stars appear to revolve around the Earth, rising in the east and disappearing in the west. The Earth itself seems solid, fixed, and stable. And such common sense perception suggests that the Earth is the centre of the universe.' },
        { time: '00:48', seconds: 48, speaker: 'Lecturer', text: 'This is known as geocentrism, with geo meaning Earth, and all pre-modern civilizations drew this conclusion.' },
        { time: '00:57', seconds: 57, speaker: 'Lecturer', text: 'We now know, of course, that the Earth revolves around the sun, and this is called heliocentrism, with helio meaning sun. But historically, it took quite a while for this to be deduced.' },
        { time: '01:11', seconds: 71, speaker: 'Lecturer', text: 'As early as the 3rd century BC, an ancient Greek astronomer, Aristarchus of Samos, proposed heliocentrism, but received little support from his peers. Similarly, throughout subsequent history, isolated individuals proposed this new idea, but again, no one was listening.' },
        { time: '01:33', seconds: 93, speaker: 'Lecturer', text: 'Geocentrism just seemed too logical to refute. Geocentrism also fitted the views of the established Christian Church, who could quote biblical passages such as "the world also shall be stable, that it be not moved". Those who dared disagree were subject to accusations of heresy, often with dire punishments to follow.' },
        { time: '01:58', seconds: 118, speaker: 'Lecturer', text: 'The trouble was, as the night sky was observed more closely, that simple revolution of the stars proved not so simple at all. In relation to the other stars, some steadily wandered in given directions, then sometimes reversed for months and disappeared altogether. They were called planets, meaning wanderers.' },
        { time: '02:22', seconds: 142, speaker: 'Lecturer', text: 'In addition, the position of the sun and moon altered slightly over the year, and comets, those mysterious glowing spots, would come and go. In order to predict the motion of the planets, and accurately serve the primary purpose of navigation for sailing ships, increasingly elaborate mathematical models were needed—a sure sign that something was not quite right.' },
        { time: '02:49', seconds: 169, speaker: 'Lecturer', text: 'Before you hear the rest of the lecture, you have some time to look at questions 34 to 40.' },
        { time: '03:05', seconds: 185, speaker: 'Lecturer', text: 'Now listen and answer questions 34 to 40.' },
        { time: '03:10', seconds: 190, speaker: 'Lecturer', text: 'Heliocentrism, or the belief that the sun is the centre of the solar system, still needed a mathematically sound description before it could be scientifically accepted.' },
        { time: '03:22', seconds: 202, speaker: 'Lecturer', text: 'And it was a Polish astronomer, Nicolaus Copernicus, who in 1543 first published this. This event is sometimes referred to as the Copernican revolution.' },
        { time: '03:36', seconds: 216, speaker: 'Lecturer', text: 'Copernicus himself certainly feared the consequences of his proof, knowing full well it might invoke the anger of the established Church. Probably for this reason, he waited until the last year of his life, when he was sick and dying, to release his findings.' },
        { time: '03:54', seconds: 234, speaker: 'Lecturer', text: 'In addition, the preface of the book, written by a respected member of the Church, stated that the model was not necessarily correct. As a result of this, there was no revolution whatsoever. In fact, the book received scant attention in the subsequent decades, apart from a few irate clergymen who angrily dismissed the whole scheme as irrelevant.' },
        { time: '04:19', seconds: 259, speaker: 'Lecturer', text: 'Yet the following generations of astronomers did not always fare so well. The Italian scientist Galileo got into trouble, as did a fellow Italian with the surname Bruno—Giordano Bruno, who was burnt at the stake.' },
        { time: '04:36', seconds: 276, speaker: 'Lecturer', text: 'Yet ultimately, nothing could slow the spread of heliocentrism across Europe. It formed the basis of Isaac Newton\'s great work on the motion of the planets, a work which implied that even the sun, around which the Earth circled, was itself in motion around a common centre of gravity.' },
        { time: '04:55', seconds: 295, speaker: 'Lecturer', text: 'No discourse about heliocentrism could finish without mentioning that, somewhat unbelievably, there still exist those today who choose to believe that the Earth is the centre of the universe. Modern geocentrism is usually the result of literal interpretations of the Bible, which is the cornerstone of these people\'s beliefs. They therefore also believe in creationism, that is, that a God created everything.' },
        { time: '05:23', seconds: 323, speaker: 'Lecturer', text: 'And while we may smile at this, it is sobering to consider that surveys have revealed that up to 10% of British people, 12% of Europeans, 20% of the USA, and 25% of the Middle East still hold the belief that the sun revolves around the Earth. One can only wonder what Copernicus would have thought of this.' },
        { time: '05:46', seconds: 346, speaker: 'Lecturer', text: 'That is the end of Section 4. You now have half a minute to check your answers.' }
      ],
      questions: [
        {
          id: 'q_l1_31',
          section_id: 'ts_l1_s4',
          question_number: 31,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Geocentrism\nA   has a long history.\nB   is similar to heliocentrism.\nC   took some time to be deduced.',
          options: ['A   has a long history.', 'B   is similar to heliocentrism.', 'C   took some time to be deduced.'],
          correct_answer: 'A',
          acceptable_answers: ['A', 'A   has a long history.', 'has a long history.'],
          explanation_text: 'Lecturer: "This is known as geocentrism, with geo meaning Earth, and all pre-modern civilizations drew this conclusion... Geocentrism has a long history."',
          audio_timestamp: '00:48'
        },
        {
          id: 'q_l1_32',
          section_id: 'ts_l1_s4',
          question_number: 32,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'Heliocentrism\nA   was realised only recently.\nB   was not generally accepted.\nC   fitted the views of the church.',
          options: ['A   was realised only recently.', 'B   was not generally accepted.', 'C   fitted the views of the church.'],
          correct_answer: 'B',
          acceptable_answers: ['B', 'B   was not generally accepted.', 'was not generally accepted.'],
          explanation_text: 'Lecturer explains that Aristarchus proposed it early on but "received little support", and later "isolated individuals proposed this new idea, but again no one was listening". It was not generally accepted.',
          audio_timestamp: '01:11'
        },
        {
          id: 'q_l1_33',
          section_id: 'ts_l1_s4',
          question_number: 33,
          question_type: 'MULTIPLE_CHOICE',
          prompt: 'The night sky\nA   is relatively simple.\nB   remains basically the same.\nC   was once used for navigation.',
          options: ['A   is relatively simple.', 'B   remains basically the same.', 'C   was once used for navigation.'],
          correct_answer: 'C',
          acceptable_answers: ['C', 'C   was once used for navigation.', 'was once used for navigation.'],
          explanation_text: 'Lecturer: "In order to predict the motion of the planets, and accurately serve the primary purpose of navigation for sailing ships..."',
          audio_timestamp: '02:37'
        },
        {
          id: 'q_l1_34',
          section_id: 'ts_l1_s4',
          question_number: 34,
          question_type: 'FILL_BLANK',
          prompt: 'Nicolaus Copernicus: started the Copernican 34…………….',
          correct_answer: 'revolution',
          acceptable_answers: ['revolution'],
          explanation_text: 'Lecturer: "This event is sometimes referred to as the Copernican revolution."',
          audio_timestamp: '03:32'
        },
        {
          id: 'q_l1_35',
          section_id: 'ts_l1_s4',
          question_number: 35,
          question_type: 'FILL_BLANK',
          prompt: 'Nicolaus Copernicus: his book published the year he was 35……………. and then passed away',
          correct_answer: 'dying',
          acceptable_answers: ['dying', 'sick'],
          explanation_text: 'Lecturer: "he waited until the last year of his life, when he was sick and dying, to release his findings."',
          audio_timestamp: '03:48'
        },
        {
          id: 'q_l1_36',
          section_id: 'ts_l1_s4',
          question_number: 36,
          question_type: 'FILL_BLANK',
          prompt: 'Nicolaus Copernicus: This book generated little 36…………….',
          correct_answer: 'attention',
          acceptable_answers: ['attention', 'interest', 'scant attention'],
          explanation_text: 'Lecturer: "In fact, the book received scant attention in the subsequent decades, apart from a few irate clergymen..."',
          audio_timestamp: '04:09'
        },
        {
          id: 'q_l1_37',
          section_id: 'ts_l1_s4',
          question_number: 37,
          question_type: 'FILL_BLANK',
          prompt: 'Other scientists: 37……………. was killed.',
          correct_answer: 'Bruno',
          acceptable_answers: ['Bruno', 'Giordano Bruno'],
          explanation_text: 'Lecturer: "as did a fellow Italian with the surname Bruno—Giordano Bruno, who was burnt at the stake."',
          audio_timestamp: '04:31'
        },
        {
          id: 'q_l1_38',
          section_id: 'ts_l1_s4',
          question_number: 38,
          question_type: 'FILL_BLANK',
          prompt: 'Other scientists: even the sun believed to be in 38…………….',
          correct_answer: 'motion',
          acceptable_answers: ['motion', 'movement'],
          explanation_text: 'Lecturer: "a work which implied that even the sun, around which the Earth circled, was itself in motion around a common centre of gravity."',
          audio_timestamp: '04:51'
        },
        {
          id: 'q_l1_39',
          section_id: 'ts_l1_s4',
          question_number: 39,
          question_type: 'FILL_BLANK',
          prompt: 'Modern geocentrism: based on the 39…………….',
          correct_answer: 'Bible',
          acceptable_answers: ['Bible', 'the Bible', 'bible'],
          explanation_text: 'Lecturer: "Modern geocentrism is usually the result of literal interpretations of the Bible, which is the cornerstone of these people\'s beliefs."',
          audio_timestamp: '05:12'
        },
        {
          id: 'q_l1_40',
          section_id: 'ts_l1_s4',
          question_number: 40,
          question_type: 'FILL_BLANK',
          prompt: 'Modern geocentrism: 40……………. of Americans believe in this.',
          correct_answer: '20%',
          acceptable_answers: ['20%', '20 percent', 'twenty percent', '20'],
          explanation_text: 'Lecturer: "surveys have revealed that up to 10% of British people, 12% of Europeans, 20% of the USA, and 25% of the Middle East still hold the belief..."',
          audio_timestamp: '05:33'
        }
      ]
    }
  ]
};
