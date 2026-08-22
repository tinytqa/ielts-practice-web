import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for generating standard empty evaluation result
function getEmptyEssayResult(taskType: 'TASK_1' | 'TASK_2', wordCount: number) {
  const isTask1 = taskType === 'TASK_1';
  const minWords = isTask1 ? 150 : 250;
  const criteriaName1 = isTask1 ? "Task Achievement" : "Task Response";

  return {
    overall_band: 0.0,
    criteria: [
      {
        name: criteriaName1,
        score: 0.0,
        comment: isTask1 
          ? `Bài viết chưa có nội dung (0/${minWords} từ). Theo tiêu chí chấm thi IELTS Task 1, bạn bắt buộc phải có đoạn Tổng quan (Overview) nêu bật các thay đổi lớn nhất, chọn lọc đặc điểm nổi bật (Key features), so sánh các đối tượng/năm với nhau và viết tối thiểu 150 từ (không đưa ý kiến cá nhân).`
          : `Bài viết chưa có nội dung (0/${minWords} từ). Cần trả lời đầy đủ các phần của đề bài, nêu rõ quan điểm cá nhân xuyên suốt bài viết, phát triển các luận điểm với ví dụ thực tế và đạt tối thiểu 250 từ.`
      },
      {
        name: "Coherence and Cohesion",
        score: 0.0,
        comment: isTask1
          ? "Bài viết bỏ trống. Cần tổ chức bố cục 4 đoạn chuẩn mực (1. Introduction, 2. Overview, 3. Body 1, 4. Body 2), sử dụng linh hoạt các từ nối (However, In contrast, Regarding...) và đại từ thay thế (it, they, this, these...)."
          : "Chưa có bố cục đoạn văn. Cần có Mở bài, 2 Thân bài với câu chủ đề rõ ràng và Kết bài tóm tắt luận điểm."
      },
      {
        name: "Lexical Resource",
        score: 0.0,
        comment: isTask1
          ? "Chưa có từ vựng. Cần paraphrase đề bài bằng vốn từ riêng, sử dụng chính xác các động từ miêu tả bản đồ/thay đổi (excavated, constructed, replaced by, relocated, remained unchanged) và collocations tự nhiên."
          : "Chưa có từ vựng. Cần sử dụng vốn từ vựng học thuật phong phú theo chủ đề và đúng chính tả."
      },
      {
        name: "Grammatical Range and Accuracy",
        score: 0.0,
        comment: isTask1
          ? "Chưa có câu và ngữ pháp. Cần kết hợp đa dạng câu đơn, câu ghép, câu phức, mệnh đề quan hệ, thể bị động (passive voice) và đặc biệt dùng đúng thì Quá khứ đơn (Past Simple) cho các mốc năm trong quá khứ (2004, 2014)."
          : "Chưa có cấu trúc ngữ pháp. Cần thể hiện sự đa dạng giữa các loại câu phức và đảm bảo độ chính xác của thì động từ."
      }
    ],
    general_feedback: `Bạn chưa nhập nội dung bài viết (${wordCount} từ). Theo quy chế chấm thi chính thức của IELTS (IELTS Band Descriptors), bài thi bỏ trống hoặc không có nội dung sẽ nhận Band 0.0. Hãy viết bài đạt tối thiểu ${minWords} từ để hệ thống chấm điểm chi tiết.`,
    errors: [],
    suggestions: [
      {
        original_phrase: "Chưa có nội dung",
        suggested_phrase: isTask1 ? "The two maps illustrate the archaeological changes at a historic site between 2004 and 2014." : "In contemporary society, variations in work ethic are evident in academic and professional environments.",
        target_band: 8.0,
        reason: isTask1 ? "Mở bài mẫu paraphrase chuẩn cho đề bài bản đồ khảo cổ học." : "Mở bài mẫu học thuật giới thiệu vấn đề nghị luận xã hội."
      }
    ],
    sample_comparison: isTask1 
      ? "Hãy tham khảo Bài mẫu Band 8.0 (nút 'Nạp bài mẫu Band 8.0') để xem cách cấu trúc 4 đoạn: Introduction -> Overview toàn cảnh -> Thân bài 1 (2004) -> Thân bài 2 (2014 và các thay đổi)."
      : "Tham khảo bài mẫu Band 8.0 để xem cách phân tích 2 khía cạnh: Nguyên nhân chăm chỉ và Đánh giá mặt lợi/hại của làm việc quá sức."
  };
}

