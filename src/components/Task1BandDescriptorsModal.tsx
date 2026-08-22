import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';

export interface BandDescriptorLevel {
  band: number;
  taskAchievement: {
    en: string[];
    vi: string[];
  };
  coherenceCohesion: {
    en: string[];
    vi: string[];
  };
  lexicalResource: {
    en: string[];
    vi: string[];
  };
  grammaticalRangeAccuracy: {
    en: string[];
    vi: string[];
  };
}

export const OFFICIAL_TASK1_BAND_DESCRIPTORS: BandDescriptorLevel[] = [
  {
    band: 9,
    taskAchievement: {
      en: [
        'fully satisfies all the requirements of the task',
        'clearly presents a fully developed response'
      ],
      vi: [
        'Đáp ứng trọn vẹn và hoàn hảo tất cả các yêu cầu của đề bài',
        'Trình bày bài viết phát triển toàn diện, súc tích và cực kỳ rõ ràng'
      ]
    },
    coherenceCohesion: {
      en: [
        'uses cohesion in such a way that it attracts no attention',
        'skilfully manages paragraphing'
      ],
      vi: [
        'Sử dụng các phương tiện liên kết tự nhiên đến mức người đọc không chú ý tới kỹ thuật nối câu',
        'Phân đoạn và tổ chức ý điêu luyện, logic hoàn hảo'
      ]
    },
    lexicalResource: {
      en: [
        'uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as "slips"'
      ],
      vi: [
        'Sử dụng vốn từ vựng cực kỳ phong phú với sự kiểm soát tự nhiên và tinh tế các đặc điểm từ vựng; lỗi hiếm hoi chỉ là lỗi gõ phím ("slips")'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as "slips"'
      ],
      vi: [
        'Sử dụng đa dạng cấu trúc ngữ pháp với độ linh hoạt và chính xác tuyệt đối; lỗi hiếm hoi chỉ là trượt tay ngẫu nhiên ("slips")'
      ]
    }
  },
  {
    band: 8,
    taskAchievement: {
      en: [
        'covers all requirements of the task sufficiently',
        'presents, highlights and illustrates key features/bullet points clearly and appropriately'
      ],
      vi: [
        'Bao quát đầy đủ và thỏa đáng tất cả các yêu cầu của đề bài',
        'Trình bày, làm nổi bật và minh họa các đặc điểm then chốt / số liệu trọng tâm một cách rõ ràng và thích hợp'
      ]
    },
    coherenceCohesion: {
      en: [
        'sequences information and ideas logically',
        'manages all aspects of cohesion well',
        'uses paragraphing sufficiently and appropriately'
      ],
      vi: [
        'Sắp xếp thông tin và các ý tưởng theo trình tự logic chặt chẽ',
        'Kiểm soát và xử lý tốt mọi khía cạnh liên kết câu và đoạn',
        'Chia đoạn hợp lý, đầy đủ và chuẩn xác'
      ]
    },
    lexicalResource: {
      en: [
        'uses a wide range of vocabulary fluently and flexibly to convey precise meanings',
        'skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation',
        'produces rare errors in spelling and/or word formation'
      ],
      vi: [
        'Sử dụng vốn từ rộng một cách lưu loát và linh hoạt nhằm truyền đạt chính xác ý nghĩa',
        'Sử dụng khéo léo các từ vựng học thuật ít phổ biến, có thể có đôi chỗ chưa hoàn toàn chuẩn xác trong chọn từ và collocation',
        'Rất hiếm khi mắc lỗi chính tả hoặc dạng từ'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a wide range of structures',
        'the majority of sentences are error-free',
        'makes only very occasional errors or inappropriacies'
      ],
      vi: [
        'Sử dụng đa dạng các cấu trúc câu phong phú',
        'Phần lớn các câu hoàn toàn không có lỗi ngữ pháp',
        'Chỉ thỉnh thoảng mắc lỗi rất nhỏ hoặc diễn đạt chưa tối ưu'
      ]
    }
  },
  {
    band: 7,
    taskAchievement: {
      en: [
        'covers the requirements of the task',
        '(Academic) presents a clear overview of main trends, differences or stages',
        'clearly presents and highlights key features/bullet points but could be more fully extended'
      ],
      vi: [
        'Đáp ứng tốt các yêu cầu của đề bài',
        'Bắt buộc có đoạn Overview rõ ràng nêu bật xu hướng, sự khác biệt chính hoặc các giai đoạn',
        'Trình bày và làm nổi bật các đặc điểm chính nhưng có thể cần được mở rộng đầy đủ hơn'
      ]
    },
    coherenceCohesion: {
      en: [
        'logically organises information and ideas; there is clear progression throughout',
        'uses a range of cohesive devices appropriately although there may be some under-/over-use'
      ],
      vi: [
        'Tổ chức thông tin và ý tưởng logic; mạch phát triển rõ ràng xuyên suốt',
        'Sử dụng phong phú các phương tiện liên kết hợp lý dù đôi chỗ còn dùng thiếu hoặc hơi lạm dụng'
      ]
    },
    lexicalResource: {
      en: [
        'uses a sufficient range of vocabulary to allow some flexibility and precision',
        'uses less common lexical items with some awareness of style and collocation',
        'may produce occasional errors in word choice, spelling and/or word formation'
      ],
      vi: [
        'Sử dụng vốn từ vựng đủ rộng để đảm bảo sự linh hoạt và độ chính xác',
        'Có sử dụng từ vựng nâng cao với ý thức về phong cách và collocation',
        'Có thể mắc một số lỗi nhỏ trong việc chọn từ, chính tả hoặc dạng từ'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a variety of complex structures',
        'produces frequent error-free sentences',
        'has good control of grammar and punctuation but may make a few errors'
      ],
      vi: [
        'Sử dụng đa dạng các cấu trúc câu phức (mệnh đề quan hệ, câu điều kiện, bị động, mệnh đề phân từ)',
        'Thường xuyên viết được các câu không có lỗi',
        'Kiểm soát tốt ngữ pháp và dấu câu dù vẫn có thể có một vài lỗi nhỏ'
      ]
    }
  },
  {
    band: 6,
    taskAchievement: {
      en: [
        'addresses the requirements of the task',
        '(Academic) presents an overview with information appropriately selected',
        'presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate'
      ],
      vi: [
        'Giải quyết được các yêu cầu của đề bài',
        'Có đoạn Overview với thông tin được lựa chọn tương đối phù hợp',
        'Trình bày và nêu bật được các điểm chính nhưng chi tiết có thể còn thiếu chuẩn xác hoặc vụn vặt'
      ]
    },
    coherenceCohesion: {
      en: [
        'arranges information and ideas coherently and there is a clear overall progression',
        'uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical',
        'may not always use referencing clearly or appropriately'
      ],
      vi: [
        'Sắp xếp thông tin và ý tưởng mạch lạc, có tiến trình tổng thể rõ ràng',
        'Dùng liên từ hiệu quả nhưng liên kết giữa các câu có thể còn máy móc hoặc có lỗi',
        'Kỹ năng quy chiếu (referencing/đại từ) chưa hoàn toàn chính xác'
      ]
    },
    lexicalResource: {
      en: [
        'uses an adequate range of vocabulary for the task',
        'attempts to use less common vocabulary but with some inaccuracy',
        'makes some errors in spelling and/or word formation, but they do not impede communication'
      ],
      vi: [
        'Vốn từ vựng tương đối đủ cho yêu cầu đề bài',
        'Có nỗ lực dùng từ vựng nâng cao nhưng còn sai sót',
        'Còn mắc lỗi chính tả hoặc dạng từ nhưng không gây cản trở người đọc hiểu nghĩa'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a mix of simple and complex sentence forms',
        'makes some errors in grammar and punctuation but they rarely reduce communication'
      ],
      vi: [
        'Kết hợp sử dụng cả câu đơn và câu phức',
        'Có mắc lỗi ngữ pháp và dấu câu nhưng hiếm khi làm giảm khả năng truyền đạt'
      ]
    }
  },
  {
    band: 5,
    taskAchievement: {
      en: [
        'generally addresses the task; the format may be inappropriate in places',
        '(Academic) recounts detail mechanically with no clear overview; there may be no data to support the description',
        'presents, but inadequately covers, key features/bullet points; there may be a tendency to focus on details'
      ],
      vi: [
        'Nhìn chung có trả lời đề bài nhưng định dạng bài có thể chưa phù hợp ở vài chỗ',
        'Kể lể số liệu máy móc, KHÔNG CÓ đoạn Overview rõ ràng (Nếu thiếu Overview điểm TA tối đa chỉ là 5.0)',
        'Trình bày nhưng bao quát chưa đầy đủ các đặc điểm chính, sa đà vào tiểu tiết'
      ]
    },
    coherenceCohesion: {
      en: [
        'presents information with some organisation but there may be a lack of overall progression',
        'makes inadequate, inaccurate or over-use of cohesive devices',
        'may be repetitive because of lack of referencing and substitution'
      ],
      vi: [
        'Có sắp xếp thông tin nhưng thiếu tính liên kết tiến triển tổng thể',
        'Dùng từ nối thiếu, sai hoặc lạm dụng quá nhiều từ nối',
        'Bị lặp từ/ý do thiếu kỹ năng thay thế từ đồng nghĩa và đại từ'
      ]
    },
    lexicalResource: {
      en: [
        'uses a limited range of vocabulary, but this is minimally adequate for the task',
        'may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader'
      ],
      vi: [
        'Vốn từ còn hạn chế, chỉ vừa đủ ở mức tối thiểu cho đề bài',
        'Mắc nhiều lỗi chính tả và dạng từ đáng chú ý, gây khó khăn cho người đọc'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses only a limited range of structures',
        'attempts complex sentences but these tend to be less accurate than simple sentences',
        'may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader'
      ],
      vi: [
        'Chỉ dùng các cấu trúc câu đơn giản và hạn chế',
        'Thử viết câu phức nhưng hay sai',
        'Thường xuyên mắc lỗi ngữ pháp và dấu câu gây khó hiểu'
      ]
    }
  },
  {
    band: 4,
    taskAchievement: {
      en: [
        'attempts to address the task but does not cover all key features/bullet points; may confuse key features with detail',
        'parts may be unclear, irrelevant, repetitive or inaccurate'
      ],
      vi: [
        'Cố gắng trả lời nhưng không bao quát hết các điểm then chốt; nhầm lẫn điểm chính với chi tiết vụn vặt',
        'Nhiều phần không rõ ràng, lạc đề, lặp lại hoặc sai lệch'
      ]
    },
    coherenceCohesion: {
      en: [
        'presents information and ideas but these are not arranged coherently and there is no clear progression in the response',
        'uses some basic cohesive devices but these may be inaccurate or repetitive'
      ],
      vi: [
        'Ý tưởng không được sắp xếp mạch lạc và không có tiến trình phát triển rõ ràng',
        'Chỉ dùng được một vài từ nối cơ bản nhưng sai hoặc lặp lại'
      ]
    },
    lexicalResource: {
      en: [
        'uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task',
        'has limited control of word formation and/or spelling; errors may cause strain for the reader'
      ],
      vi: [
        'Chỉ dùng từ vựng cơ bản lặp đi lặp lại hoặc không phù hợp',
        'Kiểm soát chính tả và cấu tạo từ kém, gây căng thẳng cho người đọc'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses only a very limited range of structures with only rare use of subordinate clauses',
        'some structures are accurate but errors predominate, and punctuation is often faulty'
      ],
      vi: [
        'Cực kỳ hạn chế về cấu trúc câu, hiếm khi dùng mệnh đề phụ',
        'Lỗi ngữ pháp chiếm ưu thế áp đảo, chấm câu sai nhiều'
      ]
    }
  },
  {
    band: 3,
    taskAchievement: {
      en: ['does not adequately address any part of the task', 'fails to report main trends or key features'],
      vi: ['Không giải quyết thỏa đáng bất kỳ phần nào của đề bài', 'Không nêu được xu hướng chính']
    },
    coherenceCohesion: {
      en: ['does not organise ideas logically', 'may use a very limited range of cohesive devices'],
      vi: ['Không tổ chức ý logic', 'Dùng từ nối cực kỳ hạn chế và không chính xác']
    },
    lexicalResource: {
      en: ['uses only a very limited range of words and expressions with very limited control of word formation/spelling', 'errors may severely distort the message'],
      vi: ['Vốn từ cực kỳ nghèo nàn; lỗi làm sai lệch nghiêm trọng thông điệp']
    },
    grammaticalRangeAccuracy: {
      en: ['attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning'],
      vi: ['Lỗi ngữ pháp và chấm câu áp đảo làm biến dạng ý nghĩa']
    }
  },
  {
    band: 2,
    taskAchievement: {
      en: ['barely responds to the task', 'may attempt to present one or two ideas but there is no development'],
      vi: ['Hầu như không phản hồi đề bài', 'Ý tưởng không được phát triển']
    },
    coherenceCohesion: {
      en: ['has very little control of organisational features'],
      vi: ['Hầu như không kiểm soát được cấu trúc tổ chức bài']
    },
    lexicalResource: {
      en: ['uses an extremely limited range of vocabulary; essentially no control of word formation/spelling'],
      vi: ['Vốn từ cực kỳ hạn chế, không kiểm soát được dạng từ hay chính tả']
    },
    grammaticalRangeAccuracy: {
      en: ['cannot use sentence forms except in memorised phrases'],
      vi: ['Không thể viết thành câu trừ các cụm từ học vẹt']
    }
  },
  {
    band: 1,
    taskAchievement: {
      en: ['answer is completely unrelated to the task'],
      vi: ['Bài viết hoàn toàn không liên quan đến đề bài']
    },
    coherenceCohesion: {
      en: ['fails to communicate any message'],
      vi: ['Không truyền đạt được bất kỳ thông điệp nào']
    },
    lexicalResource: {
      en: ['can only use a few isolated words'],
      vi: ['Chỉ dùng được một vài từ ngữ rời rạc']
    },
    grammaticalRangeAccuracy: {
      en: ['cannot use sentence forms at all'],
      vi: ['Hoàn toàn không thể tạo thành dạng câu']
    }
  },
  {
    band: 0,
    taskAchievement: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài học thuộc lòng hoàn toàn']
    },
    coherenceCohesion: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài học thuộc lòng hoàn toàn']
    },
    lexicalResource: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài học thuộc lòng hoàn toàn']
    },
    grammaticalRangeAccuracy: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài học thuộc lòng hoàn toàn']
    }
  }
];

