import React from 'react';
import { BookOpen, X, Award, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ListeningScoreTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListeningScoreTableModal: React.FC<ListeningScoreTableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const listeningScale = [
    { correct: '39 - 40', band: '9.0', desc: 'Expert user: Hoàn toàn làm chủ ngôn ngữ nghe, hiểu trọn vẹn mọi ngữ cảnh phức tạp.' },
    { correct: '37 - 38', band: '8.5', desc: 'Very good user: Khả năng nghe hiểu xuất sắc, chỉ thỉnh thoảng có sai sót nhỏ không đáng kể.' },
    { correct: '35 - 36', band: '8.0', desc: 'Very good user: Hiểu rõ các lập luận phức tạp và chi tiết chuyên sâu trong bài nghe.' },
    { correct: '32 - 34', band: '7.5', desc: 'Good user: Khả năng nắm bắt ý tốt, hiểu hầu hết các bẫy distractors và paraphrasing.' },
    { correct: '30 - 31', band: '7.0', desc: 'Good user: Nắm vững các ý chính, thông tin chi tiết và suy luận thông thường.' },
    { correct: '26 - 29', band: '6.5', desc: 'Competent user: Sử dụng ngôn ngữ tương đối hiệu quả dù có một số lỗi chính tả hoặc bẫy phát âm.' },
    { correct: '23 - 25', band: '6.0', desc: 'Competent user: Hiểu tốt trong các tình huống quen thuộc, gặp khó khăn khi tốc độ nói nhanh.' },
    { correct: '18 - 22', band: '5.5', desc: 'Modest user: Nắm được ý đại khái, dễ bị mất dấu khi bài nghe chuyển ý phức tạp.' },
    { correct: '16 - 17', band: '5.0', desc: 'Modest user: Hiểu được thông tin cơ bản trong các tình huống giao tiếp thường ngày.' },
    { correct: '13 - 15', band: '4.5', desc: 'Limited user: Khả năng nghe cơ bản, dễ gặp trở ngại với từ vựng chuyên ngành.' },
    { correct: '10 - 12', band: '4.0', desc: 'Limited user: Chỉ nắm được các từ khóa cơ bản được nhắc trực tiếp.' },
    { correct: '6 - 9', band: '3.5', desc: 'Extremely limited: Khả năng nghe hiểu hạn chế.' },
    { correct: '4 - 5', band: '3.0', desc: 'Extremely limited: Chỉ hiểu được một số từ đơn lẻ.' },
    { correct: '0 - 3', band: '2.5', desc: 'Intermittent user: Không có khả năng hiểu hội thoại.' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Bảng Quy Đổi Band Điểm IELTS Listening Chuẩn
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official IELTS Listening Band Score Scale (Thang chuẩn 40 câu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Lưu ý quan trọng khi tính điểm Listening:</span>
          </div>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            • Bài thi Listening gồm <strong>4 Sections</strong> với đúng <strong>40 câu hỏi</strong>.
            <br />
            • Mỗi câu trả lời đúng được tính <strong>1 điểm</strong> thô (Raw mark). Không bị trừ điểm khi trả lời sai.
            <br />
            • Điểm tổng được quy đổi theo thang điểm từ <strong>1.0 đến 9.0</strong> (làm tròn đến 0.5).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Số câu đúng (Raw Score)</th>
                <th className="py-3 px-4 text-center">IELTS Band Score</th>
                <th className="py-3 px-4 hidden sm:table-cell">Mô tả năng lực chuẩn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {listeningScale.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'}>
                  <td className="py-2.5 px-4 font-bold font-mono text-slate-900">
                    {row.correct} / 40 câu
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-black text-xs ${
                      Number(row.band) >= 8.0
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : Number(row.band) >= 6.5
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : Number(row.band) >= 5.0
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      Band {row.band}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-600 leading-snug hidden sm:table-cell">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-glossy-emerald text-xs font-bold px-5 py-2 rounded-xl text-white transition cursor-pointer shadow-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