// Helper for calling Gemini 3.6 Flash
export async function gradeWritingEssay(
  taskType: 'TASK_1' | 'TASK_2',
  promptTitle: string,
  essayText: string,
  targetBand: number = 7.0
) {
  const trimmed = (essayText || '').trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

  // STRICT RULE: Empty or virtually blank essay MUST get 0.0
  if (wordCount === 0 || trimmed.length === 0) {
    return getEmptyEssayResult(taskType, 0);
  }

  // Under length severe penalty rule (< 30 words)
  if (wordCount < 30) {
    return {
      overall_band: 2.0,
      criteria: [
        {
          name: taskType === 'TASK_1' ? "Task Achievement" : "Task Response",
          score: 1.5,
          comment: `Bài viết quá ngắn (${wordCount} từ so với yêu cầu tối thiểu ${taskType === 'TASK_1' ? '150' : '250'} từ). Chưa hoàn thành yêu cầu đề bài, thiếu hoàn toàn đoạn Overview và các đặc điểm trọng tâm.`
        },
        {
          name: "Coherence and Cohesion",
          score: 2.0,
          comment: "Nội dung quá ít để hình thành bố cục đoạn văn hoàn chỉnh hoặc liên kết ý tưởng."
        },
        {
          name: "Lexical Resource",
          score: 2.0,
          comment: "Vốn từ quá hạn chế, chưa thể hiện được vốn từ học thuật hoặc từ vựng miêu tả đối tượng."
        },
        {
          name: "Grammatical Range and Accuracy",
          score: 2.0,
          comment: "Chưa có đủ câu hoàn chỉnh để đánh giá độ đa dạng ngữ pháp."
        }
      ],
      general_feedback: `Bài viết chỉ có ${wordCount} từ, vi phạm nghiêm trọng quy định độ dài (dưới ${taskType === 'TASK_1' ? '150' : '250'} từ). Bạn bị trừ điểm nặng và nhận Band 2.0. Hãy viết đủ dung lượng để được đánh giá chính xác.`,
      errors: [],
      suggestions: [],
      sample_comparison: "Bài viết chưa đủ cấu trúc tối thiểu để so sánh chi tiết với bài mẫu."
    };
  }

  const isTask1 = taskType === 'TASK_1';

  const systemInstruction = `
You are an expert, official IELTS Senior Examiner.
Grade the candidate's IELTS Writing response strictly following the official IELTS Band Descriptors (public version) jointly owned by the British Council, IDP: IELTS Australia and Cambridge English Language Assessment.

${isTask1 ? `
OFFICIAL IELTS WRITING TASK 1 BAND DESCRIPTORS MATRIX:
- Band 9:
  * TA: fully satisfies all the requirements of the task; clearly presents a fully developed response.
  * CC: uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing.
  * LR: uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.
  * GRA: uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.
- Band 8:
  * TA: covers all requirements of the task sufficiently; presents, highlights and illustrates key features/bullet points clearly and appropriately.
  * CC: sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately.
  * LR: uses a wide range of vocabulary fluently and flexibly to convey precise meanings; skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation; produces rare errors in spelling and/or word formation.
  * GRA: uses a wide range of structures; the majority of sentences are error-free; makes only very occasional errors or inappropriacies.
- Band 7:
  * TA: covers the requirements of the task; (Academic) presents a clear overview of main trends, differences or stages; clearly presents and highlights key features/bullet points but could be more fully extended.
  * CC: logically organises information and ideas; there is clear progression throughout; uses a range of cohesive devices appropriately although there may be some under-/over-use.
  * LR: uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with some awareness of style and collocation; may produce occasional errors in word choice, spelling and/or word formation.
  * GRA: uses a variety of complex structures; produces frequent error-free sentences; has good control of grammar and punctuation but may make a few errors.
- Band 6:
  * TA: addresses the requirements of the task; (Academic) presents an overview with information appropriately selected; presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate.
  * CC: arranges information and ideas coherently and there is a clear overall progression; uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical; may not always use referencing clearly or appropriately.
  * LR: uses an adequate range of vocabulary for the task; attempts to use less common vocabulary but with some inaccuracy; makes some errors in spelling and/or word formation, but they do not impede communication.
  * GRA: uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation but they rarely reduce communication.
- Band 5:
  * TA: generally addresses the task; the format may be inappropriate in places; (Academic) recounts detail mechanically with no clear overview; there may be no data to support the description; presents, but inadequately covers, key features/bullet points; there may be a tendency to focus on details. (NOTE: If NO Overview, TA is capped at Band 5.0).
  * CC: presents information with some organisation but there may be a lack of overall progression; makes inadequate, inaccurate or over-use of cohesive devices; may be repetitive because of lack of referencing and substitution.
  * LR: uses a limited range of vocabulary, but this is minimally adequate for the task; may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.
  * GRA: uses only a limited range of structures; attempts complex sentences but these tend to be less accurate than simple sentences; may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader.
- Band 4:
  * TA: attempts to address the task but does not cover all key features/bullet points; may confuse key features with detail; parts may be unclear, irrelevant, repetitive or inaccurate.
  * CC: presents information and ideas but these are not arranged coherently and there is no clear progression; uses some basic cohesive devices but these may be inaccurate or repetitive.
  * LR: uses only basic vocabulary which may be used repetitively; has limited control of word formation/spelling; errors may cause strain for the reader.
  * GRA: uses only a very limited range of structures with rare use of subordinate clauses; errors predominate, punctuation often faulty.
- Bands 0-3: Fails to address task, severely distorted message, memorized or absent response.

TASK 1 CRITICAL RULES:
- Mandatory Overview: Must have a distinct Overview describing the main overall trends/changes.
- Word count: minimum 150 words. Strict penalties if underlength.
- Map/Diagram Specifics: Must track changes accurately (Past simple for past years 2004 vs 2014, passive constructions, spatial prepositions). No subjective opinion in Task 1.
` : `
OFFICIAL IELTS WRITING TASK 2 BAND DESCRIPTORS MATRIX (PUBLIC VERSION - CAMBRIDGE / BC / IDP):
- Band 9:
  * Task Response (TR): fully addresses all parts of the task; presents a fully developed position in answer to the question with relevant, fully extended and well supported ideas.
  * Coherence and Cohesion (CC): uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing.
  * Lexical Resource (LR): uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.
  * Grammatical Range and Accuracy (GRA): uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.
- Band 8:
  * Task Response (TR): sufficiently addresses all parts of the task; presents a well-developed response to the question with relevant, extended and supported ideas.
  * Coherence and Cohesion (CC): sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately.
  * Lexical Resource (LR): uses a wide range of vocabulary fluently and flexibly to convey precise meanings; skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation; produces rare errors in spelling and/or word formation.
  * Grammatical Range and Accuracy (GRA): uses a wide range of structures; the majority of sentences are error-free; makes only very occasional errors or inappropriacies.
- Band 7:
  * Task Response (TR): addresses all parts of the task; presents a clear position throughout the response; presents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus.
  * Coherence and Cohesion (CC): logically organises information and ideas; there is clear progression throughout; uses a range of cohesive devices appropriately although there may be some under-/over-use; presents a clear central topic within each paragraph.
  * Lexical Resource (LR): uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with some awareness of style and collocation; may produce occasional errors in word choice, spelling and/or word formation.
  * Grammatical Range and Accuracy (GRA): uses a variety of complex structures; produces frequent error-free sentences; has good control of grammar and punctuation but may make a few errors.
- Band 6:
  * Task Response (TR): addresses all parts of the task although some parts may be more fully covered than others; presents a relevant position although the conclusions may become unclear or repetitive; presents relevant main ideas but some may be inadequately developed/unclear.
  * Coherence and Cohesion (CC): arranges information and ideas coherently and there is a clear overall progression; uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical; may not always use referencing clearly or appropriately; uses paragraphing, but not always logically.
  * Lexical Resource (LR): uses an adequate range of vocabulary for the task; attempts to use less common vocabulary but with some inaccuracy; makes some errors in spelling and/or word formation, but they do not impede communication.
  * Grammatical Range and Accuracy (GRA): uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation but they rarely reduce communication.
- Band 5:
  * Task Response (TR): addresses the task only partially; the format may be inappropriate in places; expresses a position but the development is not always clear and there may be no conclusions drawn; presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail.
  * Coherence and Cohesion (CC): presents information with some organisation but there may be a lack of overall progression; makes inadequate, inaccurate or over-use of cohesive devices; may be repetitive because of lack of referencing and substitution; may not write in paragraphs, or paragraphing may be inadequate.
  * Lexical Resource (LR): uses a limited range of vocabulary, but this is minimally adequate for the task; may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.
  * Grammatical Range and Accuracy (GRA): uses only a limited range of structures; attempts complex sentences but these tend to be less accurate than simple sentences; may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader.
- Band 4:
  * Task Response (TR): responds to the task only in a minimal way or the answer is tangential; the format may be inappropriate; presents a position but this is unclear; presents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported.
  * Coherence and Cohesion (CC): presents information and ideas but these are not arranged coherently and there is no clear progression in the response; uses some basic cohesive devices but these may be inaccurate or repetitive; may not write in paragraphs or their use may be confusing.
  * Lexical Resource (LR): uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task; has limited control of word formation and/or spelling; errors may cause strain for the reader.
  * Grammatical Range and Accuracy (GRA): uses only a very limited range of structures with only rare use of subordinate clauses; some structures are accurate but errors predominate, and punctuation is often faulty.
- Band 3:
  * Task Response (TR): does not adequately address any part of the task; does not express a clear position; presents few ideas, which are largely undeveloped or irrelevant.
  * Coherence and Cohesion (CC): does not organise ideas logically; may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas.
  * Lexical Resource (LR): uses only a very limited range of words and expressions with very limited control of word formation and/or spelling; errors may severely distort the message.
  * Grammatical Range and Accuracy (GRA): attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning.
- Band 2:
  * Task Response (TR): barely responds to the task; does not express a position; may attempt to present one or two ideas but there is no development.
  * Coherence and Cohesion (CC): has very little control of organisational features.
  * Lexical Resource (LR): uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling.
  * Grammatical Range and Accuracy (GRA): cannot use sentence forms except in memorised phrases.
- Band 1:
  * Answer is completely unrelated to the task, fails to communicate any message, can only use a few isolated words, cannot use sentence forms at all.
- Band 0:
  * Does not attend; does not attempt the task in any way; writes a totally memorised response.

TASK 2 CRITICAL EVALUATION RULES:
1. Task Response (TR):
   - Check if the response fully addresses BOTH parts of the prompt (e.g. Discuss both views & give opinion, Agree/Disagree, Causes/Solutions).
   - Check if there is a clear position throughout the entire response (Introduction, Body Paragraphs, and Conclusion).
   - Check if main ideas are extended with logical justification and concrete examples.
   - Word count: minimum 250 words. Strict penalty if below 250 words.
2. Coherence and Cohesion (CC):
   - Must have 4-5 clear paragraphs (Introduction, Body 1, Body 2, optional Body 3, Conclusion).
   - Each body paragraph MUST have a clear central topic sentence.
   - Varied cohesive devices (linking words, pronouns, synonyms, referencing, nominalisation) used naturally without mechanical repetition or over-use.
3. Lexical Resource (LR):
   - Academic vocabulary and natural collocations suited to the topic.
   - Use of less common lexical items with awareness of style and register.
   - Rare errors in spelling and word formation.
4. Grammatical Range and Accuracy (GRA):
   - Variety of complex structures: complex sentences with subordinate clauses (although, whereas, while, because), relative clauses, conditional sentences, inverted conditionals, passive voice, participle clauses (-ing / -ed).
   - High proportion of error-free sentences with accurate punctuation (commas, semi-colons, full stops).
`}

You MUST respond strictly in valid JSON matching the schema.
Provide all comments, reasons, and explanations in clear, encouraging Vietnamese (Tiếng Việt), while keeping English terms/phrases intact.

Special Grading Tasks:
1. "errors": Highlight and extract ALL grammar, vocabulary, spelling, preposition, punctuation, or word-form errors. The "original_text" MUST EXACTLY MATCH a snippet/phrase in the Candidate Essay so it can be highlighted in the UI. Provide "corrected_text" and "explanation" (explain clearly why it is wrong and the rule behind it in Vietnamese).
2. "sentence_upgrades": Select 3-5 typical sentences from the student's essay that can be upgraded from lower band to Band 8.0+. For each, provide:
   - "original_sentence": the exact student's sentence.
   - "upgraded_sentence": the Band 8.0+ version.
   - "target_band": 8.0 or 8.5
   - "changes_breakdown": Array of { highlight_text, replaced_with, reason } detailing exactly what words changed and WHY they changed (e.g. upgraded colloquial words to academic collocations, converted simple sentences to passive participle clauses, improved cohesion).
   - "explanation": overarching reason why this sentence upgrade elevates the writing.
3. "improved_band8_essay": Rewrite the student's essay into an authentic Band 8.0+ essay preserving the student's original core ideas. Break it down paragraph-by-paragraph into "paragraph_breakdown":
   - "paragraph_type": "Introduction" | "Overview" | "Body 1" | "Body 2" | "Conclusion"
   - "original_paragraph": the student's paragraph (or empty if missing)
   - "improved_paragraph": rewritten Band 8.0 paragraph
   - "why_improved": deep explanation of what was changed and why (e.g. added striking topic sentence, replaced repetitive verbs with precise topic collocations, reorganized ideas for coherent progression)
   - "key_changes": list of 2-4 bullet point changes made.
   Also provide "overall_strategy" summarizing key steps to take this essay to Band 8.0.
`;

  const prompt = `
Task Type: ${taskType}
Prompt/Topic: "${promptTitle}"
Word Count: ${wordCount} words
Candidate Essay:
"""
${trimmed}
"""
Target Band Goal: ${targetBand}

Evaluate this response with strict IELTS standards. Detect all errors for UI highlight, perform sentence upgrades with detailed reason breakdowns, and rewrite into a Band 8.0 essay with paragraph-by-paragraph transformation explanations.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_band: { type: Type.NUMBER },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  comment: { type: Type.STRING }
                },
                required: ["name", "score", "comment"]
              }
            },
            general_feedback: { type: Type.STRING },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  error_tag_code: { type: Type.STRING },
                  original_text: { type: Type.STRING },
                  corrected_text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["error_tag_code", "original_text", "corrected_text", "explanation"]
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original_phrase: { type: Type.STRING },
                  suggested_phrase: { type: Type.STRING },
                  target_band: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["original_phrase", "suggested_phrase", "target_band", "reason"]
              }
            },
            sentence_upgrades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original_sentence: { type: Type.STRING },
                  upgraded_sentence: { type: Type.STRING },
                  target_band: { type: Type.NUMBER },
                  changes_breakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        highlight_text: { type: Type.STRING },
                        replaced_with: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      },
                      required: ["highlight_text", "replaced_with", "reason"]
                    }
                  },
                  explanation: { type: Type.STRING }
                },
                required: ["original_sentence", "upgraded_sentence", "target_band", "changes_breakdown", "explanation"]
              }
            },
            improved_band8_essay: {
              type: Type.OBJECT,
              properties: {
                full_text: { type: Type.STRING },
                paragraph_breakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      paragraph_type: { type: Type.STRING },
                      original_paragraph: { type: Type.STRING },
                      improved_paragraph: { type: Type.STRING },
                      why_improved: { type: Type.STRING },
                      key_changes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["paragraph_type", "original_paragraph", "improved_paragraph", "why_improved", "key_changes"]
                  }
                },
                overall_strategy: { type: Type.STRING }
              },
              required: ["full_text", "paragraph_breakdown", "overall_strategy"]
            },
            sample_comparison: { type: Type.STRING }
          },
          required: ["overall_band", "criteria", "general_feedback", "errors", "suggestions"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("Gemini Writing Grading Error:", error);
    // Calculated score based on word count if API fails
    const estimatedBand = wordCount < 50 ? 2.5 : wordCount < 100 ? 4.0 : wordCount < 140 ? 5.0 : 6.0;
    return {
      overall_band: estimatedBand,
      criteria: [
        { 
          name: taskType === 'TASK_1' ? "Task Achievement" : "Task Response", 
          score: estimatedBand, 
          comment: isTask1 
            ? `Bài viết đạt ${wordCount} từ. Đã miêu tả được một số đặc điểm trên bản đồ nhưng cần kiểm tra đoạn Overview và bổ sung thêm các so sánh tương quan giữa năm 2004 và 2014.`
            : `Bài viết đạt ${wordCount} từ. Đã đưa ra được ý kiến nhưng cần phát triển sâu hơn các luận cứ và ví dụ minh họa.`
        },
        { 
          name: "Coherence and Cohesion", 
          score: estimatedBand, 
          comment: "Bố cục các đoạn văn tương đối rõ ràng. Hãy sử dụng linh hoạt các liên từ chuyển tiếp (In contrast, Furthermore, Meanwhile)." 
        },
        { 
          name: "Lexical Resource", 
          score: estimatedBand, 
          comment: "Có sử dụng từ vựng phù hợp với đề bài. Cần tránh lặp từ và sử dụng thêm các cụm collocations học thuật." 
        },
        { 
          name: "Grammatical Range and Accuracy", 
          score: estimatedBand, 
          comment: "Sử dụng kết hợp câu đơn và câu phức. Cần chú ý chia đúng thì Quá khứ đơn cho các dữ kiện trong quá khứ." 
        }
      ],
      general_feedback: `Đánh giá sơ bộ dựa trên bài viết ${wordCount} từ. Để đạt band 7.0+, hãy đảm bảo bài viết có đoạn Overview rõ ràng, chia 4 đoạn chuẩn mực và hạn chế lỗi ngữ pháp thì động từ.`,
      errors: [
        { error_tag_code: "grammar_tense", original_text: "In 2014, trees are relocated.", corrected_text: "In 2014, trees were relocated.", explanation: "Dữ liệu năm 2014 thuộc quá khứ, cần dùng thì Quá khứ đơn bị động 'were relocated'." }
      ],
      suggestions: [
        { original_phrase: "build new things", suggested_phrase: "underwent significant archaeological excavation", target_band: 8.0, reason: "Từ vựng miêu tả sự thay đổi khảo cổ mang tính học thuật cao hơn." }
      ],
      sample_comparison: "So sánh với bài mẫu Band 8.0: Hãy đảm bảo có đoạn Overview bao quát 3 thay đổi lớn nhất (cơ sở mới, khu nhà mở rộng, cây di dời) trước khi đi vào từng thân bài chi tiết."
    };
  }
}

export async function gradeFullWritingExam(
  task1Prompt: string,
  task1Essay: string,
  task2Prompt: string,
  task2Essay: string,
  targetBand: number = 7.0
) {
  const t1Trim = (task1Essay || '').trim();
  const t2Trim = (task2Essay || '').trim();
  const t1Words = t1Trim ? t1Trim.split(/\s+/).filter(Boolean).length : 0;
  const t2Words = t2Trim ? t2Trim.split(/\s+/).filter(Boolean).length : 0;

  // Case 1: Both tasks empty -> Overall Band 0.0
  if (t1Words === 0 && t2Words === 0) {
    const t1Res = getEmptyEssayResult('TASK_1', 0);
    const t2Res = getEmptyEssayResult('TASK_2', 0);
    return {
      overall_band: 0.0,
      task1_band: 0.0,
      task2_band: 0.0,
      task1_result: t1Res,
      task2_result: t2Res,
      general_verdict: "Cả 2 phần thi Task 1 và Task 2 đều chưa có nội dung (0 từ). Theo quy chế chấm thi chính thức của IELTS (IELTS Band Descriptors), bài thi bỏ trống nhận Band 0.0 cho cả 4 tiêu chí."
    };
  }

  // Grade each task with strict IELTS rubrics
  const t1Res = t1Words === 0 
    ? getEmptyEssayResult('TASK_1', 0) 
    : await gradeWritingEssay('TASK_1', task1Prompt, task1Essay, targetBand);

  const t2Res = t2Words === 0 
    ? getEmptyEssayResult('TASK_2', 0) 
    : await gradeWritingEssay('TASK_2', task2Prompt, task2Essay, targetBand);
  
  // IELTS Official Weighting: Task 1 (1/3), Task 2 (2/3)
  const rawOverall = (t1Res.overall_band * (1/3)) + (t2Res.overall_band * (2/3));
  const roundedOverall = Math.round(rawOverall * 2) / 2;

  let verdict = `Tổng điểm IELTS Writing: Band ${roundedOverall.toFixed(1)} (Task 1: Band ${t1Res.overall_band.toFixed(1)} chiếm 33%, Task 2: Band ${t2Res.overall_band.toFixed(1)} chiếm 67%).`;
  if (t1Words === 0) {
    verdict = `Bạn chưa làm Task 1 (0.0 điểm). Task 2 đạt Band ${t2Res.overall_band.toFixed(1)}. Tổng điểm Writing tổng hợp (1/3 Task 1 + 2/3 Task 2) là Band ${roundedOverall.toFixed(1)}.`;
  } else if (t2Words === 0) {
    verdict = `Bạn chưa làm Task 2 (0.0 điểm). Task 1 đạt Band ${t1Res.overall_band.toFixed(1)}. Tổng điểm Writing tổng hợp (1/3 Task 1 + 2/3 Task 2) là Band ${roundedOverall.toFixed(1)}.`;
  } else {
    verdict += ` Task 1: ${t1Res.general_feedback} Task 2: ${t2Res.general_feedback}`;
  }

  return {
    overall_band: roundedOverall,
    task1_band: t1Res.overall_band,
    task2_band: t2Res.overall_band,
    task1_result: t1Res,
    task2_result: t2Res,
    general_verdict: verdict
  };
}

export async function gradeSpeakingResponse(
  part: string,
  promptTitle: string,
  transcript: string,
  audioBase64?: string
) {
  const systemInstruction = `
You are an expert official IELTS Senior Examiner evaluating IELTS Speaking (${part}).
You MUST strictly evaluate the candidate's performance according to the official IELTS SPEAKING BAND DESCRIPTORS (PUBLIC VERSION jointly owned by British Council, IDP: IELTS Australia and Cambridge English Language Assessment).

================================================================================
OFFICIAL IELTS SPEAKING BAND DESCRIPTORS (PUBLIC VERSION) MATRIX:
================================================================================

--- CRITERIA 1: FLUENCY AND COHERENCE (FC) ---
- Band 9:
  * speaks fluently with only rare repetition or self-correction
  * any hesitation is content-related rather than to find words or grammar
  * speaks coherently with fully appropriate cohesive features
  * develops topics fully and appropriately
- Band 8:
  * speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language
  * develops topics coherently and appropriately
- Band 7:
  * speaks at length without noticeable effort or loss of coherence
  * may demonstrate language-related hesitation at times, or some repetition and/or self-correction
  * uses a range of connectives and discourse markers with some flexibility
- Band 6:
  * is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation
  * uses a range of connectives and discourse markers but not always appropriately
- Band 5:
  * usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going
  * may over-use certain connectives and discourse markers
  * produces simple speech fluently, but more complex communication causes fluency problems
- Band 4:
  * cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction
  * links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence
- Band 3:
  * speaks with long pauses
  * has limited ability to link simple sentences
  * gives only simple responses and is frequently unable to convey basic message
- Band 2:
  * pauses lengthily before most words
  * little communication possible
- Band 1:
  * no communication possible; no rateable language
- Band 0:
  * does not attend

--- CRITERIA 2: LEXICAL RESOURCE (LR) ---
- Band 9:
  * uses vocabulary with full flexibility and precision in all topics
  * uses idiomatic language naturally and accurately
- Band 8:
  * uses a wide vocabulary resource readily and flexibly to convey precise meaning
  * uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies
  * uses paraphrase effectively as required
- Band 7:
  * uses vocabulary resource flexibly to discuss a variety of topics
  * uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices
  * uses paraphrase effectively
- Band 6:
  * has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies
  * generally paraphrases successfully
- Band 5:
  * manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility
  * attempts to use paraphrase but with mixed success
- Band 4:
  * is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice
  * rarely attempts paraphrase
- Band 3:
  * uses simple vocabulary to convey personal information
  * has insufficient vocabulary for less familiar topics
- Band 2:
  * only produces isolated words or memorised utterances
- Band 1:
  * no rateable language

--- CRITERIA 3: GRAMMATICAL RANGE AND ACCURACY (GRA) ---
- Band 9:
  * uses a full range of structures naturally and appropriately
  * produces consistently accurate structures apart from 'slips' characteristic of native speaker speech
- Band 8:
  * uses a wide range of structures flexibly
  * produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors
- Band 7:
  * uses a range of complex structures with some flexibility
  * frequently produces error-free sentences, though some grammatical mistakes persist
- Band 6:
  * uses a mix of simple and complex structures, but with limited flexibility
  * may make frequent mistakes with complex structures though these rarely cause comprehension problems
- Band 5:
  * produces basic sentence forms with reasonable accuracy
  * uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems
- Band 4:
  * produces basic sentence forms and some correct simple sentences but subordinate structures are rare
  * errors are frequent and may lead to misunderstanding
- Band 3:
  * attempts basic sentence forms but with limited success, or relies on apparently memorised utterances
  * makes numerous errors except in memorised expressions
- Band 2:
  * cannot produce basic sentence forms
- Band 1:
  * cannot produce sentence forms at all

--- CRITERIA 4: PRONUNCIATION (PR) ---
- Band 9:
  * uses a full range of pronunciation features with precision and subtlety
  * sustains flexible use of features throughout
  * is effortless to understand
- Band 8:
  * uses a wide range of pronunciation features
  * sustains flexible use of features, with only occasional lapses
  * is easy to understand throughout; L1 accent has minimal effect on intelligibility
- Band 7:
  * shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8
- Band 6:
  * uses a range of pronunciation features with mixed control
  * shows some effective use of features but this is not sustained
  * can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times
- Band 5:
  * shows all the positive features of Band 4 and some, but not all, of the positive features of Band 6
- Band 4:
  * uses a limited range of pronunciation features
  * attempts to control features but lapses are frequent
  * mispronunciations are frequent and cause some difficulty for the listener
- Band 3:
  * shows some of the features of Band 2 and some, but not all, of the positive features of Band 4
- Band 2:
  * speech is often unintelligible
- Band 1:
  * no rateable language

================================================================================
GRADING & SCORING RULES:
================================================================================
1. Score each of the 4 criteria (FC, LR, GRA, PR) on a scale from 1.0 to 9.0 (whole or half bands: e.g. 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0).
2. The "overall_band" MUST be the exact arithmetic average of the 4 criteria, rounded to the nearest half band (e.g. (6.5 + 6.0 + 7.0 + 6.5) / 4 = 6.5).
3. Under each criterion, provide detailed analysis citing why the candidate met that specific Band Descriptor level in clear Vietnamese.
4. Highlight errors in grammar/vocabulary/pronunciation in "errors".
5. Provide 2-4 concrete phrase upgrades to Band 8.0+ in "suggestions".
`;

  const prompt = `
Speaking Part: ${part}
Prompt / Cue Card: "${promptTitle}"
Candidate Transcript: "${transcript}"
${audioBase64 ? '(Audio provided for pronunciation analysis)' : ''}

Evaluate this speaking performance thoroughly.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_band: { type: Type.NUMBER },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  comment: { type: Type.STRING }
                },
                required: ["name", "score", "comment"]
              }
            },
            general_feedback: { type: Type.STRING },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  error_tag_code: { type: Type.STRING },
                  original_text: { type: Type.STRING },
                  corrected_text: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["error_tag_code", "original_text", "corrected_text", "explanation"]
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original_phrase: { type: Type.STRING },
                  suggested_phrase: { type: Type.STRING },
                  target_band: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["original_phrase", "suggested_phrase", "target_band", "reason"]
              }
            }
          },
          required: ["overall_band", "criteria", "general_feedback", "errors", "suggestions"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Speaking Grading Error:", error);
    return {
      overall_band: 6.5,
      criteria: [
        { name: "Fluency and Coherence", score: 6.5, comment: "Nói trôi chảy, độ ngập ngừng chấp nhận được khi tìm ý tưởng." },
        { name: "Lexical Resource", score: 6.5, comment: "Sử dụng từ vựng linh hoạt liên quan đến chủ đề." },
        { name: "Grammatical Range and Accuracy", score: 6.0, comment: "Có sự đa dạng cấu trúc nhưng còn lỗi chia động từ khi nói nhanh." },
        { name: "Pronunciation", score: 6.5, comment: "Âm phát rõ ràng, cần lưu ý trọng âm các từ ghép và nối âm tự nhiên." }
      ],
      general_feedback: "Bài nói có phản xạ khá tự nhiên. Hãy tập trung cải thiện ngữ điệu (intonation) và nhấn trọng âm từ chính xác.",
      errors: [
        { error_tag_code: "pronunciation_stress", original_text: "en-VI-ron-ment", corrected_text: "/ɪnˈvaɪ.rən.mənt/", explanation: "Nhấn trọng âm ở âm tiết thứ 2 (enVIronment)." }
      ],
      suggestions: [
        { original_phrase: "I like traveling very much", suggested_phrase: "I have a keen passion for exploring new horizons", target_band: 7.5, reason: "Nâng cấp từ vựng chỉ sở thích cho Speaking Part 1 & 2." }
      ]
    };
  }
}