export const OFFICIAL_TASK2_BAND_DESCRIPTORS: BandDescriptorLevel[] = [
  {
    band: 9,
    taskAchievement: {
      en: [
        'fully addresses all parts of the task',
        'presents a fully developed position in answer to the question with relevant, fully extended and well supported ideas'
      ],
      vi: [
        'Giải quyết toàn diện và trọn vẹn tất cả các yêu cầu của đề bài',
        'Thể hiện một quan điểm được phát triển triệt để nhằm trả lời câu hỏi với các ý tưởng liên quan mật thiết, được mở rộng và có dẫn chứng bổ trợ vững chắc'
      ]
    },
    coherenceCohesion: {
      en: [
        'uses cohesion in such a way that it attracts no attention',
        'skilfully manages paragraphing'
      ],
      vi: [
        'Sử dụng các phương tiện liên kết tự nhiên, tinh tế đến mức không gây cảm giác gượng ép hay thu hút sự chú ý vào kỹ thuật',
        'Phân đoạn và tổ chức ý tưởng điêu luyện, logic hoàn hảo'
      ]
    },
    lexicalResource: {
      en: [
        'uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as "slips"'
      ],
      vi: [
        'Sử dụng vốn từ vựng cực kỳ phong phú với khả năng kiểm soát tự nhiên và tinh tế các đặc điểm từ vựng; lỗi cực hiếm chỉ là trượt tay ngẫu nhiên ("slips")'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as "slips"'
      ],
      vi: [
        'Sử dụng đa dạng cấu trúc ngữ pháp với độ linh hoạt và chính xác tuyệt đối; lỗi cực hiếm chỉ là trượt tay ngẫu nhiên ("slips")'
      ]
    }
  },
  {
    band: 8,
    taskAchievement: {
      en: [
        'sufficiently addresses all parts of the task',
        'presents a well-developed response to the question with relevant, extended and supported ideas'
      ],
      vi: [
        'Bao quát đầy đủ và thỏa đáng tất cả các khía cạnh của đề bài',
        'Trình bày bài viết phát triển tốt với các luận điểm liên quan, được mở rộng và có ví dụ/dẫn chứng bổ trợ thuyết phục'
      ]
    },
    coherenceCohesion: {
      en: [
        'sequences information and ideas logically',
        'manages all aspects of cohesion well',
        'uses paragraphing sufficiently and appropriately'
      ],
      vi: [
        'Sắp xếp thông tin và các ý tưởng theo trình tự logic chặt chẽ',
        'Kiểm soát tốt tất cả các khía cạnh liên kết mạch lạc giữa câu và đoạn',
        'Phân chia đoạn văn đầy đủ và hoàn toàn phù hợp'
      ]
    },
    lexicalResource: {
      en: [
        'uses a wide range of vocabulary fluently and flexibly to convey precise meanings',
        'skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation',
        'produces rare errors in spelling and/or word formation'
      ],
      vi: [
        'Sử dụng vốn từ vựng phong phú một cách lưu loát và linh hoạt để truyền tải ngữ nghĩa chính xác',
        'Sử dụng khéo léo các từ vựng học thuật ít phổ biến, có thể có đôi chỗ sai sót nhỏ trong việc chọn từ hoặc kết hợp từ (collocation)',
        'Rất hiếm khi mắc lỗi chính tả hoặc cấu tạo từ'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a wide range of structures',
        'the majority of sentences are error-free',
        'makes only very occasional errors or inappropriacies'
      ],
      vi: [
        'Sử dụng đa dạng các cấu trúc ngữ pháp phức tạp',
        'Đại đa số các câu hoàn toàn không có lỗi ngữ pháp',
        'Chỉ thỉnh thoảng mắc lỗi rất nhỏ hoặc diễn đạt chưa tối ưu'
      ]
    }
  },
  {
    band: 7,
    taskAchievement: {
      en: [
        'addresses all parts of the task',
        'presents a clear position throughout the response',
        'presents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus'
      ],
      vi: [
        'Giải quyết tất cả các phần của đề bài',
        'Thể hiện rõ ràng lập trường / quan điểm xuyên suốt toàn bộ bài viết (Mở bài, Thân bài, Kết luận)',
        'Trình bày, mở rộng và chứng minh các ý chính, nhưng đôi khi có xu hướng khái quát hóa quá mức hoặc ý bổ trợ còn dàn trải'
      ]
    },
    coherenceCohesion: {
      en: [
        'logically organises information and ideas; there is clear progression throughout',
        'uses a range of cohesive devices appropriately although there may be some under-/over-use',
        'presents a clear central topic within each paragraph'
      ],
      vi: [
        'Tổ chức thông tin và ý tưởng logic; mạch phát triển rõ ràng xuyên suốt',
        'Sử dụng linh hoạt các phương tiện liên kết hợp lý dù đôi chỗ còn dùng thiếu hoặc hơi lạm dụng',
        'Mỗi đoạn văn đều có một chủ đề trung tâm rõ ràng (Topic Sentence)'
      ]
    },
    lexicalResource: {
      en: [
        'uses a sufficient range of vocabulary to allow some flexibility and precision',
        'uses less common lexical items with some awareness of style and collocation',
        'may produce occasional errors in word choice, spelling and/or word formation'
      ],
      vi: [
        'Sử dụng vốn từ vựng đủ rộng để đảm bảo sự linh hoạt và độ chính xác',
        'Có sử dụng từ vựng nâng cao với ý thức về phong cách và kết hợp từ (collocation)',
        'Có thể thỉnh thoảng mắc lỗi dùng từ, chính tả hoặc dạng từ'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a variety of complex structures',
        'produces frequent error-free sentences',
        'has good control of grammar and punctuation but may make a few errors'
      ],
      vi: [
        'Sử dụng đa dạng các cấu trúc câu phức (mệnh đề quan hệ, đảo ngữ, câu điều kiện, bị động, mệnh đề trạng ngữ)',
        'Thường xuyên viết được các câu chuẩn xác không mắc lỗi',
        'Kiểm soát tốt ngữ pháp và dấu câu dù vẫn có thể có một vài lỗi nhỏ'
      ]
    }
  },
  {
    band: 6,
    taskAchievement: {
      en: [
        'addresses all parts of the task although some parts may be more fully covered than others',
        'presents a relevant position although the conclusions may become unclear or repetitive',
        'presents relevant main ideas but some may be inadequately developed/unclear'
      ],
      vi: [
        'Bao quát tất cả các phần của đề bài dù một số phần được phát triển kỹ hơn các phần khác',
        'Đưa ra lập trường phù hợp dù phần kết luận có thể chưa rõ ràng hoặc bị lặp lại',
        'Trình bày các ý chính liên quan nhưng một số ý chưa được phát triển đầy đủ hoặc chưa thật sáng tỏ'
      ]
    },
    coherenceCohesion: {
      en: [
        'arranges information and ideas coherently and there is a clear overall progression',
        'uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical',
        'may not always use referencing clearly or appropriately',
        'uses paragraphing, but not always logically'
      ],
      vi: [
        'Sắp xếp thông tin và ý tưởng mạch lạc với tiến trình tổng thể rõ ràng',
        'Sử dụng từ nối hiệu quả, nhưng liên kết trong hoặc giữa các câu có thể còn lỗi hoặc máy móc',
        'Chưa luôn sử dụng phép quy chiếu (referencing) rõ ràng hoặc thích hợp',
        'Có chia đoạn nhưng cách phân chia chưa hoàn toàn logic'
      ]
    },
    lexicalResource: {
      en: [
        'uses an adequate range of vocabulary for the task',
        'attempts to use less common vocabulary but with some inaccuracy',
        'makes some errors in spelling and/or word formation, but they do not impede communication'
      ],
      vi: [
        'Sử dụng vốn từ vựng tương đối đầy đủ cho yêu cầu đề bài',
        'Có nỗ lực dùng từ vựng nâng cao nhưng còn sai sót',
        'Mắc một số lỗi chính tả hoặc cấu tạo từ nhưng không gây cản trở việc hiểu thông điệp'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses a mix of simple and complex sentence forms',
        'makes some errors in grammar and punctuation but they rarely reduce communication'
      ],
      vi: [
        'Sử dụng kết hợp câu đơn và câu phức',
        'Còn mắc một số lỗi ngữ pháp và dấu câu nhưng hiếm khi ảnh hưởng đến khả năng truyền đạt'
      ]
    }
  },
  {
    band: 5,
    taskAchievement: {
      en: [
        'addresses the task only partially; the format may be inappropriate in places',
        'expresses a position but the development is not always clear and there may be no conclusions drawn',
        'presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail'
      ],
      vi: [
        'Chỉ giải quyết một phần yêu cầu đề bài; định dạng bài có thể chưa phù hợp ở vài chỗ',
        'Có nêu quan điểm nhưng sự phát triển ý chưa rõ ràng hoặc không rút ra được kết luận',
        'Trình bày một số ý chính nhưng còn hạn chế, chưa phát triển sâu; có thể lẫn chi tiết không liên quan'
      ]
    },
    coherenceCohesion: {
      en: [
        'presents information with some organisation but there may be a lack of overall progression',
        'makes inadequate, inaccurate or over-use of cohesive devices',
        'may be repetitive because of lack of referencing and substitution',
        'may not write in paragraphs, or paragraphing may be inadequate'
      ],
      vi: [
        'Có sắp xếp thông tin nhưng thiếu tính tiến triển mạch lạc tổng thể',
        'Dùng từ nối chưa đủ, không chính xác hoặc lạm dụng quá mức',
        'Dễ bị lặp từ/ý do thiếu kỹ năng quy chiếu và từ đồng nghĩa thay thế',
        'Có thể không chia đoạn hoặc chia đoạn chưa hợp lý'
      ]
    },
    lexicalResource: {
      en: [
        'uses a limited range of vocabulary, but this is minimally adequate for the task',
        'may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader'
      ],
      vi: [
        'Vốn từ còn hạn chế, chỉ vừa đủ ở mức tối thiểu cho đề bài',
        'Mắc nhiều lỗi chính tả và cấu tạo từ đáng chú ý có thể gây khó khăn cho người đọc'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses only a limited range of structures',
        'attempts complex sentences but these tend to be less accurate than simple sentences',
        'may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader'
      ],
      vi: [
        'Chỉ sử dụng vốn cấu trúc câu hạn chế',
        'Cố gắng viết câu phức nhưng thường mắc lỗi nhiều hơn câu đơn',
        'Thường xuyên mắc lỗi ngữ pháp và dấu câu; lỗi có thể gây khó hiểu cho người đọc'
      ]
    }
  },
  {
    band: 4,
    taskAchievement: {
      en: [
        'responds to the task only in a minimal way or the answer is tangential; the format may be inappropriate',
        'presents a position but this is unclear',
        'presents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported'
      ],
      vi: [
        'Chỉ đáp ứng yêu cầu ở mức tối thiểu hoặc bài viết lạc đề/ngoài lề; định dạng không phù hợp',
        'Có nêu quan điểm nhưng mơ hồ, không rõ ràng',
        'Có đưa ra một vài ý nhưng khó nhận diện, lặp lại, lạc đề hoặc thiếu chứng minh'
      ]
    },
    coherenceCohesion: {
      en: [
        'presents information and ideas but these are not arranged coherently and there is no clear progression in the response',
        'uses some basic cohesive devices but these may be inaccurate or repetitive',
        'may not write in paragraphs or their use may be confusing'
      ],
      vi: [
        'Thông tin và ý tưởng không được sắp xếp mạch lạc và không có tiến trình rõ ràng',
        'Chỉ dùng được một số từ nối cơ bản nhưng không chính xác hoặc bị lặp',
        'Có thể không chia đoạn hoặc cách dùng đoạn gây bối rối'
      ]
    },
    lexicalResource: {
      en: [
        'uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task',
        'has limited control of word formation and/or spelling; errors may cause strain for the reader'
      ],
      vi: [
        'Chỉ dùng từ vựng cơ bản, lặp đi lặp lại hoặc không phù hợp với đề bài',
        'Khả năng kiểm soát chính tả và cấu tạo từ kém; lỗi gây căng thẳng cho người đọc'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'uses only a very limited range of structures with only rare use of subordinate clauses',
        'some structures are accurate but errors predominate, and punctuation is often faulty'
      ],
      vi: [
        'Cực kỳ hạn chế về cấu trúc câu, hiếm khi dùng mệnh đề phụ thuộc',
        'Một số cấu trúc đúng nhưng lỗi ngữ pháp chiếm đa số, chấm câu sai nhiều'
      ]
    }
  },
  {
    band: 3,
    taskAchievement: {
      en: [
        'does not adequately address any part of the task',
        'does not express a clear position',
        'presents few ideas, which are largely undeveloped or irrelevant'
      ],
      vi: [
        'Không giải quyết thỏa đáng bất kỳ phần nào của đề bài',
        'Không thể hiện rõ quan điểm',
        'Rất ít ý tưởng, phần lớn chưa được phát triển hoặc không liên quan'
      ]
    },
    coherenceCohesion: {
      en: [
        'does not organise ideas logically',
        'may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas'
      ],
      vi: [
        'Không tổ chức ý tưởng logic',
        'Dùng từ nối cực kỳ hạn chế và không thể hiện được mối liên hệ logic giữa các ý'
      ]
    },
    lexicalResource: {
      en: [
        'uses only a very limited range of words and expressions with very limited control of word formation and/or spelling',
        'errors may severely distort the message'
      ],
      vi: [
        'Vốn từ và cách diễn đạt cực kỳ nghèo nàn; lỗi làm biến dạng nghiêm trọng thông điệp'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning'
      ],
      vi: [
        'Có thử viết câu nhưng lỗi ngữ pháp và dấu câu áp đảo, làm sai lệch ý nghĩa'
      ]
    }
  },
  {
    band: 2,
    taskAchievement: {
      en: [
        'barely responds to the task',
        'does not express a position',
        'may attempt to present one or two ideas but there is no development'
      ],
      vi: [
        'Hầu như không phản hồi đề bài',
        'Không nêu quan điểm',
        'Có thể thử nêu 1-2 ý nhưng không hề phát triển'
      ]
    },
    coherenceCohesion: {
      en: [
        'has very little control of organisational features'
      ],
      vi: [
        'Hầu như không kiểm soát được cấu trúc tổ chức bài'
      ]
    },
    lexicalResource: {
      en: [
        'uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling'
      ],
      vi: [
        'Vốn từ cực kỳ hạn chế; cơ bản không kiểm soát được dạng từ hay chính tả'
      ]
    },
    grammaticalRangeAccuracy: {
      en: [
        'cannot use sentence forms except in memorised phrases'
      ],
      vi: [
        'Không thể viết thành câu trừ các cụm từ học vẹt'
      ]
    }
  },
  {
    band: 1,
    taskAchievement: {
      en: ['answer is completely unrelated to the task'],
      vi: ['Bài viết hoàn toàn không liên quan đến đề bài']
    },
    coherenceCohesion: {
      en: ['fails to communicate any message'],
      vi: ['Không truyền đạt được bất kỳ thông điệp nào']
    },
    lexicalResource: {
      en: ['can only use a few isolated words'],
      vi: ['Chỉ dùng được một vài từ ngữ rời rạc']
    },
    grammaticalRangeAccuracy: {
      en: ['cannot use sentence forms at all'],
      vi: ['Hoàn toàn không thể tạo thành dạng câu']
    }
  },
  {
    band: 0,
    taskAchievement: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài mẫu học thuộc lòng hoàn toàn']
    },
    coherenceCohesion: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài mẫu học thuộc lòng hoàn toàn']
    },
    lexicalResource: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài mẫu học thuộc lòng hoàn toàn']
    },
    grammaticalRangeAccuracy: {
      en: ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'],
      vi: ['Không tham gia thi / vắng mặt', 'Không làm bài dưới bất kỳ hình thức nào', 'Chép bài mẫu học thuộc lòng hoàn toàn']
    }
  }
];

