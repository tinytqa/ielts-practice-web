export interface QuestionSeed {
  id: string;
  section_id: string;
  question_number: number;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE_NOT_GIVEN' | 'FILL_BLANK' | 'MATCHING';
  prompt: string;
  options: string[];
  correct_answer: string;
  acceptable_answers?: string[];
  explanation_text: string;
}

export interface SectionSeed {
  id: string;
  test_id: string;
  title: string;
  content_passage: string;
  order_index: number;
  questions: QuestionSeed[];
}

export const IELTS_READING_TEST_1 = {
  test: {
    id: 'test_r1',
    title: 'IELTS Academic Reading Test: The Concept of Intelligence | Saving Bugs | The Power of Play',
    skill_type: 'READING',
    category: 'ACADEMIC',
    difficulty: 'HARD',
    time_limit_minutes: 60,
  },
  sections: [
    // =========================================================================
    // PASSAGE 1: The concept of intelligence (Questions 1 - 13)
    // =========================================================================
    {
      id: 'ts_r1_p1',
      test_id: 'test_r1',
      title: 'READING PASSAGE 1: The concept of intelligence',
      order_index: 1,
      content_passage: `You should spend about 20 minutes on Questions 1-13 which are based on Reading Passage 1 below.

The concept of intelligence

A
Looked at in one way, everyone knows what intelligence is; looked at in another way, no one does. In other words, people all have unconscious notions – known as ‘implicit theories’ – of intelligence, but no one knows for certain what it actually is. This chapter addresses how people conceptualize intelligence, whatever it may actually be.
But why should we even care what people think intelligence is, as opposed only to valuing whatever it actually is? There are at least four seasons people’s conceptions of intelligence matter.

B
First, implicit theories of intelligence drive the way in which people perceive and evaluate their own intelligence and that of others. To better understand the judgments people make about their own and others’ abilities, it is useful to learn about people’s implicit theories. For example, parents’ implicit theories of their children’s language development will determine at what ages they will be willing to make various corrections in their children’s speech. More generally, parents’ implicit theories of intelligence will determine at what ages they believe their children are ready to perform various cognitive tasks. Job interviewers will make hiring decisions on the basis of their implicit theories of intelligence. People will decide who to be friends with on the basis of such theories. In sum, knowledge about implicit theories of intelligence is important because this knowledge is so often used by people to make judgments in the course of their everyday lives.

C
Second, the implicit theories of scientific investigators ultimately give rise to their explicit theories. Thus it is useful to find out what these implicit theories are. Implicit theories provide a framework that is useful in defining the general scope of a phenomenon – especially a not-well-understood phenomenon. These implicit theories can suggest what aspects of the phenomenon have been more or less attended to in previous investigations.

D
Third, implicit theories can be useful when an investigator suspects that existing explicit theories are wrong or misleading. If an investigation of implicit theories reveals little correspondence between the extant implicit and explicit theories, the implicit theories may be wrong. But the possibility also needs to be taken into account that the explicit theories are wrong and in need of correction or supplementation. For example, some implicit theories of intelligence suggest the need for expansion of some of our explicit theories of the construct.

E
Finally, understanding implicit theories of intelligence can help elucidate developmental and cross-cultural differences. As mentioned earlier, people have expectations for intellectual performances that differ for children of different ages. How these expectations differ is in part a function of culture. For example, expectations for children who participate in Western-style schooling are almost certain to be different from those for children who do not participate in such schooling.

F
I have suggested that there are three major implicit theories of how intelligence relates to society as a whole (Sternberg, 1997). These might be called Hamiltonian, Jeffersonian, and Jacksonian. These views are not based strictly, but rather, loosely, on the philosophies of Alexander Hamilton, Thomas Jefferson, and Andrew Jackson, three great statesmen in the history of the United States.

G
The Hamiltonian view, which is similar to the Platonic view, is that people are born with different levels of intelligence and that those who are less intelligent need the good offices of the more intelligent to keep them in line, whether they are called government officials or, in Plato’s term, philosopher-kings. Herrnstein and Murray (1994) seem to have shared this belief when they wrote about the emergence of a cognitive (high-IQ) elite, which eventually would have to take responsibility for the largely irresponsible masses of non-elite (low-IQ) people who cannot take care of themselves. Left to themselves, the unintelligent would create, as they always have created, a kind of chaos.

H
The Jeffersonian view is that people should have equal opportunities, but they do not necessarily avail themselves equally of these opportunities and are not necessarily equally rewarded for their accomplishments. People are rewarded for what they accomplish, if given equal opportunity. Low achievers are not rewarded to the same extent as high achievers. In the Jeffersonian view, the goal of education is not to favor or foster an elite, as in the Hamiltonian tradition, but rather to allow children the opportunities to make full use of the skills they have. My own views are similar to these (Sternberg, 1997).

I
The Jacksonian view is that all people are equal, not only as human beings but in terms of their competencies – that one person would serve as well as another in government or on a jury or in almost any position of responsibility. In this view of democracy, people are essentially intersubstitutable except for specialized skills, all of which can be learned. In this view, we do not need or want any institutions that might lead to favoring one group over another.

J
Implicit theories of intelligence and of the relationship of intelligence to society perhaps need to be considered more carefully than they have been because they often serve as underlying presuppositions for explicit theories and even experimental designs that are then taken as scientific contributions. Until scholars are able to discuss their implicit theories and thus their assumptions, they are likely to miss the point of what others are saying when discussing their explicit theories and their data.`,
      questions: [
        // Q1 - Q3: Matching Information (A-J)
        {
          id: 'q_r1_1',
          section_id: 'ts_r1_p1',
          question_number: 1,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '1. Information about how non-scientists’ assumptions about intelligence influence their behavior towards others (Section A - J)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
          correct_answer: 'B',
          explanation_text: 'Đoạn B nêu rõ: "First, implicit theories of intelligence drive the way in which people perceive and evaluate their own intelligence and that of others... parents... Job interviewers will make hiring decisions... People will decide who to be friends with..." -> Cách quan niệm ngầm định của người bình thường chi phối hành vi đối với người khác.'
        },
        {
          id: 'q_r1_2',
          section_id: 'ts_r1_p1',
          question_number: 2,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '2. A reference to lack of clarity over the definition of intelligence (Section A - J)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
          correct_answer: 'A',
          explanation_text: 'Đoạn A mở đầu bằng việc nêu sự thiếu rõ ràng về định nghĩa trí thông minh: "Looked at in one way, everyone knows what intelligence is; looked at in another way, no one does... no one knows for certain what it actually is."'
        },
        {
          id: 'q_r1_3',
          section_id: 'ts_r1_p1',
          question_number: 3,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '3. The point that a researcher’s implicit and explicit theories may be very different (Section A - J)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
          correct_answer: 'D',
          explanation_text: 'Đoạn D nêu: "If an investigation of implicit theories reveals little correspondence between the extant implicit and explicit theories, the implicit theories may be wrong. But the possibility also needs to be taken into account that the explicit theories are wrong..." -> Chỉ ra lý thuyết ngầm định và lý thuyết tường minh có thể có sự khác biệt lớn.'
        },
        // Q4 - Q6: YES / NO / NOT GIVEN
        {
          id: 'q_r1_4',
          section_id: 'ts_r1_p1',
          question_number: 4,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '4. Slow language development in children is likely to prove disappointing to their parents.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'NOT GIVEN',
          explanation_text: 'Đoạn B có đề cập phụ huynh quyết định độ tuổi sửa lỗi phát âm cho con: "parents’ implicit theories of their children’s language development will determine at what ages they will be willing to make various corrections...", nhưng bài đọc KHÔNG đề cập việc trẻ phát triển chậm có gây thất vọng (disappointing) cho cha mẹ hay không -> NOT GIVEN.'
        },
        {
          id: 'q_r1_5',
          section_id: 'ts_r1_p1',
          question_number: 5,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '5. People’s expectations of what children should gain from education are universal.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'NO',
          explanation_text: 'Đoạn E khẳng định kỳ vọng khác nhau theo từng nền văn hoá: "How these expectations differ is in part a function of culture. For example, expectations for children who participate in Western-style schooling are almost certain to be different from those for children who do not participate in such schooling." -> Nhận định rằng kỳ vọng mang tính phổ quát toàn cầu (universal) là trái ngược với bài đọc -> NO.'
        },
        {
          id: 'q_r1_6',
          section_id: 'ts_r1_p1',
          question_number: 6,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '6. Scholars may discuss theories without fully understanding each other.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'YES',
          explanation_text: 'Đoạn J nêu: "Until scholars are able to discuss their implicit theories and thus their assumptions, they are likely to miss the point of what others are saying when discussing their explicit theories and their data." (Các học giả có thể bỏ lỡ ý của nhau khi thảo luận) -> Trùng khớp với nhận định -> YES.'
        },
        // Q7 - Q13: Matching Theories (A, B, C)
        {
          id: 'q_r1_7',
          section_id: 'ts_r1_p1',
          question_number: 7,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '7. It is desirable for the same possibilities to be open to everyone. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'B - Jeffersonian',
          acceptable_answers: ['B', 'B - Jeffersonian', 'Jeffersonian'],
          explanation_text: 'Đoạn H về quan điểm Jeffersonian: "The Jeffersonian view is that people should have equal opportunities..." -> mong muốn tạo cơ hội bình đẳng mở ra cho tất cả mọi người -> B.'
        },
        {
          id: 'q_r1_8',
          section_id: 'ts_r1_p1',
          question_number: 8,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '8. No section of society should have preferential treatment at the expense of another. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'C - Jacksonian',
          acceptable_answers: ['C', 'C - Jacksonian', 'Jacksonian'],
          explanation_text: 'Đoạn I về quan điểm Jacksonian: "In this view, we do not need or want any institutions that might lead to favoring one group over another." -> Không ưu đãi nhóm nào gây thiệt thòi cho nhóm khác -> C.'
        },
        {
          id: 'q_r1_9',
          section_id: 'ts_r1_p1',
          question_number: 9,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '9. People should only gain benefits on the basis of what they actually achieve. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'B - Jeffersonian',
          acceptable_answers: ['B', 'B - Jeffersonian', 'Jeffersonian'],
          explanation_text: 'Đoạn H về Jeffersonian: "People are rewarded for what they accomplish, if given equal opportunity. Low achievers are not rewarded to the same extent as high achievers." -> Đãi ngộ dựa trên thành tựu thực tế đạt được -> B.'
        },
        {
          id: 'q_r1_10',
          section_id: 'ts_r1_p1',
          question_number: 10,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '10. Variation in intelligence begins at birth. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'A - Hamiltonian',
          acceptable_answers: ['A', 'A - Hamiltonian', 'Hamiltonian'],
          explanation_text: 'Đoạn G về Hamiltonian: "The Hamiltonian view... is that people are born with different levels of intelligence..." -> Sự khác biệt về trí thông minh xuất hiện ngay từ khi sinh ra -> A.'
        },
        {
          id: 'q_r1_11',
          section_id: 'ts_r1_p1',
          question_number: 11,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '11. The more intelligent people should be in positions of power. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'A - Hamiltonian',
          acceptable_answers: ['A', 'A - Hamiltonian', 'Hamiltonian'],
          explanation_text: 'Đoạn G về Hamiltonian: "...those who are less intelligent need the good offices of the more intelligent to keep them in line, whether they are called government officials or, in Plato’s term, philosopher-kings." -> Người thông minh hơn nên nắm giữ quyền lực lãnh đạo -> A.'
        },
        {
          id: 'q_r1_12',
          section_id: 'ts_r1_p1',
          question_number: 12,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '12. Everyone can develop the same abilities. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'C - Jacksonian',
          acceptable_answers: ['C', 'C - Jacksonian', 'Jacksonian'],
          explanation_text: 'Đoạn I về Jacksonian: "...people are essentially intersubstitutable except for specialized skills, all of which can be learned." -> Mọi người đều có thể học và phát triển các kỹ năng như nhau -> C.'
        },
        {
          id: 'q_r1_13',
          section_id: 'ts_r1_p1',
          question_number: 13,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '13. People of low intelligence are likely to lead uncontrolled lives. (A: Hamiltonian, B: Jeffersonian, C: Jacksonian)',
          options: ['A - Hamiltonian', 'B - Jeffersonian', 'C - Jacksonian'],
          correct_answer: 'A - Hamiltonian',
          acceptable_answers: ['A', 'A - Hamiltonian', 'Hamiltonian'],
          explanation_text: 'Đoạn G về Hamiltonian: "Left to themselves, the unintelligent would create, as they always have created, a kind of chaos." (Nếu để tự do, người kém thông minh sẽ tạo ra sự hỗn loạn) -> A.'
        }
      ]
    },

    // =========================================================================
    // PASSAGE 2: Saving bugs to find new drugs (Questions 14 - 26)
    // =========================================================================
    {
      id: 'ts_r1_p2',
      test_id: 'test_r1',
      title: 'READING PASSAGE 2: Saving bugs to find new drugs',
      order_index: 2,
      content_passage: `You should spend about 20 minutes on Questions 14-26 which are based on Reading Passage 2 below.

Saving bugs to find new drugs
Zoologist Ross Piper looks at the potential of insects in pharmaceutical research

A
More drugs than you might think are derived from, or inspired by, compounds found in living things. Looking to nature for the soothing and curing of our ailments is nothing new – we have been doing it for tens of thousands of years. You only have to look at other primates – such as the capuchin monkeys who rub themselves with toxin-oozing millipedes to deter mosquitoes, or the chimpanzees who use noxious forest plants to rid themselves of intestinal parasites – to realise that our ancient ancestors too probably had a basic grasp of medicine.

B
Pharmaceutical science and chemistry built on these ancient foundations and perfected the extraction, characterization, modification and testing of these natural products. Then, for a while, modern pharmaceutical science moved its focus away from nature and into the laboratory, designing chemical compounds from scratch. The main cause of this shift is that although there are plenty of promising chemical compounds in nature, finding them is far from easy. Securing sufficient numbers of the organism in question, isolating and characterizing the compounds of interest, and producing large quantities of these compounds are all significant hurdles.

C
Laboratory-based drug discovery has achieved varying levels of success, something which has now prompted the development of new approaches focusing once again on natural products. With the ability to mine genomes for useful compounds, it is now evident that we have barely scratched the surface of nature’s molecular diversity. This realization, together with several looming health crises, such as antibiotic resistance, has put bioprospecting – the search for useful compounds in nature – firmly back on the map.

D
Insects are the undisputed masters of the terrestrial domain, where the occupy every possible niche. Consequently, they have a bewildering array of interactions with other organisms, something which has driven the evolution of an enormous range of very interesting compounds for defensive and offensive purposes. Their remarkable diversity exceeds that of every other group of animals on the planet combined. Yet even though insects are far and away the most diverse animals in existence, their potential as sources of therapeutic compounds is yet to be realised.

E
From the tiny proportion of insects that have been investigated, several promising compounds have been identified. For example, alloferon, an antimicrobial compound produced by blow fly larvae, is used as an antiviral and antitumor agent in South Korea and Russia. The larvae of a few other insect species are being investigated for the potent antimicrobial compounds they produce. Meanwhile, a compound from the venom of the wasp Polybia paulista has potential in cancer treatment.

F
Why is it that insects have received relatively little attention in bioprospecting? Firstly, there are so many insects that, without some manner of targeted approach, investigating this huge variety of species is a daunting task. Secondly, insects are generally very small, and the glands inside them that secrete potentially useful compounds are smaller still. This can make it difficult to obtain sufficient quantities of the compound for subsequent testing. Thirdly, although we consider insects to be everywhere, the reality of this ubiquity is vast numbers of a few extremely common species. Many insect species are infrequently encountered and very difficult to rear in captivity, which, again, can leave us with insufficient material to work with.

G
My colleagues and I at Aberystwyth University in the UK have developed an approach in which we use our knowledge of ecology as a guide to target our efforts. The creatures that particularly interest us are the many insects that secrete powerful poison for subduing prey and keeping it fresh for future consumption. There are even more insects that are masters of exploiting filthy habitats, such as faeces and carcasses, where they are regularly challenged by thousands of micro-organisms. These insects have many antimicrobial compounds for dealing with pathogenic bacteria and fungi, suggesting that there is certainly potential to find many compounds that can serve as or inspire new antibiotics.

H
Although natural history knowledge points us in the right direction, it doesn’t solve the problems associated with obtaining useful compounds from insects. Fortunately, it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds and insert them into cell lines that allow larger quantities to be produced. And although the road from isolating and characterizing compounds with desirable qualities to developing a commercial product is very long and full of pitfalls, the variety of successful animal-derived pharmaceuticals on the market demonstrates there is a precedent here that is worth exploring.

I
With every bit of wilderness that disappears, we deprive ourselves of potential medicines. As much as I’d love to help develop a groundbreaking insect-derived medicine, my main motivation for looking at insects in this way is conservation. I sincerely believe that all species, however small and seemingly insignificant, have a right to exist for their own sake. If we can shine a light on the darker recesses of nature’s medicine cabinet, exploring the useful chemistry of the most diverse animals on the planet, I believe we can make people think differently about the value of nature.`,
      questions: [
        // Q14 - Q20: Matching Paragraph Information (A-I)
        {
          id: 'q_r1_14',
          section_id: 'ts_r1_p2',
          question_number: 14,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '14. Mention of factors driving a renewed interest in natural medicinal compounds. (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'C',
          explanation_text: 'Đoạn C nêu: "With the ability to mine genomes for useful compounds... This realization, together with several looming health crises, such as antibiotic resistance, has put bioprospecting – the search for useful compounds in nature – firmly back on the map." -> Các yếu tố thúc đẩy sự quan tâm trở lại đối với các hợp chất tự nhiên.'
        },
        {
          id: 'q_r1_15',
          section_id: 'ts_r1_p2',
          question_number: 15,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '15. How recent technological advances have made insect research easier (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'H',
          explanation_text: 'Đoạn H nêu: "Fortunately, it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds and insert them into cell lines that allow larger quantities to be produced." -> Công nghệ giải mã & cắt ghép ADN giúp nghiên cứu côn trùng dễ dàng hơn.'
        },
        {
          id: 'q_r1_16',
          section_id: 'ts_r1_p2',
          question_number: 16,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '16. Examples of animals which use medicinal substances from nature (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'A',
          explanation_text: 'Đoạn A dẫn chứng: "capuchin monkeys who rub themselves with toxin-oozing millipedes to deter mosquitoes, or the chimpanzees who use noxious forest plants to rid themselves of intestinal parasites..." -> Ví dụ động vật dùng chất tự nhiên để chữa bệnh/đuổi côn trùng.'
        },
        {
          id: 'q_r1_17',
          section_id: 'ts_r1_p2',
          question_number: 17,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '17. Reasons why it is challenging to use insects in drug research (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'F',
          explanation_text: 'Đoạn F giải thích chi tiết các khó khăn: "Firstly, there are so many insects... Secondly, insects are generally very small... Thirdly... difficult to rear in captivity..." -> Các thách thức khi dùng côn trùng trong nghiên cứu dược phẩm.'
        },
        {
          id: 'q_r1_18',
          section_id: 'ts_r1_p2',
          question_number: 18,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '18. Reference to how interest in drug research may benefit wildlife (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'I',
          explanation_text: 'Đoạn I nêu: "my main motivation for looking at insects in this way is conservation... make people think differently about the value of nature." -> Nghiên cứu dược phẩm giúp nâng cao nhận thức bảo tồn thế giới tự nhiên.'
        },
        {
          id: 'q_r1_19',
          section_id: 'ts_r1_p2',
          question_number: 19,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '19. A reason why nature-based medicines fell out of favour for a period (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'B',
          explanation_text: 'Đoạn B giải thích nguyên nhân chuyển dịch: "modern pharmaceutical science moved its focus away from nature and into the laboratory, designing chemical compounds from scratch. The main cause of this shift is that although there are plenty of promising chemical compounds in nature, finding them is far from easy. Securing sufficient numbers... isolating... producing large quantities..." -> Lý do thuốc từ tự nhiên từng bị bỏ quên một thời gian.'
        },
        {
          id: 'q_r1_20',
          section_id: 'ts_r1_p2',
          question_number: 20,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '20. An example of an insect-derived medicine in use at the moment (Paragraph A - I)',
          options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
          correct_answer: 'E',
          explanation_text: 'Đoạn E nêu ví dụ thực tế: "For example, alloferon, an antimicrobial compound produced by blow fly larvae, is used as an antiviral and antitumor agent in South Korea and Russia."'
        },
        // Q21 - Q22: Multiple Choice (Choose TWO: B, C)
        {
          id: 'q_r1_21',
          section_id: 'ts_r1_p2',
          question_number: 21,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '21. Which of the following makes insects interesting for drug research? (Choose Option 1 of 2)',
          options: [
            'A: The huge number of individual insects in the world',
            'B: The variety of substances insects have developed to protect themselves',
            'C: The potential to extract and make use of insects\' genetic codes',
            'D: The similarities between different species of insect',
            'E: The manageable size of most insects'
          ],
          correct_answer: 'B: The variety of substances insects have developed to protect themselves',
          acceptable_answers: ['B', 'B: The variety of substances insects have developed to protect themselves', 'variety of substances'],
          explanation_text: 'Đoạn D nêu: "...driven the evolution of an enormous range of very interesting compounds for defensive and offensive purposes" -> B là đáp án chính xác.'
        },
        {
          id: 'q_r1_22',
          section_id: 'ts_r1_p2',
          question_number: 22,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '22. Which of the following makes insects interesting for drug research? (Choose Option 2 of 2)',
          options: [
            'A: The huge number of individual insects in the world',
            'B: The variety of substances insects have developed to protect themselves',
            'C: The potential to extract and make use of insects\' genetic codes',
            'D: The similarities between different species of insect',
            'E: The manageable size of most insects'
          ],
          correct_answer: 'C: The potential to extract and make use of insects\' genetic codes',
          acceptable_answers: ['C', 'C: The potential to extract and make use of insects\' genetic codes', 'genetic codes'],
          explanation_text: 'Đoạn H nêu: "Fortunately, it is now possible to snip out the stretches of the insect’s DNA that carry the codes for the interesting compounds and insert them into cell lines..." -> C là đáp án chính xác.'
        },
        // Q23 - Q26: Summary Completion (ONE WORD ONLY)
        {
          id: 'q_r1_23',
          section_id: 'ts_r1_p2',
          question_number: 23,
          question_type: 'FILL_BLANK',
          prompt: '23. Ross Piper and fellow zoologists at Aberystwyth University are using their expertise in [_____] when undertaking bioprospecting with insects. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'ecology',
          acceptable_answers: ['ecology'],
          explanation_text: 'Đoạn G: "My colleagues and I at Aberystwyth University in the UK have developed an approach in which we use our knowledge of ecology as a guide to target our efforts." -> Từ cần điền: ecology.'
        },
        {
          id: 'q_r1_24',
          section_id: 'ts_r1_p2',
          question_number: 24,
          question_type: 'FILL_BLANK',
          prompt: '24. They are especially interested in the compounds that insects produce to overpower and preserve their [_____]. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'prey',
          acceptable_answers: ['prey'],
          explanation_text: 'Đoạn G: "...secrete powerful poison for subduing prey and keeping it fresh for future consumption." (subdue = overpower, keep fresh = preserve) -> Từ cần điền: prey.'
        },
        {
          id: 'q_r1_25',
          section_id: 'ts_r1_p2',
          question_number: 25,
          question_type: 'FILL_BLANK',
          prompt: '25. They are also interested in compounds which insects use to protect themselves from pathogenic bacteria and fungi found in their [_____]. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'habitats',
          acceptable_answers: ['habitats', 'habitat'],
          explanation_text: 'Đoạn G: "...masters of exploiting filthy habitats, such as faeces and carcasses, where they are regularly challenged by thousands of micro-organisms." -> Từ cần điền: habitats.'
        },
        {
          id: 'q_r1_26',
          section_id: 'ts_r1_p2',
          question_number: 26,
          question_type: 'FILL_BLANK',
          prompt: '26. Piper hopes that these substances will be useful in the development of drugs such as [_____]. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'antibiotics',
          acceptable_answers: ['antibiotics', 'antibiotic'],
          explanation_text: 'Đoạn G: "...suggesting that there is certainly potential to find many compounds that can serve as or inspire new antibiotics." -> Từ cần điền: antibiotics.'
        }
      ]
    },

    // =========================================================================
    // PASSAGE 3: The power of play (Questions 27 - 40)
    // =========================================================================
    {
      id: 'ts_r1_p3',
      test_id: 'test_r1',
      title: 'READING PASSAGE 3: The power of play',
      order_index: 3,
      content_passage: `You should spend about 20 minutes on Questions 27-40 which are based on Reading Passage 3 below.

The power of play

Virtually every child, the world over, plays. The drive to play is so intense that children will do so in any circumstances, for instance when they have no real toys, or when parents do not actively encourage the behavior. In the eyes of a young child, running, pretending, and building are fun. Researchers and educators know that these playful activities benefit the development of the whole child across social, cognitive, physical, and emotional domains. Indeed, play is such an instrumental component to healthy child development that the United Nation High Commission on Human Rights (1989) recognized play as a fundamental right of every child.

Yet, while experts continue to expound a powerful argument for the importance of play in children’s lives, the actual time children spend playing continues to decrease. Today, children play eight hours less each week than their counterparts did two decades ago (Elkind 2008). Under pressure of rising academic standards, play is being replaced by test preparation in kindergartens and grade schools, and parents who aim to give their preschoolers a leg up are led to believe that flashcards and educational ‘toys’ are the path to success. Our society has created a false dichotomy between play and learning.

Through play, children learn to regulate their behavior, lay the foundations for later learning in science and mathematics, figure out the complex negotiations of social relationships, build a repertoire of creative problem-solving skills, and so much more. There is also an important role for adults in guiding children through playful learning opportunities.

Full consensus on a formal definition of play continues to elude the researchers and theorists who study it. Definitions range from discrete descriptions of various types of play such as physical, construction, language, or symbolic play (Miler & Almon 2009), to lists of broad criteria, based on observations and attitudes, that are meant to capture the essence of all play behaviors (e.g. Rubin et al. 1983).

A majority of the contemporary definitions of play focus on several key criteria. The founder of the National Institute for Play, Stuart Brown, has described play as ‘anything that spontaneously is done for its own sake’. More specifically, he says it ‘appears purposeless, produces pleasure and joy, [and] leads one to the next stage of mastery’ (as quoted in Tippett 2008). Similarly, Miller and Almon (2009) say that play includes ‘activities that are freely chosen and directed by children and arise from intrinsic motivation’. Often, play is defined along a continuum as more or less playful using the following set of behavioral and dispositional criteria (e.g. Rubin et al. 1983).

Play is pleasurable: Children must enjoy the activity or it is not play. It is intrinsically motivated: Children engage in play simply for the satisfaction the behavior itself brings. It has no extrinsically motivated function or goal. Play is process oriented: When children play, the means are more important than the ends. It is freely chosen, spontaneous and voluntary. If a child is pressured, they will likely not think of the activity as play. Play is actively engaged: Players must be physically and/or mentally involved in the activity. Play is non-literal. It involves make-believe.

According to this view, children’s playful behaviors can range in degree from 0% to 100% playful. Rubin and colleagues did not assign greater weight to any one dimension in determining playfulness; however, other researchers have suggested that process orientation and a lack of obvious functional purpose may be the most important aspects of play (e.g. Pellegrini 2009).

From the perspective of a continuum, play can thus blend with other motives and attitudes that are less playful, such as work. Unlike play, work is typically not viewed as enjoyable and it is extrinsically motivated (i.e. it is goal oriented). Researcher Joan Goodman (1994) suggested that hybrid forms of work and play are not a detriment to learning; rather, they can provide optimal contexts for learning. For example, a child may be engaged in a difficult, goal-directed activity set up by their teacher, but they may still be actively engaged and intrinsically motivated. At this mid-point between play and work, the child’s motivation, coupled with guidance from an adult, can create robust opportunities for playful learning.

Critically, recent research supports the idea that adults can facilitate children’s learning while maintaining a playful approach in interactions known as ‘guided play’ (Fisher et al. 2011). The adult’s role in play varies as a function of their educational goals and the child’s developmental level (Hirsch-Pasek et al. 2009).

Guided play takes two forms. At a very basic level, adults can enrich the child’s environment by providing objects or experiences that promote aspects of a curriculum. In the more direct form of guided play, parents or other adults can support children’s play by joining in the fun as a co-player, raising thoughtful questions, commenting on children’s discoveries, or encouraging further exploration or new facets to the child’s activity. Although playful learning can be somewhat structured, it must also be child-centered (Nicolopolou et al. 2006). Play should stem from the child’s own desire.

Both free and guided play are essential elements in a child-centered approach to playful learning. Intrinsically motivated free play provides the child with true autonomy, while guided play is an avenue through which parents and educators can provide more targeted learning experiences. In either case, play should be actively engaged, it should be predominantly child-directed, and it must be fun.`,
      questions: [
        // Q27 - Q31: Matching Researchers (A-G)
        {
          id: 'q_r1_27',
          section_id: 'ts_r1_p3',
          question_number: 27,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '27. Play can be divided into a number of separate categories.',
          options: ['A - Elkind', 'B - Miller & Almon', 'C - Rubin et al.', 'D - Stuart Brown', 'E - Pellegrini', 'F - Joan Goodman', 'G - Hirsch-Pasek et al.'],
          correct_answer: 'B - Miller & Almon',
          acceptable_answers: ['B', 'B - Miller & Almon', 'Miller & Almon', 'Miller and Almon'],
          explanation_text: 'Đoạn 4 nêu: "Definitions range from discrete descriptions of various types of play such as physical, construction, language, or symbolic play (Miller & Almon 2009)" -> Miller & Almon chia hoạt động chơi thành các nhóm phân loại riêng biệt -> B.'
        },
        {
          id: 'q_r1_28',
          section_id: 'ts_r1_p3',
          question_number: 28,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '28. Adults’ intended goals affect how they play with children.',
          options: ['A - Elkind', 'B - Miller & Almon', 'C - Rubin et al.', 'D - Stuart Brown', 'E - Pellegrini', 'F - Joan Goodman', 'G - Hirsch-Pasek et al.'],
          correct_answer: 'G - Hirsch-Pasek et al.',
          acceptable_answers: ['G', 'G - Hirsch-Pasek et al.', 'Hirsch-Pasek et al.', 'Girsch-Pasek et al.'],
          explanation_text: 'Đoạn 9 nêu: "The adult’s role in play varies as a function of their educational goals and the child’s developmental level (Hirsch-Pasek et al. 2009)." -> Mục tiêu giáo dục của người lớn ảnh hưởng đến cách họ tương tác chơi với trẻ -> G.'
        },
        {
          id: 'q_r1_29',
          section_id: 'ts_r1_p3',
          question_number: 29,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '29. Combining work with play may be the best way for children to learn.',
          options: ['A - Elkind', 'B - Miller & Almon', 'C - Rubin et al.', 'D - Stuart Brown', 'E - Pellegrini', 'F - Joan Goodman', 'G - Hirsch-Pasek et al.'],
          correct_answer: 'F - Joan Goodman',
          acceptable_answers: ['F', 'F - Joan Goodman', 'Joan Goodman'],
          explanation_text: 'Đoạn 8 nêu: "Researcher Joan Goodman (1994) suggested that hybrid forms of work and play are not a detriment to learning; rather, they can provide optimal contexts for learning." (optimal contexts = best way to learn) -> F.'
        },
        {
          id: 'q_r1_30',
          section_id: 'ts_r1_p3',
          question_number: 30,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '30. Certain elements of play are more significant than others.',
          options: ['A - Elkind', 'B - Miller & Almon', 'C - Rubin et al.', 'D - Stuart Brown', 'E - Pellegrini', 'F - Joan Goodman', 'G - Hirsch-Pasek et al.'],
          correct_answer: 'E - Pellegrini',
          acceptable_answers: ['E', 'E - Pellegrini', 'Pellegrini'],
          explanation_text: 'Đoạn 7 nêu: "...other researchers have suggested that process orientation and a lack of obvious functional purpose may be the most important aspects of play (e.g. Pellegrini 2009)." (most important = more significant) -> E.'
        },
        {
          id: 'q_r1_31',
          section_id: 'ts_r1_p3',
          question_number: 31,
          question_type: 'MULTIPLE_CHOICE',
          prompt: '31. Activities can be classified on a scale of playfulness.',
          options: ['A - Elkind', 'B - Miller & Almon', 'C - Rubin et al.', 'D - Stuart Brown', 'E - Pellegrini', 'F - Joan Goodman', 'G - Hirsch-Pasek et al.'],
          correct_answer: 'C - Rubin et al.',
          acceptable_answers: ['C', 'C - Rubin et al.', 'Rubin et al.'],
          explanation_text: 'Đoạn 5 & 7: "Often, play is defined along a continuum as more or less playful using the following set of behavioral and dispositional criteria (e.g. Rubin et al. 1983)... range in degree from 0% to 100% playful." (continuum / scale of playfulness) -> C.'
        },
        // Q32 - Q36: YES / NO / NOT GIVEN
        {
          id: 'q_r1_32',
          section_id: 'ts_r1_p3',
          question_number: 32,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '32. Children need toys in order to play.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'NO',
          explanation_text: 'Đoạn 1 nêu rõ: "The drive to play is so intense that children will do so in any circumstances, for instance when they have no real toys..." -> Trẻ vẫn chơi ngay cả khi không có đồ chơi thật -> Nhận định "cần đồ chơi để chơi" là sai -> NO.'
        },
        {
          id: 'q_r1_33',
          section_id: 'ts_r1_p3',
          question_number: 33,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '33. It is a mistake to treat play and learning as separate types of activities.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'YES',
          explanation_text: 'Đoạn 2 nêu: "Our society has created a false dichotomy between play and learning" (xã hội tạo ra sự phân biệt sai lầm giữa chơi và học) -> Coi chơi và học tách biệt là một sai lầm -> YES.'
        },
        {
          id: 'q_r1_34',
          section_id: 'ts_r1_p3',
          question_number: 34,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '34. Play helps children to develop their artistic talents.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'NOT GIVEN',
          explanation_text: 'Đoạn 3 liệt kê nhiều lợi ích: "science and mathematics, figure out the complex negotiations of social relationships, build a repertoire of creative problem-solving skills", nhưng bài đọc KHÔNG nhắc đến "artistic talents" (tài năng nghệ thuật) -> NOT GIVEN.'
        },
        {
          id: 'q_r1_35',
          section_id: 'ts_r1_p3',
          question_number: 35,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '35. Researchers have agreed on a definition of play.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'NO',
          explanation_text: 'Đoạn 4 nêu: "Full consensus on a formal definition of play continues to elude the researchers and theorists who study it." (Sự đồng thuận đầy đủ về định nghĩa chơi vẫn chưa đạt được) -> Mâu thuẫn với nhận định -> NO.'
        },
        {
          id: 'q_r1_36',
          section_id: 'ts_r1_p3',
          question_number: 36,
          question_type: 'TRUE_FALSE_NOT_GIVEN',
          prompt: '36. Work and play differ in terms of whether or not they have a target.',
          options: ['YES', 'NO', 'NOT GIVEN'],
          correct_answer: 'YES',
          explanation_text: 'Đoạn 6 & 8 nêu: "Play... has no extrinsically motivated function or goal... Unlike play, work is typically not viewed as enjoyable and it is extrinsically motivated (i.e. it is goal oriented)." -> Khác nhau ở chỗ có mục tiêu (target/goal) hay không -> YES.'
        },
        // Q37 - Q40: Summary Completion (ONE WORD ONLY)
        {
          id: 'q_r1_37',
          section_id: 'ts_r1_p3',
          question_number: 37,
          question_type: 'FILL_BLANK',
          prompt: '37. Alternatively, an adult can play with a child and develop the play, for instance by [_____] the child to investigate different aspects of their game. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'encouraging',
          acceptable_answers: ['encouraging'],
          explanation_text: 'Đoạn 10 nêu: "...raising thoughtful questions, commenting on children’s discoveries, or encouraging further exploration or new facets to the child’s activity." -> Từ cần điền: encouraging.'
        },
        {
          id: 'q_r1_38',
          section_id: 'ts_r1_p3',
          question_number: 38,
          question_type: 'FILL_BLANK',
          prompt: '38. Adults can help children to learn through play, and may make the activity rather structured, but it should still be based on the child’s [_____] to play. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'desire',
          acceptable_answers: ['desire'],
          explanation_text: 'Đoạn 10 nêu: "Although playful learning can be somewhat structured, it must also be child-centered... Play should stem from the child’s own desire." -> Từ cần điền: desire.'
        },
        {
          id: 'q_r1_39',
          section_id: 'ts_r1_p3',
          question_number: 39,
          question_type: 'FILL_BLANK',
          prompt: '39. Play without the intervention of adults gives children real [_____]; (ONE WORD ONLY)',
          options: [],
          correct_answer: 'autonomy',
          acceptable_answers: ['autonomy'],
          explanation_text: 'Đoạn 11 nêu: "Intrinsically motivated free play provides the child with true autonomy..." -> Từ cần điền: autonomy.'
        },
        {
          id: 'q_r1_40',
          section_id: 'ts_r1_p3',
          question_number: 40,
          question_type: 'FILL_BLANK',
          prompt: '40. With adults, play can be [_____] at particular goals. (ONE WORD ONLY)',
          options: [],
          correct_answer: 'targeted',
          acceptable_answers: ['targeted'],
          explanation_text: 'Đoạn 11 nêu: "...while guided play is an avenue through which parents and educators can provide more targeted learning experiences." -> Từ cần điền: targeted.'
        }
      ]
    }
  ]
};