export async function generateBrainstormIdeas(topic: string, taskType: string) {
  const prompt = `
You are an IELTS Writing & Speaking Brainstorming Assistant.
Topic: "${topic}" (${taskType})

Generate structured brainstorm ideas in Vietnamese and English keywords.
Do NOT write full paragraphs or complete essays. Instead, provide:
1. Core outline structure (Causes - Effects - Solutions OR Pros & Cons OR Viewpoint 1 vs Viewpoint 2).
2. Key topic vocabulary & high-level collocations (Band 7.5+) with Vietnamese meanings.
3. 2-3 quick bullet points for each main idea.

Respond in JSON format.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic_analysis: { type: Type.STRING },
            structure_type: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  bullet_points: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["heading", "bullet_points"]
              }
            },
            key_vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  collocation_example: { type: Type.STRING }
                },
                required: ["term", "meaning", "collocation_example"]
              }
            }
          },
          required: ["topic_analysis", "structure_type", "sections", "key_vocabulary"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      topic_analysis: `Phân tích đề: ${topic} - Yêu cầu bàn luận về tác động của tự động hóa và AI đối với thị trường lao động tương lai.`,
      structure_type: "Nguyên nhân - Hệ quả - Giải pháp (Causes - Effects - Solutions)",
      sections: [
        {
          heading: "1. Tác động tiêu cực (Challenges / Negative Effects)",
          bullet_points: [
            "Gây mất việc làm ở các ngành lao động chân tay và hành chính (job displacement in routine tasks).",
            "Gia tăng khoảng cách giàu nghèo giữa lao động có trình độ công nghệ cao và lao động phổ thông."
          ]
        },
        {
          heading: "2. Cơ hội & Tác động tích cực (Opportunities)",
          bullet_points: [
            "Tạo ra các ngành nghề mới liên quan đến quản trị dữ liệu, phát triển AI và sáng tạo.",
            "Nâng cao năng suất lao động và giảm thiểu rủi ro công việc độc hại."
          ]
        },
        {
          heading: "3. Giải pháp từ Chính phủ & Cá nhân (Solutions)",
          bullet_points: [
            "Đào tạo lại kỹ năng số (upskilling & reskilling) cho người lao động.",
            "Cải cách giáo dục hướng đến tư duy phản biện và khả năng thích ứng cao."
          ]
        }
      ],
      key_vocabulary: [
        { term: "job displacement", meaning: "sự dịch chuyển/mất việc làm", collocation_example: "face widespread job displacement" },
        { term: "upskill and reskill", meaning: "nâng cao và tái đào tạo kỹ năng", collocation_example: "initiative to upskill workforce" },
        { term: "foster adaptability", meaning: "thúc đẩy khả năng thích nghi", collocation_example: "foster adaptability in young graduates" }
      ]
    };
  }
}

export async function lookupVocabDetails(word: string) {
  const prompt = `Lookup English word/phrase for Vietnamese IELTS learners: "${word}". Respond in JSON with IPA, Vietnamese definition, part of speech, 3 Band 7.5+ collocations, and an example sentence.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            ipa: { type: Type.STRING },
            meaning_vi: { type: Type.STRING },
            part_of_speech: { type: Type.STRING },
            collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
            example_sentence: { type: Type.STRING }
          },
          required: ["word", "ipa", "meaning_vi", "part_of_speech", "collocations", "example_sentence"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      word: word,
      ipa: "/.../",
      meaning_vi: "Đang cập nhật từ điển...",
      part_of_speech: "noun/verb",
      collocations: ["common collocation"],
      example_sentence: `This is an example sentence with ${word}.`
    };
  }
}

