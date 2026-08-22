import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Play, Pause, Sparkles, Volume2, Clock, 
  RotateCcw, AlertCircle, CheckCircle2, ChevronRight, BookOpen, 
  Lightbulb, Copy, HelpCircle, ArrowRight, ArrowLeft, Award, Layers, Check,
  X, Info, FileText, Lock, Radio, User, FastForward, RefreshCw, VolumeX, ShieldAlert, Zap
} from 'lucide-react';

export interface SpeakingPartData {
  part: 'PART_1' | 'PART_2' | 'PART_3';
  topic: string;
  subTitle: string;
  description: string;
  durationLabel: string;
  questions?: string[];
  cueCard?: {
    topic: string;
    bulletPoints: string[];
  };
  sampleAnswerBand9: string;
  sampleAnswerBand8?: string;
  keyVocabulary: { word: string; ipa: string; meaning: string; example: string }[];
}

export interface BandDescriptorRow {
  band: number;
  fluencyAndCoherence: string[];
  lexicalResource: string[];
  grammaticalRange: string[];
  pronunciation: string[];
}

export const IELTS_SPEAKING_BAND_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    fluencyAndCoherence: [
      "Speaks fluently with only rare repetition or self-correction",
      "Any hesitation is content-related rather than to find words or grammar",
      "Speaks coherently with fully appropriate cohesive features",
      "Develops topics fully and appropriately"
    ],
    lexicalResource: [
      "Uses vocabulary with full flexibility and precision in all topics",
      "Uses idiomatic language naturally and accurately"
    ],
    grammaticalRange: [
      "Uses a full range of structures naturally and appropriately",
      "Produces consistently accurate structures apart from 'slips' characteristic of native speaker speech"
    ],
    pronunciation: [
      "Uses a full range of pronunciation features with precision and subtlety",
      "Sustains flexible use of features throughout",
      "Is effortless to understand"
    ]
  },
  {
    band: 8,
    fluencyAndCoherence: [
      "Speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language",
      "Develops topics coherently and appropriately"
    ],
    lexicalResource: [
      "Uses a wide vocabulary resource readily and flexibly to convey precise meaning",
      "Uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies",
      "Uses paraphrase effectively as required"
    ],
    grammaticalRange: [
      "Uses a wide range of structures flexibly",
      "Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors"
    ],
    pronunciation: [
      "Uses a wide range of pronunciation features",
      "Sustains flexible use of features, with only occasional lapses",
      "Is easy to understand throughout; L1 accent has minimal effect on intelligibility"
    ]
  },
  {
    band: 7,
    fluencyAndCoherence: [
      "Speaks at length without noticeable effort or loss of coherence",
      "May demonstrate language-related hesitation at times, or some repetition and/or self-correction",
      "Uses a range of connectives and discourse markers with some flexibility"
    ],
    lexicalResource: [
      "Uses vocabulary resource flexibly to discuss a variety of topics",
      "Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices",
      "Uses paraphrase effectively"
    ],
    grammaticalRange: [
      "Uses a range of complex structures with some flexibility",
      "Frequently produces error-free sentences, though some grammatical mistakes persist"
    ],
    pronunciation: [
      "Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8"
    ]
  },
  {
    band: 6,
    fluencyAndCoherence: [
      "Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation",
      "Uses a range of connectives and discourse markers but not always appropriately"
    ],
    lexicalResource: [
      "Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies",
      "Generally paraphrases successfully"
    ],
    grammaticalRange: [
      "Uses a mix of simple and complex structures, but with limited flexibility",
      "May make frequent mistakes with complex structures though these rarely cause comprehension problems"
    ],
    pronunciation: [
      "Uses a range of pronunciation features with mixed control",
      "Shows some effective use of features but this is not sustained",
      "Can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times"
    ]
  },
  {
    band: 5,
    fluencyAndCoherence: [
      "Usually maintains flow of speech but uses repetition, self correction and/or slow speech to keep going",
      "May over-use certain connectives and discourse markers",
      "Produces simple speech fluently, but more complex communication causes fluency problems"
    ],
    lexicalResource: [
      "Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility",
      "Attempts to use paraphrase but with mixed success"
    ],
    grammaticalRange: [
      "Produces basic sentence forms with reasonable accuracy",
      "Uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems"
    ],
    pronunciation: [
      "Shows all the positive features of Band 4 and some, but not all, of the positive features of Band 6"
    ]
  },
  {
    band: 4,
    fluencyAndCoherence: [
      "Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction",
      "Links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence"
    ],
    lexicalResource: [
      "Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice",
      "Rarely attempts paraphrase"
    ],
    grammaticalRange: [
      "Produces basic sentence forms and some correct simple sentences but subordinate structures are rare",
      "Errors are frequent and may lead to misunderstanding"
    ],
    pronunciation: [
      "Uses a limited range of pronunciation features",
      "Attempts to control features but lapses are frequent",
      "Mispronunciations are frequent and cause some difficulty for the listener"
    ]
  },
  {
    band: 3,
    fluencyAndCoherence: [
      "Speaks with long pauses",
      "Has limited ability to link simple sentences",
      "Gives only simple responses and is frequently unable to convey basic message"
    ],
    lexicalResource: [
      "Uses simple vocabulary to convey personal information",
      "Has insufficient vocabulary for less familiar topics"
    ],
    grammaticalRange: [
      "Attempts basic sentence forms but with limited success, or relies on apparently memorised utterances",
      "Makes numerous errors except in memorised expressions"
    ],
    pronunciation: [
      "Shows some of the features of Band 2 and some, but not all, of the positive features of Band 4"
    ]
  },
  {
    band: 2,
    fluencyAndCoherence: [
      "Pauses lengthily before most words",
      "Little communication possible"
    ],
    lexicalResource: [
      "Only produces isolated words or memorised utterances"
    ],
    grammaticalRange: [
      "Cannot produce basic sentence forms"
    ],
    pronunciation: [
      "Speech is often unintelligible"
    ]
  },
  {
    band: 1,
    fluencyAndCoherence: [
      "No communication possible; no rateable language"
    ],
    lexicalResource: [
      "No rateable language"
    ],
    grammaticalRange: [
      "Cannot produce sentence forms at all"
    ],
    pronunciation: [
      "No rateable language"
    ]
  }
];