interface Task1BandDescriptorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBandFilter?: number | null;
  initialTaskType?: 'TASK_1' | 'TASK_2';
}

export const Task1BandDescriptorsModal: React.FC<Task1BandDescriptorsModalProps> = ({
  isOpen,
  onClose,
  initialBandFilter = null,
  initialTaskType = 'TASK_2'
}) => {
  const [selectedTaskType, setSelectedTaskType] = useState<'TASK_1' | 'TASK_2'>(initialTaskType);
  const [activeView, setActiveView] = useState<'MATRIX' | 'BY_BAND' | 'BY_CRITERIA' | 'TASK2_GUIDE'>('MATRIX');
  const [selectedBand, setSelectedBand] = useState<number>(initialBandFilter ?? 7);
  const [selectedCriteria, setSelectedCriteria] = useState<'TA' | 'CC' | 'LR' | 'GRA'>('TA');
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentDescriptors = selectedTaskType === 'TASK_1' ? OFFICIAL_TASK1_BAND_DESCRIPTORS : OFFICIAL_TASK2_BAND_DESCRIPTORS;
  const taskTitle = selectedTaskType === 'TASK_1' ? 'WRITING TASK 1' : 'WRITING TASK 2';
  const taskCriterion1Name = selectedTaskType === 'TASK_1' ? 'Task achievement (TA)' : 'Task response (TR)';

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-white text-base shadow-md">
              IELTS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-400/30">
                  Public Version
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  British Council • IDP: IELTS Australia • Cambridge ESOL
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {taskTitle}: Band Descriptors (Tiêu Chí Chấm Điểm Chuẩn Band 0-9)
              </h2>
            </div>
          </div>

          {/* Top Controls: Task 1 / Task 2 Switcher & Language Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Task Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedTaskType('TASK_1')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTaskType === 'TASK_1'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Task 1 (Bản đồ/Biểu đồ)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTaskType('TASK_2')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  selectedTaskType === 'TASK_2'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Task 2 (Bài luận Essay)</span>
              </button>
            </div>

            <button
              onClick={() => setShowVietnamese(!showVietnamese)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                showVietnamese
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showVietnamese ? 'Dịch Tiếng Việt: BẬT' : 'English Only'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('MATRIX')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'MATRIX'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <span>Bảng Ma Trận Chuẩn (Band 0-9)</span>
            </button>

            <button
              onClick={() => setActiveView('BY_BAND')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'BY_BAND'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Chi Tiết Theo Từng Band</span>
            </button>

            <button
              onClick={() => setActiveView('BY_CRITERIA')}
              className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'BY_CRITERIA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>So Sánh 4 Tiêu Chí</span>
            </button>

            {selectedTaskType === 'TASK_2' && (
              <button
                onClick={() => setActiveView('TASK2_GUIDE')}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'TASK2_GUIDE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chiến Thuật Ăn Điểm Task 2 (Band 7.0+)</span>
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm từ khóa (position, complex, errors...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* VIEW 1: FULL MATRIX TABLE (OFFICIAL IELTS PUBLIC FORMAT) */}
          {activeView === 'MATRIX' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold">
                  Bảng tổng hợp chính thức theo tài liệu IELTS Writing {selectedTaskType === 'TASK_1' ? 'Task 1' : 'Task 2'} Band Descriptors (Cambridge/BC/IDP):
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedTaskType === 'TASK_2' ? 'Tiêu chuẩn tối thiểu: 250 từ • Chiếm 2/3 tổng điểm Writing' : 'Tiêu chuẩn tối thiểu: 150 từ • Chiếm 1/3 tổng điểm Writing'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold divide-x divide-slate-800">
                      <th className="p-3 w-16 text-center shrink-0">Band</th>
                      <th className="p-3 w-1/4">{taskCriterion1Name}</th>
                      <th className="p-3 w-1/4">Coherence and cohesion (CC)</th>
                      <th className="p-3 w-1/4">Lexical resource (LR)</th>
                      <th className="p-3 w-1/4">Grammatical range and accuracy (GRA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentDescriptors.filter(item => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        item.taskAchievement.en.some(t => t.toLowerCase().includes(q)) ||
                        item.taskAchievement.vi.some(t => t.toLowerCase().includes(q)) ||
                        item.coherenceCohesion.en.some(t => t.toLowerCase().includes(q)) ||
                        item.lexicalResource.en.some(t => t.toLowerCase().includes(q)) ||
                        item.grammaticalRangeAccuracy.en.some(t => t.toLowerCase().includes(q))
                      );
                    }).map((desc) => {
                      return (
                        <tr
                          key={desc.band}
                          className={`divide-x divide-slate-200 transition ${
                            desc.band % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'
                          } hover:bg-emerald-50/40`}
                        >
                          {/* Band Column */}
                          <td className="p-3 text-center font-black text-sm shrink-0">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black ${
                              desc.band >= 8
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : desc.band >= 6.5
                                ? 'bg-blue-600 text-white'
                                : desc.band >= 5
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}>
                              {desc.band}
                            </span>
                          </td>

                          {/* Task Response / Task Achievement */}
                          <td className="p-3 align-top space-y-1">
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {desc.taskAchievement.en.map((enStr, i) => (
                                <li key={i} className="leading-relaxed">
                                  <span>{enStr}</span>
                                  {showVietnamese && (
                                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5 italic">
                                      ➔ {desc.taskAchievement.vi[i] || desc.taskAchievement.vi[0]}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Coherence and Cohesion */}
                          <td className="p-3 align-top space-y-1">
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {desc.coherenceCohesion.en.map((enStr, i) => (
                                <li key={i} className="leading-relaxed">
                                  <span>{enStr}</span>
                                  {showVietnamese && (
                                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5 italic">
                                      ➔ {desc.coherenceCohesion.vi[i] || desc.coherenceCohesion.vi[0]}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Lexical Resource */}
                          <td className="p-3 align-top space-y-1">
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {desc.lexicalResource.en.map((enStr, i) => (
                                <li key={i} className="leading-relaxed">
                                  <span>{enStr}</span>
                                  {showVietnamese && (
                                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5 italic">
                                      ➔ {desc.lexicalResource.vi[i] || desc.lexicalResource.vi[0]}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Grammatical Range and Accuracy */}
                          <td className="p-3 align-top space-y-1">
                            <ul className="list-disc pl-4 space-y-1 text-slate-800">
                              {desc.grammaticalRangeAccuracy.en.map((enStr, i) => (
                                <li key={i} className="leading-relaxed">
                                  <span>{enStr}</span>
                                  {showVietnamese && (
                                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5 italic">
                                      ➔ {desc.grammaticalRangeAccuracy.vi[i] || desc.grammaticalRangeAccuracy.vi[0]}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: BY BAND DRILLDOWN */}
          {activeView === 'BY_BAND' && (
            <div className="space-y-5">
              {/* Band selector pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-2xl">
                {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBand(b)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      selectedBand === b
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Band {b}
                  </button>
                ))}
              </div>

              {/* Selected Band Details */}
              {(() => {
                const bData = currentDescriptors.find(d => d.band === selectedBand);
                if (!bData) return null;

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                          bData.band >= 8 ? 'bg-emerald-600' : bData.band >= 6.5 ? 'bg-blue-600' : bData.band >= 5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}>
                          {bData.band}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">
                            Tiêu Chuẩn Đạt IELTS {taskTitle} Band {bData.band}.0
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {bData.band >= 8 ? 'Cấp độ Thành thạo & Rất tốt (Expert / Very Good User)' : bData.band >= 6.5 ? 'Cấp độ Khá & Tốt (Good / Competent User)' : bData.band >= 5 ? 'Cấp độ Trung bình (Modest User)' : 'Cấp độ Hạn chế & Cần Cải Thiện (Limited User)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* TR / TA */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-rose-600" />
                          1. {taskCriterion1Name}
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {bData.taskAchievement.en.map((en, i) => (
                            <li key={i} className="leading-relaxed">
                              <strong>{en}</strong>
                              {showVietnamese && (
                                <p className="text-emerald-800 text-[11px] font-medium mt-0.5">
                                  ➔ {bData.taskAchievement.vi[i] || bData.taskAchievement.vi[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CC */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          2. Coherence & Cohesion (CC)
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {bData.coherenceCohesion.en.map((en, i) => (
                            <li key={i} className="leading-relaxed">
                              <strong>{en}</strong>
                              {showVietnamese && (
                                <p className="text-emerald-800 text-[11px] font-medium mt-0.5">
                                  ➔ {bData.coherenceCohesion.vi[i] || bData.coherenceCohesion.vi[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* LR */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          3. Lexical Resource (LR)
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {bData.lexicalResource.en.map((en, i) => (
                            <li key={i} className="leading-relaxed">
                              <strong>{en}</strong>
                              {showVietnamese && (
                                <p className="text-emerald-800 text-[11px] font-medium mt-0.5">
                                  ➔ {bData.lexicalResource.vi[i] || bData.lexicalResource.vi[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* GRA */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          4. Grammatical Range & Accuracy (GRA)
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-800">
                          {bData.grammaticalRangeAccuracy.en.map((en, i) => (
                            <li key={i} className="leading-relaxed">
                              <strong>{en}</strong>
                              {showVietnamese && (
                                <p className="text-emerald-800 text-[11px] font-medium mt-0.5">
                                  ➔ {bData.grammaticalRangeAccuracy.vi[i] || bData.grammaticalRangeAccuracy.vi[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 3: BY CRITERIA COMPARISON */}
          {activeView === 'BY_CRITERIA' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'TA', name: selectedTaskType === 'TASK_1' ? 'Task Achievement' : 'Task Response', color: 'rose' },
                  { id: 'CC', name: 'Coherence & Cohesion', color: 'blue' },
                  { id: 'LR', name: 'Lexical Resource', color: 'amber' },
                  { id: 'GRA', name: 'Grammatical Range', color: 'emerald' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCriteria(c.id as any)}
                    className={`p-3 rounded-2xl text-xs font-black transition cursor-pointer text-left border ${
                      selectedCriteria === c.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 block font-mono">CRITERION</span>
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Progression Ladder */}
              <div className="space-y-2">
                {currentDescriptors.filter(d => d.band >= 4).map((item) => {
                  let enList: string[] = [];
                  let viList: string[] = [];
                  if (selectedCriteria === 'TA') {
                    enList = item.taskAchievement.en;
                    viList = item.taskAchievement.vi;
                  } else if (selectedCriteria === 'CC') {
                    enList = item.coherenceCohesion.en;
                    viList = item.coherenceCohesion.vi;
                  } else if (selectedCriteria === 'LR') {
                    enList = item.lexicalResource.en;
                    viList = item.lexicalResource.vi;
                  } else {
                    enList = item.grammaticalRangeAccuracy.en;
                    viList = item.grammaticalRangeAccuracy.vi;
                  }

                  return (
                    <div
                      key={item.band}
                      className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-start gap-3 hover:border-emerald-300 transition text-xs"
                    >
                      <span className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-white ${
                        item.band >= 8 ? 'bg-emerald-600' : item.band >= 7 ? 'bg-blue-600' : item.band >= 6 ? 'bg-amber-500' : 'bg-slate-600'
                      }`}>
                        {item.band}
                      </span>
                      <div className="space-y-1 flex-1">
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                          {enList.map((e, idx) => (
                            <li key={idx} className="leading-relaxed">
                              <span>{e}</span>
                              {showVietnamese && (
                                <p className="text-[11px] text-emerald-800 font-medium italic">
                                  ➔ {viList[idx] || viList[0]}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: TASK 2 EXAM STRATEGIES & CHECKLIST */}
          {activeView === 'TASK2_GUIDE' && selectedTaskType === 'TASK_2' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Task Response Strategy */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    1. Chiến thuật Task Response (TR - Band 7.0+)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed">
                    <li><strong>Bắt buộc nêu quan điểm (Position):</strong> Thể hiện lập trường ngay từ câu Thesis Statement ở Mở bài và khẳng định lại ở Kết luận.</li>
                    <li><strong>Phát triển ý sâu (Fully Extended):</strong> Dùng công thức P.E.E.L (Point ➔ Explanation ➔ Example ➔ Link back) thay vì chỉ liệt kê ý rời rạc.</li>
                    <li><strong>Độ dài an toàn:</strong> 260 - 290 từ (Tránh viết dưới 250 từ bị trừ điểm nặng ở Band 5.0).</li>
                  </ul>
                </div>

                {/* 2. Coherence & Cohesion Strategy */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    2. Chiến thuật Coherence & Cohesion (CC - Band 7.0+)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed">
                    <li><strong>Cấu trúc 4 đoạn chuẩn:</strong> 1 Mở bài (40-50 từ) + 2 Thân bài (mỗi đoạn 90-110 từ) + 1 Kết luận (30-40 từ).</li>
                    <li><strong>Câu chủ đề (Topic Sentence):</strong> Luôn bắt đầu mỗi đoạn Thân bài bằng 1 câu nêu rõ nội dung chính của cả đoạn.</li>
                    <li><strong>Liên kết tự nhiên:</strong> Kết hợp từ nối linh hoạt (While, In contrast, Consequently, This phenomenon) thay vì lặp lại máy móc "Firstly, Secondly".</li>
                  </ul>
                </div>

                {/* 3. Lexical Resource Strategy */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    3. Chiến thuật Lexical Resource (LR - Band 7.0+)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed">
                    <li><strong>Academic Collocations:</strong> Dùng các cụm kết hợp từ tự nhiên (e.g., <em>foster academic excellence, career advancement, technological innovation</em>).</li>
                    <li><strong>Paraphrasing:</strong> Không chép lại nguyên văn từ ngữ trên đề bài; thay thế bằng từ đồng nghĩa hoặc đổi dạng từ (Nominalisation).</li>
                    <li><strong>Chính tả:</strong> Kiểm tra kỹ lỗi chính tả các từ đuôi -tion, -ment, -ance, -ence.</li>
                  </ul>
                </div>

                {/* 4. Grammatical Range & Accuracy Strategy */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    4. Chiến thuật Grammatical Range & Accuracy (GRA - Band 7.0+)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed">
                    <li><strong>Đa dạng câu phức:</strong> Sử dụng các cấu trúc: Câu điều kiện loại 2/3, mệnh đề phân từ (V-ing / V-ed), đảo ngữ (Not only... but also...), câu bị động.</li>
                    <li><strong>Tỷ lệ câu không lỗi:</strong> Đảm bảo trên 70% các câu hoàn toàn sạch lỗi ngữ pháp và dấu phẩy nối mệnh đề.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Nguồn: IELTS Official Public Version (British Council, IDP: IELTS Australia, Cambridge English Language Assessment).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