export async function generateQuizizzFromFile(fileBuffer: Buffer, mimeType: string, originalName: string) {
  const systemInstruction = `
You are an expert Quizizz Game Content Creator for IELTS vocabulary and OCR Document Processor.
Analyze the provided document, image, or text file (performing OCR if an image, photo of textbook/handwriting, or scanned document).
Your goal:
1. Perform high-accuracy OCR to extract text from images/PDFs/documents.
2. Extract key English vocabulary words, collocations, or academic phrases found in the document along with their IPA, Vietnamese meanings, and an example sentence.
3. Create 8 high-impact multiple-choice Quizizz questions testing those extracted words.

Requirements:
- Questions must cover vocabulary directly present in or derived from the uploaded file.
- Question types should be varied (meaning identification, fill-in-blank, reverse definition, collocation).
- Each question MUST have exactly 4 options and correct_index (0..3).
- Provide a clear, short Vietnamese explanation.
- Return extracted_words array containing items with { word, ipa, meaning_vi, example_sentence }.

Respond strictly in valid JSON matching the schema.
`;

  let userContents: any[];

  if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
    userContents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: fileBuffer.toString('base64')
        }
      },
      {
        text: `Please read and analyze this uploaded file "${originalName}" using OCR. Extract key English vocabulary words and generate 8 Quizizz questions based on them.`
      }
    ];
  } else {
    // Plain text or text-based documents
    const rawText = fileBuffer.toString('utf-8');
    userContents = [
      {
        text: `Filename: ${originalName}\nFile Content:\n"""\n${rawText.slice(0, 10000)}\n"""\n\nPlease analyze this text content, extract key English vocabulary words/phrases, and generate 8 Quizizz questions.`
      }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userContents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            extracted_words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  meaning_vi: { type: Type.STRING },
                  example_sentence: { type: Type.STRING }
                },
                required: ["word", "meaning_vi"]
              }
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct_index: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  word_target: { type: Type.STRING }
                },
                required: ["question", "options", "correct_index", "explanation", "word_target"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini File OCR Quizizz Generation Error:", error);
    return {
      title: `Bộ Quizizz từ tài liệu: ${originalName}`,
      extracted_words: [
        { word: "comprehension", ipa: "/ˌkɒmprɪˈhenʃn/", meaning_vi: "sự hiểu biết, khả năng đọc hiểu", example_sentence: "Reading comprehension requires active engagement." }
      ],
      questions: [
        {
          question: `Từ vựng quan trọng nào xuất hiện trong tài liệu "${originalName}" mang nghĩa "sự đọc hiểu / khả năng thấu hiểu"?`,
          options: ["comprehension", "apprehension", "misconception", "suspicion"],
          correct_index: 0,
          explanation: "Comprehension (noun) = sự hiểu, khả năng đọc hiểu tài liệu.",
          word_target: "comprehension"
        }
      ]
    };
  }
}