export const SPEAKING_3_PARTS_DATA: Record<'PART_1' | 'PART_2' | 'PART_3', SpeakingPartData> = {
  PART_1: {
    part: 'PART_1',
    topic: 'Weather',
    subTitle: 'Part 1: Introduction & Interview (4 - 5 phút)',
    description: 'Giám khảo hỏi các câu hỏi quen thuộc thường nhật về chủ đề Thời Tiết (Weather). Hãy trả lời tự nhiên, mở rộng từ 2-4 câu cho mỗi câu hỏi.',
    durationLabel: '4 - 5 phút',
    questions: [
      "What's your favorite type of weather?",
      "Do you prefer hot or cold weather?",
      "Does the weather ever affect your mood?",
      "How is the weather in your hometown?",
      "Do you think that weather affects people's behavior?"
    ],
    sampleAnswerBand9: `1. What's your favorite type of weather?
Personally, I'm particularly fond of crisp, autumnal weather when there's a gentle breeze and mild sunshine. It's neither stiflingly hot nor bitterly cold, making it conducive to outdoor activities like jogging or strolling in the park.

2. Do you prefer hot or cold weather?
Without a doubt, I'd lean towards cooler temperatures. When it's chilly, you can simply layer up with cozy knitwear or enjoy a hot beverage, whereas during scorching summer days, the oppressive heat and humidity can feel downright unbearable and draining.

3. Does the weather ever affect your mood?
Most definitely. I think I experience a mild form of seasonal affective disorder; on dreary, overcast days with persistent drizzle, I tend to feel somewhat sluggish and unmotivated. Conversely, bright, sunlit mornings immediately elevate my mood and invigorate my productivity.

4. How is the weather in your hometown?
My hometown features a tropical monsoon climate characterized by two distinct seasons: a prolonged wet season with torrential downpours and a dry season with intense tropical heat. During transitional months, however, we do get brief spells of pleasant, breezy days.

5. Do you think that weather affects people's behavior?
Undoubtedly. Extreme climatic conditions noticeably dictate how people socialize and commute. For instance, during inclement weather like typhoons or heatwaves, streets become deserted as people retreat indoors, which can lead to reduced physical activity and increased reliance on indoor amenities.`,
    sampleAnswerBand8: `1. What's your favorite type of weather?
I really love cool, breezy autumn days. It feels very refreshing and comfortable, so I can go outside and hang out with friends without sweating.

2. Do you prefer hot or cold weather?
I definitely prefer colder weather. It's much easier to stay warm by wearing a jacket, while hot weather makes me feel tired quickly.

3. Does the weather ever affect your mood?
Yes, absolutely. When it's sunny and bright, I feel energetic and ready to work. But on rainy, gloomy days, I usually feel sleepy and just want to stay in bed.

4. How is the weather in your hometown?
It's quite hot and humid for most of the year because of the tropical climate, with frequent rain showers in the afternoon during summer.

5. Do you think that weather affects people's behavior?
Yes, I think so. When the weather is nice, people go out more to parks and cafes. If it's raining heavily, traffic gets congested and people prefer staying at home.`,
    keyVocabulary: [
      { word: 'crisp weather', ipa: '/krɪsp ˈweð.ər/', meaning: 'thời tiết se lạnh, khô ráo, dễ chịu', example: 'I enjoy taking long walks in the crisp autumn weather.' },
      { word: 'scorching heat', ipa: '/ˈskɔː.tʃɪŋ hiːt/', meaning: 'nắng nóng gay gắt, thiêu đốt', example: 'The scorching heat forced everyone to stay inside air-conditioned rooms.' },
      { word: 'seasonal affective disorder', ipa: '/ˌsiː.zən.əl əˈfek.tɪv dɪsˈɔː.dər/', meaning: 'chứng rối loạn cảm xúc theo mùa', example: 'Many people experience mood drops in winter due to seasonal affective disorder.' },
      { word: 'torrential downpour', ipa: '/təˈren.ʃəl ˈdaʊn.pɔːr/', meaning: 'mưa như trút nước', example: 'A torrential downpour caught us off guard on our way home.' },
      { word: 'inclement weather', ipa: '/ɪnˈklem.ənt ˈweð.ər/', meaning: 'thời tiết khắc nghiệt, xấu', example: 'The flight was cancelled due to inclement weather conditions.' }
    ]
  },
  PART_2: {
    part: 'PART_2',
    topic: 'Unforgettable Advertisement',
    subTitle: 'Part 2: Individual Long Turn (3 - 4 phút)',
    description: 'Bạn có 1 phút chuẩn bị với giấy nháp và 2 phút nói liên tục theo Cue Card dưới đây.',
    durationLabel: '3 - 4 phút (1 phút chuẩn bị, 2 phút nói)',
    cueCard: {
      topic: 'Describe an unforgettable advertisement that you saw',
      bulletPoints: [
        'Where you saw it',
        'What kind of advertisement it was',
        'What product/service was advertised',
        'And say how you felt when you saw it'
      ]
    },
    sampleAnswerBand9: `I would like to talk about an exceptionally evocative public awareness commercial that left an indelible impression on me. I initially stumbled upon it on YouTube a couple of years ago, right before watching an educational documentary.

It was an emotionally charged, narrative-driven video advertisement produced by the World Wildlife Fund (WWF), aimed at raising awareness about deforestation and the critically endangered status of orangutans caused by unsustainable palm oil production.

The advert featured a beautifully animated storyline of a young girl who discovers a mischievous baby orangutan in her bedroom, creating chaos. However, as the narrative unfolds, the tone shifts poignantly when the orangutan explains that humans have destroyed its rainforest habitat to harvest palm oil for everyday consumer goods like shampoo and confectionery.

What made this commercial truly unforgettable was its sheer emotional resonance. Instead of employing aggressive sales pitches or dry statistical graphs, the creators crafted a deeply humanizing and poignant visual metaphor. When the screen faded to black with a heart-wrenching message about habitat loss, I felt an intense mixture of empathy, sorrow, and moral responsibility. It served as a powerful wake-up call that fundamentally altered my consumer habits, prompting me to meticulously check product labels for sustainable certifications ever since.`,
    sampleAnswerBand8: `I would like to describe a very memorable advertisement that I saw about two years ago on social media. It was a video commercial about environmental protection created by an international wildlife organization.

The advertisement told a story about a baby orangutan that lost its natural habitat in the rainforest due to excessive deforestation for palm oil cultivation. 

I found this advertisement unforgettable because the animation was very realistic and touching. Unlike typical commercial ads that try to sell products, this one focused on educating people about real global challenges. When I watched it, I felt deeply moved and realized how our daily consumption can harm wildlife animals. Since then, I have paid more attention to eco-friendly products.`,
    keyVocabulary: [
      { word: 'evocative commercial', ipa: '/ɪˈvɒk.ə.tɪv kəˈmɜː.ʃəl/', meaning: 'quảng cáo gợi nhiều cảm xúc sâu sắc', example: 'The brand released an evocative commercial celebrating family reunions.' },
      { word: 'indelible impression', ipa: '/ɪnˈdel.ə.bəl ɪmˈpreʃ.ən/', meaning: 'ấn tượng không thể phai mờ', example: 'The speech made an indelible impression on everyone in the auditorium.' },
      { word: 'poignant visual metaphor', ipa: '/ˈpɔɪ.njənt ˈvɪʒ.u.əl ˈmet.ə.fɔːr/', meaning: 'phép ẩn dụ hình ảnh xúc động, chạm đến trái tim', example: 'The director used a poignant visual metaphor to highlight climate crisis.' },
      { word: 'emotional resonance', ipa: '/ɪˈməʊ.ʃən.əl ˈrez.ən.əns/', meaning: 'sự đồng cảm sâu sắc về mặt cảm xúc', example: 'The narrative carries strong emotional resonance with young audiences.' },
      { word: 'wake-up call', ipa: '/ˈweɪk.ʌp kɔːl/', meaning: 'hồi chuông cảnh tỉnh', example: 'The documentary was an urgent wake-up call regarding plastic waste.' }
    ]
  },
  PART_3: {
    part: 'PART_3',
    topic: 'Art & Society',
    subTitle: 'Part 3: Two-way Discussion (4 - 5 phút)',
    description: 'Giám khảo đào sâu các câu hỏi học thuật, trừu tượng về vai trò của Nghệ thuật, giáo dục nghệ thuật và công nghệ.',
    durationLabel: '4 - 5 phút',
    questions: [
      "How important do you think art is in our daily lives?",
      "Do you believe that everyone can appreciate and understand art in the same way?",
      "In your opinion, should art education be mandatory in schools?",
      "How has the role of art in society changed over the years?",
      "Can you discuss the impact of technology on traditional art forms?"
    ],
    sampleAnswerBand9: `1. How important do you think art is in our daily lives?
From my perspective, art is fundamental to the human experience. Beyond its evident aesthetic value, art acts as a vital conduit for emotional catharsis, cultural preservation, and critical reflection. In a fast-paced modern world dominated by utilitarian pursuits, engaging with visual arts, music, or literature nurtures empathy and enriches our psychological well-being.

2. Do you believe that everyone can appreciate and understand art in the same way?
Certainly not. Artistic interpretation is inherently subjective and heavily mediated by an individual's cultural background, personal sensibilities, and intellectual exposure. While one spectator might perceive an abstract painting as profound commentary on existential angst, another might dismiss it as arbitrary brushwork. This divergence in perception is precisely what lends art its enduring intrigue.

3. In your opinion, should art education be mandatory in schools?
I strongly advocate for making art education compulsory in primary and secondary curricula. It stimulates divergent thinking, enhances spatial reasoning, and fosters creative problem-solving skills that are indispensable across STEM disciplines. Moreover, it cultivates cultural literacy, allowing students to comprehend multifaceted historical perspectives.

4. How has the role of art in society changed over the years?
Historically, art was predominantly commissioned by the aristocracy, religious institutions, or ruling elites to project authority and dogma. In contemporary society, however, art has become immensely democratized. It now serves as a potent vehicle for civic protest, social commentary, and marginalized voices to challenge entrenched socio-political paradigms.

5. Can you discuss the impact of technology on traditional art forms?
Technology has exerted a profound, dual-faceted impact. On one hand, digital mediums, AI-driven generative software, and virtual galleries have democratized creation and expanded artistic accessibility worldwide. On the other hand, the proliferation of instant digital art risks overshadowing traditional craftsmanship, such as classical oil painting and artisanal sculpting, which require years of deliberate tactile mastery.`,
    sampleAnswerBand8: `1. How important do you think art is in our daily lives?
I believe art plays a very important role because it allows people to express their feelings and relieve stress after long hours of work. It also makes our living environment much more beautiful and inspiring.

2. Do you believe that everyone can appreciate and understand art in the same way?
No, I don't think so. People have different life experiences, educational backgrounds, and personal tastes, so everyone interprets an artwork from their own unique angle.

3. In your opinion, should art education be mandatory in schools?
Yes, definitely. Art encourages young students to develop their creativity and imagination, which helps them balance with academic subjects like Math and Science.

4. How has the role of art in society changed over the years?
In the past, art was mostly reserved for wealthy people and religious ceremonies. Nowadays, anyone can visit galleries or view art on the internet, and artists often use art to raise awareness about social and environmental issues.

5. Can you discuss the impact of technology on traditional art forms?
Technology has made art more accessible through digital drawing and online exhibitions. However, it also creates challenges for traditional artists because digital tools can produce artworks much faster than manual painting.`,
    keyVocabulary: [
      { word: 'emotional catharsis', ipa: '/ɪˈməʊ.ʃən.əl kəˈθɑː.sɪs/', meaning: 'sự giải tỏa cảm xúc sâu sắc qua nghệ thuật', example: 'Listening to classical music provides immense emotional catharsis.' },
      { word: 'inherently subjective', ipa: '/ɪnˈhɪə.rənt.li səbˈdʒek.tɪv/', meaning: 'mang tính chủ quan vốn có', example: 'Beauty in modern art is inherently subjective.' },
      { word: 'divergent thinking', ipa: '/daɪˈvɜː.dʒənt ˈθɪŋ.kɪŋ/', meaning: 'tư duy phân kỳ, sáng tạo đa chiều', example: 'Art curriculum is essential for nurturing divergent thinking in children.' },
      { word: 'democratize access', ipa: '/dɪˈmɒk.rə.taɪz ˈæk.ses/', meaning: 'bình dân hóa / phổ cập quyền tiếp cận', example: 'The internet has democratized access to world-class art collections.' },
      { word: 'tactile mastery', ipa: '/ˈtæk.taɪl ˈmɑː.stər.i/', meaning: 'kỹ năng xúc giác / tay nghề thủ công điêu luyện', example: 'Traditional sculpture requires years of dedicated tactile mastery.' }
    ]
  }
};