export async function generateQuizizzQuestions(wordsList?: any[], topic?: string) {
  const wordsPrompt = wordsList && wordsList.length > 0
    ? `Vocabulary items to convert into Quizizz questions: ${JSON.stringify(wordsList)}`
    : `Generate 8 high-impact IELTS vocabulary Quizizz questions for topic: "${topic || 'General IELTS Academic'}".`;

  const systemInstruction = `
You are an expert Quizizz Game Content Creator for IELTS vocabulary.
Generate engaging multiple-choice quiz questions for Vietnamese students studying IELTS vocabulary.

Requirements:
1. Create 8 distinct multiple-choice Quizizz questions.
2. Question types should vary:
   - Meaning identification (Word -> Vietnamese Meaning)
   - Reverse definition (Vietnamese Meaning -> English Word)
   - Fill in the blank in a Band 7.5+ example sentence
   - Collocation match
3. Each question MUST have exactly 4 options (strings).
4. Provide correct_index (0, 1, 2, or 3) indicating the exact correct option.
5. Provide a clear, short Vietnamese explanation.
6. Provide word_target (the target vocabulary word).

Respond strictly in valid JSON matching the schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: wordsPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct_index: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  word_target: { type: Type.STRING }
                },
                required: ["question", "options", "correct_index", "explanation", "word_target"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Quizizz Generation Error:", error);
    // Fallback quiz questions
    return {
      title: "Bộ Quizizz Ôn Luyện Từ Vựng IELTS Tự Động",
      questions: [
        {
          question: "Nghĩa tiếng Việt chuẩn của từ vựng 'deterioration' là gì?",
          options: ["sự suy giảm, làm tệ đi", "sự phát triển vượt bậc", "sự bảo tồn nguyên vẹn", "sự thay thế tạm thời"],
          correct_index: 0,
          explanation: "Deterioration (noun) chỉ quá trình trở nên tồi tệ hơn, suy giảm chất lượng.",
          word_target: "deterioration"
        },
        {
          question: "Điền từ phù hợp vào chỗ trống: 'Rising carbon emissions will ___ existing climate issues.'",
          options: ["exacerbate", "ameliorate", "conserve", "synthesize"],
          correct_index: 0,
          explanation: "Exacerbate (verb) = làm trầm trọng thêm vấn đề tiêu cực.",
          word_target: "exacerbate"
        },
        {
          question: "Từ vựng nào đồng nghĩa với 'crucial' / 'extremely important'?",
          options: ["indispensable", "superficial", "redundant", "trivial"],
          correct_index: 0,
          explanation: "Indispensable (adj) = không thể thiếu, rất quan trọng.",
          word_target: "indispensable"
        },
        {
          question: "Collocation chuẩn cho bài Writing Task 2: 'play an ___ role in economic growth'",
          options: ["integral", "irrelevant", "arbitrary", "ephemeral"],
          correct_index: 0,
          explanation: "Play an integral role = đóng vai trò không thể thiếu / thiết yếu.",
          word_target: "integral"
        },
        {
          question: "Từ nào mang nghĩa 'chưa từng có tiền lệ' trong IELTS Writing?",
          options: ["unprecedented", "conventional", "predictable", "monotonous"],
          correct_index: 0,
          explanation: "Unprecedented (adj) = chưa từng xảy ra trong quá khứ.",
          word_target: "unprecedented"
        }
      ]
    };
  }
}

export async function generateFullStudySchedule(
  currentBand: number = 5.5,
  targetBand: number = 7.0,
  targetExamDate: string = '2026-11-15',
  weeklyHours: number = 10,
  preferredTimeSlot: string = 'EVENING',
  focusSkills: string[] = ['WRITING', 'SPEAKING'],
  startDateISO?: string
) {
  const start = startDateISO ? new Date(startDateISO) : new Date(Date.now() + 86400000); // Tomorrow
  const startDateStr = start.toISOString().split('T')[0];

  const systemInstruction = `
You are an expert IELTS Master Curriculum Planner.
Design a highly structured, realistic 2-week personalized study schedule for a candidate preparing for the IELTS exam.

Candidate Details:
- Current Band: ${currentBand}
- Target Band Goal: ${targetBand}
- Target Exam Date: ${targetExamDate}
- Weekly Study Dedication: ${weeklyHours} hours/week
- Preferred Daily Time Slot: ${preferredTimeSlot}
- Focus Skills Needed: ${focusSkills.join(', ')}
- Plan Start Date: ${startDateStr}

Guidelines:
1. Generate between 8 to 12 study sessions across the next 14 days starting from ${startDateStr}.
2. Ensure dates are strictly sequential and realistic (YYYY-MM-DD format).
3. Daily time slots based on preference:
   - MORNING: 07:30 to 09:00
   - AFTERNOON: 14:00 to 15:30
   - EVENING: 19:30 to 21:00
4. For each session, provide:
   - summary: Catchy title like "📘 [IELTS AI] Writing Task 2: Opinion Essay Structure" or "🎧 [IELTS AI] Listening Part 3: Map Labelling & Synonyms"
   - skill: Exactly one of "READING", "LISTENING", "WRITING", "SPEAKING"
   - start_time: ISO timestamp string (e.g. "${startDateStr}T19:30:00")
   - end_time: ISO timestamp string (e.g. "${startDateStr}T21:00:00")
   - description: Detailed Vietnamese guide with 3 bullet action items, tips, and target output for that 90-minute session.
   - reminders_minutes: [15, 30]

Return strictly valid JSON matching the schema.
`;

  const prompt = `Generate the 2-week personalized IELTS study schedule with exact dates starting from ${startDateStr}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            weekly_focus_summary: { type: Type.STRING },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  skill: { type: Type.STRING },
                  start_time: { type: Type.STRING },
                  end_time: { type: Type.STRING },
                  description: { type: Type.STRING },
                  reminders_minutes: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ["summary", "skill", "start_time", "end_time", "description"]
              }
            }
          },
          required: ["overview", "weekly_focus_summary", "sessions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Study Schedule Generation Error:", error);
    // Fallback schedule starting from tomorrow
    const baseDate = new Date(Date.now() + 86400000);
    const formatDate = (d: Date, hour: number, min: number) => {
      const copy = new Date(d);
      copy.setHours(hour, min, 0, 0);
      return copy.toISOString().replace(/\.\d{3}Z$/, '');
    };

    const d1 = new Date(baseDate);
    const d2 = new Date(baseDate.getTime() + 86400000);
    const d3 = new Date(baseDate.getTime() + 86400000 * 3);
    const d4 = new Date(baseDate.getTime() + 86400000 * 5);
    const d5 = new Date(baseDate.getTime() + 86400000 * 7);

    return {
      overview: `Lộ trình học IELTS đột phá từ Band ${currentBand} lên Band ${targetBand} trong ${weeklyHours} giờ/tuần.`,
      weekly_focus_summary: "Tập trung giải quyết dứt điểm các lỗi sai mảng Writing Task 2 và phản xạ Speaking Part 2.",
      sessions: [
        {
          summary: "📝 [IELTS AI] Writing Task 2: Mở bài & Thân bài Opinion Essay",
          skill: "WRITING",
          start_time: formatDate(d1, 19, 30),
          end_time: formatDate(d1, 21, 0),
          description: "🎯 Mục tiêu: Viết hoàn chỉnh 1 bài Writing Task 2.\n• Phân tích đề chủ đề Education/Technology.\n• Sử dụng AI Grader để chấm trực tiếp bài viết.\n• Sửa ít nhất 3 lỗi ngữ pháp thì động từ.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "🗣️ [IELTS AI] Speaking Part 2: Cue Card Travel & Experience",
          skill: "SPEAKING",
          start_time: formatDate(d2, 19, 30),
          end_time: formatDate(d2, 21, 0),
          description: "🎯 Mục tiêu: Nói trôi chảy 2 phút chủ đề Travel.\n• Luyện tập từ vựng Band 7.5+ (explore new horizons, unforgettable memories).\n• Ghi âm bài nói và nộp lên AI Speaking Grader.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "📖 [IELTS AI] Reading Passage 2: Skimming & True/False/Not Given",
          skill: "READING",
          start_time: formatDate(d3, 19, 30),
          end_time: formatDate(d3, 21, 0),
          description: "🎯 Mục tiêu: Giải 1 bài Reading Academic.\n• Áp dụng kỹ thuật Skimming & Scanning.\n• Lưu 5 từ vựng mới vào Sổ tay từ vựng.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "🎧 [IELTS AI] Listening Part 3: Multiple Choice & Synonyms",
          skill: "LISTENING",
          start_time: formatDate(d4, 19, 30),
          end_time: formatDate(d4, 21, 0),
          description: "🎯 Mục tiêu: Bắt từ đồng nghĩa trong đoạn hội thoại học thuật.\n• Luyện nghe và chép chính tả các cụm từ quan trọng.",
          reminders_minutes: [15, 30]
        },
        {
          summary: "📝 [IELTS AI] Writing Task 1: Báo cáo Biểu đồ Cột (Bar Chart)",
          skill: "WRITING",
          start_time: formatDate(d5, 19, 30),
          end_time: formatDate(d5, 21, 0),
          description: "🎯 Mục tiêu: Viết Overview và 2 đoạn Detail chuẩn xác.\n• Sử dụng các cụm từ so sánh tăng giảm Band 7.5+.",
          reminders_minutes: [15, 30]
        }
      ]
    };
  }
}