export interface SpeakingGraderViewProps {
  initialMode?: 'PRACTICE' | 'SIMULATION';
  initialPart?: 'PART_1' | 'PART_2' | 'PART_3';
  onExit?: () => void;
  onCompleted?: () => void;
}

export type SimPhase = 
  | 'IDLE'                 // Before clicking Start Exam
  | 'EXAMINER_SPEAKING'    // Examiner TTS reading prompt / question
  | 'CANDIDATE_RECORDING'  // Mic open, candidate is speaking
  | 'PART2_PREP'           // 60-second prep countdown for Cue Card
  | 'PART2_SPEAKING'       // 2-minute candidate monologue
  | 'CONCLUDING'           // Final examiner closing remark
  | 'FINISHED';            // Exam finished, grading

export const SpeakingGraderView: React.FC<SpeakingGraderViewProps> = ({
  initialMode = 'PRACTICE',
  initialPart = 'PART_1',
  onExit,
  onCompleted
}) => {
  const [examMode, setExamMode] = useState<'PRACTICE' | 'SIMULATION'>(initialMode);
  const [selectedPart, setSelectedPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>(initialPart);
  const currentData = SPEAKING_3_PARTS_DATA[selectedPart];

  // Global 15-minute exam timer for SIMULATION
  const [simulationTimeLeft, setSimulationTimeLeft] = useState<number>(900); // 15 mins
  const [isSimTimerActive, setIsSimTimerActive] = useState<boolean>(true);

  // Multi-part answers storage for full simulation
  const [partTranscripts, setPartTranscripts] = useState<Record<string, string>>({
    PART_1: '',
    PART_2: '',
    PART_3: ''
  });
  const [partAudioUrls, setPartAudioUrls] = useState<Record<string, string | null>>({
    PART_1: null,
    PART_2: null,
    PART_3: null
  });

  // Part 2 Prep & Talk Timers
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(60);
  const [isPrepActive, setIsPrepActive] = useState<boolean>(false);
  const [prepNotes, setPrepNotes] = useState<string>('');
  const [talkTimeLeft, setTalkTimeLeft] = useState<number>(120);
  const [isTalkActive, setIsTalkActive] = useState<boolean>(false);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeakingExaminer, setIsSpeakingExaminer] = useState<boolean>(false);

  // Simulation Interactive Engine States
  const [simPhase, setSimPhase] = useState<SimPhase>('IDLE');
  const [simQuestionIdx, setSimQuestionIdx] = useState<number>(0);
  const [simExaminerSpeech, setSimExaminerSpeech] = useState<string>('');
  const [simCurrentAnswer, setSimCurrentAnswer] = useState<string>('');
  const [simSilenceCountdown, setSimSilenceCountdown] = useState<number | null>(null);
  const [autoAdvanceSilence, setAutoAdvanceSilence] = useState<boolean>(true);
  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);
  
  // Accumulated answers per question for structured transcripts
  const simQuestionAnswersRef = useRef<{
    PART_1: string[];
    PART_2: string;
    PART_3: string[];
  }>({
    PART_1: ['', '', '', '', ''],
    PART_2: '',
    PART_3: ['', '', '', '', '']
  });

  const lastSpokenTimestampRef = useRef<number>(Date.now());
  const hasSpokenRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const simSpeechRecognitionRef = useRef<any>(null);

  // Grading States
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'QUESTIONS' | 'SAMPLE_9' | 'SAMPLE_8' | 'VOCAB' | 'CRITERIA'>('QUESTIONS');
  const [showRubricModal, setShowRubricModal] = useState<boolean>(false);
  const [rubricFilterBand, setRubricFilterBand] = useState<number | 'ALL'>('ALL');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Simulation 15-minute global timer
  useEffect(() => {
    if (examMode !== 'SIMULATION' || !isSimTimerActive || simulationTimeLeft <= 0 || gradingResult) return;
    const timer = setInterval(() => {
      setSimulationTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSimTimerActive(false);
          handleGradeFullSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examMode, isSimTimerActive, simulationTimeLeft, gradingResult]);

  // Cue card prep timer effect (for Part 2 in both modes)
  useEffect(() => {
    if (!isPrepActive || prepTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPrepActive(false);
          // In simulation mode, when prep finishes, transition to speaking!
          if (examMode === 'SIMULATION' && simPhase === 'PART2_PREP') {
            handlePrepTimeFinishedInSim();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPrepActive, prepTimeLeft, examMode, simPhase]);

  // Talk timer effect
  useEffect(() => {
    if (!isTalkActive || talkTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setTalkTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTalkActive(false);
          if (examMode === 'SIMULATION' && simPhase === 'PART2_SPEAKING') {
            handlePart2FinishedInSim();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTalkActive, talkTimeLeft, examMode, simPhase]);

  // Silence monitor interval during interactive candidate recording in SIMULATION mode
  useEffect(() => {
    if (examMode !== 'SIMULATION' || isSimPaused) {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      return;
    }

    if (simPhase === 'CANDIDATE_RECORDING' || simPhase === 'PART2_SPEAKING') {
      silenceTimerRef.current = setInterval(() => {
        if (!autoAdvanceSilence) {
          setSimSilenceCountdown(null);
          return;
        }

        const elapsed = Date.now() - lastSpokenTimestampRef.current;

        // In Part 1 & Part 3: candidate speaks 2-4 sentences per question
        if (simPhase === 'CANDIDATE_RECORDING') {
          if (hasSpokenRef.current) {
            // After candidate started speaking and pauses for > 2.2s
            if (elapsed >= 2200 && elapsed < 3600) {
              const remaining = Math.max(1, Math.ceil((3600 - elapsed) / 1000));
              setSimSilenceCountdown(remaining);
            } else if (elapsed >= 3600) {
              // 3.6s of silence detected -> automatically advance to next question
              setSimSilenceCountdown(null);
              handleSimAdvanceNext();
            } else {
              setSimSilenceCountdown(null);
            }
          }
        } else if (simPhase === 'PART2_SPEAKING') {
          // Part 2: long turn monologue. If candidate has spoken for a while and then stops for > 4.5s
          if (hasSpokenRef.current && elapsed >= 4500) {
            setSimSilenceCountdown(null);
            handlePart2FinishedInSim();
          }
        }
      }, 200);
    } else {
      setSimSilenceCountdown(null);
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    }

    return () => {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    };
  }, [examMode, simPhase, isSimPaused, autoAdvanceSilence, selectedPart, simQuestionIdx]);

  // Browser Speech Synthesis for British Examiner Voice
  const speakExaminerUtterance = (text: string, onEndCallback: () => void) => {
    if (!('speechSynthesis' in window)) {
      setSimExaminerSpeech(text);
      setTimeout(onEndCallback, 3000);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.95; // Official IELTS pace
    utterance.pitch = 1.0;

    setSimExaminerSpeech(text);
    setSimPhase('EXAMINER_SPEAKING');
    setIsSpeakingExaminer(true);

    let finished = false;
    const triggerFinish = () => {
      if (finished) return;
      finished = true;
      setIsSpeakingExaminer(false);
      onEndCallback();
    };

    utterance.onend = triggerFinish;
    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      triggerFinish();
    };

    // Fallback timer for browsers where utterance.onend might be delayed
    const wordCount = text.split(/\s+/).length;
    const maxDurationMs = Math.max(3000, (wordCount / 2.2) * 1000 + 2000);
    const safetyTimeout = setTimeout(triggerFinish, maxDurationMs + 3000);

    utterance.onstart = () => {
      setIsSpeakingExaminer(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayExaminerAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeakingExaminer(true);
      utterance.onend = () => setIsSpeakingExaminer(false);
      utterance.onerror = () => setIsSpeakingExaminer(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Candidate Recording for a specific Simulation Question
  const startSimMicRecording = async () => {
    try {
      setSimCurrentAnswer('');
      setSimSilenceCountdown(null);
      hasSpokenRef.current = false;
      lastSpokenTimestampRef.current = Date.now();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPartAudioUrls(prev => ({ ...prev, [selectedPart]: audioUrl }));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript + ' ';
            }
            const trimmed = fullText.trim();
            if (trimmed) {
              setSimCurrentAnswer(trimmed);
              hasSpokenRef.current = true;
              lastSpokenTimestampRef.current = Date.now();
              setSimSilenceCountdown(null);
            }
          };

          recognition.onerror = (e: any) => console.warn("Recognition notice:", e);
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition error:", e);
        }
      }
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập Micro trên trình duyệt để thi Speaking trực tiếp.");
    }
  };

  const stopSimMicRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
  };

  // Save current question answer to transcripts
  const saveCurrentSimQuestionAnswer = () => {
    const answer = simCurrentAnswer.trim();
    if (!answer) return;

    if (selectedPart === 'PART_1') {
      const qList = SPEAKING_3_PARTS_DATA.PART_1.questions || [];
      const qText = qList[simQuestionIdx] || `Question ${simQuestionIdx + 1}`;
      simQuestionAnswersRef.current.PART_1[simQuestionIdx] = `Q${simQuestionIdx + 1}: ${qText}\nCandidate Answer: ${answer}`;
      
      const compiledP1 = simQuestionAnswersRef.current.PART_1.filter(Boolean).join('\n\n');
      setPartTranscripts(prev => ({ ...prev, PART_1: compiledP1 }));
    } else if (selectedPart === 'PART_2') {
      simQuestionAnswersRef.current.PART_2 = `Cue Card: Describe an unforgettable advertisement that you saw.\nCandidate Answer: ${answer}`;
      setPartTranscripts(prev => ({ ...prev, PART_2: simQuestionAnswersRef.current.PART_2 }));
    } else if (selectedPart === 'PART_3') {
      const qList = SPEAKING_3_PARTS_DATA.PART_3.questions || [];
      const qText = qList[simQuestionIdx] || `Question ${simQuestionIdx + 1}`;
      simQuestionAnswersRef.current.PART_3[simQuestionIdx] = `Q${simQuestionIdx + 1}: ${qText}\nCandidate Answer: ${answer}`;
      
      const compiledP3 = simQuestionAnswersRef.current.PART_3.filter(Boolean).join('\n\n');
      setPartTranscripts(prev => ({ ...prev, PART_3: compiledP3 }));
    }
  };

  // Master Simulation Controller
  const handleStartFullInteractiveExam = () => {
    setExamMode('SIMULATION');
    setSelectedPart('PART_1');
    setSimQuestionIdx(0);
    setSimPhase('EXAMINER_SPEAKING');
    setSimulationTimeLeft(900);
    setIsSimTimerActive(true);
    setGradingResult(null);
    simQuestionAnswersRef.current = {
      PART_1: ['', '', '', '', ''],
      PART_2: '',
      PART_3: ['', '', '', '', '']
    };
    setPartTranscripts({ PART_1: '', PART_2: '', PART_3: '' });

    const q1 = SPEAKING_3_PARTS_DATA.PART_1.questions?.[0] || "What's your favorite type of weather?";
    const introSpeech = `Good morning. Welcome to the IELTS Speaking exam. Let's begin Part 1 on the topic of Weather. First question: ${q1}`;

    speakExaminerUtterance(introSpeech, () => {
      setSimPhase('CANDIDATE_RECORDING');
      startSimMicRecording();
    });
  };

  // Examiner asks a specific question in Part 1 or Part 3 and then auto-opens mic
  const handleAskQuestionInSim = (part: 'PART_1' | 'PART_3', qIndex: number) => {
    const qList = SPEAKING_3_PARTS_DATA[part].questions || [];
    const questionText = qList[qIndex] || '';
    
    // Smooth examiner transition acknowledgment
    const prefixes = [
      "Thank you. Now,",
      "Alright. Next,",
      "Thank you. Let's move to the next question.",
      "I see. Now,",
      "Thank you. And,"
    ];
    const prefix = prefixes[qIndex % prefixes.length];
    const fullSpeech = `${prefix} ${questionText}`;

    speakExaminerUtterance(fullSpeech, () => {
      setSimPhase('CANDIDATE_RECORDING');
      startSimMicRecording();
    });
  };

  // Called when silence pause is detected or user clicks "Next Question"
  const handleSimAdvanceNext = () => {
    stopSimMicRecording();
    saveCurrentSimQuestionAnswer();
    setSimCurrentAnswer('');

    if (selectedPart === 'PART_1') {
      if (simQuestionIdx < 4) {
        const nextIdx = simQuestionIdx + 1;
        setSimQuestionIdx(nextIdx);
        handleAskQuestionInSim('PART_1', nextIdx);
      } else {
        // Part 1 Complete -> Transition to Part 2
        setSelectedPart('PART_2');
        setSimPhase('EXAMINER_SPEAKING');
        
        const part2Speech = `Thank you. That brings us to the end of Part 1. Now we will move to Part 2. Here is your cue card topic: Describe an unforgettable advertisement that you saw. You have one minute to prepare your notes, and then you will speak for two minutes. Your one minute preparation time begins now.`;
        
        speakExaminerUtterance(part2Speech, () => {
          setSimPhase('PART2_PREP');
          setPrepTimeLeft(60);
          setIsPrepActive(true);
        });
      }
    } else if (selectedPart === 'PART_3') {
      if (simQuestionIdx < 4) {
        const nextIdx = simQuestionIdx + 1;
        setSimQuestionIdx(nextIdx);
        handleAskQuestionInSim('PART_3', nextIdx);
      } else {
        // Part 3 Complete -> Test Ends!
        handleFinishFullInteractiveExam();
      }
    }
  };

  // Called when Part 2 preparation time is finished (or candidate skips prep)
  const handlePrepTimeFinishedInSim = () => {
    setIsPrepActive(false);
    setSimPhase('EXAMINER_SPEAKING');

    const promptSpeech = `Your one minute preparation time is up. Please begin speaking for one to two minutes on this topic now.`;

    speakExaminerUtterance(promptSpeech, () => {
      setSimPhase('PART2_SPEAKING');
      setTalkTimeLeft(120);
      setIsTalkActive(true);
      startSimMicRecording();
    });
  };

  // Called when Part 2 speaking is finished -> Transition to Part 3
  const handlePart2FinishedInSim = () => {
    stopSimMicRecording();
    setIsTalkActive(false);
    saveCurrentSimQuestionAnswer();
    setSimCurrentAnswer('');

    setSelectedPart('PART_3');
    setSimQuestionIdx(0);
    setSimPhase('EXAMINER_SPEAKING');

    const q1 = SPEAKING_3_PARTS_DATA.PART_3.questions?.[0] || "How important do you think art is in our daily lives?";
    const part3Speech = `Thank you. That is the end of Part 2. Now let's move on to Part 3 with further discussion questions regarding Art and Society. First question: ${q1}`;

    speakExaminerUtterance(part3Speech, () => {
      setSimPhase('CANDIDATE_RECORDING');
      startSimMicRecording();
    });
  };

  // Called when entire exam finishes
  const handleFinishFullInteractiveExam = () => {
    stopSimMicRecording();
    setIsTalkActive(false);
    setIsPrepActive(false);
    setSimPhase('CONCLUDING');

    const closingSpeech = `Thank you very much. That is the end of your IELTS Speaking examination. Your complete test responses are now being evaluated by the AI Senior Examiner according to official IELTS Band Descriptors.`;

    speakExaminerUtterance(closingSpeech, () => {
      setSimPhase('FINISHED');
      handleGradeFullSimulation();
    });
  };

  // Re-read current question in simulation mode
  const handleReplayCurrentQuestionInSim = () => {
    stopSimMicRecording();
    if (selectedPart === 'PART_2') {
      const p2Text = `Describe an unforgettable advertisement that you saw. You should say where you saw it, what kind of advertisement it was, what product or service was advertised, and say how you felt when you saw it.`;
      speakExaminerUtterance(p2Text, () => {
        setSimPhase('PART2_SPEAKING');
        startSimMicRecording();
      });
    } else {
      const qList = SPEAKING_3_PARTS_DATA[selectedPart].questions || [];
      const qText = qList[simQuestionIdx] || '';
      speakExaminerUtterance(qText, () => {
        setSimPhase('CANDIDATE_RECORDING');
        startSimMicRecording();
      });
    }
  };

  // Standard Practice Mode Recording
  const handleStartPracticeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPartAudioUrls(prev => ({ ...prev, [selectedPart]: audioUrl }));
      };

      mediaRecorder.start();
      setIsRecording(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript + ' ';
            }
            if (fullText.trim()) {
              setPartTranscripts(prev => ({
                ...prev,
                [selectedPart]: fullText.trim()
              }));
            }
          };

          recognition.onerror = (e: any) => console.warn("Speech rec error:", e);
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (recErr) {
          console.warn("Speech rec init:", recErr);
        }
      }

      if (selectedPart === 'PART_2' && !isTalkActive) {
        setTalkTimeLeft(120);
        setIsTalkActive(true);
      }
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Không thể truy cập Microphone. Bạn có thể nhập hoặc dán nội dung bài nói vào khung transcript bên dưới.");
    }
  };

  const handleStopPracticeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTalkActive(false);
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
  };

  const handleStartPrep = () => {
    setPrepTimeLeft(60);
    setIsPrepActive(true);
  };

  const handleResetPrep = () => {
    setIsPrepActive(false);
    setPrepTimeLeft(60);
  };

  const handleStartTalkTimer = () => {
    setTalkTimeLeft(120);
    setIsTalkActive(true);
  };

  const handleLoadSampleToTranscript = (band: 9 | 8) => {
    if (currentAudioUrl || isRecording) {
      alert("Bạn đang có file ghi âm cho Part này. Vui lòng bấm 'Xóa bản thu' nếu muốn xóa ghi âm và dán bài mẫu viết tay.");
      return;
    }
    const text = band === 9 ? currentData.sampleAnswerBand9 : (currentData.sampleAnswerBand8 || '');
    setPartTranscripts(prev => ({ ...prev, [selectedPart]: text }));
  };

  // Grade Single Part (Practice Mode)
  const handleGradeSinglePart = async () => {
    const recordedAudio = partAudioUrls[selectedPart];
    let text = (partTranscripts[selectedPart] || '').trim();
    
    if (!text && recordedAudio) {
      text = `[Candidate submitted spoken audio response via microphone for ${selectedPart.replace('_', ' ')}: Topic "${currentData.topic || currentData.cueCard?.topic}"]`;
    }

    if (!text || isGrading) {
      alert("Vui lòng ghi âm hoặc nhập nội dung bài nói của bạn trước khi bấm Chấm điểm!");
      return;
    }

    setIsGrading(true);

    try {
      const promptTitle = selectedPart === 'PART_2' 
        ? `${currentData.cueCard?.topic}. Points: ${currentData.cueCard?.bulletPoints.join(', ')}`
        : `Topic: ${currentData.topic}. Questions: ${currentData.questions?.join(' | ')}`;

      const res = await fetch('/api/grading/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          part: selectedPart,
          prompt_title: promptTitle,
          transcript: text
        })
      });
      const data = await res.json();
      setGradingResult(data.result);
      if (onCompleted) onCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  // Grade Full 3-Part Simulation Exam
  const handleGradeFullSimulation = async () => {
    const p1 = (partTranscripts.PART_1 || '').trim() || (partAudioUrls.PART_1 ? '[Candidate submitted audio response for Part 1 - Weather]' : '');
    const p2 = (partTranscripts.PART_2 || '').trim() || (partAudioUrls.PART_2 ? '[Candidate submitted audio response for Part 2 - Unforgettable Ad]' : '');
    const p3 = (partTranscripts.PART_3 || '').trim() || (partAudioUrls.PART_3 ? '[Candidate submitted audio response for Part 3 - Art & Society]' : '');
    
    const hasAnySubmission = Boolean(p1 || p2 || p3 || partAudioUrls.PART_1 || partAudioUrls.PART_2 || partAudioUrls.PART_3);

    if (!hasAnySubmission || isGrading) {
      alert("Vui lòng ghi âm hoặc nhập câu trả lời ít nhất 1 Part trước khi nộp toàn bài thi Speaking!");
      return;
    }

    const fullTranscript = `[PART 1 - Weather]:\n${p1 || '(Thí sinh chưa nộp câu trả lời Part 1)'}\n\n[PART 2 - Unforgettable Ad Cue Card]:\n${p2 || '(Thí sinh chưa nộp câu trả lời Part 2)'}\n\n[PART 3 - Art & Society]:\n${p3 || '(Thí sinh chưa nộp câu trả lời Part 3)'}`;

    setIsGrading(true);
    try {
      const res = await fetch('/api/grading/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u_student',
          part: 'PART_3',
          prompt_title: 'Full IELTS Speaking Academic Examination (Part 1 Weather, Part 2 Unforgettable Ad, Part 3 Art & Society)',
          transcript: fullTranscript
        })
      });
      const data = await res.json();
      setGradingResult(data.result);
      if (onCompleted) onCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentTranscript = partTranscripts[selectedPart] || '';
  const currentAudioUrl = partAudioUrls[selectedPart];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header with Back Button & Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 shrink-0"
                title="Quay lại danh sách đề thi"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  IELTS Speaking Academic
                </span>
                <span className="text-xs text-slate-500 font-bold">Standard 3-Part Exam & Practice Hub</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                <Mic className="w-5 h-5 text-emerald-600" />
                Luyện Thi & Chấm Điểm Speaking Giám Khảo AI
              </h1>
            </div>
          </div>

          {/* Mode & Timer Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Official Band Descriptors Rubric Button */}
            <button
              type="button"
              onClick={() => setShowRubricModal(true)}
              className="px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Xem bảng tiêu chí chấm điểm chuẩn IELTS Speaking Band Descriptors (BC/IDP/Cambridge)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>📜 Tiêu Chí Chấm IELTS (Band Descriptors)</span>
            </button>

            {/* Exam Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setExamMode('PRACTICE');
                  setGradingResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  examMode === 'PRACTICE'
                    ? 'btn-glossy-emerald text-white font-extrabold shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>🎯 Luyện Từng Part</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExamMode('SIMULATION');
                  setGradingResult(null);
                  setSimulationTimeLeft(900);
                  setIsSimTimerActive(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  examMode === 'SIMULATION'
                    ? 'btn-glossy-emerald text-white font-extrabold shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>⏱️ Thi Thật 3 Part (15P)</span>
              </button>
            </div>

            {/* Simulation Timer Indicator */}
            {examMode === 'SIMULATION' && (
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs ${
                simulationTimeLeft < 180 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-900 border-slate-800 text-emerald-400 shadow-xs'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian thi: {formatSecs(simulationTimeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-Part Navigation Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {(['PART_1', 'PART_2', 'PART_3'] as const).map((p, idx) => {
            const pData = SPEAKING_3_PARTS_DATA[p];
            const isSelected = selectedPart === p;
            const hasAnswer = Boolean(partTranscripts[p]?.trim());
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedPart(p);
                  if (examMode === 'PRACTICE') {
                    setGradingResult(null);
                  }
                  setActiveTab('QUESTIONS');
                  setIsPrepActive(false);
                  setPrepTimeLeft(60);
                }}
                className={`p-3 rounded-2xl text-left transition cursor-pointer border flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : hasAnswer
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {hasAnswer ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block truncate">
                      {p === 'PART_1' ? 'Part 1: Weather' : p === 'PART_2' ? 'Part 2: Advertisement' : 'Part 3: Art & Society'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {p === 'PART_1' ? '5 câu hỏi phỏng vấn' : p === 'PART_2' ? '1P chuẩn bị + 2P nói' : 'Thảo luận mở rộng'}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Current Part Topic Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-700">
          <div>
            <span className="font-extrabold text-slate-900 text-xs block">
              {currentData.subTitle} — Chủ đề: <strong className="text-emerald-800">{currentData.topic}</strong>
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5">{currentData.description}</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentData.durationLabel}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: SIMULATION Cockpit vs PRACTICE Layout */}
      {examMode === 'SIMULATION' && !gradingResult ? (
        /* SIMULATION MODE: Interactive AI Examiner Room */
        <div className="space-y-6">
          {simPhase === 'IDLE' ? (
            /* Simulation Lobby / Start Screen */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
                <Radio className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-black uppercase tracking-wider">
                  Live AI Examiner Simulation (Phòng Thi Trực Tiếp)
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Phòng Thi Thật IELTS Speaking Tương Tác 1-1
                </h2>
                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                  Giám khảo AI sẽ tự động đọc từng câu hỏi một (giọng chuẩn Anh - Anh), sau đó <strong>tự động mở micro</strong> để bạn trả lời. Khi bạn nói xong và dừng lại khoảng <strong>3.5 giây</strong>, giám khảo sẽ tự động chuyển sang câu tiếp theo cho đến khi hoàn thành đủ cả 3 Parts.
                </p>
              </div>

              {/* 3-Part Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                    Part 1 (4-5 phút)
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900">Chủ đề: Weather</h4>
                  <p className="text-[11px] text-slate-500">Giám khảo hỏi 5 câu ngắn về thời tiết & khí hậu.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-md">
                    Part 2 (3-4 phút)
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900">Cue Card: Advertisement</h4>
                  <p className="text-[11px] text-slate-500">1 phút chuẩn bị với giấy nháp + 2 phút độc thoại.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-indigo-800 uppercase bg-indigo-100 px-2 py-0.5 rounded-md">
                    Part 3 (4-5 phút)
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900">Chủ đề: Art & Society</h4>
                  <p className="text-[11px] text-slate-500">5 câu hỏi thảo luận mở rộng 2 chiều.</p>
                </div>
              </div>

              {/* Settings */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={autoAdvanceSilence}
                    onChange={(e) => setAutoAdvanceSilence(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  />
                  <span>Tự động chuyển câu khi im lặng khoảng 3.5s (Pause Detection)</span>
                </label>

                <span className="text-[11px] text-slate-500 font-medium">
                  🔊 Giọng giám khảo: British English (0.95x)
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartFullInteractiveExam}
                  className="px-8 py-4 rounded-2xl btn-glossy-emerald text-white text-base font-black transition cursor-pointer shadow-lg hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Bắt Đầu Phòng Thi Thật (Start Live Exam)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Interactive Exam Cockpit */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              {/* Header Status Bar with Step Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Live IELTS Examination
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {selectedPart === 'PART_1' && `Part 1: Câu ${simQuestionIdx + 1}/5 (Weather)`}
                    {selectedPart === 'PART_2' && (simPhase === 'PART2_PREP' ? 'Part 2: 1 Phút Chuẩn Bị (Cue Card)' : 'Part 2: Đang Nói (2 Phút)')}
                    {selectedPart === 'PART_3' && `Part 3: Câu ${simQuestionIdx + 1}/5 (Art & Society)`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAutoAdvanceSilence(!autoAdvanceSilence)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      autoAdvanceSilence
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tự chuyển câu khi dừng: {autoAdvanceSilence ? 'BẬT' : 'TẮT'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinishFullInteractiveExam}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Nộp bài sớm</span>
                  </button>
                </div>
              </div>

              {/* Examiner Spotlight & Soundwave Box */}
              <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
                simPhase === 'EXAMINER_SPEAKING'
                  ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-500 shadow-lg'
                  : simPhase === 'CANDIDATE_RECORDING' || simPhase === 'PART2_SPEAKING'
                  ? 'bg-gradient-to-br from-emerald-950 to-slate-900 text-white border-emerald-500 shadow-lg'
                  : simPhase === 'PART2_PREP'
                  ? 'bg-gradient-to-br from-amber-950 to-slate-900 text-white border-amber-500 shadow-lg'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                      simPhase === 'EXAMINER_SPEAKING'
                        ? 'bg-indigo-600 border-indigo-300 text-white animate-pulse'
                        : simPhase === 'CANDIDATE_RECORDING' || simPhase === 'PART2_SPEAKING'
                        ? 'bg-emerald-600 border-emerald-300 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {simPhase === 'EXAMINER_SPEAKING' ? (
                        <Volume2 className="w-7 h-7 animate-bounce" />
                      ) : simPhase === 'CANDIDATE_RECORDING' || simPhase === 'PART2_SPEAKING' ? (
                        <Mic className="w-7 h-7 animate-pulse" />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">IELTS Senior Examiner AI</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-slate-200">
                          British Council Certified Voice
                        </span>
                      </div>

                      {/* Dynamic Stage Badge */}
                      <p className="text-xs font-bold mt-1">
                        {simPhase === 'EXAMINER_SPEAKING' && (
                          <span className="text-indigo-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                            🗣️ Giám khảo đang đọc câu hỏi... (Vui lòng lắng nghe)
                          </span>
                        )}
                        {simPhase === 'CANDIDATE_RECORDING' && (
                          <span className="text-emerald-300 flex items-center gap-1.5 animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            🎙️ Micro đang mở — Hãy trả lời ngay!
                          </span>
                        )}
                        {simPhase === 'PART2_PREP' && (
                          <span className="text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            📝 1 Phút Chuẩn Bị Giấy Nháp cho Part 2...
                          </span>
                        )}
                        {simPhase === 'PART2_SPEAKING' && (
                          <span className="text-emerald-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5" />
                            🎤 Đang ghi âm bài nói Part 2 (Nói liên tục trong 1-2 phút)
                          </span>
                        )}
                        {simPhase === 'CONCLUDING' && (
                          <span className="text-teal-300">
                            🏁 Hoàn thành bài thi! Đang chuẩn bị chấm điểm...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Timers */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {simPhase === 'PART2_PREP' && (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/30 border border-amber-400 text-amber-200 font-mono font-black text-sm">
                        Chuẩn bị: {prepTimeLeft}s
                      </span>
                    )}
                    {simPhase === 'PART2_SPEAKING' && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-mono font-black text-sm">
                        Nói: {Math.floor(talkTimeLeft / 60)}:{(talkTimeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleReplayCurrentQuestionInSim}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/20 flex items-center gap-1.5"
                      title="Yêu cầu giám khảo đọc lại câu hỏi"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đọc lại</span>
                    </button>
                  </div>
                </div>

                {/* Examiner Speech Transcript Box */}
                <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Lời Giám Khảo (Examiner Prompt):
                  </span>
                  <p className="text-sm font-serif text-slate-100 leading-relaxed italic">
                    "{simExaminerSpeech || (selectedPart === 'PART_2' ? currentData.cueCard?.topic : currentData.questions?.[simQuestionIdx])}"
                  </p>
                </div>
              </div>

              {/* Part 2 Cue Card Spotlight when in Part 2 */}
              {selectedPart === 'PART_2' && currentData.cueCard && (
                <div className="p-5 bg-amber-50/90 border-2 border-amber-300 rounded-3xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                      IELTS Cue Card (Candidate Task Card)
                    </span>
                    {simPhase === 'PART2_PREP' && (
                      <button
                        type="button"
                        onClick={handlePrepTimeFinishedInSim}
                        className="text-xs font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl border border-emerald-300 cursor-pointer"
                      >
                        Tôi đã chuẩn bị xong, muốn nói ngay ➔
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 font-serif">
                    {currentData.cueCard.topic}
                  </h3>
                  <p className="text-xs font-bold text-slate-700">You should say:</p>
                  <ul className="space-y-1 pl-2 text-xs text-slate-800">
                    {currentData.cueCard.bulletPoints.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Scratchpad during Prep */}
                  <div className="pt-2 border-t border-amber-200 space-y-1">
                    <label className="text-[10px] font-extrabold text-amber-950 uppercase">
                      📝 Giấy nháp chuẩn bị ý tưởng (Notes):
                    </label>
                    <textarea
                      rows={2}
                      value={prepNotes}
                      onChange={(e) => setPrepNotes(e.target.value)}
                      placeholder="Ghi nhanh từ khóa: WWF commercial, YouTube, palm oil..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Silence Pause Countdown Alert Banner */}
              {simSilenceCountdown !== null && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-mono font-black text-lg flex items-center justify-center shrink-0 animate-bounce">
                      {simSilenceCountdown}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">
                        Đã phát hiện bạn ngừng nói ({simSilenceCountdown}s)
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Hệ thống sẽ tự động chuyển sang câu tiếp theo. Bạn có thể bấm nói tiếp hoặc chuyển ngay!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        lastSpokenTimestampRef.current = Date.now();
                        setSimSilenceCountdown(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold cursor-pointer"
                    >
                      Tôi muốn nói tiếp
                    </button>
                    <button
                      type="button"
                      onClick={handleSimAdvanceNext}
                      className="px-3.5 py-1.5 rounded-xl btn-glossy-emerald text-white text-xs font-black cursor-pointer shadow-sm"
                    >
                      Chuyển ngay ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Candidate Speech Transcript Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nội Dung Câu Trả Lời Của Bạn (Trích Xuất Trực Tiếp):</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {simCurrentAnswer.trim() ? simCurrentAnswer.trim().split(/\s+/).filter(Boolean).length : 0} từ
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={simCurrentAnswer}
                    readOnly={true}
                    placeholder="Micro đang lắng nghe câu trả lời của bạn... Các từ sẽ tự động xuất hiện tại đây khi bạn nói."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-4 text-xs font-mono leading-relaxed cursor-not-allowed select-text focus:outline-none shadow-inner"
                  />
                  {simPhase === 'CANDIDATE_RECORDING' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-[10px] font-bold text-rose-700 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>REC</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulation Stage Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span>Tiến độ: </span>
                  <strong className="text-slate-800">
                    {selectedPart === 'PART_1' && `Part 1 (Câu ${simQuestionIdx + 1}/5)`}
                    {selectedPart === 'PART_2' && 'Part 2 (Cue Card)'}
                    {selectedPart === 'PART_3' && `Part 3 (Câu ${simQuestionIdx + 1}/5)`}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimAdvanceNext}
                    className="px-5 py-2.5 rounded-xl btn-glossy-emerald text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>
                      {selectedPart === 'PART_1' && simQuestionIdx === 4
                        ? 'Hoàn thành Part 1 ➔ Sang Part 2'
                        : selectedPart === 'PART_2'
                        ? 'Hoàn thành Part 2 ➔ Sang Part 3'
                        : selectedPart === 'PART_3' && simQuestionIdx === 4
                        ? 'Hoàn thành bài thi ➔ Nộp chấm điểm'
                        : 'Trả Lời Xong (Câu Tiếp Theo) ➔'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PRACTICE MODE OR RESULTS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Questions, Cue Card, Timer & Recording Transcript */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
              {/* Header Tabs: Questions vs Sample Band 9.0 vs Vocab vs Criteria */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('QUESTIONS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'QUESTIONS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {selectedPart === 'PART_2' ? '📋 Cue Card Đề Bài' : '❓ Bộ Câu Hỏi Giám Khảo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('SAMPLE_9')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === 'SAMPLE_9' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bài Mẫu Band 9.0</span>
                  </button>
                  {currentData.sampleAnswerBand8 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('SAMPLE_8')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === 'SAMPLE_8' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Band 8.0
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('VOCAB')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === 'VOCAB' ? 'bg-amber-600 text-white' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Từ Vựng C1/C2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('CRITERIA')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeTab === 'CRITERIA' ? 'bg-indigo-600 text-white' : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Bảng Tiêu Chí (Band 1-9)</span>
                  </button>
                </div>

                {/* Speech synthesis prompt */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPart === 'PART_2') {
                      handlePlayExaminerAudio(`Describe an unforgettable advertisement that you saw. You should say: where you saw it, what kind of advertisement it was, what product or service was advertised, and say how you felt when you saw it.`);
                    } else {
                      handlePlayExaminerAudio(currentData.questions?.join('. ') || '');
                    }
                  }}
                  className="text-[11px] font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-xl transition cursor-pointer border border-slate-200"
                  title="Giám khảo AI đọc toàn bộ câu hỏi (Giọng Anh - Anh)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Giám khảo đọc</span>
                </button>
              </div>

              {/* Tab 1: Questions / Cue Card */}
              {activeTab === 'QUESTIONS' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {selectedPart === 'PART_2' && currentData.cueCard ? (
                    /* PART 2 CUE CARD */
                    <div className="space-y-4">
                      <div className="p-5 bg-gradient-to-br from-amber-50/80 to-amber-100/40 border-2 border-amber-300 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                            IELTS Speaking Candidate Task Card
                          </span>
                          <span className="text-[11px] font-bold text-amber-900">Chuẩn bị: 1 phút | Nói: 2 phút</span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 font-serif">
                          {currentData.cueCard.topic}
                        </h3>

                        <p className="text-xs font-bold text-slate-700">You should say:</p>
                        <ul className="space-y-1.5 pl-2 text-xs text-slate-800 font-medium">
                          {currentData.cueCard.bulletPoints.map((bp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Part 2: 1-Minute Prep Countdown & Scratchpad */}
                      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                              1 Phút Chuẩn Bị (Prep Countdown)
                            </span>
                          </div>
                          <span className={`font-mono text-base font-black px-3 py-0.5 rounded-lg ${
                            prepTimeLeft <= 10 ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse' : 'bg-slate-800 text-emerald-300 border border-slate-700'
                          }`}>
                            {prepTimeLeft}s
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isPrepActive ? (
                            <button
                              type="button"
                              onClick={handleStartPrep}
                              className="flex-1 py-2 rounded-xl btn-glossy-emerald text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Bắt Đầu 1 Phút Chuẩn Bị</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResetPrep}
                              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Đặt lại thời gian (Reset)</span>
                            </button>
                          )}
                        </div>

                        {/* Scratchpad for notes */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>📝 Giấy nháp ghi chú nhanh (Cue Card Notes):</span>
                            <span>{prepNotes.length} ký tự</span>
                          </label>
                          <textarea
                            rows={3}
                            value={prepNotes}
                            onChange={(e) => setPrepNotes(e.target.value)}
                            placeholder="Ghi nhanh từ khóa: WWF commercial, YouTube, deforestation & palm oil, heart-wrenching wake-up call..."
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* PART 1 & PART 3 QUESTIONS LIST */
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 italic">
                        Nhấp vào biểu tượng loa để nghe giám khảo đọc từng câu hỏi chuẩn giọng Anh - Anh:
                      </p>
                      {currentData.questions?.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition flex items-start justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 font-serif leading-snug">{q}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayExaminerAudio(q)}
                            className="p-2 rounded-xl bg-white group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-800 border border-slate-200 transition cursor-pointer shrink-0 shadow-2xs"
                            title="Nghe giám khảo đọc câu hỏi này"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Band 9.0 Sample Answer */}
              {activeTab === 'SAMPLE_9' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Bài Mẫu Chuẩn Band 9.0 Tuyệt Đối
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleToTranscript(9)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white px-3 py-1 rounded-lg border border-emerald-300 transition cursor-pointer shadow-2xs"
                    >
                      Dán vào bài nói của bạn ➔
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 text-xs font-serif leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto selection:bg-emerald-500">
                    {currentData.sampleAnswerBand9}
                  </div>
                </div>
              )}

              {/* Tab 3: Band 8.0 Sample Answer */}
              {activeTab === 'SAMPLE_8' && currentData.sampleAnswerBand8 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs">
                    <span className="font-extrabold text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Bài Mẫu Chuẩn Band 8.0
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleToTranscript(8)}
                      className="text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-white px-3 py-1 rounded-lg border border-teal-300 transition cursor-pointer shadow-2xs"
                    >
                      Dán vào bài nói của bạn ➔
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 text-xs font-serif leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto selection:bg-teal-500">
                    {currentData.sampleAnswerBand8}
                  </div>
                </div>
              )}

              {/* Tab 4: Vocabulary Bank */}
              {activeTab === 'VOCAB' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-500">
                    Các từ vựng C1/C2 và Collocations đặc trưng giúp tăng vọt điểm Lexical Resource:
                  </p>
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {currentData.keyVocabulary.map((v, i) => (
                      <div key={i} className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-extrabold text-xs text-amber-950">{v.word}</span>
                            <span className="text-[11px] text-amber-800/80 font-mono">{v.ipa}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                            Band 8.0+
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">💡 Nghĩa: {v.meaning}</p>
                        <p className="text-[11px] text-slate-500 italic font-serif">"{v.example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Official Band Descriptors (Public Version) */}
              {activeTab === 'CRITERIA' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                    <div>
                      <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        Tiêu Chí Chấm Điểm IELTS Speaking (Band Descriptors)
                      </span>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Bản chuẩn chính thức do Cambridge, British Council và IDP ban hành (Public Version)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRubricModal(true)}
                      className="text-[11px] font-bold text-indigo-900 bg-white px-3 py-1 rounded-lg border border-indigo-300 transition cursor-pointer shadow-2xs hover:bg-indigo-50 shrink-0"
                    >
                      Xem Toàn Màn Hình ➔
                    </button>
                  </div>

                  {/* Filter Band Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] text-slate-500 font-bold shrink-0">Lọc theo Band:</span>
                    {(['ALL', 9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map((b) => (
                      <button
                        key={String(b)}
                        type="button"
                        onClick={() => setRubricFilterBand(b)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                          rubricFilterBand === b
                            ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {b === 'ALL' ? 'Tất Cả' : `Band ${b}`}
                      </button>
                    ))}
                  </div>

                  {/* List of Descriptors */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {IELTS_SPEAKING_BAND_DESCRIPTORS
                      .filter((row) => rubricFilterBand === 'ALL' || row.band === rubricFilterBand)
                      .map((row) => (
                        <div key={row.band} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              row.band >= 8
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : row.band >= 6.5
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : row.band >= 5
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            Band {row.band}.0
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            4 Tiêu Chí Đánh Giá
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* FC */}
                          <div className="p-2 bg-white rounded-xl border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-[11px] text-blue-900 block">
                              1. Fluency & Coherence (Độ Trôi Chảy)
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 leading-relaxed">
                              {row.fluencyAndCoherence.map((item, idx) => (
                                <li key={idx} className="leading-snug">{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* LR */}
                          <div className="p-2 bg-white rounded-xl border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-[11px] text-amber-900 block">
                              2. Lexical Resource (Vốn Từ Vựng)
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 leading-relaxed">
                              {row.lexicalResource.map((item, idx) => (
                                <li key={idx} className="leading-snug">{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* GRA */}
                          <div className="p-2 bg-white rounded-xl border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-[11px] text-purple-900 block">
                              3. Grammatical Range & Accuracy (Ngữ Pháp)
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 leading-relaxed">
                              {row.grammaticalRange.map((item, idx) => (
                                <li key={idx} className="leading-snug">{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* PR */}
                          <div className="p-2 bg-white rounded-xl border border-slate-200/80 space-y-1">
                            <span className="font-extrabold text-[11px] text-emerald-900 block">
                              4. Pronunciation (Phát Âm & Ngữ Điệu)
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 leading-relaxed">
                              {row.pronunciation.map((item, idx) => (
                                <li key={idx} className="leading-snug">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Audio Recording & Speech Panel */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  Ghi Âm Bài Nói ({selectedPart.replace('_', ' ')}):
                </label>
                {selectedPart === 'PART_2' && isTalkActive && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300 animate-pulse">
                    Thời gian nói còn lại: {Math.floor(talkTimeLeft / 60)}:{(talkTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartPracticeRecording}
                      className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition cursor-pointer hover:scale-105"
                      title="Bắt đầu ghi âm"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopPracticeRecording}
                      className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition cursor-pointer animate-pulse"
                      title="Dừng ghi âm"
                    >
                      <Square className="w-6 h-6" />
                    </button>
                  )}
                </div>

                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">
                    {isRecording ? '🔴 Đang ghi âm bài nói... Hãy nói to, rõ ràng và tự nhiên!' : 'Nhấp biểu tượng Micro để bắt đầu ghi âm'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Hệ thống hỗ trợ cả thu âm giọng nói trực tiếp lẫn gõ/dán bài transcript bên dưới.
                  </p>
                </div>

                {currentAudioUrl && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-[11px] text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã ghi âm thành công! Sẵn sàng chấm điểm.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPartAudioUrls(prev => ({ ...prev, [selectedPart]: null }));
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-800 underline cursor-pointer font-bold"
                        title="Xóa bản thu để thu âm lại hoặc chuyển sang nhập văn bản thủ công"
                      >
                        Xóa bản thu âm
                      </button>
                    </div>
                    <audio controls src={currentAudioUrl} className="w-full max-w-md mx-auto h-9" />
                  </div>
                )}
              </div>

              {/* Transcript Input with Locked Status for Audio Recordings */}
              {(() => {
                const isTranscriptLocked = Boolean(currentAudioUrl || isRecording);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        {isTranscriptLocked && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>Nội Dung Bài Nói ({selectedPart.replace('_', ' ')}):</span>
                        {isTranscriptLocked && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            Khóa chỉnh sửa (Audio)
                          </span>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        {!isTranscriptLocked && (
                          <button
                            type="button"
                            onClick={() => handleLoadSampleToTranscript(9)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Dán mẫu Band 9.0
                          </button>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {currentTranscript.trim() ? currentTranscript.trim().split(/\s+/).filter(Boolean).length : 0} từ
                        </span>
                      </div>
                    </div>

                    {isTranscriptLocked && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] font-medium leading-relaxed">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          <strong>Đã khóa:</strong> Ô nội dung được trích xuất trực tiếp từ bài nói của bạn. Không cho phép sửa thủ công để đảm bảo tính khách quan và chính xác khi giám khảo AI chấm điểm. Nếu muốn nói lại, vui lòng bấm <em>"Xóa bản thu âm"</em> ở trên.
                        </span>
                      </div>
                    )}

                    <textarea
                      rows={5}
                      value={currentTranscript}
                      readOnly={isTranscriptLocked}
                      onChange={(e) => {
                        if (!isTranscriptLocked) {
                          setPartTranscripts(prev => ({ ...prev, [selectedPart]: e.target.value }));
                        }
                      }}
                      placeholder={
                        isTranscriptLocked 
                          ? "Nội dung đang được trích xuất tự động từ bài thu âm của bạn..." 
                          : `Gõ hoặc nói vào micro để tự động nhận diện transcript Speaking (${selectedPart})...`
                      }
                      className={`w-full rounded-2xl p-3.5 text-xs font-mono leading-relaxed transition shadow-inner ${
                        isTranscriptLocked
                          ? 'bg-slate-100/90 border border-slate-300 text-slate-800 cursor-not-allowed select-text focus:outline-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                );
              })()}

              {/* Action Buttons based on Mode */}
              {examMode === 'PRACTICE' ? (
                <button
                  type="button"
                  onClick={handleGradeSinglePart}
                  disabled={isGrading || (!currentTranscript.trim() && !currentAudioUrl)}
                  className="w-full py-3.5 rounded-2xl btn-glossy-emerald font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>
                    {isGrading 
                      ? 'Giám khảo AI đang chấm điểm...' 
                      : `Chấm Điểm Riêng ${selectedPart.replace('_', ' ')} (${currentData.topic || currentData.cueCard?.topic})`}
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedPart !== 'PART_3' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPart(selectedPart === 'PART_1' ? 'PART_2' : 'PART_3');
                        setActiveTab('QUESTIONS');
                      }}
                      className="py-3 rounded-xl btn-glossy-dark text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Lưu & Chuyển Sang {selectedPart === 'PART_1' ? 'Part 2 (Cue Card)' : 'Part 3 (Art)'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã hoàn thành Part cuối cùng (Part 3)</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGradeFullSimulation}
                    disabled={isGrading || (
                      !partTranscripts.PART_1?.trim() && !partAudioUrls.PART_1 &&
                      !partTranscripts.PART_2?.trim() && !partAudioUrls.PART_2 &&
                      !partTranscripts.PART_3?.trim() && !partAudioUrls.PART_3
                    )}
                    className="py-3 rounded-xl btn-glossy-emerald font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Award className="w-4 h-4 text-white" />
                    <span>{isGrading ? 'Giám khảo đang chấm toàn bài 3 Part...' : 'Nộp Toàn Bài Thi Speaking (3 Part)'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: AI Feedback, Band Scores, Error Breakdown & Upgrades */}
        <div className="lg:col-span-5 space-y-6">
          {gradingResult ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
              {/* Overall Band Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                  Official IELTS Speaking Assessment Report
                </span>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl font-black">
                    Band {gradingResult.overall_band?.toFixed(1)} <span className="text-sm font-normal text-emerald-100">/ 9.0</span>
                  </h2>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold text-white">
                    {examMode === 'SIMULATION' ? 'Full 3-Part Exam' : selectedPart.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed pt-1 font-medium">
                  {gradingResult.general_feedback}
                </p>
              </div>

              {/* 4 Official Criteria Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Điểm 4 Tiêu Chí Chuẩn IELTS Band Descriptors:
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRubricModal(true)}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Xem Thang Điểm</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {gradingResult.criteria?.map((crit: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 hover:border-indigo-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate" title={crit.name}>{crit.name}</span>
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                          crit.score >= 8
                            ? 'bg-emerald-100 text-emerald-800'
                            : crit.score >= 6.5
                            ? 'bg-teal-100 text-teal-800'
                            : crit.score >= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {crit.score?.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{crit.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pronunciation & Phonetic Corrections */}
              {gradingResult.errors && gradingResult.errors.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Sửa Lỗi Phát Âm & Trọng Âm (Pronunciation Errors):
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                        <p className="text-slate-800 font-medium">
                          Lỗi: <span className="line-through text-rose-600 font-bold">{err.original_text}</span> → <strong className="text-emerald-800 font-extrabold">{err.corrected_text}</strong>
                        </p>
                        <p className="text-slate-600 text-[11px]">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Suggestions & Upgrades */}
              {gradingResult.suggestions && gradingResult.suggestions.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Nâng Cấp Câu Lên Band 8.5 - 9.0 (Upgrades):
                  </h3>
                  <div className="space-y-2">
                    {gradingResult.suggestions.map((sug: any, idx: number) => (
                      <div key={idx} className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900">
                          <span>Mục tiêu Band {sug.target_band || '8.5+'}</span>
                        </div>
                        <p className="text-slate-800 font-medium">
                          Câu gốc: <span className="text-slate-600 italic">"{sug.original_phrase}"</span>
                        </p>
                        <p className="text-emerald-950 font-bold">
                          ➔ Nâng cấp: "{sug.suggested_phrase}"
                        </p>
                        <p className="text-slate-600 text-[11px]">{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save & Reset buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGradingResult(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Luyện Tập Tiếp
                </button>
                {onExit && (
                  <button
                    type="button"
                    onClick={onExit}
                    className="flex-1 py-2.5 rounded-xl btn-glossy-emerald text-white font-extrabold text-xs transition cursor-pointer text-center"
                  >
                    Về Kho Đề Thi
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Mic className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Chưa Có Kết Quả Chấm</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Hãy ghi âm bài nói hoặc dán transcript câu trả lời của bạn ở khung bên trái, sau đó nhấn <strong>"Chấm Điểm Với AI"</strong>.
                </p>
              </div>

              {/* Quick action: Load Band 9.0 and Grade */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleLoadSampleToTranscript(9);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dán Thử Bài Mẫu Band 9.0</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* FULL OFFICIAL IELTS SPEAKING BAND DESCRIPTORS MODAL */}
      {showRubricModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    IELTS Speaking Band Descriptors (Public Version)
                    <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                      Cambridge / British Council / IDP
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Bảng tiêu chí đánh giá chính thức gồm 4 kỹ năng: FC, LR, GRA, PR từ Band 1.0 đến Band 9.0
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRubricModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-600 font-bold">Lọc theo Band:</span>
                {(['ALL', 9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map((b) => (
                  <button
                    key={String(b)}
                    type="button"
                    onClick={() => setRubricFilterBand(b)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      rubricFilterBand === b
                        ? 'bg-slate-900 text-white font-extrabold shadow-sm'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {b === 'ALL' ? 'Tất Cả (Band 1-9)' : `Band ${b}.0`}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Matrix Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4">
                {IELTS_SPEAKING_BAND_DESCRIPTORS
                  .filter((row) => rubricFilterBand === 'ALL' || row.band === rubricFilterBand)
                  .map((row) => (
                    <div
                      key={row.band}
                      className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition"
                    >
                      {/* Band Header */}
                      <div className={`px-4 py-2.5 font-black text-xs flex items-center justify-between ${
                        row.band >= 8
                          ? 'bg-emerald-600 text-white'
                          : row.band >= 7
                          ? 'bg-teal-700 text-white'
                          : row.band >= 6
                          ? 'bg-blue-700 text-white'
                          : row.band >= 5
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-700 text-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Band {row.band}.0</span>
                          <span className="text-[11px] font-normal opacity-90">
                            {row.band === 9 ? 'Expert User (Thành thạo tuyệt đối)' :
                             row.band === 8 ? 'Very Good User (Rất tốt)' :
                             row.band === 7 ? 'Good User (Tốt)' :
                             row.band === 6 ? 'Competent User (Khá/Đạt yêu cầu)' :
                             row.band === 5 ? 'Modest User (Trung bình)' :
                             row.band === 4 ? 'Limited User (Hạn chế)' :
                             row.band === 3 ? 'Extremely Limited' :
                             row.band === 2 ? 'Intermittent' : 'Non-User'}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          Official Standard
                        </span>
                      </div>

                      {/* 4 Columns in Desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
                        {/* 1. FC */}
                        <div className="p-3.5 space-y-2 bg-blue-50/20">
                          <div className="flex items-center gap-1 text-blue-900 font-black text-[11px]">
                            <span>Fluency & Coherence</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1 leading-relaxed">
                            {row.fluencyAndCoherence.map((item, idx) => (
                              <li key={idx} className="leading-snug">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. LR */}
                        <div className="p-3.5 space-y-2 bg-amber-50/20">
                          <div className="flex items-center gap-1 text-amber-900 font-black text-[11px]">
                            <span>Lexical Resource</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1 leading-relaxed">
                            {row.lexicalResource.map((item, idx) => (
                              <li key={idx} className="leading-snug">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. GRA */}
                        <div className="p-3.5 space-y-2 bg-purple-50/20">
                          <div className="flex items-center gap-1 text-purple-900 font-black text-[11px]">
                            <span>Grammatical Range & Accuracy</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1 leading-relaxed">
                            {row.grammaticalRange.map((item, idx) => (
                              <li key={idx} className="leading-snug">{item}</li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. PR */}
                        <div className="p-3.5 space-y-2 bg-emerald-50/20">
                          <div className="flex items-center gap-1 text-emerald-900 font-black text-[11px]">
                            <span>Pronunciation</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1 leading-relaxed">
                            {row.pronunciation.map((item, idx) => (
                              <li key={idx} className="leading-snug">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 italic">
                AI Giám khảo áp dụng trực tiếp rubric này khi phân tích giọng nói và transcript bài thi của bạn.
              </span>
              <button
                type="button"
                onClick={() => setShowRubricModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
